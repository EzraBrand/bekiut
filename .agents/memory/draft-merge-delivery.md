---
name: Draft delivery across task merges
description: Unpublished writing must remain recoverable after an isolated task merges.
---

For writing delivered by an isolated task, ensure the user receives a downloadable asset and a merge-visible copy of the draft, unless they explicitly require it to remain outside Git.

**Why:** A Places blog draft was registered as an asset but excluded from Git. After the task merged, its metadata remained while the local document was absent, and the user could not find the Library item.

**How to apply:** Do not assume an asset metadata record means the local file exists. Verify the delivered path, avoid explicit ignore rules for the sole copy of requested writing, and present the actual document again when the user asks for it.

For editable media artifacts, keep large playback assets in durable storage with a tracked checksum manifest and automatic post-merge restoration. A downloadable export alone does not preserve the editable preview.

**Why:** Ignoring media without restoring it leaves the merged preview missing its images and soundtrack. A manual recovery command is insufficient for a working handoff.

**How to apply:** Restore before workflows restart, skip checksum-matching files, and fail setup explicitly if required media cannot be restored.
