import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import { jastrowOrigin, normalizeJastrowLinks, structureJastrowDefinition, restoreJastrowEtCetera } from "./jastrow-presentation";
import { expandAbbreviations } from "./dictionary-format";
import mappings from "@/shared/data/lexicon-mappings/jastrow.json";
import type { DictionaryEntry } from "./dictionary-format";

beforeAll(() => {
  const window = new Window();
  vi.stubGlobal("DOMParser", window.DOMParser);
  vi.stubGlobal("NodeFilter", window.NodeFilter);
  vi.stubGlobal("Element", window.Element);
});
afterAll(() => vi.unstubAllGlobals());

describe("Jastrow source fidelity", () => {
  it("explains &c. after HTML serialization in both modes", () => {
    const structured = structureJastrowDefinition("words &c.", "etc-test", false);
    expect(structured.html).toContain("&amp;c.");
    const restored = restoreJastrowEtCetera(structured.html);
    expect(expandAbbreviations(restored, mappings.mappings)).toContain(">etc.</span>");
    const original = expandAbbreviations(restored, mappings.mappings, { display: "original" });
    expect(original).toContain('data-bdb-expansion="etc."');
    expect(new DOMParser().parseFromString(original, "text/html").querySelector("button")?.textContent).toBe("&c.");
    expect(original).not.toContain("&amp;amp;");
  });
  it("unwraps duplicate nested links without losing words or destinations", () => {
    const html = '<a href="/Jastrow,_שלם.1"> <a dir="rtl" href="/Jastrow,_שלם.1">שָׁלַם</a>)</a>';
    const result = normalizeJastrowLinks(html);
    expect(result.match(/<a /g)).toHaveLength(1);
    expect(result).toContain('href="/Jastrow,_שלם.1"');
    expect(result).toContain("שָׁלַם</a>)");
  });
  it("joins the Sabbath origin continuation, preserving morphology and definition", () => {
    const entry: DictionaryEntry = {
      headword: "שַׁבָּת", parent_lexicon: "Jastrow Dictionary", language_code: "(b. h.;",
      content: { morphology: "f.", senses: [{ definition: " preced.) <em>Sabbath</em>." }] },
    };
    expect(jastrowOrigin(entry)).toEqual({ origin: "(b. h.; preced.)", definitions: ["<em>Sabbath</em>."] });
    expect(entry.content.morphology).toBe("f.");
    expect(entry.content.senses[0].definition).toContain("preced.)");
  });
  it("retains unclear origin fragments instead of swallowing prose", () => {
    expect(jastrowOrigin({
      headword: "x", parent_lexicon: "Jastrow Dictionary", language_code: "(unknown;",
      content: { senses: [{ definition: "a real definition) with text" }] },
    }).definitions[0]).toBe("a real definition) with text");
  });
  it("builds stable sense and phrase anchors without changing source text", () => {
    const source = "<strong>1.</strong> <em>eye</em>, sight.—עין הרע <em>evil eye</em>.";
    const result = structureJastrowDefinition(source, "P00601-s0", false);
    expect(result.outline).toHaveLength(2);
    expect(result.outline[1]).toMatchObject({ id: "P00601-s0-1", label: "עין הרע", level: 1 });
    const parse = (html: string) => new DOMParser().parseFromString(html, "text/html").body.textContent;
    expect(parse(result.html)).toBe(parse(source));
    expect(result.html).toContain("<br><br>");
  });
  it("makes legacy-style extra splits optional without breaking anchors or punctuation", () => {
    const source = '<em>first—second</em>. <a href="/Berakhot.2a">Ber. 2ᵃ—3ᵇ</a>';
    const normal = structureJastrowDefinition(source, "x", false);
    const extra = structureJastrowDefinition(source, "x", true);
    expect(normal.html).not.toContain("<br>");
    expect(extra.html).toContain("first<br>—second");
    expect(extra.html).not.toContain("<br><br>");
    expect(extra.html).toContain('. <br><a href="/Berakhot.2a">');
    expect(extra.html).toContain('<a href="/Berakhot.2a">Ber. 2ᵃ—3ᵇ</a>');
    expect(extra.html).not.toContain("<ul");
  });
  it("does not split Greek prefixes, normal hyphens, or citation links", () => {
    const source = 'αὐ-, au-, εὐ; ill-will <a href="/x">x—y</a>';
    expect(structureJastrowDefinition(source, "x", true).html).toBe(source);
  });
  it("keeps phrase breaks compact too when additional splitting is enabled", () => {
    const source = "eye.—עין הרע <em>evil eye</em>.";
    const compact = structureJastrowDefinition(source, "eye", true);
    expect(compact.html).toContain("<br>");
    expect(compact.html).not.toContain("<br><br>");
    expect(compact.outline[0].label).toBe("עין הרע");
    expect(structureJastrowDefinition(source, "eye", false).html).toContain("<br><br>");
  });
});
