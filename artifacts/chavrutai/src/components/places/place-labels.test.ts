import { describe, expect, it } from "vitest";
import type L from "leaflet";
import { updatePlaceLabels } from "./place-labels";
import { places } from "@/lib/places";

describe("place label collision handling", () => {
  it("prioritizes the selected place, hides collisions and reveals labels with space", () => {
    const sample = places.slice(0, 2);
    const elements = sample.map(() => ({ offsetWidth: 100, offsetHeight: 25, style: { visibility: "" } }));
    const markers = new Map(sample.map((p, i) => [p.id, {
      getTooltip: () => ({ getElement: () => elements[i] }),
      getLatLng: () => ({ lat: i, lng: 0 }),
    }])) as unknown as Map<string, L.Marker>;
    let spread = false;
    const map = {
      getSize: () => ({ x: 500, y: 400 }),
      latLngToContainerPoint: (p: { lat: number }) => ({ x: spread ? 130 + p.lat * 220 : 200, y: 200 }),
    } as unknown as L.Map;
    updatePlaceLabels(map, markers, sample, sample[1].id, true);
    expect(elements.map(e => e.style.visibility)).toEqual(["hidden", "visible"]);
    spread = true;
    updatePlaceLabels(map, markers, sample, null, true);
    expect(elements.map(e => e.style.visibility)).toEqual(["visible", "visible"]);
    updatePlaceLabels(map, markers, sample, sample[0].id, false);
    expect(elements.map(e => e.style.visibility)).toEqual(["visible", "hidden"]);
  });
});
