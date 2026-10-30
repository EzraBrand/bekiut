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

For Jastrow, cache only nonempty successful lookup results; do not turn empty responses into durable misses.

**Why:** The upstream search layer can return an empty list after a failed lookup, so caching that response could conceal a transient outage. Repeated successful entry lookups benefit from a short TTL and concurrent-request deduplication.

**How to apply:** If adding more caching or longer TTLs, first make upstream errors explicit rather than treating them as negative search results.