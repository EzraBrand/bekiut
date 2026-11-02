import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ToolsNav } from "./tools-nav";
import { DictionariesNav } from "./dictionaries-nav";

// Render portalled content for structural tests. Interaction remains owned by Radix.
vi.mock("@/components/ui/dropdown-menu", () => {
  const Wrapper = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
  return {
    DropdownMenu: Wrapper, DropdownMenuTrigger: Wrapper,
    DropdownMenuContent: Wrapper, DropdownMenuGroup: Wrapper,
    DropdownMenuLabel: Wrapper, DropdownMenuItem: Wrapper,
  };
});
vi.mock("wouter", () => ({
  Link: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

describe("approved grouped navigation", () => {
  it("contains all seven real tool destinations, in order, under two groups", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(<ToolsNav />);
    expect(html).toContain("<h2>Tools</h2>");
    expect(html).toContain("Indexes &amp; reference");
    expect(html).toContain("Explore &amp; read");
    expect([...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])).toEqual([
      "/term-index", "/mishnah-map", "/biblical-index", "/sugya-viewer",
      "/places", "/suggested-pages", "/scholarship",
    ]);
    expect(html).not.toContain("Find a new");
    vi.unstubAllGlobals();
  });
  it("uses the plain Dictionaries heading and retains each scope", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(<DictionariesNav />);
    expect(html).toContain("<h2>Dictionaries</h2>");
    expect(html).toContain('href="/jastrow"');
    expect(html).toContain('href="/bdb"');
    expect(html).toContain("Rabbinic Hebrew and Aramaic");
    expect(html).toContain("Biblical Hebrew");
    expect(html).not.toContain("Find the right meaning");
    expect(html).not.toContain("Two dictionaries");
    vi.unstubAllGlobals();
  });
});
