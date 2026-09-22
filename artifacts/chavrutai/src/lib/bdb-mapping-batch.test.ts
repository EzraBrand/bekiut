import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import { expandAbbreviations, convertSupTagsToParens } from "./dictionary-format";

const additions = {
  "inscrr.": "inscriptions",
  "Nor (": "Norris (",
  "Bae (Rel.": "Baethgen (Religionsgeschichte",
  "Rev": "Revelation",
  "neut.": "neuter",
  "Ethpa.": "Ethpa'al",
  "ellipt.": "elliptical",
  "(all E)": "(all Elohist source)",
  "Glas": "Glaser",
  "Altsem. Inschr. von Sendschirli": "altsemitischen Inschriften von Sendschirli",
  "Baethgen (Rel": "Baethgen (Religionsgeschichte",
  "Feb.": "February",
  "Hpt (Hbr": "Haupt (Hebraica",
  "onomatop.": "onomatopoeia",
  "monosyll.": "monosyllable",
  "voluntat.": "voluntative",
  "Herodot.": "Herodotus",
  "Ctesias (Pers.": "Ctesias (Persica",
  "Roed.": "Roediger",
  "Thes Add": "Additions to Gesenius’s Thesaurus",
  "foregoing": "previous",
  "(both P)": "(both Priestly source)",
  "Zend": "Middle Persian",
  "Elamit.": "Elamite",
  "Archäol.": "Archäologie",
  "inchoat.": "inchoative",
  "Meyer (E. Jud.": "Meyer (Entstehung des Judenthums",
  "Mey": "Meyer",
  "prev.": "previous",
  "Dagh.": "dagesh",
  "patr.": "patronymic",
  "intens.": "intensive",
  "Kl. Proph.": "Kleine Propheten",
  "E. of": "East of",
  "indir.": "indirect",
  "Lg": "Lagarde",
  "Haupt (Hbr": "Haupt (Hebraica",
  "Matt": "Matthew",
  "Lbg": "Lehrgebäude",
  "(all P)": "(all Priestly source)",
  "intern.": "internal",
  "conjj.": "conjugations",
  "Talm": "Talmud(ic)",
  "Nöldeke (Mand": "Nöldeke (Mandäische grammatik",
  "Art thou": "Are you",
  "art thou": "are you",
  "Böttcher (Ä": "Böttcher (Ährenlese",
  "var. adj. and pts.": "various adjectives and participles",
  "only P": "only Priestly source",
  "(all J)": "(all Yahwist source)",
  "𝔊B": "LXX (Septuagint), Codex Vaticanus",
  "𝔊A": "LXX (Septuagint), Codex Alexandrinus",
  "harlot": "prostitute",
  "harlotry": "prostitution",
  "transpos.": "transposition",
  "S.E.": "south-east",
  "gen.": "general(ly)",
  "specif.": "specific(ally)",
  "Messian.": "Messianic",
  "festal": "celebratory",
  "Wellhausen (Comp.": "Wellhausen (Composition des Hexateuchs",
  "prop.": "proposes",
  "crit. n.": "critical note(s)",
  "insignif.": "insignificant",
  "§": "section",
  "(f.)": "(feminine)",
  "Müller (Sendsch.": "Müller (Inschriften von Sendschirli",
  "Bericht d. sächs. G. d. W.": "Berichte der Sächsischen Gesellschaft der Wissenschaften",
  "Alttest. Untersuch.": "Alttestamentliche Untersuchungen",
  "postex.": "post-exilic",
  "post-exil.": "post-exilic",
  "Primit.": "Primitive",
  "Août-Sept.": "August–September",
  "Pleon.": "Pleonastic",
  "KlPr": "Kleine Propheten",
  "Conc.": "Concordance",
  "Tob": "Tobit",
  "Urschr.": "Urschrift",
  "Univ. Pa. Exp.": "University of Pennsylvania Expedition",
  "hippop.": "hippopotamus",
  "De aleph prosthetico in ling. aeg.": "De Aleph Prosthetico in Lingua Aegyptiaca",
  "J.Aram": "Jewish Aramaic",
  "Liḥy.": "Liḥyanite",
  "compar.": "comparison",
  "extraord.": "extraordinary",
  "Kuenen (Ond.": "Kuenen (Onderzoek",
  "voc.": "vocative",
  "ZWTh": "Zeitschrift für wissenschaftliche Theologie",
  "n.[m.]": "noun[masculine]",
  "n.[f.]": "noun[feminine]",
  "Herod.": "Herodotus",
  "Nos.": "Numbers",
  "Bib. Sac.": "Bibliotheca Sacra",
  "predom.": "predominates",
  "Lexx": "Lexicons",
  "Gi": "Giesebrecht",
  "Vogelst": "Vogelstein",
  "Gesch. Alt.": "Geschichte des Altertums",
  "Hommel (A. u. A.": "Hommel (Aufsätze und Abhandlungen",
  "Tel Am.": "Tell el-Amarna",
  "BM": "British Museum",
  "Hartm": "Hartmann",
  "Plurilit.-bildungen": "Pluriliteralbildungen",
  "Am": "Amos",
  "Dan.": "Daniel",
  "H D": "Holiness Code ; Deuteronomy",
  "Hab.": "Habakkuk",
  "Lgb": "Lehrgebäude",
  "interp.": "interpretation",
  "dagh.": "dagesh",
  "Nebuchadn.": "Nebuchadnezzar",
  "Nebuch.": "Nebuchadnezzar",
  "Gesch": "Geschichte",
  "Calwer BL": "Calwer Bibellexikon",
  "Mas. Magna": "Masorah Magna",
  "Cod. Nasar.": "Codex Nasaraeus",
  "trad.": "tradition(al)",
  "Nab": "Nabataean",
  "Pliny (NH": "Pliny (Natural History",
  "contumely": "insulting language",
  "Hb": "Habakkuk",
  "indeterm.": "indeterminate",
  "recipr.": "reciprocal",
  "appellat.": "appellatively",
  "Ne (Margin": "Nestle, Marginalien",
  "Hithpoʿl": "Hithpo'el",
  "format.": "formation",
  "cerem.": "ceremonial",
  "predict.": "prediction",
  "Enc Bi": "Encyclopedia Biblica",
  "Euphr.": "Euphrates",
  "Monatsschr.": "Monatsschrift",
  "oftener": "more often",
  "whence": "from which",
  "alternat.": "alternative",
  "Nithp.": "Nithpa'el",
  "Naz.": "Nazirite",
  "JThS": "Journal of Theological Studies",
  "Zeitschr.": "Zeitschrift",
  "h. p.": "High Priest",
  "Arab. Des.": "Arabia Deserta",
  "untransl.": "untranslated",
  "hyperb.": "hyperbolically",
  "n. unit.": "unit noun",
  "Fév.-Mars.": "February-March",
  "Pilp.": "Pilpel",
  "mythol.": "mythological",
  "supernat.": "supernatural",
  "Völkerpsychol.": "Völkerpsychologie",
  "Wellhausen (de Gent.": "Wellhausen (De Gentibus",
  "odorif.": "odoriferous",
  "Ḳam": "al-Qāmūs",
  "Frey": "Freytag",
  "2 K": "2 Kings",
  "attrib.": "attributive",
  "Mo (Phoen.": "Movers, Die Phönizier",
  "Sinait.": "Sinaitic",
  "Ezek": "Ezekiel",
  "theoph.": "theophany",
  "prohib.": "prohibition",
  "abbr.": "abbreviated",
  "Sam": "Samuel",
  "Philist.": "Philistia",
  "Sém.": "Sémitique",
  "distrib.": "distributive",
  "Verba. denom.": "Verba denominativa",
  "Chr-Pal.-Aramaic": "Christian Palestinian Aramaic",
  "Chr Pal. Aramaic": "Christian Palestinian Aramaic",
  "Nov. Psalt. Spec.": "Novae Psalterii Graeci",
  "Ne": "Nehemiah",
  "Vergl. Sem. Gram.": "Vergleichende semitische Grammatik",
  "aphaer.": "aphaeresis",
};

describe("BDB September 20 mappings", () => {
  it.each(["De Rossi", "<em>De</em> Rossi", "Am I my brother’s keeper?", "<em>Am</em> I my brother’s keeper?"])(
    "preserves the literal phrase %s",
    (text) => expect(expandAbbreviations(text, bdbData.mappings)).toBe(text),
  );

  it("preserves legitimate De and Am citations and exact phrase boundaries", () => {
    expect(expandAbbreviations("De; Am; De Rossini; Am II", bdbData.mappings)).toBe(
      '<span class="dict-expanded">Delitzsch</span>; <span class="dict-expanded">Amos</span>; <span class="dict-expanded">Delitzsch</span> Rossini; <span class="dict-expanded">Amos</span> II',
    );
  });

  it("distinguishes Latin num? from grammatical num.", () => {
    expect(expandAbbreviations("<em>num?</em>; num.", bdbData.mappings)).toBe(
      '<em>num?</em>; <span class="dict-expanded">numeral</span>',
    );
  });

  it("expands the new work citations after superscript conversion", () => {
    for (const citation of ["68", "67.68"]) {
      expect(expandAbbreviations(convertSupTagsToParens(`Bae<sup>Rel. ${citation}</sup>`), bdbData.mappings))
        .toBe(`<span class="dict-expanded">Baethgen (Religionsgeschichte</span> ${citation})`);
    }
    expect(expandAbbreviations("Rel.; Bae", bdbData.mappings))
      .toBe('<span class="dict-expanded">Reland</span>; <span class="dict-expanded">Baethgen</span>');
    expect(expandAbbreviations(convertSupTagsToParens("Hpt<sup>Hbr 1885, 224</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Haupt (Hebraica</span> 1885, 224)');
    expect(expandAbbreviations(convertSupTagsToParens("Baethgen<sup>Rel</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Baethgen (Religionsgeschichte</span>)');
    expect(expandAbbreviations(convertSupTagsToParens("Ctesias<sup>Pers.</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Ctesias (Persica</span>)');
  });
  it("preserves both direction mappings in running text", () => {
    expect(expandAbbreviations("S.E. of Arabah; E. of Arabah; S.E.", bdbData.mappings)).toBe(
      '<span class="dict-expanded">south-east</span> of Arabah; <span class="dict-expanded">East of</span> Arabah; <span class="dict-expanded">south-east</span>',
    );
  });

  it("expands source-style directions beside multiword scholar citations", () => {
    // BDB שֵׂעִיר uses "E. of Arabah"; citations reach the matcher after sup conversion.
    const source = 'S.E. of Arabah; E. of Arabah; Haupt <sup>Hbr</sup>; Nöldeke<sup>Mand</sup>; prev.';
    expect(expandAbbreviations(convertSupTagsToParens(source), bdbData.mappings)).toBe(
      '<span class="dict-expanded">south-east</span> of Arabah; <span class="dict-expanded">East of</span> Arabah; <span class="dict-expanded">Haupt (Hebraica</span>); <span class="dict-expanded">Nöldeke (Mandäische grammatik</span>); <span class="dict-expanded">previous</span>',
    );
  });

  it.each(Object.entries(additions))("expands %s exactly", (key, value) => {
    expect(expandAbbreviations(key, bdbData.mappings))
      .toBe(`<span class="dict-expanded">${value}</span>`);
  });

  it("prioritizes contextual phrases over shorter abbreviations", () => {
    const result = expandAbbreviations("Tel Am.; Am; Ne (Margin; Ne; 2 K", bdbData.mappings);
    for (const value of ["Tell el-Amarna", "Amos", "Nestle, Marginalien", "Nehemiah", "2 Kings"]) {
      expect(result).toContain(`>${value}</span>`);
    }
  });

  it("matches contextual citations after superscript conversion", () => {
    expect(expandAbbreviations(convertSupTagsToParens("Meyer<sup>E. Jud.</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Meyer (Entstehung des Judenthums</span>)');
    expect(expandAbbreviations(convertSupTagsToParens("Haupt <sup>Hbr</sup>"), bdbData.mappings))
      .toContain(">Haupt (Hebraica</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Nöldeke<sup>Mand</sup>"), bdbData.mappings))
      .toContain(">Nöldeke (Mandäische grammatik</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Böttcher <sup>Ä</sup>"), bdbData.mappings))
      .toContain(">Böttcher (Ährenlese</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Wellhausen <sup>Comp.</sup>"), bdbData.mappings))
      .toContain(">Wellhausen (Composition des Hexateuchs</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Müller<sup>Sendsch.</sup>"), bdbData.mappings))
      .toContain(">Müller (Inschriften von Sendschirli</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Hommel <sup>A. u. A.</sup>"), bdbData.mappings))
      .toContain(">Hommel (Aufsätze und Abhandlungen</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Kuenen<sup>Ond.</sup>"), bdbData.mappings))
      .toContain(">Kuenen (Onderzoek</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Ne <sup>Margin</sup>"), bdbData.mappings))
      .toContain(">Nestle, Marginalien</span>");
    expect(expandAbbreviations(convertSupTagsToParens("Pliny<sup>NH</sup>"), bdbData.mappings))
      .toContain(">Pliny (Natural History</span>");
  });

  it("does not replace short keys inside longer words", () => {
    const text = "America Neapolis Samuel Ezekiel Hartmann Freytag";
    expect(expandAbbreviations(text, bdbData.mappings)).toBe(text);
  });
});