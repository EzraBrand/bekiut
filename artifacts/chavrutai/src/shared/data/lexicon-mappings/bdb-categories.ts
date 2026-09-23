import bdbData from "./bdb.json";
import { bdbExpandedTerms, type BdbCategory } from "./bdb-expanded-terms";
export type { BdbCategory } from "./bdb-metadata-types";

// Compatibility view only: metadata is maintained by expanded meaning.
export const bdbCategories: Record<string, BdbCategory> = Object.fromEntries(
  Object.entries(bdbData.mappings)
    .filter(([abbr]) => !abbr.startsWith("//"))
    .map(([abbr, expansion]) => [abbr, bdbExpandedTerms[expansion]?.category ?? "Unclassified"]),
);