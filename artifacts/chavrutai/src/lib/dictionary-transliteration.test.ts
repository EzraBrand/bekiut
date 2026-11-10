import { afterEach, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import { annotateTransliterationsInHtml } from "./dictionary-format";

afterEach(() => vi.unstubAllGlobals());

it("does not transliterate abbreviation tokens or Greek markers, but still annotates Greek prose", () => {
  const window = new Window();
  vi.stubGlobal("window", window);
  vi.stubGlobal("NodeFilter", window.NodeFilter);
  vi.stubGlobal("DOMParser", window.DOMParser);
  // Real Greek input must pass the fast character check before the DOM walk.
  // Nested emphasis also verifies closest() protects abbreviation descendants.
  const html = '<button data-bdb-expansion="Psalms">ψ</button>|' +
    '<span data-bdb-expansion="Psalms"><em>Ψ</em></span>|' +
    '<span data-bdb-greek-marker>α.</span>|<em>λόγος</em>';
  const result = annotateTransliterationsInHtml(html);
  const doc = new window.DOMParser().parseFromString(result, "text/html");
  expect(doc.body.textContent).toMatch(/^ψ\|Ψ\|α\.\|λόγος \[/);
  expect(doc.querySelector("button")?.textContent).toBe("ψ");
  expect(doc.querySelector("[data-bdb-expansion] em")?.textContent).toBe("Ψ");
  expect(doc.querySelector("[data-bdb-greek-marker]")?.textContent).toBe("α.");
  expect(result).not.toContain("[ps]");
  expect(annotateTransliterationsInHtml(result)).toBe(result);
});
