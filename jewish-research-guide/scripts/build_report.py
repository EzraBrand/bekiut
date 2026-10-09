"""Produce the human-review queue without conflating HTTP errors and link rot."""
import csv
import json
import shutil
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
rows = json.loads((ROOT / "reports/link-audit.json").read_text())
links = json.loads((ROOT / "sources/original-links.json").read_text())
repairs = {r["url"]: r for r in json.loads((ROOT / "data/repairs.json").read_text())}
original = {l["url"] for l in links if l["url"]}
original_rows = [r for r in rows if r["url"] in original]
counts = Counter(r["status"] for r in original_rows)
date = max(r["checked_at"] for r in rows)
out = [
    "# Link audit — 2026 working edition", "",
    f"Latest request timestamp: {date}", "",
    f"The 47-page PDF contains {len(links)} link annotations: {sum(bool(l['url']) for l in links)} external occurrences and {sum(not l['url'] for l in links)} internal annotations. The external occurrences resolve to {len(original)} distinct original URLs.",
    f"Audit includes {len(rows)} distinct destinations when curated additions are included.", "",
    "## Original 2023 destinations", "",
]
out += [f"- {k}: **{v}**" for k, v in sorted(counts.items())]
out += ["", "The checker uses GET, follows up to eight redirects, verifies TLS, and retries errors other than authentication/rate-limit blocks once. Each request has a 22-second limit. Response bodies are capped at 2 MB; this tests availability, not complete PDF download integrity.",
        "", "A successful response is not a content review. Fragment identifiers, login flows, paywalls, JavaScript applications, domain repurposing and all forms of soft 404 cannot be conclusively checked by this method. DNS/TLS/timeouts and HTTP 5xx remain unresolved. 401/403/429 are not counted as dead.",
        "", "## Priority 1: repeated HTTP 404 or 410", ""]
for r in original_rows:
    if r["status"] != "not_found": continue
    pages = sorted({l["page"] for l in links if l["url"] == r["url"]})
    out += [f"### {r['url']}", f"- HTTP {r['http_status']}; original PDF pages: {', '.join(map(str, pages))}."]
    if r["url"] in repairs:
        repair = repairs[r["url"]]
        out += [f"- Suggested destination: {repair['alternativeUrl']}", "- " + repair["note"]]
    else:
        out += ["- No verified replacement identified in this pass. Search the publisher’s current catalogue and web archives; preserve the original citation."]
    out += [f"- Archive lookup (not checked): https://web.archive.org/web/*/{r['url']}", ""]
out += ["## Priority 2: blocked or otherwise inconclusive", "",
        "See review-queue.csv for every unresolved destination, its status, original PDF pages and latest timestamp. Test these in an ordinary browser before removing or changing them.", "",
        "## Redirects", "", "The complete audit CSV records both original and final URL. Redirects are not automatically applied: a redirect can land on a home page, login page or unrelated content.", "",
        "## Editorial boundary", "", "This is a complete HTTP audit of the PDF hyperlink destinations, not a complete content-equivalence or scholarly-quality audit. Original text and URLs are retained. Proposed repairs are explicitly differentiated from exact replacements."]
(ROOT / "reports/link-audit.md").write_text("\n".join(out))
with (ROOT / "reports/review-queue.csv").open("w") as f:
    writer = csv.DictWriter(f, fieldnames=["url", "status", "http_status", "final_url", "source_pages", "checked_at", "alternative_url", "repair_note"])
    writer.writeheader()
    for r in rows:
        if r["status"] in ("reachable", "redirected"): continue
        repair = repairs.get(r["url"], {})
        writer.writerow({k: r.get(k) for k in ["url", "status", "http_status", "final_url", "checked_at"]} | {
            "source_pages": ", ".join(map(str, sorted({l["page"] for l in links if l["url"] == r["url"]}))),
            "alternative_url": repair.get("alternativeUrl", ""), "repair_note": repair.get("note", "")
        })
for file in ["link-audit.md", "review-queue.csv"]:
    shutil.copy(ROOT / "reports" / file, ROOT / "site/downloads" / file)
print(f"Report written; {sum(r['status'] not in ('reachable', 'redirected') for r in rows)} destinations need review.")
