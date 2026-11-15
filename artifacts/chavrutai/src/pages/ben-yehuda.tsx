import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { benYehudaHref } from "@workspace/shared-data/ben-yehuda";
import { HEBREW_ALPHABET } from "@shared/hebrew-alphabet";
import { dictionaryStyles } from "@/lib/dictionary-format";
import { DisplayOptions, DictionarySearchNotice } from "@/components/dictionary/dictionary-ui";
import { useBenYehudaReader } from "@/hooks/use-ben-yehuda-reader";
import "./ben-yehuda.css";

export default function BenYehuda() {
  const {
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
  } = useBenYehudaReader();

  return (
    <PageShell>
      <style dangerouslySetInnerHTML={{ __html: dictionaryStyles }} />

      <PageHeader category="tanakh" title="Ben-Yehuda Hebrew Dictionary">
        <p className="text-muted-foreground">
          Eliezer Ben-Yehuda — A Complete Dictionary of Ancient and Modern Hebrew
        </p>
      </PageHeader>

      <section className="py-8 border-t border-border">
        <button
          type="button"
          onClick={() => setShowAbout(v => !v)}
          className="text-sm text-primary hover:text-foreground transition-colors"
          data-testid="button-about-toggle"
          aria-expanded={showAbout}
        >
          {showAbout ? "▲" : "▼"} About this dictionary
        </button>
        {showAbout && (
          <div className="mt-4 text-sm text-foreground space-y-3" data-testid="about-panel">
            <p>
              <strong>Ben-Yehuda</strong> is Eliezer Ben-Yehuda's{" "}
              <em>Thesaurus totius hebraitatis</em> (מלון הלשון העברית הישנה והחדשה), a dictionary of
              Hebrew across its biblical, rabbinic, medieval, and modern periods. Entries are written in
              Hebrew. The text was digitized by{" "}
              <a href="https://benyehuda.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Project Ben-Yehuda</a>{" "}
              and is served live by Sefaria; this reader presents it with Bekiut's dictionary layout.
            </p>
            <p className="font-medium">What this reader offers:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>Pointed and unpointed search.</strong> Suggestions match with or without vowel points.</li>
              <li><strong>Previous and next entries.</strong> Step through neighboring headwords in dictionary order.</li>
              <li><strong>Collapsible notes.</strong> Footnotes stay folded until opened, or can be shown inline.</li>
              <li>
                <strong>Browse by Hebrew letter.</strong> The headword index is a 21,999-entry autocomplete
                snapshot; it is not guaranteed to list every entry, so search for words you do not find there.
              </li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Project Ben-Yehuda describes the dictionary as public domain.{" "}
              <a href="https://benyehuda.org/page/english" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Source and digitization</a>
              {" · "}
              <a href="https://www.sefaria.org/Ben_Yehuda_Dictionary,_Prolegomena" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Prolegomena on Sefaria</a>
            </p>
          </div>
        )}
      </section>

      <section className="py-8 border-t border-border">
        <div className="flex gap-3">
          <div className="relative flex-1" ref={searchInputRef}>
            <Input
              type="search"
              placeholder="Search Hebrew"
              value={searchQuery}
              onChange={(e) => {
                suppressSuggestionsRef.current = false;
                setSearchQuery(e.target.value);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (!suppressSuggestionsRef.current && suggestions.length > 0) setShowSuggestions(true);
              }}
              className="pr-9 font-hebrew"
              dir="rtl"
              data-testid="input-search"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  suppressSuggestionsRef.current = true;
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
                  <button type="button"
                    key={index}
                    data-testid={`suggestion-${index}`}
                    className="w-full px-4 py-3 hover:bg-secondary cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="font-hebrew text-lg" dir="rtl">{suggestion.voweled}</span>
                    {suggestion.voweled !== suggestion.unvoweled && (
                      <span className="text-muted-foreground text-sm font-hebrew" dir="rtl">{suggestion.unvoweled}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button onClick={() => handleSearch(searchQuery)} data-testid="button-search" disabled={isLoading || !searchQuery.trim()}>
            {isLoading ? "Searching…" : "Search"}
          </Button>
        </div>
      </section>

      <section className="py-8 border-t border-border">
        <h2 className="font-georgia text-xl mb-4">Browse by Letter</h2>
        <button type="button" className="text-sm mb-3" aria-expanded={showBrowse} aria-controls="ben-yehuda-browse-grid" onClick={() => setShowBrowse(value => !value)}>
          {showBrowse ? "▾" : "▸"} Browse by letter
        </button>
        <div id="ben-yehuda-browse-grid" hidden={!showBrowse}>
          <div dir="rtl" className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {HEBREW_ALPHABET.map((letter) => {
              const count = lexiconIndex?.perLetterCounts[letter];
              return (
                <Link
                  key={letter}
                  href={`/ben-yehuda/headwords/${encodeURIComponent(letter)}`}
                  data-testid={`button-letter-${letter}`}
                  className="h-12 inline-flex flex-col items-center justify-center gap-0 rounded border border-border text-lg font-hebrew transition-colors hover:bg-secondary"
                >
                  <span className="leading-none">{letter}</span>
                  {count !== undefined && (
                    <span className="text-[10px] tabular-nums leading-none mt-0.5 opacity-70">{count.toLocaleString()}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {(isLoading || lastSearchedQuery) && (
        <section ref={resultsRef} className="w-full max-w-4xl mx-auto py-8 border-t border-border scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-georgia text-xl">Dictionary Entries</h2>
            <DisplayOptions dictionary="ben-yehuda" hint={inlineNotes ? "Notes are shown in the text." : "Click a note marker to open it."}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={splitDashes} onChange={e => setSplitDashes(e.target.checked)} className="accent-primary" data-testid="checkbox-split-dashes" />
                Split paragraphs at dashes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={largerText} onChange={e => setLargerText(e.target.checked)} className="accent-primary" data-testid="checkbox-larger-text" />
                Larger Hebrew text
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={inlineNotes} onChange={e => setInlineNotes(e.target.checked)} className="accent-primary" data-testid="checkbox-inline-notes" />
                Show notes inline
              </label>
            </DisplayOptions>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="text-muted-foreground">Loading entries...</span>
            </div>
          ) : results.length === 0 ? (
            <DictionarySearchNotice
              dictionary="ben-yehuda"
              query={lastSearchedQuery}
              failure={failure}
              linkedEntryMissing={!!lastRid}
              onRetry={() => handleSearch(lastSearchedQuery, lastRid)}
            >
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
            </DictionarySearchNotice>
          ) : (
            <div className="space-y-4" ref={entriesRef}>
              {preparedEntries.map(({ entry, id, html }, index) => (
                <div id={id} key={entry.rid || index} className="pb-4 border-b border-border last:border-b-0 scroll-mt-24" data-testid={`entry-${entry.rid || index}`}>
                  <div className="flex flex-col sm:flex-row-reverse items-start gap-4" dir="ltr">
                    <h3 className="text-lg font-bold font-hebrew min-w-fit self-end sm:self-auto" dir="rtl">
                      <a
                        href={`https://www.sefaria.org/Ben_Yehuda_Dictionary,_${encodeURIComponent(entry.headword)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        title="View this entry on Sefaria"
                      >
                        {entry.headword}
                      </a>
                    </h3>
                    <div
                      dir="rtl"
                      lang="he"
                      className={`text-foreground flex-1 min-w-0 w-full max-w-none dictionary-content font-hebrew ben-yehuda-content leading-loose ${largerText ? "text-lg" : "text-base"}`}
                      data-testid="ben-yehuda-definition"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                  {(entry.prev_hw || entry.next_hw) && (
                    <nav dir="rtl" className="mt-3 flex justify-between gap-3 text-sm" aria-label={`Neighbors of ${entry.headword}`}>
                      {entry.prev_hw ? (
                        <a href={benYehudaHref(entry.prev_hw)} data-nav="prev" className="text-primary hover:underline" data-testid="link-prev-entry">
                          → הקודם: <bdi className="font-hebrew">{entry.prev_hw}</bdi>
                        </a>
                      ) : <span />}
                      {entry.next_hw && (
                        <a href={benYehudaHref(entry.next_hw)} data-nav="next" className="text-primary hover:underline" data-testid="link-next-entry">
                          הבא: <bdi className="font-hebrew">{entry.next_hw}</bdi> ←
                        </a>
                      )}
                    </nav>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
