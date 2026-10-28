---
name: Jastrow abbreviation safety
description: Durable review policy for expanding Jastrow abbreviations without corrupting dictionary prose.
---

Reconcile candidates against Jastrow’s own digitized abbreviation list, but do not treat that list as safe for automatic import. Ambiguous global single-letter forms remain excluded; short forms require strong corpus evidence and representative context.

**Why:** The printed abbreviation list contains forms such as a single letter followed by a period. In browser text replacement, these can collide with ordinary prose or unrelated citation notation even when token boundaries are enforced. Existing reader-facing expansions may also intentionally modernize or shorten the source wording.

**How to apply:** For each new batch, classify authoritative-list gaps and conflicts, scan real definitions for frequency and context, prefer longer contextual keys, retain intentional modernized expansions, and add formatter tests using representative source snippets.

Jastrow expansion targets should not introduce trailing colons.

For Jastrow transliteration, distinguish schwa apostrophes from possessives,
contractions, and vowel-separated forms such as `Ta'anit`. Preserve explicit
full-term mappings before normalizing unmatched source transliteration.

**Why:** The user requested readable `e` in forms such as `m’litsah`, rather than
an abbreviation expansion of the initial `m`; blanket apostrophe replacement
would also damage English prose and intentional mapping targets.

**How to apply:** Check representative corpus text and both inline/tooltip modes
when adjusting apostrophe handling; never rewrite link attributes or mapping targets.

Edition-reference expansions should consistently use `ed. ` followed by the
expanded name, except `ed. pr.`, which retains `editio princeps` at the user's request.

**Why:** The user requested consistent edition-reference formatting rather than
mixing “edition X”, “X edition”, and “ed. X”.

**How to apply:** Preserve that prefix when adding or revising edition mappings.

**Why:** The user requested removal of all trailing colons from mapped expansions,
not just selected verb forms.

**How to apply:** Keep punctuation from the source text, but do not add a colon
as part of new mapping targets.

Entry navigation should collapse the browse grid and land at the first result,
including incoming external links. The grid can be reopened manually.

**Why:** The user wants immediate access to definitions rather than the browsing
controls when following an entry link.