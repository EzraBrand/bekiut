import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import jastrowData from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "@/lib/dictionary-format";

const mappings = bdbData.mappings;
const jastrowMappings = jastrowData.mappings;

describe("BDB abbreviation expansion", () => {
  it("resolves overlaps leftmost first, then longest at the same position", () => {
    // Deliberately put the longer, later-starting key first.
    const overlapping = { "E. of": "East of", "S.E.": "south-east", "S.": "south" };
    expect(expandAbbreviations("S.E. of; E. of; S.E.", overlapping)).toBe(
      '<span class="dict-expanded">south-east</span> of; <span class="dict-expanded">East of</span>; <span class="dict-expanded">south-east</span>',
    );
    expect(expandAbbreviations("S.E. of", Object.fromEntries(Object.entries(overlapping).reverse())))
      .toBe('<span class="dict-expanded">south-east</span> of');
  });

  it("keeps contextual scholar citations and neighboring keys separate", () => {
    const overlapping = {
      "Lag": "Lagarde", "Lag (M.": "Lagarde (Mittheilungen",
      "M.": "other", "S.E.": "south-east", "E. of": "East of",
    };
    expect(expandAbbreviations("Lag (M. i. 255); S.E. of; E. of", overlapping)).toBe(
      '<span class="dict-expanded">Lagarde (Mittheilungen</span> i. 255); <span class="dict-expanded">south-east</span> of; <span class="dict-expanded">East of</span>',
    );
  });

  it("checks original Unicode boundaries rather than newly inserted markup", () => {
    const text = "αE. of; אE. of; e\u0301E. of; E. ofא; E. of\u0301";
    expect(expandAbbreviations(text, { "E. of": "East of" })).toBe(text);
    expect(expandAbbreviations("+word", { "+": "plus", word: "WORD" }))
      .toBe('<span class="dict-expanded">plus</span><span class="dict-expanded">WORD</span>');
  });

  it("isolates HTML attributes and never matches phrases across tags", () => {
    expect(expandAbbreviations('<a title="S.E. of">S.E. of</a> E.<em> of</em>', {
      "S.E.": "south-east", "E. of": "East of",
    })).toBe('<a title="S.E. of"><span class="dict-expanded">south-east</span> of</a> E.<em> of</em>');
  });

  it("expands the split bold noun label from BDB זֵק³", () => {
    const source = '<big>[<span dir="rtl">זֵק</span>]</big>  <strong>n.</strong>[<strong>m.</strong>] <strong>fetter</strong>';
    expect(expandAbbreviations(source, mappings)).toBe(
      '<big>[<span dir="rtl">זֵק</span>]</big>  <strong><span class="dict-expanded">noun[masculine]</span></strong> <strong>fetter</strong>',
    );
  }, 15000); // Full-map regex initialization can exceed 5s under parallel workspace tests.

  it("also handles split feminine labels and preserves unmapped labels", () => {
    const source = '<b>n.</b>[<b>f.</b>]';
    expect(expandAbbreviations(source, mappings))
      .toBe('<b><span class="dict-expanded">noun[feminine]</span></b>');
    expect(expandAbbreviations(source, {})).toBe(source);
    expect(expandAbbreviations('<strong>n.</strong><strong>m.</strong>', {}))
      .toBe('<strong>n.</strong><strong>m.</strong>');
  });

  it("leaves standalone m. unchanged while retaining specific grammatical mappings", () => {
    expect(expandAbbreviations("m.", mappings)).toBe("m.");
    expect(expandAbbreviations("2 m. s.", mappings))
      .toBe('<span class="dict-expanded">2nd-person masculine singular</span>');
    expect(expandAbbreviations("n.m.", mappings))
      .toBe('<span class="dict-expanded">noun masculine</span>');
  });

  it.each([
    ["geneal.", "genealogical"],
    ["post-ex.", "post-exilic"],
    ["Apr.", "April"],
    ["NNW.", "north-northwest"],
    ["redupl.", "reduplication"],
    ["explan.", "explanation"],
    ["unintelling.", "unintelligible"],
    ["ch.", "chapter"],
    ["idolatr.", "idolatrous"],
    ["metath.", "metathesis"],
    ["collat.", "collateral"],
    ["d. f.", "dagesh forte"],
    ["interr.", "interrogative"],
    ["eschatol.", "eschatological"],
    ["Periphr.", "Periphrasis"],
    ["Odyss.", "Odyssey"],
    ["Il.", "Iliad"],
    ["Michl.", "Michlol"],
    ["thou art", "you are"],
    ["condit.", "conditional"],
    ["Präp.", "Präposition"],
    ["prons.", "pronouns"],
    ["U. and Th.", "Urim and Thumim"],
    ["N. B.", "Note:"],
    ["Hd.", "Herodotus"],
    ["a gen.", "a genitive"],
    ["nomin.", "nominative"],
    ["Kl.Schrr.", "Kleine Schriften"],
    ["ap.", "cited in"],
    ["Lex", "Lexicon"],
    ["s. v.", "under the word"],
  ])("expands %s to %s", (abbreviation, expansion) => {
    expect(expandAbbreviations(abbreviation, mappings)).toContain(
      `>${expansion}</span>`,
    );
  });

  it.each([
    ["ii", "2"],
    ["iii", "3"],
    ["iv", "4"],
    ["vi", "6"],
    ["vii", "7"],
    ["viii", "8"],
    ["ix", "9"],
    ["xi", "11"],
    ["xii", "12"],
    ["xiii", "13"],
    ["xiv", "14"],
    ["xv", "15"],
    ["xvi", "16"],
    ["xvii", "17"],
    ["xviii", "18"],
    ["xix", "19"],
    ["xx", "20"],
    ["xxi", "21"],
    ["xxix", "29"],
    ["xxx", "30"],
    ["xxxix", "39"],
    ["xl", "40"],
    ["xlix", "49"],
  ])("expands Roman numeral %s to %s", (numeral, number) => {
    expect(expandAbbreviations(numeral, mappings)).toContain(`>${number}</span>`);
  });

  it("does not expand Roman-numeral keys inside ordinary words", () => {
    expect(
      expandAbbreviations("civil vivid mix textile", mappings),
    ).toBe("civil vivid mix textile");
  });

  it.each(["v", "x", "l"])("does not expand risky single-letter Roman numeral %s", (numeral) => {
    expect(expandAbbreviations(numeral, mappings)).toBe(numeral);
  });
});

describe("Jastrow abbreviation expansion", () => {
  it.each([
    ["Ab.", "Avot (Mishnah)"],
    ["Ab. d’R. N.", "Avot d'Rabbi Natan"],
    ["abbrev.", "abbreviated or abbreviation"],
    ["add.", "additamenta (supplement)"],
    ["adj.", "adjective"],
    ["art.", "article"],
    ["Beitr.", "Beiträge zur Sprach- und Alterthumsforschung"],
    ["B’ḥuck.", "Bechukotai"],
    ["B’resh.", "Bereishit"],
    ["B’shall.", "Beshalach"],
    ["ed.", "edition(s)"],
    ["fr.", "from"],
    ["freq.", "frequently"],
    ["Fr.", "Friedman edition"],
    ["gen. of", "genitive of"],
    ["Hag.", "Haggai"],
    ["K.A.T.", "Keilinschriften und das Alte Testament"],
    ["M’bo", "Frankel, Introduction to the Jerusalem Talmud"],
    ["Mish. N. or Nap.", "Mishnah, Naples edition"],
    ["opin.", "opinion"],
    ["oth.", "other"],
    ["part.", "participle"],
    ["phraseol.", "phraseology"],
    ["prob.", "probably"],
    ["prop.", "properly"],
    ["prov.", "proverb"],
    ["q. v.", "see there"],
    ["R. S.", "Rabbenu Shimshon"],
    ["S’maḥ.", "Semahot"],
    ["Tosef. ed. Zuck.", "Tosefta, Zuckermandel edition"],
    ["trnsp.", "transposed or transposition"],
    ["vers.", "version"],
    ["ws.", "words"],
    ["Y’lamd.", "Y'lamdenu"],
    ["sq.", "and following"],
    ["Part. pass.", "passive participle"],
    ["Part.", "participle"],
    ["ed. Lag.", "Lagarde edition"],
    ["ed. Wil.", "Vilna edition"],
    ["ed. Berl.", "Berliner edition"],
    ["oth. ed.", "other editions"],
    ["infra.", "below"],
    ["Talm. Y.", "Jerusalem Talmud"],
    ["corresp.", "corresponding"],
    ["prefix.", "prefix"],
    ["reduplic.", "reduplicated"],
    ["Hithpalp.", "Hithpalpel"],
    ["Pers.", "Persian"],
    ["Arab.", "Arabic"],
    ["Engl.", "English"],
    ["interch.", "interchanged"],
    ["Deriv.", "Derivative"],
    ["Transf.", "Transferred sense"],
    ["archit.", "architecture"],
    ["incorr.", "incorrect"],
    ["in gen.", "in general"],
    ["Du.", "Dual"],
  ])("expands %s to %s", (abbreviation, expansion) => {
    expect(expandAbbreviations(abbreviation, jastrowMappings)).toContain(
      `>${expansion}</span>`,
    );
  });

  it("prefers a longer contextual mapping over shorter keys", () => {
    const rendered = expandAbbreviations(
      "Part. pass. זָקוּק",
      jastrowMappings,
    );
    expect(rendered).toContain(">passive participle</span>");
    expect(rendered).not.toContain(">participle</span> pass.");
  });

  it("does not expand abbreviations inside ordinary words", () => {
    expect(
      expandAbbreviations(
        "article probable property frequent correspondence infrastructure",
        jastrowMappings,
      ),
    ).toBe(
      "article probable property frequent correspondence infrastructure",
    );
  });

  it("expands visible text without altering HTML attributes", () => {
    const rendered = expandAbbreviations(
      '<a href="/search?edition=Lag.">ed. Lag.</a>',
      jastrowMappings,
    );
    expect(rendered).toContain('href="/search?edition=Lag."');
    expect(rendered).toContain(">Lagarde edition</span>");
  });

  it.each([
    [
      "Targum Jonathan on Jeremiah 8:20 ed. Lag. (ed. קִבָּא)",
      ["Lagarde edition", "edition(s)"],
    ],
    [
      "דָּאִיךְ fr. דּוּךְ",
      ["from"],
    ],
    [
      "(Pers. a. Arab. nard)",
      ["Persian", "Arabic"],
    ],
  ])(
    "expands abbreviations in a sampled Jastrow definition",
    (definition, expansions) => {
      const rendered = expandAbbreviations(definition, jastrowMappings);
      for (const expansion of expansions) {
        expect(rendered).toContain(`>${expansion}</span>`);
      }
    },
  );

  it.each(["a.", "c.", "r.", "S.", "s.", "w."])(
    "does not globally expand rejected single-letter key %s",
    (abbreviation) => {
      expect(expandAbbreviations(abbreviation, jastrowMappings)).toBe(
        abbreviation,
      );
    },
  );
});