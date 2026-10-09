# Link audit — 2026 working edition

Latest request timestamp: 2026-10-09T13:13:38.273734+00:00

The 47-page PDF contains 618 link annotations: 582 external occurrences and 36 internal annotations. The external occurrences resolve to 511 distinct original URLs.
Audit includes 536 distinct destinations when curated additions are included.

## Original 2023 destinations

- blocked_or_restricted: **75**
- http_error: **13**
- network_error: **17**
- not_found: **17**
- reachable: **322**
- redirected: **67**

The checker uses GET, follows up to eight redirects, verifies TLS, and retries errors other than authentication/rate-limit blocks once. Each request has a 22-second limit. Response bodies are capped at 2 MB; this tests availability, not complete PDF download integrity.

A successful response is not a content review. Fragment identifiers, login flows, paywalls, JavaScript applications, domain repurposing and all forms of soft 404 cannot be conclusively checked by this method. DNS/TLS/timeouts and HTTP 5xx remain unresolved. 401/403/429 are not counted as dead.

## Priority 1: repeated HTTP 404 or 410

### http://uli.nli.org.il/F?func=find-b-0&local_base=mbi01
- HTTP 404; original PDF pages: 25.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/http://uli.nli.org.il/F?func=find-b-0&local_base=mbi01

### https://associationforjewishstudies.org/publications-research/adventures-in-jewish-studies-podcast
- HTTP 404; original PDF pages: 45.
- Suggested destination: https://www.associationforjewishstudies.org/podcasts
- Current official page explicitly titled Adventures in Jewish Studies; content reviewed 2026-10-09. Appropriate replacement for the podcast landing page.
- Archive lookup (not checked): https://web.archive.org/web/*/https://associationforjewishstudies.org/publications-research/adventures-in-jewish-studies-podcast

### https://en.wikipedia.org/wiki/Closed_platfor
- HTTP 404; original PDF pages: 42.
- Suggested destination: https://en.wikipedia.org/wiki/Closed_platform
- Likely truncated title in the PDF hyperlink. Suggested spelling correction only; destination content not verified in this pass.
- Archive lookup (not checked): https://web.archive.org/web/*/https://en.wikipedia.org/wiki/Closed_platfor

### https://lib.pshita.cet.ac.il/pages/frontpage.asp
- HTTP 404; original PDF pages: 35.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://lib.pshita.cet.ac.il/pages/frontpage.asp

### https://libraries.ou.edu/content/understanding-academiaedu-and-researchgate
- HTTP 404; original PDF pages: 35.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://libraries.ou.edu/content/understanding-academiaedu-and-researchgate

### https://library.brown.edu/iip/about/why_inscription/
- HTTP 404; original PDF pages: 13.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://library.brown.edu/iip/about/why_inscription/

### https://twitter.com/nlitorani
- HTTP 404; original PDF pages: 46.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://twitter.com/nlitorani

### https://web.nli.org.il/sites/NLI/Hebrew/digitallibrary/moreshet_bareshet/Pages/default.aspx
- HTTP 410; original PDF pages: 17.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://web.nli.org.il/sites/NLI/Hebrew/digitallibrary/moreshet_bareshet/Pages/default.aspx

### https://web.nli.org.il/sites/NLI/Hebrew/library/services/interlibrary%20loan/Pages/photos_loan.aspx
- HTTP 410; original PDF pages: 36.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://web.nli.org.il/sites/NLI/Hebrew/library/services/interlibrary%20loan/Pages/photos_loan.aspx

### https://web.nli.org.il/sites/nli/hebrew/collections/jewish-collection/talmud/pages/default.aspx
- HTTP 410; original PDF pages: 17.
- Suggested destination: https://www.nli.org.il/en/discover/manuscripts
- Current official manuscripts landing page; content reviewed 2026-10-09. Broader fallback only, not an exact replacement for the former Talmud collection page.
- Archive lookup (not checked): https://web.archive.org/web/*/https://web.nli.org.il/sites/nli/hebrew/collections/jewish-collection/talmud/pages/default.aspx

### https://web.nli.org.il/sites/nlis/en/manuscript
- HTTP 410; original PDF pages: 16.
- Suggested destination: https://www.nli.org.il/en/discover/manuscripts/hebrew-manuscripts
- Current official Ktiv entry point; content reviewed 2026-10-09. A collection-level alternative, not proof that every function or item at the old URL survives.
- Archive lookup (not checked): https://web.archive.org/web/*/https://web.nli.org.il/sites/nlis/en/manuscript

### https://www.associationforjewishstudies.org/professional-development/professional-development/digital-jewish-studies/perspectives-on-technology/online-resources-for-talmud-research-study-and-teaching
- HTTP 404; original PDF pages: 6.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.associationforjewishstudies.org/professional-development/professional-development/digital-jewish-studies/perspectives-on-technology/online-resources-for-talmud-research-study-and-teaching

### https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%9c%d7%a9%d7%95%d7%9f-%d7%a2%d7%91%d7%a8%d7%99%d7%aa/
- HTTP 404; original PDF pages: 5.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%9c%d7%a9%d7%95%d7%9f-%d7%a2%d7%91%d7%a8%d7%99%d7%aa/

### https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%9e%d7%97%d7%a9%d7%91%d7%aa-%d7%99%d7%a9%d7%a8%d7%90%d7%9c/
- HTTP 404; original PDF pages: 5.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%9e%d7%97%d7%a9%d7%91%d7%aa-%d7%99%d7%a9%d7%a8%d7%90%d7%9c/

### https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%a1%d7%a4%d7%a8%d7%95%d7%aa-%d7%a2%d7%91%d7%a8%d7%99%d7%aa/
- HTTP 404; original PDF pages: 5.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.herzog.ac.il/library-page/%d7%9e%d7%90%d7%92%d7%a8%d7%99%d7%9d-%d7%91%d7%97%d7%95%d7%92-%d7%9c%d7%a1%d7%a4%d7%a8%d7%95%d7%aa-%d7%a2%d7%91%d7%a8%d7%99%d7%aa/

### https://www.maanelashon.org/links
- HTTP 404; original PDF pages: 6.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.maanelashon.org/links

### https://www.ybz.org.il/cathedra/gilyonot
- HTTP 404; original PDF pages: 32.
- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation.
- Archive lookup (not checked): https://web.archive.org/web/*/https://www.ybz.org.il/cathedra/gilyonot

## Priority 2: blocked or otherwise inconclusive

See review-queue.csv for every unresolved destination, its status, original PDF pages and latest timestamp. Test these in an ordinary browser before removing or changing them.

## Redirects

The complete audit CSV records both original and final URL. Redirects are not automatically applied: a redirect can land on a home page, login page or unrelated content.

## Editorial boundary

This is a complete HTTP audit of the PDF hyperlink destinations, not a complete content-equivalence or scholarly-quality audit. Original text and URLs are retained. Proposed repairs are explicitly differentiated from exact replacements.