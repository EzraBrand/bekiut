import { beforeEach, describe, expect, it, vi } from "vitest";
import { adaptBenYehudaWords, searchBenYehuda, selectBenYehudaEntries } from "./ben-yehuda";
import { fetchSefaria } from "./sefaria-fetch";
import { benYehudaHeadwordFromRef } from "@workspace/shared-data/ben-yehuda";
import snapshot from "@workspace/shared-data/data/lexicon-headwords/ben-yehuda.json";
import { getPageSEO } from "@workspace/shared-data/seo-data";
import { isKnownAppPath } from "@workspace/shared-data/route-validation";

vi.mock("./sefaria-fetch", () => ({ fetchSefaria: vi.fn() }));
const raw = (headword: string, rid: string, definition = ["<p>הגדרה</p>"]) => ({
  headword, rid, parent_lexicon: "Ben Yehuda Dictionary", content: { definition },
  prev_hw: "א", next_hw: "הֵא I",
});
beforeEach(() => vi.mocked(fetchSefaria).mockReset());

describe("Ben-Yehuda source adapter and exact identity", () => {
  it("keeps all 23 paragraphs, source markup, real IDs and neighbors", () => {
    const paragraphs = Array.from({ length: 23 }, (_, i) => `<p dir="rtl">ה ${i}<sup>1</sup></p>`);
    const entries = adaptBenYehudaWords([raw("ה", "BY-03821", paragraphs), { parent_lexicon: "Jastrow Dictionary" }]);
    expect(entries).toHaveLength(1);
    expect(entries[0].content.definition).toEqual(paragraphs);
    expect(entries[0]).toMatchObject({ rid: "BY-03821", next_hw: "הֵא I" });
    expect(entries[0].content).not.toHaveProperty("senses");
  });
  it("preserves Roman homographs and never silently substitutes another RID", () => {
    const entries = adaptBenYehudaWords([raw("אָב I", "BY-00002"), raw("אָב II", "BY-00003")]);
    expect(selectBenYehudaEntries(entries, "אָב II").map(e => e.headword)).toEqual(["אָב II"]);
    expect(selectBenYehudaEntries(entries, "אב I").map(e => e.headword)).toEqual(["אָב I"]);
    expect(selectBenYehudaEntries(entries, "אָב III")).toEqual([]);
    expect(selectBenYehudaEntries(entries, "אָב I", "BY-99999")).toEqual([]);
  });
  it("rejects malformed definitions rather than reporting no matches", () => {
    expect(() => adaptBenYehudaWords({})).toThrow();
    expect(() => adaptBenYehudaWords([{ ...raw("א", "BY-1"), content: { definition: [3] } }])).toThrow();
  });
  it("distinguishes missing entries from failed requests and does not cache failures", async () => {
    vi.mocked(fetchSefaria).mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(searchBenYehuda("missing-test")).rejects.toThrow();
    vi.mocked(fetchSefaria).mockResolvedValueOnce(new Response("[]"));
    expect(await searchBenYehuda("missing-test")).toEqual([]);
    expect(fetchSefaria).toHaveBeenCalledTimes(2);
  });
  it("retains multiple unpointed matches and resolves an exact pointed headword", async () => {
    vi.mocked(fetchSefaria).mockResolvedValueOnce(new Response(JSON.stringify([
      raw("שָׁלוֹם", "BY-20255"), raw("שִׁלּוּם", "BY-20256"),
    ])));
    expect(await searchBenYehuda("שלום")).toHaveLength(2);
    const entries = adaptBenYehudaWords([raw("שָׁלוֹם", "BY-20255"), raw("שִׁלּוּם", "BY-20256")]);
    expect(selectBenYehudaEntries(entries, "שָׁלוֹם")[0].rid).toBe("BY-20255");
  });
});

describe("snapshot, references and route contracts", () => {
  it("locks the reproducible 22-letter snapshot and representative headwords", () => {
    expect(snapshot.headwords).toHaveLength(21999);
    expect(new Set(snapshot.headwords).size).toBe(21999);
    expect(Object.keys(snapshot._metadata.per_letter_counts)).toHaveLength(22);
    expect(Object.values(snapshot._metadata.per_letter_counts).reduce((a, b) => a + b, 0)).toBe(21999);
    for (const word of ["ה", "אָב I", "אָב II", "הֵא I", "שָׁלוֹם", "תַּתְרָן"]) expect(snapshot.headwords).toContain(word);
    expect(snapshot.headwords.indexOf("אֲבִי")).toBeLessThan(snapshot.headwords.indexOf("אֱגוֹד"));
  });
  it.each(["/Ben_Yehuda_Dictionary,_הֵא_I.1", "https://www.sefaria.org/Ben_Yehuda_Dictionary%2C_%D7%94%D6%B5%D7%90_I.1"])("resolves %s", ref => {
    expect(benYehudaHeadwordFromRef(ref)).toBe("הֵא I");
  });
  it("does not turn Prolegomena or external URLs into headwords", () => {
    expect(benYehudaHeadwordFromRef("/Ben_Yehuda_Dictionary,_Prolegomena.1")).toBeNull();
    expect(benYehudaHeadwordFromRef("https://evil.org/Ben_Yehuda_Dictionary,_ה.1")).toBeNull();
  });
  it("registers all browse routes and preserves exact canonical identifiers", () => {
    for (const letter of Object.keys(snapshot._metadata.per_letter_counts)) expect(isKnownAppPath(`/ben-yehuda/headwords/${encodeURIComponent(letter)}`)).toBe(true);
    expect(isKnownAppPath("/ben-yehuda")).toBe(true);
    expect(isKnownAppPath("/ben-yehuda/headwords")).toBe(true);
    expect(isKnownAppPath("/ben-yehuda/headwords/invalid")).toBe(false);
    const seo = getPageSEO("/ben-yehuda", new URLSearchParams({ q: "אָב II", rid: "BY-00003" }), "https://example.org");
    expect(seo.title).toContain("אָב II");
    expect(seo.canonical).toContain("rid=BY-00003");
  });
});
