import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import { convertSupTagsToParens, expandAbbreviations } from "./dictionary-format";

const pairs = [
  ["WR", "Wright"],
  ["Zech.", "Zechariah"],
  ["MA", "Mission archéologique"],
  ["n.pr.m. & f.", "noun proper masculine & feminine"],
  ["(S)", "(Samuel)"],
  ["Bä (Rel.", "Baethgen (Religionsgeschichte"],
  ["inanim.", "inanimate"],
  ["Fleisch.", "Fleischer"],
  ["n.pr.[m.]", "noun proper [masculine]"],
  ["parallelopip.", "parallelepiped"],
  ["necrom.", "necromancer"],
  ["Loftus (CS", "Loftus (Chaldaea and Susiana"],
  ["Luth", "Luther"],
  ["𝔖", "Syriac (Peshitta)"],
  ["Bab.", "Babylonia(n)"],
  ["Babyl.", "Babylonia(n)"],
  ["n.[m.]", "noun [masculine]"],
  ["Ps-Jon", "Pseudo-Jonathan"],
  ["Hithpōʿl", "Hithpo'el"],
  ["Luzz", "Luzzato"],
  ["Carpentr.", "Carpentras"],
  ["signif.", "signification"],
  ["Amal.", "Amalek"],
  ["Urg.", "Urgeschichte"],
  ["fam.", "family"],
  ["pentam.", "pentameter"],
  ["Des.", "Desert"],
  ["Complut. Var.", "Complutensische Varianten"],
  ["Hist. Anim.", "Historia Animalium"],
  ["Nebuchadr.", "Nebuchadnezzar"],
  ["Kl. Beiträge zur Lexicogr.", "Kleine Beiträge zur Lexicographie"],
  ["illustr.", "illustrated"],
  ["Amh.", "Amharic"],
  ["prelim.", "preliminary"],
  ["anthrop.", "anthropomorphism"],
  ["Hiph.", "Hiph'il"],
  ["Tiph.", "Tiph'il"],
  ["Stellung Isr. zu d. Fremden", "Stellung der Israeliten zu den Fremden"],
  ["ENE.", "east-northeast"],
  ["WSW.", "west-southwest"],
  ["indic.", "indicate"],
  ["emblemat.", "emblematic"],
  ["Hiob", "Job"],
  ["Steph. Byz.", "Stephanus of Byzantium"],
  ["Südar. Chrest.", "Südarabische Chrestomathie"],
  ["Niph.", "Niph'al"],
  ["Pu.", "Pu'al"],
  ["Hoph.", "Hoph'al"],
  ["Hithp.", "Hithpa'el"],
  ["vb.Niph.", "verb Niph'al"],
  ["defect.", "defective"],
  ["As. u. Eur.", "Asien und Europa"],
  ["§§", "subsection"],
  ["Dioscor", "Dioscorides"],
  ["De Mater. Med.", "De Materia Medica"],
  ["Hist. Plant.", "Historia Plantarum"],
  ["Plin (NH", "Pliny (Natural History"],
  ["Ph. Spr.", "phönizische Sprache"],
  ["Ethpe.", "Ethpe'el"],
  ["Pōʿ.", "Po'el"],
  ["mont.", "mountain"],
  ["Bab. Rel.", "Babylonische Religion"],
  ["Arab. Dichter", "Arabische Dichter"],
  ["prægn.", "pregnant"],
  ["redund.", "redundant"],
  ["implic.", "implication"],
  ["ff.", "and on"],
  ["high-p.", "High Priest"],
  ["Hothp.", "Hothpa'al"],
  ["n.pl.[m.]", "noun plural [masculine]"],
  ["bullocks", "bulls"],
  ["bullock", "bull"],
  ["m. et. f.", "masculine and feminine"],
  ["RÉJ", "Revue des Études Juives"],
  ["A. u. A.", "Aufsätze und Abhandlungen"],
  ["milch", "milk"],
  ["Cp.", "Compare"],
  ["dist.", "distinct"],
  ["Phön.", "Phönizier"],
  ["Lam.", "Lamech"],
  ["Sab Denkm", "Sabäische Denkmäler"],
  ["Prol. Assyr. Gr.", "Prolegomena to Assyrian Grammar"],
  ["PEQ", "Palestine Exploration Quarterly"],
  ["h. priest", "High Priest"],
  ["TelAm", "Tell el-Amarna"],
  ["ÄZ", "Ägyptische Zeitschrift"],
  ["vocaliz.", "vocalization"],
  ["conseq.", "consequence"],
  ["periph.", "periphrasis"],
];

describe("BDB citation and vocabulary additions", () => {
  it("expands adjacent version sigla in the Edom passage", () => {
    expect(expandAbbreviations('𝔊𝔖, v.', bdbData.mappings)).toContain(
      '<span class="dict-expanded">LXX (Septuagint)</span><span class="dict-expanded">Syriac (Peshitta)</span>,',
    );
    expect(expandAbbreviations('a𝔖 𝔖a', bdbData.mappings)).toBe('a𝔖 𝔖a');
    expect(expandAbbreviations('<a title="𝔊𝔖">𝔊𝔖</a>', bdbData.mappings))
      .toContain('<a title="𝔊𝔖"><span class="dict-expanded">LXX (Septuagint)</span>');
  });
  it("expands new work citations after superscript conversion", () => {
    const html = expandAbbreviations(convertSupTagsToParens('Bä<sup>Rel. 10</sup>; Loftus<sup>CS 12</sup>'), bdbData.mappings);
    expect(html).toContain('Baethgen (Religionsgeschichte</span> 10)');
    expect(html).toContain('Loftus (Chaldaea and Susiana</span> 12)');
  });
  it("expands the contextual Pliny citation after superscript conversion", () => {
    expect(expandAbbreviations(convertSupTagsToParens("Plin<sup>NH 12</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Pliny (Natural History</span> 12)');
  });
  it.each(pairs)("expands %s as %s with the full mapping set", (key, value) => {
    expect(expandAbbreviations(key, bdbData.mappings))
      .toBe(`<span class="dict-expanded">${value}</span>`);
  });

  it("keeps a longer work title intact before expanding its components", () => {
    expect(expandAbbreviations(convertSupTagsToParens("Prol. Assyr. Gr.<sup>12</sup>"), bdbData.mappings))
      .toBe('<span class="dict-expanded">Prolegomena to Assyrian Grammar</span> (12)');
  });

  it("does not replace text in attributes or inside longer words", () => {
    const text = '<a title="PEQ">xPEQ PEQx</a>';
    expect(expandAbbreviations(text, bdbData.mappings)).toBe(text);
  });

  it("handles singular and plural bullock independently without matching longer words", () => {
    expect(expandAbbreviations("bullock bullocks bullockish", bdbData.mappings))
      .toBe('<span class="dict-expanded">bull</span> <span class="dict-expanded">bulls</span> bullockish');
  });
});