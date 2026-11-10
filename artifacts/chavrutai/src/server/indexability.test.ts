import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveLegacyRedirect } from "@workspace/shared-data/legacy-redirects";
import { getPageSEO } from "@workspace/shared-data/seo-data";

describe("public indexability policies", () => {
  it("has one crawler group that allows redirects and blocks only the API", () => {
    const robots = readFileSync(new URL("../../public/robots.txt", import.meta.url), "utf8");
    expect(robots.match(/^User-agent:.*$/gm)).toEqual(["User-agent: *"]);
    expect(robots.match(/^Disallow:.*$/gm)).toEqual(["Disallow: /api/"]);
    expect(robots).toContain("Allow: /");
  });

  it.each([
    ["/bible/genesis/1", "/bible/Genesis/1"],
    ["/bible/i-samuel", "/bible/I_Samuel"],
    ["/bible/song-of-songs/8", "/bible/Song_of_Songs/8"],
    ["/bible/Genesis/01", "/bible/Genesis/1"],
  ])("redirects %s to %s and agrees with metadata", (source, target) => {
    expect(resolveLegacyRedirect(source)).toBe(target);
    expect(getPageSEO(source.replace("/01", "/1"), new URLSearchParams(), "https://example.com").canonical)
      .toBe(`https://example.com${target}`);
  });

  it.each(["/bible/Genesis/1", "/bible/unknown/1", "/bible/genesis/51", "/bible/genesis/0"])(
    "does not redirect canonical or invalid URL %s", path => {
      expect(resolveLegacyRedirect(path)).toBeNull();
    },
  );

  it("keeps Places indexable with and without a trailing slash", () => {
    for (const path of ["/places", "/places/"]) {
      expect(getPageSEO(path, new URLSearchParams(), "https://example.com")).toMatchObject({
        robots: "index, follow", canonical: "https://example.com/places",
      });
    }
  });
});
