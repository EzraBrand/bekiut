import { afterEach, describe, expect, it, vi } from "vitest";
import { bdbCitationLabel } from "./bdb-citation-label";
import { selectBdbHomograph } from "./bdb-homograph";
import { SefariaAPI } from "../storage";

afterEach(() => vi.unstubAllGlobals());

describe("BDB citation fidelity", () => {
  it.each([
    ["Je 35:6 f", "Jeremiah 35:6", "Jeremiah 35:6 f"],
    ["2 f", "II Samuel 19:2", "II Samuel 19:2 f"],
    ["18 ff.", "Numbers 1:18", "Numbers 1:18 ff."],
    ["149:9", "Psalms 140:9", "Psalms 149:9"],
    ["1 Ch 5:13", "I Chronicles 5:13", "I Chronicles 5:13"],
    ["ψ 113–118", "Psalms 113-118", "Psalms 113–118"],
    ["ib.", "Genesis 17:5", "ib."],
  ])("preserves printed qualifiers and locators: %s", (source, ref, expected) => {
    expect(bdbCitationLabel(source, ref)).toBe(expected);
  });

  it("preserves qualifiers and a discrepant source label through nested API senses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true, json: async () => [{
        headword: "אָב²", rid: "BDB00019", occurrences: "1191", parent_lexicon: "BDB Dictionary",
        content: { senses: [{ definition: '<a data-ref="Jeremiah 35:6" href="/Jeremiah.35.6">Je 35:6 f</a>',
          senses: [{ definition: '<a href="/Psalms.140.9" data-ref="Psalms 140:9">149:9</a>' }] }] },
      }],
    }));
    const [entry] = await new SefariaAPI().searchBdbEntries({ query: "אב" });
    expect(entry.content.senses[0].definition).toContain("Jeremiah 35:6 f</a>");
    expect(entry.content.senses[0].definition).toContain("<sub>1191</sub>");
    expect(entry.content.senses[1].definition).toContain('href="https://www.sefaria.org/Psalms.140.9"');
    expect(entry.content.senses[1].definition).toContain(">Psalms 149:9</a>");
  });
});

describe("BDB exact homograph lookup", () => {
  const entries = [
    { headword: "הָלַל", rid: "BDB02419" },
    { headword: "הָלַל²", rid: "BDB02421" },
    { headword: "הִלֵּל", rid: "BDB02422" },
  ];
  it("selects only the requested homograph, also for unpointed queries", () => {
    expect(selectBdbHomograph("הלל²", entries)).toEqual([entries[1]]);
    expect(selectBdbHomograph("הָלַל²", entries)).toEqual([entries[1]]);
    expect(selectBdbHomograph("הלל³", entries)).toEqual([]);
    expect(selectBdbHomograph("הלל", entries)).toBe(entries);
  });
  it("normalizes upstream lookup then retains the requested entry and stable ID", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => entries.map(e => ({ ...e, parent_lexicon: "BDB Dictionary", content: { senses: [{ definition: "test" }] } })),
    });
    vi.stubGlobal("fetch", fetchMock);
    const result = await new SefariaAPI().searchBdbEntries({ query: "הָלַל²" });
    expect(decodeURIComponent(fetchMock.mock.calls[0][0])).toMatch(/\/words\/הלל$/);
    expect(result.map(e => e.rid)).toEqual(["BDB02421"]);
  });
});
