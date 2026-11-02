import { afterEach, describe, expect, it, vi } from "vitest";
import { SefariaAPI } from "../storage";
import { cleanDictionaryQuery, DictionaryUnavailableError } from "./dictionary-recovery";
afterEach(() => vi.unstubAllGlobals());
const response = (data: unknown, status = 200) => ({ ok: status === 200, status, json: async () => data });
const entry = (headword: string, lexicon: string) => ({
  headword, parent_lexicon: lexicon, rid: "sample", content: { senses: [{ definition: "test" }] },
});

describe("dictionary recovery", () => {
  it("removes editorial stars for lookup but retains the displayed headword", async () => {
    const fetch = vi.fn().mockResolvedValue(response([entry("*גִּישׁ", "Jastrow Dictionary")]));
    vi.stubGlobal("fetch", fetch);
    const found = await new SefariaAPI().searchEntries({ query: "*גִּישׁ" });
    expect(decodeURIComponent(fetch.mock.calls[0][0])).toContain("/words/גִּישׁ");
    expect(found[0].headword).toBe("*גִּישׁ");
    expect(cleanDictionaryQuery("  †אב II ")).toBe("אב II");
  });
  it("retries an empty pointed BDB lookup without niqqud", async () => {
    const fetch = vi.fn().mockImplementation(async (url: string) =>
      response(decodeURIComponent(url).endsWith("/words/פוך") ? [entry("פּוּךְ", "BDB Dictionary")] : []));
    vi.stubGlobal("fetch", fetch);
    expect(await new SefariaAPI().searchBdbEntries({ query: "פּוּךְ" })).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("retains homograph identity after removing editorial stars", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([
      entry("*אָב I", "Jastrow Dictionary"), entry("*אָב II", "Jastrow Dictionary"),
    ])));
    const result = await new SefariaAPI().searchEntries({ query: "*אָב I" });
    expect(result.map(row => row.headword)).toEqual(["*אָב I"]);
  });
  it("returns genuine empty results", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
    expect(await new SefariaAPI().searchBdbEntries({ query: "zzz" })).toEqual([]);
  });
  it.each([429, 500, 503])("does not disguise upstream HTTP %s as no match", async status => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, status)));
    await expect(new SefariaAPI().searchEntries({ query: "אב" })).rejects.toBeInstanceOf(DictionaryUnavailableError);
  });
  it("does not disguise network failures as no match", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(new SefariaAPI().searchBdbEntries({ query: "אב" })).rejects.toBeInstanceOf(DictionaryUnavailableError);
  });
});
