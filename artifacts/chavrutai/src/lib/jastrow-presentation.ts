import type { DictionaryEntry } from "./dictionary-format";

// Sefaria sometimes repeats the same anchor inside itself. Remove the duplicate
// wrapper before HTML parsing (which would otherwise repair it as sibling links).
export function normalizeJastrowLinks(html: string): string {
  let previous: string;
  do {
    previous = html;
    html = html.replace(/(<a\b[^>]*>)(\s*)(<a\b[^>]*>)([\s\S]*?<\/a>)([^<]*)<\/a>/gi,
      (match, outer: string, space: string, inner: string, body: string, tail: string) => {
        const href = (tag: string) => tag.match(/\bhref\s*=\s*["']([^"']*)["']/i)?.[1];
        return href(outer) && href(outer) === href(inner) ? outer + space + body + tail : match;
      });
  } while (html !== previous);
  return html;
}

export function jastrowOrigin(entry: DictionaryEntry) {
  let origin = normalizeJastrowLinks(
    [entry.language_code?.trim(), entry.language_reference?.trim()].filter(Boolean).join(" "),
  );
  const definitions = entry.content.senses.map(s => normalizeJastrowLinks(s.definition));
  // Only join the known continuation, never guess how an arbitrary unclosed
  // parenthesis should end or swallow definition prose.
  if (origin.includes("(") && !origin.includes(")") && definitions[0]) {
    const continuation = definitions[0].match(/^\s*((?:preced\.|same)\s*\))/i);
    if (continuation) {
      origin += " " + continuation[1];
      definitions[0] = definitions[0].slice(continuation[0].length).trimStart();
    }
  }
  return { origin, definitions };
}

export interface JastrowOutlineItem { id: string; label: string; level: number }

// HTML serialization encodes the ampersand. Restore this literal abbreviation
// before matching, without decoding markup or other entities.
export function restoreJastrowEtCetera(html: string): string {
  return html
    // כָּבַשׁ (K00081) puts only the abbreviation's period in italics.
    // Join that punctuation-only emphasis without unwrapping surrounding prose.
    .replace(/&(?:amp;)?c<(i|em)\b[^>]*>\.<\/\1>/gi, "&c.")
    .replace(/&amp;c\./g, "&c.");
}

// Work on text nodes, not raw HTML: breaks cannot cut links, emphasis, or
// attributes in half. Original punctuation and citation grouping are retained.
export function structureJastrowDefinition(html: string, prefix: string, extraSplits: boolean) {
  const outline: JastrowOutlineItem[] = [];
  if (typeof DOMParser === "undefined") return { html, outline };
  const doc = new DOMParser().parseFromString(`<div id="jastrow-root">${html}</div>`, "text/html");
  const root = doc.getElementById("jastrow-root")!;
  const paragraphBreak = () => {
    const gap = doc.createElement("span");
    gap.className = "jastrow-paragraph-break";
    gap.setAttribute("aria-hidden", "true");
    return gap;
  };
  const anchor = (element: Element, label: string, level: number) => {
    const id = `${prefix}-${outline.length}`;
    element.id = id;
    element.classList.add("scroll-mt-24");
    outline.push({ id, label: label.trim().slice(0, 100), level });
  };
  // Numbered senses and stem headings are supplied by the source/API.
  root.querySelectorAll("strong, b").forEach(element => {
    const label = element.textContent?.trim() || "";
    if (!label || label.length > 70) return;
    const words: string[] = [];
    // Use the opening italicized gloss, not citations, Hebrew examples, or
    // explanatory prose following it. Keep numbered/stem labels and anchors.
    for (let sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
      if (sibling instanceof Element && /^(STRONG|B|BR|A)$/.test(sibling.tagName)) break;
      if (sibling instanceof Element && /^(EM|I)$/.test(sibling.tagName)) {
        words.push(sibling.textContent || "");
      } else {
        const text = sibling.textContent || "";
        if (/[—–]/.test(text) || (words.length && /[\p{L}\p{N}]/u.test(text))) break;
      }
    }
    const gloss = words.join(" ").trim().replace(/\s+/g, " ").slice(0, 65);
    anchor(element, [label, gloss].filter(Boolean).join(" — "), 0);
  });
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const text of nodes) {
    if (text.parentElement?.closest("a, sup, strong, b, script, style")) continue;
    // Source phrase introductions: an em dash followed by a Hebrew phrase.
    // Ordinary hyphens and Greek/Latin word fragments are not boundaries.
    const pattern = /[—–]\s*([\u0590-\u05ff][\u0590-\u05ff ׳״'־]{1,60})/g;
    const value = text.data;
    const matches = [...value.matchAll(pattern)];
    if (!matches.length) continue;
    const fragment = doc.createDocumentFragment();
    let cursor = 0;
    for (const match of matches) {
      fragment.append(value.slice(cursor, match.index));
      fragment.append(extraSplits ? paragraphBreak() : doc.createElement("br"));
      if (!extraSplits) fragment.append(doc.createElement("br"));
      const heading = doc.createElement("span");
      heading.className = "font-medium";
      heading.textContent = match[0];
      anchor(heading, match[1], 1);
      fragment.append(heading);
      cursor = match.index! + match[0].length;
    }
    fragment.append(value.slice(cursor));
    text.replaceWith(fragment);
  }
  if (extraSplits) {
    const extraWalker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const extraNodes: Text[] = [];
    while ((node = extraWalker.nextNode())) extraNodes.push(node as Text);
    for (const text of extraNodes) {
      if (text.parentElement?.closest("a, sup, span[id], script, style")) continue;
      const parts = text.data.split(/([—–])/);
      if (parts.length < 2) continue;
      const fragment = doc.createDocumentFragment();
      parts.forEach(part => {
        if (/^[—–]$/.test(part)) fragment.append(paragraphBreak());
        fragment.append(part);
      });
      text.replaceWith(fragment);
    }
    // Equivalent to the former period+link splitting, without inventing lists.
    root.querySelectorAll("a").forEach(link => {
      if (/Jastrow|\/jastrow|BDB|\/bdb/i.test(link.getAttribute("href") || "")) return;
      if (/\.\)?\s*$/.test(link.previousSibling?.textContent || "")) {
        link.before(paragraphBreak());
      }
    });
  }
  return { html: root.innerHTML, outline };
}
