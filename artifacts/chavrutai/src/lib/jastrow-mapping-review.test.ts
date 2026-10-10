import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "./dictionary-format";

const examples = [
  ...Object.entries({
    "a.": "and", "ident.": "identical", "Mss.": "manuscripts", camest: "came",
    "T’fillah": "Tefillah", "O Lord": "O God", "fem.": "feminine",
    "an ass": "a donkey", thine: "your",
    "Nif.": "Nif'al", "Nithpa.": "Nitpa'el", "Pi.": "Pi'el", "Hif.": "Hif'il",
    "S’ah": "Se'ah", "Du.": "Dual", Kab: "Kav", "Pol.": "Polel",
    Akiba: "Akiva", coition: "sex", "thou wilt": "you will", Law: "Torah",
    sodomy: "homosexual sex", "Shaf.": "Shaf'el", "K’dosh.": "Kedoshim",
    m: "masculine", "ab.": "above", "Var. lect.": "variant reading(s)",
    "Lat.": "Latin", "V’zoth": "Ve-zot", therewith: "with them",
    thee: "you", "Y’rushalmi": "Yerushalmi",
    "Frequ.": "Frequently", Ekeb: "Eikev",
    "h.": "Hebrew", "c.": "Aramaic", "Haf.": "Haf'el",
    thyself: "yourself", "neut.": "neuter", "act. verb": "action verb",
    "Baḥod.": "Baḥodesh", "Gramm.": "Grammatical", "X,": "10,",
    hereafter: "afterlife", dost: "do", "thou art": "you are",
    "Ittaf.": "Ittafal", "Ithaf.": "Ithafal", "Matt. K.": "Matnot Kehunah",
    "T’rumah": "Terumah", "Sh’mʿa": "Shema", infra: "below",
    Rab: "Rav", "Af.": "Af'el", mayest: "may",
  }).map(([source, expansion]) => [source, source, expansion]),
  ["√ אמר", "√", "root"],
  ["s. 3", "s.", "section"],
  ["w. אמר", "w.", "word"],
  ["V. אמר", "V.", "See"],
  ["(Chaldaism)", "Chaldaism", "Aramaism"],
  ["Pl. אבות", "Pl.", "Plural"],
  ["K’doshim", "K’doshim", "Kedoshim"],
  ["bibl. Hebrew", "bibl.", "biblical"],
  ["&c.", "&c.", "etc."],
  ["pl. constr. רָטְנֵי", "constr.", "construct form"],
  ["(sing. אב הנזק)", "sing.", "singular"],
  [", inf. בּוּת", "inf.", "infinitive"],
  ["—Inf. לוֹמַר", "Inf.", "Infinitive"],
  ["(transpos. of אסכנא)", "transpos.", "transposition"],
  ["as an etymol. of אֲמַרְכָּל", "etymol.", "etymology"],
  ["contemp. of R. Ashé", "contemp.", "contemporary"],
  ["(geogr.) place, town", "geogr.", "geographical"],
  ["(Geogr.) air-line", "Geogr.", "geographical"],
  ["Hithpol. הִתְחוֹטֵט", "Hithpol.", "Hithpolel"],
  ["Dict. s. v.", "Dict.", "Dictionary"],
  ["v. H. Dict. s. v. אֶשֶׁד", "H. Dict.", "Hebrew Dictionary"],
  ["Meïl. VI, 1", "Meïl.", "Meilah"],
  ["—Esp. to be in a comatose condition", "Esp.", "especially"],
  ["preced. wds.", "wds.", "words"],
  ["quot. s. v. מַשְׁכּוֹן", "quot.", "quoted"],
  ["v. Lag. Proph. I", "Lag.", "Lagarde"],
  ["Chald. transl. of", "transl.", "translation"],
];

describe("Jastrow corpus-reviewed additions", () => {
  it.each(["27a", "27ᵃ", "27<sup>a</sup>", "27", '<a href="/x">27a</a>', "&nbsp;27a"])(
    "expands I, before page locator %s",
    page => {
      const source = `Y. ib. I, ${page}`;
      expect(expandAbbreviations(source, data.mappings)).toContain('>1,</span>');
      expect(expandAbbreviations(source, data.mappings, { display: "original" }))
        .toContain('data-bdb-source="I%2C" data-bdb-expansion="1%2C"');
    },
  );
  it.each(["I,", "I, however", "I, 27words", "I, <br>27a", "I", "I.", "I, III"])(
    "does not apply the page-locator rule to %s",
    source => {
      const output = expandAbbreviations(source, data.mappings);
      expect(output).not.toContain('>1,</span>');
      expect(output).toContain("I");
    },
  );

  it.each(["3", "29", "III", "iii", "I", "X", "XL", "<i>III</i>", '<a href="/x">III</a>', "&nbsp;III"])(
    "reads ch. before %s as chapter in both display modes",
    number => {
      const source = `Sifra K’dosh. ch. ${number}, Par. 2`;
      expect(expandAbbreviations(source, data.mappings)).toContain('>chapter</span>');
      const original = expandAbbreviations(source, data.mappings, { display: "original" });
      expect(original).toContain('data-bdb-source="ch." data-bdb-expansion="chapter"');
      expect(original).not.toContain('data-bdb-expansion="Aramaic"');
    },
  );

  it.each(["ch.", "ch. word", "ch. mixed", "ch. <i>dialect</i>", "ch.<br> III"])(
    "retains the language meaning in %s",
    source => {
      expect(expandAbbreviations(source, data.mappings)).toContain('>Aramaic</span>');
    },
  );

  it("does not expand m inside words", () => {
    const source = "time form Aramaic";
    expect(expandAbbreviations(source, data.mappings)).toBe(source);
    expect(expandAbbreviations("(m)", data.mappings))
      .toBe('(<span class="dict-expanded">masculine</span>)');
  });
  it("maps multi-letter Roman numerals through 29, preserving citation punctuation", () => {
    const numerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
      "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx",
      "xxi", "xxii", "xxiii", "xxiv", "xxv", "xxvi", "xxvii", "xxviii", "xxix"];
    numerals.forEach((numeral, index) => {
      if (numeral.length === 1) return;
      for (const source of [numeral, numeral.toUpperCase()]) {
        expect(expandAbbreviations(`${source}.`, data.mappings))
          .toBe(`<span class="dict-expanded">${index + 1}</span>.`);
        expect(expandAbbreviations(source, data.mappings, { display: "original" }))
          .toContain(`data-bdb-expansion="${index + 1}"`);
      }
    });
  });

  it("does not map single-letter numerals or numerals beyond 29", () => {
    for (const source of ["i", "v", "x", "l", "I", "V", "X", "L", "i.", "l.", "xxx", "XXX"]) {
      expect(expandAbbreviations(source, data.mappings)).toBe(source);
    }
    // Existing reference abbreviation, not a numeral.
    expect(data.mappings["V."]).toBe("See");
  });

  it.each(examples)("explains source context %s in both display modes", (source, abbreviation, expansion) => {
    const original = expandAbbreviations(source, data.mappings, { display: "original" });
    expect(original).toContain(`data-bdb-source="${encodeURIComponent(abbreviation)}"`);
    expect(original).toContain(`data-bdb-expansion="${encodeURIComponent(expansion)}"`);
    expect(expandAbbreviations(source, data.mappings)).toContain(`>${expansion}</span>`);
  });

  it.each([
    ["s. v.", "under the word"],
    ["w. fr.", "word from"],
    ["preced. w.", "preceding word"],
    ["corr. acc.", "correct accordingly"],
    ["Rabb. D. S.", "Rabbinowicz, 'Dikdukei Sofrim'"],
    ["Sm. Ant.", "Smith, 'Dictionary of Greek and Roman Antiquities'"],
    ["ed. Lag.", "Lagarde edition"],
    ["Ges. H. Dict.", "Gesenius, 'Hebrew Dictionary'"],
    ["Part. pass.", "passive participle"],
    ["Ms. Oxf.", "Manuscript Oxford:"],
  ])("preserves the longer contextual mapping %s", (source, expansion) => {
    expect(expandAbbreviations(source, data.mappings)).toBe(`<span class="dict-expanded">${expansion}</span>`);
  });

  it("does not import misleading or ambiguous BDB meanings", () => {
    const mappings = data.mappings as Record<string, string>;
    for (const key of ["acc.", "Rabb.", "Sm.", "Ant.", "defect."]) {
      expect(mappings[key]).toBeUndefined();
    }
  });
});
