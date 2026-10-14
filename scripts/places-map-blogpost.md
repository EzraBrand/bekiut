# Putting Biblical and Talmudic Places on a Map

*October 14, 2026*

I have added a map of biblical and Talmudic places to Bekiut. The current version includes 34 places, from Jerusalem and Tiberias to Alexandria, Rome, and several Jewish centers in Babylonia. Selecting a name or a marker opens a short identification, the source for its coordinates, and notes about uncertainty.

I wanted a way to look up a place while reading and see its approximate position relative to other places. The map is a selected reference list. It does not attempt to identify every location mentioned in classical Jewish texts, and it does not rank places by frequency.

The starting material was two place-name lists from my [Talmud NLP Indexer repository](https://github.com/EzraBrand/talmud-nlp-indexer): a biblical gazetteer with 38 lines and a Talmudic gazetteer with 659. Bekiut already uses these lists for highlighting names in texts. Extending them into a map required additional decisions about which names refer to the same place, which modern location to use, and how confidently to display a marker.

## From names to locations

The source lists contain names and spelling variants, without coordinates. They also contain regions, uncertain locations, and expressions that cannot usefully be represented by a settlement marker. A name’s presence in a list is therefore only the beginning of the mapping process.

For the first version, I selected places with usable modern identifications and recorded a coordinate source for each. The coordinates come from the cited Wikipedia articles, supplemented in some cases by separate historical references. These are orientation sources. I have not undertaken a new archaeological survey or systematically compared the identifications with specialist historical gazetteers.

Among the 34 records, six have biblical-list membership and 30 have Talmudic-list membership; two belong to both. Those categories describe the supplied lists. They are not comprehensive statements about where a place occurs in Jewish literature. Shechem, for example, appears in this map through the Talmudic list, despite its familiar biblical associations.

I have also kept editorial search aliases separate from the source spellings. A Hebrew name can help someone find a place, but it should not imply that the original English-language gazetteer supplied that Hebrew form.

## What a marker means

A precise-looking pin can conceal several kinds of uncertainty. It may indicate an archaeological site, a general point within a modern city, or a proposed vicinity whose identification remains disputed.

I use three labels: “Established,” “Approximate,” and “Disputed.” An established identification still does not make the marker an exact outline of the ancient settlement. The decimal places in a coordinate likewise do not measure confidence in the historical identification.

For Jericho, I use the point for Tell es-Sultan rather than the center of modern Jericho. For Shechem, the marker identifies Tell Balata rather than the center of Nablus. Rome and Athens have approximate city reference points; neither pin identifies a particular building or the setting of a particular rabbinic narrative.

Some names require an explicit choice between different places. The map selects Alexandria in Egypt, Caesarea Maritima, and Antioch on the Orontes. Those selections are stated in the identifications. A future entry for another city with the same name would need its own record.

The Babylonian centers required more caution. Sura, Pumbedita, and Nehardea have disputed markers with notes explaining the proposed locations. Meḥoza has an approximate identification with Veh-Ardashir. These points should not be used to locate a particular academy or reconstruct a journey without further research.

For Nehardea, the notes record conflicting coordinates in the reference material rather than silently treating one as settled. For Pumbedita, the marker is a reference point for the proposed vicinity of modern Fallujah. The accompanying text matters as much as the pin.

## Reading the map

The page combines a searchable list with an interactive map. Selecting either a list item or a marker brings up the same details. Search accepts reviewed spelling variants and Hebrew aliases, with normalization for differences in vocalization, apostrophes, and hyphens.

Readers can filter the records by biblical or Talmudic list membership. Separate regional views move the map to the Land of Israel or Babylonia without changing the list. Keeping these controls distinct makes it possible to inspect one region while retaining the broader selection.

I added place labels, a distance scale, and a visible identification legend. Labels appear where space permits; zooming changes which ones can be shown. An external Google Maps link opens the selected coordinates for comparison with a modern map.

The default background is “Landscape (color),” with other backgrounds available. All of them show modern geography. Roads, administrative boundaries, and background place names should be read accordingly. I have not added ancient borders, settlement extents, or reconstructed travel routes.

The map is now linked from Bekiut’s footer and sitemap. It remains labeled experimental. The list and identification notes are available independently of the background map, so a failed tile request does not remove the underlying place information.

## Extending the sample

The most useful next step is a closer review of the identifications, particularly the disputed Babylonian sites, against specialist references. Adding more markers before resolving their meaning would produce a larger map with less dependable information.

The current model also has limits. It assigns one reference point to each selected place. It does not express a settlement’s changing extent over time, show several competing locations as separate alternatives, or distinguish every period in which a name was used.

I have retained the source names, coordinate citations, and explanatory notes with the data so those decisions can be checked and revised. The companion CSV contains all 34 records. It should be read with the same qualifications as the map: a curated set of modern reference points for ancient names, with the uncertainty attached to each record.

## Technical Appendix

### Data and rendering

The reader is implemented in React and TypeScript. The curated records live in `artifacts/chavrutai/src/lib/places.ts`; the page is `artifacts/chavrutai/src/pages/places.tsx`. Each record includes a stable identifier, display name, search aliases, exact gazetteer spellings and memberships, coordinates, an identification, a certainty label, and source links.

The map uses Leaflet with MapTiler image tiles. The current implementation uses provider-rendered background labels, so a reader should not expect every background name to appear in English. Historical identifications and the application’s place labels are maintained separately from the basemap.

The companion export is generated by `scripts/src/export-ancient-places.ts`. It imports the live place dataset and writes `scripts/ancient-places-results.csv`, including the coordinates, notes, and provenance. Arrays and nested source records are serialized as JSON inside properly quoted CSV fields.

### Challenges and handling

1. **Names without coordinates.** The gazetteers are plain name lists. I added individually cited coordinates to a small reviewed selection instead of sending every name through a modern geocoder. Regions and unlocatable expressions remain outside the settlement-point sample.

2. **Variants and ambiguous names.** Search applies Unicode NFKD normalization, removes combining marks, standardizes case, removes selected apostrophes and hyphens, and collapses whitespace. Matching searches the display name, aliases, and source spellings; geographic equivalence is curated rather than inferred from a similar spelling.

3. **Uncertain locations.** Certainty labels and coordinate notes accompany the points. Where needed, historical-reference links are recorded separately from the article supplying a coordinate. The data does not encode an uncertainty radius.

4. **Background rendering failures.** The implementation changed to image tiles after vector-map rendering failed. Tile errors are reported, while the searchable list, identification text, and external map links remain available. MapTiler and underlying map-data attribution are retained.

5. **Counts and validation.** Tests check unique identifiers, valid coordinate ranges, citation fields, alias lookup, list-membership filters, and selected uncertainty notes. Interaction tests cover selection and failure states. These checks validate the software’s behavior and data structure; they do not independently establish the historical identifications.

### Sources and limits

The source lists are [`bible_places_gazetteer.txt`](https://github.com/EzraBrand/talmud-nlp-indexer/blob/main/data/bible_places_gazetteer.txt) and [`talmud_toponyms_gazetteer.txt`](https://github.com/EzraBrand/talmud-nlp-indexer/blob/main/data/talmud_toponyms_gazetteer.txt). The companion CSV preserves the individual coordinate and identification references. Counts in this draft describe the 34-record version of October 14, 2026. The sample provides no frequency ranking, automatic passage-to-place disambiguation, or historical chronology.
