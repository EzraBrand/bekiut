/**
 * Small reviewed set from docs/ben-yehuda-abbreviation-analysis.md.
 * Contexts are intentionally separate. Ambiguous מ"ר, ע"כ, personal initials,
 * divine names, and quoted וכו' are not global replacements.
 */
type Rule = { source: string; expansion: string; context: "prose" | "citation" | "grammar"; book?: string };
export const BEN_YEHUDA_ABBREVIATIONS: readonly Rule[] = [
  { source: "במשמ'", expansion: "במשמעות", context: "prose" },
  { source: "ובמשמ'", expansion: "ובמשמעות", context: "prose" },
  { source: "עי'", expansion: "עיין", context: "prose" },
  { source: "ועי'", expansion: "ועיין", context: "prose" },
  { source: 'ר"ל', expansion: "רוצה לומר", context: "prose" },
  { source: 'וכמו"כ', expansion: "וכמו כן", context: "prose" },
  { source: "בערב'", expansion: "בערבית", context: "prose" },
  { source: "בארמ'", expansion: "בארמית", context: "prose" },
  { source: "בעבר'", expansion: "בעברית", context: "prose" },
  { source: "ובערב'", expansion: "ובערבית", context: "prose" },
  { source: "ובארמ'", expansion: "ובארמית", context: "prose" },
  { source: "ובעבר'", expansion: "ובעברית", context: "prose" },
  { source: 'כ"י', expansion: "כתב יד", context: "prose" },
  { source: 'עפ"י', expansion: "על פי", context: "prose" },
  { source: 'אח"כ', expansion: "אחר כך", context: "prose" },
  { source: 'ג"כ', expansion: "גם כן", context: "prose" },
  { source: "בסור'", expansion: "בסורית", context: "prose" },
  { source: 'ש"ז', expansion: "שם זכר", context: "grammar" },
  { source: 'ש"נ', expansion: "שם נקבה", context: "grammar" },
  { source: "בראש'", expansion: "בראשית", context: "citation", book: "Genesis" },
  { source: "ישע'", expansion: "ישעיהו", context: "citation", book: "Isaiah" },
  { source: "תהל'", expansion: "תהלים", context: "citation", book: "Psalms" },
  { source: "תהיל'", expansion: "תהלים", context: "citation", book: "Psalms" },
  { source: "ירמ'", expansion: "ירמיהו", context: "citation", book: "Jeremiah" },
  { source: "במד'", expansion: "במדבר", context: "citation", book: "Numbers" },
  { source: "דבר'", expansion: "דברים", context: "citation", book: "Deuteronomy" },
  { source: "ויקר'", expansion: "ויקרא", context: "citation", book: "Leviticus" },
  { source: 'ש"א', expansion: "שמואל א", context: "citation", book: "I_Samuel" },
  { source: 'ש"ב', expansion: "שמואל ב", context: "citation", book: "II_Samuel" },
  { source: 'מ"א', expansion: "מלכים א", context: "citation", book: "I_Kings" },
  { source: 'מ"ב', expansion: "מלכים ב", context: "citation", book: "II_Kings" },
  { source: 'דהי"א', expansion: "דברי הימים א", context: "citation", book: "I_Chronicles" },
  { source: 'דהי"ב', expansion: "דברי הימים ב", context: "citation", book: "II_Chronicles" },
  { source: 'מד"ר', expansion: "מדרש רבה", context: "citation" },
  { source: 'ב"מ', expansion: "בבא מציעא", context: "citation" },
  { source: 'ב"ק', expansion: "בבא קמא", context: "citation" },
  { source: "ברכ'", expansion: "ברכות", context: "citation" },
  { source: "ירוש'", expansion: "ירושלמי", context: "citation" },
  { source: "יחזק'", expansion: "יחזקאל", context: "citation", book: "Ezekiel" },
  { source: "שופט'", expansion: "שופטים", context: "citation", book: "Judges" },
  { source: "יהוש'", expansion: "יהושע", context: "citation", book: "Joshua" },
  { source: "קהל'", expansion: "קהלת", context: "citation", book: "Ecclesiastes" },
  { source: "הוש'", expansion: "הושע", context: "citation", book: "Hosea" },
  { source: "יבמ'", expansion: "יבמות", context: "citation" },
  { source: "סנה'", expansion: "סנהדרין", context: "citation" },
  { source: "תוספת'", expansion: "תוספתא", context: "citation" },
  { source: "כתוב'", expansion: "כתובות", context: "citation" },
  { source: "פסח'", expansion: "פסחים", context: "citation" },
  { source: "זבח'", expansion: "זבחים", context: "citation" },
  { source: "אבו'", expansion: "אבות", context: "citation" },
  { source: "סוט'", expansion: "סוטה", context: "citation" },
  { source: "מנח'", expansion: "מנחות", context: "citation" },
  { source: "תשו'", expansion: "תשובות", context: "citation" },
  { source: "מהד'", expansion: "מהדורת", context: "citation" },
];

const canonical = (text: string) => text.replace(/[׳’]/g, "'").replace(/״/g, '"');
const rules = new Map(BEN_YEHUDA_ABBREVIATIONS.map(rule => [rule.source, rule]));
const sourcePattern = [...rules.keys()].sort((a, b) => b.length - a.length)
  .map(source => source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/'/g, "['׳’]").replace(/"/g, '["״]')).join("|");
// Explicit Unicode boundaries: never match the end of a longer Hebrew word,
// a transliteration, or a prefix not represented in this reviewed set.
const pattern = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}'׳’"״])(?:${sourcePattern})(?![\\p{L}\\p{M}\\p{N}'׳’"״])`, "gu");

/** Operates on already-sanitized DOM, before optional paragraph splitting. */
export function annotateBenYehudaAbbreviations(root: Element, inline: boolean): void {
  const doc = root.ownerDocument;
  const walker = doc.createTreeWalker(root, 4 /* SHOW_TEXT */);
  const nodes: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) nodes.push(current as Text);
  const firstBlock = root.querySelector(".by-paragraph") ?? root.firstElementChild;
  let introduction = "";
  let introductionEnded = false;
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || parent.closest("summary, sup, sub, q, blockquote, [data-bdb-expansion]")) continue;
    const text = node.data;
    const anchor = parent.closest("a");
    const citation = parent.closest(".by-source") || (anchor && !anchor.getAttribute("href")?.startsWith("/ben-yehuda?"));
    if (citation && firstBlock?.contains(node) && !parent.closest("details")) introductionEnded = true;
    const inIntro = firstBlock?.contains(node) && !parent.closest("details") && !citation;
    const introBefore = introduction;
    if (inIntro) introduction += text;
    const fragment = doc.createDocumentFragment();
    let end = 0;
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const rule = rules.get(canonical(match[0]))!;
      const before = text.slice(0, match.index);
      if (rule.context === "citation") {
        if (!citation) continue;
        // If Sefaria resolves a different Bible book, trust the link rather
        // than giving the displayed abbreviation a contradictory expansion.
        const href = anchor?.getAttribute("href");
        if (rule.book && href?.startsWith("/bible/") && !href.startsWith(`/bible/${rule.book}/`)) continue;
      } else if (rule.context === "grammar") {
        // Only the leading grammatical introduction, before a definition dash
        // or sentence/colon. Notes and citation labels are not grammar.
        const prefix = introBefore + before;
        if (!inIntro || introductionEnded || /[—–:.]/.test(prefix) || prefix.length > 500 ||
            !/(?:^|[,;])\s*$/.test(prefix) || !/^\s*[,;—–]/.test(text.slice(match.index! + match[0].length))) continue;
      } else if (citation || anchor) {
        // Do not modify cross-reference headwords or turn a citation into prose.
        continue;
      }
      fragment.append(doc.createTextNode(text.slice(end, match.index)));
      const element = doc.createElement(inline || anchor ? "span" : "button");
      element.className = inline ? "dict-expanded by-expanded" : "bdb-abbreviation";
      element.setAttribute("data-bdb-source", encodeURIComponent(match[0]));
      element.setAttribute("data-bdb-expansion", encodeURIComponent(rule.expansion));
      if (element.tagName === "BUTTON") {
        element.setAttribute("type", "button");
        element.setAttribute("aria-haspopup", "dialog");
      }
      element.textContent = inline ? rule.expansion : match[0];
      fragment.append(element);
      end = match.index! + match[0].length;
    }
    if (end) {
      fragment.append(doc.createTextNode(text.slice(end)));
      node.replaceWith(fragment);
    }
  }
}
