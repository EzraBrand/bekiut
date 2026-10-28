import { describe, expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "./dictionary-format";

describe("Jastrow additions and source apostrophes", () => {
  it.each([
    ["Reallex.", "Reallexikon"],
    ["contradist.", "contradistinction"],
    ["Boraitha", "Baraita"],
    ["Hildesh.", "Hildesheimer"],
    ["Imperat.", "Imperative"],
    ["Brockelm.", "Brockelmann"],
    ["Friedr. Del. Proleg.", "Friedrich Delitzsch, 'Prolegomena eines neuen Hebräisch-Aramäischen Wörterbuchs'"],
    ["Vattom.", "Va-tomer"],
    ["ed. Buxt.", "ed. Buxtorf"],
    ["ed. Lsb.", "ed. Lisbon"],
    ["Ithp.", "Ithpe'el"],
    ["Rabb. in D. S.", "Rabbinovicz in 'Dikdukei Soferim'"],
    ["Löw Aram. Pfl.", "Löw, 'Aramäische Pflanzennamen'"],
    ["ed. Rahm.", "ed. Rahmer"],
    ["Eth. Korb.", "Et Korbani"],
    ["Beth. Nath.", "Beth Nathan"],
    ["anorg.", "inorganic"],
    ["refer. to", "referring to"],
    ["acc.", "accusative"],
    ["hebr.", "Hebrew"],
    ["Euseb.", "Eusebius"],
    ["Onom.", "Onomasticon"],
    ["homilet.", "homiletical"],
    ["Maas Sh.", "Maaser Sheni"],
    ["plur.", "plural"],
    ["imper.", "imperative"],
    ["cit.", "cited"],
    ["ed. Friedm.", "ed. Friedmann"],
    ["Shub.", "Shuvah"],
    ["Pi", "Pi'el"],
    ["Tan. d’be El.", "Tanna Devei Eliyahu"],
    ["Oth.", "Other"], ["Bub.", "Buber"],
    ["Isp. n.", "Ispe'el noun"], ["denomin.", "denominative"],
    ["var.", "variant"], ["dialect.", "dialectal"],
    ["sec.", "second/secondary"], ["Prob.", "Probably"],
    ["Mishn.", "Mishnah"], ["Babyl.", "Babylonian"],
    ["Targ. J.", "Targum Jonathan"], ["R. Joh.", "Rabbi Yohanan"],
    ["ch. V", "chapter 5"],
    ["du.", "dual"], ["Plin. Hist. Nat.", "Pliny, 'Natural History'"],
    ["V)", "5)"], ["Zyt.", "Zhitomir"], ["V;", "5;"], ["Haʿom.", "Ha'omer"],
    ["Amal.", "Amalek"], ["Mill.", "Milluim"], ["Sam. Pent.", "Samaritan Pentateuch"],
    ["dial.", "dialectal"], ["R. H. G.", "Rav Hai Gaon"], ["accus.", "accusative"],
    ["Nithpol.", "Nithpolel"],
  ])("expands %s", (source, target) => {
    expect(expandAbbreviations(source, data.mappings, { jastrowApostrophes: true }))
      .toBe(`<span class="dict-expanded">${target}</span>`);
    expect(expandAbbreviations(source, data.mappings, { jastrowApostrophes: true, display: "original" }))
      .toContain(`data-bdb-expansion="${encodeURIComponent(target)}"`);
  });

  it("keeps longer compounds ahead of newly added component mappings", () => {
    expect(expandAbbreviations("sec. r.", data.mappings))
      .toBe('<span class="dict-expanded">secondary root</span>');
    expect(expandAbbreviations("ed. Bub.", data.mappings))
      .toBe('<span class="dict-expanded">ed. Buber</span>');
    expect(expandAbbreviations("Pine", data.mappings)).toBe("Pine");
  });

  it("does not consume ch. V at the start of longer Roman numerals", () => {
    const output = expandAbbreviations("ch. VI", data.mappings, { jastrowApostrophes: true });
    expect(output).not.toContain(">chapter 5</span>");
    expect(output).toContain(">chapter</span>");
  });

  it.each(["inline", "original"] as const)("protects actual mem-entry transliterations in %s mode", display => {
    // M01564, M00015, M00023, M00132, M00154 in the downloaded source.
    for (const [source, target] of [
      ["m’litsah", "melitsah"], ["m’or", "meor"], ["v’taher", "vetaher"],
      ["v’omer", "veomer"], ["M’goseth", "Megoseth"], ["M’gizah", "Megizah"],
    ]) {
      expect(expandAbbreviations(`<i>${source}</i>`, data.mappings,
        { jastrowApostrophes: true, display })).toBe(`<i>${target}</i>`);
    }
    const protectedText = "one’s fool’s teacher’s don't he's Ta'anit";
    expect(expandAbbreviations(protectedText, {}, { jastrowApostrophes: true, display }))
      .toBe(protectedText);
    expect(expandAbbreviations('S’ah', data.mappings, { jastrowApostrophes: true }))
      .toContain(">Se'ah</span>");
    expect(expandAbbreviations('<a href="/m’or">m’or</a>', {}, { jastrowApostrophes: true }))
      .toBe('<a href="/m’or">meor</a>');
  });
});

it("keeps spacing and compound matches without space-prefixed keys", () => {
  expect(Object.keys(data.mappings).filter(key => key !== key.trimStart())).toEqual([]);
  for (const [source, target] of [["h.", "Hebrew"], ["sing.", "singular"], ["w.", "word"], ["w. fr.", "word from"]]) {
    expect(expandAbbreviations(`before ${source} after`, data.mappings))
      .toBe(`before <span class="dict-expanded">${target}</span> after`);
    expect(expandAbbreviations(`before ${source} after`, data.mappings, { display: "original" }))
      .toContain(`data-bdb-expansion="${encodeURIComponent(target)}"`);
  }
});

it("uses consistent edition labels, retaining the Latin editio princeps", () => {
  for (const [source, target] of Object.entries({
    "ed. Berl.": "ed. Berliner", "ed. Bub.": "ed. Buber",
    "ed. Const.": "ed. Constantinople", "ed. Fr.": "ed. Friedmann",
    "ed. Koh.": "ed. Kohut", "ed. Lag.": "ed. Lagarde",
    "ed. Lehm.": "ed. Lehmann", "ed. pr.": "editio princeps",
    "ed. Wil.": "ed. Vilna", "ed. Zuck.": "ed. Zuckermandel",
  })) {
    expect(expandAbbreviations(source, data.mappings))
      .toBe(`<span class="dict-expanded">${target}</span>`);
  }
});

it("prefers the compound passive participle mapping in דָּבַב II D00039", () => {
  const source = '<i>to speak evil, be hostile</i>, only in part. pass. <span dir="rtl">דָּבוּב</span>';
  const inline = expandAbbreviations(source, data.mappings);
  expect(inline).toContain('only in <span class="dict-expanded">passive participle</span>');
  expect(inline).not.toContain("pass.");
  const original = expandAbbreviations(source, data.mappings, { display: "original" });
  expect(original).toContain('data-bdb-expansion="passive%20participle"');
  expect(original).toContain("part. pass.");
  expect(expandAbbreviations("a part. form", data.mappings))
    .toContain('a <span class="dict-expanded">participle</span> form');
});

it("expands the Miketz, bibliography, and carob mapping additions", () => {
  for (const [key, value] of Object.entries({
    "Mikk.": "Miketz", "Mshp.": "Mishpatim", "Nöld.": "Nöldeke",
    "St. John’s bread": "carob", "Lidd.": "Liddell",
    "Tos’f. Y. Tob": "Tosefot Yom Tov", "Ki Tsetsé": "Ki Teitzei",
    "deriv.": "derivative", "part. pass.": "passive participle",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
  expect(expandAbbreviations("Nöld. Mand. Gr.", data.mappings))
    .toBe(`<span class="dict-expanded">Nöldeke, 'Mandäische Grammatik' (1875)</span>`);
});

it("expands Pirkei d'Rabbi Eliezer and the latest accented and grammatical forms", () => {
  for (const [key, value] of Object.entries({
    "Pirké́ d’R. El.": "Pirkei d'Rabbi Eliezer",
    "Nithpalp.": "Nithpalpel",
    "Ḥull.": "Ḥullin",
    "s. lit.": "under the letter",
    "Holy Days": "Holidays",
    "format.": "formation",
    Chaldean: "Aramaic",
    "Arakḥ.": "Arakḥin",
    "Abbrev.": "Abbreviation",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
});

it("expands the divinity, bibliography, and wording additions", () => {
  for (const [key, value] of Object.entries({
    "X.": "10.", godhead: "divinity", genius: "deity", Thy: "Your",
    "S’liḥ.": "Selichot", "Pu.": "Pu'al", "Sepph.": "Sepphoris",
    "Rabbin.": "Rabbinical", "Semin.": "Seminary", "Koenigr.": "Koenigreich",
    "m’gillah": "megillah", "En Yakob": "Ein Yaakov", "defin.": "definition",
    tautography: "dittography", "Tana d’be El.": "Tanna Devei Eliyahu",
    husbandman: "farmer", "equival.": "equivalent", membrum: "penis",
    "membrum virile": "penis", "Holy day": "Holiday",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
});

it("expands the Pekudei, grammatical, reference, and archaic-word additions", () => {
  for (const [key, value] of Object.entries({
    "P’kudé": "Pekudei",
    "ed. pr.": "editio princeps",
    "Ki Thetse": "Ki Teitzei",
    "T’bul": "Tevul",
    "Semit.": "Semitic",
    "k’ri": "qere",
    milt: "spleen",
    "Lydd.": "Liddell",
    heathen: "pagan",
    "B’haăl.": "Behaalotecha",
    "Aḥăre": "Acharei Mot",
    "anoth.": "another",
    "G’onim": "Geonim",
    "Tshub.": "Teshuvot",
    "cler.": "clerical",
    "Ispe.": "Ispe'el",
    "Freit.": "Freytag",
    makest: "make",
    "part. pass.": "passive participle",
    "M’ah": "Ma'ah",
    "Vayigg.": "Vayigash",
    "Adv.": "Adverb",
    "Rashb.": "Rashbam",
    wert: "were",
    "cacophem.": "cacophemistic (dysphemism)",
    "nom. gent.": "gentilic noun (demonym)",
    "Zuck. Talm. Münz.": "Zuckermann, 'Talmudische Münzen'",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
});

it("expands the Chovah, historical references, wording, and contextual V additions", () => {
  for (const [key, value] of Object.entries({
    "Ḥobah": "Chovah",
    wherewith: "with what",
    antepast: "appetizer",
    luncheon: "meal",
    "Gesch. d. Jud.": "Geschichte der Juden",
    "Gr.": "Greek",
    "Aeth.": "Ethiopic (Ge'ez)",
    "‘Ăbadim": "Avadim",
    "ed. Lehm.": "ed. Lehmann",
    "Hashsh'mini": "Ha-shemini",
    "ed. Fr.": "ed. Friedmann",
    "V (": "5 (",
    "omitt.": "omitted",
    "Vayesh.": "Vayeshev",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
  expect(expandAbbreviations("V (27a)", data.mappings))
    .toBe('<span class="dict-expanded">5 (</span>27a)');
  expect(expandAbbreviations("V", data.mappings)).toBe("V");
});

it("expands Gesammelte Abhandlungen, infinitive, and Penei Moshe", () => {
  for (const [key, value] of Object.entries({
    "Ges. Abh.": "Gesammelte Abhandlungen",
    "infin.": "infinitive",
    "P’né Mosh.": "Penei Moshe",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
});

it("expands tense, Frankel, Hanina, and wording additions", () => {
  for (const [key, value] of Object.entries({
    "fut.": "future (tense)", "Fr. M’bo": "Frankel, Introduction to the Jerusalem Talmud",
    "R. Ḥān.": "Rabbi Hanina", "orig.": "originally", "gener.": "generation", seest: "see",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toBe(`<span class="dict-expanded">${value}</span>`);
  }
});

it("leaves standalone Fr. unchanged and expands the specific Frankel reference", () => {
  expect(expandAbbreviations("Fr.", data.mappings)).toBe("Fr.");
  expect(expandAbbreviations("Fr. Darkhé Mish.", data.mappings))
    .toBe("<span class=\"dict-expanded\">Frankel, 'Darkhei Mishnah'</span>");
});

it("expands the new phrases and contextual Parsha references without trailing colons", () => {
  for (const [key, value] of Object.entries({
    "Eth Korb.": "Et Korbani", "redupl.": "reduplication",
    "Ki Thetsé": "Ki Teitzei", "Var. Lect.": "variant reading",
    Japho: "Jaffa", "ed. Const.": "ed. Constantinople", "dict.": "diction",
    "R’eh": "Re'eh", boughtest: "bought", calumny: "slander",
    hither: "to here", puttest: "put", bot: "bottom (of page)",
    wherefore: "for what reason", bashful: "shy", thereon: "on it",
    "Tanḥ.": "Tanhuma", "Y'lamd.": "Yelamdenu", "Y’lamd.": "Yelamdenu",
  })) {
    expect(expandAbbreviations(key, data.mappings)).toContain(`>${value}</span>`);
  }
  expect(Object.values(data.mappings).filter(value => /:\s*$/.test(value))).toEqual([]);
  for (const locator of ["2", "III", "<i>IV</i>"]) {
    expect(expandAbbreviations(`Par. ${locator}`, data.mappings)).toContain(">Parsha</span>");
  }
  expect(expandAbbreviations("Par.", data.mappings)).toContain(">Parah</span>");
});

it("contains no unchanged mappings and leaves Balak unannotated", () => {
  expect(Object.entries(data.mappings).filter(([key, value]) => key.trim() === value.trim())).toEqual([]);
  expect(expandAbbreviations("Balak", data.mappings)).toBe("Balak");
  expect(expandAbbreviations("Bal.", data.mappings)).toContain(">Balak</span>");
});

const examples = [
  ...Object.entries({
    "Leipz.": "Leipzig", "Shir.": "Shirata", booty: "spoils", canst: "can",
    "Interj.": "Interjection", "Kerith.": "Keritot",
    "Part. Pass.": "passive participle", "part. pass.": "passive participle",
    "S'liḥ.": "Seliḥot", asses: "donkeys", Dibré: "Divrei",
    "Metrol.": "Metrology", et: "and", "Ul'kaḥ.": "U-lekaḥtem",
    "Meg. Taan.": "Megillat Ta'anit", wouldst: "would", hadst: "had",
    "addit.": "additions", "Perf.": "Perfect", "wilt thou": "will you",
    "Arabische und Hebr. in der Anat.": "Arabische und Hebräische in der Anatomie",
    "Bxt.": "Buxtorf", "q. v.": "which see", "abbrev.": "abbreviated/abbreviation",
    "differ.": "different (interpretation)", "interch.": "interchanged/interchangeable",
    "Ithpalp.": "Itpalpel", "onomatop.": "onomatopoeia",
    "Haăz.": "Ha'azinu", sub: "under (the entry)", "M’tsorʿa": "Metzora",
    "tradit.": "traditional", "pronunc.": "pronunciation", "b.  h.": "biblical Hebrew",
    "Thes.": "Thesaurus", whosoever: "whoever", voluptuousness: "licentiousness",
    "Kirchh.": "Kirchheim", harlot: "prostitute", "Krot.": "Krotoschin",
    "Answ.": "Answer", "betw.": "between", "Mick.": "Miketz",
    "Zolk.": "Zolkiew", "Hof.": "Hof'al", "Kor.": "Korach",
    matrix: "womb", indited: "declared", "K’ri": "Qere", Masé: "Masei",
    "B’huck.": "Bechukotai", "V,": "5,", swine: "pig",
    "Dial.": "Dialectal", "metaph.": "metaphorically", "Ruth. R.": "Ruth Rabbah",
    Babel: "Babylon", "Bal.": "Balak", "Pu.": "Pu'al",
    "imperat.": "imperative", "suff.": "suffix", "phras.": "phraseology",
    ye: "you (plural)", proselyte: "convert", proselytes: "converts",
    Israelitish: "Israelite", "ed. Koh.": "ed. Kohut", "art thou": "are you",
    "Luzz. Philox.": "Luzzatto, Philoxenus", "sec. r.": "secondary root",
    "Sh’mini": "Shemini", gentiles: "non-Jews", "Sm.": "Smith", ass: "donkey",
    "Differ.": "Different", "eds.": "editions", "Rab. D. S.": "Rabbinovicz, 'Dikdukei Soferim'",
    "collect.": "collective", "Naḥ.": "Naḥamu", "perh.": "perhaps",
    "explain.": "explaining", standest: "stand",
    "Amst.": "Amsterdam", Ekha: "Eikhah", gheber: "Zoroastrian",
    "Ithpol.": "Ithpolel", "Dehr.": "Dyhernfurth", "Saf.": "Saf'el",
    Vaëra: "Va'era", Dioclet: "Diocletian", "Euphem.": "Euphemism",
    pudenda: "female genitalia", "N’dab.": "Nedavah", "Sh’ma": "Shema",
    "B’ha‘ăl.": "Beha'alotcha", "Or Zar.": "Or Zarua", "N’zikin": "Nezikin",
    shalt: "shall", "K’thib": "Ketiv", "B’midb.": "Bamidbar",
    "Matt.": "Matot",
    "homil.": "homiletically", "Pentat.": "Pentateuch", "the rue": "the Ruta graveolens",
    "neut. v.": "neuter verb", "act. v.": "active verb", intercourse: "sex",
    "marg.": "marginal", doest: "do", "ass-drivers": "donkey-drivers",
    "O.": "Onkelos", "Pesh.": "Peshitta", "Holy Day": "Holiday",
    "Fem.": "Feminine", "Syr.": "Syriac", "Joḥ.": "Yoḥanan",
    "esp.": "especially", "Ges.": "Gesenius", "s. vv.": "under the entries",
    "perf.": "perfect", "the Day of Atonement": "Yom Kippur",
    "interpret.": "interpretation(s)", "Thou art": "You are", Nitsabim: "Nitzavim",
    "Hithpa.": "Hitpa'el", "Pe.": "Pe'al", "Peal.": "Pe'al",
    "Ms. M.": "Manuscript Munich",
    "ch. = h.": "Aramaic, equivalent to Hebrew",
    "Z’ʿera": "Ze'ira", "Pa.": "Pa'el", "Ithpa.": "Itpa'al", "Ithpe.": "Itpe'el",
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
  it("maps multi-letter Roman numerals through 49, preserving citation punctuation", () => {
    const numerals = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x",
      "xi", "xii", "xiii", "xiv", "xv", "xvi", "xvii", "xviii", "xix", "xx",
      "xxi", "xxii", "xxiii", "xxiv", "xxv", "xxvi", "xxvii", "xxviii", "xxix",
      "xxx", "xxxi", "xxxii", "xxxiii", "xxxiv", "xxxv", "xxxvi", "xxxvii", "xxxviii", "xxxix",
      "xl", "xli", "xlii", "xliii", "xliv", "xlv", "xlvi", "xlvii", "xlviii", "xlix"];
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

  it("does not map single-letter numerals or numerals beyond 49", () => {
    for (const source of ["i", "v", "x", "l", "I", "V", "X", "L", "i.", "l.", "li", "LI"]) {
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
    ["ed. Lag.", "ed. Lagarde"],
    ["Ges. H. Dict.", "Gesenius, 'Hebrew Dictionary'"],
    ["Part. pass.", "passive participle"],
    ["Ms. Oxf.", "Manuscript Oxford"],
  ])("preserves the longer contextual mapping %s", (source, expansion) => {
    expect(expandAbbreviations(source, data.mappings)).toBe(`<span class="dict-expanded">${expansion}</span>`);
  });

  it("does not import misleading or ambiguous BDB meanings", () => {
    const mappings = data.mappings as Record<string, string>;
    // acc. is now explicitly requested as accusative and tested above.
    for (const key of ["Rabb.", "Ant.", "defect."]) {
      expect(mappings[key]).toBeUndefined();
    }
  });
});
