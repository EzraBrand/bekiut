---
name: Chapter metadata loading
description: Why chapter metadata is bundled instead of downloaded per tractate
---

Keep the small, fixed Talmud chapter metadata available synchronously with its consumers.

**Why:** Lazy chapter downloads let tractate contents render “0 Chapters” before loading, and swallowed download failures left readers with empty contents for the session. The complete source dataset is only about 58 KB before compression; avoiding that failure mode outweighs per-tractate lazy loading.

**How to apply:** Preserve first-render availability when optimizing bundles. Do not reintroduce asynchronous chapter loading without explicit loading/error states and recovery, and never cache a failed request as valid empty chapter data.