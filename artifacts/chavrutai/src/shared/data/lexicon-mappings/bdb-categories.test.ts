import { describe, expect, it } from "vitest";

import bdbData from "./bdb.json";
import { bdbCategories, type BdbCategory } from "./bdb-categories";

const mappingKeys = Object.keys(bdbData.mappings).filter(
  (key) => !key.startsWith("//"),
);

const validCategories = new Set<BdbCategory>([
  "Grammar",
  "Scholar",
  "Language",
  "Text / source",
  "Work / journal",
  "Place / person",
  "Vocabulary",
  "Reference notation",
  "Unclassified",
]);

const contextualExpansionExceptions = new Set([
  // "l. c." is a reference pointer; "thither" is ordinary vocabulary.
  "there",
]);

describe("BDB display categories", () => {
  it("covers every current mapping by its exact abbreviation", () => {
    expect(Object.keys(bdbCategories).sort()).toEqual(mappingKeys.sort());
    expect(Object.keys(bdbCategories)).toHaveLength(1569);
  });

  it("only uses supported display categories", () => {
    expect(
      Object.values(bdbCategories).every((category) =>
        validCategories.has(category),
      ),
    ).toBe(true);
  });

  it("classifies mixed review batches by meaning", () => {
    expect(bdbCategories["interj."]).toBe("Grammar");
    expect(bdbCategories.Jb).toBe("Text / source");
    expect(bdbCategories["SAr."]).toBe("Language");
    expect(bdbCategories["Die Hebr. Condit. sätze"]).toBe("Work / journal");
    expect(bdbCategories.Frankenb).toBe("Scholar");
    expect(bdbCategories.hadst).toBe("Vocabulary");
  });

  it("corrects mixed items in nominal sections and preserves ambiguity", () => {
    expect(bdbCategories.Hamm).toBe("Place / person");
    expect(bdbCategories.Lu).toBe("Text / source");
    expect(bdbCategories.Ge).toBe("Work / journal");
    expect(bdbCategories.Safa).toBe("Language");
    expect(bdbCategories.RSLag).toBe("Work / journal");
    expect(bdbCategories["Sam."]).toBe("Unclassified");
  });

  it("classifies reviewed stems, names, places, and direction words by meaning", () => {
    expect(bdbCategories["Pa."]).toBe("Grammar");
    expect(bdbCategories["Aph."]).toBe("Grammar");
    expect(bdbCategories["inchoat."]).toBe("Grammar");
    expect(bdbCategories["neut."]).toBe("Grammar");
    expect(bdbCategories["intens."]).toBe("Grammar");
    expect(bdbCategories["patr."]).toBe("Grammar");
    expect(bdbCategories["prn."]).toBe("Grammar");
    expect(bdbCategories["Herodot."]).toBe("Scholar");
    expect(bdbCategories["Nas."]).toBe("Language");
    expect(bdbCategories["Oxon."]).toBe("Place / person");
    expect(bdbCategories["Sendsch."]).toBe("Place / person");
    expect(bdbCategories.thither).toBe("Vocabulary");
  });

  it("assigns equal expansions equal categories unless context changes meaning", () => {
    const categoriesByExpansion = new Map<string, Set<BdbCategory>>();

    for (const [abbreviation, expansion] of Object.entries(bdbData.mappings)) {
      if (abbreviation.startsWith("//")) continue;

      const normalizedExpansion = expansion.trim().toLocaleLowerCase();
      const categories =
        categoriesByExpansion.get(normalizedExpansion) ??
        new Set<BdbCategory>();
      categories.add(bdbCategories[abbreviation]);
      categoriesByExpansion.set(normalizedExpansion, categories);
    }

    const inconsistentExpansions = [...categoriesByExpansion]
      .filter(
        ([expansion, categories]) =>
          categories.size > 1 &&
          !contextualExpansionExceptions.has(expansion),
      )
      .map(([expansion]) => expansion);

    expect(inconsistentExpansions).toEqual([]);
  });

  it("distinguishes people from citations to their named works", () => {
    expect(bdbCategories.Dl).toBe("Scholar");
    expect(bdbCategories["Dl (Pa"]).toBe("Work / journal");
    expect(bdbCategories.Hpt).toBe("Scholar");
    expect(bdbCategories["Haupt (Hbr"]).toBe("Work / journal");
    expect(bdbCategories.Plin).toBe("Scholar");
    expect(bdbCategories["Pliny (NH"]).toBe("Work / journal");
    expect(bdbCategories.Hast).toBe("Vocabulary");
  });
});