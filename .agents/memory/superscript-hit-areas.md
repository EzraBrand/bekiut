---
name: Superscript hit areas
description: Browser-only failure mode for interactive footnote references
---

Interactive controls inside superscripts need an explicit nonzero line height and box.

**Why:** A superscript can inherit zero line height. Its button's glyph remains visible and keyboard activation works, while pointer automation reports the button invisible or outside the viewport. Scrolling does not fix the zero-height hit area.

**How to apply:** When adding footnote references, check pointer activation from the collapsed state as well as keyboard activation. Use an inline-block control with a normal line height.