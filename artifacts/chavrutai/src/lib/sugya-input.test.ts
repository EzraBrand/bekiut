import { expect, it } from "vitest";
import { bibleInputHref, rangeEndPages } from "./sugya-input";

it("opens Sefaria Bible links at their starting verse", () => {
  expect(bibleInputHref("https://www.sefaria.org/Genesis.18.1-22.24?lang=bi")).toBe("/bible/Genesis/18#1");
  expect(bibleInputHref("https://sefaria.org.il/Exodus.12.3-8")).toBe("/bible/Exodus/12#3");
  expect(bibleInputHref("Genesis 18:1-22:24")).toBe("/bible/Genesis/18#1");
  expect(bibleInputHref("Genesis.18")).toBe("/bible/Genesis/18#1");
  expect(bibleInputHref("https://www.sefaria.org/II_Kings.4.1-37")).toBe("/bible/II_Kings/4#1");
  expect(bibleInputHref("https://www.sefaria.org/Berakhot.2a")).toBeNull();
  expect(bibleInputHref("https://example.org/Genesis.18")).toBeNull();
  expect(bibleInputHref("Genesis.99")).toBeNull();
});

it("limits end options to ten inclusive amudim and handles the end of the list", () => {
  const pages = Array.from({ length: 20 }, (_, i) => `${2 + Math.floor(i / 2)}${i % 2 ? "b" : "a"}`);
  expect(rangeEndPages(pages, "3a")).toEqual(["3a", "3b", "4a", "4b", "5a", "5b", "6a", "6b", "7a", "7b"]);
  expect(rangeEndPages(pages, "11a")).toEqual(["11a", "11b"]);
  expect(rangeEndPages(pages, "invalid")).toEqual([]);
});
