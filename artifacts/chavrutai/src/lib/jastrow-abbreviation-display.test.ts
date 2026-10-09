import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations, annotateTransliterationsInHtml, convertJastrowInternalLinks, convertSefariaLinksToInternal } from "./dictionary-format";

describe("Jastrow abbreviation display", () => {
  it("retains identical matches and meanings for every mapping in both display modes", () => {
    for (const source of Object.keys(data.mappings)) {
      const original = expandAbbreviations(source, data.mappings, { display: "original" });
      const restored = original.replace(
        /<(button|span)\b[^>]*data-bdb-expansion="([^"]*)"[^>]*>[\s\S]*?<\/\1>/g,
        (_all, _tag, encoded) => `<span class="dict-expanded">${decodeURIComponent(encoded)}</span>`,
      );
      expect(restored).toBe(expandAbbreviations(source, data.mappings, { display: "inline" }));
    }
  });

  it("preserves linked abbreviations without nested buttons through subsequent transforms", () => {
    const html = annotateTransliterationsInHtml(convertSefariaLinksToInternal(convertJastrowInternalLinks(
      expandAbbreviations('<a href="/jastrow?q=אב">Ber.</a> Ber.', data.mappings, { display: "original" }),
    )));
    expect(html).toContain('href="/jastrow?q=אב"');
    expect(html.match(/<button /g)).toHaveLength(1);
    expect(html).toContain('data-bdb-source="Ber."');
    expect(html).not.toMatch(/<a[^>]*>\s*<button/);
  });

  it("leaves the existing default inline for callers that do not opt in", () => {
    expect(expandAbbreviations("Ber.", data.mappings)).toBe(
      expandAbbreviations("Ber.", data.mappings, { display: "inline" }),
    );
  });
});
