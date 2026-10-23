---
name: Dependency remediation scope
description: Why a local build-tool patch is preferable to a CSS framework migration for an unpatched advisory
---

Do not migrate the main app from Tailwind 3 solely to eliminate the unpatched
`braces` nesting advisory. Keep the local pnpm patch until upstream publishes
a fixed version, and retain its adversarial regression coverage.

**Why:** This dependency is used in build tooling. A CSS framework migration has
much broader product risk than the bounded-input fix needed for this advisory.
Version-based scanners cannot recognize local patches; never spoof an upstream
version or hide that remaining finding to obtain a clean scan.

**How to apply:** Consult `docs/dependency-security.md` when changing the globbing
or CSS toolchain. Re-evaluate the local patch against actual upstream releases,
not scanner counts alone.
