"""Build portable directory data while retaining every original link destination."""
import csv
import hashlib
import json
import shutil
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "site/data"
DOWNLOADS = ROOT / "site/downloads"
DATA.mkdir(parents=True, exist_ok=True)
DOWNLOADS.mkdir(parents=True, exist_ok=True)
links = json.loads((ROOT / "sources/original-links.json").read_text())
audits = json.loads((ROOT / "reports/link-audit.json").read_text())
audit = {x["url"]: x for x in audits}
resources = {}
SOURCE = "https://www.academia.edu/83334340/Guide_to_Online_Resources_for_Scholarly_Jewish_Study_and_Research_2023"
DIRECTORIES = {
    "Sefaria directory": "https://developers.sefaria.org/docs/powered-by-sefaria",
    "JewishAI directory": "https://jewishai.me/table.html",
}

def category(page):
    if page < 8: return "Guides & context"
    if page < 14: return "Primary texts"
    if page < 16: return "Scanned books"
    if page < 23: return "Manuscripts"
    if page < 29: return "Search & bibliographies"
    if page < 36: return "Secondary literature"
    if page < 38: return "Search & bibliographies"
    if page < 41: return "Dictionaries & language"
    return "Media & communities"

def norm(url):
    p = urlsplit(unquote(url))
    return (p.netloc.removeprefix("www.") + p.path.rstrip("/") + ("?" + p.query if p.query else "")).lower()

for link in links:
    url = link["url"]
    if not url: continue
    if url in resources:
        resources[url]["sourcePages"] = sorted(set(resources[url]["sourcePages"] + [link["page"]]))
        continue
    label = " ".join(link["label"].split())
    if len(label) < 4 or label.lower() in ("here", "about page", "wikipedia"):
        label = unquote(urlsplit(url).netloc + urlsplit(url).path)[:150]
    resources[url] = dict(
        title=label, url=url, category=category(link["page"]),
        description=f"Historical link from the 2023 guide, page {link['page']}. Includes supporting references as well as resource homepages; see the original text for context.",
        access="Not re-evaluated", origin="2023 guide", sourceUrl=SOURCE,
        sourceLabel="Original PDF; extracted hyperlink", sourcePages=[link["page"]],
        caution="Imported automatically. Anchor labels may be partial, especially across lines or in Hebrew. A successful HTTP response does not verify content, access terms or scholarly quality.",
        featured=False,
    )

with (ROOT / "data/curated.tsv").open() as f:
    for row in csv.DictReader(f, delimiter="\t"):
        match = next((u for u in resources if norm(u) == norm(row["url"])), None)
        if match:
            r = resources[match]
            row["url"] = match
        else:
            r = dict(origin="2026 addition", sourceUrl=SOURCE, sourceLabel="2023 guide; current resource entry point",
                     sourcePages=[], caution="Check current coverage, editions and access terms.")
        r.update(row, featured=True)
        resources[r["url"]] = r

with (ROOT / "data/additions.tsv").open() as f:
    for row in csv.DictReader(f, delimiter="\t"):
        row.update(featured=True, sourcePages=[], sourceUrl=DIRECTORIES[row["origin"]],
                   sourceLabel=row["origin"] + "; selected for scholarly relevance")
        resources[row["url"]] = row

for url, r in resources.items():
    a = audit.get(url, {})
    r.update(id=hashlib.sha256(url.encode()).hexdigest()[:12],
             status=a.get("status", "unchecked"), checkedAt=a.get("checked_at"),
             finalUrl=a.get("final_url", url), httpStatus=a.get("http_status"))
repairs = json.loads((ROOT / "data/repairs.json").read_text())
for repair in repairs:
    if repair["url"] in resources:
        resources[repair["url"]].update(alternativeUrl=repair["alternativeUrl"], repairNote=repair["note"])
rows = sorted(resources.values(), key=lambda r: (not r["featured"], r["title"].casefold()))
(DATA / "resources.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2))
summary = dict(
    checkedAt=max(a["checked_at"] for a in audits), counts=dict(Counter(a["status"] for a in audits)),
    total=len(audits), originalUniqueUrls=len({l["url"] for l in links if l["url"]}),
    pdfPages=47, annotations=len(links), internalLinks=sum(not l["url"] for l in links),
    newResources=sum(r["origin"] != "2023 guide" for r in rows),
    curatedResources=sum(r["featured"] for r in rows),
    originalCounts=dict(Counter(audit[l]["status"] for l in {x["url"] for x in links if x["url"]})),
)
(DATA / "audit-summary.json").write_text(json.dumps(summary, indent=2))
with (DOWNLOADS / "resources.csv").open("w") as f:
    fields = ["title", "url", "category", "description", "access", "origin", "sourceUrl", "sourcePages", "caution", "status", "checkedAt", "featured"]
    writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(rows)
shutil.copy(ROOT / "reports/link-audit.csv", DOWNLOADS)
shutil.copy(ROOT / "sources/original-2023.txt", DOWNLOADS)
guide = ROOT / "docs/guide-2026.md"
if guide.exists(): shutil.copy(guide, DOWNLOADS)
print(json.dumps(summary, indent=2))
