import React, { act } from "react";
import { Window } from "happy-dom";
import { afterEach, expect, it, vi } from "vitest";
import { useReaderPreference } from "./use-reader-preference";

afterEach(() => vi.unstubAllGlobals());

it("defaults open, persists choices across remounts, and migrates session settings", async () => {
  const window = new Window({ url: "https://example.com" });
  for (const key of ["window", "document", "navigator", "HTMLElement", "Node", "localStorage", "sessionStorage"]) {
    vi.stubGlobal(key, key === "window" ? window : (window as any)[key]);
  }
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const { createRoot } = await import("react-dom/client");
  let preference!: ReturnType<typeof useReaderPreference>;
  function Harness({ name, initial }: { name: string; initial: boolean }) {
    preference = useReaderPreference(name, initial);
    return null;
  }
  const root = createRoot(document.createElement("div"));
  for (const dictionary of ["bdb", "jastrow"]) {
    const name = `${dictionary}-display-options-open`;
    await act(async () => root.render(<Harness key={name} name={name} initial={true} />));
    expect(preference[0]).toBe(true);
    await act(async () => preference[1](false));
    await act(async () => root.render(null));
    await act(async () => root.render(<Harness name={name} initial={true} />));
    expect(preference[0]).toBe(false);
  }
  for (const name of ["bdb-expand-inline", "bdb-split-by-semicolon", "jastrow-expand-inline", "jastrow-extra-splits"]) {
    sessionStorage.setItem(name, "true");
    await act(async () => root.render(<Harness key={name} name={name} initial={false} />));
    expect(preference[0]).toBe(true);
    expect(localStorage.getItem(name)).toBe("true");
    await act(async () => preference[1](false));
    await act(async () => root.render(null));
    await act(async () => root.render(<Harness name={name} initial={false} />));
    expect(preference[0]).toBe(false);
  }
  await act(async () => root.unmount());
});
