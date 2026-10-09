import { describe, expect, it } from "vitest";
import { restoreBdbOccurrences } from "./bdb-occurrences";

describe("BDB search frequency metadata", () => {
  it("restores אָב²'s 1191 count to the first sense without mutating the source", () => {
    const senses = [{ definition: "<strong>n.m. father (</strong>Ph." }, { definition: "1. father" }];
    const result = restoreBdbOccurrences("BDB Dictionary", "1191", senses);
    expect(result[0].definition).toBe("<sub>1191</sub> <strong>n.m. father (</strong>Ph.");
    expect(result[1]).toBe(senses[1]);
    expect(senses[0].definition).not.toContain("<sub>");
  });
  it("does not duplicate retained subscripts or affect other dictionaries", () => {
    const senses = [{ definition: "<sub>1191</sub> father" }];
    expect(restoreBdbOccurrences("BDB Dictionary", "1191", senses)).toBe(senses);
    expect(restoreBdbOccurrences("Jastrow Dictionary", "1191", senses)).toBe(senses);
  });
  it("ignores missing or unsafe values and empty senses", () => {
    const senses = [{ definition: "father" }];
    for (const value of [undefined, null, "", "<script>", {}, "c."]) {
      expect(restoreBdbOccurrences("BDB Dictionary", value, senses)).toBe(senses);
    }
    expect(restoreBdbOccurrences("BDB Dictionary", "1191", [])).toEqual([]);
  });
});
