import React, { act } from "react";
import { Window } from "happy-dom";
import { afterAll, expect, it, vi } from "vitest";

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/lib/lexicon-index", () => ({
  normalizeHebrew: (text: string) => text.replace(/[\u0591-\u05c7]/g, ""),
  useLexiconIndex: () => ({
    headwords: ["לֶקֶט", "לָאָה"], normalized: ["לקט", "לאה"],
    total: 2, perLetterCounts: { ל: 2 },
  }),
}));
vi.mock("wouter", () => ({
  Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
  Redirect: () => null,
}));
vi.mock("@/components/layout", () => ({
  PageShell: ({ children }: any) => <main>{children}</main>,
  SectionHeading: ({ children }: any) => <h2>{children}</h2>,
}));
afterAll(() => vi.unstubAllGlobals());

it("shows local metadata, preserves entry links, toggles details, and limits the experiment to Jastrow ל", async () => {
  const window = new Window({ url: "https://example.org/jastrow/headwords/ל" });
  for (const key of ["window", "document", "navigator", "HTMLElement", "Node", "Event", "MouseEvent"]) {
    vi.stubGlobal(key, key === "window" ? window : (window as any)[key]);
  }
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const { createRoot } = await import("react-dom/client");
  const { default: Page } = await import("./lexicon-headwords");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await act(async () => {
      root.render(<Page lexiconKey="jastrow" letter="ל" />);
    });
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
    expect(host.textContent).toContain("133 words");
    expect(host.textContent).toContain("See");
    expect(host.querySelector('a[href*="rid=L00679"]')).not.toBeNull();
    expect(host.querySelector(`a[href="/jastrow?q=${encodeURIComponent("לאי")}"]`)).not.toBeNull();
    await act(async () => (host.querySelector('input[type="checkbox"]') as HTMLElement).click());
    expect(host.textContent).not.toContain("133 words");
    expect(host.querySelector('a[href*="rid=L00679"]')).not.toBeNull();
    await act(async () => root.render(<Page lexiconKey="jastrow" letter="מ" />));
    expect(host.textContent).not.toContain("Show entry details");
    await act(async () => root.render(<Page lexiconKey="bdb" letter="ל" />));
    expect(host.textContent).not.toContain("Show entry details");
  } finally {
    await act(async () => root.unmount());
    host.remove();
    window.happyDOM.abort();
  }
});
