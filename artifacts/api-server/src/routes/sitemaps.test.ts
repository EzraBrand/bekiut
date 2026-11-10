import express from "express";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SITEMAP_CHILD_PATHS } from "@workspace/shared-data/sitemap-routes";
import { registerSitemapRoutes } from "./sitemaps";
import { ALL_BIBLE_BOOKS } from "@workspace/shared-data/bible-books";
import { getPageSEO } from "@workspace/shared-data/seo-data";
import { CANONICAL_BASE_URL } from "@workspace/shared-data/brand";

let baseUrl = "";
let server: ReturnType<ReturnType<typeof express>["listen"]>;

beforeAll(async () => {
  const app = express();
  registerSitemapRoutes(app);
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("production-style sitemap routing", () => {
  it("uses the canonical production origin for every sitemap location", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      for (const path of ["/sitemap.xml", ...SITEMAP_CHILD_PATHS]) {
        const xml = await (await fetch(`${baseUrl}/api${path}`)).text();
        const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        expect(locations.length, path).toBeGreaterThan(0);
        expect(locations.every(url => url.startsWith(`${CANONICAL_BASE_URL}/`)), path).toBe(true);
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses exactly the reader's canonical Bible books and chapters", async () => {
    const xml = await (await fetch(`${baseUrl}/sitemap-bible.xml`)).text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const expected = [`${baseUrl}/bible`, ...ALL_BIBLE_BOOKS.flatMap(book => [
      `${baseUrl}/bible/${book.slug}`,
      ...Array.from({ length: book.chapters }, (_, i) => `${baseUrl}/bible/${book.slug}/${i + 1}`),
    ])];
    expect(urls).toEqual(expected);
    for (const url of urls) {
      expect(getPageSEO(new URL(url).pathname, new URLSearchParams(), baseUrl).canonical).toBe(url);
    }
  });

  it("does not advertise request-time modification dates", async () => {
    for (const path of ["/sitemap.xml", ...SITEMAP_CHILD_PATHS]) {
      const xml = await (await fetch(`${baseUrl}${path}`)).text();
      expect(xml, path).not.toContain("<lastmod>");
    }
  });

  it("includes the public Places page at both sitemap endpoints", async () => {
    for (const prefix of ["", "/api"]) {
      const response = await fetch(`${baseUrl}${prefix}/sitemap-main.xml`);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain("/places</loc>");
    }
  });
  it("serves every child advertised by the sitemap index at root and /api", async () => {
    const indexResponse = await fetch(`${baseUrl}/sitemap.xml`);
    expect(indexResponse.status).toBe(200);
    expect(indexResponse.headers.get("content-type")).toContain("application/xml");

    const indexXml = await indexResponse.text();
    const advertisedPaths = [...indexXml.matchAll(/<loc>[^<]+(\/sitemap[^<]+\.xml)<\/loc>/g)]
      .map((match) => match[1]);

    expect(advertisedPaths).toEqual([...SITEMAP_CHILD_PATHS]);

    for (const path of advertisedPaths) {
      for (const prefix of ["", "/api"]) {
        const response = await fetch(`${baseUrl}${prefix}${path}`);
        expect(response.status, `${prefix}${path}`).toBe(200);
        expect(response.headers.get("content-type"), `${prefix}${path}`).toContain(
          "application/xml",
        );
        expect(await response.text(), `${prefix}${path}`).toMatch(/^<\?xml/);
      }
    }
  });

  it("includes all three mapping reference pages", async () => {
    const [mainResponse, dictionariesResponse] = await Promise.all([
      fetch(`${baseUrl}/sitemap-main.xml`),
      fetch(`${baseUrl}/sitemap-dictionaries.xml`),
    ]);
    const mainXml = await mainResponse.text();
    const dictionariesXml = await dictionariesResponse.text();

    expect(mainXml).toContain("<loc>http://127.0.0.1");
    expect(mainXml).toContain("/talmud/term-replacements</loc>");
    expect(dictionariesXml).toContain("/jastrow/abbreviations</loc>");
    expect(dictionariesXml).toContain("/bdb/abbreviations</loc>");
  });
});