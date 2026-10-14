# Ancient places trial — review notes

## Final sample expansion

Current sample: **34 places**, with six biblical-list and 30 Talmudic-list memberships (two shared). Added five exact Talmudic-gazetteer names, with article coordinate fields manually checked October 14, 2026:

| Place | Latitude | Longitude | Coordinate citation | Scope |
| --- | ---: | ---: | --- | --- |
| Rome | 41.89333 | 12.48278 | https://en.wikipedia.org/wiki/Rome | Approximate city point; not the empire |
| Athens | 37.98417 | 23.72806 | https://en.wikipedia.org/wiki/Athens | Approximate city point; not an ancient school |
| Antioch | 36.20472 | 36.18167 | https://en.wikipedia.org/wiki/Antioch | Orontes city at Antakya; not Pisidian Antioch |
| Shechem | 32.213618 | 35.281993 | https://en.wikipedia.org/wiki/Shechem | Tell Balata, not later Neapolis/Nablus center |
| Beit She’arim | 32.70222 | 35.12917 | https://en.wikipedia.org/wiki/Beit_She%27arim_(Roman-era_Jewish_village) | Ancient settlement, not adjacent necropolis or modern moshav |

These citations are orientation references, not a new archaeological survey. The blog draft and reproducible dataset export are in `scripts/ancient-places-blogpost.md` and `scripts/ancient-places-results.csv`; they remain drafts and are not a publication action. Earlier counts below document preceding sample sizes.

## Current basemap correction

**Current user-selected default: Landscape (color).** All other backgrounds remain available. This supersedes the earlier default-selection notes below.

Background comparison options now include Landscape (`landscape-v4`), Soft color (`dataviz-v4`) and Outdoor (`outdoor-v4`), alongside the existing grayscale Backdrop and Streets styles. Style IDs were checked against MapTiler's official landscape, dataviz and outdoor product pages. Only the image layer is replaced on selection, preserving markers, map position, filters and selected details. All styles share the existing key and request allowance; no subscription change is made. The current default is unchanged while the user compares options.

The default is now MapTiler Backdrop (`backdrop-v4`), a quieter terrain style documented at https://www.maptiler.com/maps/backdrop/. Modern reference (`streets-v2`) remains selectable. Both use image tiles, not WebGL. Backdrop suppresses much city/road clutter but still contains modern country labels and boundaries; it is not a custom historical or fully label-free map.

Ancient-place labels use editorial visibility priority and measured label boxes to hide overlaps; selected places always retain a label, and hover/focus reveals otherwise hidden labels. Layout recomputes after zoom, pan, resize, filtering and selection. Regional buttons frame Land of Israel or Babylonia without filtering the independent list or claiming historical borders. Reset clears selection/search/corpus/region, retaining the user's background and label preferences.

Following a user report of a blank vector background with only markers, the map now uses MapTiler Streets image tiles directly in Leaflet. No WebGL renderer is loaded. The provider's rendered labels are used (English/Latin labels visible in the overview); there is no client-side language override. This supersedes the vector implementation notes below. The corrected preview visibly loaded the full map, markers, logo and attribution with no error notice or console errors. Focused tests and frontend typecheck passed.

This direct-access `/places` trial is not a frequency ranking. It now uses 29 named settlements selected from the reader's two existing gazetteers (initial sample: 25). No live geocoder, database, paid provider, or credentials are required. It is not published automatically and must remain out of navigation/sitemaps and noindex pending editorial review.

## Babylonian Jewish centers added October 14, 2026

The user requested major Babylonian centers. Added four exact Talmudic-list names: Sura, Pumbedita, Neharde’a, and Meḥoza. Current membership totals: six biblical-list records and 25 Talmudic-list records, with two overlapping records. Historical initial-review counts below describe the original sample.

- **Sura — disputed:** 31.883, 44.450 from the [Sura city coordinate field](https://en.wikipedia.org/wiki/Sura_(city)). The [academy article](https://en.wikipedia.org/wiki/Sura_Academy) instead gives 31.86667, 44.45000. The detail note exposes the mismatch; this is a proposed location, not a verified academy footprint. Mata Mehasya is not silently merged.
- **Pumbedita — disputed:** 33.35361, 43.77944 is the [modern Fallujah point](https://en.wikipedia.org/wiki/Fallujah), explicitly used only to orient readers to one contested proposed vicinity. It is **not** a coordinate for a verified ancient site. [The location discussion](https://en.wikipedia.org/wiki/Pumbedita#Location) reports that the exact site is insecure and the Fallujah identification is contested. [Encyclopaedia Judaica](https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/pumbedita) supplies historical/geographic context, including the academy founded by Judah b. Ezekiel and its move to Mahoza under Rava.
- **Nehardea — disputed:** 33.375, 43.717 is the [ancient Anbar coordinate](https://en.wikipedia.org/wiki/Anbar_(town)), a proposed vicinity, not an academy site. The [Nehardea article](https://en.wikipedia.org/wiki/Nehardea) gives two contradictory coordinates, 33.37861/43.71583 and 33.41972/43.31250. Neither is silently selected as authoritative. Nehardea is not merged with Pumbedita.
- **Meḥoza — approximate:** 33.09833, 44.55417 from [Veh-Ardashir](https://en.wikipedia.org/wiki/Veh-Ardashir), the city west of the Tigris opposite Ctesiphon. The identification is corroborated by Michael G. Morony's [Encyclopaedia Iranica entry](https://www.iranicaonline.org/articles/beh-ardasir-mid/). This pin does not identify Rava's academy or the entire al-Mada'in conurbation.

Each new record includes separately visible historical-reference links as well as a coordinate citation. Disputed records say “proposed location/area” in their names and carry visible uncertainty labels. This extension permits clearly labeled proposed-vicinity reference pins; it does not claim to have geolocated otherwise unverified sites.

Map-layer research is in `docs/map-layer-options.md`. Subsequently, the user supplied a MapTiler browser key and authorized development integration. The map now uses MapTiler Streets vector tiles with English-preferred names, rendered by MapLibre through its Leaflet adapter. Local-name fallback remains possible. No subscription was changed. See `docs/places-publication-todo.md` for deferred origin restrictions and build configuration.

Extension validation: all nine places data/DOM interaction tests passed, including selection and historical references for each new center, search aliases, corpus membership, reset to 29 markers and visible caveats. Frontend typecheck passed. The running desktop preview showed the added Iraqi markers and retained attribution/reset controls without browser errors.

MapTiler integration: WebGL2 browsers use vector tiles and English → Latin → local-name fallback. Browsers without WebGL2 use the same provider's raster map with an explicit default-label notice. The capture browser lacks WebGL2; its screenshot verified real raster requests using the supplied key, Latin-script overview labels, markers, logo and attribution without console errors. Vector language/failure behavior is covered by focused provider unit tests; the page interaction tests replace only the remote basemap and retain real Leaflet markers. Live vector rendering in a WebGL2 browser was not visually verified.

## Reproducibility and provenance

Dataset: `artifacts/chavrutai/src/lib/places.ts`. Each record has a stable ID, the exact source spellings and list memberships, separately supplied search aliases, a citation for its coordinates, a certainty label, and an original short identification. Decimal coordinates were transcribed from the coordinate fields of the individually linked Wikipedia articles, reviewed October 14, 2026; they are **not** results of live geocoding. Numbers are retained as supplied, not a claim of survey-level accuracy. Article text is not copied.

Gazetteer snapshot reviewed: EzraBrand/talmud-nlp-indexer commit `dddf98ecec5d75282f9e187f16e4f5cc6d8f00aa`:

- `https://raw.githubusercontent.com/EzraBrand/talmud-nlp-indexer/dddf98ecec5d75282f9e187f16e4f5cc6d8f00aa/data/bible_places_gazetteer.txt`
- `https://raw.githubusercontent.com/EzraBrand/talmud-nlp-indexer/dddf98ecec5d75282f9e187f16e4f5cc6d8f00aa/data/talmud_toponyms_gazetteer.txt`

Membership is literal presence in these lists, not biblical/Talmudic attestation. The six biblical-list selections include two shared records (Samaria/Sebastia and Shushan/Shushan the capital); 21 records have Talmudic-list membership. Hebrew aliases are editorial, not supplied by these English source lists.

## Coordinate review and limitations

All 25 linked articles' coordinate fields were inspected. Representative checks:

- Shiloh: 32.0556, 35.2895; article identifies Khirbet Seilun.
- Bethel: 31.9226, 35.245; Beitin is the majority identification, al-Bireh a minority alternative. Marked disputed.
- Samaria: 32.27639, 35.195; archaeological city at Sebastia, explicitly not the region.
- Shushan: 32.19056, 48.25778; ancient Susa, not every similarly spelled term.
- Jericho: 31.87111, 35.44389 from **Tell es-Sultan**, not modern Jericho's city point.
- Beersheba: 31.24472, 34.84083 from **Tel Be'er Sheva**, not the modern city center. Not every later-period referent.
- Ashkelon: 31.66194, 34.54611 from **Ascalon**, the ancient site.
- Tzippori: 32.74556, 35.27861 from **Sepphoris**.
- Nineveh: 36.35944, 43.15278; archaeological site, not Mosul.

City-level points (including Tiberias, Akko, Jerusalem, Alexandria) are explicitly approximate and may differ from ancient settlement centers. Established means widely accepted identification, not exact archaeological extent. Source decimals do not express uncertainty bounds. Wikipedia is a secondary orientation source, not a scholarly adjudication of historical geography. Review against specialist gazetteers before broad release.

Only reviewed equivalent names are combined. Caesarea explicitly selects Maritima; Alexandria selects Egypt; Bethlehem selects the Judean city. Unreviewed similar names (Shosh, Tiberius, Tarmod) are not silently merged. Regions such as Babylonia and Galilee, rivers, uncertain sites such as Mount Sinai, and non-geographic/mythic entries such as Truth and Sheol are excluded, not represented as settlement points. The sample is deliberately not exhaustive and includes no borders, historical routes or frequency claims.

## Mapping terms and privacy

Leaflet is BSD-2-Clause licensed. Standard OpenStreetMap raster tiles are suitable for this low-volume interactive trial under https://operations.osmfoundation.org/policies/tiles/ (reviewed October 14, 2026). They have no SLA and may be blocked. The client requests only displayed tiles, uses browser caching and referrer defaults, preserves attribution, and provides no bulk/offline download. Do not run automated tile-prefetching or pan/zoom crawlers; mock tile requests for automated interaction tests. A new provider/usage review is needed before high-traffic release. The tile service receives users' IP addresses and referrers; external Google Maps links are optional.

## Validation performed

- Workspace `pnpm run typecheck`: passed.
- ChavrutAI production Vite/server build: passed (existing large-chunk warnings remain).
- ChavrutAI suite: 1,242 existing/data tests passed; after fixing the new DOM test's classic-JSX test setup, its two tests passed too.
- Focused final run: 31 tests passed across places data, actual Leaflet/page DOM interactions, and shared route validation.
- DOM interaction checks used happy-dom without real tile downloads: list/marker synchronization, filtering, alias/Hebrew search, empty results, reset, synthetic tile failure, continued details/Google links and retry.
- Screenshots inspected at 1280px desktop and 390px mobile: map visible, attribution retained, no horizontal page overflow, list and explanatory text readable.
- Direct preview `/places`: HTTP 200. API crawler handler `/places`: HTTP 200 with experimental title and noindex.
- Built web-server smoke check, both ordinary browser and Googlebot user agents, `/places` and `/places/`: HTTP 200, identical experimental title, noindex meta and `X-Robots-Tag: noindex, follow`.
- No `/places` entry added to sitemap generators, sitemap page, or shared navigation.

No real-browser end-to-end test was run; the changed read-only interactions were exercised with the real Leaflet component in DOM tests, and visual layout checked separately. This is a reviewable trial, not a claim of specialist historical validation.

## Gazetteer license

The upstream repository's LICENSE is MIT:

Copyright (c) 2025 Ezra Brand

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
