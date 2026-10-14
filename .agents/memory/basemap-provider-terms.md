---
name: Basemap provider terms
description: Provider and localization pitfalls found while comparing alternatives for the ancient-places map.
---

Recheck official terms before replacing a basemap; do not assume familiar public tile URLs remain keyless.

The user prefers **Landscape (color)** as the Places map default and wants the other backgrounds retained as options.

**Why:** The user compared the backgrounds and explicitly selected Landscape.

**How to apply:** Preserve this choice when revising the map unless the user requests a different default.

**Why:** On October 14, 2026, CARTO's official FAQ stated raster keys became mandatory September 25, 2026. Older examples still recommend anonymous URLs. Also, both Stadia and Protomaps documented bilingual local-name behavior even in localized styles.

**How to apply:** Use current provider documentation, not remembered snippets. Distinguish “English preferred” from “Latin-script only”; the latter requires reviewing fallback expressions for every text layer and potentially omitting names without a Latin form. See `docs/map-layer-options.md` for the dated comparison and source links; refresh pricing before implementation.

Prefer image tiles for this simple overview map unless a verified need justifies vector rendering.

**Why:** Vector rendering failed for the user after initialization, leaving only markers; a fallback triggered only by WebGL initialization errors did not cover that failure. The image-tile version loaded successfully. Earlier, forcing MapLibre 6 into the MapTiler SDK also broke its default import.

**How to apply:** Do not restore vector rendering without checking real data loading, not just successful canvas creation. Image tiles use provider-rendered labels, not a client-side language setting. Do not use incompatible dependency overrides or bypass the package firewall.
