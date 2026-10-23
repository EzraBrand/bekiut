import { Router } from "express";
import { z } from "zod/v4";
import { textSearchRequestSchema, type SearchResult, type TextSearchResponse } from "@workspace/db";

export function createSearchRouter(): Router {
  const router = Router();

  router.get("/api/search/text", async (req, res) => {
    try {
      const { query, page, pageSize, type, exact } = textSearchRequestSchema.parse(req.query);
      
      const from = (page - 1) * pageSize;
      
      const pathFilters: any[] = [];
      if (type === "all" || type === "talmud") {
        pathFilters.push({ prefix: { "path": "Talmud/Bavli/Seder " } });
      }
      if (type === "all" || type === "bible") {
        pathFilters.push({ prefix: { "path": "Tanakh/Torah" } });
        pathFilters.push({ prefix: { "path": "Tanakh/Prophets" } });
        pathFilters.push({ prefix: { "path": "Tanakh/Writings" } });
      }
      
      const esQuery = {
        size: pageSize,
        from: from,
        collapse: { field: "ref.keyword" },
        aggs: {
          unique_refs: { cardinality: { field: "ref.keyword", precision_threshold: 40000 } }
        },
        query: {
          bool: {
            must: {
              match_phrase: {
                exact: {
                  query: query,
                  slop: exact ? 0 : 3
                }
              }
            },
            filter: [
              {
                bool: {
                  should: pathFilters,
                  minimum_should_match: 1
                }
              },
              {
                bool: {
                  should: [
                    { term: { lang: "en" } },
                    { term: { lang: "he" } }
                  ],
                  minimum_should_match: 1
                }
              }
            ],
            should: [
              { match_phrase: { version: "William Davidson Edition - English" } },
              { match_phrase: { version: "The Koren Jerusalem Bible" } },
              { term: { lang: "he" } }
            ],
            minimum_should_match: 1
          }
        },
        highlight: {
          pre_tags: ["<mark>"],
          post_tags: ["</mark>"],
          fields: {
            exact: {
              fragment_size: 200
            }
          }
        },
        sort: [
          { comp_date: {} },
          { order: {} },
          { "ref.keyword": {} },
          { version_priority: { missing: "_last" } }
        ]
      };

      console.log(`Searching Sefaria for: "${query}" (type: ${type}, exact: ${exact}, page ${page}, size ${pageSize})`);
      
      const response = await fetch("https://www.sefaria.org/api/search/text/_search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(esQuery),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        console.error(`Sefaria search error: ${response.status} ${response.statusText}`);
        res.status(response.status).json({ error: "Search request failed" });
        return;
      }

      const data: any = await response.json();
      
      if (data.timed_out || data._shards?.failed || !Number.isFinite(data.aggregations?.unique_refs?.value)) {
        res.status(502).json({ error: "Search returned incomplete results. Please try again." });
        return;
      }
      const hits = data.hits?.hits || [];
      
      const allResults: SearchResult[] = hits.map((hit: any) => {
        const source = hit._source || {};
        const ref = source.ref || "";
        const path = source.path || "";
        
        let type: "talmud" | "bible" | "other" = "other";
        if (path.includes("Talmud") || path.includes("Bavli")) {
          type = "talmud";
        } else if (path.includes("Torah") || path.includes("Prophets") || path.includes("Writings") || 
                   path.includes("Genesis") || path.includes("Exodus") || path.includes("Leviticus") ||
                   path.includes("Numbers") || path.includes("Deuteronomy") || path.includes("Tanakh")) {
          type = "bible";
        }
        
        const highlight = hit.highlight?.exact?.[0] || "";
        const text = source.exact || "";
        
        return {
          ref,
          hebrewRef: source.heRef || undefined,
          text: text.substring(0, 300),
          highlight: highlight || undefined,
          path: path || undefined,
          type
        };
      });

      // Collapse happens upstream, before from/size. Never discard hits after
      // pagination: doing so skips valid passages on subsequent pages.
      const results = allResults;
      const uniqueTotal = data.aggregations.unique_refs.value;
      const totalPages = Math.ceil(uniqueTotal / pageSize);

      const searchResponse: TextSearchResponse = {
        results,
        total: uniqueTotal,
        totalIsApproximate: true,
        page,
        pageSize,
        totalPages,
        query
      };

      res.json(searchResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid search parameters", details: error.issues });
      } else {
        console.error("Search error:", error);
        res.status(500).json({ error: "Search failed" });
      }
    }
  });

  return router;
}
