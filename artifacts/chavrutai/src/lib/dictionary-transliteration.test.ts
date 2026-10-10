import { afterEach, expect, it, vi } from "vitest";
import { annotateTransliterationsInHtml } from "./dictionary-format";

afterEach(() => vi.unstubAllGlobals());

it("does not transliterate abbreviation tokens or Greek markers, but still annotates Greek prose", () => {
  // Minimal DOM adapter exercises the production text-node walk without a
  // browser dependency. closest represents ancestor matching, including nested tags.
  const nodes = [
    { nodeValue: "ψ", parentElement: { tagName: "BUTTON", closest: () => ({}) } },
    { nodeValue: "Ψ", parentElement: { tagName: "EM", closest: () => ({}) } },
    { nodeValue: "α.", parentElement: { tagName: "SPAN", closest: () => ({}) } },
    { nodeValue: "λόγος", parentElement: { tagName: "EM", closest: () => null } },
  ];
  const root = { get innerHTML() { return nodes.map(n => n.nodeValue).join("|"); } };
  vi.stubGlobal("window", {});
  vi.stubGlobal("NodeFilter", { SHOW_TEXT: 4 });
  vi.stubGlobal("DOMParser", class {
    parseFromString() {
      let i = 0;
      return {
        getElementById: () => root,
        createTreeWalker: () => ({ nextNode: () => nodes[i++] ?? null }),
      };
    }
  });
  const result = annotateTransliterationsInHtml("fixture");
  expect(result).toMatch(/^ψ\|Ψ\|α\.\|λόγος \[/);
  expect(result).not.toContain("[ps]");
});
