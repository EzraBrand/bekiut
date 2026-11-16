---
name: Ben-Yehuda dictionary source discovery
description: Obtaining a browse index without relying on standard text exports.
---

Use Sefaria's lexicon-scoped completion API with an explicit large positive limit to obtain Ben-Yehuda headwords by letter.

**Why:** The November 2026 probe found no Ben-Yehuda record in Sefaria-Export's books.json or the GCS Reference/Dictionary text directory. The default completion limit misleadingly suggested that only a few words were available. Fetching all 22 letters with `limit=100000` yielded 21,999 unique headwords, including Roman-numeral homographs. This is an autocomplete snapshot, not independently verified database completeness or a stable-ID/full-text export.

**How to apply:** Request `/api/words/completion/<letter>/Ben%20Yehuda%20Dictionary?limit=100000`, retain pointed headwords and homograph suffixes, deduplicate, and record provenance. The upstream scoped implementation slices directly by the limit, so do not assume `limit=0` means unlimited despite its comment. Retrieve stable IDs separately through word lookup. Recheck export availability when needed.

Do not pass Ben-Yehuda HTML through the existing Jastrow sanitizer unchanged.

**Why:** The source uses paragraph wrappers, footnotes, mixed-direction spans, and embedded images. The Jastrow allowlist drops unsupported elements with their entire contents, which can erase whole definitions rather than merely remove formatting.

**How to apply:** Give the new reader a tested source-specific rendering/sanitization policy; share generic controls and request handling, not English abbreviation transforms.

Word-lookup definitions do not contain all reader citation links. Use the v3
reader's `return_format=wrap_all_entities`, not `wrap_all_entities=1`, when
comparing against Sefaria's visible reader.

**Why:** The same אָב I entry had 3 raw anchors but 63 reader-formatted anchors;
ה still had only 2 in either response. Missing links can therefore mean either
the wrong API representation or unresolved source citations, not sanitization.

**How to apply:** Preserve identity from word records, bound/cache citation
enrichment, and never invent destinations for remaining `by-source` labels.
