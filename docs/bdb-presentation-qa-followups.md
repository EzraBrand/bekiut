# BDB presentation QA: deferred improvements

These recommendations came from comparing אָב², אֱדוֹם, הָלַל² and קְרַאת against Sefaria's raw text and the desktop/mobile reader. They are a backlog, not implemented changes.

## 1. Improve generated outline labels
- Prefer actual glosses, including italicized glosses preceded by introductory prose.
- Distinguish verbal-stem/form headings from semantic summaries.
- Remove citation and bibliography fragments from outline labels.
- Mark truncation with an ellipsis; use a plain section label when no reliable summary can be extracted.
- Examples: אָב² currently includes a long Robertson Smith citation and a truncated “who constitute”; אֱדוֹם includes “StaG.1, 121…” in its first outline label.
- Acceptance: short, accurate labels that do not appear to be authored summaries when they are mechanical excerpts.

## 2. Bring the definition higher on mobile
- Collapse the alphabet browser once search results are available.
- Put the headword, principal gloss and occurrence count before the outline.
- Collapse long outlines on small screens.
- Shorten persistent interaction instructions, retaining full help on demand.
- Evidence: in the reviewed mobile אב layout, the main “father” definition began roughly 1,200 pixels below the page top.
- Preserve access to browsing and all dictionary content.

## 3. Preserve short cross-reference entries
- A search for קְרַאת returns קָרָא and קָרָא² without the original short entry explaining the relationship.
- Display “[קְרַאת], לִקְרַאת — to meet; see II קרא” as a cross-reference header, then link to or show the appropriate root.
- Distinguish exact headword entries from morphological search results rather than presenting related roots as an unexplained replacement.

## 4. Separate source text from editorial assistance
- Offer a source-text comparison view.
- Allow independent control over transliteration.
- Distinguish abbreviation explanations from vocabulary modernizations so both need not use identical popover behavior.
- Make clear that unexpanded abbreviations do not mean unprocessed source text: citation labels, paragraph structure, superscripts, outlines and transliterations may still be transformed.
- Keep source text available and avoid a proliferation of confusing controls.

## Related source-data review
- In הָלַל², the printed link label 149:9 disagrees with metadata/destination Psalms 140:9.
- Preserve the printed locator; do not silently choose a corrected destination without verification against the printed edition.
- Consider a citation-disagreement indicator and a small review queue for similar upstream inconsistencies.

## Preserve the improvements that work
- Occurrence counts such as אָב²'s 1191.
- Numbered-sense and verbal-stem navigation.
- Compact on-demand abbreviation explanations.
- Clear separation of Edom's three main senses.
