"""Preserve source text and every PDF link annotation with page provenance."""
import json
import sys
from pathlib import Path
import fitz

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
out = root / "sources"
out.mkdir(exist_ok=True)
doc = fitz.open(source)
pages, links = [], []
for i, page in enumerate(doc):
    pages.append({"page": i + 1, "text": page.get_text()})
    for link in page.get_links():
        rect = link.get("from")
        links.append({
            "page": i + 1, "kind": link["kind"],
            "url": link.get("uri", ""),
            "target_page": link.get("page"),
            "label": page.get_textbox(rect).strip() if rect else "",
        })
(out / "original-pages.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2))
(out / "original-links.json").write_text(json.dumps(links, ensure_ascii=False, indent=2))
(out / "original-2023.txt").write_text("\n\n".join(f"## Page {p['page']}\n{p['text']}" for p in pages))
doc[1].get_pixmap(matrix=fitz.Matrix(1.3, 1.3)).save(str(out / "original-layout.png"))
print(f"{len(pages)} pages; {len(links)} annotations; {len(set(l['url'] for l in links if l['url']))} distinct URLs")
