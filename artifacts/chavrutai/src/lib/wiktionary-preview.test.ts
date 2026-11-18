import { Window } from "happy-dom";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { englishWiktionaryEntries, hebrewWiktionaryEntries, fetchWiktionaryPreview } from "./wiktionary-preview";

beforeEach(() => {
  const window = new Window();
  vi.stubGlobal("DOMParser", window.DOMParser);
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

const english = {
  he: [
    { language: "Hebrew", partOfSpeech: "Noun", definitions: [{ definition: '<a href="/wiki/father">father</a><script>bad()</script>' }] },
    { language: "Hebrew", partOfSpeech: "Proper noun", definitions: [{ definition: "Av" }] },
  ],
  arc: [{ language: "Aramaic", partOfSpeech: "Noun", definitions: [{ definition: "absolute form of אבא" }] }],
  other: [{ language: "Bukhari", partOfSpeech: "Noun", definitions: [{ definition: "water" }] }],
};
const hebrew = { parse: { title: "אב", pageid: 2135, text: `<div class="mw-parser-output">
  <div class="mw-heading mw-heading2"><h2 id="אָב_א">אָב א</h2><span>עריכה</span></div>
  <table><tbody><tr><td>Grammar must not be shown</td></tr></tbody></table>
  <ol><li>הורה ממין זכר<dl><dd><ul><li>Long quotation must not be shown</li></ul></dd></dl></li><li>מייסד</li></ol>
  <div class="mw-heading mw-heading3"><h3>גזרון</h3></div><ol><li>Not a definition</li></ol>
  <h2 id="אָב_ב">אָב ב</h2><ol><li>חודש בלוח העברי</li></ol>
  </div>` } };

it("filters English-edition results to Hebrew and Aramaic and preserves distinct groups", () => {
  const entries = englishWiktionaryEntries(english, "אב");
  expect(entries).toHaveLength(3);
  expect(entries[0].excerpt).toBe("1. father");
  expect(entries[1].label).toBe("Hebrew · Proper noun");
  expect(entries[2].href).toContain("#Aramaic");
  expect(entries.map(e => e.excerpt).join(" ")).not.toMatch(/water|bad\(\)|<a/);
  expect(englishWiktionaryEntries({ other: english.other }, "אב")).toEqual([]);
  expect(() => englishWiktionaryEntries({ status: 500 }, "אב")).toThrow("unexpected");
  expect(() => englishWiktionaryEntries({ he: [{ definitions: "bad" }] }, "אב")).toThrow("unexpected");
});

it("extracts Hebrew homographs without grammar, examples, or subsidiary lists", () => {
  const entries = hebrewWiktionaryEntries(hebrew, "אב");
  expect(entries).toHaveLength(2);
  expect(entries[0].headword).toBe("אָב א");
  expect(entries[0].excerpt).toBe("1. הורה ממין זכר 2. מייסד");
  expect(decodeURIComponent(entries[1].href)).toContain("#אָב_ב");
  expect(entries[1].excerpt).toContain("חודש");
});

it("distinguishes missing pages from unsupported markup and upstream errors", () => {
  expect(hebrewWiktionaryEntries({ error: { code: "missingtitle" } }, "אב")).toEqual([]);
  expect(() => hebrewWiktionaryEntries({ error: { code: "maxlag" } }, "אב")).toThrow("unexpected");
  expect(() => hebrewWiktionaryEntries({ parse: { title: "אב", text: '<div class="mw-parser-output"><p>See another entry</p></div>' } }, "אב")).toThrow("page exists");
});

it("uses CORS APIs without cookies, caches successes, and retains search spelling", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(hebrew)));
  vi.stubGlobal("fetch", fetch);
  const signal = new AbortController().signal;
  await fetchWiktionaryPreview("he", "בדיקה", signal);
  await fetchWiktionaryPreview("he", "בדיקה", signal);
  expect(fetch).toHaveBeenCalledTimes(1);
  const url = new URL(fetch.mock.calls[0][0]);
  expect(url.searchParams.get("page")).toBe("בדיקה");
  expect(url.searchParams.get("origin")).toBe("*");
  expect(fetch.mock.calls[0][1].credentials).toBe("omit");
});

it("does not cache failures or missing pages", async () => {
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response("{}", { status: 503 }))
    .mockResolvedValueOnce(new Response("{}", { status: 404 }))
    .mockResolvedValueOnce(new Response(JSON.stringify(english)));
  vi.stubGlobal("fetch", fetch);
  const signal = new AbortController().signal;
  await expect(fetchWiktionaryPreview("en", "ניסיון", signal)).rejects.toThrow("503");
  expect(await fetchWiktionaryPreview("en", "ניסיון", signal)).toEqual([]);
  expect(await fetchWiktionaryPreview("en", "ניסיון", signal)).toHaveLength(3);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("times out even when headers arrive but the body stalls", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", vi.fn((_url, options) => Promise.resolve({
    ok: true, status: 200,
    json: () => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("Aborted")))),
  })));
  const pending = expect(fetchWiktionaryPreview("en", "איטי", new AbortController().signal)).rejects.toThrow("too long");
  await vi.advanceTimersByTimeAsync(12_001);
  await pending;
});
