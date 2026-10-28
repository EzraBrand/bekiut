# Checking Jastrow’s abbreviations against the full dictionary

I scanned 32,512 entries in a downloaded copy of Marcus Jastrow’s dictionary to find abbreviations missing from the expansion table in [Bekiut’s Jastrow reader](https://bekiut.com/jastrow). The scan covered 68,169 text fields, including definitions, nested senses, grammatical labels, and language notes. By the latest pass, the reader’s table contained 837 mapping keys.

The purpose was practical. Jastrow’s compressed English, grammatical terminology, and abbreviated references can make an otherwise accessible entry difficult to follow. Bekiut lets readers expand these forms inline or retain the original abbreviations and inspect their meanings in popovers. Both presentations depend on identifying what a shortened form means in its particular occurrence.

The source for this audit was the local JSON dump obtained from [UniquePixels’ Jastrow repository](https://github.com/UniquePixels/jastrow/tree/05c8a79bbf2408f3909151d08d71a6f3e33e9ead/data/raw). It provided a reproducible body of text that I could examine without fetching thousands of individual entries. It is a snapshot; the corresponding entries on Sefaria can subsequently change.

## Finding candidates

I began with a simple clue: a lowercase letter followed by a period and then another lowercase word. A form such as “denomin. verb” is a plausible abbreviation. The same clue also finds ordinary sentence boundaries, irregular capitalization, and punctuation errors, so it needs further checks.

The existing expansion table supplied a starting set of known forms. Before collecting candidates, I marked occurrences already covered by those mappings, giving longer phrases priority. This matters for a phrase such as “part. pass.”: its second component should not become a new candidate when the complete phrase already has an expansion.

I then broadened the search to include capitalized forms, abbreviations before Hebrew text or numbers, and sequences of abbreviated words. Bibliographic references frequently occur in those settings. A lowercase-only search would miss useful candidates such as “Eduy.” before a chapter reference.

The output is a CSV containing occurrence counts, the number of entries containing each candidate, and two examples from different entries where available. Each example has a link to its entry in Bekiut, including the stable entry identifier. I sorted the latest version by total occurrences and added review notes to the highest-ranked results.

## What the review found

Several frequent residual forms have straightforward proposed expansions:

| Candidate | Residual occurrences | Proposed expansion |
|---|---:|---|
| `i.e.` | 1,168 | that is |
| `v. supra.` | 435 | see above |
| `Eduy.` | 112 | Eduyot |
| `Ezek.` | 92 | Ezekiel |
| `Git.` | 66 | Gittin |
| `ibid.` | 61 | in the same place |

These are counts in the downloaded text after the audit’s existing-mapping checks. They are not counts of independently verified display errors. Some candidates overlap: a multi-word expression and one of its components can both appear in the results.

An earlier review led to additions including “denomin.” for “denominative,” “dialect.” for “dialectal,” and “Babyl.” for “Babylonian.” Other additions addressed capitalization or longer references: “Oth.” became “Other,” and “Tan. d’be El.” became “Tanna Devei Eliyahu.” The six rows above remain suggestions from the subsequent pass.

Reading the examples also exposed problems in the detector. Initially, “i.e.” was split into two single-letter candidates. I changed the detector to retain the full expression. Multi-word detection introduced a different problem: it could join the end of an English sentence to the next citation, producing a candidate such as “him. Ib.” I added an explicit filter for reviewed sentence-ending words. Other false positives remain visible with review labels.

## When a letter stands for the entry word

The audit followed a related correction in the reader. In the entry for *melitsah*, an italicized “m.” in the phrase “why is it called m.?” was expanding to “masculine.” Here the letter refers back to the word under discussion.

Searching the dump showed similar uses elsewhere. In the mezuzah entry, “to fasten the m. at the door” refers to a mezuzah. Other entries use italicized “h.,” “s.,” or “V.” as shorthand. These occurrences need to remain distinct from grammatical labels and citation instructions.

The reader now has conservative protection for several such contexts. It retains clear grammatical and citation expansions while preserving ambiguous isolated initials. The audit likewise excludes standalone single-letter candidates, although it retains letters inside multi-word expressions. A phrase can provide information that its individual letters lack.

## Ambiguity remains a separate problem

Some longer abbreviations also resist a single expansion. The examples for “acc.” include both a grammatical accusative and the phrase “acc. to.” “Fr.” can point to different scholars; it cannot safely inherit the meaning of lowercase “fr.,” which the reader expands as “from.”

The next step is a small contextual system for these cases. Longer phrases such as “acc. to” can resolve some occurrences directly. Grammatical surroundings and full bibliographic references can resolve others. Where the evidence remains insufficient, the reader could retain the abbreviation and list possible meanings in its popover.

That broader system is still a TODO. The completed work consists of the corpus scan, a reviewable export, specific mapping additions, and targeted protections against misleading expansions. The remaining candidates require decisions grounded in their examples. Frequency helps determine where to start; it does not establish what an abbreviation means.

---

## Technical appendix

### Data and implementation

The audit is written in Python in `scripts/audit-jastrow-missing-mappings.py`. It reads the two local JSONL files and rejects duplicate entry identifiers. It recursively collects definitions, morphology, and language notes, strips HTML tags, and decodes HTML entities.

The mapping source is `artifacts/chavrutai/src/shared/data/lexicon-mappings/jastrow.json`. A longest-first regular expression approximates known mapping coverage. This approximation does not reproduce every context-dependent rule in the browser formatter.

The detector collects dotted tokens, including internally dotted expressions such as `i.e.`, and sequences of two to five dotted words. A few connectors, including `d’be`, are permitted within compound candidates. Standalone single-letter forms are excluded. A reviewed stoplist filters common sentence-ending words.

For single-token candidates, overlap with an existing mapping suppresses the candidate. For multi-word candidates, partial coverage is permitted: an unmapped expression may contain already-mapped components. Completely covered expressions are excluded. Consequently, compound detection can still group adjacent, independent abbreviations. Those groups require review.

The CSV includes frequency, distinct-entry count, lowercase-following count, possible existing-key variants, review status, proposed expansion, and two linked examples. Variant comparison normalizes case, whitespace, Unicode composition, and one apostrophe form. It provides suggestions rather than automatically transferring meanings between keys.

### Challenges and checks

1. **Fragments of existing mappings.** Longest-first coverage avoids repeatedly proposing components of recognized phrases.
2. **Internally dotted expressions.** Treating `i.e.` as one candidate prevents misleading single-letter results.
3. **Adjacent sentences and citations.** The reviewed stoplist removes examples such as `him. Ib.`; it does not eliminate every ordinary-word false positive.
4. **Examples from the same entry.** The export selects different entry identifiers for its two example columns. If only one entry contains a candidate, the second remains empty.
5. **Ambiguous expansions.** Review annotations distinguish suggestions, context-dependent forms, and false positives. The audit does not modify the mapping dictionary.
6. **Reproducibility.** The source revision is linked above. Mapping updates change residual counts, so the table should be regenerated against the intended mapping version.

The file uses UTF-8 with a byte-order mark for spreadsheet compatibility. Potential spreadsheet-formula prefixes are escaped. Entry links encode both the headword and stable identifier.

The existing dictionary is useful as a set of known positive examples, but no held-out recall benchmark or statistically representative precision evaluation has yet been completed. The manual review covers selected high-frequency candidates. Neither that review nor the broad inventory establishes that every missing abbreviation has been found.

## Data appendix: ambiguous and rejected candidates

| Form | Observed issue | Treatment |
|---|---|---|
| `acc.` | Accusative in grammar; according in `acc. to` | Prefer contextual rules |
| `Fr.` | Different scholars; unrelated to lowercase `fr.` | Expand verified full references |
| `R. J.` | Personal-name shorthand | Preserve until identified |
| `d’R. El. ch.` | Partial title plus chapter label | Review the complete title |
| `contract.` | Abbreviation in one setting, ordinary verb in another | Avoid a global replacement |
| `fire.`, `wine.`, `world.` | Ordinary sentence-ending words | Mark as false positives |
