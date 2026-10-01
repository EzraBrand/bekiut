---
name: Transliteration pipeline verification
description: Validate transliteration after outline and formatting transforms, not only on raw strings.
---

Validate dictionary transliteration against the actual rendered entry, including earlier outline and formatting stages.

**Why:** A Greek-parenthesis fix passed plain-string tests but still failed in BDB because section-marker anchoring inserted an element inside the Greek word. The transliterator correctly processed the resulting separate text nodes, producing fragmented annotations.

**How to apply:** When an annotation is split unexpectedly, inspect generated HTML boundaries as well as source text. Add a regression through the upstream transformation responsible for those boundaries and visually inspect the affected entry, not merely the top of its results page.