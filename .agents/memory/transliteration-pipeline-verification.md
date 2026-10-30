---
name: Transliteration pipeline verification
description: Validate transliteration after outline and formatting transforms, not only on raw strings.
---

Validate dictionary transliteration against the actual rendered entry, including earlier outline and formatting stages.

**Why:** A Greek-parenthesis fix passed plain-string tests but still failed in BDB because section-marker anchoring inserted an element inside the Greek word. The transliterator correctly processed the resulting separate text nodes, producing fragmented annotations.

**How to apply:** When an annotation is split unexpectedly, inspect generated HTML boundaries as well as source text. Add a regression through the upstream transformation responsible for those boundaries and visually inspect the affected entry, not merely the top of its results page.

Preserve the distinct precomposed `Ḥull.` and decomposed `Ḥull.` Jastrow mappings rather than consolidating them solely because they look identical.

**Why:** The user confirmed that adding the decomposed form caught the abbreviation in גִּלְדָּא and explicitly declined standardizing the two expansions.

**How to apply:** Check Unicode code points when reviewing apparent duplicate keys; do not remove a variant without verifying that matching still covers its actual source spelling.

Jastrow abbreviation regressions must enable the reader's apostrophe-protection option, not just run the default formatter.

**Why:** Default-mode tests passed for quoted `&c.` while the real reader suppressed it: apostrophe protection mistook a closing quotation mark for a word continuation.

**How to apply:** Exercise both display modes and paragraph-splitting settings through the presentation pipeline, including closing quotes and actual transliterated-word continuations.