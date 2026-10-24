import { describe, expect, it } from "vitest";
import { sortJastrowHeadwords } from "./lexicon-headword-sort";
import data from "@/shared/data/lexicon-headwords/jastrow.json";

describe("Jastrow browse ordering", () => {
  it("ignores vowels and sorts numeric, superscript, and Roman suffixes numerically", () => {
    const words = ["לֶקֶט X", "לֶקֶט ²", "לֶקֶט", "לֶקֶט III", "לֶקֶט I", "לֶקֶט 11", "לֶקֶט IV"];
    expect(sortJastrowHeadwords(words)).toEqual([
      "לֶקֶט", "לֶקֶט I", "לֶקֶט ²", "לֶקֶט III", "לֶקֶט IV", "לֶקֶט X", "לֶקֶט 11",
    ]);
    expect(words[0]).toBe("לֶקֶט X");
    expect(sortJastrowHeadwords(["ג", "בָּ", "אֶ"])).toEqual(["אֶ", "בָּ", "ג"]);
  });

  it("keeps the real Leket entries adjacent without losing or changing any headwords", () => {
    const sorted = sortJastrowHeadwords(data.headwords);
    const first = sorted.indexOf("לֶקֶט");
    expect(first).toBeGreaterThan(-1);
    expect(sorted[first + 1]).toBe("לֶקֶט ²");
    expect(sorted).toHaveLength(data.headwords.length);
    expect(new Set(sorted)).toEqual(new Set(data.headwords));
    expect(sortJastrowHeadwords(sorted)).toEqual(sorted);
  });
});
