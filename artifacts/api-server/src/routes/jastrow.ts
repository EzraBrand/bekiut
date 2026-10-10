import { Router } from "express";
import { storage } from "../storage";
import { searchRequestSchema } from "@workspace/db";

export function createJastrowRouter() {
  const router = Router();

  router.get("/api/jastrow/search", async (req, res) => {
    try {
      const result = searchRequestSchema.safeParse(req.query);
      if (!result.success) {
        res.status(400).json({ message: "Invalid search query", errors: result.error.issues }); return;
      }
      const entries = await storage.searchEntries(result.data);
      const rid = req.query.rid;
      if (rid !== undefined && (typeof rid !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(rid))) {
        res.status(400).json({ message: "Invalid entry identifier" }); return;
      }
      res.json(rid ? entries.filter(entry => entry.rid === rid) : entries);
    } catch (error) {
      console.error("Jastrow search error:", error);
      res.status(500).json({ message: "Failed to search dictionary entries" });
    }
  });

  return router;
}
