import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { benYehudaHref } from "@workspace/shared-data/ben-yehuda";
import { HEBREW_ALPHABET } from "@shared/hebrew-alphabet";
import { dictionaryStyles } from "@/lib/dictionary-format";
import { DisplayOptions, DictionarySearchNotice } from "@/components/dictionary/dictionary-ui";
import { useBenYehudaReader } from "@/hooks/use-ben-yehuda-reader";
import { DictionaryAbbreviationPanel } from "@/components/bdb-abbreviation-panel";
import { BY_FONTS, BY_SIZES, type BenYehudaFont } from "@/hooks/use-ben-yehuda-typography";
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
    typography,
    expandInline,
    setExpandInline,
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
              <Link href="/ben-yehuda/abbreviations" className="text-primary hover:underline" data-testid="link-abbreviations">
                Browse the abbreviation mappings →
              </Link>
              {" · "}
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
        <h2 className="font-georgia text-xl">
          <button
            type="button"
            className="by-disclosure group inline-flex items-center gap-2 rounded-sm text-left"
            aria-expanded={showBrowse}
            aria-controls="ben-yehuda-browse-grid"
            onClick={() => setShowBrowse(value => !value)}
            data-testid="button-browse-toggle"
          >
            <span aria-hidden="true" className={`text-sm text-muted-foreground transition-transform duration-200 ${showBrowse ? "rotate-90" : ""}`}>▸</span>
            Browse by Letter
          </button>
        </h2>
        {!showBrowse && <p className="mt-1 text-sm text-muted-foreground">Open the headword index for any of the 22 letters.</p>}
        <div id="ben-yehuda-browse-grid" hidden={!showBrowse} className="mt-4">
          <div dir="rtl" className="grid grid-cols-8 sm:grid-cols-12 gap-2">
            {HEBREW_ALPHABET.map((letter) => {
              const count = lexiconIndex?.perLetterCounts[letter];
              return (
                <Link
                  key={letter}
                  href={`/ben-yehuda/headwords/${encodeURIComponent(letter)}`}
                  data-testid={`button-letter-${letter}`}
                  className="by-letter h-12 inline-flex flex-col items-center justify-center gap-0 rounded border border-border text-lg font-hebrew"
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
          <DictionaryAbbreviationPanel revision={preparedEntries} />
          <div className="mb-5 flex flex-col gap-3">
            <h2 className="font-georgia text-xl">Dictionary Entries</h2>
            <DisplayOptions
              dictionary="ben-yehuda"
              hint={<>
                {inlineNotes ? "Notes are shown in the text." : "Select a note marker to open it."}{" "}
                Dotted abbreviations explain themselves on hover or focus; tap to pin. Links still navigate.
              </>}
            >
              <div className="by-options">
                <fieldset className="by-option-group">
                  <legend>Text size</legend>
                  <div className="by-segmented" role="radiogroup" aria-label="Text size">
                    {BY_SIZES.map((option, index) => (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={typography.size === option.id}
                        tabIndex={typography.size === option.id ? 0 : -1}
                        aria-label={option.name}
                        title={option.name}
                        onClick={() => typography.setSize(option.id)}
                        onKeyDown={event => {
                          const step = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 :
                            ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
                          if (!step && event.key !== "Home" && event.key !== "End") return;
                          event.preventDefault();
                          const next = event.key === "Home" ? 0 : event.key === "End" ? BY_SIZES.length - 1 :
                            (index + step + BY_SIZES.length) % BY_SIZES.length;
                          typography.setSize(BY_SIZES[next].id);
                          (event.currentTarget.parentElement?.children[next] as HTMLElement)?.focus();
                        }}
                        data-testid={`button-text-size-${option.id}`}
                        style={{ fontSize: `calc(${option.rem} * 0.8)` }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="by-option-group">
                  <span className="by-legend">Hebrew font</span>
                  <select
                    value={typography.font}
                    onChange={e => typography.setFont(e.target.value as BenYehudaFont)}
                    className="by-select"
                    data-testid="select-hebrew-font"
                  >
                    {BY_FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </label>
                <div className="by-option-group by-checks">
                  <span className="by-legend">Layout</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={splitDashes} onChange={e => setSplitDashes(e.target.checked)} className="accent-primary" data-testid="checkbox-split-dashes" />
                    Split paragraphs at dashes
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={inlineNotes} onChange={e => setInlineNotes(e.target.checked)} className="accent-primary" data-testid="checkbox-inline-notes" />
                    Show notes inline
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={expandInline} onChange={e => setExpandInline(e.target.checked)} className="accent-primary" data-testid="checkbox-expand-inline" />
                    Expand abbreviations inline
                  </label>
                </div>
              </div>
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
            <div className="space-y-4" ref={entriesRef} data-by-size={typography.size} style={{ ["--by-font" as string]: typography.fontStack, ["--by-size" as string]: typography.sizeRem }}>
              {preparedEntries.map(({ entry, id, html }, index) => (
                <div id={id} key={entry.rid || index} className="by-entry pb-4 border-b border-border last:border-b-0 scroll-mt-24" data-testid={`entry-${entry.rid || index}`}>
                  <div className="flex flex-col sm:flex-row-reverse items-start gap-4" dir="ltr">
                    <h3 className="by-headword font-bold min-w-fit self-end sm:self-auto" dir="rtl" data-testid="text-headword">
                      <a
                        href={`https://www.sefaria.org/Ben_Yehuda_Dictionary,_${encodeURIComponent(entry.headword)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline underline-offset-4 rounded-sm"
                        title="View this entry on Sefaria"
                      >
                        {entry.headword}
                      </a>
                    </h3>
                    <div
                      dir="rtl"
                      lang="he"
                      className={`text-foreground flex-1 min-w-0 w-full max-w-none dictionary-content font-hebrew ben-yehuda-content leading-loose`}
                      data-testid="ben-yehuda-definition"
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  </div>
                  {(entry.prev_hw || entry.next_hw) && (
                    <nav dir="rtl" className="mt-3 flex justify-between gap-3 text-sm" aria-label={`Neighbors of ${entry.headword}`}>
                      {entry.prev_hw ? (
                        <a href={benYehudaHref(entry.prev_hw)} data-nav="prev" className="by-neighbor text-primary" data-testid="link-prev-entry">
                          → הקודם: <bdi className="font-hebrew">{entry.prev_hw}</bdi>
                        </a>
                      ) : <span />}
                      {entry.next_hw && (
                        <a href={benYehudaHref(entry.next_hw)} data-nav="next" className="by-neighbor text-primary" data-testid="link-next-entry">
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
