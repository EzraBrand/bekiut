import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSefaria, SefariaTimeoutError } from "./sefaria-fetch";

afterEach(() => vi.unstubAllGlobals());

describe("Sefaria request deadlines", () => {
  it("preserves JSON and HTTP status for callers", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"error":"unavailable"}', { status: 503 })));
    const result = await fetchSefaria("https://www.sefaria.org/api/test");
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: "unavailable" });
  });

  it("cancels when headers never arrive", async () => {
    vi.stubGlobal("fetch", vi.fn((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => reject(signal.reason));
    })));
    await expect(fetchSefaria("https://www.sefaria.org/api/test", {}, 10)).rejects.toBeInstanceOf(SefariaTimeoutError);
  });

  it("keeps the deadline active while the response body stalls", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url, { signal }) => new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener("abort", () => controller.error(signal.reason));
      },
    }))));
    await expect(fetchSefaria("https://www.sefaria.org/api/test", {}, 10)).rejects.toBeInstanceOf(SefariaTimeoutError);
  });

  it("preserves other network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failed")));
    await expect(fetchSefaria("https://www.sefaria.org/api/test")).rejects.toThrow("network failed");
  });
});
