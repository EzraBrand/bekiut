import { describe, it, expect } from "vitest";
import { places, filterPlaces, normalizePlaceSearch } from "./places";
import { isKnownAppPath } from "@workspace/shared-data/route-validation";
import { getPageSEO, getStaticSEO } from "@workspace/shared-data/seo-data";

describe("reviewed places", () => {
  it("contains 65 unique, cited, valid points", () => {
    expect(places).toHaveLength(65);
    expect(new Set(places.map(p => p.id)).size).toBe(65);
    for (const p of places) {
      expect(p.latitude).toBeGreaterThanOrEqual(-90);
      expect(p.latitude).toBeLessThanOrEqual(90);
      expect(p.longitude).toBeGreaterThanOrEqual(-180);
      expect(p.longitude).toBeLessThanOrEqual(180);
      expect(p.sources.length).toBeGreaterThan(0);
      expect(p.identification.length).toBeGreaterThan(30);
      expect(p.coordinateSource.url).toMatch(/^https:\/\/(?:en|he).wikipedia.org\/wiki\/.+/);
      expect(typeof p.coordinateNote).toBe("string");
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
  it("combines geographic membership with name and alias search", () => {
    expect(filterPlaces("", "babylonia")).toHaveLength(6);
    expect(filterPlaces("Jerusalem", "judea")[0].id).toBe("jerusalem");
    expect(filterPlaces("Jerusalem", "galilee")).toEqual([]);
    expect(filterPlaces("Sepphoris", "galilee")[0].id).toBe("tzippori");
    expect(filterPlaces("Shushan", "babylonia")).toEqual([]);
    expect(filterPlaces("Samaria", "israel")[0].id).toBe("samaria");
    expect(filterPlaces("nonsense-not-a-place", "all")).toEqual([]);
    expect(filterPlaces("Babylonia", "all")).toEqual([]);
    expect(filterPlaces("Truth", "all")).toEqual([]);
  });
  it("includes Babylonian centers without implying secure ancient coordinates", () => {
    for (const [query, id] of [["Sura", "sura"], ["Pumbeditha", "pumbedita"], ["נהרדעא", "nehardea"], ["Mehoza", "mehoza"], ["Mahoza", "mehoza"]]) {
      const p = filterPlaces(query, "babylonia").find(p => p.id === id)!;
      expect(p).toBeDefined();
      expect(p.identificationSources?.length).toBeGreaterThan(0);
      expect(p.identificationCertainty).toBe(id === "mehoza" ? "Established" : "Disputed");
      expect(p.coordinatePrecision).toBe(id === "mehoza" ? "City-level" : "Proposed area");
      expect(filterPlaces(query, "israel")).toEqual([]);
    }
    expect(places.find(p => p.id === "pumbedita")!.coordinateNote).toContain("modern Fallujah");
    expect(places.find(p => p.id === "nehardea")!.coordinateNote).toContain("conflicting coordinates");
    expect(places.find(p => p.id === "sura")!.coordinateNote).toContain("farther south");
    expect(filterPlaces("Mata Mehasya", "all")).toEqual([]);
  });
  it("links additions to reviewed Hebrew articles and distinguishes ancient sites", () => {
    const additions = places.filter(p => p.identificationSources?.some(s => s.url.startsWith("https://he.wikipedia.org/wiki/")));
    expect(additions).toHaveLength(31);
    expect(filterPlaces("קפדוקיה", "anatolia")[0].name).toBe("Cappadocia (region)");
    expect(filterPlaces("Ḥadyab")[0].coordinateNote).toContain("Arbela/Erbil");
    expect(filterPlaces("Hamadan")[0].latitude).toBe(34.79833);
    expect(filterPlaces("נציבין")[0].id).toBe("nisibis");
    const yodfat = places.find(p => p.id === "yodfat")!;
    expect(yodfat.latitude).toBe(32.83194444);
    expect(yodfat.coordinateSource.url).toContain("he.wikipedia.org");
    expect(places.find(p => p.id === "ctesiphon")!.identification).toContain("separate from Mehoza");
  });
  it("separates identification from pin precision", () => {
    expect(places.find(p => p.id === "jerusalem")).toMatchObject({
      identificationCertainty: "Established", coordinatePrecision: "City-level",
    });
    expect(places.find(p => p.id === "temple-mount")).toMatchObject({
      identificationCertainty: "Established", coordinatePrecision: "Landmark reference",
    });
    expect(places.find(p => p.id === "cappadocia")).toMatchObject({
      identificationCertainty: "Established", coordinatePrecision: "Regional reference",
    });
    expect(places.find(p => p.id === "sura")).toMatchObject({
      identificationCertainty: "Disputed", coordinatePrecision: "Proposed area",
    });
  });
  it("keeps direct navigation valid and browser/server metadata identical and indexable", () => {
    expect(isKnownAppPath("/places")).toBe(true);
    expect(isKnownAppPath("/places/")).toBe(true);
    expect(isKnownAppPath("/places/unknown")).toBe(false);
    const browser = getStaticSEO("/places", "https://example.com");
    expect(browser).toEqual(getPageSEO("/places", new URLSearchParams(), "https://example.com"));
    expect(browser?.robots).toBe("index, follow");
    expect(browser?.title).toContain("Biblical & Talmudic Places Map");
    expect(getPageSEO("/places/", new URLSearchParams(), "https://example.com")).toEqual(browser);
  });
});
