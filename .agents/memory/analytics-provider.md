---
name: Analytics provider
description: Owner's decision to retire PostHog and retain native Replit analytics
---

Keep PostHog disabled; use the existing Replit-native analytics instead.

**Why:** The user said they never check PostHog and explicitly authorized
disabling it rather than optimizing its loading.

**How to apply:** Do not restore PostHog initialization or its SDK during future
analytics or bundle work. Preserve browser opt-out controls for native analytics.
