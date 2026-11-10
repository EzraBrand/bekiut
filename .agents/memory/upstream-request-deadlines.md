---
name: Upstream deadlines
description: Bound Sefaria waits through response-body consumption; optional content must not delay primary reading.
---
Deadlines for upstream text requests must cover downloading the body as well as receiving headers. Optional continuation previews must not introduce an additional synchronous upstream wait.

**Why:** A Sefaria 502/503/504 incident caused long production waits despite low CPU and memory. A timeout cleared after headers would leave slow bodies unbounded.

**How to apply:** Keep cancellation active through body consumption, preserve explicit unavailable errors rather than caching failures as empty results, and distinguish per-fetch deadlines from total multi-step request budgets.
