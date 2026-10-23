# Dependency security maintenance

The dependency update raises direct dependency minimums and refreshes the pnpm
lockfile. Transitive overrides keep patched versions installed where parents
still pin old releases. Vite remains on major 7; Vitest moves from 3 to 4 (which
no longer depends on tinypool). Orval, DOMPurify, esbuild and sharp are upgraded.
The selector-parser override moves version 6 consumers to the patched version 7;
CSS builds must be checked when changing it.

Orval is explicitly configured for React Query v5, because dependency declarations
using pnpm's `catalog:` protocol are not reliably detected by the generator.

## Local braces patch — GHSA-vfj7-8cjw-p6xm

There is no published fixed release of `braces` as of 2026-10-23. Its current
3.0.3 release is used by Tailwind 3, chokidar and micromatch/fast-glob. Migrating
the CSS framework solely to remove this build-time dependency would be a
disproportionate change.

`patches/braces@3.0.3.patch`, applied by pnpm's `patchedDependencies`, limits
parser nesting and iteratively checks AST depth before recursive compile,
expand and stringify operations. Curly braces and parentheses are both bounded.
The fixed, non-configurable depth ceiling is 128; excessive input throws a
`SyntaxError` rather than exhausting the JavaScript stack. Direct AST inputs,
including cyclic ASTs, are checked too. Normal glob behavior is unchanged.

`scripts/src/dependency-security.test.ts` checks the actual dependency instances
used by the build tools, ordinary glob behavior, and attack inputs in a
time-limited subprocess with a reduced stack.

**Scanner limitation:** version-based scanners still report `braces@3.0.3`,
because the honest upstream version has not changed. The finding is not hidden
or ignored. The local patch mitigates the reported stack-exhaustion issue; it
does not claim to fix every possible resource-exhaustion problem in globbing.
Remove the patch only after an upstream fixed release is available and these
regressions pass against it.

## Checks

- `pnpm install --frozen-lockfile` must apply the patch successfully.
- `pnpm test` includes the patch regression tests.
- `pnpm run typecheck` checks the workspace.
- Check API generation and production CSS builds after toolchain changes.
- Run the dependency scanner again; investigate new findings rather than
  suppressing them.
