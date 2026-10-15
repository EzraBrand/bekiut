# Ancient-place maps: comparisons and ideas for Bekiut

Research date: 15 October 2026.

## Summary

ToposText is the closest conceptual comparison: select a place, see passages, and continue into a text. OpenBible is the most useful biblical comparison for recording alternative identifications and connecting places to verses. Pleiades is the strongest reference model for separating a place's identity, names, locations, and supporting evidence. Hatanakh is especially relevant for moving in the opposite direction: from a selected biblical passage to geography.

These are complementary resources, not interchangeable competitors. Bekiut's useful focus is a short path between rabbinic texts and identifiable places, with Hebrew names and a readable interface—not matching the geographic coverage of a specialist atlas.

### Scope of verification

I fetched the official pages and documentation linked below, plus Hatanakh's actual map page and AlHaTorah's map page. This is a documented feature comparison, not a completed hands-on usability review of every map. ToposText's project description includes mobile-app behavior and older collection counts; those counts should not be republished as current totals. Features reported by documentation are distinguished from proposed Bekiut features.

## Closest comparisons

| Resource | Verified features / scope | Useful lesson for Bekiut |
| --- | --- | --- |
| [ToposText](https://topostext.org/) — [project description](https://topostext.org/the-project) | Greek-world places connected to ancient texts. The project describes selecting a site from a list or map, opening two-line passage snippets, filtering by date/genre/relevance, and opening full texts. It also describes a map of places mentioned while reading. | Make passages a primary part of the selected entry. Later, support the reverse direction: places mentioned in the current passage. |
| [OpenBible Bible Geocoding](https://www.openbible.info/geo) — [data documentation](https://github.com/openbibleinfo/Bible-Geocoding-Data) | Atlas with verses and photos; book/chapter KMZ layers; alternative identifications and a most-likely-only export. Data distinguishes ancient places from modern locations and documents coordinate precision separately. | For disputed sites, offer named alternatives supported by sources rather than only a generic “Disputed” badge. Add Bible passage browsing without burying the Talmud material. |
| [Pleiades](https://pleiades.stoa.org/places) | Ancient-world gazetteer, particularly extensive for the Greek and Roman world. Separate place, location, name, and connection resources; search, exports, and API. | Link reviewed entries to stable Pleiades records. Keep aliases, geographic points, and historical identification distinct. |
| [Hatanakh / Herzog map](https://www.hatanakh.com/en/map) — [official introduction](https://www.hatanakh.com/en/content/hatankh-map) | Map page exposes modern/biblical map modes, layers, biblical-era fields, book/chapter/range selection, and “View Text.” The introduction explains its purpose as situating biblical events geographically. | “Map this chapter/passage” is a stronger extension than merely adding more pins. The analogous Bekiut feature could map a daf or passage range. |
| [Digital Atlas of the Roman Empire](https://www.imperium.ahlfeldt.se/) | Roman-world base map, search and places panels, layers, Roman roads, historical map options, and a documented GeoJSON API. | An optional ancient-world basemap could reduce modern-name clutter. Evaluate coverage, licensing, hosting reliability, and readability before replacing the current default. |
| [ORBIS](https://orbis.stanford.edu/) | Roman transport model: routes, travel time and expense, seasonality, and modes of travel. | Useful external context for journeys mentioned in texts. Do not build a route calculator casually or imply the model establishes an actual rabbinic itinerary. |

## Jewish and rabbinic-adjacent resources

| Resource | What it actually covers | Recommendation |
| --- | --- | --- |
| [AlHaTorah: Biblical Commentators Map](https://alhatorah.org/Commentators:Home/Map) | Geography of commentators rather than a gazetteer of locations mentioned in the Talmud. Its map page was retrievable. | Link under “Jewish intellectual geography,” not as an equivalent Talmud atlas. A future people/centres layer is an idea, not an immediate requirement. |
| [HaMapah: Searchable Map of Hebrew Place Names](https://blog.hamapah.org/searchable-map-of-hebrew-place-names) | A Hebrew-place-name map embedded through Awesome Table. The fetched page displayed “No Data to display” and a login requirement. | Worth investigating for names and historical Jewish geography, but verify access in an ordinary browser before recommending it as a frictionless public resource. This fetch result does not establish that it is broken for everyone. |
| [Torah Framework: Spatial](https://www.torahframework.com/spatial) | Geographic centres of Torah scholarship, with eras and scholar/text counts for regions including Eretz Yisrael and Bavel. | A useful comparison for a region's historical context. Do not confuse dates of scholarship with dates when a settlement existed. |
| [National Library of Israel geographic search](https://geo.nli.org.il/en) | Location-based access to books, photographs, manuscripts, and recordings; the introduction limits the displayed collection to geographically associated, copyright-unrestricted digital material. | Useful supplementary resource for images and historical documents. It is a collection-discovery tool, not a Talmudic gazetteer. |

The focused searches did not establish a comprehensive, openly accessible Talmud-specific atlas with the same map-to-linked-passages workflow. This is a search limitation, not evidence that none exists. Avoid “first,” “only,” or “unique” claims in a blog post.

## Improvements to borrow, in priority order

1. **Reveal the selected information immediately.** User feedback showed that focus alone was not enough. Implemented: selecting a marker scrolls to the information card, moves keyboard focus, and respects reduced-motion preferences. Visible labels are also clickable. The full-width map and below-map details remain intact.
2. **Return to map / preserve exploration context.** A compact return control beside the selected entry would complete the round trip. Preserve region and zoom; returning should not silently reset the view.
3. **Curated key passages before live search matches.** ToposText's model suggests a short, reviewed set of especially informative passages above the live results. Keep the distinction explicit: text matches are not automatically verified geographic references.
4. **Map the text being read.** Begin with a small supported range, such as the places on a daf. Requires reliable place identification and disambiguation; broad name matching alone is insufficient.
5. **Specific external place records.** Add reviewed Pleiades/OpenBible links where there is an exact match, rather than sending readers to a generic homepage.
6. **Alternative pins for genuinely disputed sites.** Name the proposed locations and cite their evidence. Preserve the distinction between uncertain identification and a broad city-level point.
7. **Optional historical context layers.** Roads, site types, and periods could help, but avoid importing an atlas's dense control panel. A date filter requires evidence-backed dates and a clear definition of what those dates mean.

Do not copy ToposText's confidence terminology wholesale: its project explanation combines coordinate accuracy and certainty of identification in ways that do not match Bekiut's deliberately separated fields.

## Linking recommendation

Start with a small “Other historical maps” group inside **About this map**:

- **ToposText — ancient Greek places and texts**
- **OpenBible — biblical places and identifications**
- **Pleiades — scholarly ancient-place records**
- **Hatanakh — biblical passages and maps**

DARE and ORBIS could form a second, optional line for Roman geography and travel. Keep the Jewish-intellectual-history tools in a separately labeled group or in the comparative article. Recheck HaMapah's access before adding it.

These links are recommendations, not changes already made to the public page. Linking is distinct from importing data: check attribution and reuse terms for each dataset, image, translation, and basemap before copying anything.

## Blog-post proposal

**Working title:** *From Place Names to Passages: Online Maps for Biblical, Classical, and Rabbinic Texts*

Prefer a comparative review organized by reader questions over a promotional “Bekiut versus competitors” article:

1. **Where is the place?** Pleiades and OpenBible.
2. **What do ancient texts say about it?** ToposText and Bekiut.
3. **Which places occur in this passage?** Hatanakh and the reverse-linking opportunity.
4. **How did people travel between them?** ORBIS and DARE.
5. **Where did Jewish texts and scholarship circulate?** AlHaTorah, HaMapah, Torah Framework, and NLI.
6. **What remains difficult?** Repeated names, competing identifications, dates, coverage, and the difference between search results and reviewed references.

Before drafting a finished review, run the same small exercise in each applicable tool: find Jerusalem and Caesarea; reach a supporting text; examine a disputed identification where available; try the flow on a phone. Use Sura/Pumbedita as rabbinic-coverage examples, without penalizing a Greek- or Bible-focused project for being outside its stated scope.

Use the established blog-writing skill for the eventual draft. Keep sources and testing method in a short technical appendix, and disclose that the author develops Bekiut. No full blog draft or public external-resource list has been added in this pass.
