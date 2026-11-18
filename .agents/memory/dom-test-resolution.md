---
name: DOM test dependency resolution
description: Vitest environment loading can resolve dependencies from the workspace root rather than the artifact.
---
For artifact-local DOM test dependencies, importing the DOM implementation in the test and stubbing the required globals avoids the runner's environment-package lookup.

**Why:** This workspace's frontend Vitest runner resolved the `happy-dom` environment from the root runner location, even though the dependency was installed in the frontend artifact. Direct imports from the test resolved correctly.

**How to apply:** When a DOM environment reports a missing package that is already installed locally, check the runner's resolution location before installing duplicate dependencies at the workspace root. Restore any stubbed globals after the suite.

Load stylesheet text directly from disk for computed-style tests when Vitest CSS processing is disabled.

**Why:** Even a CSS `?raw` import returned an empty string in the frontend test runner, making valid font-size rules appear broken in happy-dom.

**How to apply:** Inject the actual file contents into the test document before measuring styles; do not rely on a CSS import being populated.

Do not treat happy-dom's responsive CSS results as a real browser layout test.

**Why:** Its media matcher can return false for a comma-separated OR query even when one branch matches, and computed media styles can remain cached after resizing.

**How to apply:** Test width branches in fresh documents with explicit window sizes; isolate a media-query branch when necessary and document the limitation. Native Android Chrome selection trays cannot be reproduced by DOM tests.
