import { afterEach, describe, expect, it, vi } from "vitest";
import { hasJastrowHomograph, jastrowLookupForm, selectJastrowHomograph } from "./jastrow-homograph";
import { SefariaAPI } from "../storage";

afterEach(() => vi.unstubAllGlobals());
const entries = [
  { headword: "אָב I", rid: "A00013" },
  { headword: "אָב II", rid: "A00014" },
  { headword: "אָב II ²", rid: "A00015" },
];
describe("Jastrow homographs", () => {
  it.each([
    ["אב II", "A00014"], ["אָב II ²", "A00015"], ["אבII²", "A00015"],
  ])("selects the complete suffix of %s, retaining its stable ID", (query, rid) => {
    expect(hasJastrowHomograph(query)).toBe(true);
    expect(jastrowLookupForm(query)).toBe("אב");
    expect(selectJastrowHomograph(query, entries)).toEqual([entries.find(e => e.rid === rid)]);
  });
  it("never falls back to a different homograph", () => {
    expect(selectJastrowHomograph("אב III", entries)).toEqual([]);
    expect(hasJastrowHomograph("אב")).toBe(false);
  });
  it("deduplicates stable IDs", () => {
    expect(selectJastrowHomograph("אב II", [...entries, entries[1]])).toHaveLength(1);
  });
  it("normalizes upstream lookup and preserves morphology through the real API mapper", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => entries.map(e => ({
      ...e, parent_lexicon: "Jastrow Dictionary",
      content: { morphology: "pr. n. f.", senses: [{ definition: "definition" }] },
    })) });
    vi.stubGlobal("fetch", fetchMock);
    const result = await new SefariaAPI().searchEntries({ query: "אָב II ²" });
    expect(fetchMock.mock.calls[0][0]).toContain(encodeURIComponent("אב"));
    expect(result).toHaveLength(1);
    expect(result[0].rid).toBe("A00015");
    expect(result[0].content).toMatchObject({ morphology: "pr. n. f." });
  });
});
