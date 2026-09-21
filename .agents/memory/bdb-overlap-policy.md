---
name: BDB overlap policy rationale
description: Preserve requested meanings when resolving overlapping abbreviation keys.
---

Resolve overlap in the matcher rather than dropping or reinterpreting a requested mapping.

**Why:** Both “S.E.” → “south-east” and “E. of” → “East of” were explicitly requested. Sefaria's BDB שֵׂעִיר uses standalone “E. of Arabah”, so removing the latter would lose real source coverage. Global length priority let that phrase consume the suffix of “S.E. of”; leftmost priority with longest-at-same-start preserves both meanings and contextual scholar citations.

**How to apply:** When future mapping additions overlap, inspect raw source and its pre-expansion pipeline form before changing meanings. Do not treat a matcher collision as evidence that either mapping is unwanted.