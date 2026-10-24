import { expect, it } from "vitest";
import { buildEntryDetail, selectExactEntry, type SourceEntry } from "@workspace/shared-data/jastrow-index-details";
import snapshot from "@/shared/data/lexicon-headwords/jastrow-lamed-details.json";
import index from "@/shared/data/lexicon-headwords/jastrow.json";

it("accounts for every ל headword without merging homographs", () => {
  expect(Object.keys(snapshot.entries).sort()).toEqual(index.headwords.filter(word => word.startsWith("ל")).sort());
  expect(snapshot.entries["לֶקֶט"].rid).toBe("L00679");
  expect(snapshot.entries["לֶקֶט ²"].rid).toBe("L00680");
  expect(snapshot.entries["לֶקֶט"].words).not.toBe(snapshot.entries["לֶקֶט ²"].words);
});

const entry = (definition: string, headword = "לֶקֶט"): SourceEntry => ({
  rid: "L00679", headword, parent_lexicon: "Jastrow Dictionary",
  content: { senses: [{ definition }] },
});
const link = '<a data-ref="Jastrow, אָב 1" href="/Jastrow,_אָב.1">אָב</a>';

it("counts original definitions and nested senses, excluding markup and headwords", () => {
  const row = entry("<i>one two</i> &amp; three");
  row.content.senses!.push({ senses: [{ definition: "four five" }] });
  expect(buildEntryDetail(row).words).toBe(5);
});
it("only labels explicit reference-only definitions", () => {
  expect(buildEntryDetail(entry(`v. ${link}.`)).see).toEqual({ headword: "אָב" });
  expect(buildEntryDetail(entry(`, v. ${link}.`)).see).toEqual({ headword: "אָב" });
  expect(buildEntryDetail(entry(`see ${link}`)).see).toBeDefined();
  expect(buildEntryDetail(entry(`a father; see ${link}.`)).see).toBeUndefined();
  expect(buildEntryDetail(entry(`see ${link}; also a measure.`)).see).toBeUndefined();
  expect(buildEntryDetail(entry(`v. preceding word`)).see).toBeUndefined();
});
it("selects exact homographs rather than combining similarly spelled entries", () => {
  const first = entry("first");
  const second = { ...entry("second", "לֶקֶט ²"), rid: "L00680" };
  expect(selectExactEntry("לֶקֶט", [first, second])?.rid).toBe("L00679");
  expect(selectExactEntry("לֶקֶט ²", [first, second])?.rid).toBe("L00680");
  expect(selectExactEntry("לֶקֶט", [first, { ...first, rid: "other" }])).toBeUndefined();
  expect(selectExactEntry("לֶקֶט", [{ ...first, parent_lexicon: "Ben Yehuda Dictionary" }])).toBeUndefined();
});
