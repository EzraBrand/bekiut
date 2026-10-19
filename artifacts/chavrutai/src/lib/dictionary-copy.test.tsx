import { afterEach, expect, it, vi } from "vitest";
import { Window } from "happy-dom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expandAbbreviations, useDictionaryCopyHandler } from "./dictionary-format";
import { structureJastrowDefinition } from "./jastrow-presentation";
import mappings from "@/shared/data/lexicon-mappings/jastrow.json";

afterEach(() => vi.unstubAllGlobals());

it("keeps Jastrow paragraph breaks in both clipboard formats with both options enabled", async () => {
  const win = new Window();
  for (const key of ["document", "Node", "NodeFilter", "HTMLElement", "Event", "DOMParser"] as const) vi.stubGlobal(key, win[key]);
  vi.stubGlobal("window", win);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const html = expandAbbreviations(
    structureJastrowDefinition("<i>first</i> tradit. — <i>second</i> pronunc.", "copy-entry", true).html,
    mappings.mappings,
  );
  function Entry() {
    useDictionaryCopyHandler("#copy-entry", []);
    return <div id="copy-entry" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  const root = createRoot(host);
  try {
    await act(async () => root.render(<Entry />));
    const entry = host.firstElementChild!;
    const range = document.createRange();
    range.selectNodeContents(entry);
    window.getSelection()!.addRange(range);
    const values: Record<string, string> = {};
    const event = new Event("copy", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: {
      setData: (type: string, value: string) => { values[type] = value; },
    } });
    entry.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(values["text/html"]).toContain("<br><br>");
    expect(values["text/html"]).toContain("<i");
    expect(values["text/plain"]).toContain("\n\n");
    expect(values["text/plain"]).toContain("traditional");
    expect(values["text/plain"]).toContain("pronunciation");
    expect(values["text/plain"]).not.toMatch(/<[^>]+>/);
  } finally {
    await act(async () => root.unmount());
    host.remove();
  }
});
