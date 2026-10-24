# Jastrow index entry details

Available on all 22 Jastrow letter indexes, off by default. Not applied to BDB.
Each letter loads a separate compact metadata file, never one request per entry.

## Regeneration and provenance

Run `pnpm --filter @workspace/scripts exec tsx src/generate-jastrow-index-details.ts`.
The generator uses pinned raw JSONL from
https://github.com/UniquePixels/jastrow/tree/05c8a79bbf2408f3909151d08d71a6f3e33e9ead/data/raw,
a Sefaria-derived dataset attributed as CC-BY-NC by that repository.
Raw downloads are cached in ignored scripts/.cache/jastrow-bulk, not shipped.
Only counts, stable IDs, and cross-reference headwords are retained in the
published shards. This source is not covered by Bekiut's code license.

Counts are approximate Unicode word counts of original definitions, nested
senses, quotations and citations. They exclude HTML and headwords and remain
independent of inline abbreviation display settings.

Exact pointed headwords (Unicode normalized) select a unique stable ID.
Unmatched or ambiguous entries are marked unavailable, not assigned another
homograph's count. Pointer classification requires one explicit Jastrow link
introduced by see/v./vide with no other prose; uncertain cases retain counts.
Target links retain the referenced headword, not an inferred target ID.

## Coverage

October 24, 2026: 30,744 resolved headwords, 7,311 clear pointer records,
3 unresolved headwords across 22 letters. Nine source-index records begin with
non-letter characters and were already outside the letter browse lists.
The headword index itself is unchanged.

Tests cover counts, conservative classification, exact homograph identities,
all-letter coverage, the default-off state, toggle behavior, and BDB exclusion.
