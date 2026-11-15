import { type KeyboardEvent, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSEO } from "@/hooks/use-seo";
import { getBenYehudaSEO } from "@workspace/shared-data/seo-data";
import type { BenYehudaEntry } from "@workspace/shared-data/ben-yehuda";
import { trackPublishingEvent } from "@/lib/publishing-analytics";
import type { AutosuggestSuggestion } from "@/lib/dictionary-format";
import { useLexiconIndex, searchHeadwords, findFuzzyMatches } from "@/lib/lexicon-index";
import { prepareBenYehudaHtml, benYehudaCopyText } from "@/lib/ben-yehuda-html";
import { LatestRequest } from "@/lib/latest-request";
import { classifyDictionaryResponse, type DictionarySearchFailure } from "@/lib/dictionary-search";
import { useReaderPreference } from "@/hooks/use-reader-preference";

function validBenYehudaEntries(body: unknown): BenYehudaEntry[] {
  if (!Array.isArray(body)) return [];
  return body.filter((entry: BenYehudaEntry) =>
    entry && entry.parent_lexicon === "Ben Yehuda Dictionary" &&
    typeof entry.headword === "string" && entry.content && Array.isArray(entry.content.definition) &&
    entry.content.definition.every(paragraph => typeof paragraph === "string"));
}

/** Search, history, suggestion, preference and copy state for the Ben-Yehuda reader. */
export function useBenYehudaReader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [results, setResults] = useState<BenYehudaEntry[]>([]);
  const [largerText, setLargerText] = useReaderPreference("ben-yehuda-larger-text", false);
  const [inlineNotes, setInlineNotes] = useReaderPreference("ben-yehuda-inline-notes", false);
  const [splitDashes, setSplitDashes] = useReaderPreference("ben-yehuda-split-dashes", true);
  const [isLoading, setIsLoading] = useState(false);
  const [failure, setFailure] = useState<DictionarySearchFailure | null>(null);
  const [lastRid, setLastRid] = useState<string | undefined>(undefined);
  const [suggestions, setSuggestions] = useState<AutosuggestSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showBrowse, setShowBrowse] = useState(() => !new URLSearchParams(window.location.search).get("q"));
  const pendingEntryScroll = useRef(false);
  const resultsRef = useRef<HTMLElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(false);
  const entryUrlRef = useRef(window.location.pathname + window.location.search);
  const latestRequest = useRef(new LatestRequest());
  useEffect(() => () => latestRequest.current.invalidate(), []);
  // Suggestions only appear after a real edit; URL loads and late index loads stay quiet.
  const suppressSuggestionsRef = useRef(true);
  const lexiconIndex = useLexiconIndex("ben-yehuda");

  const preparedEntries = useMemo(() => results.map((entry, index) => {
    const id = `ben-yehuda-${entry.rid || index}`;
    return { entry, id, html: prepareBenYehudaHtml(entry.content.definition, id, splitDashes) };
  }), [results, splitDashes]);

  // Inline notes simply open every native footnote disclosure.
  useEffect(() => {
    entriesRef.current?.querySelectorAll("details").forEach(details => { details.open = inlineNotes; });
  }, [inlineNotes, preparedEntries]);

  useEffect(() => {
    if (isLoading || !preparedEntries.length) return;
    const frame = requestAnimationFrame(() => {
      if (pendingEntryScroll.current) {
        pendingEntryScroll.current = false;
        resultsRef.current?.scrollIntoView({ block: "start" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [preparedEntries, isLoading]);

  useSEO({
    ...getBenYehudaSEO(lastSearchedQuery, window.location.origin, lastRid),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Ben-Yehuda Hebrew Dictionary",
      description: "Eliezer Ben-Yehuda's dictionary of ancient and modern Hebrew, in a searchable reader",
      url: `${window.location.origin}/ben-yehuda`,
      applicationCategory: "ReferenceApplication",
      operatingSystem: "Web",
      publisher: { "@type": "Organization", name: "Bekiut", url: window.location.origin },
      about: {
        "@type": "Book",
        name: "A Complete Dictionary of Ancient and Modern Hebrew",
        author: { "@type": "Person", name: "Eliezer Ben-Yehuda" },
      },
    },
  });

  const updateURLParams = useCallback((params: { q?: string; rid?: string }, clearHash = false) => {
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    url.searchParams.delete("rid");
    if (params.q) url.searchParams.set("q", params.q);
    if (params.rid) url.searchParams.set("rid", params.rid);
    if (clearHash) url.hash = "";
    entryUrlRef.current = url.pathname + url.search;
    window.history.replaceState(null, "", entryUrlRef.current + url.hash);
  }, []);

  const handleSearch = useCallback(async (query?: string | unknown, rid?: string) => {
    const q = typeof query === "string" ? query : searchQuery;
    if (!q.trim()) return;
    const request = latestRequest.current.begin();
    suppressSuggestionsRef.current = true;
    setSuggestions([]);
    setShowSuggestions(false);
    setShowBrowse(false);
    pendingEntryScroll.current = true;
    setIsLoading(true);
    setLastSearchedQuery(q.trim());
    setFailure(null);
    setLastRid(rid);
    const currentParams = new URLSearchParams(window.location.search);
    const differentEntry = currentParams.get("q") !== q.trim() || (currentParams.get("rid") || undefined) !== rid;
    updateURLParams({ q: q.trim(), rid }, differentEntry);
    try {
      const response = await fetch(`/api/ben-yehuda/search?query=${encodeURIComponent(q.trim())}${rid ? `&rid=${encodeURIComponent(rid)}` : ""}`, { signal: request.signal });
      if (!response.ok) {
        const outcome = await classifyDictionaryResponse(response);
        if (!request.isCurrent()) return;
        setResults([]);
        setFailure(outcome.kind === "ok" ? { kind: "error", message: "The dictionary returned an unexpected response." } : outcome);
        return;
      }
      let body: unknown = null;
      try { body = await response.json(); } catch { body = null; }
      if (!request.isCurrent()) return;
      if (!Array.isArray(body)) {
        setResults([]);
        setFailure({ kind: "error", message: "The dictionary returned an unexpected response." });
        return;
      }
      const entries = validBenYehudaEntries(body);
      if (entries.length !== body.length) {
        setResults([]);
        setFailure({ kind: "error", message: "The dictionary returned an unexpected response. Please retry." });
        return;
      }
      setResults(entries);
      if (entries.length === 1 && entries[0].rid) {
        updateURLParams({ q: entries[0].headword, rid: entries[0].rid });
        setLastSearchedQuery(entries[0].headword);
        setLastRid(entries[0].rid);
      }
      trackPublishingEvent("dictionary_search_completed", {
        dictionary: "ben-yehuda",
        result_count: entries.length,
        has_results: entries.length > 0,
      });
    } catch (error) {
      if (!request.isCurrent()) return;
      console.error("Ben-Yehuda search error:", error);
      setResults([]);
      setFailure({ kind: "error", message: "The search could not reach the server. Check your connection." });
    } finally {
      if (request.isCurrent()) setIsLoading(false);
    }
  }, [searchQuery, updateURLParams]);

  const handleSearchRef = useRef(handleSearch);
  handleSearchRef.current = handleSearch;

  useEffect(() => {
    const runFromUrl = () => {
      entryUrlRef.current = window.location.pathname + window.location.search;
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        setSearchQuery(q);
        handleSearchRef.current(q, params.get("rid") || undefined);
      } else {
        suppressSuggestionsRef.current = true;
        latestRequest.current.invalidate();
        pendingEntryScroll.current = false;
        setIsLoading(false);
        setShowBrowse(true);
        setSearchQuery("");
        setLastSearchedQuery("");
        setLastRid(undefined);
        setResults([]);
        setFailure(null);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      runFromUrl();
    }
    const onPopState = () => {
      if (entryUrlRef.current === window.location.pathname + window.location.search) return;
      runFromUrl();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Same-tab plain clicks on /ben-yehuda?... links re-run the search in place;
  // modifier, middle-click and target links keep native browser behavior.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/ben-yehuda?")) return;
      e.preventDefault();
      window.history.pushState(null, "", href);
      const params = new URLSearchParams(href.split("?")[1] || "");
      const q = params.get("q");
      if (q) {
        trackPublishingEvent("dictionary_entry_opened", {
          dictionary: "ben-yehuda",
          interaction: anchor.dataset.nav ? "neighbor" : "cross_reference",
        });
        setSearchQuery(q);
        handleSearchRef.current(q, params.get("rid") || undefined);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      suppressSuggestionsRef.current = true;
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (suppressSuggestionsRef.current) return;
      const q = searchQuery.trim();
      if (!q || !lexiconIndex) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      const matches = searchHeadwords(lexiconIndex, q, 20);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    }, 80);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, lexiconIndex]);

  const didYouMean = useMemo(() => {
    if (!lexiconIndex || results.length > 0 || !lastSearchedQuery || isLoading || failure || lastRid) return [];
    return findFuzzyMatches(lexiconIndex, lastSearchedQuery, 5);
  }, [lexiconIndex, results, lastSearchedQuery, isLoading, failure, lastRid]);

  const handleSuggestionClick = (suggestion: AutosuggestSuggestion) => {
    suppressSuggestionsRef.current = true;
    setSearchQuery(suggestion.voweled);
    setShowSuggestions(false);
    handleSearch(suggestion.voweled);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        suppressSuggestionsRef.current = true;
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Copy keeps paragraph breaks via the dedicated Ben-Yehuda helper.
  useEffect(() => {
    const container = entriesRef.current;
    if (!container) return;
    const onCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount || !event.clipboardData) return;
      const range = selection.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) return;
      const holder = document.createElement("div");
      holder.appendChild(range.cloneContents());
      const text = benYehudaCopyText(holder.innerHTML);
      if (!text) return;
      event.clipboardData.setData("text/plain", text);
      event.preventDefault();
    };
    container.addEventListener("copy", onCopy);
    return () => container.removeEventListener("copy", onCopy);
  }, [preparedEntries]);

  return {
    searchQuery,
    setSearchQuery,
    suppressSuggestionsRef,
    handleKeyPress,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    searchInputRef,
    isLoading,
    handleSuggestionClick,
    handleSearch,
    showAbout,
    setShowAbout,
    showBrowse,
    setShowBrowse,
    lexiconIndex,
    lastSearchedQuery,
    resultsRef,
    inlineNotes,
    splitDashes,
    setSplitDashes,
    setInlineNotes,
    largerText,
    setLargerText,
    results,
    failure,
    lastRid,
    didYouMean,
    entriesRef,
    preparedEntries,
  };
}
