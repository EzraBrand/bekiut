export interface HebrewSelection {
  original: string;
  lookup: string;
  words: number;
  reference: string;
}

export function normalizeHebrewSelection(original: string) {
  if (/[^\p{Script=Hebrew}\p{M}\p{P}\p{Z}\s\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(original)) return null;
  const lookup = original.normalize("NFKD")
    .replace(/[\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7]/g, "")
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/^[^א-ת]+|[^א-ת]+$/g, "");
  if (!lookup || /[^\u0590-\u05ff\s'’"“”.,:;!?()[\]{}\-–—]/u.test(lookup)) return null;
  const words = (lookup.match(/[א-ת]+(?:['’"׳״][א-ת]+)*/g) || []).length;
  return { lookup, words };
}

/** Every selected non-whitespace text node must belong to the same source daf.
 * Checking endpoints alone would incorrectly accept interleaved English/notes.
 */
export function readHebrewSelection(selection: Selection | null, root: HTMLElement): HebrewSelection | null {
  if (!selection || selection.isCollapsed || selection.rangeCount !== 1) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const owner = (node: Node) => (node.nodeType === 1 ? node as Element : node.parentElement)
    ?.closest<HTMLElement>("[data-hebrew-lookup-ref]");
  const start = owner(range.startContainer);
  const end = owner(range.endContainer);
  if (!start || !end || start.dataset.hebrewLookupRef !== end.dataset.hebrewLookupRef) return null;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!range.intersectsNode(node)) continue;
    const from = node === range.startContainer ? range.startOffset : 0;
    const to = node === range.endContainer ? range.endOffset : node.textContent?.length;
    if (!node.textContent?.slice(from, to).trim()) continue;
    if (owner(node)?.dataset.hebrewLookupRef !== start.dataset.hebrewLookupRef ||
        node.parentElement?.closest("button,input,textarea,[contenteditable],sup,.footnote,[data-talmud-note]")) return null;
  }
  const original = selection.toString().trim();
  const normalized = normalizeHebrewSelection(original);
  return normalized ? { original, ...normalized, reference: start.dataset.hebrewLookupRef! } : null;
}

export function googleSelectionHref(selection: HebrewSelection, ai = true) {
  const query = `In the Babylonian Talmud, ${selection.reference}, explain this Hebrew/Aramaic phrase in context: “${selection.original}”`;
  return `https://www.google.com/search?${ai ? "udm=50&" : ""}q=${encodeURIComponent(query)}`;
}

export function wiktionaryHref(language: "en" | "he", word: string, search = false) {
  return search
    ? `https://${language}.wiktionary.org/w/index.php?search=${encodeURIComponent(word)}`
    : `https://${language}.wiktionary.org/wiki/${encodeURIComponent(word)}`;
}
