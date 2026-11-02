import { afterEach, describe, expect, it, vi } from "vitest";
import { isOptedOut, optInTracking, optOutTracking, trackEvent } from "./analytics";
import { trackPublishingEvent } from "./publishing-analytics";

afterEach(() => vi.unstubAllGlobals());

describe("analytics after retiring PostHog", () => {
  it("preserves both opt-out flags and only sends existing native events", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    };
    const track = vi.fn();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage, umami: { track } });
    trackEvent("legacy_event");
    expect(track).not.toHaveBeenCalled();
    trackPublishingEvent("reader_text_opened", { corpus: "bavli" });
    expect(track).toHaveBeenCalledTimes(1);
    optOutTracking();
    expect(isOptedOut()).toBe(true);
    expect(storage.getItem("umami.disabled")).toBe("1");
    trackPublishingEvent("reader_text_opened");
    expect(track).toHaveBeenCalledTimes(1);
    optInTracking();
    expect(isOptedOut()).toBe(false);
    trackPublishingEvent("reader_text_opened");
    expect(track).toHaveBeenCalledTimes(2);
    storage.setItem("umami.disabled", "1");
    trackPublishingEvent("reader_text_opened");
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("does not interrupt the app when storage or the tracker is unavailable", () => {
    vi.stubGlobal("window", { localStorage: { getItem() { throw new Error("Blocked"); } } });
    expect(() => trackPublishingEvent("reader_text_opened")).not.toThrow();
    vi.stubGlobal("window", { localStorage: { getItem: () => null } });
    expect(() => trackPublishingEvent("reader_text_opened")).not.toThrow();
  });
});
