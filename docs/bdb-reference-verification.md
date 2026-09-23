# BDB external-reference verification

`bdb-expanded-terms.ts` is the canonical display-only metadata table, keyed by
exact expanded meaning. Edit categories and reference destinations there.
`bdb-categories.ts` and `bdb-references.ts` are derived compatibility views;
they are not independent data sources. The reader's `bdb.json` remains unchanged.
Exact-expansion coverage is tested, so new mappings need display metadata too.

Every destination was found by web search and then opened with a content fetch
during curation. References are restricted to Wikipedia, Wikidata, and
Wiktionary. The focused test enforces approved URL hosts, exact mapping keys,
vocabulary coverage, and support for alternate verified references in metadata.
The reader-facing table shows only the first preferred reference per row
(Wikipedia before Wikidata), as requested; it never shows duplicate provider links.

| BDB key(s) | Identity and fetched evidence |
| --- | --- |
| `BDB` | Wikipedia identifies Brown–Driver–Briggs as a Biblical Hebrew and Aramaic reference; Wikidata independently identifies the same dictionary (Q2926329). |
| `cstr.` | Wikipedia identifies the construct state as a morphological noun form. |
| `Niph.` | Wikipedia identifies Niphal as a Hebrew verbal stem. |
| `Kt`, `Qr` | “Qere and Ketiv” identifies the written/read Masoretic pair represented by these abbreviations. |
| `hither`, `thither`, `contumely` | Fetched Wiktionary entries provide direct vocabulary references for each exact BDB table term. |
| `BH`, `B.Aram.` | Fetched articles identify Biblical Hebrew and Biblical Aramaic. |
| `Akk.`, `Ugar.`, `Syr.` | Fetched articles identify Akkadian, Ugaritic, and Syriac, useful context for BDB cognate-language labels. |
| `LXX`, `MT`, `Pesh`, `Tg`, `Vulg.` | Fetched articles identify the Septuagint, Masoretic Text, Peshitta, Targum, and Vulgate textual traditions. |
| `MI.` | The fetched Mesha Stele article identifies the Moabite inscription meant by “Mesha Inscription.” |
| `Ges` | The fetched biography identifies Hebrew scholar Wilhelm Gesenius. |
| `We` | Wikipedia and Wikidata (Q76897) independently identify theologian and orientalist Julius Wellhausen. |
| `Dr` | The fetched biography identifies biblical scholar Samuel Rolles Driver. |
| `Lag` | The fetched biography identifies biblical scholar and orientalist Paul de Lagarde. |
| `Dl`, `De` | Both expand to generic “Delitzsch”, which can refer to Friedrich or Franz. The normalized term deliberately has no identity link rather than incorrectly assigning one person to both abbreviations. |
| `Nö` | The fetched biography identifies Semitic scholar Theodor Nöldeke. |
| `EB` | The fetched article identifies *Encyclopaedia Biblica*. |
| `JBL`, `ZAW` | Fetched articles identify the two journals named by the abbreviations. |

No URL was synthesized from an assumed site pattern. Coverage remains moderate:
references are included only where a relevant destination was located and
fetched.