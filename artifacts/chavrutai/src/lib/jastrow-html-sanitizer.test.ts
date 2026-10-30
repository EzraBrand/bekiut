import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import mappings from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations, convertJastrowInternalLinks, annotateTransliterationsInHtml } from "./dictionary-format";
import { normalizeJastrowAbbreviationMarkup, structureJastrowDefinition } from "./jastrow-presentation";
import { sanitizeJastrowHtml } from "./jastrow-html-sanitizer";

beforeAll(() => {
  const window = new Window();
  vi.stubGlobal("window", window);
  vi.stubGlobal("document", window.document);
  vi.stubGlobal("DOMParser", window.DOMParser);
  vi.stubGlobal("NodeFilter", window.NodeFilter);
  vi.stubGlobal("Element", window.Element);
});
afterAll(() => vi.unstubAllGlobals());

describe("Jastrow final-HTML sanitizer", () => {
  it("removes dangerous markup, attributes, and URL schemes", () => {
    const html = `<img src=x onerror=alert(1)><svg onload=alert(2)></svg>
      <a href="javascript:alert(1)" onclick="alert(3)">bad</a>
      <a href="//evil.example/path">protocol-relative</a>
      <a href="/jastrow?q=%D7%90%D6%B8%D7%91">entry</a>
      <span dir="rtl" onmouseover="alert(4)">אָב</span>`;
    const result = sanitizeJastrowHtml(html);
    const doc = new DOMParser().parseFromString(result, "text/html");
    expect(doc.querySelector("img, svg, [onclick], [onmouseover]")).toBeNull();
    expect([...doc.querySelectorAll("a")].map(link => link.getAttribute("href")))
      .toEqual([null, null, "/jastrow?q=%D7%90%D6%B8%D7%91"]);
    expect(doc.querySelector("[dir=rtl]")?.textContent).toBe("אָב");
  });

  it("retains source links, outline IDs, and interactive abbreviation metadata", () => {
    const raw = '<strong>1)</strong> <i>ἄγγελος</i> <a href="/Jastrow,_אָב.1">אָב</a> &c.';
    const structured = structureJastrowDefinition(raw, "jastrow-A00014-sense-0", true);
    expect(structured.html).toContain(`id="${structured.outline[0].id}"`);
    const expanded = expandAbbreviations(normalizeJastrowAbbreviationMarkup(
      structured.html, mappings.mappings), mappings.mappings,
    { display: "original", jastrowApostrophes: true });
    const html = sanitizeJastrowHtml(annotateTransliterationsInHtml(convertJastrowInternalLinks(expanded)));
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(html).toContain(`id="${structured.outline[0].id}"`);
    expect(doc.querySelector("a")?.getAttribute("href")).toContain("/jastrow?q=");
    expect(doc.querySelector("button")?.getAttribute("data-bdb-expansion")).toBe("etc.");
    expect(doc.querySelector(".jastrow-paragraph-break")).toBeNull();
    expect(doc.body.textContent).toContain("ἄγγελος");
  });

  it("keeps safe citation markup and blocks encoded or malformed active elements", () => {
    const html = `<a href="&#106;avascript:alert(1)">unsafe</a>
      <iframe srcdoc="<script>alert(1)</script>">iframe</iframe>
      <math><annotation-xml encoding="text/html"><img src=x onerror=alert(2)></annotation-xml></math>
      <span class="font-medium scroll-mt-24" id="jastrow-A00014-sense-0-1" dir="rtl">א</span>
      <a href="#jastrow-A00014-sense-0-1">index</a>`;
    const result = sanitizeJastrowHtml(html);
    const doc = new DOMParser().parseFromString(result, "text/html");
    expect(doc.querySelector("iframe, math, img, script, [onerror]")).toBeNull();
    expect(doc.querySelector("a")?.hasAttribute("href")).toBe(false);
    expect(doc.querySelectorAll("a")[1]?.getAttribute("href")).toBe("#jastrow-A00014-sense-0-1");
    expect(doc.querySelector("span[id]")?.id).toBe("jastrow-A00014-sense-0-1");
  });
});
