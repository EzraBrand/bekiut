# BDB -est verb review (internal; not runtime mappings)

**Review list, not an approved mapping batch.** The companion [JSON](bdb-est-verbs.json)
preserves each matched occurrence and all excluded tokens; the [CSV](bdb-est-verbs.csv)
is a UTF-8-BOM candidate review sheet with one row per lowercased form and every
source excerpt. Do not import these hypotheses into the reader without checking
individual live Sefaria contexts. No runtime mappings or changelog were changed.

## Source and coverage

- Searched the BDB corpus itself, **not an external verb list**: the third-party
  unabridged BDB [eliranwong/unabridged-BDB-Hebrew-lexicon](https://github.com/eliranwong/unabridged-BDB-Hebrew-lexicon),
  raw [`DictBDB.json`](https://raw.githubusercontent.com/eliranwong/unabridged-BDB-Hebrew-lexicon/master/DictBDB.json).
  Downloaded outside the repository to `/tmp/DictBDB-est.json`; SHA-256
  `5d826c580a4dd06f54a53d1e19b5e8c354aab0180e200849e3148b89f370e33d`,
  byte-identical to the source used by the [-eth review](bdb-eth-verbs.md)
  (GitHub blob SHA `9d6011ea9e3c61833be7a905d6d18e2363aaf37c`).
  The third-party corpus was not committed.
- The downloaded array has **8,091** `{top, def}` objects: 8,090 `H<number>`
  lexicon entries plus `DictInfo`. All `def` strings were scanned, including
  the header. HTML tags were replaced with spaces, numeric and common named
  entities decoded, and case-insensitive complete Unicode letter/mark tokens
  ending `est` matched with letter/number/mark/underscore boundaries. Grouping
  is lowercase; each original spelling, entry ID, heading, Hebrew headword
  when present, and neighboring excerpt is kept for **every** occurrence.
  Tags were **not** joined, and HTML attributes were not searched.

| Downloaded third-party file only | Types | Occurrences |
|---|---:|---:|
| All whole-token `-est` matches | 153 | 1,955 |
| English archaic second-person verb candidates | 73 | 101 |
| Excluded nonverbs / modern verbs / corrupt tokens | 80 | 1,854 |
| Candidate types with an existing exact runtime mapping key | 3 | 9 |

`est` alone (789) is a non-English/abbreviation token; `priest` (247),
`west` (114), `rest` (102), `harvest` (46), `best` (39), and superlatives
like `highest` are not archaic second-person finite verbs. Contemporary verbs
like `suggest`, `arrest`, and `wrest` are excluded too. The anomalous
`suffest` occurs in “to suffest also degree” and is excluded as probable OCR,
not treated as a reliable verb. Reasons and **all** excerpts for excluded
forms are in JSON.

## Grammatical interpretation and live check

An archaic `-est` form agrees with **second-person singular** (“thou
knowest”). Its proposed grammatical modernization is the **second-person
base form** (“you **know**”), not “you knows.” The separate CSV
`third_person_singular_form` column answers the requested `-est` → `-s`
comparison (“he/she **knows**”) without suggesting that `knows` is a
grammatically correct replacement in a “thou/you” clause:

| Source | Proposed second-person base | Separate third-person singular | Caveat |
|---|---|---|---|
| `knowest` | `know` | `knows` | “thou knowest” → “you know” |
| `makest` | `make` | `makes` | Check object and subject in context |
| `doest` | `do` | `does` | Already exactly mapped to `do` |
| `mayest` | `may` | `may` | Modal auxiliaries do not add `-s`; already mapped |
| `sawest` | `see` | `sees` | Past “thou sawest” → “you saw” retains tense; these columns are lemma/present comparison only |
| `shewest` | `show` | `shows` | Historical spelling, not a mechanical suffix removal |
| `decrest` | `decree` | `decrees` | Suspect OCR/abbreviation; verify before use |

The example `knowest` was independently confirmed in the **live Sefaria**
[BDB, אֵת²](https://www.sefaria.org/api/v3/texts/BDB,_%D7%90%D6%B5%D7%AA%C2%B2)
entry (“Gen 30:29 … thou knowest … how thy cattle fared with me”).
The local `/api/bdb/search?query=את` also returns it under headword
`אֵת²` (`BDB00955`). The unnumbered `אֵת` is a **different** entry;
its lack of `knowest` does not contradict the numbered-entry check.
Live Sefaria text and the downloaded third-party edition may differ; do not
equate their frequencies.

The existing runtime `bdb.json` was checked against **exact spelling keys**
inside `mappings`, not prefixes or case-folded matches: `mayest → may`,
`doest → do`, and `wouldest → would` are already covered. Nothing was
added or changed. All candidate records contain `existingExactMappings`,
`reviewFlags`, `status`, and every occurrence; even an empty existing mapping
object is an explicit exact-key comparison, not a claim about nearby keys.

## Limitations

These are hypotheses, not automatic whole-word replacements. Past-tense
`becamest`, `camest`, `forgattest`, `gavest`, `grewest`, and `sawest` need
tense-sensitive renderings; the base and third-person-present columns alone
lose past tense. Modal `mayest`, `mightest`, `shouldest`, and `wouldest` have
invariant modern forms. `decrest` may be a damaged spelling, and
`chancest` has an unusual gloss. Name etymologies, alternate readings,
editorial glosses, and OCR can alter the right choice. The adjacent excerpts
are shortened for review but **none of the matched occurrences is omitted**;
tokens crossing HTML tags, attributes, uncommon named entities, and editorial
differences between editions may evade this discovery method. Counts are for
this downloadable third-party file only, not a definitive Sefaria total.