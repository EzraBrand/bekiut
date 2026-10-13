# Making BDB and Jastrow Easier to Read on Bekiut

*October 13, 2026*

I have been revising the BDB and Jastrow dictionary readers on Bekiut, with much of the recent work concentrated in September and early October. Both readers use text supplied by Sefaria. I have added explanations of abbreviations, navigation within long entries, and formatting changes intended to make definitions and references easier to follow.

Brown–Driver–Briggs covers biblical Hebrew and Aramaic. Jastrow covers the language of the Targumim, the two Talmuds, and midrashic literature. Both dictionaries compress a substantial amount of information into their entries. A definition can include grammatical labels, references to manuscripts and ancient translations, citations of other scholars, and several levels of numbered or lettered subdivisions.

My work concerns how that information is presented. I have compared selected entries with their source data, corrected omissions, and added ways to consult explanations without expanding every abbreviation at once. The dictionaries’ historical analyses and etymologies remain those of the underlying works.

## Keeping the abbreviation visible

I initially relied on inline expansion: replacing a recognized abbreviation with its full meaning. This is useful when the notation is unfamiliar. It can also make an already long entry considerably longer, especially where references repeat.

I have now added an alternative in which abbreviations remain visible. Hovering over or focusing on a recognized abbreviation shows its explanation; clicking or tapping keeps the explanation open. Readers who prefer the expanded text can select “Expand abbreviations inline.” I first introduced this arrangement in BDB and then applied it to Jastrow.

The two modes serve different reading habits. Someone familiar with the dictionary can leave common forms alone and inspect an occasional unfamiliar reference. Someone using it less frequently can read the expanded version throughout. In Jastrow, the setting is retained when moving to another entry or reloading in the same browser tab.

I have continued adding mappings alongside this interface change. They include grammatical terms such as `neut. v.` for “neuter verb,” references such as `Matt. K.` for “Matnot Kehunah,” and transliterated names such as `K’thib` for “Ketiv.” The public mapping tables list the expressions and their explanations.

Some replacements also modernize English: “thou art” becomes “you are,” and “proselyte” becomes “convert.” These involve a different kind of judgment from expanding a bibliographical abbreviation. The explanation mode leaves the source expression visible, which makes the replacement easier to assess. I would eventually like to give abbreviation expansion and vocabulary modernization separate controls.

## Checking what an abbreviation means in context

Adding a mapping can introduce an error elsewhere if the same expression has another use. I have therefore been checking longer references and the text surrounding short forms.

Jastrow’s `ch.` provides an example. It can refer to Aramaic, but in `Sifra K’dosh. ch. III, Par. 2` it means “chapter.” I added a rule that recognizes the chapter meaning before an Arabic or Roman numeral. Elsewhere, the existing language explanation remains.

Longer expressions need to take precedence over their components. `Matt.` now maps to “Matot,” while `Matt. K.` retains “Matnot Kehunah.” Similarly, `Sm.` maps to “Smith,” but `Sm. Ant.` identifies Smith’s dictionary of antiquities. Expanding each component independently would lose the reference’s meaning.

In an October review, I examined a sample of 191 distinct Jastrow entries returned by 132 source queries. I compared the forms used in those entries with the existing Jastrow mappings and with BDB’s mappings. That review produced 18 additions, including forms for “construct form,” “infinitive,” and “transposition.” It also identified cases where borrowing a BDB expansion would have been misleading. The sample covered entries distributed through the headword index, together with several common words; it was not a full-corpus audit.

Roman numerals present a related problem. I extended Jastrow’s multi-letter numeral mappings through 49, including `XXXII` for 32. Single letters remain excluded from general conversion. A more specific rule handles `I,` before a numeric page reference, so `I, 27a` can become `1, 27a` without changing an isolated `I`.

## Navigating the entry

BDB’s longer entries can have several layers of subdivisions. I have worked on an outline that links to recognized verbal stems, numbered senses, lettered sections, and Greek submarkers. A floating outline remains accessible further down the page, and the main index can be collapsed.

I added a collapsible index to Jastrow as well. Its definition snippets now use opening italicized words rather than continuing into surrounding explanations and citations. The labels are extracted from source formatting. They can help locate a passage, but they should not be read as independently written summaries.

Paragraph spacing has required adjustment too. BDB offers optional additional splitting at semicolons. Jastrow offers additional breaks at dashes and certain citation boundaries. I reduced the excessive gaps in the latter display, then adjusted them again when the result became too compressed. The extra-splitting setting now persists alongside the abbreviation setting within the same tab.

I also corrected a problem with Jastrow’s index links. Clicking a section link could rerun the entry search and remove the section target from the address. The reader now distinguishes navigation within an entry from a new search. A direct link to a section waits for the entry to load before scrolling to it.

## Recovering information that was being lost

Several fixes came from comparing what the reader displayed with what Sefaria supplied.

In BDB’s אָב², the occurrence count of 1,191 was missing. The source supplied it separately from the definition text, so formatting the definition alone could not recover it. I updated the reader to include occurrence metadata where available.

References to similarly spelled entries needed attention as well. Roman numerals and superscripts can distinguish different headwords or homographs. I improved the handling of those suffixes in both readers so that a reference can select the intended entry rather than simply return a group of similarly spelled results. Jastrow’s exact-entry addresses retain the stable entry identifier.

In BDB, I separated the displayed citation, its destination, and additional qualifiers. Expanding a biblical book name should preserve the words and numbers supplied alongside it. Where the displayed reference disagrees with the link metadata, retaining the source label leaves a discrepancy that still needs checking against the edition.

I also corrected the treatment of the Greek psi, `ψ` or `Ψ`. Standing alone in BDB, it can represent “Psalm(s).” Treating it as ordinary Greek produced an unwanted transliteration. The reader now recognizes the abbreviation while leaving the letter unchanged inside Greek words.

Some failures were less visible in the source. In Jastrow’s כָּבַשׁ, the period of `&c.` sits inside a separate italic tag. In כּוֹבֶד, `fem` is italicized while its period sits outside the tag. Both look like complete abbreviations to a reader, but the formatter was encountering separate pieces. I added normalization for these cases so the complete expression can be recognized without removing the surrounding emphasis.

## The limits of the review

I have added tests for the mappings and for cases where punctuation, formatting, or a longer reference affects the result. These tests can establish that an intended rule behaves consistently. They cannot establish that every expansion is philologically correct, or that every entry has been checked.

The remaining work includes more accurate BDB outline labels, clearer handling of short cross-reference entries, and a source-comparison view. The current unexpanded display still includes changes to citation labels, paragraph structure, and other formatting. A separate comparison view would make those interventions easier to inspect, particularly when an apparent presentation problem turns out to originate in the source data.

## Technical Appendix

### Implementation and sequence

These changes are implemented in the existing React/TypeScript readers, rather than a standalone analysis script. The principal reader files are `bdb.tsx` and `jastrow.tsx` under `artifacts/chavrutai/src/pages/`. Shared formatting is in `src/lib/dictionary-format.ts`; Jastrow’s source normalization and index preparation are in `src/lib/jastrow-presentation.ts`. The two mapping dictionaries are JSON files under `src/shared/data/lexicon-mappings/`.

For Jastrow, I first normalize known malformed links and origin-note continuations. I then identify source headings, attach section identifiers, and apply optional paragraph breaks. Before abbreviation matching, I normalize known expressions split by emphasis markup. Abbreviation expansion, link conversion, and transliteration annotation follow. The index links point to identifiers retained in the rendered entry.

The abbreviation matcher isolates text from HTML tags so that replacements do not alter attributes or link destinations. It finds candidate matches using boundary checks, then resolves overlaps by position and length. At the same starting position, the longer match takes precedence. Context rules inspect following text before accepting particular expansions. The display mode determines whether a match becomes expanded text or an original expression with explanation metadata.

### Challenges and resolutions

1. **Overlapping references.** Short forms can occur within longer citations. I test expressions such as `Matt. K.` and `Sm. Ant.` alongside their component mappings, including both display modes.

2. **Ambiguous numerals and language labels.** General numeral conversion excludes single letters. Separate rules recognize forms such as `I,` before a numeric page locator and `ch.` before an Arabic or Roman numeral.

3. **Formatting inside abbreviations.** HTML can separate an abbreviation from its period. Normalization joins recognized forms such as `<i>fem</i>.` before matching, while leaving ordinary italic prose and surrounding punctuation intact.

4. **Missing information outside definitions.** BDB occurrence counts may arrive as separate metadata. I include that metadata where available; I do not calculate new biblical occurrence counts.

5. **Asynchronous section navigation.** A section target may not exist when a direct URL first opens. The reader scrolls after the entry is rendered and avoids treating fragment-only navigation as a new search.

### Verification and scope

I used selected source entries, the documented 191-entry Jastrow sample, and automated tests for mapping precedence, text boundaries, and formatting. The review remains partial. Improvements recorded in September and October should be distinguished from older reader features and from proposals still awaiting implementation. A successful test demonstrates the behavior specified by that test; it does not validate the dictionary’s historical scholarship or resolve conflicting source citations.
