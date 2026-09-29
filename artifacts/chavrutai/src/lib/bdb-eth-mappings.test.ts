import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import { expandAbbreviations } from "./dictionary-format";

const pairs = [
  ["cometh", "comes"], ["knoweth", "knows"], ["liveth", "lives"],
  ["causeth", "causes"], ["giveth", "gives"], ["doeth", "does"],
  ["covereth", "covers"], ["speaketh", "speaks"], ["contendeth", "contends"],
  ["melteth", "melts"], ["spreadeth", "spreads"], ["walketh", "walks"],
  ["knowest", "know"], ["makest", "make"], ["desirest", "desire"],
  ["sayest", "say"], ["choosest", "choose"], ["givest", "give"],
  ["goest", "go"], ["keepest", "keep"], ["layest", "lay"],
  ["mightest", "might"],
];

describe("approved BDB archaic verbs", () => {
  it.each(pairs)("modernizes %s to %s", (archaic, modern) => {
    expect(expandAbbreviations(`${archaic},`, bdbData.mappings))
      .toBe(`<span class="dict-expanded">${modern}</span>,`);
  });

  it.each(pairs)("does not replace %s inside words or HTML attributes", (archaic) => {
    const input = `<a title="${archaic}">x${archaic} ${archaic}x</a>`;
    expect(expandAbbreviations(input, bdbData.mappings)).toBe(input);
  });

  it("leaves seeth unchanged", () => {
    expect(expandAbbreviations("seeth", bdbData.mappings)).toBe("seeth");
  });
});