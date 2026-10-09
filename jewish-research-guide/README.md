# Jewish Research Guide — 2026 working edition

A standalone update project for Ezra Brand’s *Guide to Online Resources for Scholarly Jewish Study and Research* (2023, v6, 4 December).

**Status:** first 2026 working edition, not a completed line-by-line revision of all 47 pages. The full 2023 text and all hyperlink destinations are retained. A curated directory, AI research section, and reproducible link audit provide the new edition’s starting point. Original pricing, corpus sizes and time-sensitive claims have **not** all been revalidated.

## Preview

No build, database, API keys, package install or external JavaScript is needed:

```sh
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000`. Opening `index.html` with a `file:` URL does not work because the directory loads JSON.

In the Replit workspace, `artifacts/research-guide-preview` is only a preview wrapper. This folder is its own Git repository and does not depend on Bekiut or the workspace monorepo.

## Publish on GitHub Pages

1. Create a GitHub repository and push **this folder’s repository**, not the outer Bekiut workspace. No remote is configured yet.
2. In the repository’s Settings → Pages, select **GitHub Actions** as the source.
3. Push to `main`, or run “Publish guide to GitHub Pages” manually.

The included workflow publishes only `site/`. All paths are relative, so project URLs such as `https://OWNER.github.io/REPOSITORY/` work without rebuilding. No GitHub repository or live deployment has been created by this setup.

## Contents

- `site/`: publishable website, generated JSON and downloadable text/CSV.
- `data/curated.tsv`: selected established resources.
- `data/additions.tsv`: scholarly-relevance selections from the two requested directories.
- `sources/`: original PDF text, page text and all 618 link annotations; research-directory snapshots.
- `reports/`: timestamped HTTP audit and review queue.
- `docs/guide-2026.md`: updated editorial introduction and AI chapter.
- `docs/presentation-options.md`: presentation choices and recommendation.
- `scripts/`: reproducible extraction, auditing and data preparation.

## Updating the data

The extraction script requires Python 3.10+ and PyMuPDF. Other scripts use the standard library; the link checker also requires `curl`.

```sh
python scripts/extract_pdf.py /path/to/original.pdf
python scripts/build_data.py
python scripts/audit_links.py
python scripts/build_data.py
python scripts/build_report.py
python scripts/validate.py
```

The existing audit is cached by URL. Use `python scripts/audit_links.py --refresh` to recheck every destination. New resource URLs are checked on the next normal run. Build data once before checking to include additions, and again afterward to publish their statuses.

Audits are deliberately not run automatically on every deployment: transient blocking should not break publication, and repeated external checks impose unnecessary load.

## Editorial method and limits

- All 511 original hyperlink destinations remain in the inventory, including footnotes, background references and duplicate-domain links; these are not 511 independently reviewed resources.
- Curated entries are a smaller selection. “Include all historical links” exposes the complete inventory, with original page provenance.
- The 2023 source extraction may contain partial hyperlink labels, especially for multiline and right-to-left text. Consult the original PDF for authoritative layout.
- Directory inclusion is discovery evidence, not endorsement. Current pricing and access are marked unknown where not reviewed.
- HTTP 404/410, access blocks, other HTTP errors and transport failures are separate. HTTP 200 does not prove the expected content survived; fragments, logins, paywalls and JavaScript-only applications need manual checks.
- Original URLs are not silently replaced. Redirect destinations and possible repairs are preserved separately.
- Bekiut is the author’s own project, disclosed in its entry.

## Source and rights

Original guide: https://www.academia.edu/83334340/Guide_to_Online_Resources_for_Scholarly_Jewish_Study_and_Research_2023

Discovery directories:

- https://developers.sefaria.org/docs/powered-by-sefaria
- https://jewishai.me/table.html

No new blanket license is asserted for the original guide, source snapshots or third-party materials. Review rights before redistribution; the guide links to resources rather than mirroring their collections. The original PDF itself is not copied into the published site.
