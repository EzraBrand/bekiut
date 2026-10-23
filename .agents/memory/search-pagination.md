---
name: Sefaria grouped search
description: Upstream grouping support and counting limitations verified against Sefaria search.
---

Group passages upstream before applying page offsets; never assume a fixed ratio
of editions to unique references.

**Why:** Fetching two pages of raw hits, deduplicating and truncating skipped valid
passages. Live probes confirmed collapse works with `ref.keyword`; `ref` is an
analyzed text field and `ref.raw` is absent. Cardinality counts are estimates,
not exact totals, even with a high precision threshold.

**How to apply:** Preserve stable passage ordering and label estimated totals.
Verify upstream field capabilities before changing the query. Do not promise
arbitrary deep pagination without checking upstream result-window limits.
