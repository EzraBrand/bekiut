# SEO follow-up — November 12, 2026

Read-only Search Console check and live HTTP spot checks, compared with the November 10 audit.

## Search performance

Latest available daily data: November 10. November 11–12 are not yet present.

| Period | Bekiut clicks | Bekiut impressions | ChavrutAI clicks | ChavrutAI impressions |
|---|---:|---:|---:|---:|
| Oct 13–Nov 8 (previous audit's available data) | 3 | 81 | 236 | 21,765 |
| Nov 9–10 (new data) | 1 | 4 | 26 | 1,997 |

No meaningful recovery is visible yet. Two additional reporting days are too little evidence to judge the effect of the recent fixes; most impressions remain attributed to the old domain.

## Indexing spot checks

- Bekiut `/places`: still “URL is unknown to Google.”
- Bekiut `/talmud/Gittin/57a`: still “Crawled - currently not indexed”; Google and declared canonical both Bekiut.
- ChavrutAI `/talmud/Gittin/57a`: still “Submitted and indexed”; Google's canonical remains the old domain, while declared canonical is Bekiut.
- Both Gittin records retain the November 10 00:30:47 UTC crawl timestamp. These are unchanged stored records, not fresh live indexing tests.

## Live technical checks

- Places returns HTTP 200 without the previous `X-Robots-Tag: noindex` header.
- Old-domain Gittin URL returns HTTP 301 to the matching Bekiut URL.
- Bible sitemap uses capitalized canonical paths such as `/bible/Genesis/1`; sampled entries no longer carry request-date lastmod timestamps.

The sampled technical fixes are live, but Google has not shown corresponding indexing progress in the checked records. Preserve the active Change of Address and redirects. Recheck after another week using fresh crawl dates and daily traffic, rather than treating a tiny change in clicks as recovery.

## Remaining warning

Production logs surfaced during verification still report missing crawler-excerpt files for Chullin, Menachot, and Niddah on November 12. Thus the earlier excerpt-packaging issue has not disappeared from the serving deployment. The local API build validates and packages its excerpts successfully; publish the current fixes and confirm these production errors stop. This observation does not establish the cause of Google's indexing decisions.
