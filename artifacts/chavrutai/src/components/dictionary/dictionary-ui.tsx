import type { ReactNode } from "react";
import { Link } from "wouter";
import { DICTIONARY_LABELS, dictionaryQueryHref, otherDictionary, type DictionaryId, type DictionarySearchFailure } from "@/lib/dictionary-search";

/** Compact disclosure holding reader display settings. */
export function DisplayOptions({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <details className="group text-sm" data-testid="display-options">
      <summary className="cursor-pointer list-none text-muted-foreground hover:text-foreground select-none" data-testid="button-display-options">
        <span aria-hidden="true" className="inline-block transition-transform group-open:rotate-90 mr-1">▸</span>
        Display options
      </summary>
      <div className="mt-2 flex flex-col gap-2 rounded border border-border bg-card px-3 py-2">
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </details>
  );
}

function OtherDictionaryLink({ current, query }: { current: DictionaryId; query: string }) {
  const other = otherDictionary(current);
  const meta = DICTIONARY_LABELS[other];
  return (
    <p className="mt-4 text-sm text-muted-foreground">
      Try{" "}
      <Link href={dictionaryQueryHref(other, query)} className="text-primary hover:underline" data-testid={`link-try-${other}`}>
        {meta.name} — {meta.scope}
      </Link>
      {query.trim() && <> for <span className="font-hebrew" dir="rtl">{query.trim()}</span></>}
    </p>
  );
}

export function DictionarySearchNotice({
  dictionary, query, failure, linkedEntryMissing, onRetry, children,
}: {
  dictionary: DictionaryId;
  query: string;
  failure: DictionarySearchFailure | null;
  linkedEntryMissing?: boolean;
  onRetry: () => void;
  children?: ReactNode;
}) {
  if (failure) {
    const unavailable = failure.kind === "unavailable";
    return (
      <div className="border border-border rounded p-8 text-center" role="alert" data-testid={unavailable ? "status-dictionary-unavailable" : "status-dictionary-error"}>
        <p className="font-georgia text-lg text-foreground mb-1">
          {unavailable ? "Dictionary service unavailable" : "Search could not be completed"}
        </p>
        <p className="text-sm text-muted-foreground">
          {failure.message} {unavailable ? "This is not a missing entry — please try again shortly." : ""}
        </p>
        <button type="button" onClick={onRetry} className="mt-4 px-4 py-1.5 text-sm rounded bg-primary text-primary-foreground" data-testid="button-retry-search">
          Retry
        </button>
        <OtherDictionaryLink current={dictionary} query={query} />
      </div>
    );
  }
  return (
    <div className="border border-border rounded p-8 text-center" data-testid={linkedEntryMissing ? "status-linked-entry-missing" : "status-no-match"}>
      <p className="text-muted-foreground">
        {linkedEntryMissing
          ? "The linked entry could not be resolved. Try searching the headword instead."
          : "No entries found. Try a different search term or browse by letter."}
      </p>
      {children}
      <OtherDictionaryLink current={dictionary} query={query} />
    </div>
  );
}
