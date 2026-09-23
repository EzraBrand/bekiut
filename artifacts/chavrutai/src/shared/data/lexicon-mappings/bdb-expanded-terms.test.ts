import { describe, expect, it } from "vitest";

import bdbData from "./bdb.json";
import { bdbExpandedTerms } from "./bdb-expanded-terms";

const mappings = Object.entries(bdbData.mappings).filter(
  ([abbreviation]) => !abbreviation.startsWith("//"),
);

describe("BDB expanded-term metadata", () => {
  it("is keyed by every exact expansion rather than abbreviation", () => {
    const expansions = [...new Set(mappings.map(([, expansion]) => expansion))];

    expect(Object.keys(bdbExpandedTerms).sort()).toEqual(expansions.sort());
    expect(bdbExpandedTerms.Delitzsch).toBeDefined();
    expect(bdbExpandedTerms.Dl).toBeUndefined();
  });

  it("shares metadata and unions verified references for equal expansions", () => {
    expect(bdbExpandedTerms.Ketiv.references).toHaveLength(1);
    expect(bdbExpandedTerms.Ketiv.references[0].title).toBe("Qere and Ketiv");
    expect(bdbExpandedTerms.Peshitta.references).toHaveLength(1);
    expect(bdbExpandedTerms["Brown-Driver-Briggs"].references).toHaveLength(2);
  });

  it("does not attach a specific identity to ambiguous generic Delitzsch", () => {
    expect(bdbExpandedTerms.Delitzsch.category).toBe("Scholar");
    expect(bdbExpandedTerms.Delitzsch.references).toEqual([]);
  });

  it("keeps named works distinct from their authors", () => {
    expect(bdbExpandedTerms.Delitzsch.category).toBe("Scholar");
    expect(
      bdbExpandedTerms["Delitzsch (Wo lag das Paradies?"].category,
    ).toBe("Work / journal");
    expect(bdbExpandedTerms.Pliny.category).toBe("Scholar");
    expect(bdbExpandedTerms["Pliny (Natural History"].category).toBe(
      "Work / journal",
    );
  });
});