import React, { act } from "react";
import { Window } from "happy-dom";
import { afterEach, expect, it, vi } from "vitest";
import { HebrewSelectionLookup } from "./hebrew-selection-lookup";
import { readFileSync } from "node:fs";
const lookupCss = readFileSync(new URL("./hebrew-selection-lookup.css", import.meta.url), "utf8");

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it("top-docks mobile lookup cards with scrolling and keeps desktop bottom docking", () => {
  const win = new Window();
  win.happyDOM.setWindowSize({ width: 393, height: 750 });
  const style = win.document.createElement("style");
  // happy-dom mis-evaluates comma-separated media queries as AND. Exercise
  // the width branch in isolation; browsers apply either branch (OR).
  expect(lookupCss).toContain("@media (max-width: 639px), (pointer: coarse)");
  style.textContent = lookupCss.replace(
    "@media (max-width: 639px), (pointer: coarse)", "@media (max-width: 639px)",
  );
  win.document.head.append(style);
  const card = win.document.createElement("div");
  card.className = "hebrew-selection-lookup";
  win.document.body.append(card);
  const mobile = win.getComputedStyle(card);
  expect(mobile.bottom).toBe("auto");
  expect(mobile.top).toContain("safe-area-inset-top");
  expect(mobile.maxHeight).toContain("160px");
  expect(mobile.overflowY).toBe("auto");
  expect(mobile.overscrollBehavior).toBe("contain");
  // Use a fresh document: happy-dom retains computed media styles on resize.
  const desktopWindow = new Window();
  desktopWindow.happyDOM.setWindowSize({ width: 1280, height: 900 });
  const desktopStyle = desktopWindow.document.createElement("style");
  desktopStyle.textContent = style.textContent;
  desktopWindow.document.head.append(desktopStyle);
  const desktopCard = desktopWindow.document.createElement("div");
  desktopCard.className = "hebrew-selection-lookup";
  desktopWindow.document.body.append(desktopCard);
  const desktop = desktopWindow.getComputedStyle(desktopCard);
  expect(desktop.bottom).toBe("12px");
  expect(desktop.maxHeight).toBe("45dvh");
  expect(desktop.width).toBe("448px");
});

it("loads only on click, ignores late results, preserves selection and supports keyboard dismissal", async () => {
  const win = new Window({ url: "https://example.com/talmud/Berakhot/2a" });
  for (const key of ["window", "document", "navigator", "HTMLElement", "Node", "NodeFilter", "DOMParser", "Event", "MouseEvent", "KeyboardEvent"]) {
    vi.stubGlobal(key, key === "window" ? win : (win as any)[key]);
  }
  vi.stubGlobal("React", React);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers();
  let resolve!: (response: Response) => void;
  const fetch = vi.fn((_input: string, _init?: RequestInit) => new Promise<Response>(done => { resolve = done; }));
  vi.stubGlobal("fetch", fetch);
  const { createRoot } = await import("react-dom/client");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const ref = React.createRef<HTMLDivElement>();
  await act(async () => root.render(<div ref={ref} tabIndex={-1}>
    <p data-hebrew-lookup-ref="Berakhot 2a"><span id="one">מאימתי</span> <span id="two">קורין שמע</span></p>
    <HebrewSelectionLookup root={ref} />
  </div>));
  async function select(id: string) {
    await act(async () => {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(id)!);
      window.getSelection()!.removeAllRanges();
      window.getSelection()!.addRange(range);
      document.dispatchEvent(new Event("selectionchange"));
      vi.advanceTimersByTime(351);
    });
  }
  await select("one");
  expect(fetch).not.toHaveBeenCalled();
  const jastrow = [...document.querySelectorAll("button")].find(b => b.textContent === "Jastrow")!;
  await act(async () => jastrow.click());
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(document.body.textContent).toContain("Loading Jastrow");
  expect(window.getSelection()!.toString()).toBe("מאימתי");
  await select("two");
  await act(async () => resolve(new Response(JSON.stringify([{headword:"stale",content:{senses:[{definition:"old result"}]}}]))));
  expect(document.body.textContent).not.toContain("old result");
  expect(document.body.textContent).toContain("Ask Google AI");
  const google = document.querySelector<HTMLAnchorElement>('a[href*="udm=50"]')!;
  expect(new URL(google.href).searchParams.get("q")).toContain("Berakhot 2a");
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", {key:"Tab",cancelable:true})));
  expect(document.activeElement?.textContent).toBe("Close");
  await act(async () => document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape"})));
  expect(document.querySelector('[aria-label="Hebrew selection lookup"]')).toBeNull();
  expect(window.getSelection()!.toString()).toBe("קורין שמע");
  expect(document.activeElement).toBe(ref.current);
  // Wiktionary is now an in-page action and uses the same request guard.
  await select("one");
  const wiki = [...document.querySelectorAll("button")].find(b => b.textContent === "English Wiktionary")!;
  expect(wiki).toBeTruthy();
  await act(async () => wiki.click());
  expect(fetch.mock.calls[1][0]).toContain("en.wiktionary.org/api/rest_v1/page/definition/");
  await act(async () => resolve(new Response(JSON.stringify({
    he: [{ language: "Hebrew", partOfSpeech: "Adverb", definitions: [{definition:"from when"}] }],
  }))));
  expect(document.body.textContent).toContain("from when");
  expect(document.body.textContent).toContain("CC BY-SA 4.0");
  expect(document.body.textContent).toContain("Search Wiktionary");
  await act(async () => root.unmount());
});
