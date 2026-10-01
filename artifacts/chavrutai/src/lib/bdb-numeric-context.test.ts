import { describe, expect, it } from "vitest";
import bdb from "@/shared/data/lexicon-mappings/bdb.json";
import { expandAbbreviations, convertSupTagsToParens, splitIntoParagraphsBdb } from "./dictionary-format";

const expand = (text: string) =>
  expandAbbreviations(text, bdb.mappings, { bdbNumericContext: true });
const plain = (text: string) => expand(text).replace(/<[^>]+>/g, "");

describe("BDB numeric abbreviation context", () => {
  it.each([
    ["long. 36°", "longitude 36°"],
    ["long.36°", "longitude 36°"],
    ["long. 36.25°", "longitude 36.25°"],
    ["long. 36–37°", "longitude 36–37°"],
    ["long.\u00a036°", "longitude\u00a036°"],
    ["long. c. 36°", "longitude circa 36°"],
    ["long. vowel", "long. vowel"],
    ["long. 36abc", "long. 36abc"],
    ["prolong. 36", "prolong. 36"],
    ["E. of Hermon", "east of Hermon"],
    ["c. 8 m.", "circa 8 miles"],
    ["c.8m.", "circa 8 miles"],
    ["c. 8.5 m.", "circa 8.5 miles"],
    ["c. 8–10 m.", "circa 8–10 miles"],
    ["c. 8-10 m.", "circa 8-10 miles"],
    ["c. 8 — 10.5 m.", "circa 8 — 10.5 miles"],
    ["c.\u00a08\u00a0m.", "circa\u00a08\u00a0miles"],
    ["c. 6,823", "circa 6,823"],
    ["c. 1200", "circa 1200"],
    ["c. preposition", "with preposition"],
    ["m.", "m."],
    ["8 mm.", "8 mm."],
    ["word8 m.", "word8 m."],
    ["1 m. s.", "1st-person masculine singular"],
    ["2 m. pl.", "2nd-person masculine plural"],
    ["3 m. s.", "3rd-person masculine singular"],
    ["3 m. pl.", "3rd-person masculine plural"],
  ])("expands %s safely", (input, expected) => {
    expect(plain(input)).toBe(expected);
  });

  it("preserves section labels, HTML attributes and nonnumeric m.", () => {
    expect(expand('<strong>c.</strong> <a title="c. 8 m.">m.</a>'))
      .toBe('<strong>c.</strong> <a title="c. 8 m.">m.</a>');
  });

  it("preserves existing behavior unless BDB opts in", () => {
    expect(expandAbbreviations("c. 8 m.", bdb.mappings)).toBe("c. 8 m.");
    expect(expandAbbreviations("long. 36°", bdb.mappings)).toBe("long. 36°");
  });

  it("expands the Damascus coordinates without changing markup or attributes", () => {
    const raw = 'long. 36° 15<em>ˊ</em> E., in plain E. of Hermon';
    const html = expand(raw);
    expect(html).toContain('<span class="dict-expanded">longitude</span> 36° 15<em>ˊ</em>');
    expect(html).toContain('<span class="dict-expanded">east of</span> Hermon');
    expect(expand('<a title="long. 36°">long. vowel</a>'))
      .toBe('<a title="long. 36°">long. vowel</a>');
  });

  it("handles the Keilah geography passage after paragraph and citation formatting", () => {
    const raw = 'mod. <em>Kîlā</em>, c. 8 m. NW. from Hebron, GASm<sup>Geogr. 230</sup> Buhl<sup>Geogr. 193</sup>; cl. TelAm.';
    for (const split of [true, false]) {
      const html = expand(splitIntoParagraphsBdb(convertSupTagsToParens(raw), split));
      expect(html).toContain('<span class="dict-expanded">circa</span> 8 <span class="dict-expanded">miles</span>');
      expect(html).toContain("<em>Kîlā</em>");
    }
  });
});