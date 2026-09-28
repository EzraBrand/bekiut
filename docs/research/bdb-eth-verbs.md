# BDB -eth verb review (internal; not runtime mappings)

**Review list, not an approved mapping batch.** Do not import the companion
[`bdb-eth-verbs.json`](bdb-eth-verbs.json) into the reader without checking each
form in Sefaria, especially name etymologies, textual alternatives and OCR
spellings. No mappings, reader code or changelog were changed for this research.
Candidates were discovered from BDB itself; no external archaic-verb list was
used.

## Source and coverage

- Third-party unabridged BDB: [eliranwong/unabridged-BDB-Hebrew-lexicon](https://github.com/eliranwong/unabridged-BDB-Hebrew-lexicon), raw [`DictBDB.json`](https://raw.githubusercontent.com/eliranwong/unabridged-BDB-Hebrew-lexicon/master/DictBDB.json), downloaded to `/tmp` on **2026-09-28 UTC**. GitHub blob SHA `9d6011ea9e3c61833be7a905d6d18e2363aaf37c`; downloaded file SHA-256 `5d826c580a4dd06f54a53d1e19b5e8c354aab0180e200849e3148b89f370e33d`. The full third-party file is **not** committed.
- Actual downloaded schema: **array of 8,091 objects**, each `{ "top": "...", "def": "HTML..." }`; one `DictInfo` object and **8,090** `H<number>` entries. `top` is the third-party entry ID; `def` contains both its heading/headword and body HTML. Unlike this full source, `scripts/.cache/bdb-corpus` contains only **200** cached JSON files, whose contents are Sefaria lexicon-object arrays (e.g. `headword`, `parent_lexicon`, `content`); they cannot establish full-corpus counts.
- All 8,091 `def` strings were scanned, including the header (which has no match). Every HTML tag was replaced with a **space**, rather than concatenating words on opposite sides of a tag. Numeric and common named HTML entities were decoded, then case-insensitive entire Unicode letter/mark tokens ending in `eth` were selected with Unicode letter/number/mark/underscore boundaries. Original spelling and lowercased grouping, every match's entry ID, heading/headword, Hebrew headword where present, and an adjacent excerpt were retained in JSON. This intentionally does **not** extract matches from HTML attributes or tokens interrupted by tags. Other uncommon named entities, line-break conventions and editorial spelling differences may affect discovery.

| Scope: downloaded third-party file only | Types | Occurrences |
|---|---:|---:|
| All whole-token `-eth` matches | 441 | 818 |
| English verb-form candidates | 252 | 483 |
| Excluded nonverbs / transliterations / names | 189 | 335 |
| Candidate types already exactly keyed in `bdb.json` | 2 | 36 |

The existing runtime map was compared using **exact spelling keys in
`mappings`**, not keys at the JSON top level, prefixes or approximate matches:
`maketh → makes` and `goeth → goes` are already covered. `Keepeth` occurs once
alongside three lowercase `keepeth` occurrences; there is no exact existing
key for either spelling. Existing keys were not changed. Proposed modern forms
are hypotheses, including spelling-aware irregulars (e.g. `increaseth →
increases`, `contendeth → contends`, `sheweth → shows`), **not** automatically
safe global replacements.

## Live Sefaria cross-checks

The user example [BDB, יָֽרָבְעָם](https://www.sefaria.org/api/v3/texts/BDB,_%D7%99%D6%B8%D6%BD%D7%A8%D6%B8%D7%91%D6%B0%D7%A2%D6%B8%D7%9D)
was checked on 2026-09-28: its English version contains both **“the people
increaseth”** and **“the people contendeth”**, as well as **“ʿAmm contendeth”**.
The corresponding third-party record `H3379` has these forms too; its count is
not the live Sefaria count. Additional live BDB entry checks returned:

| Form | Live entry | Result / short context |
|---|---|---|
| `maketh` | `דָּלַק` | Present: “his arrows he maketh burning ones” |
| `giveth` | `חָכָם` | Present: “reproof which giveth life” |
| `sheweth` | `אֱמוּנָה` | Present: “sheweth forth righteousness” |
| `covereth` | `כָּסָה` | Present: “love covereth over all sins” |
| `quivereth` | `יָרַע` | Present: “his soul quivereth” |
| `soweth` | `יִזְרְעֶאל` | Present in a **proper-name etymology**: “God soweth” |
| `goeth` | `הָלַךְ` | Present: “thing that goeth on” (already mapped) |

Other exact-lemma probes did not reproduce `perisheth` and `runneth` in their
selected live entry, and one `אֹמֶץ` probe returned 404; these are **not**
claims of corpus absence. The downloadable edition and live Sefaria's
digitization/lemma normalization differ. Review against the exact live entry
before approving any candidate. Name-derived examples are still English
verbs in context, *not* transliterations to delete: `contendeth`,
`increaseth`, `soweth`, `stengtheneth` (apparent OCR typo), and `apointeth`
(apparent OCR typo) merit particular scrutiny.

## Classification and limitations

`beth` (64), `teeth` (36), `Ashtoreth`, `Mephibosheth`, `Topheth`,
`Qoheleth`, `shibboleth` and many romanized Hebrew headwords are **not**
English finite verbs. The `eth` token itself mixes Hebrew `eth`, `Eth.` for
Ethiopic, a place name, and hyphenated OCR fragments (`keep-eth`); it is
excluded. `fiftieth`, `fortieth`, `twentieth` are ordinals. Each excluded type
has its own count, reason and evidence in JSON.

Candidate confidence is lowered for apparent errors/variant glosses such as
`apointeth → appoints`, `stengtheneth → strengthens`, `boreth → bores`,
`hasteth → hastens`, `perisheth → perishes` and `reddeneth → reddens`.
Contextual name-etymology flags in JSON are a prompt for human checking, not
a claim that such English verbs should be excluded. Some modernizations are
semantic choices rather than mechanical suffix swaps (`sheweth → shows`);
check the surrounding verse/gloss. Counts represent visible whole-token
matches in **this** downloaded edition, not a definitive Sefaria frequency
table. For each JSON candidate, `evidence` includes **every downloaded
occurrence**, while `existingExactMappings` records only exact live mapping
keys. Do not infer coverage from partial cache files or treat the proposed
list as pre-approved runtime data.