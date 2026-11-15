import React, { act } from "react";
import { Window } from "happy-dom";
import { afterAll, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
const readerCss = readFileSync(new URL("./ben-yehuda.css", import.meta.url), "utf8");

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("@/lib/publishing-analytics", () => ({ trackPublishingEvent: vi.fn() }));
vi.mock("@/components/layout/page-shell", () => ({
  PageShell: ({ children }: any) => <main>{children}</main>,
  PageHeader: ({ title, children }: any) => <header><h1>{title}</h1>{children}</header>,
}));
vi.mock("wouter", () => ({ Link: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a> }));
afterAll(() => vi.unstubAllGlobals());

it("opens exact entries, collapses browse, persists independent options, follows neighbors and reports failures", async () => {
  const window = new Window({ url: "https://example.org/ben-yehuda?q=ה&rid=BY-03821" });
  for (const key of ["document", "navigator", "HTMLElement", "Node", "Event", "MouseEvent", "DOMParser", "localStorage", "sessionStorage"]) {
    vi.stubGlobal(key, (window as any)[key]);
  }
  vi.stubGlobal("window", window);
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => setTimeout(fn, 0));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify([{
    headword: "ה", rid: "BY-03821", parent_lexicon: "Ben Yehuda Dictionary",
    content: { definition: ['<p>אות<sup class="footnote-marker">1</sup><i class="footnote">הערה</i></p>'] },
    next_hw: "הֵא I",
  }])));
  vi.stubGlobal("fetch", fetcher);
  const { createRoot } = await import("react-dom/client");
  const { default: Page } = await import("./ben-yehuda");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const style = document.createElement("style");
  style.textContent = readerCss;
  document.head.appendChild(style);
  const root = createRoot(host);
  const settle = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
  try {
    await act(async () => root.render(<Page />));
    await settle();
    expect(fetcher.mock.calls[0][0]).toContain("rid=BY-03821");
    expect((host.querySelector("#ben-yehuda-browse-grid") as HTMLElement).hidden).toBe(true);
    expect((host.querySelector('[data-testid="display-options"]') as HTMLDetailsElement).open).toBe(true);
    expect(host.querySelector('[data-testid="suggestion-0"]')).toBeNull();
    expect(host.querySelector(".by-footnote summary")).not.toBeNull();
    const definition = window.document.querySelector('[data-testid="ben-yehuda-definition"]')!;
    const initialSize = window.getComputedStyle(definition).fontSize;
    await act(async () => (host.querySelector('[data-testid="checkbox-larger-text"]') as HTMLElement).click());
    const enlargedDefinition = window.document.querySelector('[data-testid="ben-yehuda-definition"]')!;
    expect(enlargedDefinition.classList.contains("text-lg")).toBe(true);
    const largerSize = window.getComputedStyle(enlargedDefinition).fontSize;
    expect(largerSize).not.toBe(initialSize);
    expect(["1.125rem", "18px"]).toContain(largerSize);
    expect(localStorage.getItem("ben-yehuda-larger-text")).toBe("true");
    await act(async () => (host.querySelector('[data-testid="checkbox-larger-text"]') as HTMLElement).click());
    expect(window.getComputedStyle(window.document.querySelector('[data-testid="ben-yehuda-definition"]')!).fontSize).toBe(initialSize);
    expect((host.querySelector('[data-testid="checkbox-split-dashes"]') as HTMLInputElement).checked).toBe(true);
    await act(async () => (host.querySelector('[data-testid="checkbox-split-dashes"]') as HTMLElement).click());
    expect(localStorage.getItem("ben-yehuda-split-dashes")).toBe("false");
    expect(host.querySelector('[data-testid="link-next-entry"]')?.closest("nav")?.dir).toBe("rtl");
    expect(host.querySelector("#ben-yehuda-browse-grid > div")?.getAttribute("dir")).toBe("rtl");
    await act(async () => (host.querySelector('[data-testid="checkbox-inline-notes"]') as HTMLElement).click());
    expect((host.querySelector(".by-footnote") as HTMLDetailsElement).open).toBe(true);
    expect(localStorage.getItem("ben-yehuda-inline-notes")).toBe("true");
    expect(localStorage.getItem("jastrow-display-options-open")).toBeNull();
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ code: "DICTIONARY_UNAVAILABLE", message: "Try again" }), { status: 503 }));
    await act(async () => (host.querySelector('[data-testid="link-next-entry"]') as HTMLElement).click());
    await settle();
    expect(fetcher.mock.calls.at(-1)?.[0]).toContain(encodeURIComponent("הֵא I"));
    expect(host.querySelector('[data-testid="status-dictionary-unavailable"]')).not.toBeNull();
    fetcher.mockResolvedValueOnce(new Response("[]"));
    await act(async () => (host.querySelector('[data-testid="button-retry-search"]') as HTMLElement).click());
    await settle();
    expect(host.querySelector('[data-testid="status-no-match"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="link-try-jastrow"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="link-try-bdb"]')).not.toBeNull();
  } finally {
    await act(async () => root.unmount());
    host.remove();
    style.remove();
    window.happyDOM.abort();
  }
});
