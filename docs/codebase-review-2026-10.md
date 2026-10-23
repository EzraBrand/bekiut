# Codebase maintenance review — October 23, 2026

## Scope and verification

Reviewed the main web/API application's routing, search, caching, chapter loading,
build/setup configuration, package declarations, tracked files, scripts, and
workspace footprint. Included an independent architectural review. This is a
broad maintenance review, not a line-by-line audit of every file or a live-browser
test of every feature. No application code or files were deleted.

- `pnpm test`: 1,386 passing tests (10 scripts, 63 API, 1,313 web).
- `pnpm run typecheck`: passed across the workspace.
- BDB expanded-term metadata: all 10 tests pass; the previously reported failure
  is already fixed.
- Security findings are covered by the separate recent security review.

## Prioritized improvements

### 1. Correct search pagination — highest value

**Evidence:** `artifacts/api-server/src/routes/search.ts` fetches twice the page
size, deduplicates references within that batch, truncates the result, then
advances the next request by the entire raw batch. For a page size of 20 and 40
distinct raw results, only the first 20 are returned; the next page begins at raw
result 41, skipping 21–40. Duplicates can also cross batch boundaries. The total
count assumes roughly two raw results per unique reference.

**Recommendation:** paginate a consistently deduplicated sequence, or use a
verified upstream grouping/cursor strategy. Do not just change the multiplier.
Cover all-unique hits, uneven duplication, cross-page duplicates, and final-page
counts. The endpoint is shared by search and passage-discovery features.

**Effort/risk:** small-to-medium; requires focused API tests and checking callers.

### 2. Refresh Daf Yomi in long-lived sessions

**Evidence:** `src/lib/queryClient.ts` disables focus and interval refresh and
sets infinite stale time. The `/api/daf-yomi` queries in `src/pages/home.tsx` and
`src/components/DafYomiWidget.tsx` inherit these defaults.

**Recommendation:** share explicit calendar-query options with finite freshness
and periodic/focus refresh. Check the server's calendar cache/date policy too.
Keep infinite freshness for immutable text where appropriate.

**Effort/risk:** low; test a date transition rather than refreshing all queries.

### 3. Remove obsolete chapter preloading from the app shell

**Evidence:** `src/App.tsx` imports and calls `preloadChapterData`, but
`src/lib/chapter-data.ts` already loads its small metadata synchronously with an
eager glob. The app-shell import makes this module reachable on unrelated routes.

**Recommendation:** remove the obsolete shell-level preload/import and compare
production chunk sizes. Preserve synchronous metadata in actual reader consumers:
lazy-loading it previously caused false zero-chapter states.

**Effort/risk:** low; existing chapter first-render tests should remain intact.
Actual bundle savings need measurement because other imports can retain the data.

### 4. Repair a research script's old paths

**Evidence:** `scripts/yerushalmi-halakhah-lengths.mjs` reads
`shared/data/yerushalmi-shapes.json`, which no longer exists. The data now lives at
`lib/shared-data/src/data/yerushalmi-shapes.json`. Its default API URL still uses
localhost port 5000.

**Recommendation:** update the path and require/document a current API base.
Keep the research outputs and blog drafts; a broken runner is not evidence that
the research is disposable.

**Effort/risk:** low; validate input loading without launching a corpus-wide fetch.

### 5. Review what runs with the Run button

**Evidence:** `.replit` starts both application services plus the full tests and
workspace typecheck in parallel under Project.

**Recommendation:** consider keeping tests/typecheck available as explicit
validation workflows rather than running both on every app start. This reduces
startup contention, but changes the current validation habit and should be a
deliberate choice. Never replace the app services with validation-only workflows.

## Deletion and dependency candidates

These are candidates, not files already removed. Confirm reachability and run
tests/build after each coherent cleanup batch.

| Candidate | Evidence | Recommendation |
|---|---|---|
| API `src/routes/index.ts` | Scaffold health router; current app mounts health directly and registers live routers separately | Remove after final import/re-export check |
| `scripts/src/hello.ts` and package `hello` command | Only prints the scaffold greeting | Remove together |
| Unused main-app UI scaffold components | Import-path scan found 20 leaf components without references elsewhere, including chart, drawer, menubar, context-menu, resizable, slider and navigation-menu | Trace the graph from application entry points, then remove unreachable components and their exclusive dependencies together |
| `date-fns`, `react-icons`, `remark-parse`, `unified` direct main-app dependencies | No source imports found in the main app | Verify tooling/config use, then remove unnecessary direct declarations; transitive dependencies may remain |
| `@types/dompurify` | DOMPurify supplies its own types in current releases | Check installed declarations and remove the redundant types package if typecheck confirms |
| Local caches | About 487 MB under `.cache`, mostly pnpm (272 MB) and uv (194 MB) | Prune through package tools only if disk pressure warrants it; repeated deletion makes later installs slower |

Unused UI removal primarily reduces maintenance and install surface. Vite normally
excludes unreachable modules, so do not promise browser-download savings from
deleting them.

## Packaging and larger files

- `node_modules` is about 1.8 GB; Git is about 41 MB. This does not point to a
  Git-history emergency. Do not rewrite history or broadly clean the workspace.
- `.replitignore` has only a few exclusions. Review publication exclusions for
  research drafts, uploads, screenshots, caches and unrelated artifact outputs
  against the actual deployment build before changing them. Exclude verified
  non-runtime content rather than deleting originals.
- Large tracked files are mostly real content: the blog archive, biblical-index
  datasets and Talmud excerpt files. Keep them until their consumers and storage
  migration requirements have been assessed.
- Preserve `talmud-data/`: it is a runtime/build input, not an obsolete root folder.
- Preserve the research guide, demo video and mockup artifacts; they are separate
  project deliverables, not abandoned copies of the main app.
- Preserve uploaded files, PDFs, research outputs and blog drafts unless the
  owner explicitly approves their deletion.
- Keep the local `braces` security patch and regression coverage until a verified
  upstream fix replaces it.

## Lower-priority work

- The active BDB prefix-test endpoint can make many serial upstream requests.
  Measure latency first; then bound request time and concurrency if useful.
  Do not delete it merely because its name contains “test.”
- The changelog component is about 1,900 lines. Moving entries into structured
  data would ease editing, but it is already route-lazy-loaded and is not an
  urgent startup-performance fix.
- The post-merge script restores video assets on every merge, skipping matching
  files. This is deliberate protection against missing media; do not remove it
  as generic overhead without preserving that guarantee.

## Suggested first implementation batch

1. Fix and regression-test search pagination.
2. Give Daf Yomi explicit freshness rules and remove obsolete app-shell preload.
3. Remove confirmed scaffold leaves/dependencies and repair the research runner.

Leave dataset relocation, artifact removal, broad dependency/framework migrations,
and historical-document deletion out of this low-risk batch.
