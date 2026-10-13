# Reading BDB and Jastrow on Bekiut: Abbreviations, Navigation, and Source Fidelity

*Draft — October 13, 2026*

<!-- Length target: approximately three pages of main text and one page of appendix. Actual pagination depends on typography. This draft draws on the project changelog, recent Git history, reader implementation, and QA notes; it is not a full-corpus evaluation. -->

Brown–Driver–Briggs and Marcus Jastrow’s dictionary remain useful reference works for biblical Hebrew and rabbinic Hebrew and Aramaic. Their presentation, however, assumes considerable familiarity with the conventions of printed lexicography. Definitions share space with grammatical labels, abbreviated book titles, manuscript references, ancient versions, and discussions of earlier scholarship. A short entry may be straightforward to read. A long entry can require repeated consultation of abbreviation lists and considerable effort to locate a particular sense.

The BDB and Jastrow readers on Bekiut use dictionary data supplied by Sefaria, with additional formatting, navigation, and explanations. Much of the work in September and early October has concerned this presentation layer: making abbreviations intelligible, improving movement within and between entries, and checking that formatting changes do not remove information from the source.

These readers are not new editions of either dictionary. They do not systematically revise the lexicography, reconsider etymologies, or incorporate subsequent scholarship. Their more limited purpose is to make the existing works easier to consult, while making the assistance supplied by the interface available without requiring readers to use it in every instance.

## Abbreviations: explanations when needed

An important recent change is the choice between retaining abbreviations and expanding them in the text. In the default display, recognized abbreviations remain visible. Readers can hover over or focus on an abbreviation for an explanation, or click or tap to keep the explanation open. An “Expand abbreviations inline” option replaces the abbreviated forms with their mapped meanings.

The distinction matters in citation-heavy entries. Expanding every abbreviation can help someone unfamiliar with the dictionary, but it also makes a compact paragraph substantially longer. Readers who already know the common forms may prefer to consult only the occasional unfamiliar item. The two modes support these different uses without requiring separate versions of an entry.

The mapping lists have also grown. Recent Jastrow additions include grammatical terms, Torah portions, editions, scholars, and reference works: for example, `neut. v.` becomes “neuter verb,” `K’thib` becomes “Ketiv,” and `Matt. K.` becomes “Matnot Kehunah.” Some mappings modernize wording rather than explain abbreviations: “thou art” becomes “you are,” and “proselyte” becomes “convert.”

Those two operations should not be treated as identical. Expanding a conventional abbreviation usually aims to recover an intended full form; replacing vocabulary makes an editorial choice about how to express it. Some choices are straightforward, while others can affect nuance. The unexpanded display makes it possible to inspect the original mapped expression, but it is not an entirely unprocessed source view: other formatting, citation, and transliteration changes still apply.

The [BDB abbreviation table](/bdb/abbreviations) and [Jastrow abbreviation table](/jastrow/abbreviations) make the mappings available for inspection. The BDB table has received further work on categories, reference links, scrolling, and mobile column widths. These tables also provide a practical basis for reporting omissions or questionable expansions.

## Context matters more than the length of a mapping list

A dictionary reader cannot reliably expand abbreviations by replacing every matching string in isolation. The same letters can have different meanings, and a short abbreviation may occur inside a longer reference.

In Jastrow, `ch.` ordinarily maps to “Aramaic,” but before an Arabic or Roman numeral it should read “chapter.” Thus, in a reference such as `Sifra K’dosh. ch. III, Par. 2`, the numeral changes how `ch.` is interpreted. Similarly, `Matt.` now expands to “Matot,” while the longer `Matt. K.` must retain its separate meaning.

Roman numerals require comparable restraint. Jastrow’s multi-letter numerals are now mapped through 49, in uppercase and lowercase. Single-letter forms are not converted indiscriminately. Specific punctuation and context can justify an exception: `I,` becomes `1,` before a numeric page reference, as in `I, 27a`. An isolated `I` remains unchanged.

BDB supplies another example. A standalone Greek psi, `ψ` or `Ψ`, can represent “Psalm(s).” It should not acquire a transliteration as though it were an ordinary Greek word, nor should the corresponding letter be replaced when it occurs within a Greek word. The reader now distinguishes these uses.

Cross-dictionary comparisons are useful, but they do not eliminate the need to inspect context. A documented October review examined 191 distinct Jastrow entries returned by 132 source queries and compared their abbreviations with existing mappings, including BDB’s. It produced 18 additions while rejecting misleading transfers. For instance, Jastrow’s `Sm. Ant.` refers to Smith’s dictionary of antiquities; importing meanings for its component abbreviations from another dictionary would misidentify the reference. This was a sample review, not an audit of every entry.

## Finding a sense within a long entry

Long entries need navigation as well as readable typography. BDB’s hierarchical outline provides links to recognized verbal stems, numbered senses, lettered sections, and Greek submarkers. Its floating outline remains available while reading further down the page. The main entry index can now be collapsed.

Jastrow has gained a collapsible entry index as well. Its definition snippets are restricted to opening italicized words rather than continuing into surrounding explanations and citations. Numbered and grammatical headings remain available as navigation labels. This is a deliberately selective index generated from source formatting, not a newly authored summary of the entry.

Paragraph splitting is optional. BDB offers additional splitting at semicolons, now off by default; Jastrow offers additional breaks at dashes and certain citation boundaries. Recent adjustments reduced excessive gaps without leaving the split paragraphs tightly compressed. Jastrow also retains both the abbreviation-display and additional-splitting settings when moving between entries or reloading in the same tab.

The links themselves have needed attention. A Jastrow index click previously could trigger another search and remove the section fragment from the URL. Fragment navigation is now distinguished from entry navigation, and direct section links wait for the entry to load before scrolling. These are small interface details, but they determine whether an index actually helps.

## Preserving information while changing its presentation

Some of the most consequential fixes have involved information that was present in the source data but missing or misleading in the reader.

BDB occurrence counts are one example. Some counts accompany the headword as separate metadata rather than appearing in the definition body. The reader now retrieves that information where available, including the count of 1,191 for אָב². Rendering only the definition text had not been sufficient.

Cross-references present a different problem. Entries with the same spelling may be distinguished by Roman numerals or superscripts. Recent work on both readers improves selection of the intended homograph rather than merely returning similarly spelled entries. Jastrow’s exact-entry URLs retain the stable entry identifier. Its grammatical information is also displayed before the definitions, and known malformed links and origin-note fragments are normalized.

BDB citation handling now distinguishes a link’s destination, its displayed reference, and additional source qualifiers. Expanding a book name should not discard text printed beside the locator. Where a source label and link metadata disagree, preserving the printed information does not by itself resolve which reference is correct; that may still require checking the edition.

Even apparently ordinary abbreviation failures can originate in markup. In Jastrow’s כָּבַשׁ, the period of `&c.` is separately italicized. In כּוֹבֶד, `fem` is italicized but its period is outside the italic markup. Both look like complete abbreviations on screen, yet the formatter initially encountered separate pieces. Targeted normalization now allows these known abbreviations to be recognized while retaining surrounding emphasis and punctuation.

## What remains to be done

The recent work makes the readers more usable, but it does not establish that every entry is rendered correctly. Automated tests cover specific mappings, contextual precedence, boundaries, and formatting cases; comparisons with selected source entries provide a different kind of check. Neither amounts to a full-corpus scholarly review.

Remaining questions include more reliable BDB outline labels, clearer presentation of short cross-reference entries, and a source-comparison view. Separating vocabulary modernization from abbreviation explanation would also give readers more precise control over editorial assistance.

For now, the practical improvement is a reader that offers more help with dense notation while preserving access to recognizable source expressions. The continuing task is to check that this assistance clarifies the dictionaries without silently substituting a different argument, reference, or entry.

---

## Appendix: examples, scope, and documentation

### Selected examples

| Entry or expression | Problem addressed | Current treatment |
|---|---|---|
| BDB אָב² | A headword occurrence count was absent from the displayed definition. | Uses separately supplied occurrence metadata, including 1,191 for this entry. |
| BDB standalone `ψ` / `Ψ` | A citation symbol could be treated as Greek requiring transliteration. | Explains it as “Psalm(s),” without changing letters inside Greek words. |
| Jastrow `Matt.` / `Matt. K.` | A short mapping could interfere with a longer bibliographical reference. | Distinguishes “Matot” from “Matnot Kehunah.” |
| Jastrow `ch. III` | A language expansion was inappropriate before a chapter number. | Interprets `ch.` as “chapter” before Arabic or Roman numerals. |
| Jastrow `I, 27a` | Global replacement of a single Roman letter would be unsafe. | Converts `I,` only before a numeric page locator. |
| Jastrow כָּבַשׁ and כּוֹבֶד | Italic markup separated `&c.` or `fem.` from its period. | Normalizes the relevant split so the complete abbreviation can be recognized. |
| Jastrow הָלַךְ | Section links could rerun the entry search and lose their targets. | Preserves fragment navigation and scrolls after asynchronous entry loading. |

### Reading and verification links

- [BDB reader](/bdb) and [Jastrow reader](/jastrow).
- [Jastrow כָּבַשׁ](/jastrow?q=כָּבַשׁ&rid=K00081): abbreviation punctuation split across formatting.
- [Jastrow כּוֹבֶד](/jastrow?q=כּוֹבֶד&rid=K00184#jastrow-K00184-sense-1-0): `fem.` in the second sense.
- [Jastrow הָלַךְ, Hithpa. section](/jastrow?q=הָלַךְ&rid=E00561#jastrow-E00561-sense-4-0): a direct section link.
- [Public changelog](/changelog): dated descriptions of the changes. Earlier descriptions of defaults should be read alongside later updates.

### Basis and limits of this draft

The account emphasizes September–October 13, 2026. It draws on the public changelog, the repository’s recent commit history, the current reader code, and the October Jastrow sample-review and BDB QA notes. It distinguishes implemented changes from proposals. It does not claim that the underlying dictionaries have been updated to current scholarship or that all source-data discrepancies have been resolved.

**Editorial notes for publication:** Links beginning with `/` are intended for publication on Bekiut; replace them with verified absolute links if publishing elsewhere. Useful illustrations would show the same passage in unexpanded and inline-expanded modes, followed by one long-entry index. Check the final word count and pagination in the publishing format; Markdown itself does not fix page lengths.

<!-- Internal fact-checking references; not part of the published prose:
- artifacts/chavrutai/src/pages/changelog.tsx
- artifacts/chavrutai/src/pages/bdb.tsx and jastrow.tsx
- artifacts/chavrutai/src/lib/jastrow-presentation.ts
- artifacts/chavrutai/src/lib/dictionary-format.ts
- docs/jastrow-abbreviation-audit-2026-10.md
- docs/bdb-presentation-qa-followups.md
- Git history for the reader and changelog paths, August–October 2026.
-->
