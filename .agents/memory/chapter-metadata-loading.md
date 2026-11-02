---
name: Chapter metadata loading
description: Why chapter metadata is bundled instead of downloaded per tractate
---

Keep the small, fixed Talmud chapter metadata available synchronously with its consumers.

**Why:** Lazy chapter downloads let tractate contents render “0 Chapters” before loading, and swallowed download failures left readers with empty contents for the session. The complete source dataset is only about 58 KB before compression; avoiding that failure mode outweighs per-tractate lazy loading.

**How to apply:** Preserve first-render availability when optimizing bundles. Do not reintroduce asynchronous chapter loading without explicit loading/error states and recovery, and never cache a failed request as valid empty chapter data.

Keep chapter-helper imports out of the global app shell; lazy-load the route-level
preload instead, while readers import their metadata synchronously.

**Why:** Those helpers also depend on the much larger Mishnah mapping dataset.
Eager global imports made unrelated pages download it, despite route splitting.

**How to apply:** Optimize at the route boundary, not by making individual
chapter lookups asynchronous.