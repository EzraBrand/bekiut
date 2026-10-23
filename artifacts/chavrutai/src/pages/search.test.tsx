import React, { act } from "react";
import { Window } from "happy-dom";
import { afterAll, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/hooks/use-seo", () => ({ useSEO: vi.fn() }));
vi.mock("wouter", () => ({ useLocation: () => ["/search", vi.fn()] }));
vi.mock("@/lib/publishing-analytics", () => ({ trackPublishingEvent: vi.fn() }));
vi.mock("@/components/layout", () => ({
  PageShell: ({ children }: any) => <main>{children}</main>,
  PageHeader: ({ children }: any) => <header>{children}</header>,
  SectionHeading: ({ children }: any) => <h2>{children}</h2>,
}));
afterAll(() => vi.unstubAllGlobals());

it("scrolls and focuses the results after Next loads and when Previous uses cached results", async () => {
  const window = new Window({ url: "https://example.com/search?q=Moses" });
  for (const key of ["window", "document", "navigator", "HTMLElement", "Node", "Event", "MouseEvent"]) {
    vi.stubGlobal(key, key === "window" ? window : (window as any)[key]);
  }
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("React", React);
  const scroll = vi.fn();
  window.HTMLElement.prototype.scrollIntoView = scroll;
  let release: (() => void) | undefined;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    const page = Number(new URL(url, window.location.origin).searchParams.get("page"));
    if (page === 2) await new Promise<void>(resolve => { release = resolve; });
    return { ok: true, json: async () => ({
      results: [{ ref: `Genesis 1:${page}`, text: "Moses", type: "bible" }],
      query: "Moses", total: 30, totalIsApproximate: true, totalPages: 2, page, pageSize: 15,
    }) };
  }));
  const { createRoot } = await import("react-dom/client");
  const { default: Search } = await import("./search");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } });
  const settle = async () => act(async () => { await new Promise(resolve => setTimeout(resolve, 30)); });
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><Search /></QueryClientProvider>));
    await settle();
    expect(scroll).not.toHaveBeenCalled();
    await act(async () => (host.querySelector('[data-testid="button-next-page"]') as HTMLElement).click());
    expect(scroll).not.toHaveBeenCalled();
    await act(async () => release!());
    await settle();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Search results");
    expect(host.textContent).toContain("Approximately 30 results");
    await act(async () => (host.querySelector('[data-testid="button-prev-page"]') as HTMLElement).click());
    expect(scroll).toHaveBeenCalledTimes(2);
  } finally {
    await act(async () => root.unmount());
    client.clear();
    host.remove();
    window.happyDOM.abort();
  }
});
