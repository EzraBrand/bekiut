import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import { jastrowOrigin, normalizeJastrowLinks, structureJastrowDefinition, restoreJastrowEtCetera, normalizeJastrowAbbreviationMarkup } from "./jastrow-presentation";
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
  it("recognizes fem. across italics in כּוֹבֶד K00184 in both modes", () => {
    const source = '(<i>fem</i>.).';
    const structured = structureJastrowDefinition(source, "K00184", false);
    const normalized = normalizeJastrowAbbreviationMarkup(structured.html, mappings.mappings);
    expect(normalized).toBe('(<i>fem.</i>).');
    const expanded = expandAbbreviations(normalized, mappings.mappings);
    expect(expanded).toBe('(<i><span class="dict-expanded">feminine</span></i>).');
    const original = expandAbbreviations(normalized, mappings.mappings, { display: "original" });
    const doc = new DOMParser().parseFromString(original, "text/html");
    expect(doc.querySelector("i > button")?.textContent).toBe("fem.");
    expect(doc.querySelector("button")?.getAttribute("data-bdb-expansion")).toBe("feminine");
    expect(doc.body.textContent).toBe("(fem.).");
  });
  it("only joins known abbreviations and preserves emphasis attributes", () => {
    expect(normalizeJastrowAbbreviationMarkup('<em class="x">fem</em>.', mappings.mappings))
      .toBe('<em class="x">fem.</em>');
    const source = '<i>ordinary prose</i>. <a href="/fem">fem</a>.';
    expect(normalizeJastrowAbbreviationMarkup(source, mappings.mappings)).toBe(source);
  });
  it("recognizes &c. with an italicized period in כָּבַשׁ K00081", () => {
    const source = '<i>to press vegetables, meat </i>&c<i>.</i>;<i> to preserve, pickle.</i>';
    for (const extraSplits of [false, true]) {
      const structured = structureJastrowDefinition(source, "K00081", extraSplits);
      const restored = restoreJastrowEtCetera(structured.html);
      const expanded = expandAbbreviations(restored, mappings.mappings);
      expect(expanded).toContain('<i>to press vegetables, meat </i><span class="dict-expanded">etc.</span>;<i> to preserve, pickle.</i>');
      const original = expandAbbreviations(restored, mappings.mappings, { display: "original" });
      const doc = new DOMParser().parseFromString(original, "text/html");
      expect(doc.querySelector("button")?.textContent).toBe("&c.");
      expect(doc.querySelector("button")?.getAttribute("data-bdb-expansion")).toBe("etc.");
      expect(doc.body.textContent).toBe(new DOMParser().parseFromString(source, "text/html").body.textContent);
    }
  });
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
    expect(result.outline[0].label).toBe("1. — eye");
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
    expect(extra.html).toContain('first<span class="jastrow-paragraph-break" aria-hidden="true"></span>—second');
    expect(extra.html).not.toContain("<br><br>");
    expect(extra.html).toContain('. <span class="jastrow-paragraph-break" aria-hidden="true"></span><a href="/Berakhot.2a">');
    expect(extra.html).toContain('<a href="/Berakhot.2a">Ber. 2ᵃ—3ᵇ</a>');
    expect(extra.html).not.toContain("<ul");
  });
  it("limits index glosses to italicized definitions while retaining source headings", () => {
    const source = '<b>1)</b> (origin) <i>to speak</i>, <em>to say</em>, explanation ' +
      '<a href="/Berakhot.2a">Ber. 2a</a> <i>example quotation</i>. ' +
      '<strong>2)</strong> plain definition. <strong>Haf.</strong> <em>to tell</em> more prose.';
    for (const extraSplits of [false, true]) {
      const result = structureJastrowDefinition(source, "gloss", extraSplits);
      expect(result.outline.map(item => item.label)).toEqual([
        "1) — to speak to say", "2)", "Haf. — to tell",
      ]);
      const doc = new DOMParser().parseFromString(result.html, "text/html");
      for (const item of result.outline) expect(doc.getElementById(item.id)).not.toBeNull();
      expect(doc.body.textContent).toBe(new DOMParser().parseFromString(source, "text/html").body.textContent);
    }
  });
  it("does not split Greek prefixes, normal hyphens, or citation links", () => {
    const source = 'αὐ-, au-, εὐ; ill-will <a href="/x">x—y</a>';
    expect(structureJastrowDefinition(source, "x", true).html).toBe(source);
  });
  it("keeps phrase breaks compact too when additional splitting is enabled", () => {
    const source = "eye.—עין הרע <em>evil eye</em>.";
    const compact = structureJastrowDefinition(source, "eye", true);
    expect(compact.html).toContain('class="jastrow-paragraph-break"');
    expect(compact.html).not.toContain("<br><br>");
    expect(compact.outline[0].label).toBe("עין הרע");
    expect(structureJastrowDefinition(source, "eye", false).html).toContain("<br><br>");
  });
});
