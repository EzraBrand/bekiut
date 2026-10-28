"""Audit the local Jastrow dump; does not modify reader mappings.

Run: python3 scripts/audit-jastrow-missing-mappings.py
"""
import collections
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
MAPPINGS = ROOT / "artifacts/chavrutai/src/shared/data/lexicon-mappings/jastrow.json"
OUTPUT = ROOT / "docs/jastrow-missing-mappings-audit.md"
mapping = json.loads(MAPPINGS.read_text())["mappings"]
# Approximate the reader's longest-first Unicode boundaries. This is candidate
# discovery, not a substitute for testing its actual HTML/context-aware formatter.
patterns = []
for key in sorted(mapping, key=len, reverse=True):
    left = r"(?<!\w)" if key[0].isalnum() else ""
    right = r"(?!\w)" if key[-1].isalnum() else ""
    patterns.append(left + re.escape(key) + right)
known = re.compile("|".join(patterns))
token = re.compile(r"(?<!\w)([A-Za-zÀ-ž’'-]+\.)")
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
                if len(examples[key]) < 3:
                    snippet = text[max(0, match.start()-65):match.end()+100]
                    examples[key].append((rid, record["headword"], snippet))

lines = [
    "# Jastrow missing-mapping audit", "",
    f"Scanned **{len(seen):,} unique entries** and **{fields:,} text fields** in the local GitHub dump.",
    f"Compared against **{len(mapping):,} mapping keys**. Found **{len(counts):,} distinct residual dotted tokens**.",
    "",
    "## Method and limitations", "",
    "- Scan definitions, nested senses, morphology, and language notes; remove HTML and decode entities.",
    "- Mask known mappings longest-first so pieces of compound mappings are not reported as missing.",
    "- Prioritize tokens ending in a lowercase letter plus period followed by lowercase text.",
    "- Also include uppercase forms and tokens before Hebrew/numbers, which that heuristic misses.",
    "- Counts are source occurrences, not confirmed rendering failures. Contextual mappings, HTML splitting, sentence endings, Roman numerals, and headword shorthand still require review.",
    "- This is the local dump, not a fresh snapshot of Sefaria's live API. No mappings were changed.", "",
    "## Candidate inventory", "",
    "| Token | Occurrences | Entries | Lowercase-following hits | Example |",
    "|---|---:|---:|---:|---|",
]
for key in sorted(counts, key=lambda k: (-priority[k], -counts[k], k)):
    rid, headword, snippet = examples[key][0]
    example = f"{headword} ({rid}): {snippet}".replace("|", "\\|").replace("\n", " ")
    lines.append(f"| `{key}` | {counts[key]} | {len(entries[key])} | {priority[key]} | {example} |")
OUTPUT.write_text("\n".join(lines) + "\n")
pathlib.Path("/tmp/jastrow-missing-mappings.json").write_text(json.dumps({
    "entries": len(seen), "fields": fields, "counts": counts,
    "priority": priority, "examples": examples,
}, ensure_ascii=False))
print(f"Wrote {OUTPUT.relative_to(ROOT)}")
for key in sorted(counts, key=lambda k: (-priority[k], -counts[k]))[:65]:
    print(key, counts[key], "priority", priority[key], examples[key][0])
