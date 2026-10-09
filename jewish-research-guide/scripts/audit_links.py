"""Conservative HTTP audit. A successful response is not a scholarly endorsement."""
import concurrent.futures
import csv
import datetime
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]

def check(url):
    stamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    if urlsplit(url).scheme not in ("http", "https"):
        return dict(url=url, status="not_http", http_status=None, final_url=url,
                    checked_at=stamp, error="Manual review: non-HTTP link")
    attempts = []
    for attempt in range(2):
        with tempfile.NamedTemporaryFile() as body:
            p = subprocess.run([
                "curl", "-L", "--max-redirs", "8", "--connect-timeout", "8",
                "--max-time", "22", "--max-filesize", "2000000", "-sS",
                "--proto", "=http,https", "--proto-redir", "=http,https",
                "-A", "JewishResearchGuideLinkAudit/2026 (link availability check)",
                "-o", body.name, "-w", "%{http_code}\\n%{url_effective}", url,
            ], capture_output=True, text=True)
            fields = p.stdout.splitlines()
            code = int(fields[0]) if fields and fields[0].isdigit() else 0
            final = fields[1] if len(fields) > 1 else url
            text = Path(body.name).read_bytes()[:200000].decode("utf-8", errors="ignore").lower()
            attempts.append({"http_status": code, "exit_code": p.returncode})
        if 200 <= code < 300:
            status = "redirected" if final != url else "reachable"
            if any(x in text for x in ("<title>just a moment", "<title>access denied", "this domain is for sale", "<title>404", "<title>page not found")):
                status = "manual_review"
            break
        if code in (401, 403, 429):
            status = "blocked_or_restricted"
            break
        status = "http_error" if code else "network_error"
        if code in (404, 410):
            status = "not_found"
        if attempt == 0:
            continue
    return dict(url=url, status=status, http_status=code or None, final_url=final,
                checked_at=stamp, error=p.stderr[:350] if p.returncode else "",
                attempts=attempts)

def main():
    links = json.loads((ROOT / "sources/original-links.json").read_text())
    resources_path = ROOT / "site/data/resources.json"
    resources = json.loads(resources_path.read_text()) if resources_path.exists() else []
    urls = sorted({l["url"] for l in links if l["url"]} | {r["url"] for r in resources})
    report = ROOT / "reports"
    report.mkdir(exist_ok=True)
    previous = report / "link-audit.json"
    cached = {r["url"]: r for r in json.loads(previous.read_text())} if previous.exists() and "--refresh" not in sys.argv else {}
    results = [cached[u] for u in urls if u in cached]
    pending = [u for u in urls if u not in cached]
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
        futures = {pool.submit(check, u): u for u in pending}
        for f in concurrent.futures.as_completed(futures):
            result = f.result()
            results.append(result)
            if len(results) % 50 == 0:
                print(f"Checked {len(results)}/{len(urls)}", flush=True)
    results.sort(key=lambda r: r["url"])
    (report / "link-audit.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
    with (report / "link-audit.csv").open("w") as f:
        writer = csv.DictWriter(f, fieldnames=["url", "status", "http_status", "final_url", "checked_at", "error"], extrasaction="ignore")
        writer.writeheader()
        writer.writerows(results)
    from collections import Counter
    print(json.dumps(dict(Counter(r["status"] for r in results)), indent=2))

if __name__ == "__main__":
    main()
