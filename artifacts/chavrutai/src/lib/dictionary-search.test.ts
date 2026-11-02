import { describe, it, expect } from "vitest";
import { classifyDictionaryResponse, dictionaryQueryHref, otherDictionary } from "./dictionary-search";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("classifyDictionaryResponse", () => {
  it("returns valid entries on success", async () => {
    const r = await classifyDictionaryResponse(json([{ headword: "א", content: { senses: [] } }, { bad: 1 }]));
    expect(r.kind).toBe("ok");
    if (r.kind === "ok") expect(r.entries).toHaveLength(1);
  });
  it("treats an empty array as a genuine no-match", async () => {
    const r = await classifyDictionaryResponse(json([]));
    expect(r).toEqual({ kind: "ok", entries: [] });
  });
  it("maps 503 DICTIONARY_UNAVAILABLE to unavailable", async () => {
    const r = await classifyDictionaryResponse(json({ message: "Sefaria down", code: "DICTIONARY_UNAVAILABLE" }, 503));
    expect(r).toEqual({ kind: "unavailable", message: "Sefaria down" });
  });
  it("maps other non-2xx to a recoverable error, even without JSON", async () => {
    const r = await classifyDictionaryResponse(new Response("oops", { status: 500 }));
    expect(r.kind).toBe("error");
    if (r.kind === "error") expect(r.message).toContain("500");
  });
});

describe("cross-dictionary links", () => {
  it("encodes the query", () => {
    expect(dictionaryQueryHref("bdb", " שָׁלוֹם ")).toBe(`/bdb?q=${encodeURIComponent("שָׁלוֹם")}`);
    expect(otherDictionary("bdb")).toBe("jastrow");
  });
});
