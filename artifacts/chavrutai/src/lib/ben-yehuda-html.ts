import { benYehudaHeadwordFromRef, benYehudaHref } from "@workspace/shared-data/ben-yehuda";

const TAGS = new Set(["A", "P", "DIV", "SPAN", "STRONG", "B", "EM", "I", "SUP", "SUB", "BR", "IMG", "SMALL"]);
const CLASSES = new Set(["by-source", "footnote", "footnote-marker", "refLink"]);

function safeLink(value: string): string | null {
  if (/[\\\u0000-\u001f\u007f]/.test(value) || value.startsWith("//")) return null;
  const headword = benYehudaHeadwordFromRef(value);
  if (headword) return benYehudaHref(headword);
  // Source relative citations belong to Sefaria, not to the local app.
  try {
    const url = new URL(value, "https://www.sefaria.org/");
    return /^https?:$/.test(url.protocol) ? url.href : null;
  } catch { return null; }
}

function cleanTree(root: Element) {
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === 8) { child.remove(); continue; }
    if (child.nodeType !== 1) continue;
    const element = child as Element;
    if (!TAGS.has(element.tagName)) { element.remove(); continue; }
    for (const attr of Array.from(element.attributes)) {
      const { name, value } = attr;
      if (name === "href" && element.tagName === "A") {
        const href = safeLink(value);
        if (href) element.setAttribute("href", href);
        else element.removeAttribute(name);
      } else if (
        (name === "dir" && /^(rtl|ltr|auto)$/.test(value)) ||
        (name === "class" && value.split(/\s+/).every(token => CLASSES.has(token))) ||
        (name === "alt" && element.tagName === "IMG") ||
        (["height", "width"].includes(name) && element.tagName === "IMG" && /^\d{1,4}$/.test(value)) ||
        // Only source PNG payloads, never SVG/data HTML or arbitrary remote images.
        (name === "src" && element.tagName === "IMG" && value.length <= 2_000_000 &&
          /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(value))
      ) { /* explicitly retained */ }
      else element.removeAttribute(name);
    }
    if (element.tagName === "IMG" && !element.hasAttribute("src")) { element.remove(); continue; }
    cleanTree(element);
  }
}

/** Source HTML is sanitized before trusted, accessible footnote controls are built. */
export function prepareBenYehudaHtml(paragraphs: string[], entryId: string, splitDashes = true): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString("", "text/html");
  const root = doc.createElement("div");
  doc.body.append(root);
  for (const html of paragraphs) {
    const block = doc.createElement("div");
    block.innerHTML = html;
    cleanTree(block);
    // Details are flow content, not valid children of <p>. Preserve the source
    // paragraph boundaries using divs before inserting native disclosures.
    for (const p of Array.from(block.querySelectorAll("p"))) {
      const div = doc.createElement("div");
      div.className = "by-paragraph";
      if (p.hasAttribute("dir")) div.setAttribute("dir", p.getAttribute("dir")!);
      div.append(...Array.from(p.childNodes));
      p.replaceWith(div);
    }
    block.className = "by-source-paragraph";
    root.append(block);
  }
  let noteIndex = 0;
  for (const note of Array.from(root.querySelectorAll("i.footnote"))) {
    const marker = note.previousElementSibling?.matches("sup.footnote-marker") ? note.previousElementSibling : null;
    const label = marker?.textContent?.trim() || String(noteIndex + 1);
    const details = doc.createElement("details");
    details.className = "by-footnote";
    details.id = `by-note-${entryId.replace(/[^\w-]/g, "")}-${++noteIndex}`;
    const summary = doc.createElement("summary");
    summary.textContent = label;
    summary.setAttribute("aria-label", `הערה ${label}`);
    const body = doc.createElement("span");
    body.className = "by-footnote-body";
    body.append(...Array.from(note.childNodes));
    details.append(summary, body);
    marker?.remove();
    note.replaceWith(details);
  }
  if (splitDashes) {
    const blocks = Array.from(root.querySelectorAll(".by-paragraph, .by-source-paragraph"))
      .filter(block => !block.querySelector(".by-paragraph"));
    for (const block of blocks) {
      const walker = doc.createTreeWalker(block, 4 /* SHOW_TEXT */);
      const boundaries: { node: Node; offset: number }[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.parentElement?.closest("details")) continue;
        for (const match of (node.textContent || "").matchAll(/[—–]/g)) {
          boundaries.push({ node, offset: match.index! });
        }
      }
      if (!boundaries.length) continue;
      // Clone ancestor formatting across each text-node boundary. Treat notes
      // atomically, so their body and unique IDs are never split or duplicated.
      function splitNode(node: Node): Node[] {
        if (node.nodeType === 3) {
          const text = node.textContent || "";
          const parts = text.split(/(?=[—–])/);
          if (/^[—–]/.test(text)) parts.unshift("");
          return parts.map(part => doc.createTextNode(part));
        }
        if ((node as Element).tagName === "DETAILS") return [node.cloneNode(true)];
        const parts = [node.cloneNode(false)];
        for (const child of Array.from(node.childNodes)) {
          splitNode(child).forEach((part, index) => {
            if (index) parts.push(node.cloneNode(false));
            parts[parts.length - 1].appendChild(part);
          });
        }
        return parts;
      }
      const parts = splitNode(block) as Element[];
      block.replaceChildren(...parts.filter(part => part.textContent?.trim() || part.querySelector("img, details")).map(part => {
        part.className = "by-dash-paragraph";
        return part;
      }));
    }
  }
  return root.innerHTML;
}

/** Deterministic paragraph boundaries; textContent alone concatenates paragraphs. */
export function benYehudaCopyText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("br").forEach(node => node.replaceWith("\n"));
  doc.querySelectorAll("summary").forEach(node => node.replaceWith(`[${node.textContent}] `));
  doc.querySelectorAll("p, .by-paragraph, .by-source-paragraph, .by-dash-paragraph, .by-footnote-body").forEach(node => node.append("\n\n"));
  return (doc.body.textContent || "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
