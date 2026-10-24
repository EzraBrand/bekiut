"""Count source hyperlinks in the pinned raw Jastrow export (not mapped text).

Usage: python3 scripts/analyze-jastrow-citations.py
Requires raw JSONL cached by generate-jastrow-index-details.ts.
Only metadata/results are written to docs; full source stays in ignored cache.
"""
import collections
import csv
import datetime
import html.parser
import json
import pathlib
import re
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
REVISION = "05c8a79bbf2408f3909151d08d71a6f3e33e9ead"
CACHE = ROOT / "scripts/.cache/jastrow-bulk"
toc_file = CACHE / "sefaria-toc.json"
if not toc_file.exists():
    with urllib.request.urlopen("https://www.sefaria.org/api/index", timeout=60) as response:
        toc_file.write_bytes(response.read())
titles = {}


def read_toc(nodes):
    for node in nodes:
        if "title" in node:
            titles[node["title"]] = node.get("categories", [])
        read_toc(node.get("contents", []))


read_toc(json.loads(toc_file.read_text()))
links = collections.Counter()
entry_sets = collections.defaultdict(set)
passage_sets = collections.defaultdict(set)
excluded = collections.Counter()
unclassified = collections.Counter()
examples = collections.defaultdict(list)
seen = set()
entry_count = 0
entries_with_links = set()


class Citations(html.parser.HTMLParser):
    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        attributes = dict(attrs)
        ref = attributes.get("data-ref", "")
        if not ref:
            excluded["Links without data-ref"] += 1
            return
        if ref.startswith("Jastrow,"):
            excluded["Internal Jastrow cross-references"] += 1
            return
        work = re.split(r"[.\s]+\d", ref, maxsplit=1)[0].strip()
        cats = titles.get(work)
        # Tanakh also contains translations: exclude only biblical books,
        # not Targumim, which are independent cited works for this analysis.
        if cats and cats[0] == "Tanakh" and len(cats) == 2 and cats[1] in ("Torah", "Prophets", "Writings"):
            excluded["Bible"] += 1
            return
        if work.startswith("Mishnah ") or work == "Pirkei Avot" or (cats and cats[0] == "Mishnah"):
            excluded["Mishnah"] += 1
            return
        if cats and cats[:2] == ["Talmud", "Bavli"]:
            excluded["Bavli"] += 1
            return
        if work.startswith("Jerusalem Talmud "):
            excluded["Yerushalmi"] += 1
            return
        if cats is None:
            unclassified[work] += 1
        links[work] += 1
        entry_sets[work].add(self.entry_id)
        passage_sets[work].add(ref)
        entries_with_links.add(self.entry_id)
        if len(examples[work]) < 3 and ref not in examples[work]:
            examples[work].append(ref)


def parse_senses(senses, parser):
    for sense in senses:
        parser.feed(sense.get("definition", ""))
        parse_senses(sense.get("senses", []), parser)


for part in (1, 2):
    for line in (CACHE / f"{REVISION}-part{part}.jsonl").read_text().splitlines():
        entry = json.loads(line)
        if entry.get("parent_lexicon") != "Jastrow Dictionary":
            continue
        identity = entry.get("rid") or entry["_id"]["$oid"]
        if identity in seen:
            raise ValueError(f"Duplicate entry ID: {identity}")
        seen.add(identity)
        entry_count += 1
        parser = Citations()
        parser.entry_id = identity
        parse_senses(entry.get("content", {}).get("senses", []), parser)
        parser.close()

rows = [
    {"work": work, "links": count, "entries": len(entry_sets[work]),
     "distinct_link_targets": len(passage_sets[work]),
     "categories": titles.get(work), "examples": examples[work]}
    for work, count in links.most_common()
]
def group_work(work):
    if work.startswith("Tosefta "):
        return "Tosefta (all tractates)"
    if work.startswith("Onkelos "):
        return "Targum Onkelos (Pentateuch)"
    if work.startswith("Yalkut Shimoni on "):
        return "Yalkut Shimoni (Torah and Nach)"
    if work.startswith("Targum Jerusalem, "):
        return "Jerusalem Targum (Pentateuch)"
    if work.startswith("Targum Jonathan on "):
        book = work.removeprefix("Targum Jonathan on ")
        if book in ("Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"):
            return "Targum Pseudo-Jonathan (Pentateuch)"
        return "Targum Jonathan (Prophets)"
    if work.startswith("Targum of ") and work.endswith("Chronicles"):
        return "Targum to Chronicles (I and II)"
    return work.removesuffix(", Petichta")


group_counts = collections.Counter()
group_entries = collections.defaultdict(set)
for work, count in links.items():
    group = group_work(work)
    group_counts[group] += count
    group_entries[group].update(entry_sets[work])
groups = [
    {"work": work, "links": count, "entries": len(group_entries[work])}
    for work, count in group_counts.most_common()
]
out = ROOT / "docs/jastrow-citation-analysis"
out.mkdir(parents=True, exist_ok=True)
result = {
    "source_revision": REVISION,
    "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "entries": entry_count, "qualifying_links": sum(links.values()),
    "entries_with_qualifying_links": len(entries_with_links),
    "excluded": dict(excluded), "unclassified": dict(unclassified),
    "works": rows, "grouped_works": groups,
}
(out / "counts.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
with (out / "counts.csv").open("w") as f:
    writer = csv.writer(f)
    writer.writerow(["Work", "Hyperlinks", "Distinct Jastrow entries", "Distinct linked references"])
    writer.writerows((r["work"], r["links"], r["entries"], r["distinct_link_targets"]) for r in rows)
assert sum(links.values()) + sum(excluded.values()) == 164807, "Unexpected corpus link total"
assert not any(r["work"].startswith(("Mishnah ", "Jerusalem Talmud ")) for r in rows)
assert not any(r["work"] in ("Genesis", "Shabbat", "Pirkei Avot") for r in rows)
def table(items):
    text = "| Work | Hyperlinks | Distinct Jastrow entries |\n|---|---:|---:|\n"
    return text + "".join(f'| {r["work"]} | {r["links"]:,} | {r["entries"]:,} |\n' for r in items)


report = f"""# Jastrow: most-linked sources beyond Bible, Bavli, Yerushalmi, and Mishnah

Analysis date: {result["generated_at"][:10]}.

## Findings

At the individual linked-title level, **Bereishit Rabbah (Genesis Rabbah)** ranks
first: **{links["Bereishit Rabbah"]:,} hyperlinks across {len(entry_sets["Bereishit Rabbah"]):,} dictionary entries**.
When book/tractate divisions of a work are combined, the ranking changes:
Targum Jonathan to the Prophets and the Tosefta exceed Genesis Rabbah.
These are different units of comparison, not contradictory results.

## Grouped works

{table(groups)}

Grouping combines Tosefta tractates, the five books of Onkelos, the Torah/Nach
divisions of Yalkut Shimoni, Chronicles I/II, and introductory Petichta sections
with their parent midrash. Distinct-entry counts are set unions, not sums.
Midrash Rabbah's different works remain separate. Targum Jonathan to the Prophets
is kept separate from the Pentateuchal Targum Pseudo-Jonathan, although both use
the label “Targum Jonathan” in source links.

## Individual linked titles: top 25

{table(rows[:25])}

## Corpus and counting method

- Source: [UniquePixels/jastrow raw data](https://github.com/UniquePixels/jastrow/tree/{REVISION}/data/raw),
  attributed by that repository to Sefaria under CC-BY-NC.
- {entry_count:,} unique Jastrow entry IDs across both raw JSONL files. The full
  corpus is counted, not just headwords currently represented in Bekiut's browse index.
- Recursive traversal of all definitions and nested senses; parse actual HTML
  anchors and use their `data-ref` destinations rather than visible labels.
- {sum(links.values()) + sum(excluded.values()):,} hyperlinks in total.
- {sum(links.values()):,} qualifying links across {len(entries_with_links):,} entries.
- Each anchor occurrence counts once. Repeated references within an entry count
  multiple times in the hyperlink column but once in the distinct-entry column.
- Bible means the biblical text itself; **Targumim are retained** as separate works.
- Sefaria's table of contents identifies core corpus categories. Explicit Mishnah
  and Jerusalem Talmud prefixes handle older title spellings as well.
- Titles absent from the current TOC remain as source labels in the exported
  JSON's `unclassified` field. They are not silently discarded.

### Excluded links

""" + "\n".join(f"- {name}: {count:,}" for name, count in excluded.items()) + """

## Interpretation and limitations

This measures the linked citations in a digital edition, **not every citation in
the printed dictionary**. The linking process is uneven. References without
hyperlinks, abbreviated repeats such as “ib.”, and sources not recognized by the
digitization are absent from these totals. Low counts do not establish that
Jastrow seldom consulted a source.

For example, Sifra appears in the raw definitions but has no recognized Sifra
link destinations in this export. Mekhilta has only one recognized linked
occurrence. This is a concrete warning against interpreting the hyperlink
ranking as a complete bibliography or a measure of all sources used.

The high rankings of Targumim and midrashim show their substantial presence in
the linked lexical evidence. These are raw totals, not counts normalized by work
length or proof that any work is disproportionately cited.

Full individual-title rankings are in `counts.csv`; `counts.json` also contains
grouped results, exact linked-reference counts, categories, and sample references.
Regenerate with `python3 scripts/analyze-jastrow-citations.py`.
"""
(out / "report.md").write_text(report)
print(json.dumps({k: v for k, v in result.items() if k not in ("works", "grouped_works")}, ensure_ascii=False, indent=2))
print(table(groups[:15]))
