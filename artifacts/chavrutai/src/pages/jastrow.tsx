import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { DictionaryAbbreviationPanel } from "@/components/bdb-abbreviation-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { useSEO } from "@/hooks/use-seo";
import { getJastrowSEO } from "@workspace/shared-data/seo-data";
import { trackPublishingEvent } from "@/lib/publishing-analytics";
import { HEBREW_ALPHABET } from "@shared/hebrew-alphabet";
import jastrowMappings from "@shared/data/lexicon-mappings/jastrow.json";
import {
  dictionaryStyles,
  convertSefariaLinksToInternal,
  convertJastrowInternalLinks,
  annotateTransliterationsInHtml,
  convertSuperscriptLetters,
  expandAbbreviations,
  useDictionaryCopyHandler,
  type DictionaryEntry,
  type AutosuggestSuggestion,
} from "@/lib/dictionary-format";
import { useLexiconIndex, searchHeadwords, findFuzzyMatches } from "@/lib/lexicon-index";
import { jastrowOrigin, structureJastrowDefinition } from "@/lib/jastrow-presentation";

export default function Jastrow() {
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [results, setResults] = useState<DictionaryEntry[]>([]);
  const [extraSplits, setExtraSplits] = useState(false);
  const [expandInline, setExpandInline] = useState(() => {
    try { return sessionStorage.getItem("jastrow-expand-inline") === "true"; } catch { return false; }
  });
  useEffect(() => {
    try { sessionStorage.setItem("jastrow-expand-inline", String(expandInline)); } catch { /* Storage may be disabled. */ }
  }, [expandInline]);
  const abbreviationRevision = useMemo(() => ({ results, expandInline, extraSplits }), [results, expandInline, extraSplits]);
  const renderAbbreviations = (text: string) => expandAbbreviations(
    text, jastrowMappings.mappings, { display: expandInline ? "inline" : "original" },
  );
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AutosuggestSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const initialLoadRef = useRef(false);
  const suppressSuggestionsRef = useRef(false);
  const lexiconIndex = useLexiconIndex("jastrow");
  const preparedEntries = useMemo(() => results.map((entry, index) => {
    const { origin, definitions } = jastrowOrigin(entry);
    const render = (html: string) => annotateTransliterationsInHtml(
      convertSefariaLinksToInternal(convertJastrowInternalLinks(
        renderAbbreviations(convertSuperscriptLetters(html)),
      )),
    );
    const id = `jastrow-${entry.rid || index}`;
    const senses = definitions.map((definition, senseIndex) => {
      const structured = structureJastrowDefinition(definition, `${id}-sense-${senseIndex}`, extraSplits);
      return { ...structured, html: render(structured.html) };
    });
    return {
      entry, id, senses, origin: render(origin),
      morphology: render(entry.content.morphology || ""),
      outline: senses.flatMap(sense => sense.outline),
    };
  }), [results, expandInline, extraSplits]);

  const jastrowSEO = getJastrowSEO("", searchQuery, window.location.origin);

  useSEO({
    ...jastrowSEO,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Jastrow Talmud Dictionary",
      description: "Comprehensive dictionary of Talmudic Hebrew and Aramaic with modernized presentation",
      url: `${window.location.origin}/jastrow`,
      applicationCategory: "ReferenceApplication",
      operatingSystem: "Web",
      publisher: {
        "@type": "Organization",
        name: "Bekiut",
        url: window.location.origin,
      },
      about: {
        "@type": "Book",
        name: "A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature",
        author: {
          "@type": "Person",
          name: "Marcus Jastrow",
        },
      },
    },
  });

  const updateURLParams = useCallback((params: { q?: string; rid?: string }) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('letter');
    url.searchParams.delete('rid');
    if (params.q) url.searchParams.set('q', params.q);
    if (params.rid) url.searchParams.set('rid', params.rid);
    const newPath = url.pathname + url.search;
    window.history.replaceState(null, '', newPath);
  }, []);

  const handleSearch = useCallback(async (query?: string | unknown, rid?: string) => {
    const q = typeof query === 'string' ? query : searchQuery;
    if (!q.trim()) return;
    setIsLoading(true);
    setLastSearchedQuery(q.trim());
    updateURLParams({ q: q.trim(), rid });
    try {
      const response = await fetch(`/api/jastrow/search?query=${encodeURIComponent(q)}${rid ? `&rid=${encodeURIComponent(rid)}` : ""}`);
      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      const entries = await response.json();
      const validEntries = Array.isArray(entries) ? entries.filter((entry: DictionaryEntry) =>
        entry && entry.headword && entry.content && Array.isArray(entry.content.senses)
      ) : [];
      setResults(validEntries);
      if (validEntries.length === 1 && validEntries[0].rid) {
        updateURLParams({ q: validEntries[0].headword, rid: validEntries[0].rid });
      }
      trackPublishingEvent('dictionary_search_completed', {
        dictionary: 'jastrow',
        result_count: validEntries.length,
        has_results: validEntries.length > 0,
      });
    } catch (error) {
      console.error('Frontend: Search error:', error);
      setResults([]);
    }
    setIsLoading(false);
  }, [searchQuery, updateURLParams]);

  // Initial-load + popstate handler. Re-runs the search when the URL's `q`
  // changes via back/forward or our click interceptor below. Legacy `?letter=`
  // URLs redirect to the headword index page (which superseded inline browse).
  useEffect(() => {
    const runFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const letter = params.get('letter');
      if (q) {
        // Only suppress suggestions if the query actually changes — otherwise
        // setSearchQuery is a no-op, the suggestions effect never runs, and
        // the flag would silently swallow the user's next keystroke.
        setSearchQuery((prev) => {
          if (prev !== q) suppressSuggestionsRef.current = true;
          return q;
        });
        handleSearch(q, params.get('rid') || undefined);
      } else if (letter) {
        window.location.replace(`/jastrow/headwords/${encodeURIComponent(letter)}`);
      } else {
        // Bare /jastrow (e.g. user popped back past all searches) — clear stale
        // state so the UI matches the URL.
        setSearchQuery("");
        setLastSearchedQuery("");
        setResults([]);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      runFromUrl();
    }

    const onPopState = () => runFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Intercept clicks on internal /jastrow?... links (e.g. cross-refs in entry
  // HTML) so we can re-run the search without a full page reload. We
  // deliberately skip modifier-key / middle-click / target="_blank" /
  // defaultPrevented events so open-in-new-tab and other browser conventions
  // still work.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest?.('a') as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('/jastrow?')) return;
      e.preventDefault();
      window.history.pushState(null, '', href);
      const params = new URLSearchParams(href.split('?')[1] || '');
      const q = params.get('q');
      if (q) {
        trackPublishingEvent('dictionary_entry_opened', {
          dictionary: 'jastrow',
          interaction: 'cross_reference',
        });
        setSearchQuery((prev) => {
          if (prev !== q) suppressSuggestionsRef.current = true;
          return q;
        });
        handleSearch(q, params.get('rid') || undefined);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [handleSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (suppressSuggestionsRef.current) {
        suppressSuggestionsRef.current = false;
        return;
      }
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
    if (!lexiconIndex || results.length > 0 || !lastSearchedQuery || isLoading) return [];
    return findFuzzyMatches(lexiconIndex, lastSearchedQuery, 5);
  }, [lexiconIndex, results, lastSearchedQuery, isLoading]);

  const handleSuggestionClick = (suggestion: AutosuggestSuggestion) => {
    suppressSuggestionsRef.current = true;
    setSearchQuery(suggestion.voweled);
    setShowSuggestions(false);
    handleSearch(suggestion.voweled);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useDictionaryCopyHandler('main.max-w-content', [results]);

  return (
    <PageShell>
        <style dangerouslySetInnerHTML={{ __html: dictionaryStyles }} />

        <PageHeader category="talmud-bavli" title="Jastrow Talmudic Dictionary">
          <p className="text-muted-foreground">
            Marcus Jastrow — A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the
            Midrashic Literature (1903)
          </p>
        </PageHeader>

        <section className="py-8 border-t border-border">
          <button
            type="button"
            onClick={() => setShowAbout((v) => !v)}
            className="text-sm text-primary hover:text-foreground transition-colors"
            data-testid="button-about-toggle"
            aria-expanded={showAbout}
          >
            {showAbout ? "▲" : "▼"} About this dictionary
          </button>

          {showAbout && (
            <div className="mt-4 text-sm text-foreground space-y-3" data-testid="about-panel">
                <p>
                  <strong>Jastrow</strong> is shorthand for Marcus Jastrow's{" "}
                  <em>
                    A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic
                    Literature
                  </em>{" "}
                  (London / New York, 1903), the standard scholarly dictionary for Talmudic Hebrew
                  and Aramaic. It covers the vocabulary of rabbinic literature. This reader pulls
                  live entries from Sefaria's{" "}
                  <code className="text-xs bg-muted px-1 rounded">/api/words</code> endpoint and
                  renders them with a modernized presentation layer.
                </p>
                <p className="font-medium">What this reader adds on top of the raw text:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>On-demand abbreviation expansion.</strong> Hover, focus, click, or tap an underlined abbreviation
                    to read its meaning, or enable inline expansion. Categories include rabbinic source
                    abbreviations (<em>Ber.</em>, <em>Sanh.</em>, <em>Pes.</em>, <em>Gen. R.</em>),
                    grammatical shorthand (<em>denom.</em>, <em>constr.</em>, <em>pl.</em>,{" "}
                    <em>fem.</em>), Latin logic (<em>i.e.</em>, <em>e.g.</em>, <em>l.c.</em>), and
                    scholar surnames.
                  </li>
                  <li>
                    <strong>Citations as live links.</strong> Bible references and Talmud passages
                    link directly to the corresponding chapter or page in the Bekiut Bible and
                    Talmud readers.
                  </li>
                  <li>
                    <strong>Superscript and footnote markers inlined.</strong> Jastrow's tiny{" "}
                    <code className="text-xs bg-muted px-1 rounded">&lt;sup&gt;</code> qualifications
                    are converted to readable parentheticals.
                  </li>
                  <li>
                    <strong>Browse by Hebrew letter.</strong> Each letter button shows a per-letter
                    headword count and goes straight to the full filtered headword index for that
                    letter (30,756 entries total).
                  </li>
                  <li>
                    <strong>Cognate-script transliteration.</strong> Greek, Arabic, and Syriac runs
                    are annotated inline with transliterations (Greek and Arabic into Latin
                    characters, Syriac into Hebrew characters), to make the entries accessible to a
                    wider audience.
                  </li>
                  <li>
                    <strong>Optional inline expansions as monospace pills.</strong> Every inline
                    expansion is rendered in a small monospace pill, so consecutive expansions
                    (e.g. two scholar names in a row) read as distinct tags rather than running
                    together, and you can see at a glance which words came from the original
                    abbreviated text.
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  <a
                    href="/jastrow/abbreviations"
                    className="underline hover:text-foreground transition-colors"
                    data-testid="link-abbreviations"
                  >
                    Browse the full abbreviations reference →
                  </a>
                </p>
                <p className="text-muted-foreground pt-1">
                  For a fuller writeup, see:{" "}
                  <a
                    href="https://www.ezrabrand.com/p/jastrows-talmud-dictionary-a-modernized"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-about-blogpost"
                  >
                    Jastrow's Talmud Dictionary: A Modernized and Enhanced Digital Presentation at
                    Bekiut →
                  </a>{" "}
                  <span className="text-muted-foreground">(Sep 28, 2025)</span>
                </p>
              </div>
          )}
        </section>

        <section className="py-8 border-t border-border">
          <div className="flex gap-3">
            <div className="relative flex-1" ref={searchInputRef}>
              <Input
                type="search"
                placeholder="Search Hebrew/Aramaic"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="pr-9 font-hebrew"
                data-testid="input-search"
                disabled={isLoading}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    (searchInputRef.current?.querySelector('input[type="search"]') as HTMLInputElement)?.focus();
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      data-testid={`suggestion-${index}`}
                      className="px-4 py-3 hover:bg-secondary cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <span className="font-hebrew text-lg" dir="rtl">{suggestion.voweled}</span>
                      {suggestion.voweled !== suggestion.unvoweled && (
                        <span className="text-muted-foreground text-sm font-hebrew" dir="rtl">{suggestion.unvoweled}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSearch} data-testid="button-search" disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? "Searching…" : "Search"}
            </Button>
          </div>
        </section>

        <section className="py-8 border-t border-border">
          <h2 className="font-georgia text-xl mb-4">Browse by Letter</h2>
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {HEBREW_ALPHABET.map((letter) => {
              const count = lexiconIndex?.perLetterCounts[letter];
              return (
                <Link
                  key={letter}
                  href={`/jastrow/headwords/${encodeURIComponent(letter)}`}
                  data-testid={`button-letter-${letter}`}
                  className="h-12 inline-flex flex-col items-center justify-center gap-0 rounded border border-border text-lg font-hebrew transition-colors hover:bg-secondary"
                >
                  <span className="leading-none">{letter}</span>
                  {count !== undefined && (
                    <span className="text-[10px] tabular-nums leading-none mt-0.5 opacity-70">
                      {count.toLocaleString()}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {(isLoading || lastSearchedQuery) && (
        <section className="py-8 border-t border-border">
          <DictionaryAbbreviationPanel revision={abbreviationRevision} />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-georgia text-xl">Dictionary Entries</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={expandInline} onChange={e => setExpandInline(e.target.checked)} className="accent-primary" />
              Expand abbreviations inline
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={extraSplits} onChange={e => setExtraSplits(e.target.checked)} className="accent-primary" />
              Additional splits at dashes and citations
            </label>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            {expandInline ? "Abbreviations are expanded in the text." : "Hover or focus an underlined abbreviation to read its meaning; click or tap to keep it open. Reference links still navigate."}
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-muted-foreground">Loading entries...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
                <p className="text-muted-foreground">No entries found. Try a different search term or browse by letter.</p>
                {didYouMean.length > 0 && (
                  <div className="mt-6 max-w-md mx-auto">
                    <p className="text-sm text-muted-foreground mb-2">Did you mean:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {didYouMean.map((m, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setSearchQuery(m.voweled); handleSearch(m.voweled); }}
                          className="font-hebrew text-base px-3 py-1 rounded border border-border hover:bg-secondary text-primary"
                          data-testid={`fuzzy-${i}`}
                          dir="rtl"
                        >
                          {m.voweled}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="space-y-4">
              {preparedEntries.map(({ entry, id, origin, morphology, senses, outline }, index) => {
                return (
                  <div id={id} key={entry.rid || index} className="pb-4 border-b border-border last:border-b-0 scroll-mt-24" data-testid={`entry-${entry.rid || index}`}>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <h3 className="text-lg font-bold font-hebrew min-w-fit">
                        <a
                          href={`https://www.sefaria.org.il/Jastrow%2C_${encodeURIComponent(entry.headword)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title="View this entry on Sefaria"
                        >
                          {entry.headword}
                        </a>
                      </h3>
                      <div className="text-foreground flex-1 min-w-0 w-full prose prose-sm max-w-none">
                        {entry.rid && (
                          <a className="text-xs text-muted-foreground" href={`/jastrow?q=${encodeURIComponent(entry.headword)}&rid=${encodeURIComponent(entry.rid)}`} aria-label={`Permanent link to ${entry.headword}`}>
                            Entry link
                          </a>
                        )}
                        {morphology && <div className="mb-2 dictionary-content" data-testid="jastrow-morphology" dangerouslySetInnerHTML={{ __html: morphology }} />}
                        {origin && (
                          <div
                            className="mb-2 dictionary-content text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: origin }}
                          />
                        )}
                        {outline.length > 1 && (
                          <details className="mb-4 rounded border border-border p-3 not-prose">
                            <summary className="cursor-pointer text-sm font-medium">Entry index ({outline.length})</summary>
                            <nav aria-label={`Index for ${entry.headword}`} className="mt-2 max-h-72 overflow-y-auto">
                              <ul className="space-y-2 text-sm">
                                {outline.map(item => <li key={item.id} className={item.level ? "pl-4" : ""}>
                                  <a href={`#${item.id}`} className="text-primary hover:underline">{item.label}</a>
                                </li>)}
                              </ul>
                            </nav>
                          </details>
                        )}
                        {senses.map((sense, senseIndex) => (
                          <div
                            key={senseIndex}
                            className="mb-2 last:mb-0 dictionary-content"
                            dangerouslySetInnerHTML={{ __html: sense.html }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        )}
    </PageShell>
  );
}
