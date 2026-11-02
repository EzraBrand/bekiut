import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import mappings from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations, convertJastrowInternalLinks, annotateTransliterationsInHtml } from "./dictionary-format";
import { normalizeJastrowAbbreviationMarkup, structureJastrowDefinition } from "./jastrow-presentation";
import { sanitizeJastrowHtml, sanitizeBdbHtml } from "./jastrow-html-sanitizer";
import bdbMappings from "@/shared/data/lexicon-mappings/bdb.json";
import { splitIntoParagraphsBdb, convertSupTagsToParens, convertBdbInternalLinks, convertSefariaLinksToInternal } from "./dictionary-format";
import { wrapBdbGreekMarkers } from "./bdb-greek-markers";

beforeAll(() => {
  const window = new Window();
  vi.stubGlobal("window", window);
  vi.stubGlobal("document", window.document);
  vi.stubGlobal("DOMParser", window.DOMParser);
  vi.stubGlobal("NodeFilter", window.NodeFilter);
  vi.stubGlobal("Element", window.Element);
});
afterAll(() => vi.unstubAllGlobals());

describe("BDB final-HTML sanitizer", () => {
  it.each([true, false])("preserves paragraphs, citations, Greek anchors and abbreviation metadata (inline=%s)", inline => {
    const raw = '<strong>1.</strong> <i>father</i> α. <a href="https://www.sefaria.org/Genesis.1.1">Gn 1:1</a>; <a href="/BDB,_אָב">אָב</a> — cf. <sup>2</sup>';
    for (const split of [false, true]) {
      const html = sanitizeBdbHtml(annotateTransliterationsInHtml(
        convertSefariaLinksToInternal(convertBdbInternalLinks(expandAbbreviations(
          splitIntoParagraphsBdb(convertSupTagsToParens(wrapBdbGreekMarkers(raw, "sense-A1-0")), split),
          bdbMappings.mappings, { bdbNumericContext: true, bdbDisplay: inline ? "inline" : "original" },
        ))),
      ));
      const doc = new DOMParser().parseFromString(html, "text/html");
      expect(doc.querySelector(".bdb-paragraph")).not.toBeNull();
      expect(doc.querySelector("#sense-A1-0-greek-α-0")).not.toBeNull();
      expect(doc.querySelector("a[href^='/bible/']")).not.toBeNull();
      expect(doc.querySelector("a[href^='/bdb?']")).not.toBeNull();
      expect(doc.querySelector("i")?.textContent).toBe("father");
      if (!inline) expect(doc.querySelector("[data-bdb-expansion]")).not.toBeNull();
      if (split) expect(doc.querySelector(".bdb-semicolon-segment")).not.toBeNull();
    }
  });

  it("removes executable markup, unsafe links and foreign attributes", () => {
    const html = sanitizeBdbHtml(`<p class="bdb-paragraph" onclick="bad()">safe</p>
      <script>alert(1)</script><svg onload="bad()"></svg><iframe src="https://example.com"></iframe>
      <a href="javascript:bad()">bad</a><a href="/\\evil.example">bad</a>
      <span id="location" style="color:red" onmouseover="bad()">text</span>
      <a href="https://www.sefaria.org/Genesis.1.1">source</a>`);
    const doc = new DOMParser().parseFromString(html, "text/html");
    expect(doc.querySelector("script, svg, iframe, [onclick], [onmouseover], [style], #location")).toBeNull();
    expect(doc.querySelectorAll("a[href]")).toHaveLength(1);
    expect(doc.querySelector("p")?.textContent).toBe("safe");
  });
});

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
