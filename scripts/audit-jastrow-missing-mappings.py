"""Audit the local Jastrow dump; does not modify reader mappings.

Run: python3 scripts/audit-jastrow-missing-mappings.py

Outputs UTF-8/BOM CSV with two distinct-entry examples and production links.
Unreviewed sentence-ending words are deliberately retained for recall.
Known-key masking approximates the reader; counts are source occurrences,
not confirmed rendering failures. Variant matches are clues, NOT validated
expansions (e.g. Fr. must not inherit fr. -> from).
"""
import collections
import csv
import html
import json
import pathlib
import re
import unicodedata
from urllib.parse import urlencode, quote

ROOT = pathlib.Path(__file__).resolve().parents[1]
MAPPINGS = ROOT / "artifacts/chavrutai/src/shared/data/lexicon-mappings/jastrow.json"
OUTPUT = ROOT / "generated-artifacts/jastrow-missing-mappings-audit.csv"
mapping = json.loads(MAPPINGS.read_text())["mappings"]
# Approximate the reader's longest-first Unicode boundaries. This is candidate
# discovery, not a substitute for testing its actual HTML/context-aware formatter.
patterns = []
for key in sorted(mapping, key=len, reverse=True):
    left = r"(?<!\w)" if key[0].isalnum() else ""
    right = r"(?!\w)" if key[-1].isalnum() else ""
    patterns.append(left + re.escape(key) + right)
known = re.compile("|".join(patterns))
token = re.compile(r"(?<!\w)([A-Za-zÀ-ž’'-]+(?:\.[A-Za-zÀ-ž’'-]+)*\.)")
counts = collections.Counter()
priority = collections.Counter()
entries = collections.defaultdict(set)
examples = collections.defaultdict(list)
seen = set()
fields = 0


def definitions(value):
    if isinstance(value, dict):
        for key, item in value.items():
            if key in ("definition", "morphology", "language_code", "language_reference") and isinstance(item, str):
                yield item
            elif isinstance(item, (dict, list)):
                yield from definitions(item)
    elif isinstance(value, list):
        for item in value:
            yield from definitions(item)


for filename in ("part1.jsonl", "part2.jsonl"):
    path = ROOT / "scripts/.cache/jastrow-bulk" / filename
    for line in path.open():
        record = json.loads(line)
        rid = record["rid"]
        if rid in seen:
            raise ValueError(f"Duplicate entry: {rid}")
        seen.add(rid)
        for raw in definitions(record):
            fields += 1
            text = html.unescape(re.sub(r"<[^>]+>", "", raw))
            covered = bytearray(len(text))
            for match in known.finditer(text):
                covered[match.start():match.end()] = b"\1" * (match.end() - match.start())
            for match in token.finditer(text):
                key = match[1]
                if key in mapping or any(covered[match.start():match.end()]):
                    continue
                counts[key] += 1
                entries[key].add(rid)
                if key[-2].islower() and re.match(r"\s*[a-z]", text[match.end():]):
                    priority[key] += 1
                if len(examples[key]) < 3 and rid not in {e[0] for e in examples[key]}:
                    snippet = text[max(0, match.start()-65):match.end()+100]
                    examples[key].append((rid, record["headword"], snippet))

def normalized(key):
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", key).casefold().replace("’", "'"))


variants = collections.defaultdict(list)
for key, expansion in mapping.items():
    variants[normalized(key)].append(f"{key} → {expansion}")

columns = ["token", "occurrences", "entry_count", "lowercase_following_hits",
           "existing_mapping_variant", "review_status", "suggested_expansion", "review_note"]
for number in (1, 2):
    columns += [f"example_{number}", f"headword_{number}", f"rid_{number}", f"entry_url_{number}"]

review_path = ROOT / "scripts/jastrow-audit-review.json"
reviews = json.loads(review_path.read_text()) if review_path.exists() else {}


def safe_cell(value):
    # Keep excerpts as text when imported into Excel/Sheets, never formulas.
    value = str(value)
    return "'" + value if value.lstrip().startswith(("=", "+", "-", "@")) else value


OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with OUTPUT.open("w", encoding="utf-8-sig", newline="") as stream:
    writer = csv.DictWriter(stream, fieldnames=columns)
    writer.writeheader()
    for key in sorted(counts, key=lambda k: (-priority[k], -counts[k], k)):
        status, expansion, note = reviews.get(key, ["unreviewed", "", ""])
        row = dict(token=key, occurrences=counts[key], entry_count=len(entries[key]),
                   lowercase_following_hits=priority[key],
                   existing_mapping_variant="; ".join(variants[normalized(key)]),
                   review_status=status, suggested_expansion=expansion, review_note=note)
        for number, (rid, headword, snippet) in enumerate(examples[key][:2], 1):
            row.update({
                f"example_{number}": snippet, f"headword_{number}": headword,
                f"rid_{number}": rid,
                f"entry_url_{number}": "https://bekiut.com/jastrow?" + urlencode(
                    {"q": headword, "rid": rid}, quote_via=quote),
            })
        writer.writerow({k: safe_cell(v) for k, v in row.items()})
pathlib.Path("/tmp/jastrow-missing-mappings.json").write_text(json.dumps({
    "entries": len(seen), "fields": fields, "counts": counts,
    "priority": priority, "examples": examples,
}, ensure_ascii=False))
print(f"Wrote {OUTPUT.relative_to(ROOT)}")
print(f"{len(seen)} entries; {fields} text fields; {len(counts)} residual tokens; {len(mapping)} mapping keys.")
for key in sorted(counts, key=lambda k: (-priority[k], -counts[k]))[:35]:
    print(key, counts[key], "priority", priority[key], examples[key][0])
