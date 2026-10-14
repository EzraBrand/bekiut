# English / Latin-script basemap options

Research checked October 14, 2026 against provider documentation. This is a comparison, not an installation or subscription. The current OpenStreetMap raster layer is unchanged.
 
**Subsequent implementation:** The user selected MapTiler and supplied its browser key. The development page now uses MapTiler Streets via MapLibre's Leaflet adapter, with English-preferred vector labels and a same-provider raster fallback for browsers without WebGL2. The comparison below is the original decision research, not the current integration state. No paid subscription was activated. Deferred key restrictions are tracked in `docs/places-publication-todo.md`.

## Recommendation

Use **MapTiler's vector layer for Leaflet** for the simplest documented English-language setting while retaining the current Leaflet markers and selection behavior. Use **Stadia Maps vector tiles with a custom style** if explicit “English, otherwise Latin script, otherwise omit the label” control is the priority.

“English labels” is not a guarantee that every feature has a translated name. To guarantee *Latin characters only*, control every text layer's fallback and hide labels lacking an English/Latin name rather than falling back to Hebrew or Arabic. Do not claim an English setting universally transliterates all streets. The ancient-place marker labels remain independently controlled by our dataset.

## Comparison

| Option | Language control | Setup and current cost | Fit for this page |
| --- | --- | --- | --- |
| **MapTiler vector layer** | Official Leaflet integration supports `Language.ENGLISH` and changing language at runtime. Audit fallback labels for strict Latin-only behavior. | Account/API key required. Free tier is for testing, prototypes, personal or non-commercial use, with usage limits and MapTiler logo. Flex starts at **$30/month**, with extra traffic billed. | Best straightforward English-language option. Adds the vector rendering plugin but can preserve Leaflet controls and markers. |
| **Stadia Maps vector tiles** | Custom style can select `name:en`, then `name:latin`. Default style is bilingual, so changing provider alone is insufficient. | Account and domain authentication for public websites; API key is another option. Free: **200,000 credits/month**, non-commercial only. Starter: **$20/month**, 1 million credits, commercial use allowed; listed additional usage is $0.03/1,000 credits. Standard raster/vector tiles cost one credit each. | Best explicit Latin-script control. Requires a custom vector style and compatible renderer, not just an XYZ URL change. |
| **CARTO Positron / Voyager** | Raster language is baked in; not a runtime English switch. Vector styling is the route for explicit language control, subject to available name fields. | Official FAQ says raster tiles require a key since **September 25, 2026**. Free up to **5 million monthly tile requests non-commercial**, **1 million commercial**. Commercial paid tier starts at $500/month above the free allowance. Vector styles currently load without a key, but CARTO recommends obtaining one. | Attractive light basemaps, but do **not** use old “free keyless CARTO raster URL” recipes. Confirm coverage and label fields before choosing for language needs. |
| **Self-hosted Protomaps / PMTiles** | Supports English names and script metadata; a custom style can exclude non-Latin fallback labels. Default localized styles can still show local names on a second line. | No hosted-provider key for self-hosted data. Storage, CDN/egress, tile preparation and updates are our responsibility; not zero-cost infrastructure. | Most control and less provider dependence, but significantly more work than this trial needs. Do not use demo endpoints as an assumed production service. |
| **Current OSM standard raster** | Local-language text is baked into PNGs and cannot be translated in Leaflet. | No key or paid account; visible attribution, caching/referrer rules, no bulk downloads, best-effort availability. | Keep for now while choosing a replacement. |

Costs are not comparable by map visits alone: providers meter sessions, tile requests or credits differently. Confirm usage quotas and commercial eligibility before subscribing. None of these options has been connected or billed by this research.

## Attribution and implementation constraints

Preserve provider-specific credits as well as OpenStreetMap attribution. MapTiler Free also requires its logo; Stadia's chosen style may additionally credit OpenMapTiles and other contributors; CARTO requires CARTO and OSM credits. Retain our accessible place list, cited coordinate details, failure notice, and reset behavior independently of the renderer. Public browser credentials must be appropriately domain-restricted; never embed a privileged account secret.

No label control can make the modern basemap a historical map. Current boundaries and modern city labels must not be interpreted as ancient boundaries or settlement identifications.

## Sources

- MapTiler's [Leaflet language example](https://docs.maptiler.com/leaflet/examples/map-language) and [pricing](https://www.maptiler.com/cloud/pricing/).
- Stadia's [label-language customization](https://docs.stadiamaps.com/tutorials/changing-the-map-label-language/), [authentication](https://docs.stadiamaps.com/authentication/), and [pricing/credit schedule](https://stadiamaps.com/pricing/).
- CARTO's [current basemap FAQ, keys, pricing and attribution rules](https://docs.carto.com/faqs/carto-basemaps).
- Protomaps [localization and script metadata](https://docs.protomaps.com/basemaps/localization), [basemap downloads](https://docs.protomaps.com/basemaps/downloads), and [hosting cost calculator](https://docs.protomaps.com/deploy/cost).
- OSM's [standard raster tile policy](https://operations.osmfoundation.org/policies/tiles/).
