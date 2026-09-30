import { describe, expect, it } from "vitest";

import bdbData from "./bdb.json";
import { bdbExpandedTerms } from "./bdb-expanded-terms";

const mappings = Object.entries(bdbData.mappings).filter(
  ([abbreviation]) => !abbreviation.startsWith("//"),
);

describe("BDB expanded-term metadata", () => {
  it("classifies recent mapping additions without changing their meanings", () => {
    expect(bdbExpandedTerms["and on"].category).toBe("Reference notation");
    expect(bdbExpandedTerms["and following"]).toBeUndefined();
    expect(bdbExpandedTerms["periphrasis"].category).toBe(bdbExpandedTerms.Periphrasis.category);
    expect(bdbExpandedTerms["Ethpe'el"].category).toBe("Grammar");
    expect(bdbExpandedTerms["Hothpa'al"].category).toBe("Grammar");
    expect(bdbExpandedTerms["noun plural [masculine]"].category).toBe("Grammar");
    expect(bdbExpandedTerms["Phönizier"].category).toBe("Language");
    expect(bdbExpandedTerms.Lamech.category).toBe("Place / person");
    expect(bdbExpandedTerms["Babylonische Religion"].category).toBe("Work / journal");
    expect(bdbExpandedTerms.knows.category).toBe("Vocabulary");
  });
  it("is keyed by every exact expansion rather than abbreviation", () => {
    const expansions = [...new Set(mappings.map(([, expansion]) => expansion))];

    expect(Object.keys(bdbExpandedTerms).sort()).toEqual(expansions.sort());
    expect(bdbExpandedTerms.Delitzsch).toBeDefined();
    expect(bdbExpandedTerms.Dl).toBeUndefined();
  });

  it("maps the exact Ethp. abbreviation to existing Ethpa'al metadata", () => {
    expect(bdbData.mappings["Ethp."]).toBe("Ethpa'al");
    expect(bdbExpandedTerms["Ethpa'al"].category).toBe("Grammar");
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

  it("keeps metadata synchronized after corrections and the Ra removal", () => {
    expect(bdbExpandedTerms["original(ly)"].category).toBe("Vocabulary");
    expect(bdbExpandedTerms["from where"].category).toBe("Vocabulary");
    expect(bdbExpandedTerms["Plautus’ Poenulus"].category).toBe("Work / journal");
    expect(bdbExpandedTerms["masculine & feminine"].category).toBe("Grammar");
    expect(bdbExpandedTerms.Rashi).toBeUndefined();
    expect(bdbExpandedTerms.Grätz.category).toBe("Scholar");
    expect(bdbExpandedTerms.Greek.category).toBe("Language");
  });

  it("categorizes September 27 work, scholar, grammar and numeral expansions", () => {
    expect(bdbExpandedTerms["Lagarde (Onomastica sacra"].category).toBe("Work / journal");
    expect(bdbExpandedTerms["Al-Qāmūs"].category).toBe("Work / journal");
    expect(bdbExpandedTerms["McLean-Dyer"].category).toBe("Scholar");
    expect(bdbExpandedTerms["Hiph'il"].category).toBe("Grammar");
    expect(bdbExpandedTerms["Po'alel"].category).toBe("Grammar");
    expect(bdbExpandedTerms["dialect(al)"].category).toBe("Language");
    expect(bdbExpandedTerms["Old Hebrew"].category).toBe("Language");
    expect(bdbExpandedTerms["54"].category).toBe("Reference notation");
    expect(bdbExpandedTerms["60"].category).toBe("Reference notation");
    expect(bdbExpandedTerms["Inscription"].category).toBe("Text / source");
    expect(bdbExpandedTerms.Hiphil).toBeUndefined();
  });

  it("categorizes the new exact BDB expansions", () => {
    expect(bdbExpandedTerms.cereal.category).toBe("Vocabulary");
    expect(bdbExpandedTerms["compound proper names"].category).toBe("Grammar");
    expect(bdbExpandedTerms["tribal name"].category).toBe("Grammar");
    expect(bdbExpandedTerms["1 Kings"].category).toBe("Text / source");
    expect(bdbExpandedTerms["Sinaitic Inscriptions"].category).toBe("Text / source");
    expect(bdbExpandedTerms["Sinaitische Inschriften"].category).toBe("Text / source");
    expect(bdbExpandedTerms["Studia Biblica"].category).toBe("Work / journal");
    expect(bdbExpandedTerms.Spiegelberg.category).toBe("Scholar");
    expect(bdbExpandedTerms.Jehoshaphat.category).toBe("Place / person");
    expect(bdbExpandedTerms["as if to say"].category).toBe("Reference notation");
  });

  it("keeps shared expansions and removes only metadata no longer used by any key", () => {
    expect(bdbData.mappings["Sam"]).toBe("Samuel");
    expect(bdbData.mappings["Sa"]).toBe("Samuel");
    expect(bdbExpandedTerms.Samuel.category).toBe("Text / source");
    expect(bdbExpandedTerms["van de Velde"].category).toBe("Scholar");
    expect(bdbExpandedTerms["latitude circa"].category).toBe("Reference notation");
    expect(bdbExpandedTerms["Keilinschriften und Geschichtsforschung"].category).toBe("Work / journal");
    expect(bdbExpandedTerms.Kimchi).toBeUndefined();
    expect(bdbExpandedTerms["van de Velde (Memoir"].category).toBe("Work / journal");
    expect(bdbExpandedTerms["Shalmaneser ("].category).toBe("Place / person");
    expect(bdbExpandedTerms["67"].category).toBe("Reference notation");
    expect(bdbExpandedTerms["99"].category).toBe("Reference notation");
  });
});