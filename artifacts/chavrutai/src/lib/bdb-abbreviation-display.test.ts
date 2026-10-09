import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/bdb.json";
import fixture from "./fixtures/bdb-kraat-response.json";
import { convertBdbSubFrequencyCounts, convertSupTagsToParens, expandAbbreviations, splitIntoParagraphsBdb } from "./dictionary-format";

const original = (text: string, mappings: Record<string, string> = data.mappings) =>
  expandAbbreviations(text, mappings, { bdbNumericContext: true, bdbDisplay: "original" });
// Recover the expansion output from metadata only for comparison in tests.
const expandTokens = (html: string) => html.replace(
  /<(button|span)\b[^>]*data-bdb-expansion="([^"]*)"[^>]*>[\s\S]*?<\/\1>/g,
  (_all, _tag, encoded) => `<span class="dict-expanded">${decodeURIComponent(encoded)}</span>`,
);
describe("BDB original display shares the existing matcher", () => {
  it("explains preced. as preceding in both modes without matching inside words", () => {
    expect(data.mappings["preced."]).toBe("preceding");
    expect(expandAbbreviations("preced.", data.mappings)).toBe('<span class="dict-expanded">preceding</span>');
    expect(expandTokens(original("preced."))).toBe('<span class="dict-expanded">preceding</span>');
    expect(original("unpreced.")).toBe("unpreced.");
  });
  it("has identical match selection for every sense in the captured real entry response", () => {
    for (const entry of fixture.entries) for (const sense of entry.content.senses) {
      const text = splitIntoParagraphsBdb(convertSupTagsToParens(convertBdbSubFrequencyCounts(sense.definition)), true);
      expect(expandTokens(original(text))).toBe(expandAbbreviations(text, data.mappings, { bdbNumericContext: true }));
    }
  });
  it.each([
    "S.E. of; E. of; Lag (M. i. 255)",
    "αPeḳaḥ אPa. ψ Ψ ψυχή Pa. Aram.",
    '< name of Bab. king > AV <em>Am</em> I; VR<a href="/ref">35:19</a>; IR',
    "c.23 2m. long.42 1 m. s.",
    '<strong>n.</strong>[<strong>m.</strong>] <strong>c.</strong>',
  ])("keeps overlap, Unicode, tag and numeric-context parity: %s", text => {
    expect(expandTokens(original(text))).toBe(expandAbbreviations(text, data.mappings, { bdbNumericContext: true }));
  });
  it("keeps linked matches noninteractive and matches after nested tags normally", () => {
    const text = original('<a href="/bible/genesis/1"><em>Pa.</em> ψ</a> Pa.');
    expect(text.match(/<button/g)).toHaveLength(1);
    expect(text.match(/<span class="bdb-abbreviation"/g)).toHaveLength(2);
    expect(text).toContain('href="/bible/genesis/1"');
  });
  it("escapes metadata and does not rematch generated expansions", () => {
    const result = original('X &c.', { X: '<img src=x onerror="bad()"> & Pa.', "&c.": "etc.", "Pa.": "Pa'el" });
    expect(result).not.toContain("<img");
    expect(result.match(/data-bdb-expansion=/g)).toHaveLength(2);
    expect(expandTokens(result)).toContain('<img src=x onerror="bad()"> & Pa.');
  });
  it("preserves restored אָב² occurrences and existing Psalm(s)/Pa'el meanings", () => {
    const source = '<sub>1191</sub> <strong>n.m. father (</strong>Ph.';
    for (const bdbDisplay of ["original", "inline"] as const) {
      expect(expandAbbreviations(convertBdbSubFrequencyCounts(source), data.mappings, { bdbDisplay }))
        .toContain("(1191 times)");
    }
    expect(expandTokens(original("ψ Ψ Pa."))).toBe(
      '<span class="dict-expanded">Psalm(s)</span> <span class="dict-expanded">Psalm(s)</span> <span class="dict-expanded">Pa\'el (Aramaic)</span>',
    );
  });
});
