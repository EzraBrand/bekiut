# Jastrow mapping consistency and Sefaria title review

Reviewed 2026-11-03. Review only: no mapping changes applied.

## Scope and method

Reviewed all 1,040 functional mappings in `artifacts/chavrutai/src/shared/data/lexicon-mappings/jastrow.json` (excluding three comment-marker entries). Automated checks covered whitespace, trailing colons, case-insensitive no-ops, and groups of keys equivalent after NFC normalization, apostrophe normalization, case folding, and removal of spaces. These groups are review candidates, not instructions to merge keys.

Compared citation and parsha expansions manually against live Sefaria metadata:

- [Library index](https://www.sefaria.org/api/index): canonical work titles and categories.
- Torah index APIs: [Genesis](https://www.sefaria.org/api/index/Genesis), [Exodus](https://www.sefaria.org/api/index/Exodus), [Leviticus](https://www.sefaria.org/api/index/Leviticus), [Numbers](https://www.sefaria.org/api/index/Numbers), [Deuteronomy](https://www.sefaria.org/api/index/Deuteronomy). Parsha primary English titles are in `alts.Parasha.nodes[].titles`; aliases are also present.
- [Jastrow's original abbreviation list](https://www.sefaria.org/api/v3/texts/Jastrow,_List_of_Abbreviations).
- Existing local tractate names in `lib/shared-data/src/tractates.ts`.

This was a dictionary-wide consistency review, not a new occurrence-by-occurrence corpus audit. Semantic concerns below require source-context review before replacement.

## 1. Recommended cleanup

| Keys | Current targets | Recommendation |
|---|---|---|
| `M'bo` / `M’bo` / `Fr. M’bo` | `Frankel, 'Introductiom to Talmud Yerushalmi'` versus `Frankel, Introduction to the Jerusalem Talmud` | Fix the typo and use the latter existing target for all three. |
| `q.v.` / `q. v.` | `see there` / `which see` | Use `which see`, matching the user's previous requested wording. |
| `Var. Lect.` / `Var. lect.` / `var. lect.` / `Variant Lect.` | `variant reading` / `variant reading(s)` | Choose one target consistently; `variant reading(s)` preserves the existing inclusive form. |
| `S'liḥ.` / `S’liḥ.` | `Seliḥot` / `Selichot` | Choose one spelling for both apostrophe variants. |
| `Bresh.` / `B'resh.` / `B’resh.` | `Bereshit` / `Bereishit` | Use Sefaria's primary parsha title `Bereshit`. |
| `Bech.` / `Bekh.` | `Bechorot` / `Bekhorot` | Use `Bekhorot`, already used by Sefaria and the local readers. |
| `Arakḥ.` / `Arakh.` | `Arakḥin` / `Arakhin` | Use `Arakhin`. |
| `Ḥull.` / `Ḥull.` | `Ḥullin` / `Hullin` | Use `Chullin` if aligning with Sefaria/local reader names. Preserve both source keys: one uses a combining dot and one a precomposed letter. |
| `Mikv.` / `Mikh.` | `Mikvaoth` / `Mikvaot` | Use `Mikvaot`. |
| `Tosaf.` / `Tossaf.` | `Tosafoth` / `Tossafot` | Use `Tosafot`, matching Sefaria's commentary titles. Do not merge with `Tosef.` → `Tosefta`. |
| `B’ha‘ăl.` versus `B’haăl.` / `Behaʿăl.` / `B'haal.` | `Beha'alotcha` versus `Behaalotecha` | Use `Beha'alotcha`, Sefaria's primary parsha title. |
| `Metsor.` / `M’tsorʿa` | `Metsora` / `Metzora` | Use `Metzora`. |
| `Rab. D. S.` / `Rabb. in D. S.` / `Rabb. D. S.` / `Rabb. D. S` / `Rabb. R. S.` | `Rabbinovicz` versus `Rabbinowicz`; `Dikdukei Soferim` versus `Dikdukei Sofrim` | Standardize author and title spellings after choosing a house style; do not treat the different prepositions as interchangeable. |
| `Rap.` / `Rapap. Er. Mill.` | `Rapaport` / `Rapoport`, same `Erekh Millin` title | Standardize the author's spelling. |
| `Ithp.` / `Ithpe.` | `Ithpe'el` / `Itpe'el` | Harmonize transliteration after confirming these source forms denote the same stem. |
| `Shaf.` / `Shaph.` | `Shaf'el` / `Shaph'el` | Same transliteration-policy issue. |

## 2. Further tractate alignment

These are spelling discrepancies, not evidence of incorrect identification.

| Key | Current | Sefaria/local reader style |
|---|---|---|
| `Ḥag.`, `Ḥăgigah` | Hagigah | Chagigah |
| `Ḥall.` | Hallah | Challah |
| `Men.` | Menahot | Menachot |
| `Pes.` | Pesahim | Pesachim |
| `Zeb.` | Zevahim | Zevachim |
| `Toh.` | Toharot | Tahorot |
| `Ukts.` | Uktzin | Sefaria: Mishnah Oktzin; local reader: Uktzin |
| `Ab.` | Avot (Mishnah) | Sefaria work title: Pirkei Avot; local short name: Avot |
| `Taan.` | Taanit | Already matches Bavli; Sefaria's Mishnah title is Mishnah Ta'anit |

Do not mechanically import the full `Mishnah` prefix into corpus-neutral abbreviations. Jastrow's original list explicitly uses some tractate abbreviations across Mishnah, Tosefta, and Talmud.

## 3. Further parsha alignment

| Keys | Current | Sefaria primary title |
|---|---|---|
| `Lekh.` | Lekh Lekha | Lech Lecha |
| `Tol’d.` | Toledot | Toldot |
| `Vaëra` | Va'era | Vaera |
| `Sh’mini`, `Sh'mini` | Shemini | Shmini |
| `Aḥăre`, `Aḥaré`, `Aḥăré` | Acharei Mot | Achrei Mot |
| `Sh'laḥ` | Shelach | Sh'lach |
| `Haăz.` | Ha'azinu | Ha'Azinu |

These are optional house-style changes. Most current forms are recognizable and not factual errors.

`Hashsh'mini` → `Ha-shemini` and `V’zoth` → `Ve-zot` are partial/literal expressions, not necessarily complete parsha titles. Do not automatically change them to `Shmini` or `V'Zot HaBerachah`.

**Priority contextual check:** `Tetsav` currently expands to `Tzav`, while Sefaria has distinct portions `Tzav` and `Tetzaveh`. The spelling warrants checking actual occurrences for a possible wrong-parsha expansion. It was not found in the retrieved original abbreviation list, so this review does not claim a confirmed correction.

## 4. Midrash and other work names

| Key(s) | Current | Sefaria canonical title / recommendation |
|---|---|---|
| `Gen. R.` | Genesis Rabbah | Bereshit Rabbah |
| `Ex. R.` | Exodus Rabbah | Shemot Rabbah |
| `Lev. R.` | Leviticus Rabbah | Vayikra Rabbah |
| `Num. R.` | Numbers Rabbah | Bamidbar Rabbah |
| `Deut. R.` | Deuteronomy Rabbah | Devarim Rabbah |
| `Lam. R.` | Lamentations Rabbah | Eikhah Rabbah |
| `Tanḥ.` | Tanhuma | Midrash Tanchuma |
| `Tanḥ. ed. Bub.` | Tanhuma ed. Buber | Midrash Tanchuma Buber |
| `Pirkê d'R. El.`, `Pirké́ d’R. El.` | Pirkei d'Rabbi Eliezer | Pirkei DeRabbi Eliezer |
| `Ab. d'R. N.`, `Ab. d’R. N.`, `Ab. d’R. Nath.` | Avot d'Rabbi Natan / Avot d’Rabbi Natan | Avot DeRabbi Natan |
| `S'maḥ.`, `S’maḥ.` | Semahot | Tractate Semachot |
| `Hal. Gedol.` | Halachot Gedolot | Halakhot Gedolot |
| `Sef. Yets` | Sefer Y'tsirah | Sefer Yetzirah |
| `Sheilt. d’R. Aḥai` | Sheiltot d’Rabbi Aḥai | Sheiltot d'Rav Achai Gaon |
| `Tos’f. Y. Tob` | Tosefot Yom Tov | Sefaria commentary title family: Tosafot Yom Tov on Mishnah … |

For the Rabbah titles, the existing English biblical-book names are valid naming choices; changing to Sefaria's Hebrew-derived titles is consistency work, not correction of the referenced work. `Cant. R.`, `Koh. R.`, and `Ruth R.` already use Sefaria-style names.

### Do not assign an exact work blindly

- `Mekh.` → `Mekhilta`: Sefaria distinguishes Mekhilta DeRabbi Yishmael and Mekhilta DeRabbi Shimon Ben Yochai. Determine the cited work before assigning a specific identifier.
- `Sifré` → `Sifre`: Sefaria has Sifrei Bamidbar and Sifrei Devarim. A spelling change to `Sifrei` is separable from resolving the book.
- `Pesik.` → `Pesikta`: original Jastrow abbreviation list identifies this as the Buber edition. Candidate identification is Pesikta DeRav Kahana, but verify citations before assigning globally.
- `Pesik. Zutr.` → `Pesikta Zutrathi, ed. Buber`: candidate canonical work is Midrash Lekach Tov; retain the historic title/edition information rather than silently discarding it.
- `Yalk.` → `Yalkut`: Sefaria separates Yalkut Shimoni on Torah and on Nach; the abbreviation alone does not supply the division.
- `Tanna d'Bei El.`, `Tan. d’be El.`, `Tana d’be El.` → `Tanna Devei Eliyahu`: Sefaria separates Tanna DeBei Eliyahu Rabbah and Zuta.
- `Y'lamd.`, `Y’lamd.` → `Yelamdenu`: Sefaria's “Midrash Yelamdenu, Selections from Yalkut Talmud Torah” is a specific collection, not automatically every historical Yelamdenu citation.
- `Targ. Y.` and `Targ. J.` need their existing historical/contextual distinctions preserved.
- Biblical `Cant.` → Shir HaShirim and `Koh.` → Kohelet differ from Sefaria's Song of Songs and Ecclesiastes. These are valid alternative display names; Samuel/Chronicles need volume context for exact resolution.

## 5. Structural and semantic issues

### Mechanical checks

- No functional target currently ends in a colon.
- No case-insensitive exact no-op mappings were found.
- No leading-space functional keys were found.
- `a. part. ` retains a trailing-space requirement; review whether it should work before punctuation or at an HTML boundary.
- `a. e.` and `a. e.—` targets end with a space (`and elsewhere. `); check layout/punctuation before trimming.
- `, ch. ` is intentionally contextual, with spaces on both sides of the output; it is not an ordinary whitespace-cleanup candidate.
- Three pseudo-comment keys remain inside the mappings object. Move to metadata in a future cleanup if desired, rather than presenting them as dictionary content.
- `b.  h.` / `b. h.` vary in spacing and capitalization of their targets. Preserve source matching variants, but choose target casing intentionally.

### Preserve meaningful case distinctions

Do not lowercase every key to consolidate it. Examples:

- `Fr.` → Frankel; `fr.` → from.
- `Ed.` → Eduyot; `ed.` → edition(s).
- `Ab.` → Avot (Mishnah); `ab.` → above.
- `Prov.` → Proverbs; `prov.` → proverb.
- `Const.` → Constantinople; `const.` → Construct form.
- `Dict.` → Dictionary; `dict.` → diction.

Other case pairs deserve editorial review: `Apocop.`/`apocop.` (Apocopated/apocopation), `Metaph.`/`metaph.` (Metaphorical/metaphorically), `Denom.`/`denom.` (Denominative verb/denominative), `Differ.`/`differ.` (Different/different (interpretation)). Different grammatical forms are not necessarily errors.

### Preserve distinct people and publications

The original list explicitly distinguishes `Zuck.` (Zuckermandel) from `Zuckerm.` (Zuckermann, *Talmudische Münzen und Gewichte*). Similar spellings do not justify merging them.

Bibliographic targets mix shortened titles, full titles, years, author punctuation and quotation styles. For example, the Berliner geography mappings and Zuckermann coin-book mappings vary in how much title is supplied. A consistent citation display template would help, but title shortening is not necessarily incorrect.

### Potential meaning changes, not simple spelling

Consider occurrence-level review of general-word conversions such as `hereafter` → afterlife, `genius` → deity, `therewith` → with them, and `act. verb` → action verb. These can be correct in some contexts and misleading in others. Many were explicitly requested: retain until reviewed and approved.

`Bact.` → Bactrian (Avestan) also deserves historical-terminology review: older “Bactrian” usage should not be mistaken for an assertion that the modern linguistic categories are identical.

## Recommended implementation sequence

1. Fix clear typos and inconsistent outputs for equivalent source variants.
2. Align tractate spellings with the existing reader names; explicitly decide the Uktzin/Oktzin exception.
3. Adopt a chosen parsha naming policy, using Sefaria primary English titles where desired.
4. Keep display labels separate from canonical work identifiers. Use verified aliases for exact citation resolution, not fuzzy matching.
5. Review ambiguous work names and semantic conversions against real corpus examples before changing them.

Do not rewrite user-approved modernizations merely because they differ from Sefaria, and do not force chapter/subsection names such as Shirata, Vayassa, Baḥodesh, or Va-tomer into a parsha-name catalog.
