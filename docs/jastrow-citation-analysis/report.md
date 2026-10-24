# Jastrow: most-linked sources beyond Bible, Bavli, Yerushalmi, and Mishnah

Analysis date: 2026-10-24.

## Findings

At the individual linked-title level, **Bereishit Rabbah (Genesis Rabbah)** ranks
first: **3,842 hyperlinks across 3,039 dictionary entries**.
When book/tractate divisions of a work are combined, the ranking changes:
Targum Jonathan to the Prophets and the Tosefta exceed Genesis Rabbah.
These are different units of comparison, not contradictory results.

## Grouped works

| Work | Hyperlinks | Distinct Jastrow entries |
|---|---:|---:|
| Targum Jonathan (Prophets) | 4,469 | 2,483 |
| Tosefta (all tractates) | 4,290 | 2,772 |
| Bereishit Rabbah | 3,842 | 3,039 |
| Yalkut Shimoni (Torah and Nach) | 3,690 | 2,886 |
| Targum Onkelos (Pentateuch) | 3,660 | 2,050 |
| Targum Pseudo-Jonathan (Pentateuch) | 3,055 | 2,081 |
| Aramaic Targum to Psalms | 1,916 | 1,336 |
| Vayikra Rabbah | 1,684 | 1,476 |
| Bamidbar Rabbah | 1,348 | 1,136 |
| Aramaic Targum to Proverbs | 1,340 | 935 |
| Aramaic Targum to Job | 1,203 | 953 |
| Shir HaShirim Rabbah | 1,174 | 1,020 |
| Shemot Rabbah | 1,034 | 887 |
| Kohelet Rabbah | 911 | 808 |
| Midrash Tehillim | 880 | 761 |
| Pesikta Rabbati | 809 | 716 |
| Eichah Rabbah | 695 | 652 |
| Jerusalem Targum (Pentateuch) | 616 | 517 |
| Targum to Chronicles (I and II) | 568 | 480 |
| Sifrei Devarim | 402 | 386 |
| Esther Rabbah | 347 | 325 |
| Devarim Rabbah | 288 | 263 |
| Aramaic Targum to Esther | 286 | 255 |
| Aramaic Targum to Ecclesiastes | 248 | 224 |
| Aramaic Targum to Song of Songs | 241 | 217 |
| Aramaic Targum to Lamentations | 222 | 195 |
| Sifrei Bamidbar | 193 | 172 |
| Pirkei DeRabbi Eliezer | 170 | 155 |
| Ruth Rabbah | 159 | 152 |
| Avot D'Rabbi Natan | 122 | 115 |
| Aramaic Targum to Ruth | 95 | 84 |
| Midrash Mishlei | 48 | 44 |
| The Book of Maccabees I | 4 | 4 |
| The Book of Maccabees II | 2 | 2 |
| Mekhilta d'Rabbi Yishmael | 1 | 1 |


Grouping combines Tosefta tractates, the five books of Onkelos, the Torah/Nach
divisions of Yalkut Shimoni, Chronicles I/II, and introductory Petichta sections
with their parent midrash. Distinct-entry counts are set unions, not sums.
Midrash Rabbah's different works remain separate. Targum Jonathan to the Prophets
is kept separate from the Pentateuchal Targum Pseudo-Jonathan, although both use
the label “Targum Jonathan” in source links.

## Individual linked titles: top 25

| Work | Hyperlinks | Distinct Jastrow entries |
|---|---:|---:|
| Bereishit Rabbah | 3,842 | 3,039 |
| Aramaic Targum to Psalms | 1,916 | 1,336 |
| Yalkut Shimoni on Torah | 1,911 | 1,683 |
| Yalkut Shimoni on Nach | 1,779 | 1,563 |
| Vayikra Rabbah | 1,684 | 1,476 |
| Bamidbar Rabbah | 1,348 | 1,136 |
| Aramaic Targum to Proverbs | 1,340 | 935 |
| Onkelos Genesis | 1,256 | 880 |
| Aramaic Targum to Job | 1,203 | 953 |
| Shir HaShirim Rabbah | 1,174 | 1,020 |
| Targum Jonathan on Isaiah | 1,158 | 925 |
| Shemot Rabbah | 1,034 | 887 |
| Kohelet Rabbah | 911 | 808 |
| Onkelos Exodus | 881 | 678 |
| Midrash Tehillim | 880 | 761 |
| Targum Jonathan on Genesis | 856 | 691 |
| Pesikta Rabbati | 809 | 716 |
| Eichah Rabbah | 687 | 644 |
| Targum Jonathan on Deuteronomy | 631 | 549 |
| Tosefta Shabbat | 601 | 305 |
| Targum Jonathan on Exodus | 593 | 496 |
| Onkelos Deuteronomy | 562 | 486 |
| Targum Jonathan on Ezekiel | 550 | 433 |
| Targum Jonathan on Numbers | 537 | 470 |
| Targum Jonathan on Jeremiah | 532 | 444 |


## Corpus and counting method

- Source: [UniquePixels/jastrow raw data](https://github.com/UniquePixels/jastrow/tree/05c8a79bbf2408f3909151d08d71a6f3e33e9ead/data/raw),
  attributed by that repository to Sefaria under CC-BY-NC.
- 32,512 unique Jastrow entry IDs across both raw JSONL files. The full
  corpus is counted, not just headwords currently represented in Bekiut's browse index.
- Recursive traversal of all definitions and nested senses; parse actual HTML
  anchors and use their `data-ref` destinations rather than visible labels.
- 164,807 hyperlinks in total.
- 40,012 qualifying links across 14,953 entries.
- Each anchor occurrence counts once. Repeated references within an entry count
  multiple times in the hyperlink column but once in the distinct-entry column.
- Bible means the biblical text itself; **Targumim are retained** as separate works.
- Sefaria's table of contents identifies core corpus categories. Explicit Mishnah
  and Jerusalem Talmud prefixes handle older title spellings as well.
- Titles absent from the current TOC remain as source labels in the exported
  JSON's `unclassified` field. They are not silently discarded.

### Excluded links

- Internal Jastrow cross-references: 68,095
- Bavli: 33,691
- Bible: 6,688
- Mishnah: 8,642
- Yerushalmi: 7,679

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
