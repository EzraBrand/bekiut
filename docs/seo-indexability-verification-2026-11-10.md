# Indexability changes and local verification — November 10, 2026

Based on the verified audit in `seo-health-review-2026-11-10.md`.
These changes are local task work, not a production deployment.

## Changes

- Removed the experimental Places response handler that emitted an HTTP
  `noindex` header and bypassed crawler enhancement. Places now follows the
  normal browser/crawler response paths. Existing shared metadata, client
  metadata, crawler body and sitemap already describe it as public.
- Bible sitemaps use the reader's shared book list, including canonical
  title-case/underscore slugs and chapter counts. Shared metadata normalizes
  known aliases. Old lowercase/hyphenated URLs permanently redirect to valid
  canonical book/chapter URLs, preserving query strings, in production web,
  development web and API route handling.
- Consolidated robots.txt into one wildcard group. Legacy redirect paths are
  crawlable; the API restriction now applies equally to Googlebot and Bingbot.
- Removed request-date `lastmod` fields from the sitemap index and all affected
  child sitemaps. Reliable content modification dates are not tracked here.

## Verification

- Workspace typecheck passed.
- Sitemap tests check all root/API child endpoints, public Places inclusion,
  all Bible reader URLs against shared canonical metadata, omission of
  fabricated modification dates, and production origins.
- Isolated HTTP tests bundle and run the actual production web server with
  `NODE_ENV=production`: browser, Googlebot and Bingbot Places requests return
  200 without a noindex header; bots receive Places metadata and injected
  crawler content. This test uses an enhancement fixture to isolate web-server
  dispatch; separate API tests and a live local `/api/seo/enhance?path=/places`
  request verify the real Places body and uncertainty notes.
- Production HTTP tests verify Bible and legacy 301s, query preservation and
  the canonical Genesis crawler response. Shared unit tests also cover invalid
  Bible chapter ranges and already-canonical URLs.
- Local proxy request for `/bible/i-samuel/1?ref=test` returned a 301 to
  `/bible/I_Samuel/1?ref=test`.
- Both app services restarted successfully; a preview screenshot confirmed
  that the Places page and map render normally.

The initial completion check was blocked by existing dictionary fixtures.
With user approval, those fixtures were repaired: upstream fetch mocks now
return fresh real `Response` objects, and the transliteration test uses actual
Greek HTML with a DOM implementation instead of an unrelated ASCII placeholder
that never reached the text-node walker. Existing assertions were preserved,
with explicit nested-marker and idempotence assertions added. No dictionary
runtime behavior was changed.

The full `pnpm test` command now passes: 94 API tests, 1,740 frontend tests
(plus 2 existing expected failures), and 12 script tests.

## Limits

These changes remove conflicting technical signals. They do not guarantee
Google indexing or resolve the old-domain attribution problem. Missing Talmud
crawler excerpts, generic fallback headings and Search Console migration
verification remain separate work described by the audit.
