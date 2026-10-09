---
name: BDB symbol and letter keys
description: Standalone psi displays Psalm(s); preserve Unicode boundaries within quoted words.
---

Standalone lowercase ψ and uppercase Ψ must expand to Psalm(s), with the parenthetical s, even without a numeric locator.

**Why:** The user explicitly requested both forms. BDB refers to the book without verse numbers, as in Baer (ψ p. 115) and “at beginning or end of ψ”; requiring a following digit leaves unwanted transliterations.

**How to apply:** Use Unicode-aware word boundaries to preserve letters inside Greek words such as ψυχή, but do not restore the old numeric-citation-only guard. Verify expansion before transliteration in the rendered reader.

Never use ASCII-only word boundaries for dictionary abbreviations.

**Why:** They treat accented and non-Latin letters as boundaries, allowing short keys to corrupt multilingual words.

**How to apply:** Protect neighboring Unicode letters, numbers, and combining marks; add contextual exceptions only when supported by actual source usage.
