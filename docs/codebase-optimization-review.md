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

- Added the standard root `LICENSE` file with MIT terms and
  `Copyright (c) 2026 Ezra Brand`, consistent with existing package metadata.
- Added a README license link and clarified that third-party material keeps its
  own licensing terms.
- Left application behavior unchanged pending selection of follow-up work.
