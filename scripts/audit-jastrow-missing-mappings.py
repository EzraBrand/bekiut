"""Audit the local Jastrow dump; does not modify reader mappings.

Run: python3 scripts/audit-jastrow-missing-mappings.py

Outputs UTF-8/BOM CSV with two distinct-entry examples and production links.
An English dictionary filter removes word matches, including words embedded in
compound candidates. This intentionally trades recall for precision: genuine
abbreviations spelling English words (e.g. contract.) are also excluded.
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
from urllib.request import urlopen

ROOT = pathlib.Path(__file__).resolve().parents[1]
MAPPINGS = ROOT / "artifacts/chavrutai/src/shared/data/lexicon-mappings/jastrow.json"
OUTPUT = ROOT / "generated-artifacts/jastrow-missing-mappings-audit.csv"
mapping = json.loads(MAPPINGS.read_text())["mappings"]
# Public-domain/Unlicense word list, pinned for reproducible results.
# https://github.com/dwyl/english-words (LICENSE.md in the same revision).
WORD_REVISION = "20f5cc9b3f0ccc8ce45d814c532b7c2031bba31c"
WORD_URL = f"https://raw.githubusercontent.com/dwyl/english-words/{WORD_REVISION}/words_alpha.txt"
WORD_PATH = ROOT / "scripts/.cache" / f"english-words-{WORD_REVISION}.txt"
if not WORD_PATH.exists():
    with urlopen(WORD_URL, timeout=60) as response:
        word_data = response.read().decode("utf-8")
    if len(word_data.splitlines()) < 300000:
        raise ValueError("English dictionary download is unexpectedly small")
    WORD_PATH.parent.mkdir(parents=True, exist_ok=True)
    WORD_PATH.write_text(word_data)
english_words = set(WORD_PATH.read_text().lower().splitlines())
assert {"praise", "priest", "contract"} <= english_words


def english_word_in_candidate(key):
    # Preserve single-letter components of genuine compound abbreviations.
    # Keep internal punctuation (i.e.) rather than turning it into an English word.
    return any(len(word := part.rstrip(".").casefold()) > 1 and word in english_words
               for part in key.split())


assert english_word_in_candidate("praise.")
assert english_word_in_candidate("priest. Ib.")
assert not english_word_in_candidate("i.e.")
# Approximate the reader's longest-first Unicode boundaries. This is candidate
# discovery, not a substitute for testing its actual HTML/context-aware formatter.
patterns = []
for key in sorted(mapping, key=len, reverse=True):
    left = r"(?<!\w)" if key[0].isalnum() else ""
    right = r"(?!\w)" if key[-1].isalnum() else ""
    patterns.append(left + re.escape(key) + right)
known = re.compile("|".join(patterns))
token = re.compile(r"(?<!\w)([A-Za-zÀ-ž’'-]+(?:\.[A-Za-zÀ-ž’'-]+)*\.)")
compound = re.compile(
    r"(?<!\w)([A-Za-zÀ-ž’'-]+\.(?:\s+(?:(?:d[’']be|de|und)\s+)?[A-Za-zÀ-ž’'-]+\.){1,4})"
)
# Explicitly reviewed full English words, not a broad spelling-dictionary filter:
# the latter would also hide ambiguous forms such as "contract.".
sentence_words = set("""
same it him top them up off end out man of self down time me place day
Amora water to death her other ground woman away days one two three
there here this that these those on in for with from and but or
""".split())


def candidate_spans(text):
    """Keep single letters inside compound candidates, never on their own."""
    found = {}
    for pattern in (compound, token):
        for match in pattern.finditer(text):
            key = re.sub(r"\s+", " ", match[1])
            if re.fullmatch(r"[^\W\d_]\.", key, re.UNICODE):
                continue
            if any(part.rstrip(".") in sentence_words for part in key.split()):
                continue
            found[(match.start(), match.end())] = key
    return [(start, end, key) for (start, end), key in sorted(found.items())]


# Detector checks independent of the currently installed mappings.
assert (0, 7, "R. Joh.") in candidate_spans("R. Joh.")
assert (0, 8, "Targ. J.") in candidate_spans("Targ. J.")
assert candidate_spans("e. a.") == [(0, 5, "e. a.")]
assert candidate_spans("e.") == []
assert candidate_spans("him. Ib.") == [(5, 8, "Ib.")]
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
            for start, end, key in candidate_spans(text):
                if english_word_in_candidate(key):
                    continue
                # Whole known phrases disappear. An unknown compound remains
                # even when some of its components already have mappings.
                word_positions = [j for j in range(start, end) if not text[j].isspace()]
                already_covered = all(covered[j] for j in word_positions)
                if key in mapping or already_covered or (" " not in key and any(covered[start:end])):
                    continue
                counts[key] += 1
                entries[key].add(rid)
                if key[-2].islower() and re.match(r"\s*[a-z]", text[end:]):
                    priority[key] += 1
                if len(examples[key]) < 3 and rid not in {e[0] for e in examples[key]}:
                    snippet = text[max(0, start-65):end+100]
                    examples[key].append((rid, record["headword"], snippet))

def normalized(key):
    return re.sub(r"\s+", "", unicodedata.normalize("NFC", key).casefold().replace("’", "'"))


variants = collections.defaultdict(list)
for key, expansion in mapping.items():
    variants[normalized(key)].append(f"{key} → {expansion}")

columns = [
    "token", "suggested_expansion", "review_note", "example_1", "entry_url_1",
    "review_status", "example_2", "entry_url_2", "existing_mapping_variant",
    "occurrences", "entry_count", "lowercase_following_hits", "headword_1",
    "rid_1", "headword_2", "rid_2",
]

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
    for key in sorted(counts, key=lambda k: (-counts[k], k)):
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
print(f"English dictionary: {len(english_words)} words; {WORD_URL} (public domain/Unlicense).")
for key in sorted(counts, key=lambda k: (-counts[k], k))[:35]:
    print(key, counts[key], "priority", priority[key], examples[key][0])
