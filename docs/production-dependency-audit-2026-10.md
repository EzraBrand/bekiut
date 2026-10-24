# Production dependency audit — October 24, 2026

Read-only audit of dependencies and production bundles. No packages or publishing
configuration were changed. Sizes below are local disk usage, not compressed
deployment-image sizes or guaranteed time savings.

## Findings and priorities

1. **Recreate the active dependency installation from the lockfile.** Local
   `node_modules` occupies about 1.8 GB. Its virtual store still contains `three`,
   `three-stdlib`, `hls.js`, `lottie-web`, and `@mediapipe/tasks-vision`, although
   none appears in the current lockfile. These five directories total roughly
   143 MB. They are leftovers, not evidence that active Bekiut requires them.
   A clean, frozen-lockfile install is safer than hand-deleting individual
   directories. Schedule this deliberately: rebuilding the installation affects
   running development workflows and requires subsequent build/type checks.
   The existing post-build `pnpm store prune` output does not establish that
   these workspace virtual-store leftovers were removed.

2. **Remove the unused `react-icons` dependency.** It occupies approximately
   83 MB locally. It is declared by the active frontend, but no imports were
   found in its source, shared libraries, or scripts. Remove the declaration
   through pnpm, then validate frontend build and types. Actual disk removal
   should be checked rather than inferred from the lockfile update.

3. **Replace the broad Google SDK with a Gmail-specific client or REST call.**
   `googleapis` occupies approximately 202 MB locally and remains an external
   import in the production API bundle. Source usage is confined to Gmail
   chatbot-alert sending; the application already obtains a connector access
   token. A Gmail-only SDK or authenticated Gmail REST send request could avoid
   shipping the full API catalogue. Preserve token handling, alert quotas,
   email encoding, and non-fatal notification failures. Verify with mocked
   request/error tests; do not send real emails simply to measure packaging.

4. **Consider a dedicated runtime package only after the smaller changes.**
   The web server bundles Express and its JavaScript dependencies; the API
   bundles most dependencies but leaves Google APIs external. There are also
   optional `supports-color` and `pg-native` requires. A runtime package needs
   dependency tracing including dynamic loads, the logger's generated worker
   files, static assets, API public data, and bundled Talmud excerpts.
   Static import scanning alone does not prove runtime completeness.

## Avoid

- Do not ignore all `node_modules`: the current API requires `googleapis`.
- Do not prune development dependencies before builds: Vite, esbuild and the
  excerpt validator need them. The frontend also declares many browser
  dependencies as development dependencies, which is valid for its bundle.
- Do not assume a generic workspace production prune correctly preserves every
  artifact and workspace dependency.
- Keep server source maps for now: together they occupy only about 11 MB and
  production explicitly enables them for useful stack traces.
- Do not prioritize frontend chunk splitting for publishing speed. It may
  improve page loading but compilation already completes in about six seconds.

## Measurement

The observed publish improved from 4m27s to 2m44s for the Repl layer, and from
6m35s to 5m28s from first log timestamp to success. Platform timing varies.
Measure a subsequent publish after dependency cleanup; local uncompressed
directory sizes cannot be converted directly into upload-time savings.

Recommended next batch: remove unused react-icons and perform a clean
lockfile-based install, then validate both production builds and typechecks.
Treat the Gmail client replacement as a separate functional change.

## Completed cleanup

Removed react-icons and recreated workspace dependency installations from the
lockfile. Final root node_modules usage decreased from 1,801,936 KiB to
779,132 KiB (about 57%). The clean install exposed undeclared Vitest and
tailwindcss-animate dependencies; both are now declared by the frontend.
Frozen installation, workspace typechecks, both production builds, and three
dependency-security regression tests passed. Both development services restarted
and the homepage rendered correctly. Actual publishing-time savings remain to
be measured on the next publish. The Google SDK was left unchanged.
