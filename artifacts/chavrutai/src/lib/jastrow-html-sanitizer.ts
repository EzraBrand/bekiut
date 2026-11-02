const allowedTags = new Set(["A", "B", "BR", "BUTTON", "EM", "I", "SPAN", "STRONG", "SUB", "SUP", "SMALL"]);
const allowedClasses = new Set([
  "dict-expanded", "bdb-abbreviation", "jastrow-paragraph-break",
  "font-medium", "scroll-mt-24", "refLink",
]);
const safeHref = /^(?:https?:\/\/|\/(?!\/)|#)/i;
const bdbClasses = new Set([
  "bdb-paragraph", "bdb-paragraph-first", "bdb-semicolon-segment",
  "bdb-semicolon-first", "scroll-mt-20",
]);

function restrictNode(node: Node, bdb: boolean) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 8) {
      child.parentNode?.removeChild(child);
      continue;
    }
    if (child.nodeType !== 1) continue;
    const element = child as Element;
    if (!allowedTags.has(element.tagName) && !(bdb && element.tagName === "P")) {
      // Source dictionary HTML has no other structural tags. Drop unsupported
      // elements with their children, including active SVG/MathML/iframe trees.
      element.remove();
      continue;
    }
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      const allowed =
        (name === "href" && element.tagName === "A" && safeHref.test(value) && !/[\\\u0000-\u0020]/.test(value)) ||
        (name === "class" && value.split(/\s+/).every(token => allowedClasses.has(token) || (bdb && bdbClasses.has(token)))) ||
        (name === "id" && (bdb ? /^sense-[\p{L}\p{N}_-]+$/u : /^jastrow-[\w-]+$/).test(value)) ||
        (name === "dir" && /^(?:rtl|ltr|auto)$/.test(value)) ||
        (name === "type" && element.tagName === "BUTTON" && value === "button") ||
        (name === "aria-haspopup" && element.tagName === "BUTTON" && value === "dialog") ||
        (name === "aria-hidden" && value === "true") ||
        ((name === "data-bdb-source" || name === "data-bdb-expansion" ||
          name === "data-bdb-greek-marker") && ["BUTTON", "SPAN"].includes(element.tagName));
      if (!allowed) element.removeAttribute(attr.name);
    }
    restrictNode(element, bdb);
  }
}

/** Sanitize the final rendered fragment, including generated buttons and anchors. */
export function sanitizeJastrowHtml(html: string): string {
  return sanitizeDictionaryHtml(html, false);
}

export function sanitizeBdbHtml(html: string): string {
  return sanitizeDictionaryHtml(html, true);
}

function sanitizeDictionaryHtml(html: string, bdb: boolean): string {
  if (typeof window === "undefined") return "";
  const parsed = new DOMParser().parseFromString(
    `<div id="jastrow-safe-root">${html}</div>`, "text/html",
  );
  const safe = parsed.getElementById("jastrow-safe-root");
  if (!safe) return "";
  // Strict tag and attribute allowlists keep transformed source HTML inert.
  // In particular, protocol-relative and non-HTTP links are not app links.
  restrictNode(safe, bdb);
  return safe.innerHTML;
}
