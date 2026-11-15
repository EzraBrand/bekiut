"""Reproduce the scoped autocomplete snapshot (not a verified complete corpus).

Run: python scripts/snapshot-ben-yehuda.py
Refuses unexpected totals or removals; investigate upstream changes before updating.
Only headwords and provenance are retained, never full dictionary definitions.
"""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import re
import urllib.parse
import urllib.request

LETTERS = list("אבגדהוזחטיכלמנסעפצקרשת")
OUTPUT = pathlib.Path("lib/shared-data/src/data/lexicon-headwords/ben-yehuda.json")

def headword_sort_key(word):
    # Vowels must not sort before the next consonant. Keep the source spelling
    # as a deterministic tie-breaker; no pointed form or homograph is discarded.
    bare = re.sub(r"[\u0591-\u05BD\u05BF-\u05C7]", "", word)
    return bare.translate(str.maketrans("ךםןףץ", "כמנפצ")), word


def fetch_letter(letter):
    url = ("https://www.sefaria.org/api/words/completion/"
           + urllib.parse.quote(letter)
           + "/Ben%20Yehuda%20Dictionary?limit=100000")
    with urllib.request.urlopen(url, timeout=60) as response:
        rows = json.load(response)
    if not isinstance(rows, list) or not rows:
        raise ValueError(f"Invalid completion response for {letter}")
    words = []
    for row in rows:
        if not isinstance(row, list) or len(row) < 2 or not isinstance(row[1], str):
            raise ValueError(f"Unexpected completion row: {row!r}")
        words.append(row[1])
    return letter, sorted(set(words), key=headword_sort_key), url


def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(fetch_letter, LETTERS))
    words = sorted({word for _, group, _ in results for word in group}, key=headword_sort_key)
    if len(words) != 21999:
        raise ValueError(f"Unexplained snapshot change: expected 21999, got {len(words)}")
    if OUTPUT.exists():
        previous = set(json.loads(OUTPUT.read_text())["headwords"])
        if previous != set(words):
            raise ValueError(f"Snapshot drift: {len(previous-set(words))} removed, "
                             f"{len(set(words)-previous)} added. Investigate before replacing.")
    data = {"_metadata": {
        "lexicon": "Ben Yehuda Dictionary",
        "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "total_headwords": len(words),
        "per_letter_counts": {letter: len(group) for letter, group, _ in results},
        "source_urls": [url for _, _, url in results],
        "sha256": hashlib.sha256("\n".join(words).encode()).hexdigest(),
        "scope": "Scoped autocomplete snapshot; not independently verified corpus completeness",
        "sort": "Unpointed Hebrew spelling with final letters folded; source spelling as tie-breaker",
        "attribution": "Eliezer Ben-Yehuda; digitized by Project Ben-Yehuda; served by Sefaria",
    }, "headwords": words}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"Validated {len(words)} headwords across {len(results)} letters")


if __name__ == "__main__":
    main()
