import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import { Window } from "happy-dom";
import { prepareBenYehudaHtml, benYehudaCopyText } from "./ben-yehuda-html";
import { loadLexiconIndex, searchHeadwords } from "./lexicon-index";

beforeAll(() => {
  const window = new Window();
  vi.stubGlobal("window", window);
  vi.stubGlobal("DOMParser", window.DOMParser);
});
afterAll(() => vi.unstubAllGlobals());
const parse = (html: string) => new DOMParser().parseFromString(html, "text/html");

describe("Ben-Yehuda dedicated HTML policy", () => {
  it.each(["—", "–"])("splits at %s by default without losing markup or splitting notes", dash => {
    const source = [`<p>א <strong>ראשון ${dash} שני</strong><sup class="footnote-marker">1</sup><i class="footnote">הערה ${dash} המשך</i> ${dash} סוף</p>`];
    const doc = parse(prepareBenYehudaHtml(source, "split"));
    expect(doc.querySelectorAll(".by-dash-paragraph")).toHaveLength(3);
    expect(doc.querySelectorAll("details")).toHaveLength(1);
    expect(doc.querySelector("details")?.textContent).toContain(`הערה ${dash} המשך`);
    expect(doc.querySelectorAll("strong")).toHaveLength(2);
    expect(doc.body.textContent).toContain(`${dash} שני`);
    expect(benYehudaCopyText(doc.body.innerHTML)).toContain(`\n\n${dash}`);
    expect(parse(prepareBenYehudaHtml(source, "unsplit", false)).querySelector(".by-dash-paragraph")).toBeNull();
  });
  it("retains source paragraphs, direction, superscripts, PNGs and accessible footnotes", () => {
    const html = prepareBenYehudaHtml([
      '<p>ה <img src="data:image/png;base64,iVBORw0KGgo=" height="31" width="32" alt="">אות<sup class="footnote-marker">1</sup><i class="footnote">הערה <span dir="ltr">Wallin, ZMG</span></i></p>',
      '<p><span class="by-source">בראשית</span> שָׁלוֹם <sup>2</sup></p>',
    ], "BY-03821");
    const doc = parse(html);
    expect(doc.querySelectorAll(".by-source-paragraph")).toHaveLength(2);
    expect(doc.querySelector("img")?.getAttribute("height")).toBe("31");
    expect(doc.querySelector('[dir="ltr"]')?.textContent).toBe("Wallin, ZMG");
    expect(doc.querySelector("summary")?.getAttribute("aria-label")).toBe("הערה 1");
    expect(doc.querySelectorAll("sup")).toHaveLength(1);
    expect(doc.querySelector("p details")).toBeNull();
    const text = benYehudaCopyText(html);
    expect(text).toContain("שָׁלוֹם");
    expect(text).toContain("\n\n");
  });
  it("preserves homographs in internal links and leaves unresolved citations on Sefaria", () => {
    const doc = parse(prepareBenYehudaHtml([
      '<p><a href="/Ben_Yehuda_Dictionary,_הֵא_I.1">הֵא</a> <a href="/Unknown_Work.3">label</a> <span class="by-source">no invented link</span></p>',
    ], "one"));
    expect(doc.querySelector("a")?.getAttribute("href")).toBe(`/ben-yehuda?q=${encodeURIComponent("הֵא I")}`);
    expect(doc.querySelectorAll("a")[1].getAttribute("href")).toBe("https://www.sefaria.org/Unknown_Work.3");
    expect(doc.querySelectorAll("a")).toHaveLength(2);
  });
  it("rejects active content, unsafe URLs, SVG/data HTML and clobbering attributes", () => {
    const doc = parse(prepareBenYehudaHtml([
      `<p onclick="bad()">safe<script>bad()</script><svg onload="bad()"><text>bad</text></svg>
      <iframe src="https://evil.org"></iframe><img src="data:image/svg+xml;base64,AAAA">
      <img src="https://evil.org/track"><a href="javascript:bad()">bad</a>
      <a href="//evil.org">bad</a><a href="/\\evil.org">bad</a>
      <span id="location" style="position:fixed" onfocus="bad()">safe</span></p>`,
    ], "two"));
    expect(doc.querySelector("script,svg,iframe,img,[onclick],[style],[id],[onfocus],a[href]")).toBeNull();
    expect(doc.body.textContent).toContain("safe");
  });
  it("keeps short cross-reference paragraphs intact", () => {
    const html = prepareBenYehudaHtml(['<p>תַּתְרָן, עי׳ <a href="/Ben_Yehuda_Dictionary,_הֵא_I.1">הֵא I</a>.</p>'], "short");
    expect(benYehudaCopyText(html)).toBe("תַּתְרָן, עי׳ הֵא I.");
  });
  it("loads the lazy index and finds pointed or unpointed suggestions", async () => {
    const index = await loadLexiconIndex("ben-yehuda");
    expect(index.total).toBe(21999);
    expect(index.headwords.indexOf("אֲבִי")).toBeLessThan(index.headwords.indexOf("אֱגוֹד"));
    expect(searchHeadwords(index, "שלום", 50).some(s => s.voweled === "שָׁלוֹם")).toBe(true);
    expect(searchHeadwords(index, "אָב I").some(s => s.voweled === "אָב I")).toBe(true);
  });
});
