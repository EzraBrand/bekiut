# DRAFT — Decoding BDB Without Flattening It

**UNPUBLISHED DRAFT — not for circulation as a published Bekiut post**

*How Bekiut’s curated mapping dictionary and script annotations make a dense historical lexicon more legible while keeping the evidence in view*

Brown–Driver–Briggs is still a working instrument for Hebrew Bible study. A Jewish reader tracing a biblical root, a Christian seminarian following a commentary, and a university researcher checking comparative Semitic evidence may all open the same entry, although they bring different canons, vocabularies, and expectations. BDB’s compact print conventions can obstruct all three. A line may combine grammatical shorthand, a scholar’s initials, a German title, text-critical symbols, and words in several scripts. Expertise in biblical Hebrew alone does not guarantee instant recognition.

Bekiut’s BDB reader addresses that problem as a presentation layer. It does not produce a new lexicon and does not ask readers to adopt one religious vocabulary. It retrieves BDB entry data from Sefaria and makes recurrent conventions easier to read: abbreviations become explicit, compact citations become navigable, and selected non-Hebrew scripts receive adjacent reading aids. The aim is access to the entry’s argument, not the removal of its historical texture.

## A mapping dictionary, not an automatic glossary

At the center is a curated dictionary of exact strings and expansions. The current file contains 1,563 active mappings, excluding organizational comment keys. Its range reflects the mixed ecology of a BDB entry: grammatical forms such as `Pf.` → “Perfect” and `n.pr.loc.` → “noun proper locative (place name)”; source sigla such as `𝔊` → “LXX (Septuagint)” and `𝔐` → “Masoretic Text”; language labels; journals; reference works; and abbreviated names such as `We` → “Wellhausen” and `Nö` → “Nöldeke.” Readers can inspect the live [BDB abbreviations table](https://bekiut.com/bdb/abbreviations), filter either column, and sort by abbreviation or expansion.

“Curated” matters. The table began with conventions in BDB and Sefaria’s digitized [BDB abbreviations list](https://www.sefaria.org/BDB,_Abbrevations), then grew through corpus scans and review of actual entry contexts. Frequency can identify a candidate; it cannot decide its meaning. A short token may be a scholar in one place, ordinary prose in another, or part of a longer citation. The project therefore rejected risky global mappings and added longer contextual phrases where the evidence supported them.

That choice is visible in practical safeguards. Standalone `m.` is not globally expanded, while the exact forms `2 m. s.` and `n.m.` can become “2nd-person masculine singular” and “noun masculine.” `De` normally identifies Delitzsch, but “De Rossi” remains a name; `Am` can mean Amos, but “Am I” remains an English question. `c.` can mean Latin *cum*, “with,” but it stays `c.` before a leading frequency number, where BDB means *circa*, and it is not expanded when it is a bold lettered subsection. The Greek ψ becomes “Psalms” only when it heads a numerical citation, not when it occurs within a Greek word. These are modest rules, but they prevent legibility work from silently manufacturing claims.

## Reading the expansion as editorial markup

Inline expansions are styled as distinct pills. That typography tells the reader that the full wording belongs to Bekiut’s interface, not to the original printed line. The searchable table preserves the abbreviation–expansion pairing for checking. Expansion occurs only in text outside HTML tags, so a token in a link destination or attribute is not rewritten. Unicode-aware boundaries prevent a short Latin key from matching inside a word written with accented transliteration characters, Greek, or Hebrew.

Overlaps receive equally deliberate treatment. The system finds candidates in the original text and emits non-overlapping replacements from left to right, preferring the longest candidate only when two begin at the same position. Thus `S.E. of` becomes “south-east” followed by “of”; a later-starting `E. of` is not allowed to steal its suffix. Because replacements are selected before markup is inserted, expansion is effectively a single pass: newly emitted words are not scanned again as fresh abbreviations. Longer contextual citations, such as `Lag (M.`, can still outrank `Lag` at the same starting point.

This is “context safe” in a bounded engineering sense, not in the stronger philological sense of understanding every sentence. The rules know boundaries, formatting positions, selected following words, and selected citation shapes. They do not parse BDB’s syntax or adjudicate an ambiguous attribution. Uncertain short forms should remain unexpanded until a defensible context rule or longer mapping is available.

## Legibility includes scripts, not just abbreviations

BDB’s comparative notes move among writing systems. Bekiut keeps each detected original-script run and appends an annotation in square brackets. This preservation is essential: the aid remains visibly secondary and the source spelling remains available for inspection and copying. It is also important to describe the destinations accurately. Greek, Arabic, and Ethiopic (Geʿez) are rendered into Latin characters. Syriac and Samaritan are mapped into Hebrew characters, using cognate-letter correspondences; they are **not** routed into Latin.

Examples verified against the current code include `Ἑλλάς [Hellas]`, `ἄγγελος [angelos]`, Arabic `كِتَاب [kitāb]`, Syriac `ܡܠܟ [מלך]`, Samaritan `ࠔࠋࠅࠌ [שלום]`, and Ethiopic `ሰላም [sälamə]`. The examples are intentionally small. They show what the software emits, including macrons, underdots, breathing behavior, and Hebrew final forms, rather than substituting a preferred classroom convention.

These annotations are transliteration, or in the Syriac and Samaritan cases script conversion by cognate letters—not translation. `كِتَاب [kitāb]` does not add the English meaning “book.” `ܡܠܟ [מלך]` does not claim that a Syriac form has become Hebrew vocabulary. It gives a reader another route to the consonants. Meaning still comes from the lexicographic argument, the source language, and its context.

---

## Preservation, normalization, and accountable limits

Any conversion system makes choices. Greek input is Unicode-normalized; most accents, smooth breathing, iota subscript, and diaeresis are removed, while initial rough breathing is represented with *h*. Eta and omega receive macrons, gamma changes before certain consonants, and upsilon changes in specified diphthongs. Arabic handles explicit vowel marks, long-vowel sequences, shadda, tanwīn, hamza, and selected Persian letters, but the result can only reflect information encoded in the supplied text. Syriac vowel points and Samaritan vocalization or cantillation marks are stripped before cognate letters are mapped and Hebrew final forms are applied. Ethiopic syllables are decomposed according to code-point rows and vowel columns, with explicit labialized rows and punctuation conversions.

The result is therefore a normalized reading aid, not an exact diplomatic reproduction of every graphic feature. Fonts, pointing traditions, manuscript spellings, historical pronunciation, and competing scholarly romanization systems exceed what character-level rules can settle. Even the phrase “one-to-one” must be read at the alphabetic mapping level: it does not establish phonetic identity, morphology, or etymology. Scholars citing a form should return to the original script and, when necessary, to a critical edition or manuscript image.

The same distinction applies to the expansion table. Some mappings simply unpack compressed notation. Others are reader-facing modernizations requested for this interface: for example, `thou art` → “you are,” `harlot` → “prostitute,” or “Palestine” → “Eretz Yisrael.” Such substitutions can improve contemporary legibility, but they are editorial interventions rather than reconstructions of BDB’s exact wording. They should not be quoted as if Brown, Driver, and Briggs printed them. The visible pill treatment and public table make the intervention auditable, but they do not eliminate the need for judgment.

This matters for an inclusive scholarly audience. “Old Testament” belongs to BDB’s historical title and to many Christian bibliographies; “Hebrew Bible” and “Tanakh” are more natural in other academic and Jewish settings. Bekiut can name the artifact accurately without making one community’s terminology the price of entry. Likewise, expanding `𝔊` as “LXX (Septuagint)” or `𝔐` as “Masoretic Text” helps readers identify textual witnesses without telling them what theological authority those witnesses possess.

## A connected, inspectable resource

The mapping work belongs to a wider set of inspectable reader aids. Alongside the [BDB abbreviations table](https://bekiut.com/bdb/abbreviations), Bekiut publishes a [Jastrow abbreviations table](https://bekiut.com/jastrow/abbreviations) and a [Talmud English term replacements table](https://bekiut.com/talmud/term-replacements). They solve different problems, but they share a useful scholarly principle: expose the correspondence rather than hiding it inside the interface.

For an account of an earlier version, see [“BDB Decoded: A Curated Expansion Table for Scholarly Abbreviations in Brown–Driver–Briggs (BDB)”](https://www.academia.edu/167336159/BDB_Decoded_A_Curated_Expansion_Table_for_Scholarly_Abbreviations_in_Brown_Driver_Briggs_BDB_). The live table and repository code reflect current behavior.

The project’s scoped MIT reuse permission applies to Bekiut’s curated mapping data and processing code. It does **not** purport to relicense BDB, Sefaria’s digitization, source-language texts, translations, or any other third-party source material. Reusers should preserve that boundary and check the terms attached to the texts they combine with the tools.

The larger lesson is simple. A historical lexicon becomes more approachable when editorial assistance is explicit, reversible in principle, and close to the evidence. Expansion can spare a reader a hunt through a list of sigla. Transliteration can let a reader sound out or compare a form. Neither should masquerade as translation, interpretation, or a critical edition. Good interface scholarship does not make BDB effortless; it makes the remaining difficulty more likely to be the productive difficulty of language, history, and argument.

---

# Technical appendix — Current implementation and reproducible examples

**Status:** This appendix documents the current implementation inspected for this unpublished draft.

The active mapping source is `artifacts/chavrutai/src/shared/data/lexicon-mappings/bdb.json`. Its `mappings` object currently has 1,563 active keys after `//` organizational entries are excluded. `scripts/add-bdb-mappings.mjs` appends reviewed batches before the file’s `// ── END ──` sentinel, skips duplicate keys, and validates the resulting JSON before writing. `artifacts/chavrutai/src/pages/bdb-abbreviations.tsx` reads the same JSON to build the live filterable table.

The expansion engine is `expandAbbreviations()` in `artifacts/chavrutai/src/lib/dictionary-format.ts`. Before ordinary matching, it repairs a special split-label shape: `<strong>n.</strong>[<strong>m.</strong>]` becomes a single matchable `n.[m.]` while retaining the bold wrapper. The BDB reader also converts `<sup>…</sup>` to inline parentheses before expansion. That pre-expansion shape lets a source such as `Bae<sup>Rel. 68</sup>` become `Bae (Rel. 68)`, which the longer contextual key turns into “Baethgen (Religionsgeschichte 68)” with the closing parenthesis outside the expansion pill.

For each text segment outside real HTML tags, keys are sorted by length, matched with Unicode-aware edge rules, and collected against the unchanged segment. Candidates are sorted by start position and then by longest end at that same position. A left-to-right cursor emits only non-overlapping matches. This explains the verified result `S.E. of; E. of; S.E.` → “south-east of; East of; south-east.” It also prevents generated expansion text from becoming input to a second replacement.

Transliteration lives in `artifacts/chavrutai/src/shared/transliteration.ts`. `annotateAllTransliterations()` applies five disjoint Unicode-block annotators. `annotateTransliterationsInHtml()` in `dictionary-format.ts` uses `DOMParser` and a text-node walker, skips `SCRIPT`, `STYLE`, and `TEXTAREA`, and never edits attributes. A run already followed by a Latin-only bracket annotation is skipped; unchanged conversions are not annotated. On engines without JavaScript’s Unicode `v` regular-expression flag, run detection degrades to a no-op. In server-side contexts without `DOMParser`, the HTML-aware wrapper also returns the fragment unchanged.

Current direct-function outputs are:

| Input | Output |
|---|---|
| `ἄγγελος` | `angelos` |
| `كِتَاب` | `kitāb` |
| `ܡܠܟ` | `מלך` |
| `ࠔࠋࠅࠌ` | `שלום` |
| `ሰላም` | `sälamə` |

The direct helpers return only converted characters; the annotators retain the source run and append the result in brackets. This distinction is why a helper test reports `kitāb`, while a rendered entry shows `كِتَاب [kitāb]`.

Limitations are substantive, not merely technical. Matching is rule-based, not semantic; only encoded contextual exceptions are protected. HTML split points can prevent a phrase spanning tags from matching. Script runs are character-level conversions, not language identification, phonological reconstruction, translation, or textual criticism. Normalization discards some marks by design. Finally, the BDB page’s current rendering pipeline performs layout and superscript normalization, abbreviation expansion, link rewriting, and then text-node transliteration. Changing that order can alter contextual matches or accidentally annotate Greek outline markers before they are wrapped, so examples should be checked against the complete reader as well as direct helper functions.