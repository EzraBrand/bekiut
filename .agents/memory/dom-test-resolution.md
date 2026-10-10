---
name: DOM test dependency resolution
description: Vitest environment loading can resolve dependencies from the workspace root rather than the artifact.
---
For artifact-local DOM test dependencies, importing the DOM implementation in the test and stubbing the required globals avoids the runner's environment-package lookup.

**Why:** This workspace's frontend Vitest runner resolved the `happy-dom` environment from the root runner location, even though the dependency was installed in the frontend artifact. Direct imports from the test resolved correctly.

**How to apply:** When a DOM environment reports a missing package that is already installed locally, check the runner's resolution location before installing duplicate dependencies at the workspace root. Restore any stubbed globals after the suite.
