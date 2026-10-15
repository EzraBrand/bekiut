import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import React, { act } from "react";
import type { Root } from "react-dom/client";

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
beforeAll(async () => {
  // The standalone Vitest config uses classic JSX; the app uses Vite's automatic runtime.
  vi.stubGlobal("React", React);
  const window = new Window({ url: "https://example.com/places" });
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
  it("changes regional views, background and labels without losing the list", async () => {
    expect((get("select-map-background") as HTMLSelectElement).value).toBe("landscape");
    expect(get("select-map-background").querySelectorAll("option")).toHaveLength(5);
    await click("button-region-babylonia");
    expect(get("button-region-babylonia").getAttribute("aria-pressed")).toBe("true");
    expect(get("text-result-count").textContent).toContain("54 of 54");
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
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(54);
    await click("button-reset-map");
    expect(get("button-region-all").getAttribute("aria-pressed")).toBe("true");
    await click("toggle-place-labels");
  });
  it("synchronizes list, real marker selection, filters, failures and reset", async () => {
    expect(get("map-places")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(54);
    await click("button-place-shiloh");
    expect(get("details-place-shiloh")).toBeTruthy();
    expect(get("link-google-maps").getAttribute("href")).toContain("32.0556,35.2895");
    expect(host.querySelector(".leaflet-marker-icon[title='Shiloh']")?.getAttribute("aria-pressed")).toBe("true");
    await act(async () => host.querySelector<HTMLElement>(".leaflet-marker-icon[title='Jerusalem']")!.click());
    expect(get("details-place-jerusalem")).toBeTruthy();
    await click("button-filter-biblical");
    expect(get("details-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(6);
    await click("button-reset");
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(54);
    // Dispatch tile failure without requesting any real remote tiles.
    const tile = host.querySelector("img.leaflet-tile");
    expect(tile).toBeTruthy();
    await act(async () => tile!.dispatchEvent(new Event("error")));
    expect(get("alert-map-problem").textContent).toContain("failed to load");
    await click("button-place-bethel");
    expect(get("text-place-certainty").textContent).toBe("Disputed");
    expect(get("link-google-maps")).toBeTruthy();
    await click("button-retry-map");
    expect(get("alert-map-problem")).toBeNull();
    expect(get("details-place-bethel")).toBeTruthy();
    await click("button-reset-map");
    expect(get("details-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(54);
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
    await setQuery("Sepphoris");
    expect(get("text-result-count").textContent).toContain("1 of 54");
    expect(get("button-place-tzippori")).toBeTruthy();
    await setQuery("ירושלים");
    expect(get("button-place-jerusalem")).toBeTruthy();
    await setQuery("zzzzzzzz");
    expect(get("list-empty")).toBeTruthy();
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(0);
    await click("button-reset");
    expect(input.value).toBe("");
    expect(get("text-result-count").textContent).toContain("54 of 54");
  });
  it("places the list after the map and omits generic entry caveats", async () => {
    const map = host.querySelector(".places-map-frame")!;
    const list = get("places-list-section");
    expect(map.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
      expect(get("text-place-certainty").textContent).toBe(id === "mehoza" ? "Approximate" : "Disputed");
      expect(get("link-google-maps").getAttribute("href")).toContain("query=");
    }
    await click("button-place-pumbedita");
    expect(get("details-place-pumbedita").textContent).toContain("modern Fallujah's coordinates");
    await click("button-reset-map");
    expect(host.querySelectorAll(".leaflet-marker-icon")).toHaveLength(54);
  });
});
