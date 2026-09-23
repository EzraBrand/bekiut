import { describe, expect, it } from "vitest";
import bdbMappings from "./bdb.json";
import { bdbReferences } from "./bdb-references";

const allowedHosts = new Set([
  "en.wikipedia.org",
  "www.wikidata.org",
  "en.wiktionary.org",
]);

describe("BDB external references", () => {
  it("uses only exact current abbreviation keys", () => {
    for (const abbreviation of Object.keys(bdbReferences)) {
      expect(Object.hasOwn(bdbMappings.mappings, abbreviation)).toBe(true);
    }
  });

  it("uses only approved HTTPS reference providers", () => {
    for (const references of Object.values(bdbReferences)) {
      for (const reference of references) {
        const url = new URL(reference.url);
        expect(url.protocol).toBe("https:");
        expect(allowedHosts).toContain(url.hostname);
      }
    }
  });

  it("includes vocabulary references and a useful multi-link row", () => {
    expect(bdbReferences.hither[0].source).toBe("Wiktionary");
    expect(bdbReferences.thither[0].source).toBe("Wiktionary");
    expect(bdbReferences.contumely[0].source).toBe("Wiktionary");
    expect(bdbReferences.BDB).toHaveLength(2);
    expect(new Set(bdbReferences.BDB.map(({ url }) => url)).size).toBe(2);
  });
});