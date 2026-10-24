# Publishing package exclusions

The October 24, 2026 publish took approximately 6½ minutes. Its Repl-layer step
ran from 06:33:54 to 06:38:21 UTC (4m27s), while builds plus post-build cleanup
took about 22 seconds. Package transfer/creation was the dominant observed stage.

The first optimization pass excludes root development caches, local Python
packages, uploads, documents, screenshots, research documentation, and the
archived demo/research-guide projects through `.replitignore`.
Source files are preserved; exclusion is not deletion.

The three archived artifacts also have no registered services and are excluded
from the pnpm workspace. They should no longer build or serve after publishing.

Intentionally retained:

- `node_modules`: the API externalizes packages, including googleapis.
- `scripts`: the production API build runs the Talmud excerpt validator.
- `talmud-data`, API data, frontend public assets, and dist outputs.
- pnpm manifests, lockfile, local patches and shared libraries.
- The existing post-build `pnpm store prune`: removing it could increase image
  size; its net effect has not been measured.

Compare the Repl-layer duration on the next user-initiated publish against the
4m27s baseline. Local directory size is not proof of uploaded bytes: platform
exclusions, caching and compression can alter the actual savings. This change
does not promise a particular publishing time.
