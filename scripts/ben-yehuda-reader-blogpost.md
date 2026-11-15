# Reading Ben-Yehuda’s Hebrew Dictionary on Bekiut

*Draft for Talmud & Tech. The feature is implemented in an isolated preview; publication of this post should follow the app’s release.*

I added a reader for Eliezer Ben-Yehuda’s dictionary to Bekiut, alongside the existing BDB and Jastrow readers. It supports Hebrew search with or without vowel points, alphabetical browsing, and links between entries. The definitions remain in Hebrew. I have kept the dictionary’s wording, source references, and notes, while changing how the text is presented on the screen.

Ben-Yehuda’s dictionary covers Hebrew across biblical, rabbinic, medieval, and modern usage. Its entries often combine definitions with quotations, grammatical discussion, comparisons with other languages, and references to earlier scholarship. That makes it a useful complement to BDB, which focuses on biblical Hebrew, and Jastrow, which covers rabbinic Hebrew and Aramaic. The three dictionaries serve overlapping purposes, but they give readers different kinds of information about a word.

The digital text comes from Sefaria, which credits Project Ben-Yehuda’s volunteer digitization. I fetch entries as readers request them rather than maintaining a separate copy of the full dictionary. Project Ben-Yehuda’s [English overview](https://benyehuda.org/page/english) explicitly describes the dictionary as public domain. I checked that statement separately because Sefaria’s license field was blank, and its version note referred specifically to the dictionary’s Prolegomena. The reader retains the source attribution.

## Finding a word

The reader accepts both pointed and unpointed Hebrew. Typing שלום offers suggestions from the headword index. A search can return several distinct forms: in the sample I checked, שלום returned שָׁלוֹם, שִׁלּוּם, and שָׁלוּם. Readers can therefore begin with the consonants they know and use the displayed vocalization to distinguish the results.

Some entries also have Roman numerals attached to their headwords. These distinguish separate entries and must survive searching, browsing, and linking. אָב I and אָב II are separate destinations. A link to one should open that entry rather than silently substituting the other. When Sefaria supplies a stable entry identifier, the reader preserves it in the URL.

For browsing, I retrieved a snapshot containing 21,999 unique headwords across the 22 Hebrew letters. The snapshot comes from Sefaria’s dictionary-specific autocomplete service. That is an important qualification: the count describes the headwords retrieved through this service, and does not establish that every entry in the underlying dictionary is represented. The browsing page identifies the list as a snapshot.

The order of the list also needed attention. Sorting pointed Hebrew as raw computer text can put vowel marks ahead of the next consonant. That can place an aleph-gimel word before an aleph-bet word. I now sort by unpointed spelling, retaining the original pointed form as a tie-breaker. This changes the ordering without merging distinct vocalizations or deleting homographs.

## Reading a long definition

The letter ה provides a useful test of the reader. Sefaria returns it as an entry with 23 source paragraphs, including an embedded image, notes, and internal dictionary links. I preserve the whole paragraph array. The small numeric suffix in a source link is not a reason to show only one paragraph of the entry.

Long definitions can still be difficult to read when a source paragraph contains several successive discussions. I added a display option that starts a new paragraph at an em dash. It is enabled by default, and can be switched off to return to the source paragraph divisions. The dash itself remains visible. This is a presentation rule, so it should not be read as an editorial claim that every dash introduces a new sense.

The splitting happens within the displayed definition without discarding bold text, links, or notes. Footnote bodies are excluded from this extra splitting. Copying selected text preserves paragraph breaks, including the additional breaks when the option is enabled.

Notes can be opened individually or displayed inline through a separate setting. There is also an option for larger Hebrew text. These choices are saved for this dictionary independently of BDB and Jastrow. The settings panel starts open for new users so that the available choices are visible.

I have kept the reader within Bekiut’s existing layout and Hebrew typography. On a desktop, the entry area has a fixed maximum width, following the Talmud reader’s width limit, rather than allowing lines to stretch across a wide screen. On a phone, it contracts to the available space. The Hebrew letter grids run from right to left. Previous-entry navigation appears on the right and next-entry navigation on the left, with Hebrew labels.

## Links and limits

Links to other Ben-Yehuda entries open within the reader. Other source links remain directed to Sefaria where appropriate. Many references in the dictionary are only printed citation labels, however. I preserve those labels without inventing destinations for them. The separate Prolegomena remain available through a link to Sefaria.

The reader also distinguishes a missing entry from a temporary failure to retrieve one. An unavailable source should produce a retry message rather than the misleading statement that the dictionary contains no match. Entries are still dependent on the upstream service, and the headword snapshot will need deliberate updates as that source changes.

This addition extends the same reading environment already used for BDB and Jastrow to a Hebrew-language historical dictionary. Its scope is intentionally limited: searchable headwords, readable definitions, preserved notes, and reliable navigation. It does not translate the definitions, apply English abbreviation replacements to them, or search the full text of the dictionary.

## Technical appendix

### Sources and index reproduction

The index-building script is `scripts/snapshot-ben-yehuda.py`, written in Python using the standard library. It requests each Hebrew letter through Sefaria’s scoped completion endpoint with an explicit positive limit of 100,000:

```text
/api/words/completion/<letter>/Ben%20Yehuda%20Dictionary?limit=100000
```

The script validates the response shape, deduplicates exact headword strings, and checks the expected total of 21,999. It records per-letter counts, source URLs, retrieval time, and a content hash. When an index already exists, additions or removals cause the script to stop for investigation instead of silently replacing it.

The sort key removes Hebrew pointing and folds final-letter forms to their ordinary counterparts. The untouched source spelling supplies a deterministic secondary key. Both the browser and crawler listings preserve this committed order.

### Entry retrieval and rendering

Entries come from `/api/words/<headword>`, filtered to records whose parent lexicon is `Ben Yehuda Dictionary`. Their definitions are arrays of paragraphs rather than Jastrow-style senses. The adapter retains actual identifiers and neighboring headwords. Requests have deadlines, and a bounded in-memory cache avoids repeatedly retrieving successful results.

The frontend uses a dedicated HTML allowlist. It retains the supported paragraph structures, directional spans, superscripts, and embedded PNG images, while removing executable markup and unsafe URLs. Source footnotes become native disclosures with focusable summaries. Internal dictionary references lose only their terminal numeric text address; Roman-numeral homographs remain intact.

Optional em-dash splitting operates on text nodes in sanitized content. Ancestor formatting is cloned across each split, and footnote disclosures are kept whole. Turning the option off rebuilds the display from the original source paragraphs.

### Challenges and checks

1. **Autocomplete limits:** Default responses contain only a few suggestions. An explicit large positive limit was necessary for the browsing snapshot.
2. **Exact identity:** Pointed forms and Roman numerals must remain distinct. Tests cover exact selection and refusal to substitute an unmatched identifier.
3. **Source structure:** Reusing Jastrow’s HTML policy would remove legitimate Ben-Yehuda structures. A separate policy retains the relevant elements.
4. **Alphabetical order:** Raw Unicode ordering places some vowel marks before consonants. Tests now assert bet-before-gimel ordering within the aleph listing.
5. **Crawler safety:** JSON-LD embedded in HTML must escape script-significant characters. HTTP tests cover script-closing query text in both HTML renderers.
6. **Presentation state:** Reader settings use independent persistent keys. Tests cover default-on splitting, saved choices, RTL navigation, and paragraph-preserving copying.

The initial verification combined targeted tests, representative live requests, production-build checks, and desktop/mobile screenshots. These checks do not establish the completeness or textual accuracy of the entire upstream corpus.

## Data appendix: representative entries checked

| Headword or query | Observed result | What it checks |
|---|---|---|
| ה | BY-03821; 23 paragraphs | Long entry, embedded image, notes |
| אָב I | BY-00007; 10 paragraphs | First homograph |
| אָב II | BY-00009; 1 paragraph | Separate second homograph |
| הֵא I | BY-03823; 1 paragraph | Internal-link destination |
| שלום | Three distinct pointed matches | Unpointed lookup |
| שָׁלוֹם | BY-20255 | Stable identity |
| תַּתְרָן | BY-22247; 1 paragraph | Short cross-reference |

These are observations from checks on November 15, 2026, rather than guarantees about future upstream responses.
