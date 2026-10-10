---
name: BDB source metadata
description: Search and text APIs represent headword subscripts differently.
---
Sefaria's words API can move a numeric headword subscript into separate `occurrences` metadata, while its v3 texts API retains the subscript in HTML.

**Why:** The אָב² count (1191) vanished even though HTML subscript conversion already worked. Testing only the v3 HTML missed the search API boundary.

**How to apply:** When investigating missing BDB prefix content, compare both upstream representations, not just the HTML formatter. Preserve exact occurrence counts without inventing a circa qualifier.

Pointed words-API lookups can return a nonempty result containing only the first homograph, even after removing a superscript suffix.

**Why:** הָלַל returned candidates without the requested הָלַל², whereas consonantal הלל included it. A mocked lookup returning every homograph failed to expose this difference.

**How to apply:** Resolve explicit homographs from consonantal lookup candidates and match the requested suffix before displaying results. Do not treat a successful lookup as proof that the requested entry was found.
