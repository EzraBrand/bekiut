---
name: Horizontally scrollable table headings
description: Avoid scroll-driven vertical translation for page-sticky table headings.
---

Use native CSS sticky positioning for table headings that must remain visible during page scrolling; keep the sticky wrapper outside horizontal overflow.

**Why:** Translating the real table header from a requestAnimationFrame scroll handler appeared correct in still screenshots, but the user observed it lagging and jumping during scrolling.

**How to apply:** Separate the sticky header's horizontal viewport from the body viewport, synchronize horizontal scrolling, and share column widths. Preserve semantic column headers for assistive technology. Do not animate or calculate vertical position on every page scroll.