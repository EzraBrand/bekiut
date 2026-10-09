"""Cheap reproducible integrity checks for the static publication."""
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
resources = json.loads((SITE / "data/resources.json").read_text())
audit = json.loads((ROOT / "reports/link-audit.json").read_text())
links = json.loads((ROOT / "sources/original-links.json").read_text())
summary = json.loads((SITE / "data/audit-summary.json").read_text())
urls = {r["url"] for r in resources}
assert len(urls) == len(resources), "Duplicate resource URLs"
assert len({r["id"] for r in resources}) == len(resources), "Duplicate IDs"
assert {l["url"] for l in links if l["url"]} <= urls, "Lost original hyperlink"
assert urls <= {r["url"] for r in audit}, "Resource not audited"
assert len(audit) == sum(summary["counts"].values()) == summary["total"]
assert sum(summary["originalCounts"].values()) == summary["originalUniqueUrls"]
assert all(r["status"] != "unchecked" for r in resources)
assert all(r["sourceUrl"] and r["description"] and r["category"] for r in resources)

class Parser(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in ("src", "href") or not value: continue
            if value.startswith("#") or urlsplit(value).scheme: continue
            assert (SITE / value.split("#")[0].split("?")[0]).exists(), f"Missing local asset: {value}"

Parser().feed((SITE / "index.html").read_text())
print(f"PASS: {len(resources)} unique resources, all original URLs retained, all resources audited, local assets present.")
