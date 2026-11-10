# SEO and website health review — 2026-11-10

## Scope and method

Read-only Google Search Console API queries for both domain properties; URL Inspection for representative pages; live browser/Googlebot HTTP requests; all 12 child XML sitemaps; robots.txt; canonical tags; representative page titles, headings and 404 handling; development startup, type checks and focused request-deadline tests.

This is a sampled technical audit, not a crawl of every page, a Core Web Vitals measurement, or a security audit. URL Inspection describes Google's stored index state, not a live fetch. No Search Console settings were changed.

## Main finding: Google still credits the old domain

Same query window, October 13–November 10, 2026 (inclusive API dates; latest available daily data ends November 8):

| Domain | Clicks | Impressions | Average position |
| --- | ---: | ---: | ---: |
| chavrutai.com | 236 | 21,765 | 7.69 |
| bekiut.com | 3 | 81 | 27.16 |

These are Google Search clicks, not all website visits. Property totals and page totals can differ because their aggregation differs; query rows also omit anonymized queries.

Google reports these old URLs as **submitted and indexed**, with a Google-selected ChavrutAI canonical despite the site's declared Bekiut canonical:

- `/talmud` — last crawl November 9.
- `/dictionary` — declared canonical is Bekiut `/jastrow`; last crawl November 1.
- `/jastrow` — last crawl November 2.
- `/talmud/Gittin/57a` — last crawl November 10.
- `/talmud/Sanhedrin/54b` — last crawl October 31.

The old homepage is correctly classified as a redirect to Bekiut. Bekiut's homepage is submitted and indexed. Bekiut `/jastrow`, `/bdb`, `/talmud`, `/talmud/Gittin/57a`, `/talmud/Berakhot/41a`, `/bible/Genesis/1`, and `/yerushalmi/Sanhedrin` are reported as **crawled, currently not indexed**. `/places` and `/talmud/Berakhot/2a` were reported as unknown.

The two properties' inspection records are not perfectly consistent: Bekiut's Gittin record names a Bekiut Google canonical, while the old-domain record names ChavrutAI for the same crawl time. Do not treat this API snapshot as a complete explanation of Google's internal canonicalization.

### Historical timing

Bekiut impressions fell abruptly around August 29–31:

| Date | Bekiut impressions | ChavrutAI impressions |
| --- | ---: | ---: |
| August 28 | 2,663 | 538 |
| August 29 | 572 | 515 |
| August 30 | 115 | 704 |
| August 31 | 20 | 595 |

This predates the November 9 upstream latency incident. It is not simply a brand-new migration waiting a few days. The history does not show an equal compensating increase in old-domain impressions, so attribution alone cannot be assumed to explain the entire loss.

## Live checks that passed

- Sampled ChavrutAI, www.ChavrutAI, www.Bekiut, Bekiut.net and Bekiut.org content URLs reach Bekiut while preserving paths and query strings.
- Explicit browser and mobile Googlebot requests to ChavrutAI `/talmud/Gittin/57a` both return **301**, followed by Bekiut **200**.
- Sampled canonical tags point to Bekiut; titles are page-specific.
- All 12 child sitemaps return parseable XML; all 9,996 listed locations use `https://bekiut.com/`.
- `robots.txt` is actual text and the sitemap index is actual XML, not SPA fallback HTML.
- An unknown route returns a real 404.
- HTTPS/HSTS is present.

Current redirects look correct. These observations cannot prove how every historical Google crawl was served, or whether Google has processed all migration signals.

## Concrete follow-up findings

1. **Places is still noindex.** Live `/places` sends `X-Robots-Tag: noindex, follow`. The production server has a special handler retained from its experimental stage, bypassing normal crawler body enhancement. Remove this if the page is intended to appear in search; align server, client and sitemap policy.
2. **Bible sitemap/canonical casing differs.** The sitemap emits `/bible/genesis/1`, while canonical metadata identifies `/bible/Genesis/1`. Google classified the lowercase URL as “Page with redirect” in its stored September record. Choose the reader's established canonical format and align sitemap, links, redirects and metadata.
3. **Deprecated paths are blocked in robots.txt.** `/tractate/` and `/contents/` have disallow rules even though redirects exist. Crawlers need access to old URLs to discover their redirects. Googlebot has a separate group, so do not assume these wildcard rules affect Google identically to every other crawler; simplify and validate groups.
4. **Sitemap lastmod is generated as today's date.** Sample Bible entries advertise November 10 regardless of when their underlying content changed. Use meaningful modification dates or omit lastmod.
5. **Crawler content coverage needs attention.** Runtime logs report missing excerpt files for Chullin, Menachot and Niddah. Development build validation reports 4,708/5,350 populated pages, with 642 missing. Verify deployed packaging separately from reviewed source gaps; these reduce content available in server-rendered crawler previews.
6. **Generic fallback heading is duplicated.** Sample crawler HTML includes a page-specific H1 and the homepage's noscript H1. This is lower priority than indexation; avoid unrelated homepage boilerplate on reader pages.

The sitemap API's `indexed: 0` field is not a reliable indexed-page census: the homepage's URL Inspection explicitly confirms indexing.

## Recommended order

1. Check **Settings → Change of address** on the old domain in Search Console. Confirm whether a move to Bekiut was submitted; API queries here cannot establish that. Owners should verify both properties and the migration prerequisites before submitting.
2. Fix the concrete indexability/sitemap issues above; retain permanent redirects and update high-value external links to Bekiut where practical.
3. Resubmit the Bekiut sitemap and request indexing for a small representative set after fixes. This is not a guarantee of indexing.
4. Compare both domains weekly and re-inspect the same representative URLs.

## Reliability work verified alongside this audit

- Sefaria fetches used by Talmud, Bible and dictionary storage now have an 8-second deadline covering headers **and body consumption**.
- Talmud/Bible timeout responses give a retry message; dictionary failures use the existing unavailable response.
- Optional Talmud continuation previews use an already stored next page rather than making a second upstream fetch. On a cold cache the optional preview may be absent; primary text remains available.
- This is a per-fetch deadline, not a universal end-to-end request SLA; multi-step dictionary fallbacks can still take longer in total.
- Four focused deadline tests and the workspace typecheck passed. The Talmud reader rendered successfully after restarting the services.
- The existing full-suite dictionary-transliteration fixture failure is unrelated and remains unresolved.

These changes are in the workspace; this review did not initiate publishing.
