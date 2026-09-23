import { describe, expect, it } from "vitest";
import bdbMappings from "@/shared/data/lexicon-mappings/bdb.json";
import { filterAndSortBdbRows, getBdbTableRows, type BdbTableRow } from "./bdb-table";

describe("BDB table display model", () => {
  it("shows only the preferred reference and shares metadata for equal expansions", () => {
    const rows = getBdbTableRows();
    expect(rows.every((row) => row.references.length <= 1)).toBe(true);
    const wellhausen = rows.find((row) => row.abbr === "We")!;
    expect(wellhausen.references[0].source).toBe("Wikipedia");
    expect(rows.find((row) => row.abbr === "Wellh")?.references).toEqual(wellhausen.references);
  });
  it("retains every exact mapping and excludes section markers", () => {
    const original = Object.entries(bdbMappings.mappings).filter(([key]) => !key.startsWith("//"));
    expect(getBdbTableRows().map(({ abbr, expansion }) => [abbr, expansion])).toEqual(original);
  });

  const rows: BdbTableRow[] = [
    { abbr: "Z", expansion: "Zulu", category: "Grammar", references: [] },
    { abbr: "A", expansion: "Alpha", category: "Scholar", references: [
      { title: "A reference title", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Example" },
      { title: "Another title", source: "Wiktionary", url: "https://en.wiktionary.org/wiki/example" },
    ] },
    { abbr: "B", expansion: "Beta", category: "Unclassified", references: [] },
  ];

  it.each([
    [" grammar ", ["Z"]], ["SCHOLAR", ["A"]], ["another title", ["A"]],
    ["reference title", ["A"]], ["zulu", ["Z"]], ["missing", []],
    ["unclassified", ["B"]],
  ])("filters all display fields for %s", (query, expected) => {
    expect(filterAndSortBdbRows(rows, query, "abbr", true).map((r) => r.abbr)).toEqual(expected);
  });

  it("sorts categories in both directions without mutating the input", () => {
    expect(filterAndSortBdbRows(rows, "", "category", true).map((r) => r.abbr)).toEqual(["Z", "A", "B"]);
    expect(filterAndSortBdbRows(rows, "", "category", false).map((r) => r.abbr)).toEqual(["B", "A", "Z"]);
    expect(rows.map((r) => r.abbr)).toEqual(["Z", "A", "B"]);
  });

  it("combines a single-category selection with search and sorting", () => {
    expect(filterAndSortBdbRows(rows, "", "abbr", true, "Grammar").map((row) => row.abbr)).toEqual(["Z"]);
    expect(filterAndSortBdbRows(rows, "reference", "abbr", false, "Scholar").map((row) => row.abbr)).toEqual(["A"]);
    expect(filterAndSortBdbRows(rows, "reference", "abbr", true, "Grammar")).toEqual([]);
    expect(filterAndSortBdbRows(rows, "", "abbr", true, "Unclassified").map((row) => row.abbr)).toEqual(["B"]);
    expect(filterAndSortBdbRows(rows, "", "abbr", true, "all")).toHaveLength(3);
  });

  it("preserves abbreviation and expansion sorting and the complete unfiltered count", () => {
    expect(filterAndSortBdbRows(rows, "  ", "abbr", true).map((r) => r.abbr)).toEqual(["A", "B", "Z"]);
    expect(filterAndSortBdbRows(rows, "", "expansion", false).map((r) => r.abbr)).toEqual(["Z", "B", "A"]);
    expect(filterAndSortBdbRows(getBdbTableRows(), "", "category", true)).toHaveLength(getBdbTableRows().length);
  });
});