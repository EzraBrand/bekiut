import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import React, { act } from "react";
import type { Root } from "react-dom/client";
import { filterPlaces, places, gazetteerSources } from "@/lib/places";
import type { MapRegion } from "@/components/places/map-regions";

vi.mock("@/components/layout", () => ({
  PageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
  PageSection: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
  SectionHeading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
// Real Leaflet markers and controls, with only the remote WebGL basemap replaced.
vi.mock("@/components/places/places-basemap", () => ({
  addPlacesBasemap: (map: { getContainer: () => HTMLElement }, callbacks: { onProblem: (kind: string) => void }) => {
    const tile = document.createElement("img");
    tile.className = "leaflet-tile";
    tile.addEventListener("error", () => callbacks.onProblem("tileerror"));
    map.getContainer().append(tile);
    return () => tile.remove();
  },
}));

let root: Root;
let host: HTMLElement;
let failSearch = false;
let emptySearch = false;
const searchFetch = vi.fn(async (url: string) => {
  const params = new URL(url, "https://example.com").searchParams;
  return { ok: !failSearch, json: async () => ({
    results: emptySearch ? [] : [{
      ref: params.get("page") === "2" ? "Berakhot 3a:12" : "Berakhot 2b:8",
      text: "A passage mentioning this place.",
      highlight: `A passage mentioning <mark>${params.get("query")}</mark>.`,
      type: "talmud",
    }],
    total: emptySearch ? 0 : 12, totalPages: emptySearch ? 0 : 2,
  }) };
});
beforeAll(async () => {
  // The standalone Vitest config uses classic JSX; the app uses Vite's automatic runtime.
  vi.stubGlobal("React", React);
  vi.stubGlobal("fetch", searchFetch);
  const window = new Window({ url: "https://example.com/places" });
  vi.stubGlobal("location", window.location);
  vi.stubGlobal("history", window.history);
  vi.stubGlobal("addEventListener", window.addEventListener.bind(window));
  vi.stubGlobal("removeEventListener", window.removeEventListener.bind(window));
  for (const key of ["window", "document", "navigator", "HTMLElement", "Element", "SVGElement", "Node", "Event", "MouseEvent", "KeyboardEvent"] as const) {
    vi.stubGlobal(key, key === "window" ? window : window[key]);
  }
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => setTimeout(callback, 0));
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  window.HTMLElement.prototype.scrollIntoView = () => {};
  // happy-dom has no layout; Leaflet fitBounds/scale need a nonzero viewport.
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 640 });
  Object.defineProperty(window.HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 416 });
  host = document.createElement("div");
  document.body.append(host);
  const { createRoot } = await import("react-dom/client");
  const { default: PlacesPage } = await import("./places");
  root = createRoot(host);
  await act(async () => { root.render(<PlacesPage />); });
  const deadline = Date.now() + 15000;
  while (!host.querySelector('[data-testid="map-places"]') && Date.now() < deadline) {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
  }
  expect(host.querySelector('[data-testid="map-places"]')).toBeTruthy();
}, 20000);
afterAll(async () => {
  await act(async () => root?.unmount());
  vi.unstubAllGlobals();
});
const get = (id: string) => host.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const click = async (id: string) => { await act(async () => get(id).click()); };

describe("places page with real Leaflet and no network", () => {
  it("filters map and list by region while preserving background and label controls", async () => {
    expect((get("select-map-background") as HTMLSelectElement).value).toBe("landscape");
    expect(get("select-map-background").querySelectorAll("option")).toHaveLength(5);
    await click("button-region-babylonia");
    expect(get("button-region-babylonia").getAttribute("aria-pressed")).toBe("true");
    expect(get("text-result-count").textContent).toContain(`6 of ${places.length}`);
    expect(get("button-place-rome")).toBeNull();
    for (const region of ["judea", "galilee", "syria", "anatolia"] as MapRegion[]) {
      await click(`button-region-${region}`);
      expect(get(`button-region-${region}`).getAttribute("aria-pressed")).toBe("true");
      expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(filterPlaces("", region).length);
    }
    await click("button-region-israel");
    expect(get("button-region-israel").getAttribute("aria-pressed")).toBe("true");
    await click("toggle-place-labels");
    expect((get("toggle-place-labels") as HTMLInputElement).checked).toBe(false);
    const background = get("select-map-background") as HTMLSelectElement;
    await act(async () => {
      background.value = "modern";
      background.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(background.value).toBe("modern");
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(filterPlaces("", "israel").length);
    await click("button-reset-map");
    expect(get("button-region-all").getAttribute("aria-pressed")).toBe("true");
    await click("toggle-place-labels");
  });
  it("synchronizes list, real marker selection, filters, failures and reset", async () => {
    expect(get("map-places")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(places.length);
    await click("button-place-shiloh");
    expect(get("details-place-shiloh")).toBeTruthy();
    expect(get("link-google-maps").getAttribute("href")).toContain("32.0556,35.2895");
    expect(host.querySelector(".leaflet-marker-icon[title='Shiloh']")?.getAttribute("aria-pressed")).toBe("true");
    await act(async () => host.querySelector<HTMLElement>(".leaflet-marker-icon[title='Jerusalem']")!.click());
    expect(get("details-place-jerusalem")).toBeTruthy();
    expect(get("text-place-certainty").textContent).toBe("Established identification");
    expect(get("text-place-precision").textContent).toBe("Pin: City-level");
    await click("button-region-galilee");
    expect(get("details-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(filterPlaces("", "galilee").length);
    await click("button-reset");
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(places.length);
    // Dispatch tile failure without requesting any real remote tiles.
    const tile = host.querySelector("img.leaflet-tile");
    expect(tile).toBeTruthy();
    await act(async () => tile!.dispatchEvent(new Event("error")));
    expect(get("alert-map-problem").textContent).toContain("failed to load");
    await click("button-place-bethel");
    expect(get("text-place-certainty").textContent).toBe("Disputed identification");
    expect(get("link-google-maps")).toBeTruthy();
    await click("button-retry-map");
    expect(get("alert-map-problem")).toBeNull();
    expect(get("details-place-bethel")).toBeTruthy();
    await click("button-reset-map");
    expect(get("details-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(places.length);
    expect(host.querySelectorAll(".leaflet-marker-icon[aria-pressed='true']")).toHaveLength(0);
  });
  it("searches aliases and Hebrew and provides empty results", async () => {
    const input = get("input-place-search") as HTMLInputElement;
    const setQuery = async (value: string) => {
      await act(async () => {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    };
    await click("button-region-galilee");
    await setQuery("Sepphoris");
    expect(get("text-result-count").textContent).toContain(`1 of ${places.length}`);
    expect(get("button-place-tzippori")).toBeTruthy();
    await click("button-place-tzippori");
    expect(get("button-region-galilee").getAttribute("aria-pressed")).toBe("true");
    expect(get("details-place-tzippori")).toBeTruthy();
    await setQuery("ירושלים");
    expect(get("list-empty")).toBeTruthy();
    expect(get("details-empty")).toBeTruthy();
    await click("button-region-all");
    expect(get("button-place-jerusalem")).toBeTruthy();
    await setQuery("zzzzzzzz");
    expect(get("list-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(0);
    await click("button-reset");
    expect(input.value).toBe("");
    expect(get("text-result-count").textContent).toContain(`${places.length} of ${places.length}`);
  });
  it("places the list after the map and omits generic entry caveats", async () => {
    const map = host.querySelector(".places-map-frame")!;
    const list = get("places-list-section");
    expect(map.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(map.compareDocumentPosition(get("button-region-israel")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(get("details-about-map").hasAttribute("open")).toBe(false);
    expect(get("button-filter-biblical")).toBeNull();
    for (const url of Object.values(gazetteerSources)) {
      const links = [...host.querySelectorAll(`a[href="${url}"]`)];
      expect(links).toHaveLength(1);
      expect(get("details-about-map").contains(links[0])).toBe(true);
    }
    await click("button-place-beitar");
    expect(get("details-place-beitar").textContent).not.toContain("Representative archaeological-site point");
    expect(get("link-coordinate-source")).toBeTruthy();
    expect(get("details-place-beitar").textContent).toContain("Battir");
  });
  it("shows Babylonian centers with their coordinate caveats and historical citations", async () => {
    for (const id of ["sura", "pumbedita", "nehardea", "mehoza"]) {
      await click(`button-place-${id}`);
      expect(get(`details-place-${id}`)).toBeTruthy();
      expect(host.querySelectorAll('[aria-label="Identification references"] a').length).toBeGreaterThan(0);
      expect(get("text-place-certainty").textContent).toBe(id === "mehoza" ? "Established identification" : "Disputed identification");
      expect(get("link-google-maps").getAttribute("href")).toContain("query=");
    }
    await click("button-place-pumbedita");
    expect(get("details-place-pumbedita").textContent).toContain("modern Fallujah's coordinates");
    await click("button-reset-map");
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(places.length);
  });
  it("loads linked passages, paginates, changes spelling, retries, and clears old results", async () => {
    await click("button-place-rome");
    expect(get("link-place-passage").getAttribute("href")).toBe("/talmud/Berakhot/2b#section-8");
    expect(get("place-passages").querySelector("mark")?.textContent).toBe("Rome");
    const next = get("place-passages").querySelectorAll("nav button")[1] as HTMLButtonElement;
    await act(async () => next.click());
    expect(get("link-place-passage").getAttribute("href")).toBe("/talmud/Berakhot/3a#section-12");
    const spelling = host.querySelector('select[aria-label="Passage search spelling"]') as HTMLSelectElement;
    await act(async () => {
      spelling.value = "city of Rome";
      spelling.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(searchFetch.mock.calls.at(-1)?.[0]).toContain("query=city+of+Rome");
    expect(searchFetch.mock.calls.at(-1)?.[0]).toContain("page=1");
    failSearch = true;
    await click("button-place-jerusalem");
    expect(get("place-passages").textContent).toContain("could not be loaded");
    expect(get("link-place-passage")).toBeNull();
    failSearch = false;
    await act(async () => (get("place-passages").querySelector("button") as HTMLButtonElement).click());
    expect(get("place-passages").querySelector("mark")?.textContent).toBe("Jerusalem");
    emptySearch = true;
    await click("button-place-borsippa");
    expect(get("place-passages").textContent).toContain("No passages found");
    expect(get("link-place-passage")).toBeNull();
    emptySearch = false;
    await click("button-reset-map");
  });
});
