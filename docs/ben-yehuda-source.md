# Ben-Yehuda source and reproduction

Verified 2026-11-15.

- Sefaria index: https://www.sefaria.org/api/v2/raw/index/Ben_Yehuda_Dictionary
- Lexicon: **Ben Yehuda Dictionary**. Author: **Eliezer Ben-Yehuda**.
  Digitization: **Project Ben-Yehuda**; API delivery: **Sefaria**.
- Version title: **Ben Yehuda Dictionary**, Hebrew, source https://www.benyehuda.org/.
- Sefaria's version `license` field is blank. Its version notes explicitly
  concern the *Prolegomena*, and are not evidence for dictionary licensing.
- Dictionary-specific public-domain statement: https://benyehuda.org/page/english
  says “the Ben-Yehuda Dictionary, written by Eliezer Ben-Yehuda himself, and now
  public domain.” This was checked independently of Sefaria's version note.
- Project's reuse policy: https://benyehuda.org/page/about permits all uses,
  including commercial use, of works marked public domain. It distinguishes
  other works published by permission. Do not generalize this finding to those.
- No complete text corpus is bundled. Definitions are fetched on demand with
  a bounded in-memory cache. The compact committed index contains headwords only.

## Reproduction

Run `python scripts/snapshot-ben-yehuda.py` from the repository root. No extra
Python dependencies are required. It fetches all 22 Hebrew letters using
`/api/words/completion/<letter>/Ben%20Yehuda%20Dictionary?limit=100000`.
Use a **positive** limit; zero does not mean unlimited in this endpoint.

The checked snapshot contains **21,999 unique pointed headwords**. Its metadata
records per-letter counts, retrieval time, source URLs, and a content hash.
Roman numerals are part of the headword and are never removed. The script
sorts by unpointed Hebrew spelling with final letters folded, then uses the
original pointed spelling as a deterministic tie-breaker. Browser and crawler
listings both preserve this snapshot order, so niqqud cannot put gimel before bet.
The script
refuses unexpected totals, additions, or removals; investigate changes rather
than silently replacing the snapshot. This is an autocomplete snapshot, not a
verified statement of database completeness.

Stable IDs come only from live word records, never from index positions.
`ה` resolves to `BY-03821`; `שָׁלוֹם` resolves to `BY-20255`. A terminal `.1`
in a source reference addresses text, not a homograph. `אָב I` and `אָב II`
must remain distinct. Word definitions are paragraph arrays, not Jastrow senses.
