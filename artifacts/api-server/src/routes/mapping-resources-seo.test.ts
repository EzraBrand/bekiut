import { describe, expect, it } from "vitest";
import { getMappingResourceStructuredData } from "@workspace/shared-data/mapping-resources";
import { getStaticSEO } from "@workspace/shared-data/seo-data";
import { renderSeoEnhancement } from "./seo";

const BASE_URL = "https://www.bekiut.com";
const PATHS = [
  "/bdb/abbreviations",
  "/jastrow/abbreviations",
  "/talmud/term-replacements",
] as const;

describe("mapping resource SEO", () => {
  it.each(PATHS)("provides indexable, route-specific metadata for %s", (pathname) => {
    const seo = getStaticSEO(pathname, BASE_URL);
    expect(seo).not.toBeNull();
    expect(seo?.robots).toBe("index, follow");
    expect(seo?.canonical).toBe(`${BASE_URL}${pathname}`);
    expect(seo?.title).toMatch(/BDB|Jastrow|Talmud/);
  });

  it.each(PATHS)("describes only the curated mapping as an MIT-licensed Dataset for %s", (pathname) => {
    const data = getMappingResourceStructuredData(pathname, `${BASE_URL}/`);
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Dataset",
      url: `${BASE_URL}${pathname}`,
      license: `${BASE_URL}/mapping-license.txt`,
      isAccessibleForFree: true,
    });
    expect(data?.description).toContain("curated");
    expect(data?.description).toMatch(/not to (source|any source)/i);
    expect(data).not.toHaveProperty("distribution");
  });

  it("returns no Dataset for unrelated pages", () => {
    expect(getMappingResourceStructuredData("/bdb", BASE_URL)).toBeNull();
  });

  it("renders scoped license links and the BDB older-version article note for crawlers", async () => {
    const bdb = await renderSeoEnhancement("/bdb/abbreviations");
    const terms = await renderSeoEnhancement("/talmud/term-replacements");

    expect(bdb.structuredData).toMatchObject({
      "@type": "Dataset",
      license: "http://localhost:5000/mapping-license.txt",
    });
    expect(bdb.bodyContent).toContain("academia.edu/167336159/");
    expect(bdb.bodyContent).toContain("older version");
    expect(bdb.bodyContent).toContain("/mapping-license.txt");
    expect(terms.bodyContent).toContain("source translation or Talmud text");
    expect(terms.bodyContent).toContain("/term-index");
  });
});