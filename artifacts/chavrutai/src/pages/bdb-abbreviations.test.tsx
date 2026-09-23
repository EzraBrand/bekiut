import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ query: "" }));
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useState: (initial: unknown) => actual.useState(initial === "" ? state.query : initial),
  };
});
vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@workspace/shared-data/seo-data", () => ({ getStaticSEO: () => ({}) }));
vi.mock("@workspace/shared-data/mapping-resources", () => ({ getMappingResourceStructuredData: () => null }));
vi.mock("@/components/layout", () => ({
  PageShell: ({ children }: React.PropsWithChildren) => <main>{children}</main>,
  PageHeader: ({ children }: React.PropsWithChildren) => <header>{children}</header>,
}));
vi.mock("@/components/mapping-resource-links", () => ({ MappingResourceLinks: () => null }));
vi.mock("@/lib/bdb-table", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/bdb-table")>();
  return { ...actual, getBdbTableRows: () => [
    { abbr: "test", expansion: "Test expansion", category: "Grammar", references: [
      { title: "Named work", source: "Wikipedia", url: "https://en.wikipedia.org/wiki/Work" },
      { title: "Second entry", source: "Wiktionary", url: "https://en.wiktionary.org/wiki/work" },
    ] },
    { abbr: "empty", expansion: "No reference", category: "Unclassified", references: [] },
  ] };
});

import BdbAbbreviations from "./bdb-abbreviations";

describe("BDB abbreviation table markup", () => {
  it("renders five columns, named safe external links, missing links, and row numbering", () => {
    state.query = "";
    vi.stubGlobal("React", React);
    vi.stubGlobal("window", { location: { origin: "https://example.org" } });
    const html = renderToStaticMarkup(<BdbAbbreviations />);
    expect(html.match(/scope="col"/g)).toHaveLength(10);
    expect(html).toContain('data-testid="sort-category"');
    expect(html).toContain('data-testid="select-category"');
    expect(html).toContain('<option value="all" selected="">All categories</option>');
    expect(html).toContain('<option value="Grammar">Grammar</option>');
    expect(html).toContain('<option value="Unclassified">Unclassified</option>');
    expect(html).toContain("External link");
    expect(html).toContain('href="https://en.wikipedia.org/wiki/Work" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain(">Named work</a>");
    expect(html).not.toContain(">Second entry</a>");
    expect(html).toContain(">—</span>");
    expect(html).toContain(">1</td>");
    expect(html).toContain(">2</td>");
    expect(html).toContain('aria-sort="ascending"');
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("dark:text-");
    vi.unstubAllGlobals();
  });

  it("renders a five-column empty state and updates the visible count", () => {
    state.query = "no-such-mapping";
    vi.stubGlobal("React", React);
    vi.stubGlobal("window", { location: { origin: "https://example.org" } });
    const html = renderToStaticMarkup(<BdbAbbreviations />);
    expect(html).toContain('colSpan="5"');
    expect(html).toContain("No matches.");
    expect(html).toContain("Showing 0 of 2");
    expect(html).not.toContain('data-testid="row-0"');
    state.query = "";
    vi.unstubAllGlobals();
  });
});