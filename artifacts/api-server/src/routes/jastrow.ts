import { Router } from "express";
import { storage } from "../storage";
import { searchRequestSchema } from "@workspace/db";
import { AsyncTtlLruCache } from "../lib/async-ttl-lru-cache";

export function createJastrowRouter() {
  const router = Router();
  type Entries = Awaited<ReturnType<typeof storage.searchEntries>>;
  const entriesCache = new AsyncTtlLruCache<Entries>(128, 2 * 60_000);
  const inFlight = new Map<string, Promise<Entries>>();

  router.get("/api/jastrow/search", async (req, res) => {
    try {
      const result = searchRequestSchema.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({ message: "Invalid search query", errors: result.error.issues }); return;
      }
      const rid = req.query.rid;
      if (rid !== undefined && (typeof rid !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(rid))) {
        res.status(400).json({ message: "Invalid entry identifier" }); return;
      }
      const key = JSON.stringify(result.data);
      let entries = entriesCache.get(key);
      if (!entries) {
        let pending = inFlight.get(key);
        if (!pending) {
          pending = storage.searchEntries(result.data);
          inFlight.set(key, pending);
          // Empty responses may be an upstream failure disguised as no results:
          // neither cache them nor keep failed promises after resolution.
          void pending.then(found => {
            if (found.length) entriesCache.set(key, found);
          }).catch(() => {}).finally(() => {
            if (inFlight.get(key) === pending) inFlight.delete(key);
          });
        }
        entries = await pending;
      }
      res.json(rid ? entries.filter(entry => entry.rid === rid) : entries);
    } catch (error) {
      console.error("Jastrow search error:", error);
      res.status(500).json({ message: "Failed to search dictionary entries" });
    }
  });

  return router;
}
