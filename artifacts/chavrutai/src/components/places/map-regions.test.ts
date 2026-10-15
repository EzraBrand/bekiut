import { describe, expect, it } from "vitest";
import { mapRegions } from "./map-regions";
import { places } from "@/lib/places";

describe("regional views", () => {
  it.each([
    ["judea", "jerusalem"], ["galilee", "tzippori"],
    ["syria", "damascus"], ["anatolia", "cappadocia"],
  ] as const)("includes %s landmarks in its viewing bounds", (region, id) => {
    const [[south, west], [north, east]] = mapRegions[region].bounds;
    const place = places.find(p => p.id === id)!;
    expect(place.latitude).toBeGreaterThan(south);
    expect(place.latitude).toBeLessThan(north);
    expect(place.longitude).toBeGreaterThan(west);
    expect(place.longitude).toBeLessThan(east);
  });
});
