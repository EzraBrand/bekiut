import { describe, it, expect } from "vitest";
import { places, filterPlaces, normalizePlaceSearch } from "./places";
import { isKnownAppPath } from "@workspace/shared-data/route-validation";
import { getPageSEO, getStaticSEO } from "@workspace/shared-data/seo-data";

describe("reviewed places", () => {
  it("contains 34 unique, cited, valid points", () => {
    expect(places).toHaveLength(34);
    expect(new Set(places.map(p => p.id)).size).toBe(34);
    for (const p of places) {
      expect(p.latitude).toBeGreaterThanOrEqual(-90);
      expect(p.latitude).toBeLessThanOrEqual(90);
      expect(p.longitude).toBeGreaterThanOrEqual(-180);
      expect(p.longitude).toBeLessThanOrEqual(180);
      expect(p.sources.length).toBeGreaterThan(0);
      expect(p.identification.length).toBeGreaterThan(30);
      expect(p.coordinateSource.url).toMatch(/^https:\/\/en.wikipedia.org\/wiki\/.+/);
      expect(p.coordinateNote.length).toBeGreaterThan(30);
    }
  });
  it("finds every source spelling and editorial alias", () => {
    for (const p of places) {
      for (const name of [p.name, ...p.aliases, ...p.sources.map(s => s.name)]) {
        expect(filterPlaces(name, "all").map(p => p.id), name).toContain(p.id);
      }
    }
  });
  it("normalizes Hebrew marks, apostrophes, dashes, case and whitespace", () => {
    expect(filterPlaces("  SHILOH ", "all")[0].id).toBe("shiloh");
    expect(filterPlaces("שִׁילֹה", "all")[0].id).toBe("shiloh");
    expect(filterPlaces("Beit She'an", "all")[0].id).toBe("beit-shean");
    expect(normalizePlaceSearch("Beth-El")).toBe(normalizePlaceSearch("Bethel"));
  });
  it("filters by documented gazetteer membership, not inferred attestation", () => {
    expect(filterPlaces("", "biblical")).toHaveLength(6);
    expect(filterPlaces("", "talmudic")).toHaveLength(30);
    expect(filterPlaces("Jerusalem", "biblical")).toEqual([]);
    expect(filterPlaces("Samaria", "talmudic")[0].id).toBe("samaria");
    expect(filterPlaces("nonsense-not-a-place", "all")).toEqual([]);
    expect(filterPlaces("Babylonia", "all")).toEqual([]);
    expect(filterPlaces("Truth", "all")).toEqual([]);
  });
  it("includes Babylonian centers without implying secure ancient coordinates", () => {
    for (const [query, id] of [["Sura", "sura"], ["Pumbeditha", "pumbedita"], ["נהרדעא", "nehardea"], ["Mehoza", "mehoza"], ["Mahoza", "mehoza"]]) {
      const p = filterPlaces(query, "talmudic").find(p => p.id === id)!;
      expect(p).toBeDefined();
      expect(p.identificationSources?.length).toBeGreaterThan(0);
      expect(p.certainty).toBe(id === "mehoza" ? "Approximate" : "Disputed");
      expect(filterPlaces(query, "biblical")).toEqual([]);
    }
    expect(places.find(p => p.id === "pumbedita")!.coordinateNote).toContain("modern Fallujah");
    expect(places.find(p => p.id === "nehardea")!.coordinateNote).toContain("conflicting coordinates");
    expect(places.find(p => p.id === "sura")!.coordinateNote).toContain("discrepancy");
    expect(filterPlaces("Mata Mehasya", "all")).toEqual([]);
  });
  it("keeps direct navigation valid and browser/server metadata identical and noindex", () => {
    expect(isKnownAppPath("/places")).toBe(true);
    expect(isKnownAppPath("/places/")).toBe(true);
    expect(isKnownAppPath("/places/unknown")).toBe(false);
    const browser = getStaticSEO("/places", "https://example.com");
    expect(browser).toEqual(getPageSEO("/places", new URLSearchParams(), "https://example.com"));
    expect(browser?.robots).toBe("noindex, follow");
    expect(browser?.title).toContain("Experimental");
    expect(getPageSEO("/places/", new URLSearchParams(), "https://example.com")).toEqual(browser);
  });
});
