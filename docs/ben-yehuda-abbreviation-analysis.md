# Ben-Yehuda: preliminary abbreviation and citation analysis

16 November 2026

## Summary

The dictionary needs a **Hebrew-specific abbreviation layer**, rather than the
English mappings used by BDB and Jastrow. The strongest initial candidates are
common explanatory abbreviations, language labels, and grammatical labels.
Citation labels should preferentially use Sefaria's resolved reference—not a
global text substitution—to identify a book.

No abbreviation mappings were enabled in the reader during this analysis.

## Sources and scope

1. Downloaded the **complete List of Books Used: 1,302 source paragraphs**, in
   one request:
   <https://www.sefaria.org/api/v3/texts/Ben_Yehuda_Dictionary,_Prolegomena,_List_of_Books_Used>.
   These are not 1,302 distinct works: headings, continuations, editions, and
   notes occur as separate paragraphs.
2. Used the existing **21,999-headword index**, covering all 22 letters.
3. Requested **113 headwords**: five evenly spaced positions per letter,
   supplemented by a few known entries. Word lookup also returns homographs and
   related matches, producing **187 distinct entry records**, **379 definition
   paragraphs**, **4,602 citation spans**, and **419 footnotes**. All requests
   ultimately succeeded; one initial upstream timeout succeeded on retry.
4. Extracted **1,193 candidate tokens**, with **7,414 occurrences** in this
   sample. Manually reviewed 40 candidates, adding suggested expansions or
   warnings to the CSV.

**These are sample counts, not full-dictionary frequencies.** The sample
deliberately spans the alphabet but is not random; long entries for letters and
common words contribute disproportionately. Definitions and footnotes are both
included. Candidate extraction recognizes Hebrew geresh/gershayim forms,
vocalized forms, Latin dotted forms, some multiword Latin abbreviations, and
uppercase initialisms. It excludes pure uppercase Roman numerals but does not
pretend to distinguish every Hebrew numeral, quotation, and abbreviation.

## Highest-frequency candidates

| Source | Occurrences in sample | Proposed treatment |
|---|---:|---|
| וכו' | 530 | וכולי; preserve quoted source wording unless expansion is explicitly enabled |
| בראש' | 228 | בראשית, in citation context |
| יי' | 222 | Divine-name spelling; do not treat as a normal abbreviation |
| ישע' | 176 | ישעיהו, in citation context |
| עי' | 156 | עיין |
| תהל' | 155 | תהלים |
| במשמ' | 149 | במשמעות |
| ירמ' | 111 | ירמיהו |
| במד' | 110 | במדבר |
| דבר' | 109 | דברים in citations, not indiscriminately in prose |
| ר' | 99 | Context-sensitive רבי / רב |
| ועי' | 91 | ועיין |
| מד"ר | 90 | מדרש רבה; still retain the particular work and locator |
| בערב' | 83 | בערבית |
| ר"ל | 70 | רוצה לומר |

Further useful candidates include וכמו"כ → וכמו כן, בארמ' → בארמית,
בעבר' → בעברית, כ"י → כתב יד, ש"ז → שם זכר, and ש"נ → שם נקבה.
Morphological labels should be recognized in the grammatical introduction,
not automatically everywhere an identical string occurs.

### Ambiguity is substantive

- **מ"ר** occurs both with plural forms, e.g. `מ"ר אבוֹת`, and in citations,
  e.g. `מ"ר בראש' צו`. A global “מדרש רבה” expansion would corrupt morphology;
  a global “מספר רבים” expansion would corrupt references.
- **ע"כ** occurs at the end of a quotation and as a prose connector:
  respectively עד כאן and על כן are plausible. It needs context.
- **ב"ב** occurs both in ordinary Bavli citations and in
  `תוספתא כלים ב"ב ג ט`. The latter belongs to the Bava Batra division of
  Tosefta Kelim, not the Bavli tractate.
- **ר"י** and **ר"ש** identify different people according to the following
  name; the sample includes ר"י חיוג.
- Prefixes matter: עי'/ועי', במשמ'/ובמשמ', ערב'/בערב' should preserve the
  conjunction or preposition rather than create partial-word replacements.
- Niqqud, ASCII quotes, geresh, gershayim, and curly apostrophes need careful
  comparison. Do not erase vocalization distinctions in grammatical labels.

## What the bibliography provides

The list is a **bibliographic authority source, not a two-column abbreviation
key**. It contains full titles, authors, editions, manuscript descriptions,
cross-references, and comments—some themselves abbreviated.

Examples:

- Paragraph 483: מדרש רבה.
- Paragraphs 1228–1229: Gesenius–Buhl's dictionary and
  Gesenius–Kautzsch's grammar.
- Paragraph 1298: *Zeitschrift der Deutschen Morgenländischen Gesellschaft*,
  useful for investigating ZMG/ZDMG.
- A title can continue onto the next paragraph: paragraphs 1274–1275 are one
  example. Splitting each paragraph into a separate “work” would be wrong.

Use this list to verify candidate expansions and create a small citation
authority table. Retain original spellings and edition details as aliases.
Do not infer an abbreviation merely because its letters match a title.

## Citation-link findings and reader fixes

Sefaria's `/api/words/` response supplies stable IDs, neighbors, and raw
definitions, but not all citation links displayed by its reader.

Requesting the same entry from `/api/v3/texts/` with
`return_format=wrap_all_entities` supplies the added citation markup:
**אָב I has 3 anchors in the raw version and 63 in the reader-formatted
version**. The previously tried `wrap_all_entities=1` parameter is not the
correct v3 parameter.

The Bekiut reader now supplements word records with this linked version,
retaining identity and original citation labels. Supported citations link to
Bekiut readers; unsupported works retain Sefaria links. Enrichment is cached
and has a four-second deadline; if unavailable, complete raw definitions
remain readable and the server records a warning.

This does **not** resolve every citation. The entry ה still has only two
anchors even in Sefaria's reader-formatted response. Its unlinked `by-source`
spans are not hyperlinks discarded by Bekiut; they are unresolved upstream.
Those should not become guessed links.

Closed footnote disclosures now stay inline rather than forcing a break
around the numeral. Intentional source paragraph boundaries and optional
dash splits remain intact.

## Batch access: available and missing

**Available now**

- Entire bibliography in one API request.
- All headwords by 22 scoped completion requests with a positive large limit.
- Reproducible, cached entry sampling with three concurrent requests.

**Not located**

- A complete Ben-Yehuda text export in the inspected Sefaria GCS
  `json/Reference/Dictionary/` directory or `misc/` directory.
- A useful full dictionary text in Project Ben-Yehuda's public-domain GitHub
  dump: its catalogue lists “מילון העברית הישנה והחדשה” as item 24412, but
  `html/p22/m24412.html` is an empty-body wrapper, not the dictionary.
  The catalogue contains only 60 works attributed to Eliezer Ben-Yehuda,
  not a separate record for each of the approximately 22,000 dictionary entries.

This is not proof that no bulk export exists elsewhere. A full census would
need an actual lexicon export from Sefaria/Project Ben-Yehuda, or a deliberately
rate-limited, resumable fetch of the headword index. Scanned volumes on Internet
Archive are not a substitute for the reader's structured text.

## Recommended next implementation

1. Start with reviewed expository and language abbreviations, presented as
   opt-in inline expansion or accessible tooltips, using the existing readers'
   controls. Preserve original text for copying when expansion is off.
2. Treat grammar, citations, and ordinary prose as separate contexts.
3. Use linked references as the authority for work names; retain source
   citation labels, locators, and qualifiers.
4. Keep uncertain candidates unexpanded. A slash expansion is less destructive
   than a false single meaning, but leaving the original with an explanatory
   tooltip is often clearer.
5. Obtain the complete structured corpus before reporting global frequencies
   or claiming exhaustive coverage.

## Reproduction and outputs

Run `python scripts/analyze-ben-yehuda-abbreviations.py`.
Raw responses and generated files stay outside Git and publication builds:

- `generated-artifacts/ben-yehuda-analysis/books-used.csv`
- `generated-artifacts/ben-yehuda-analysis/abbreviation-candidates.csv`
- `generated-artifacts/ben-yehuda-analysis/citation-labels.csv`
- `generated-artifacts/ben-yehuda-analysis/summary.json`

The candidate CSV includes occurrence counts, entry counts, bibliography
occurrences, review notes, and up to two different entry examples with Bekiut
links and stable IDs. Existing cached API responses are reused on reruns.

Other sources:

- <https://github.com/projectbenyehuda/public_domain_dump>
- <https://raw.githubusercontent.com/projectbenyehuda/public_domain_dump/master/html/p22/m24412.html>
- <https://github.com/Sefaria/Sefaria-Export>
- <https://github.com/Sefaria/Sefaria-Project/blob/master/sefaria/model/text_request_adapter.py>
