# Dictionary usability update

User-approved scope:
- BDB entry-first navigation, collapsed browse grid, accessible search/browse.
- Safe normalization before empty results, distinguish temporary service failures.
- Recovery links to the other dictionary, retained suggestions, linked-entry messages.
- Shared Dictionaries navigation with Jastrow and BDB.
- Homepage Search texts / Look up a word, with explicit dictionary choices.
- Compact Display options preserving reader preferences.

## Completed

All items above are implemented. The Talmud reader's separate drawer also includes
both dictionaries. BDB has a Search / browse shortcut beside its entry heading.
Existing hashes take precedence over scrolling to the first entry.

Lookup normalization removes leading editorial stars/daggers and retries unpointed
Hebrew after genuine empty results. It preserves source headwords and homograph
suffixes. HTTP failures, malformed completion responses, and network errors now
propagate as a retryable 503 rather than an empty array.

Stable-ID links that cannot be resolved have specific recovery messaging; this
update does not introduce an independent stable-ID retrieval service.

## Verification

- Workspace typecheck passed.
- 29 focused backend tests passed (recovery, homographs, citation fidelity,
  cache behavior, and both dictionary routes' 503 contract).
- 12 focused frontend tests passed (response classification, cross-dictionary
  URL encoding, BDB preparation, and dictionary HTML safety).
- Live API checks: `*גִּישׁ` and `פּוּךְ` both return their correct entries;
  a nonsense query returns a genuine empty array.
- Mobile screenshots confirm BDB starts at its entries and the homepage exposes
  both search modes.
- Automated interactive browser testing was unavailable because the testing
  service reported another active tester. No end-to-end click-test pass is claimed.
