---
name: BDB performance constraints
description: Preserve matcher semantics and avoid caching ambiguous upstream search failures.
---

Treat dictionary mapping objects as immutable; replace the object if runtime editing is ever introduced.

**Why:** Compiled matcher reuse is keyed by object identity to remove repeated work on long entries. In-place edits would leave cached rules stale.

**How to apply:** Keep static imported mappings stable. A future live mapping editor must supply a new mapping object or explicitly invalidate the compiled cache.

Do not add BDB result caching until search can distinguish successful complete responses from upstream failures and partial suggestion results.

**Why:** Caching an apparent empty success can prolong a transient Sefaria outage. Network caching was intentionally excluded from the main-thread performance fix for this reason.

**How to apply:** First define failure propagation, then implement bounded TTL and in-flight deduplication without persisting failures as misses.