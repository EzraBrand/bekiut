# Jastrow ל entry details

Limited experiment on `/jastrow/headwords/ל`. No other letter or dictionary
displays details. The toggle initially shows them and can hide them without
changing the headword links.

## Data

Run `pnpm --filter @workspace/scripts exec tsx src/generate-jastrow-lamed-details.ts`
to regenerate metadata from locally cached Sefaria responses. Remove the desired
files under `scripts/.cache/jastrow-lamed/` first to refresh their upstream data.
The cache is ignored by Git; the compact metadata JSON is tracked and lazily
loaded only on the experiment page.

- Original definition text, including nested senses, quotations and citations,
  is counted with Unicode word segmentation.
- HTML and headwords are excluded. Abbreviation display settings do not affect
  counts.
- Exact pointed headwords (with Unicode normalization) and unique stable IDs
  select source entries. Ambiguous/unavailable matches get no count.
- Pointer classification requires one explicit Jastrow link, introduced only by
  “see”, “v.” or “vide”, allowing initial punctuation. Additional prose means
  the entry retains a word count. This intentionally misses ambiguous pointers.
- “See” links use the source’s referenced headword; their destination can
  return multiple results. They do not claim a verified target stable ID.
- Original headword links carry the exact matched entry ID.

## Snapshot

October 24, 2026: 682 headwords, 681 resolved entry records, 198 clear pointer
entries. The unresolved `לַגְלֵג I` lookup returns only `לַגְלֵג II` in the
upstream response; the UI therefore shows “Details unavailable”.

Tests cover the classifier, identity isolation, snapshot coverage, toggling,
headword and target links, and scope restriction. Browser screenshots cover
desktop and phone layouts. This is not a full-corpus completeness audit.
