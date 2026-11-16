#!/usr/bin/env python3
"""Reproducible preliminary audit, not a complete dictionary census.

Downloads the entire bibliography in one request, then five evenly spaced
headwords per Hebrew letter. Caches raw API responses outside Git.
No additional Python packages required. Run from the workspace root.
"""
import collections
import concurrent.futures
import csv
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
import urllib.parse
import urllib.request

OUT = Path("generated-artifacts/ben-yehuda-analysis")
OUT.mkdir(parents=True, exist_ok=True)
CACHE = OUT / "sample"
CACHE.mkdir(exist_ok=True)
BASE = "https://www.sefaria.org"


def fetch(url, path):
    if path.exists():
        return json.loads(path.read_text())
    with urllib.request.urlopen(url, timeout=40) as response:
        data = json.load(response)
    path.write_text(json.dumps(data, ensure_ascii=False))
    return data


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.sources = []
        self.depth = 0
        self.source_parts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("p", "br", "div", "sup", "i"):
            self.parts.append(" ")
        if tag == "span":
            if self.depth:
                self.depth += 1
            elif "by-source" in attrs.get("class", "").split():
                self.depth = 1
                self.source_parts = []

    def handle_endtag(self, tag):
        if tag == "span" and self.depth:
            self.depth -= 1
            if not self.depth:
                self.sources.append("".join(self.source_parts).strip())
        if tag in ("p", "div", "sup", "i"):
            self.parts.append(" ")

    def handle_data(self, data):
        self.parts.append(data)
        if self.depth:
            self.source_parts.append(data)


def parse(value):
    parser = Text()
    parser.feed(value)
    return re.sub(r"\s+", " ", "".join(parser.parts)).strip(), parser.sources


def csv_write(name, rows, columns):
    with (OUT / name).open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)


# Hebrew apostrophe/double-quote abbreviation shapes; these are candidates,
# including authors' initials and locators, not automatic mapping instructions.
HE = r"א-ת\u0591-\u05BD\u05BF-\u05C2\u05C4-\u05C5\u05C7"
TOKEN = re.compile(
    rf"""(?<![\w])(?:[{HE}]+[״"][{HE}]+|[{HE}]+['׳’]|"""
    r"""(?:[A-Za-zÀ-ž]{2,}\.\s+){1,3}[A-Za-zÀ-ž]{2,}\.|[A-Za-zÀ-ž]{2,}\.|[A-Z]{2,6})(?![\w])"""
)

# Manually reviewed against the sample's examples. Suggestions only; the
# production reader does not consume this table.
REVIEW = {
    "וכו'": ("וכולי", "Common abbreviation; retain original in quoted passages unless user opts into expansion"),
    "יי'": ("", "Divine-name spelling, not an ordinary abbreviation; leave unchanged"),
    "בראש'": ("בראשית", "Book name; use linked citation identity when available"),
    "ישע'": ("ישעיהו", "Book name; use linked citation identity when available"),
    "תהל'": ("תהלים", "Book name; use linked citation identity when available"),
    "תהיל'": ("תהלים", "Spelling variant of תהל׳"),
    "ירמ'": ("ירמיהו", "Book name"),
    "במד'": ("במדבר", "Book name"),
    "דבר'": ("דברים", "Book name in citations; do not replace inside unrelated prose"),
    "ויקר'": ("ויקרא", "Book name"),
    "ש\"א": ("שמואל א", "Citation context only"),
    "ש\"ב": ("שמואל ב", "Citation context only"),
    "מ\"א": ("מלכים א", "Citation context only"),
    "מ\"ב": ("מלכים ב", "Citation context only"),
    "דהי\"א": ("דברי הימים א", "Citation context only"),
    "דהי\"ב": ("דברי הימים ב", "Citation context only"),
    "במשמ'": ("במשמעות", "Expository abbreviation; lower risk"),
    "עי'": ("עיין", "Cross-reference instruction"),
    "ועי'": ("ועיין", "Preserve attached conjunction"),
    "ר\"ל": ("רוצה לומר", "Expository abbreviation"),
    "וכמו\"כ": ("וכמו כן", "Preserve attached conjunction"),
    "בערב'": ("בערבית", "Language note"),
    "בארמ'": ("בארמית", "Language note"),
    "בעבר'": ("בעברית", "Language note"),
    "כ\"י": ("כתב יד", "Bibliographic abbreviation"),
    "מד\"ר": ("מדרש רבה", "Corroborated by bibliography paragraph 483; context still identifies specific work"),
    "מ\"ר": ("", "Ambiguous: plural morphology (מספר רבים) or מדרש רבה in citations; no global expansion"),
    "ש\"נ": ("שם נקבה", "Morphology label; expand only in grammatical context"),
    "ש\"ז": ("שם זכר", "Morphology label; expand only in grammatical context"),
    "ר'": ("", "רבי / רב; context-sensitive, not one global replacement"),
    "ר\"י": ("", "Ambiguous initials: sample includes ר״י חיוג and other people"),
    "ר\"ש": ("", "Ambiguous personal initials; resolve with following name"),
    "ב\"מ": ("בבא מציעא", "Citation context only"),
    "ב\"ק": ("בבא קמא", "Citation context only"),
    "ב\"ב": ("", "Often בבא בתרא, but sample also has תוספתא כלים ב״ב; needs surrounding work"),
    "ברכ'": ("ברכות", "Tractate name in citations"),
    "ירוש'": ("ירושלמי", "Corpus qualifier; preserve following tractate and locator"),
    "עמ'": ("עמוד", "Locator abbreviation, not a work title"),
    "ZMG": ("Zeitschrift der Deutschen Morgenländischen Gesellschaft", "Bibliography paragraph 1298; compare volume/year before assigning authority ID"),
    "AJSL": ("American Journal of Semitic Languages and Literatures", "Journal initialism; bibliography does not itself give a direct abbreviation key"),
}


def main():
    books_ref = "Ben Yehuda Dictionary, Prolegomena, List of Books Used"
    books = fetch(BASE + "/api/v3/texts/" + urllib.parse.quote(books_ref), OUT / "books.json")
    paragraphs = next(v["text"] for v in books["versions"] if v["language"] == "he")
    rows = [{"paragraph": i, "source_text": parse(p)[0],
             "sefaria_url": BASE + "/" + urllib.parse.quote(books_ref + "." + str(i))}
            for i, p in enumerate(paragraphs, 1)]
    csv_write("books-used.csv", rows, ["paragraph", "source_text", "sefaria_url"])

    index = json.loads(Path("lib/shared-data/src/data/lexicon-headwords/ben-yehuda.json").read_text())
    groups = collections.defaultdict(list)
    for word in index["headwords"]:
        letter = re.sub(r"[\u0591-\u05c7]", "", word)[0]
        groups[letter].append(word)
    selected = sorted(set(words[int((len(words) - 1) * n / 4)]
                          for words in groups.values() for n in range(5)))
    # Include known long grammatical, ordinary lexical, and pointer examples.
    selected = sorted(set(selected + ["ה", "אָב I", "אָב II", "שָׁלוֹם", "תַּתְרָן"]))
    failures = []
    entries = {}

    def get(word):
        key = hashlib.sha256(word.encode()).hexdigest()[:20]
        try:
            data = fetch(BASE + "/api/words/" + urllib.parse.quote(word), CACHE / (key + ".json"))
            if not isinstance(data, list):
                raise ValueError(str(data)[:120])
            records = [r for r in data if r.get("parent_lexicon") == "Ben Yehuda Dictionary"]
            if not records:
                raise ValueError("No Ben-Yehuda records")
            return word, records, None
        except Exception as exc:
            return word, [], str(exc)
        finally:
            time.sleep(.15)

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        for word, records, error in pool.map(get, selected):
            if error:
                failures.append({"headword": word, "error": error})
            for record in records:
                entries[record.get("rid", record["headword"])] = record
    counts = collections.Counter()
    entry_counts = collections.Counter()
    examples = collections.defaultdict(list)
    citation_counts = collections.Counter()
    anchors = notes = paragraph_count = 0
    for rid, entry in entries.items():
        paragraphs = entry["content"]["definition"]
        paragraph_count += len(paragraphs)
        source = " ".join(paragraphs)
        anchors += source.count("<a ")
        notes += source.count('class="footnote-marker"')
        text, citations = parse(source)
        citation_counts.update(citations)
        seen = set()
        for match in TOKEN.finditer(text):
            token = match.group()
            if re.fullmatch("[IVXLCDM]+", token):
                continue
            counts[token] += 1
            seen.add(token)
            if len(examples[token]) < 2 and all(x["rid"] != rid for x in examples[token]):
                examples[token].append({
                    "example": text[max(0, match.start()-65):match.end()+100],
                    "rid": rid, "headword": entry["headword"],
                    "url": "https://bekiut.com/ben-yehuda?" + urllib.parse.urlencode({"q": entry["headword"], "rid": rid}),
                })
        entry_counts.update(seen)
    book_counts = collections.Counter(m.group() for r in rows for m in TOKEN.finditer(r["source_text"]))
    candidates = []
    for token, count in counts.most_common():
        row = {"token": token, "occurrences_in_sample": count, "entry_count": entry_counts[token],
               "bibliography_occurrences": book_counts[token],
               "suggested_expansion": REVIEW.get(token, ("", ""))[0],
               "review_note": REVIEW.get(token, ("", "Candidate only; not reviewed"))[1]}
        for n in (1, 2):
            e = examples[token][n-1] if len(examples[token]) >= n else {}
            for key in ("example", "url", "headword", "rid"):
                row[f"{key}_{n}"] = e.get(key, "")
        candidates.append(row)
    columns = ["token", "suggested_expansion", "review_note", "occurrences_in_sample",
               "entry_count", "bibliography_occurrences"] + [f"{k}_{n}" for n in (1, 2) for k in ("example", "url", "headword", "rid")]
    csv_write("abbreviation-candidates.csv", candidates, columns)
    csv_write("citation-labels.csv",
              [{"citation_label": k, "occurrences_in_sample": v} for k, v in citation_counts.most_common()],
              ["citation_label", "occurrences_in_sample"])
    summary = {
        "retrieved_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "headword_snapshot": len(index["headwords"]), "letters": len(groups),
        "requested_headwords": len(selected), "returned_unique_entries": len(entries),
        "paragraphs": paragraph_count, "bibliography_paragraphs": len(rows),
        "candidate_tokens": len(counts), "candidate_occurrences": sum(counts.values()),
        "source_citations": sum(citation_counts.values()), "raw_anchors": anchors, "footnotes": notes,
        "failures": failures, "sampling": "five evenly spaced headwords per letter plus named probes; lookup may return multiple homographs",
        "limitation": "Preliminary sample, not full corpus frequencies. Hebrew quote patterns include numerals and ordinary punctuation.",
    }
    (OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print("TOP CANDIDATES", counts.most_common(35))


if __name__ == "__main__":
    main()
