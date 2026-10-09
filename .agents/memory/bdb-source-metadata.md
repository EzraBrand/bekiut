---
name: BDB source metadata
description: Search and text APIs represent headword subscripts differently.
---
Sefaria's words API can move a numeric headword subscript into separate `occurrences` metadata, while its v3 texts API retains the subscript in HTML.

**Why:** The אָב² count (1191) vanished even though HTML subscript conversion already worked. Testing only the v3 HTML missed the search API boundary.

**How to apply:** When investigating missing BDB prefix content, compare both upstream representations, not just the HTML formatter. Preserve exact occurrence counts without inventing a circa qualifier.
