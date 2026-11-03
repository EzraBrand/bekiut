import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "./dictionary-format";

describe("Jastrow canonical display names", () => {
  it.each([
    ["Ḥull.", "Chullin"], ["Ḥull.", "Chullin"],
    ["Ḥag.", "Chagigah"], ["Ḥall.", "Challah"],
    ["Bech.", "Bekhorot"], ["Arakḥ.", "Arakhin"],
    ["Men.", "Menachot"], ["Pes.", "Pesachim"],
    ["Zeb.", "Zevachim"], ["Toh.", "Tahorot"],
    ["Mikv.", "Mikvaot"], ["Ukts.", "Oktzin"],
    ["Lekh.", "Lech Lecha"], ["Tol’d.", "Toldot"],
    ["B’haăl.", "Beha'alotcha"], ["Metsor.", "Metzora"],
    ["Vaëra", "Vaera"], ["Sh’mini", "Shmini"],
    ["Aḥăre", "Achrei Mot"], ["Sh'laḥ", "Sh'lach"],
    ["Haăz.", "Ha'Azinu"], ["B'resh.", "Bereshit"],
    ["Gen. R.", "Bereshit Rabbah"], ["Ex. R.", "Shemot Rabbah"],
    ["Lev. R.", "Vayikra Rabbah"], ["Num. R.", "Bamidbar Rabbah"],
    ["Deut. R.", "Devarim Rabbah"], ["Lam. R.", "Eikhah Rabbah"],
    ["Tanḥ.", "Midrash Tanchuma"], ["Tanḥ. ed. Bub.", "Midrash Tanchuma Buber"],
    ["Pirkê d'R. El.", "Pirkei DeRabbi Eliezer"],
    ["Ab. d'R. N.", "Avot DeRabbi Natan"],
    ["Sef. Yets", "Sefer Yetzirah"], ["Hal. Gedol.", "Halakhot Gedolot"],
    ["Sheilt. d’R. Aḥai", "Sheiltot d'Rav Achai Gaon"],
    ["Tos’f. Y. Tob", "Tosafot Yom Tov"],
    ["Tossaf.", "Tosafot"], ["Tosaf.", "Tosafot"],
    ["M'bo", "Frankel, 'Introduction to Talmud Yerushalmi'"],
    ["q. v.", "which see"], ["q.v.", "which see"],
  ])("%s expands to %s", (source, target) => {
    expect(expandAbbreviations(source, data.mappings)).toContain(`>${target}</span>`);
  });

  it("removes the five retired mappings", () => {
    for (const key of ["I (b. h.", "II (b. h.", "III (b. h.", "a. e.—", "Frank."]) {
      expect(data.mappings).not.toHaveProperty(key);
    }
  });
});
