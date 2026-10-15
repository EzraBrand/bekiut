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
// General coordinate limitations are explained once in the page footer.
const site = "";
const city = "";
const rows: Row[] = [
  ["usha", "Usha", ["אושא"], [], ["Usha"], 32.799414, 35.146701, "Usha_(ancient_city)", "Ancient Lower Galilean town associated with the Sanhedrin and the ordinances of Usha. The marker locates the ancient town.", "Established", site],
  ["shefaram", "Shefaram", ["Shefa-Amr", "Shfar'am", "שפרעם"], [], ["Shefaram"], 32.80556, 35.16944, "Shefa-Amr", "Galilean town named among the successive seats of the Sanhedrin, identified with present-day Shefa-Amr.", "Approximate", city],
  ["beitar", "Beitar", ["Betar", "Bethar", "ביתר"], [], ["Beitar"], 31.73, 35.135556, "Betar_(ancient_city)", "Ancient fortified settlement near Battir, associated with the end of the Bar Kokhba revolt and rabbinic accounts of its destruction.", "Established", site],
  ["haifa", "Haifa", ["Ḥaifa", "חיפה"], [], ["Haifa", "Ḥaifa"], 32.81917, 34.99917, "Haifa", "Coastal city at Mount Carmel. Rabbinic Haifa predates the modern city's expansion.", "Approximate", city],
  ["sidon", "Sidon", ["Saida", "צידון"], [], ["Sidon"], 33.56056, 35.37583, "Sidon", "Phoenician coastal city in present-day Lebanon, also named in rabbinic narratives.", "Approximate", city],
  ["gaza", "Gaza (city)", ["Gaza", "עזה"], [], ["Gaza"], 31.5075, 34.459722222222, "Gaza_City", "Historic coastal city of Gaza, mentioned in rabbinic discussions of travel and its marketplace. The entry covers the city itself.", "Approximate", city],
  ["antipatris", "Antipatris", ["Tel Afek", "אנטיפטריס"], [], ["Antipatris"], 32.105, 34.930417, "Antipatris", "Herodian city at Tel Afek near the Yarkon springs, appearing in rabbinic travel and boundary discussions.", "Established", site],
  ["nisibis", "Nisibis", ["Nusaybin", "Netzivin", "Nesibin", "נציבין"], [], ["Nesibin", "Netzivin"], 37.075, 41.21528, "Nusaybin", "Ancient Nisibis at modern Nusaybin, associated in rabbinic tradition with Rabbi Yehuda ben Beteira.", "Approximate", city],
  ["sikhnei", "Sikhnei", ["Sakhnin", "Sikhnin", "סכנין", "סחנין"], [], ["Sikhnei"], 32.867, 35.3, "Sakhnin", "Galilean settlement identified with modern Sakhnin. The entry covers the town within the wider Sikhnei Valley.", "Approximate", city],
  ["gush-halav", "Gush Ḥalav", ["Gush Halav", "Gischala", "Jish", "גוש חלב"], [], ["Gush Ḥalav"], 33.02611, 35.44528, "Jish", "Ancient Gush Halav at Jish in Upper Galilee, known for olive oil and listed among ancient walled cities in Mishnah Arakhin.", "Approximate", city],
  ["yodfat", "Yodfat (ancient)", ["Yodfat", "Jotapata", "יודפת"], [], ["Yodfat", "ancient Yodfat"], 32.83194444, 35.27813889, "Yodfat", "Ancient Jotapata in Lower Galilee, listed in Mishnah Arakhin and known for the siege described by Josephus. This pin is the ancient site, south of the modern village.", "Established", site],
  ["gamla", "Gamla", ["Gamala", "גמלא"], [], ["Gamla"], 32.90278, 35.74056, "Gamla", "Ancient settlement in the Golan, named among walled cities in Mishnah Arakhin. The marker locates its archaeological remains.", "Established", site],
  ["ein-gedi", "Ein Gedi", ["En Gedi", "עין גדי"], [], ["Ein Gedi"], 31.46139, 35.3925, "Ein_Gedi_(archaeological_site)", "Ancient Dead Sea oasis settlement associated with balsam cultivation and a late-antique synagogue. The marker locates the archaeological site.", "Established", site],
  ["kefar-sava", "Kefar Sava", ["Kfar Saba", "Kafr Saba", "כפר סבא"], [], ["Kefar Sava"], 32.18111, 34.93722, "Kafr_Saba", "Ancient Kefar Sava is associated with the later Kafr Saba site, east of the modern city center. Mentioned in rabbinic agricultural and boundary discussions.", "Approximate", site],
  ["meron", "Meron", ["Meiron", "מירון"], [], ["Meron"], 32.98222, 35.43806, "Meiron", "Ancient Upper Galilean settlement with synagogue remains, associated with sheep and olive oil in rabbinic sources.", "Approximate", site],
  ["pamyas", "Pamyas (Banias)", ["Pamyas", "Paneas", "Caesarea Philippi", "בניאס", "פמיאס"], [], ["Pamyas"], 33.24861, 35.69444, "Banias", "Ancient Paneas at the springs below Mount Hermon. Distinct from Caesarea Maritima and from the Syrian coastal city Baniyas.", "Established", site],
  ["emmaus", "Emmaus (Nicopolis)", ["Emmaus", "Nicopolis", "אמאוס", "אמאוס ניקופוליס"], [], ["Emmaus"], 31.83917, 34.98944, "Emmaus_Nicopolis", "Emmaus-Nicopolis at Latrun, discussed in Palestinian rabbinic geography.", "Established", site],
  ["carthage", "Carthage", ["קרתגו"], [], ["Carthage"], 36.8528, 10.3233, "Carthage", "Ancient North African city near Tunis, including its Roman-period successor. This entry covers specifically the city (as opposed to the Carthaginian empire).", "Established", site],
  ["ctesiphon", "Ctesiphon", ["Akteisfon", "Akistefon", "קטסיפון"], [], ["Akteisfon", "Akistefon"], 33.09361, 44.58056, "Ctesiphon", "Parthian and Sasanian capital on the Tigris. Kept separate from Mehoza/Veh-Ardashir on the opposite bank, although both belonged to the wider metropolitan area.", "Established", site],
  ["puteoli", "Puteoli", ["Pozzuoli", "פוטאולי", "פוצואולי"], [], ["Puteoli"], 40.84444, 14.09333, "Pozzuoli", "Ancient Roman port on the Bay of Naples, now Pozzuoli.", "Approximate", city],
  ["rome", "Rome", ["Roma", "רומי"], [], ["Rome", "city of Rome"], 41.89333, 12.48278, "Rome", "City on the Tiber in Italy and capital of the Roman Empire. The entry covers Rome as a city.", "Approximate", city],
  ["athens", "Athens", ["Athinai", "Athina", "אתונה"], [], ["Athens"], 37.98417, 23.72806, "Athens", "Athens in Attica, Greece, a major center of Greek learning.", "Approximate", city],
  ["antioch", "Antioch on the Orontes", ["Antioch", "Antakya", "אנטיוכיה"], [], ["Antioch"], 36.20472, 36.18167, "Antioch", "Ancient Antioch on the Orontes at modern Antakya in southern Turkey.", "Approximate", city],
  ["shechem", "Shechem", ["Sichem", "Tell Balata", "שכם"], [], ["Shechem"], 32.213618, 35.281993, "Shechem", "Ancient Shechem, identified with Tell Balata near Nablus, between Mount Ebal and Mount Gerizim.", "Established", site],
  ["beit-shearim", "Beit She’arim", ["Beit She'arim", "Beth Shearim", "Bet Shearim", "Besara", "בית שערים"], [], ["Beit She’arim"], 32.70222, 35.12917, "Beit_She%27arim_(Roman-era_Jewish_village)", "Roman-era Jewish settlement in Lower Galilee associated with Judah ha-Nasi. This point follows the settlement article, rather than the neighboring necropolis or the modern moshav of the same name.", "Established", site],
  ["sura", "Sura (proposed location)", ["Sura", "סורא"], [], ["Sura"], 31.883, 44.45, "Sura_(city)", "Major Babylonian academy founded by Rav (Abba Arikha). The marker follows a proposed location east of the Euphrates. Sources describe Mata Meḥasya as Sura itself, an adjacent settlement, or a suburb.", "Disputed", "Coordinates follow the Sura city article (31.883, 44.450). The academy article places it slightly farther south (31.86667, 44.45000)."],
  ["pumbedita", "Pumbedita (proposed area)", ["Pumbedita", "Pumbeditha", "Pumpedita", "Pumbedisa", "פומבדיתא"], [], ["Pumbedita"], 33.35361, 43.77944, "Fallujah", "Major Babylonian academy founded by Rav Yehuda bar Yeḥezkel, later associated with Rabbah and Abaye. The Fallujah/Anbar area is one proposed location; the identification is disputed.", "Disputed", "The marker uses modern Fallujah's coordinates to indicate the proposed area."],
  ["nehardea", "Nehardea (proposed area)", ["Neharde’a", "Nehardea", "Nehardeah", "נהרדעא"], [], ["Neharde’a"], 33.375, 43.717, "Anbar_(town)", "Early Babylonian Jewish center and seat of Samuel's academy, commonly placed at or near ancient Anbar by the Euphrates. Its exact relationship to Anbar and the ancient canal network is uncertain.", "Disputed", "The marker follows ancient Anbar. The Nehardea article gives conflicting coordinates (33.37861, 43.71583 and 33.41972, 43.31250)."],
  ["mehoza", "Meḥoza", ["Mehoza", "Mahoza", "Mahuza", "Mahouza", "מחוזא"], [], ["Meḥoza"], 33.09833, 44.55417, "Veh-Ardashir", "Major Jewish urban center associated with Rava's academy. Identified with Veh-Ardashir on the west bank of the Tigris opposite Ctesiphon, within the wider al-Mada'in urban complex.", "Approximate", "The marker locates Veh-Ardashir. Mahoza can also refer to the wider urban area."],
  ["bethel", "Bethel", ["Beth-El", "Beitin", "בית אל"], ["Beth-El", "Bethel"], [], 31.9226, 35.245, "Bethel", "Usually identified with Beitin in the central hill country. A minority proposal places Bethel at al-Bireh instead; this pin follows Beitin.", "Disputed", site],
  ["shiloh", "Shiloh", ["Khirbet Seilun", "שילה"], ["Shiloh"], [], 32.0556, 35.2895, "Shiloh_(biblical_city)", "Ancient sanctuary settlement identified with Khirbet Seilun, north of Bethel.", "Established", site],
  ["samaria", "Samaria (city)", ["Sebastia", "Sebaste", "שומרון"], ["Samaria"], ["Sebastia"], 32.27639, 35.195, "Samaria_(ancient_city)", "Royal city of Samaria, later Sebaste, at Sebastia. The entry covers the city within the wider region of Samaria.", "Established", site],
  ["shushan", "Shushan", ["Susa", "שושן"], ["Shushan"], ["Shushan the capital"], 32.19056, 48.25778, "Susa", "Ancient Susa near modern Shush in southwestern Iran.", "Established", site],
  ["gath", "Gath", ["Tell es-Safi", "Tel Zafit", "גת"], ["Gath"], [], 31.7, 34.847, "Gath_(city)", "Philistine Gath, widely identified with Tell es-Safi/Tel Zafit.", "Established", site],
  ["zorah", "Zorah", ["Tel Tzora", "Sar'a", "צרעה"], ["Zorah"], [], 31.775086, 34.98535, "Zorah", "Biblical hill settlement identified with Sar'a/Tel Tzora above the Sorek valley.", "Approximate", site],
  ["jerusalem", "Jerusalem", ["Yerushalayim", "ירושלים"], [], ["Jerusalem"], 31.77889, 35.22556, "Jerusalem", "Historic city in the Judean hill country.", "Approximate", city],
  ["jericho", "Jericho", ["Tell es-Sultan", "יריחו"], [], ["Jericho"], 31.87111, 35.44389, "Tell_es-Sultan", "Ancient Jericho at Tell es-Sultan, northwest of the present city.", "Established", site],
  ["hebron", "Hebron", ["חברון"], [], ["Hebron"], 31.52861, 35.09694, "Hebron", "Historic city in the southern Judean hills, associated with the Cave of Machpelah.", "Approximate", city],
  ["beersheba", "Beersheba", ["Beer Sheva", "Tel Be'er Sheva", "באר שבע"], [], ["Beersheba"], 31.24472, 34.84083, "Tel_Be%27er_Sheva", "Tell es-Seba/Tel Be'er Sheva, the archaeological site associated with biblical Beersheba, east of the modern city.", "Established", site],
  ["bethlehem", "Bethlehem", ["Beit Lehem", "בית לחם"], [], ["Bethlehem"], 31.70444, 35.20639, "Bethlehem", "Bethlehem in the Judean hills south of Jerusalem.", "Approximate", city],
  ["tiberias", "Tiberias", ["Teverya", "טבריה"], [], ["Tiberias"], 32.79444, 35.53333, "Tiberias", "City on the western shore of the Sea of Galilee, a major center of rabbinic learning. The city reference point is north of much of the ancient settlement.", "Approximate", city],
  ["tzippori", "Tzippori", ["Sepphoris", "Zippori", "ציפורי"], [], ["Tzippori"], 32.74556, 35.27861, "Sepphoris", "Sepphoris, the ancient Galilean city northwest of Nazareth.", "Established", site],
  ["beit-shean", "Beit She’an", ["Beit She'an", "Beth Shean", "Scythopolis", "בית שאן"], [], ["Beit She’an"], 32.5, 35.5, "Beit_She%27an", "City near the junction of the Jezreel and Jordan valleys; known as Scythopolis in the Greco-Roman period.", "Approximate", city],
  ["tyre", "Tyre", ["Sur", "צור"], [], ["Tyre"], 33.27083, 35.19611, "Tyre,_Lebanon", "Phoenician coastal city in present-day Lebanon, with historic island and mainland settlements.", "Approximate", city],
  ["yavne", "Yavne", ["Jabneh", "Jamnia", "יבנה"], [], ["Yavne"], 31.883, 34.733, "Yavne", "Coastal-plain city associated with the rabbinic center of Yavne/Jamnia.", "Approximate", city],
  ["lod", "Lod", ["Lydda", "Diospolis", "לוד"], [], ["Lod"], 31.95194, 34.88806, "Lod", "Lod/Lydda in the central coastal plain, later known as Diospolis.", "Approximate", city],
  ["caesarea", "Caesarea (Maritima)", ["Caesarea", "Caesarea Maritima", "קיסריה"], [], ["Caesarea"], 32.5, 34.89167, "Caesarea_Maritima", "Caesarea Maritima, the Herodian harbor city on the Mediterranean coast.", "Established", site],
  ["akko", "Akko", ["Acre", "עכו"], [], ["Akko"], 32.92778, 35.08167, "Acre,_Israel", "Coastal city of Akko/Acre. The ancient tell and later port are separate parts of its settlement history; this is a general city point.", "Approximate", city],
  ["jaffa", "Jaffa", ["Joppa", "Yafo", "יפו"], [], ["Jaffa"], 32.05222, 34.75306, "Jaffa", "Ancient Mediterranean port, now the Jaffa part of Tel Aviv–Yafo.", "Approximate", city],
  ["ashkelon", "Ashkelon", ["Ascalon", "אשקלון"], [], ["Ashkelon"], 31.66194, 34.54611, "Ascalon", "Ancient coastal city at the Ascalon archaeological site.", "Established", site],
  ["damascus", "Damascus", ["Dimashq", "דמשק"], [], ["Damascus"], 33.51306, 36.30944, "Damascus", "Historic city in the oasis east of the Anti-Lebanon mountains, in present-day Syria.", "Approximate", city],
  ["alexandria", "Alexandria in Egypt", ["Alexandria", "Alexandria of Egypt", "אלכסנדריה"], [], ["Alexandria", "Alexandria in Egypt", "Alexandria of Egypt"], 31.1975, 29.8925, "Alexandria", "Mediterranean port founded by Alexander in Egypt.", "Approximate", city],
  ["nineveh", "Nineveh", ["Niniveh", "נינוה"], [], ["Nineveh"], 36.35944, 43.15278, "Nineveh", "Ancient Assyrian city on the east bank of the Tigris, across from historic Mosul.", "Established", site],
  ["tadmor", "Tadmor", ["Palmyra", "תדמור"], [], ["Tadmor"], 34.55139, 38.26806, "Palmyra", "Ancient oasis city of Palmyra in the Syrian desert.", "Established", site],
];

const identificationSources: Record<string, NonNullable<Place["identificationSources"]>> = {
  sura: [{ title: "Sura: location and relationship to Mata Mehasya", url: "https://en.wikipedia.org/wiki/Sura_(city)#Location" }, { title: "Sura Academy: alternative coordinate field", url: "https://en.wikipedia.org/wiki/Sura_Academy" }],
  pumbedita: [{ title: "Encyclopaedia Judaica: Pumbedita (history and geography)", url: "https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/pumbedita" }, { title: "Pumbedita: unresolved location and competing proposals", url: "https://en.wikipedia.org/wiki/Pumbedita#Location" }],
  nehardea: [{ title: "Nehardea: location, history and conflicting coordinate fields", url: "https://en.wikipedia.org/wiki/Nehardea" }],
  mehoza: [{ title: "Michael G. Morony, Encyclopaedia Iranica: Beh-Ardašīr", url: "https://www.iranicaonline.org/articles/beh-ardasir-mid/" }, { title: "Encyclopaedia Judaica: Pumbedita and the move to Mahoza under Rava", url: "https://www.encyclopedia.com/religion/encyclopedias-almanacs-transcripts-and-maps/pumbedita" }],
};

const hebrewArticles: Record<string, string> = {
  usha: "אושא", shefaram: "שפרעם", beitar: "ביתר", haifa: "חיפה", sidon: "צידון",
  gaza: "עזה", antipatris: "תל אפק (אנטיפטריס)", nisibis: "נציבין", sikhnei: "סחנין",
  "gush-halav": "גוש חלב", yodfat: "יודפת (יישוב עתיק)", gamla: "גמלא (יישוב עתיק)",
  "ein-gedi": "עין גדי (יישוב עתיק)", "kefar-sava": "כפר סבא", meron: "מירון הקדומה",
  pamyas: "בניאס (אתר ארכאולוגי)", emmaus: "אמאוס ניקופוליס", carthage: "קרתגו",
  ctesiphon: "קטסיפון", puteoli: "פוצואולי",
};
const hebrewReference = (title: string) => ({
  title: `Hebrew Wikipedia: ${title}`,
  url: `https://he.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`,
});

export const places: Place[] = rows.map(([id, name, aliases, biblical, talmudic, latitude, longitude, article, identification, certainty, coordinateNote]) => ({
  id, name, aliases, latitude, longitude, identification, certainty, coordinateNote,
  identificationSources: hebrewArticles[id]
    ? [...(identificationSources[id] ?? []), hebrewReference(hebrewArticles[id])]
    : identificationSources[id],
  sources: [...biblical.map(name => ({ corpus: "biblical" as const, name })), ...talmudic.map(name => ({ corpus: "talmudic" as const, name }))],
  coordinateSource: id === "yodfat" || id === "gaza"
    ? { ...hebrewReference(hebrewArticles[id]), title: `Hebrew Wikipedia: ${hebrewArticles[id]} (coordinate field)` }
    : { title: `Wikipedia: ${decodeURIComponent(article).replaceAll("_", " ")} (coordinate field)`, url: `https://en.wikipedia.org/wiki/${article}` },
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
