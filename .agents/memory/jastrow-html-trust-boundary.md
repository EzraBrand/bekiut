---
name: Jastrow HTML trust boundary
description: Final rendered dictionary fragments need explicit allowed markup and meaningful security regression tests.
---

Sanitize Jastrow entries after link conversion, transliteration, and abbreviation expansion, retaining only the exact safe markup required by the reader.

**Why:** Source HTML comes from an upstream dictionary API; transformations do not remove active elements or event handlers. In local DOM tests, DOMPurify under happy-dom retained unsafe SVG event handlers and dropped valid strong-tag outline IDs, so a passing happy-dom test using DOMPurify alone would not establish safety or fidelity.

**How to apply:** Test malicious event handlers, unsafe and protocol-relative URLs, and retained sense IDs and abbreviation metadata through the full presentation pipeline. Browser behavior should also be spot-checked when sanitization rules change.
