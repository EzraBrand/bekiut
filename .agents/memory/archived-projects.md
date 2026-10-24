---
name: Archived side projects
description: Owner's decision to retire demo, guide preview, and design experiments without deleting their source.
---

Keep the demo video, standalone research guide, research-guide preview and design sandbox archived rather
than reactivating them during routine dependency or deployment maintenance.
Preserve their source and stored video media. The standalone guide is included
in the requested local archive. Keep the live GitHub Pages guide online and
leave its remote repository and publishing settings unchanged.

**Why:** The user requested archiving/deleting old prototypes while reducing
publishing overhead; in-place archiving preserves recovery without rebuilding
or shipping these side projects. The user explicitly chose “Keep the live site;
archive locally only” for the standalone guide.

**How to apply:** Consult `docs/archived-projects.md` for restoration. Do not
restore video media automatically after ordinary task merges. Restore archived
projects only when the user requests renewed work on them.

Archiving workspace packages does not necessarily remove their old installed
dependencies. Validate cleanup with a clean lockfile-based install.

**Why:** The existing installation retained substantial retired-project packages
and masked undeclared build/test dependencies even after an ordinary install.

**How to apply:** For future dependency-size cleanup, inspect actual disk usage,
then verify clean-install builds and types; lockfile changes alone are not proof
that the published workspace is smaller.
