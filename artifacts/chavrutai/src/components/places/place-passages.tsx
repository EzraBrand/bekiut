import { useEffect, useState } from "react";
import { Link } from "wouter";
import type { Place } from "@/lib/places";
import { fetchPlacePassages, placePassageLink, placePassageQueries, type PlacePassageResponse } from "@/lib/place-passages";

function PassageExcerpt({ text }: { text: string }) {
  // Render search highlights as React text, never as untrusted HTML.
  return <p className="text-sm leading-relaxed">{
    text.split(/(<(?:em|mark)>[\s\S]*?<\/(?:em|mark)>)/g).map((part, index) => {
      const clean = part.replace(/<[^>]*>/g, "");
      return /^<(?:em|mark)>/.test(part)
        ? <mark key={index} className="bg-yellow-100 dark:bg-yellow-900/50 text-inherit">{clean}</mark>
        : <span key={index}>{clean}</span>;
    })
  }</p>;
}

function PassageResults({ place }: { place: Place }) {
  const queries = placePassageQueries(place);
  const [query, setQuery] = useState(queries[0]);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState<PlacePassageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    setData(null);
    fetchPlacePassages(query, page, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, page, retry]);

  return <section aria-label={`Talmud passages for ${place.name}`} data-testid="place-passages">
    <div className="flex flex-wrap justify-between items-baseline gap-3 mb-3">
      <h3 className="font-georgia text-xl">Talmud passages</h3>
      <Link href={`/search?q=${encodeURIComponent(query)}&type=talmud`} className="text-sm underline text-primary">
        Open full search
      </Link>
    </div>
    {queries.length > 1 && <label className="flex flex-wrap items-center gap-2 text-sm mb-3">
      Search spelling
      <select aria-label="Passage search spelling" className="border rounded bg-background px-2 py-1.5" value={query}
        onChange={e => { setQuery(e.target.value); setPage(1); }}>
        {queries.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
    </label>}
    <p className="text-xs text-muted-foreground mb-3">Live text matches for “{query}”.</p>
    <div aria-live="polite" aria-busy={loading}>
      {loading && <p className="text-sm text-muted-foreground">Loading passages…</p>}
      {error && <p className="text-sm" role="alert">Passages could not be loaded.{" "}
        <button type="button" onClick={() => setRetry(n => n + 1)} className="underline">Retry</button>
      </p>}
      {!loading && data?.results.length === 0 && <p className="text-sm text-muted-foreground">
        No passages found for “{query}”.{queries.length > 1 ? " Try another search spelling." : ""}
      </p>}
      {data && <ul className="space-y-2">
        {data.results.map(result => <li key={result.ref}>
          <Link href={placePassageLink(result)} className="block rounded border border-border p-3 hover:bg-accent" data-testid="link-place-passage">
            <p className="text-sm font-semibold text-primary mb-1">{result.ref}</p>
            <PassageExcerpt text={result.highlight || result.text} />
          </Link>
        </li>)}
      </ul>}
    </div>
    {(page > 1 || (data?.totalPages ?? 0) > 1) && <nav aria-label="Passage pages" className="flex items-center justify-between gap-3 mt-3 text-sm">
      <button type="button" disabled={loading || page === 1} className="border rounded px-3 py-1.5 disabled:opacity-40" onClick={() => setPage(n => n - 1)}>Previous</button>
      <span>Page {page}</span>
      <button type="button" disabled={loading || !data || page >= data.totalPages} className="border rounded px-3 py-1.5 disabled:opacity-40" onClick={() => setPage(n => n + 1)}>Next</button>
    </nav>}
  </section>;
}

// Reset query and pagination immediately when selecting another map entry.
export function PlacePassages({ place }: { place: Place }) {
  return <PassageResults key={place.id} place={place} />;
}
