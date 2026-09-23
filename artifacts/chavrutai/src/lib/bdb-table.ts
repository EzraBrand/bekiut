import bdbMappings from "@/shared/data/lexicon-mappings/bdb.json";
import { bdbExpandedTerms, type BdbCategory, type BdbReference } from "@/shared/data/lexicon-mappings/bdb-expanded-terms";

export type BdbSortKey = "abbr" | "expansion" | "category";
export interface BdbTableRow {
  abbr: string;
  expansion: string;
  category: BdbCategory;
  references: BdbReference[];
}

// Display metadata is deliberately not imported by the reader's expansion pipeline.
export function getBdbTableRows(): BdbTableRow[] {
  return Object.entries(bdbMappings.mappings)
    .filter(([key]) => !key.startsWith("//"))
    .map(([abbr, expansion]) => ({
      abbr,
      expansion,
      category: bdbExpandedTerms[expansion]?.category ?? "Unclassified",
      references: (bdbExpandedTerms[expansion]?.references ?? []).slice(0, 1),
    }));
}

export function filterAndSortBdbRows(
  rows: BdbTableRow[],
  query: string,
  sortKey: BdbSortKey,
  ascending: boolean,
  category: BdbCategory | "all" = "all",
): BdbTableRow[] {
  const q = query.trim().toLowerCase();
  return rows
    .filter((row) => category === "all" || row.category === category)
    .filter((row) => !q || [
      row.abbr, row.expansion, row.category,
      ...row.references.map((reference) => reference.title),
    ].some((value) => value.toLowerCase().includes(q)))
    .sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      return (av < bv ? -1 : av > bv ? 1 : 0) * (ascending ? 1 : -1);
    });
}