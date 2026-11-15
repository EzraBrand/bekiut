import { Router } from "express";
import { searchBenYehuda } from "../lib/ben-yehuda";
import { SearchBenYehudaQueryParams, SearchBenYehudaResponse } from "@workspace/api-zod";

export function createBenYehudaRouter() {
  const router = Router();
  router.get("/api/ben-yehuda/search", async (req, res): Promise<void> => {
    const { query, rid } = req.query;
    const parsed = SearchBenYehudaQueryParams.safeParse(req.query);
    if (!parsed.success || typeof query !== "string" || !query.trim() || query.length > 200 ||
        (rid !== undefined && (typeof rid !== "string" || !/^BY-\d{1,10}$/.test(rid)))) {
      res.status(400).json({ message: "Enter a Hebrew headword and a valid entry identifier." });
      return;
    }
    try {
      res.json(SearchBenYehudaResponse.parse(await searchBenYehuda(query, rid)));
    } catch (error) {
      req.log.warn({ err: error }, "Ben-Yehuda lookup unavailable");
      res.set("Cache-Control", "no-store");
      res.status(503).json({ code: "DICTIONARY_UNAVAILABLE", message: "Sefaria could not supply this entry. Please retry shortly." });
    }
  });
  return router;
}
