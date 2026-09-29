import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import { convertSupTagsToParens, expandAbbreviations } from "./dictionary-format";

const pairs = [
  ["dist.", "distinct"],
  ["Phön.", "Phönizier"],
  ["Lam.", "Lamech"],
  ["Sab Denkm", "Sabäische Denkmäler"],
  ["Prol. Assyr. Gr.", "Prolegomena to Assyrian Grammar"],
  ["PEQ", "Palestine Exploration Quarterly"],
  ["h. priest", "High Priest"],
  ["TelAm", "Tell el-Amarna"],
  ["ÄZ", "Ägyptische Zeitschrift"],
  ["vocaliz.", "vocalization"],
  ["conseq.", "consequence"],
  ["periph.", "periphrasis"],
];

describe("BDB citation and vocabulary additions", () => {
  it.each(pairs)("expands %s as %s with the full mapping set", (key, value) => {
    expect(expandAbbreviations(key, bdbData.mappings))
      .toBe(`<span class="dict-expanded">${value}</span>`);
  });

  it("keeps a longer work title intact before expanding its components", () => {
    expect(expandAbbreviations(convertSupTagsToParens("Prol. Assyr. Gr.<sup>12</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Prolegomena to Assyrian Grammar</span> (12)');
  });

  it("does not replace text in attributes or inside longer words", () => {
    const text = '<a title="PEQ">xPEQ PEQx</a>';
    expect(expandAbbreviations(text, bdbData.mappings)).toBe(text);
  });
});