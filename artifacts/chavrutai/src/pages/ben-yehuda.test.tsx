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
  for (const key of ["document", "navigator", "HTMLElement", "Node", "Event", "MouseEvent", "DOMParser", "Element", "PointerEvent", "FocusEvent", "KeyboardEvent", "localStorage", "sessionStorage"]) {
    vi.stubGlobal(key, (window as any)[key]);
  }
  vi.stubGlobal("window", window);
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => setTimeout(fn, 0));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  const entryBody = JSON.stringify([{
    headword: "ה", rid: "BY-03821", parent_lexicon: "Ben Yehuda Dictionary",
    content: { definition: ['<p>אות, <span dir="rtl">עברית</span> עי׳ כאן<sup class="footnote-marker">1</sup><i class="footnote">הערה</i></p>'] },
    next_hw: "הֵא I",
  }]);
  const fetcher = vi.fn().mockImplementation(async () => new Response(entryBody));
  vi.stubGlobal("fetch", fetcher);
  const { createRoot } = await import("react-dom/client");
  const { default: Page } = await import("./ben-yehuda");
  const host = document.createElement("div");
  document.body.appendChild(host);
  const style = document.createElement("style");
  style.textContent = readerCss;
  document.head.appendChild(style);
  localStorage.setItem("ben-yehuda-larger-text", "true");
  let root = createRoot(host);
  const settle = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 120)); });
  try {
    await act(async () => root.render(<Page />));
    await settle();
    expect(fetcher.mock.calls[0][0]).toContain("rid=BY-03821");
    expect((host.querySelector("#ben-yehuda-browse-grid") as HTMLElement).hidden).toBe(true);
    expect((host.querySelector('[data-testid="display-options"]') as HTMLDetailsElement).open).toBe(true);
    expect(host.querySelector('[data-testid="suggestion-0"]')).toBeNull();
    expect(host.querySelector(".by-footnote summary")).not.toBeNull();
    const abbreviation = host.querySelector("button.bdb-abbreviation") as HTMLElement;
    await act(async () => abbreviation.focus());
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain("עיין");
    await act(async () => abbreviation.click());
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain("עיין");
    await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(document.querySelector("#bdb-abbreviation-explanation")).toBeNull();
    const entries = () => host.querySelector('[data-testid="ben-yehuda-definition"]')!.closest("[data-by-size]") as HTMLElement;
    expect(localStorage.getItem("ben-yehuda-larger-text")).toBeNull();
    expect(localStorage.getItem("ben-yehuda-text-size")).toBe("large");
    expect(entries().dataset.bySize).toBe("large");
    expect((host.querySelector('[data-testid="button-text-size-large"]') as HTMLElement).getAttribute("aria-checked")).toBe("true");
    await act(async () => (host.querySelector('[data-testid="button-text-size-large"]') as HTMLElement)
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })));
    expect(entries().style.getPropertyValue("--by-size")).toBe("1.3125rem");
    expect(localStorage.getItem("ben-yehuda-text-size")).toBe("extra-large");
    const fontSelect = host.querySelector('[data-testid="select-hebrew-font"]') as HTMLSelectElement;
    expect(fontSelect.value).toBe("assistant");
    expect(fontSelect.options.length).toBe(7);
    await act(async () => {
      fontSelect.value = "frank-ruehl";
      fontSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(localStorage.getItem("ben-yehuda-hebrew-font")).toBe("frank-ruehl");
    expect(entries().style.getPropertyValue("--by-font")).toContain("Frank Ruhl Libre");
    const definition = window.document.querySelector('[data-testid="ben-yehuda-definition"]')!;
    expect(window.getComputedStyle(definition).fontFamily).toContain("Frank Ruhl Libre");
    expect(window.getComputedStyle(definition.querySelector('span[dir="rtl"]')!).fontFamily).toContain("Frank Ruhl Libre");
    expect(readerCss).toContain("var(--by-font");
    const expand = host.querySelector('[data-testid="checkbox-expand-inline"]') as HTMLInputElement;
    expect(expand.checked).toBe(false);
    await act(async () => expand.click());
    expect(localStorage.getItem("ben-yehuda-expand-inline")).toBe("true");
    expect(host.textContent).not.toContain("describes the dictionary as public domain");
    expect(host.querySelectorAll("h2").length).toBeGreaterThan(0);
    expect([...host.querySelectorAll("h2, button")].filter(el => /browse by letter/i.test(el.textContent || "") && el.tagName === "H2").length).toBe(1);
    // Remount: preferences survive a reload.
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(<Page />));
    await settle();
    expect(entries().dataset.bySize).toBe("extra-large");
    expect((host.querySelector('[data-testid="select-hebrew-font"]') as HTMLSelectElement).value).toBe("frank-ruehl");
    expect((host.querySelector('[data-testid="checkbox-expand-inline"]') as HTMLInputElement).checked).toBe(true);
    localStorage.setItem("ben-yehuda-text-size", "huge");
    localStorage.setItem("ben-yehuda-hebrew-font", "comic");
    await act(async () => root.unmount());
    root = createRoot(host);
    await act(async () => root.render(<Page />));
    await settle();
    expect(localStorage.getItem("ben-yehuda-text-size")).toBe("medium");
    expect(localStorage.getItem("ben-yehuda-hebrew-font")).toBe("assistant");
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
