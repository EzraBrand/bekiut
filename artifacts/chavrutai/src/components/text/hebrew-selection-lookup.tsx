import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { readHebrewSelection, googleSelectionHref, wiktionaryHref, type HebrewSelection } from "@/lib/hebrew-selection";
import { DICTIONARY_LABELS, type DictionaryId } from "@/lib/dictionary-search";
import { fetchSelectionDictionary, type DictionaryPreview } from "@/lib/selection-dictionary";
import { LatestRequest } from "@/lib/latest-request";
import { fetchWiktionaryPreview, type WiktionaryLanguage } from "@/lib/wiktionary-preview";

type LookupId = DictionaryId | "wiktionary-en" | "wiktionary-he";
const labels: Record<LookupId, string> = {
  jastrow: DICTIONARY_LABELS.jastrow.name, bdb: DICTIONARY_LABELS.bdb.name,
  "ben-yehuda": DICTIONARY_LABELS["ben-yehuda"].name,
  "wiktionary-en": "English Wiktionary", "wiktionary-he": "Hebrew Wiktionary",
};
const wikiLanguage = (id: LookupId): WiktionaryLanguage | null => id === "wiktionary-en" ? "en" : id === "wiktionary-he" ? "he" : null;
type Result = { id: LookupId; loading?: boolean; entries?: DictionaryPreview[]; error?: string };
const actionClass = "rounded-sm border border-border px-3 py-2 text-sm hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

export function HebrewSelectionLookup({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const [selection, setSelection] = useState<HebrewSelection | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const current = useRef<HebrewSelection | null>(null);
  const dismissed = useRef("");
  const requests = useRef(new LatestRequest());
  const priorFocus = useRef<HTMLElement | null>(null);
  const entered = useRef(false);
  const signature = (value: HebrewSelection | null) => value ? `${value.reference}:${value.original}` : "";
  const close = () => {
    dismissed.current = signature(current.current);
    requests.current.invalidate();
    if (panel.current?.contains(document.activeElement)) priorFocus.current?.focus({ preventScroll: true });
    current.current = null;
    setSelection(null);
    setResult(null);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const changed = () => {
      // Toolbar focus must not destroy the native passage selection.
      const native = window.getSelection();
      if (panel.current?.contains(document.activeElement) &&
          (!native || native.isCollapsed || panel.current.contains(native.anchorNode))) return;
      const next = root.current ? readHebrewSelection(native, root.current) : null;
      if (!next) dismissed.current = "";
      if (signature(next) === signature(current.current)) return;
      clearTimeout(timer);
      requests.current.invalidate();
      current.current = null;
      setSelection(null);
      setResult(null);
      entered.current = false;
      timer = setTimeout(() => {
        if (!next) dismissed.current = "";
        if (signature(next) === dismissed.current) return;
        if (next) priorFocus.current = root.current;
        current.current = next;
        setSelection(next);
      }, 350);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") { clearTimeout(timer); close(); }
      if (event.key === "Tab" && !event.shiftKey && !entered.current && current.current && !panel.current?.contains(document.activeElement)) {
        event.preventDefault();
        entered.current = true;
        panel.current?.querySelector<HTMLElement>("button,a")?.focus({ preventScroll: true });
      }
    };
    const outside = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node)) {
        clearTimeout(timer);
        close();
      }
    };
    document.addEventListener("selectionchange", changed);
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      clearTimeout(timer);
      requests.current.invalidate();
      document.removeEventListener("selectionchange", changed);
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [root]);

  async function lookup(id: LookupId) {
    if (!selection) return;
    const request = requests.current.begin();
    setResult({ id, loading: true });
    try {
      const language = wikiLanguage(id);
      const entries = language
        ? await fetchWiktionaryPreview(language, selection.lookup, request.signal)
        : await fetchSelectionDictionary(id as DictionaryId, selection.lookup, request.signal);
      if (request.isCurrent()) setResult({ id, entries });
    } catch (error) {
      if (request.isCurrent()) setResult({ id, error: error instanceof Error ? error.message : "Lookup failed. Please retry." });
    }
  }

  if (!selection) return null;
  return createPortal(
    <div ref={panel} role="region" aria-label="Hebrew selection lookup" dir="ltr"
      className="fixed z-[60] bottom-3 left-3 right-3 sm:left-auto sm:w-[28rem] rounded-sm border border-border bg-card text-foreground shadow-lg p-3 text-base max-h-[45dvh] overflow-y-auto"
      onMouseDown={event => { if ((event.target as HTMLElement).closest("button,a")) event.preventDefault(); }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0"><p className="text-xs text-muted-foreground">{selection.reference}</p>
          <p dir="rtl" className="font-hebrew break-words line-clamp-2">{selection.original}</p></div>
        <button className={actionClass} onClick={close} aria-label="Dismiss lookup">Close</button>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lookup actions">
        {selection.words === 1 ? <>
          {(["jastrow", "ben-yehuda", "bdb", "wiktionary-en", "wiktionary-he"] as const).map(id => <button key={id} className={actionClass}
            aria-pressed={result?.id === id} onClick={() => lookup(id)}>{labels[id]}</button>)}
        </> : <>
          <a className={actionClass} href={googleSelectionHref(selection)} target="_blank" rel="noopener noreferrer">Ask Google AI ↗</a>
          <a className={actionClass} href={googleSelectionHref(selection, false)} target="_blank" rel="noopener noreferrer">Google Search ↗</a>
          <p className="text-xs text-muted-foreground">Opens a new tab. AI Mode depends on Google’s region and account support.</p>
        </>}
      </div>
      {result && <section className="mt-3 border-t border-border pt-3" aria-live="polite" aria-busy={!!result.loading}>
        <h2 className="font-medium">{labels[result.id]}</h2>
        {result.loading && <p>Loading {labels[result.id]}…</p>}
        {result.error && <p role="alert">{result.error} <button className="underline" onClick={() => lookup(result.id)}>Retry</button></p>}
        {result.entries?.length === 0 && <p>No entries found for <bdi>{selection.lookup}</bdi>. No prefixes or roots were guessed.</p>}
        {result.entries?.map((entry, index) => <article key={`${entry.identity}:${index}`} className="mt-3 border-t border-border pt-2">
          <h3><bdi className="font-hebrew text-lg">{entry.headword}</bdi>
            {result.entries!.length > 1 && <span className="text-xs ml-2">Entry {index + 1} of {result.entries!.length}{entry.identity ? ` · ${entry.identity}` : ""}</span>}</h3>
          {entry.label && <p className="text-xs text-muted-foreground">{entry.label}</p>}
          <p dir={result.id === "ben-yehuda" || result.id === "wiktionary-he" ? "rtl" : "auto"} className="leading-relaxed break-words">{entry.excerpt || "No short definition available."}</p>
          <a className="underline text-sm" href={entry.href} target="_blank" rel="noopener noreferrer">Full entry ↗</a>
        </article>)}
        {wikiLanguage(result.id) && <div className="mt-3 text-xs text-muted-foreground space-y-2">
          <p className="flex gap-3">
            <a className="underline" href={wiktionaryHref(wikiLanguage(result.id)!, selection.lookup)} target="_blank" rel="noopener noreferrer">Open Wiktionary page ↗</a>
            <a className="underline" href={wiktionaryHref(wikiLanguage(result.id)!, selection.lookup, true)} target="_blank" rel="noopener noreferrer">Search Wiktionary ↗</a>
          </p>
          {!!result.entries?.length && <p>Excerpted from {labels[result.id]} contributors; formatting shortened.{" "}
            <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>.
            {" "}See full entry and its history for attribution.</p>}
        </div>}
      </section>}
    </div>, document.body);
}
