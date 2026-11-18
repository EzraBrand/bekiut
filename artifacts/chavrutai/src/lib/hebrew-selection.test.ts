import { Window } from "happy-dom";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { normalizeHebrewSelection, readHebrewSelection, googleSelectionHref, wiktionaryHref } from "./hebrew-selection";
import { dictionaryExcerpt, fetchSelectionDictionary } from "./selection-dictionary";

beforeEach(() => {
  const window = new Window();
  for (const key of ["window", "document", "Node", "NodeFilter", "DOMParser"]) {
    vi.stubGlobal(key, key === "window" ? window : (window as any)[key]);
  }
});
afterEach(() => vi.unstubAllGlobals());

function select(html: string, startSelector = "#a", endSelector = startSelector) {
  document.body.innerHTML = `<main>${html}</main>`;
  const range = document.createRange();
  range.setStart(document.querySelector(startSelector)!.firstChild!, 0);
  const end = document.querySelector(endSelector)!.firstChild!;
  range.setEnd(end, end.textContent!.length);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return readHebrewSelection(selection, document.querySelector("main")!);
}

describe("Hebrew selection contract", () => {
  it("removes marks and surrounding punctuation, not prefixes or internal apostrophes", () => {
    expect(normalizeHebrewSelection("“וּבְרֵאשִׁית!”")).toEqual({ lookup: "ובראשית", words: 1 });
    expect(normalizeHebrewSelection("ד'א")).toEqual({ lookup: "ד'א", words: 1 });
    expect(normalizeHebrewSelection("על־פני")?.words).toBe(2);
    expect(normalizeHebrewSelection("שלום hello")).toBeNull();
    expect(normalizeHebrewSelection(" ")).toBeNull();
  });
  it("uses source metadata and keeps pointed text, including across paragraphs", () => {
    const value = select('<div data-hebrew-lookup-ref="Berakhot 2a"><p id="a">שָׁלוֹם</p><p id="b">עולם</p></div>', "#a", "#b");
    expect(value?.reference).toBe("Berakhot 2a");
    expect(value?.original).toContain("שָׁלוֹם");
  });
  it("rejects English, footnotes, controls, unmarked and cross-daf selections", () => {
    expect(select('<p id="a">שלום</p>')).toBeNull();
    expect(select('<div data-hebrew-lookup-ref="A"><p id="a">hello</p></div>')).toBeNull();
    expect(select('<div data-hebrew-lookup-ref="A"><sup id="a">שלום</sup></div>')).toBeNull();
    expect(select('<div data-hebrew-lookup-ref="A"><button id="a">שלום</button></div>')).toBeNull();
    expect(select('<p data-hebrew-lookup-ref="A" id="a">שלום</p><p>English</p><p data-hebrew-lookup-ref="A" id="b">עולם</p>', "#a", "#b")).toBeNull();
    expect(select('<p data-hebrew-lookup-ref="A" id="a">שלום</p><p data-hebrew-lookup-ref="B" id="b">עולם</p>', "#a", "#b")).toBeNull();
  });
  it("encodes explicit external links with original query spelling", () => {
    const value = { original: "שָׁלוֹם עולם", lookup: "שלום עולם", words: 2, reference: "Berakhot 2a" };
    const url = new URL(googleSelectionHref(value));
    expect(url.searchParams.get("udm")).toBe("50");
    expect(url.searchParams.get("q")).toContain(value.original);
    expect(url.searchParams.get("q")).toContain("Berakhot 2a");
    expect(new URL(googleSelectionHref(value, false)).searchParams.has("udm")).toBe(false);
    expect(new URL(wiktionaryHref("he", "אב", true)).searchParams.get("search")).toBe("אב");
  });
});

describe("on-demand dictionary previews", () => {
  it("produces plain text only and separates block content", () => {
    expect(dictionaryExcerpt('<p>one</p><p>two<img src=x onerror=bad()></p><script>bad()</script>')).toBe("one two");
    expect(dictionaryExcerpt("abcdef", 3)).toBe("abc…");
  });
  it("keeps homographs and stable identity, caches successful lookups", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { headword: "אב", rid: "1", content: { senses: [{ definition: "father" }] } },
      { headword: "אב", rid: "2", content: { senses: [{ definition: "month" }] } },
    ])));
    vi.stubGlobal("fetch", fetch);
    const signal = new AbortController().signal;
    const entries = await fetchSelectionDictionary("jastrow", "אב", signal);
    expect(entries.map(e => e.href)).toEqual(["/jastrow?q=%D7%90%D7%91&rid=1", "/jastrow?q=%D7%90%D7%91&rid=2"]);
    await fetchSelectionDictionary("jastrow", "אב", signal);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("handles Ben-Yehuda paragraphs and rejects failures without caching empties", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response('{"message":"Unavailable"}', { status: 503 }))
      .mockResolvedValueOnce(new Response("[]"))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ headword: "אם", rid: "BY1", content: { definition: ["<p>הגדרה</p>"] } }])));
    vi.stubGlobal("fetch", fetch);
    const signal = new AbortController().signal;
    await expect(fetchSelectionDictionary("ben-yehuda", "אם", signal)).rejects.toThrow("Unavailable");
    expect(await fetchSelectionDictionary("ben-yehuda", "אם", signal)).toEqual([]);
    expect((await fetchSelectionDictionary("ben-yehuda", "אם", signal))[0].href).toContain("&rid=BY1");
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("rejects malformed successful bodies", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('[{"headword":"bad","content":{"senses":[{}]}}]')));
    await expect(fetchSelectionDictionary("bdb", "bad", new AbortController().signal)).rejects.toThrow("unexpected");
  });
});
