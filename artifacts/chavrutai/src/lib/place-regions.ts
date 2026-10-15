import type { MapRegion } from "@/components/places/map-regions";

// Editorial geographic groupings, independent of map viewport rectangles.
// Judea includes the Jerusalem/Benjamin hill-country sites; Galilee includes
// Upper and Lower Galilee. Land of Israel is the broader browsing group.
const groups: Record<Exclude<MapRegion, "all">, readonly string[]> = {
  israel: [
    "usha", "shefaram", "beitar", "haifa", "gaza", "antipatris", "sikhnei",
    "gush-halav", "yodfat", "gamla", "ein-gedi", "kefar-sava", "meron", "pamyas",
    "emmaus", "shechem", "beit-shearim", "bethel", "shiloh", "samaria", "gath",
    "zorah", "jerusalem", "jericho", "hebron", "beersheba", "bethlehem", "tiberias",
    "tzippori", "beit-shean", "yavne", "lod", "caesarea", "akko", "jaffa", "ashkelon",
    "temple-mount", "gibeon", "ono", "beit-horon", "hammat-tiberias", "mount-gerizim",
    "sea-of-galilee",
  ],
  judea: [
    "jerusalem", "temple-mount", "gibeon", "beit-horon", "beitar", "hebron",
    "bethlehem", "jericho", "ein-gedi", "emmaus", "zorah",
  ],
  galilee: [
    "usha", "shefaram", "sikhnei", "gush-halav", "yodfat", "meron",
    "beit-shearim", "tiberias", "tzippori", "hammat-tiberias", "sea-of-galilee", "akko",
  ],
  babylonia: ["sura", "pumbedita", "nehardea", "mehoza", "ctesiphon", "borsippa"],
  syria: ["antioch", "damascus", "tadmor"],
  anatolia: ["cappadocia"],
};

export function regionsForPlace(id: string): Exclude<MapRegion, "all">[] {
  return (Object.keys(groups) as Exclude<MapRegion, "all">[]).filter(region => groups[region].includes(id));
}
