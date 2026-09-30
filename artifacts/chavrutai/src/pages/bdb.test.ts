import { describe, expect, it, vi } from "vitest";
import type { DictionaryEntry } from "@/lib/dictionary-format";
import { prepareBdbEntries } from "./bdb";

const entries: DictionaryEntry[] = [
  {
    rid: "BDB02413",
    headword: "הלך",
    parent_lexicon: "BDB",
    content: { senses: [
      { definition: "<strong>Qal</strong> walk α. first" },
      { definition: "<strong>1.</strong> go" },
      { definition: "<strong>2.</strong> proceed" },
      { definition: "<strong>a.</strong> travel" },
    ] },
  },
  {
    headword: "בית",
    parent_lexicon: "BDB",
    content: { senses: [{ definition: "house" }] },
  },
];

describe("BDB entry preparation", () => {
  it("prepares each sense once, preserves ids and first-occurrence section classes", () => {
    const buildOutline = vi.fn((_senses: { definition: string }[], key: string) =>
      key === "BDB02413"
        ? [
          { rawLevel: 0, level: 0, marker: "Qal", label: "walk", index: 0, anchorId: `sense-${key}-0` },
          { rawLevel: 2, level: 2, marker: "1.", label: "go", index: 1, anchorId: `sense-${key}-1` },
          { rawLevel: 2, level: 2, marker: "2.", label: "proceed", index: 2, anchorId: `sense-${key}-2` },
          { rawLevel: 3, level: 3, marker: "a.", label: "travel", index: 3, anchorId: `sense-${key}-3` },
          { rawLevel: 4, level: 4, marker: "α.", label: "first", index: 0, anchorId: `sense-${key}-0-greek-α-0` },
        ]
        : null,
    );
    const classify = vi.fn((marker: string) => {
      if (marker === "Qal") return { level: 0, marker };
      if (/^\d+\.$/.test(marker)) return { level: 2, marker };
      if (marker === "a.") return { level: 3, marker };
      return null;
    });
    const render = vi.fn((definition: string, id: string, first: boolean) =>
      `<span id="${id}-content">${first ? "c. " : ""}${definition}</span>`,
    );

    const prepared = prepareBdbEntries(entries, buildOutline, classify, render);
    expect(buildOutline).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenCalledTimes(5);
    expect(render).toHaveBeenNthCalledWith(1, entries[0].content.senses[0].definition, "sense-BDB02413-0", true);
    expect(render).toHaveBeenNthCalledWith(5, "house", "sense-1-0", true);
    expect(prepared[0].senses.map(sense => sense.id)).toEqual([
      "sense-BDB02413-0", "sense-BDB02413-1", "sense-BDB02413-2", "sense-BDB02413-3",
    ]);
    expect(prepared[0].senses[1].className).toContain("bdb-section-first");
    expect(prepared[0].senses[2].className).not.toContain("bdb-section-first");
    expect(prepared[0].collapsedOutline?.map(item => item.anchorId)).toEqual([
      "sense-BDB02413-0", "sense-BDB02413-1", "sense-BDB02413-2",
    ]);
    expect(prepared[0].hiddenCount).toBe(2);
    expect(prepared[1].entryKey).toBe("1");
    expect(prepared[1].outline).toBeNull();
    expect(prepared[1].senses[0].html).toContain("house");
  });
});