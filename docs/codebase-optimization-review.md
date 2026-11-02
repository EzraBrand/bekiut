# Codebase and website optimization review

## Scope

Reviewed application routing, homepage queries, dictionary search handling,
production asset caching, existing build output, deployment exclusions, and
frontend type checking. Visually checked the homepage at 390 × 844.
This is a targeted general review, not an exhaustive security audit or a
production performance benchmark.

## Prioritized follow-ups

| Priority | Improvement | Evidence and suggested approach |
| --- | --- | --- |
| High | Restore a passing frontend type check | The frontend typecheck currently fails in blog-post, biblical-index, outline, and search consumers. Fix shared response types first, rather than casting individual errors away. A clean check makes future regressions easier to detect. |
| High | Protect BDB searches from out-of-order responses | `src/pages/bdb.tsx` accepts every completed search response without cancellation or a latest-request guard. Reuse the Jastrow request-order pattern so an older search cannot replace a newer result. |
| High | Apply a final HTML allowlist to BDB definitions | BDB renders transformed sense HTML directly. Jastrow already has a final sanitizer. Adapt that approach to BDB's necessary markup and regression-test citations, superscripts, and popovers. This is preventative hardening, not a demonstrated exploit. |
| Medium | Refresh the Daf Yomi widget | Homepage Daf Yomi inherits infinite query staleness and disabled focus refetch, whereas Weekly Parsha explicitly refreshes every five minutes. Give Daf Yomi a finite stale time and periodic/focus refresh so an open tab can update after the date changes. |
| Medium | Investigate the initial JavaScript bundle | Existing local build output contains an approximately 960 KiB initial JS file and a 568 KiB Jastrow chunk, uncompressed. These are existing build snapshots, not freshly measured transfer sizes. Inspect the dependency graph before changing chunking; preserve synchronous small chapter metadata, which prevents false empty chapter states. |
| Low | Reduce mobile homepage introductory space | The mobile screenshot shows the library starting near the bottom of the first viewport. Consider shortening or retiring the rebranding banner and tightening hero spacing. The search placeholder also truncates; a short “Search texts” placeholder would fit. These are optional presentation choices. |

## Existing optimizations worth keeping

- Page routes are already lazy-loaded.
- Content-hashed production assets already use one-year immutable caching.
- Archived demo, guide, and design projects are excluded from deployment.
- Jastrow already has request-order protection, successful-result caching,
  compiled mapping reuse, and final HTML sanitization.
- No blanket deletion of archived projects is warranted; they are intentionally
  retained for recovery.

## Changes made in this review

### Follow-up implementation

- Full workspace typecheck now passes. The apparent consumer errors were caused
  by stale Zod 3 declarations after upgrading to Zod 4. A forced shared-library
  rebuild fixed them without weakening application types.
- BDB now aborts superseded searches and guards success, failure, and loading
  updates by request generation. Bare-page navigation and unmount also invalidate
  pending requests.
- BDB now sanitizes final transformed HTML using the shared dictionary allowlist,
  with explicit support for its paragraphs, semicolon segments, and Unicode Greek
  outline anchors. Tests cover both abbreviation displays and split settings.
- The app shell now dynamically imports chapter helpers only for the Talmud
  preload. Readers still synchronously import their required chapter metadata.
- Fresh production Vite builds measured the initial entry at **975,818 bytes /
  216,454 gzip** before and **548,800 bytes / 178,515 gzip** after: **43.8% raw /
  17.5% gzip reduction**. Gzip was measured locally, not as a production transfer.
  The initial entry no longer contains the Mishnah mapping JSON.
- Remaining notable bundle contributors include React DOM, PostHog, and
  tailwind-merge. PostHog's module contributes about 216 KB before minification;
  deferring analytics requires care around consent and initial event delivery.
  **Subsequent owner decision:** PostHog is now removed rather than deferred.
  Native Replit events and opt-out controls remain. The initial entry now measures
  **336,302 bytes / 107,604 gzip**, and no output chunk includes PostHog modules.
  This is a further 39% raw / 40% gzip reduction from the chapter-import fix.
- Visually checked a real BDB אָב entry with citation links, morphology,
  occurrence count, and abbreviation controls intact.

- Added the standard root `LICENSE` file with MIT terms and
  `Copyright (c) 2026 Ezra Brand`, consistent with existing package metadata.
- Added a README license link and clarified that third-party material keeps its
  own licensing terms.
- The original review left behavior unchanged; the follow-up changes above
  implement the subsequently selected work.
