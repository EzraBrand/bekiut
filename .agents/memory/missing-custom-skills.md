---
name: Missing custom skills after migration
description: A missing workspace skill may survive in Git history despite an earlier skill-restoration pass.
---

Do not conclude that a user-mentioned custom skill never existed from the current skill registry or filesystem alone.

**Why:** The June 2026 pnpm migration removed the blogpost-writing skill; the subsequent custom-skill restoration did not bring every skill back. Its writing instructions remained recoverable in Git history.

**How to apply:** For a missing custom skill, inspect historical additions and deletions under `.agents/skills/`, including all Git refs, before reporting it unavailable. Distinguish recovered historical instructions from the user's current requirements.
