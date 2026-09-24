import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getPageSEO } from "@workspace/shared-data/seo-data";

describe("homepage sharing metadata", () => {
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  const seo = getPageSEO("/", new URLSearchParams(), "https://bekiut.com");

  it("keeps static social descriptions aligned with server metadata", () => {
    expect(seo.description).toContain("classical Jewish texts");
    for (const text of ["Talmud", "Tanakh", "Mishnah"]) {
      expect(seo.description).toContain(text);
    }
    expect(html).toContain(`<meta name="description" content="${seo.description}"`);
    expect(html).toContain(`<meta property="og:description" content="${seo.ogDescription}"`);
    expect(html).toContain(`<meta name="twitter:description" content="${seo.ogDescription}"`);
    expect(html).toContain(`<meta property="og:title" content="${seo.ogTitle}"`);
  });

  it("uses the current full-size favicon for sharing", () => {
    expect(html).toContain('<meta property="og:image" content="https://bekiut.com/favicon-512x512.png"');
    expect(html).toContain('<meta name="twitter:image" content="https://bekiut.com/favicon-512x512.png"');
    expect(html).not.toContain("/og-image.png");
  });
});