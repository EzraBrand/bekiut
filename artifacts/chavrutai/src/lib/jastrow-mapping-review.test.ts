import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "./dictionary-format";

const examples = [
  ["Pl. אבות", "Pl.", "Plural"],
  ["K’doshim", "K’doshim", "Kedoshim"],
  ["bibl. Hebrew", "bibl.", "biblical"],
  ["&c.", "&c.", "etc."],
  ["pl. constr. רָטְנֵי", "constr.", "construct form"],
  ["(sing. אב הנזק)", "sing.", "singular"],
  [", inf. בּוּת", "inf.", "infinitive"],
  ["—Inf. לוֹמַר", "Inf.", "Infinitive"],
  ["(transpos. of אסכנא)", "transpos.", "transposition"],
  ["as an etymol. of אֲמַרְכָּל", "etymol.", "etymology"],
  ["contemp. of R. Ashé", "contemp.", "contemporary"],
  ["(geogr.) place, town", "geogr.", "geographical"],
  ["(Geogr.) air-line", "Geogr.", "geographical"],
  ["Hithpol. הִתְחוֹטֵט", "Hithpol.", "Hithpolel"],
  ["Dict. s. v.", "Dict.", "Dictionary"],
  ["v. H. Dict. s. v. אֶשֶׁד", "H. Dict.", "Hebrew Dictionary"],
  ["Meïl. VI, 1", "Meïl.", "Meilah"],
  ["—Esp. to be in a comatose condition", "Esp.", "especially"],
  ["preced. wds.", "wds.", "words"],
  ["quot. s. v. מַשְׁכּוֹן", "quot.", "quoted"],
  ["v. Lag. Proph. I", "Lag.", "Lagarde"],
  ["Chald. transl. of", "transl.", "translation"],
];

describe("Jastrow corpus-reviewed additions", () => {
  it.each(examples)("explains source context %s in both display modes", (source, abbreviation, expansion) => {
    const original = expandAbbreviations(source, data.mappings, { display: "original" });
    expect(original).toContain(`data-bdb-source="${encodeURIComponent(abbreviation)}"`);
    expect(original).toContain(`data-bdb-expansion="${encodeURIComponent(expansion)}"`);
    expect(expandAbbreviations(source, data.mappings)).toContain(`>${expansion}</span>`);
  });

  it.each([
    ["corr. acc.", "correct accordingly"],
    ["Rabb. D. S.", "Rabbinowicz, 'Dikdukei Sofrim'"],
    ["Sm. Ant.", "Smith, 'Dictionary of Greek and Roman Antiquities'"],
    ["ed. Lag.", "Lagarde edition"],
    ["Ges. H. Dict.", "Gesenius, 'Hebrew Dictionary'"],
    ["Part. pass.", "passive participle"],
    ["Ms. Oxf.", "Manuscript Oxford:"],
  ])("preserves the longer contextual mapping %s", (source, expansion) => {
    expect(expandAbbreviations(source, data.mappings)).toBe(`<span class="dict-expanded">${expansion}</span>`);
  });

  it("does not import misleading or ambiguous BDB meanings", () => {
    const mappings = data.mappings as Record<string, string>;
    for (const key of ["acc.", "Rabb.", "Sm.", "Ant.", "defect.", "a.", "c.", "s."]) {
      expect(mappings[key]).toBeUndefined();
    }
  });
});
