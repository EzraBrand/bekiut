/**
 * Curated gazetteer sample. See docs/places-trial.md for research and licensing.
 * Coordinates transcribed from each cited article's coordinate field; not geocoded.
 */
export type Corpus = "biblical" | "talmudic";
export interface Place {
  id: string;
  name: string;
  aliases: string[];
  sources: { corpus: Corpus; name: string }[];
  latitude: number;
  longitude: number;
  identification: string;
  certainty: "Established" | "Approximate" | "Disputed";
  coordinateSource: { title: string; url: string };
  coordinateNote: string;
  identificationSources?: { title: string; url: string }[];
}

export const gazetteerSources = {
  biblical: "https://raw.githubusercontent.com/EzraBrand/talmud-nlp-indexer/main/data/bible_places_gazetteer.txt",
  talmudic: "https://raw.githubusercontent.com/EzraBrand/talmud-nlp-indexer/main/data/talmud_toponyms_gazetteer.txt",
};

type Row = [id: string, name: string, aliases: string[], biblical: string[], talmudic: string[], lat: number, lon: number, article: string, identification: string, certainty: Place["certainty"], note: string];
const site = "Representative archaeological-site point, not a precise building or ancient boundary.";
const city = "Approximate city reference point; ancient occupation shifted and this is not an excavated building location.";
const rows: Row[] = [
  ["rome", "Rome", ["Roma", "רומי"], [], ["Rome", "city of Rome"], 41.89333, 12.48278, "Rome", "Rome in Italy, the city on the Tiber. This record represents the city, not the Roman Empire or every symbolic use of Rome in rabbinic literature.", "Approximate", city],
  ["athens", "Athens", ["Athinai", "Athina", "אתונה"], [], ["Athens"], 37.98417, 23.72806, "Athens", "Athens in Attica, Greece. The marker is a general city reference point, not a specific ancient school, monument or location of a rabbinic narrative.", "Approximate", city],
  ["antioch", "Antioch on the Orontes", ["Antioch", "Antakya", "אנטיוכיה"], [], ["Antioch"], 36.20472, 36.18167, "Antioch", "Ancient Antioch on the Orontes at modern Antakya in southern Turkey. This curated interpretation of Antioch excludes Antioch in Pisidia and other cities with the same name.", "Approximate", city],
  ["shechem", "Shechem", ["Sichem", "Tell Balata", "שכם"], [], ["Shechem"], 32.213618, 35.281993, "Shechem", "Ancient Shechem, identified with Tell Balata near Nablus, between Mount Ebal and Mount Gerizim. This pin is for the ancient tell, not the center of later Neapolis or modern Nablus.", "Established", site],
  ["beit-shearim", "Beit She’arim", ["Beit She'arim", "Beth Shearim", "Bet Shearim", "Besara", "בית שערים"], [], ["Beit She’arim"], 32.70222, 35.12917, "Beit_She%27arim_(Roman-era_Jewish_village)", "Roman-era Jewish settlement in Lower Galilee associated with Judah ha-Nasi. This point follows the settlement article, rather than the neighboring necropolis or the modern moshav of the same name.", "Established", site],
  ["sura", "Sura (proposed location)", ["Sura", "סורא"], [], ["Sura"], 31.883, 44.45, "Sura_(city)", "Major Babylonian academy founded by Rav (Abba Arikha). The pin follows the Sura city article's proposed location east of the Euphrates. Precise localization remains uncertain; Mata Meḥasya is variously described as identical, adjacent, or a suburb and is not merged here.", "Disputed", "Proposed location, not a verified academy site. The Sura city article gives 31.883, 44.450; the academy article gives 31.86667, 44.45000. This map uses the city article and does not resolve the discrepancy."],
  ["pumbedita", "Pumbedita (proposed area)", ["Pumbedita", "Pumbeditha", "Pumpedita", "Pumbedisa", "פומבדיתא"], [], ["Pumbedita"], 33.35361, 43.77944, "Fallujah", "Major Babylonian academy founded by Rav Yehuda bar Yeḥezkel, later associated with Rabbah and Abaye. Often placed near Fallujah/Anbar, but the exact site is unconfirmed and the Fallujah identification is contested. Pumbedita and Nehardea remain separate records.", "Disputed", "Orientation only: these are modern Fallujah's coordinates, used to show one proposed vicinity, NOT coordinates of a verified ancient site or academy. Other proposed locations exist; the pin does not adjudicate them."],
  ["nehardea", "Nehardea (proposed area)", ["Neharde’a", "Nehardea", "Nehardeah", "נהרדעא"], [], ["Neharde’a"], 33.375, 43.717, "Anbar_(town)", "Early Babylonian Jewish center and seat of Samuel's academy, commonly placed at or near ancient Anbar by the Euphrates. Its exact relationship to Anbar and the ancient canal network is uncertain.", "Disputed", "Orientation only: the cited point is ancient Anbar, a proposed vicinity for Nehardea, not a verified academy site. The Nehardea article itself displays conflicting coordinates (33.37861, 43.71583 and 33.41972, 43.31250); neither is silently treated as established."],
  ["mehoza", "Meḥoza", ["Mehoza", "Mahoza", "Mahuza", "Mahouza", "מחוזא"], [], ["Meḥoza"], 33.09833, 44.55417, "Veh-Ardashir", "Major Jewish urban center associated with Rava's academy. Identified with Veh-Ardashir on the west bank of the Tigris opposite Ctesiphon, within the wider al-Mada'in urban complex. This record does not merge the whole metropolis or every neighboring settlement.", "Approximate", "Representative point for the Veh-Ardashir archaeological city, not the location of Rava's house or academy. The broader name Mahoza can have a wider urban scope."],
  ["bethel", "Bethel", ["Beth-El", "Beitin", "בית אל"], ["Beth-El", "Bethel"], [], 31.9226, 35.245, "Bethel", "Usually identified with Beitin in the central hill country. A minority proposal places Bethel at al-Bireh instead; this pin follows Beitin.", "Disputed", site],
  ["shiloh", "Shiloh", ["Khirbet Seilun", "שילה"], ["Shiloh"], [], 32.0556, 35.2895, "Shiloh_(biblical_city)", "Ancient sanctuary settlement identified with Khirbet Seilun, north of Bethel.", "Established", site],
  ["samaria", "Samaria (city)", ["Sebastia", "Sebaste", "שומרון"], ["Samaria"], ["Sebastia"], 32.27639, 35.195, "Samaria_(ancient_city)", "Royal city of Samaria, later Sebaste, at Sebastia. This record means the city, not the wider region also called Samaria.", "Established", site],
  ["shushan", "Shushan", ["Susa", "שושן"], ["Shushan"], ["Shushan the capital"], 32.19056, 48.25778, "Susa", "Ancient Susa near modern Shush in southwestern Iran. Other gazetteer forms such as Shosh are not assumed to refer to this site.", "Established", site],
  ["gath", "Gath", ["Tell es-Safi", "Tel Zafit", "גת"], ["Gath"], [], 31.7, 34.847, "Gath_(city)", "Philistine Gath, widely identified with Tell es-Safi/Tel Zafit. Not other settlements with Gath in their names.", "Established", site],
  ["zorah", "Zorah", ["Tel Tzora", "Sar'a", "צרעה"], ["Zorah"], [], 31.775086, 34.98535, "Zorah", "Biblical hill settlement identified with Sar'a/Tel Tzora above the Sorek valley.", "Approximate", site],
  ["jerusalem", "Jerusalem", ["Yerushalayim", "ירושלים"], [], ["Jerusalem"], 31.77889, 35.22556, "Jerusalem", "Historic city in the Judean hill country. Zion and Mount Moriah are not silently merged into this record.", "Approximate", city],
  ["jericho", "Jericho", ["Tell es-Sultan", "יריחו"], [], ["Jericho"], 31.87111, 35.44389, "Tell_es-Sultan", "Ancient Jericho at Tell es-Sultan, northwest of the present city. Later Jericho settlements are not this exact point.", "Established", site],
  ["hebron", "Hebron", ["חברון"], [], ["Hebron"], 31.52861, 35.09694, "Hebron", "Historic city in the southern Judean hills. City-level orientation only; not a pin for the Cave of Machpelah.", "Approximate", city],
  ["beersheba", "Beersheba", ["Beer Sheva", "Tel Be'er Sheva", "באר שבע"], [], ["Beersheba"], 31.24472, 34.84083, "Tel_Be%27er_Sheva", "Tell es-Seba/Tel Be'er Sheva, the archaeological site associated with biblical Beersheba, east of the modern city. Not a locator for every later-period reference.", "Established", site],
  ["bethlehem", "Bethlehem", ["Beit Lehem", "בית לחם"], [], ["Bethlehem"], 31.70444, 35.20639, "Bethlehem", "Bethlehem in the Judean hills south of Jerusalem, not Bethlehem of Galilee.", "Approximate", city],
  ["tiberias", "Tiberias", ["Teverya", "טבריה"], [], ["Tiberias"], 32.79444, 35.53333, "Tiberias", "City on the western shore of the Sea of Galilee, a major center of rabbinic learning. The city reference point is north of much of the ancient settlement.", "Approximate", city],
  ["tzippori", "Tzippori", ["Sepphoris", "Zippori", "ציפורי"], [], ["Tzippori"], 32.74556, 35.27861, "Sepphoris", "Sepphoris, the ancient Galilean city northwest of Nazareth.", "Established", site],
  ["beit-shean", "Beit She’an", ["Beit She'an", "Beth Shean", "Scythopolis", "בית שאן"], [], ["Beit She’an"], 32.5, 35.5, "Beit_She%27an", "City near the junction of the Jezreel and Jordan valleys; known as Scythopolis in the Greco-Roman period.", "Approximate", city],
  ["tyre", "Tyre", ["Sur", "צור"], [], ["Tyre"], 33.27083, 35.19611, "Tyre,_Lebanon", "Phoenician coastal city in present-day Lebanon. The island and mainland settlement extended beyond this point.", "Approximate", city],
  ["yavne", "Yavne", ["Jabneh", "Jamnia", "יבנה"], [], ["Yavne"], 31.883, 34.733, "Yavne", "Coastal-plain city associated with the rabbinic center of Yavne/Jamnia; not Jamnith in Galilee.", "Approximate", city],
  ["lod", "Lod", ["Lydda", "Diospolis", "לוד"], [], ["Lod"], 31.95194, 34.88806, "Lod", "Lod/Lydda in the central coastal plain, later known as Diospolis.", "Approximate", city],
  ["caesarea", "Caesarea (Maritima)", ["Caesarea", "Caesarea Maritima", "קיסריה"], [], ["Caesarea"], 32.5, 34.89167, "Caesarea_Maritima", "Herodian harbor city on the Mediterranean coast. This curated interpretation of Caesarea is not Caesarea Philippi or other cities bearing the name.", "Established", site],
  ["akko", "Akko", ["Acre", "עכו"], [], ["Akko"], 32.92778, 35.08167, "Acre,_Israel", "Coastal city of Akko/Acre. The ancient tell and later port are separate parts of its settlement history; this is a general city point.", "Approximate", city],
  ["jaffa", "Jaffa", ["Joppa", "Yafo", "יפו"], [], ["Jaffa"], 32.05222, 34.75306, "Jaffa", "Ancient Mediterranean port, now the Jaffa part of Tel Aviv–Yafo.", "Approximate", city],
  ["ashkelon", "Ashkelon", ["Ascalon", "אשקלון"], [], ["Ashkelon"], 31.66194, 34.54611, "Ascalon", "Ancient coastal city at the Ascalon archaeological site, not the center of modern Ashkelon.", "Established", site],
  ["damascus", "Damascus", ["Dimashq", "דמשק"], [], ["Damascus"], 33.51306, 36.30944, "Damascus", "Historic city in the oasis east of the Anti-Lebanon mountains, in present-day Syria.", "Approximate", city],
  ["alexandria", "Alexandria in Egypt", ["Alexandria", "Alexandria of Egypt", "אלכסנדריה"], [], ["Alexandria", "Alexandria in Egypt", "Alexandria of Egypt"], 31.1975, 29.8925, "Alexandria", "Mediterranean port founded by Alexander in Egypt. Explicitly the Egyptian city, not other Alexandrias.", "Approximate", city],
  ["nineveh", "Nineveh", ["Niniveh", "נינוה"], [], ["Nineveh"], 36.35944, 43.15278, "Nineveh", "Ancient Assyrian city on the east bank of the Tigris, across from historic Mosul.", "Established", site],
  ["tadmor", "Tadmor", ["Palmyra", "תדמור"], [], ["Tadmor"], 34.55139, 38.26806, "Palmyra", "Ancient oasis city of Palmyra in the Syrian desert. Similar gazetteer forms are not automatically treated as aliases.", "Established", site],
];

const identificationSources: Record<string, NonNullable<Place["identificationSources"]>> = {
  sura: [{ title: "Sura: location and relationship to Mata Mehasya", url: "https://en.wikipedia.org/wiki/Sura_(city)#Location" }, { title: "Sura Academy: alternative coordinate field", url: "https://en.wikipedia.org/wiki/Sura_Academy" }],
  pumbedita: [{ title: "Encyclopaedia Judaica: Pumbedita (history and geography)", url: "https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/pumbedita" }, { title: "Pumbedita: unresolved location and competing proposals", url: "https://en.wikipedia.org/wiki/Pumbedita#Location" }],
  nehardea: [{ title: "Nehardea: location, history and conflicting coordinate fields", url: "https://en.wikipedia.org/wiki/Nehardea" }],
  mehoza: [{ title: "Michael G. Morony, Encyclopaedia Iranica: Beh-Ardašīr", url: "https://www.iranicaonline.org/articles/beh-ardasir-mid/" }, { title: "Encyclopaedia Judaica: Pumbedita and the move to Mahoza under Rava", url: "https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/pumbedita" }],
};

export const places: Place[] = rows.map(([id, name, aliases, biblical, talmudic, latitude, longitude, article, identification, certainty, coordinateNote]) => ({
  id, name, aliases, latitude, longitude, identification, certainty, coordinateNote,
  identificationSources: identificationSources[id],
  sources: [...biblical.map(name => ({ corpus: "biblical" as const, name })), ...talmudic.map(name => ({ corpus: "talmudic" as const, name }))],
  coordinateSource: { title: `Wikipedia: ${decodeURIComponent(article).replaceAll("_", " ")} (coordinate field; reviewed October 14, 2026)`, url: `https://en.wikipedia.org/wiki/${article}` },
})).sort((a, b) => a.name.localeCompare(b.name));

export function normalizePlaceSearch(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en").replace(/[’‘'ʼʻʿʾ־–-]/gu, "").replace(/\s+/g, " ").trim();
}

export function filterPlaces(query: string, corpus: Corpus | "all"): Place[] {
  const needle = normalizePlaceSearch(query);
  return places.filter(place =>
    (corpus === "all" || place.sources.some(source => source.corpus === corpus)) &&
    [place.name, ...place.aliases, ...place.sources.map(source => source.name)].some(name => normalizePlaceSearch(name).includes(needle)),
  );
}
