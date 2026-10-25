---
name: Dependency major upgrades
description: Cached TypeScript declarations can mask compatibility after schema-library major upgrades
---

After a schema-library major upgrade, force a rebuild of shared-library
TypeScript declarations before interpreting downstream type errors.

**Why:** Incremental TypeScript builds preserved Zod 3 declaration shapes after
installing Zod 4, producing misleading implicit-any errors in the web app.
Regenerating the declarations resolved those errors without application changes.

**How to apply:** Run `pnpm exec tsc --build --force` once after the upgrade,
then run the normal workspace type check. Do not weaken consumer types to
accommodate stale build output.
