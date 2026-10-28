# TODO: Context-aware Jastrow abbreviation expansion

Deferred for later; no reader changes authorized by this note.

- [ ] Pilot ambiguous forms `acc.`, `sec.`, and `Fr.`.
- [ ] Keep the existing mapping dictionary for unambiguous forms; add a separate registry for ambiguous forms.
- [ ] Prefer longest phrase matches, then clear grammatical/citation context, then reviewed entry-specific overrides.
- [ ] Key overrides by stable entry ID and matching source phrase, not an entire entry.
- [ ] Preserve headword shorthand rather than treating it as a grammatical abbreviation.
- [ ] Leave unresolved abbreviations visible, including in inline-expansion mode, with a popover listing possible meanings.
- [ ] Retain slash expansions only for closely related meanings or grammatical variants.
- [ ] Test both meanings, ambiguous contexts, and cases that must remain unchanged in inline and tooltip modes.
- [ ] Optionally use AI for offline corpus review; do not introduce model calls during reader rendering.

Audit script: `scripts/audit-jastrow-missing-mappings.py`.
Manual review annotations: `scripts/jastrow-audit-review.json`.
Generated CSV: `generated-artifacts/jastrow-missing-mappings-audit.csv`.
