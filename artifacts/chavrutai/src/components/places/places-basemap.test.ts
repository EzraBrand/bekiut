import { afterEach, describe, expect, it, vi } from "vitest";
import type L from "leaflet";

const state = vi.hoisted(() => ({
  events: {} as Record<string, () => void>,
  setLayoutProperty: vi.fn(),
  addTo: vi.fn(),
  remove: vi.fn(),
  tileUrl: vi.fn(),
}));
vi.mock("leaflet", () => ({
  default: {
    tileLayer: (url: string) => {
      state.tileUrl(url);
      return ({
      addTo: state.addTo,
      remove: state.remove,
      on: (name: string, fn: () => void) => { state.events[name] = fn; },
    }); },
    Control: class { addTo() {} remove() { state.remove(); } },
  },
}));
import { addPlacesBasemap } from "./places-basemap";
import { mapBackgrounds, type MapBackground } from "./map-backgrounds";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.clearAllMocks();
  state.events = {};
});

describe("MapTiler raster basemap", () => {
  it.each(Object.entries(mapBackgrounds))("requests the documented raster style for %s", (id, option) => {
    vi.stubEnv("VITE_MAPTILER_API_KEY", "test-only");
    addPlacesBasemap({} as L.Map, { onProblem: vi.fn(), onReady: vi.fn() }, 12000, id as MapBackground)();
    expect(state.tileUrl).toHaveBeenCalledWith(`https://api.maptiler.com/maps/${option.style}/{z}/{x}/{y}.png?key=test-only`);
  });
  const map = {
    attributionControl: { addAttribution: vi.fn() },
    hasLayer: () => true, removeLayer: vi.fn(),
  } as unknown as L.Map;
  it("loads image tiles and reports failures without requiring WebGL", () => {
    vi.stubEnv("VITE_MAPTILER_API_KEY", "test-only");
    const callbacks = { onProblem: vi.fn(), onReady: vi.fn() };
    const cleanup = addPlacesBasemap(map, callbacks, 12000);
    expect(state.addTo).toHaveBeenCalledOnce();
    state.events.load();
    expect(callbacks.onReady).toHaveBeenCalledOnce();
    state.events.tileerror();
    expect(callbacks.onProblem).toHaveBeenCalledWith("tileerror");
    cleanup();
    expect(state.remove).toHaveBeenCalled();
  });
  it("reports missing configuration without requesting provider resources", () => {
    vi.stubEnv("VITE_MAPTILER_API_KEY", "");
    const callbacks = { onProblem: vi.fn(), onReady: vi.fn() };
    addPlacesBasemap(map, callbacks, 12000)();
    expect(callbacks.onProblem).toHaveBeenCalledWith("tileerror");
    expect(state.addTo).not.toHaveBeenCalled();
  });
  it("times out and clears the timer on cleanup", () => {
    vi.useFakeTimers();
    vi.stubEnv("VITE_MAPTILER_API_KEY", "test-only");
    const callbacks = { onProblem: vi.fn(), onReady: vi.fn() };
    const cleanup = addPlacesBasemap(map, callbacks, 12000);
    vi.advanceTimersByTime(12000);
    expect(callbacks.onProblem).toHaveBeenCalledWith("timeout");
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
  });
});
