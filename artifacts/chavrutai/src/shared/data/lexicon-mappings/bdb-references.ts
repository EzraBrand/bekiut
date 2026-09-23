import bdbData from "./bdb.json";
import { bdbExpandedTerms, type BdbReference } from "./bdb-expanded-terms";
export type { BdbReference } from "./bdb-metadata-types";

// Compatibility view only: metadata is maintained by expanded meaning.
export const bdbReferences: Record<string, BdbReference[]> = Object.fromEntries(
  Object.entries(bdbData.mappings)
    .filter(([abbr, expansion]) => !abbr.startsWith("//") && bdbExpandedTerms[expansion]?.references.length)
    .map(([abbr, expansion]) => [abbr, bdbExpandedTerms[expansion].references]),
);