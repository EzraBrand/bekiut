import { describe, expect, it } from "vitest";
import { renderSeoEnhancement } from "./seo";
import { getStaticSEO } from "@workspace/shared-data/seo-data";

describe("public Places discovery", () => {
  it("provides indexable metadata with a canonical URL", () => {
    expect(getStaticSEO("/places", "https://example.com")).toMatchObject({
      robots: "index, follow",
      canonical: "https://example.com/places",
      title: "Biblical & Talmudic Places Map | Bekiut",
    });
  });

  it("provides meaningful crawler text and preserves uncertainty", async () => {
    const result = await renderSeoEnhancement("/places");
    expect(result.bodyContent).toContain("Biblical &amp; Talmudic Places Map");
    expect(result.bodyContent).toContain("approximate or disputed");
  });
});
