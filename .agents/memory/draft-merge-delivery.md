---
name: Draft delivery across task merges
description: Unpublished writing must remain recoverable after an isolated task merges.
---

For writing delivered by an isolated task, ensure the user receives a downloadable asset and a merge-visible copy of the draft, unless they explicitly require it to remain outside Git.

**Why:** A Places blog draft was registered as an asset but excluded from Git. After the task merged, its metadata remained while the local document was absent, and the user could not find the Library item.

**How to apply:** Do not assume an asset metadata record means the local file exists. Verify the delivered path, avoid explicit ignore rules for the sole copy of requested writing, and present the actual document again when the user asks for it.
