import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import { prepareBenYehudaHtml, benYehudaCopyText } from "./ben-yehuda-html";

beforeAll(() => {
  const window = new Window();
  vi.stubGlobal("window", window);
  vi.stubGlobal("DOMParser", window.DOMParser);
});
afterAll(() => vi.unstubAllGlobals());
const render = (source: string, inline = false, split = false) =>
  new DOMParser().parseFromString(prepareBenYehudaHtml([source], "test", split, inline), "text/html");
const expansions = (doc: Document) => Array.from(doc.querySelectorAll("[data-bdb-expansion]"))
  .map(node => decodeURIComponent(node.getAttribute("data-bdb-expansion")!));

describe("reviewed Ben-Yehuda abbreviation contexts", () => {
  it("preserves original forms in tooltip mode and expands only on opt-in", () => {
    const source = "<p>עי׳ בזה, ועי’ גם. במשמ' דבר, ובמשמ׳ אחר. בארמ׳ ובעבר׳</p>";
    const original = render(source);
    expect(original.body.textContent).toBe("עי׳ בזה, ועי’ גם. במשמ' דבר, ובמשמ׳ אחר. בארמ׳ ובעבר׳");
    expect(expansions(original)).toEqual(["עיין", "ועיין", "במשמעות", "ובמשמעות", "בארמית", "ובעברית"]);
    expect(original.querySelectorAll("button")).toHaveLength(6);
    expect(original.querySelector("button")?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(render(source, true).body.textContent).toBe("עיין בזה, ועיין גם. במשמעות דבר, ובמשמעות אחר. בארמית ובעברית");
  });
  it("does not replace parts of words, unreviewed prefixes, initials or divine names", () => {
    const text = `מ"ר ע״כ ר' ר"י ר״ש יי' ה׳ וכו' לעי' וכ"י דבר' ש"א`;
    const doc = render(`<p>${text}</p>`, true);
    expect(doc.body.textContent).toBe(text);
    expect(expansions(doc)).toEqual([]);
  });
  it("recognizes morphology only in the opening grammatical introduction", () => {
    const doc = render(`<p><strong>אָב</strong>, ש״ז, — הגדרה ש"ז,</p><p>ש"נ, בהמשך</p>
      <p><span class="by-source">ש"נ, מקור</span></p>`, true);
    expect(expansions(doc)).toEqual(["שם זכר"]);
    expect(doc.body.textContent).toContain('הגדרה ש"ז');
    expect(doc.body.textContent).toContain('ש"נ, בהמשך');
    expect(expansions(render(`<p><strong>מלה</strong>, ש"נ, – הגדרה</p>`, true))).toEqual(["שם נקבה"]);
    expect(expansions(render(`<p>מלה: ש"ז, דבר</p>`, true))).toEqual([]);
    expect(expansions(render(`<p>מלה <span class="by-source">בראש' א א</span>, ש"ז, דבר</p>`, true))).toEqual(["בראשית"]);
  });
  it("expands citation labels without changing destinations or qualifiers", () => {
    const doc = render(`<p>דבר' לא מקור
      <span class="by-source"><a href="Deuteronomy.3.2">דבר' ג ב</a> והשווה</span>
      <span class="by-source">מד"ר בראש' צו</span>
      <a href="/Ben_Yehuda_Dictionary,_עי.1">עי'</a></p>`, true);
    expect(doc.body.textContent).toContain("דברים ג ב");
    expect(doc.body.textContent).toContain("והשווה");
    expect(doc.body.textContent).toContain("מדרש רבה בראשית צו");
    expect(doc.body.textContent).toContain("דבר' לא מקור");
    expect(doc.querySelector("a")?.getAttribute("href")).toBe("/bible/Deuteronomy/3#2");
    expect(doc.querySelectorAll("a")[1].textContent).toBe("עי'");
    expect(doc.querySelector("a button")).toBeNull();
    const original = render(`<p><a href="Genesis.1.1">בראש' א א</a></p>`);
    expect(original.querySelector("a span.bdb-abbreviation")).not.toBeNull();
    expect(original.querySelector("a button")).toBeNull();
    expect(expansions(render(`<p><a href="Genesis.1.1">דבר' א א</a></p>`, true))).toEqual([]);
  });
  it("leaves explicit quotations untouched, including abbreviations", () => {
    const doc = render(`<p>עי' כאן <q>עי' שם</q></p><blockquote>ר"ל במשמ'</blockquote>`, true);
    expect(expansions(doc)).toEqual(["עיין"]);
    expect(doc.querySelector("q")?.textContent).toBe("עי' שם");
    expect(doc.querySelector("blockquote")?.textContent).toBe("ר\"ל במשמ'");
  });
  it("handles footnotes and paragraph splitting without duplicating controls", () => {
    const source = `<p>במשמ' ראשון — עי' שני<sup class="footnote-marker">1</sup><i class="footnote">בארמ' הערה — המשך</i></p>`;
    const doc = render(source, true, true);
    expect(expansions(doc)).toEqual(["במשמעות", "עיין", "בארמית"]);
    expect(doc.querySelectorAll("details")).toHaveLength(1);
    expect(doc.querySelectorAll(".by-dash-paragraph")).toHaveLength(2);
    const copied = benYehudaCopyText(doc.body.innerHTML);
    expect(copied).toContain("במשמעות ראשון\n\n— עיין שני");
    expect(copied).not.toContain("בארמית");
    doc.querySelector("details")!.setAttribute("open", "");
    expect(benYehudaCopyText(doc.body.innerHTML)).toContain("בארמית הערה — המשך");
    expect(benYehudaCopyText(render(source, false, true).body.innerHTML)).toContain("במשמ' ראשון\n\n— עי' שני");
  });
  it("does not trust abbreviation attributes supplied by source HTML", () => {
    const doc = render(`<p><span data-bdb-expansion="bad" class="bdb-abbreviation">hello</span>
      <script>עי'</script><a href="javascript:bad()">evil</a></p>`, true);
    expect(doc.querySelector("[data-bdb-expansion], script, a[href]")).toBeNull();
  });
});
