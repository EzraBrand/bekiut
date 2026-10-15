import { afterEach, describe, expect, it, vi } from "vitest";
import { places } from "./places";
import { fetchPlacePassages, placePassageLink, placePassageQueries } from "./place-passages";

afterEach(() => vi.unstubAllGlobals());

describe("live place passages", () => {
  it("uses source names, including historical spellings", () => {
    expect(placePassageQueries(places.find(p => p.id === "borsippa")!)).toEqual(["Bursif"]);
    expect(placePassageQueries(places.find(p => p.id === "rome")!)).toEqual(["Rome", "city of Rome"]);
    for (const place of places) expect(placePassageQueries(place).length).toBeGreaterThan(0);
  });
  it("links exact Talmud sections to the website reader", () => {
    expect(placePassageLink({ ref: "Bava Metzia 5a:12-14", text: "", type: "talmud" }))
      .toBe("/talmud/Bava_Metzia/5a#section-12");
    expect(placePassageLink({ ref: "Berakhot 2b", text: "", type: "talmud" }))
      .toBe("/talmud/Berakhot/2b");
    expect(placePassageLink({ ref: "Unknown text", text: "", type: "other" }))
      .toBe("/search?q=Unknown%20text&type=talmud");
  });
  it("uses the Terms search endpoint, Talmud filter, and abort signal", async () => {
    const result = { results: [], total: 0, totalPages: 0 };
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => result });
    vi.stubGlobal("fetch", fetch);
    const controller = new AbortController();
    expect(await fetchPlacePassages("Beit Ḥoron", 2, controller.signal)).toEqual(result);
    const [url, options] = fetch.mock.calls[0];
    const params = new URL(url, "https://example.com").searchParams;
    expect(params.get("query")).toBe("Beit Ḥoron");
    expect(params.get("type")).toBe("talmud");
    expect(params.get("page")).toBe("2");
    expect(options.signal).toBe(controller.signal);
  });
  it("reports upstream failures instead of treating them as empty results", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchPlacePassages("Rome", 1, new AbortController().signal)).rejects.toThrow("unavailable");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ error: "bad response" }) }));
    await expect(fetchPlacePassages("Rome", 1, new AbortController().signal)).rejects.toThrow("Unexpected");
  });
});
