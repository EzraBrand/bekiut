# Jastrow abbreviation review — October 10, 2026

## Sample and method

Reviewed 191 distinct Jastrow entries returned by 132 Sefaria `/api/words`
queries. The sample uses every 257th headword starting at index 53 in the
local 30,756-headword index, plus אב, שלום, שבת, עין, הלך, אמר, בית, ראש,
יד, מים, נפש, רוח. This is a sample, not a full-corpus audit.

Compared raw definitions and grammatical/origin metadata with the existing
Jastrow mappings and BDB keys. Checked surrounding text and existing longer
keys before accepting candidates. Existing expansions are not overwritten.

## Added mappings (18)

| Forms | Meaning | Source examples |
|---|---|---|
| constr. | construct form | רְטַן; בַּיִת |
| sing. | singular | אָב II; רֹאשׁ (also works without the old key's leading space) |
| inf.; Inf. | infinitive | בִּית; אָמַר I; אֲמַר |
| transpos. | transposition | אַכְסָן |
| etymol. | etymology | אֲמַר |
| contemp. | contemporary | אַבָּהוּ |
| geogr.; Geogr. | geographical | בַּיִת; חוּט III |
| Hithpol. | Hithpolel | חוּט I |
| Dict.; H. Dict. | Dictionary; Hebrew Dictionary | אֲשַׁד; בַּיִת |
| Meïl. | Meilah | גְּלוֹסְקְמָא |
| Esp. | especially | נוּם |
| wds. | words | וְעָדָה |
| quot. | quoted | חֲבוֹלָה |
| Lag. | Lagarde | זוּף II (outside the already mapped “ed. Lag.”) |
| transl. | translation | בִּית: “Chald. transl. of” |

## Do not import these BDB mappings blindly

- `acc.`: all 22 sample occurrences belong to the already mapped `corr. acc.`
  (“correct accordingly”), not “accusative.”
- `Rabb.`: covered by `Rabb. D. S.` (Rabbinowicz), not “Rabbinic.”
- `Sm. Ant.`: Smith's dictionary of antiquities, not Smend or Josephus.
- `Kam.`: occurs inside Bava Kamma citations, not al-Qāmūs.
- `Matt`: the sample has `Matt. K.`, not Matthew.
- `sub`: `sub.` has its own Jastrow meaning and must not inherit BDB's
  “under (the entry).”
- `s. lit.`: the Liddell–Scott reference concerns a letter (Δ), not “literally.”
- `Oxf.`: the sample uses `Ms. Oxf.`, which already explains Oxford manuscripts.
- `defect.`: the sample occurrence is the ordinary English noun at a sentence
  ending, not an abbreviation for “defective.”
- Archaic-English modernization was not included in this abbreviation batch.

Longer mappings such as `Ges. H. Dict.`, `ed. Lag.`, and `Part. pass.`
continue to win over component abbreviations.
