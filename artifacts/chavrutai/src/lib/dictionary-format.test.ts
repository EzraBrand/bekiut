import { describe, expect, it } from "vitest";
import bdbData from "@/shared/data/lexicon-mappings/bdb.json";
import jastrowData from "@/shared/data/lexicon-mappings/jastrow.json";
import exactQueryFixture from "./fixtures/bdb-kraat-response.json";
import {
  annotateTransliterationsInHtml,
  convertBdbInternalLinks,
  convertBdbSubFrequencyCounts,
  convertJastrowInternalLinks,
  convertSefariaLinksToInternal,
  convertSuperscriptLetters,
  convertSupTagsToParens,
  expandAbbreviations,
  prependBdbCircaMarker,
  splitIntoParagraphsBdb,
  type DictionaryEntry,
} from "@/lib/dictionary-format";

const mappings = bdbData.mappings;
const jastrowMappings = jastrowData.mappings;

// Frozen-in-test reference for the pre-cache matcher. Keep this independent of
// the production compiler so a change to boundaries, guards, or selection is
// caught by byte-for-byte comparisons, including adjacent HTML text nodes.
function baselineExpand(text: string, map: Record<string, string>): string {
  text = text.replace(
    /<(strong|b)>n\.<\/\1>\s*\[\s*<(strong|b)>([mf])\.<\/\2>\s*\]/g,
    (original, tag: string, _genderTag: string, gender: string) => {
      const key = `n.[${gender}.]`;
      return Object.prototype.hasOwnProperty.call(map, key)
        ? `<${tag}>${key}</${tag}>` : original;
    },
  );
  const sorted = Object.entries(map).sort(([a], [b]) => b.length - a.length);
  const parts = text.split(/(<\/?[a-zA-Z][^>]*>)/);
  for (let i = 0; i < parts.length; i += 2) {
    const segment = parts[i];
    if (!segment) continue;
    const candidates: { start: number; end: number; expansion: string }[] = [];
    const insideStrong = /^<strong\b[^>]*>$/.test(i > 0 ? parts[i - 1] : '');
    for (const [abbreviation, expansion] of sorted) {
      if (!abbreviation || (abbreviation === 'c.' && insideStrong)) continue;
      const NW = '\\p{L}\\p{N}\\p{M}_';
      const leftWord = /^[\p{L}\p{N}\p{M}_]/u.test(abbreviation);
      const rightWord = /[\p{L}\p{N}\p{M}_]$/u.test(abbreviation);
      const leftAnchor = leftWord ? `(?<![${NW}])` : '';
      const rightAnchor = rightWord ? `(?![${NW}])` : '';
      let pattern: RegExp;
      if (abbreviation === '&c.') {
        pattern = /&c\./g;
      } else if (abbreviation.includes(' ')) {
        const escaped = abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(`${leftAnchor}${escaped}${rightAnchor}`, 'gu');
      } else if (abbreviation.endsWith('.')) {
        const escaped = abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(`${leftAnchor}${escaped}`, 'gu');
      } else {
        const escaped = abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        pattern = new RegExp(`${leftAnchor}${escaped}${rightAnchor}`, 'gu');
      }
      for (const match of segment.matchAll(pattern)) {
        const offset = match.index!;
        if ((abbreviation === 'De' && expansion === 'Delitzsch') ||
            (abbreviation === 'Am' && expansion === 'Amos')) {
          const followingText = (
            segment.slice(offset + match[0].length) + parts.slice(i + 1).join('')
          ).replace(/<\/?[a-zA-Z][^>]*>/g, '');
          if (abbreviation === 'De' && /^\s+Rossi(?![\p{L}\p{N}\p{M}_])/u.test(followingText)) continue;
          if (abbreviation === 'Am' && /^\s+I(?![\p{L}\p{N}\p{M}_])/u.test(followingText)) continue;
        }
        if (abbreviation === 'c.') {
          const after = segment.slice(offset + match[0].length);
          if (/^\s+\d/.test(after)) continue;
        }
        if (expansion.startsWith('Rawlinson, Cuneiform Inscriptions ') &&
            ['IR', 'II. R', 'ii. R', 'III R', 'V. R', 'VR', 'V R', 'v R.'].includes(abbreviation)) {
          const after = (
            segment.slice(offset + match[0].length) + parts.slice(i + 1).join('')
          ).replace(/<\/?[a-zA-Z][^>]*>/g, '');
          if (!/^\s*(?:\(\s*)?\d/.test(after)) continue;
        }
        candidates.push({ start: offset, end: offset + match[0].length, expansion });
      }
    }
    candidates.sort((a, b) => a.start - b.start || b.end - a.end);
    let cursor = 0;
    const output: string[] = [];
    for (const candidate of candidates) {
      if (candidate.start < cursor) continue;
      output.push(segment.slice(cursor, candidate.start), `<span class="dict-expanded">${candidate.expansion}</span>`);
      cursor = candidate.end;
    }
    output.push(segment.slice(cursor));
    parts[i] = output.join('');
  }
  return parts.join('');
}

describe("cached abbreviation matcher differential", () => {
  it("matches baseline for the complete captured /bdb?q=קְרַאת result through the reader pipeline", () => {
    // Captured from /api/bdb/search?query=קְרַאת; fixture retains both raw
    // entries and all 47 senses. Mirror bdb.tsx's Greek anchor step and the
    // exact renderDefinition stage order, substituting only the old matcher.
    // Transliteration is SSR-safe and a no-op in this Node test environment.
    const entries: DictionaryEntry[] = exactQueryFixture.entries;
    expect(exactQueryFixture.query).toBe("קְרַאת");
    expect(entries.map(e => [e.rid, e.content.senses.length])).toEqual([
      ["BDB08931", 41], ["BDB08937", 6],
    ]);
    expect(entries.flatMap(e => e.content.senses).reduce((n, s) => n + s.definition.length, 0))
      .toBe(57152);

    const greekMarker = /(^|[\s;(>—–:\-])([αβγδεζηθικλμνξοπρστυφχψω])(\.|\))/g;
    const render = (definition: string, idPrefix: string, first: boolean, matcher: typeof expandAbbreviations) => {
      let prepared = convertBdbSubFrequencyCounts(definition);
      if (first) prepared = prependBdbCircaMarker(prepared);
      const occurrences: Record<string, number> = {};
      prepared = prepared.replace(greekMarker, (_match, lead: string, letter: string, trailer: string) => {
        const occ = (occurrences[letter] = (occurrences[letter] ?? -1) + 1);
        const id = `${idPrefix}-greek-${letter}-${occ}`;
        return trailer === '.'
          ? `${lead}<span id="${id}" class="scroll-mt-20">${letter}.</span>`
          : `${lead}<span id="${id}" class="scroll-mt-20">${letter}</span>)`;
      });
      return annotateTransliterationsInHtml(
        convertSefariaLinksToInternal(
          convertJastrowInternalLinks(
            convertBdbInternalLinks(
              matcher(
                convertSuperscriptLetters(splitIntoParagraphsBdb(convertSupTagsToParens(prepared), true)),
                mappings,
              ),
            ),
          ),
        ),
      );
    };

    for (const entry of entries) {
      entry.content.senses.forEach((sense, index) => {
        const id = `sense-${entry.rid}-${index}`;
        expect(render(sense.definition, id, index === 0, expandAbbreviations))
          .toBe(render(sense.definition, id, index === 0, baselineExpand));
      });
    }
  }, 60000);

  it.each([["BDB", mappings], ["Jastrow", jastrowMappings]] as const)(
    "matches baseline for every %s key in running text and across tags",
    (_name, map) => {
      const keys = Object.keys(map);
      // Key boundaries/overlaps can change when keys appear adjacent.
      const passages = [
        keys.join('; '),
        keys.map(key => `<em title="${key.replace(/"/g, '&quot;')}">${key}</em>`).join(' '),
        'S.E. of; E. of; αPeḳaḥ; < name of Bab. king > AV; <strong>c.</strong> c. 6823 c. preposition; ψ 23 ψυχή',
        '<em>Am</em> I; De <a>Rossi</a>; VR<a href="/ref">35:19</a>; IR; <b>n.</b>[<b>f.</b>]',
      ];
      for (const passage of passages) {
        const expected = baselineExpand(passage, map);
        expect(expandAbbreviations(passage, map)).toBe(expected);
        expect(expandAbbreviations(passage, map)).toBe(expected);
      }
    },
    30000,
  );

  it("does not share compiled expansions between distinct mapping identities", () => {
    const first = Object.freeze({ "E. of": "East of", "E.": "east" });
    const second = Object.freeze({ "E. of": "Eastern side", "E.": "eastward" });
    for (const map of [first, second, first, second]) {
      expect(expandAbbreviations("E. of E.", map)).toBe(baselineExpand("E. of E.", map));
    }
  });
});

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
      '<big>[<span dir="rtl">זֵק</span>]</big>  <strong><span class="dict-expanded">noun [masculine]</span></strong> <strong>fetter</strong>',
    );
  }, 15000);

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

  it("covers 40–49 and every multi-letter lowercase Roman numeral through 60 without mapping bare l", () => {
    const numerals = [
      "xl", "xli", "xlii", "xliii", "xliv", "xlv", "xlvi", "xlvii", "xlviii", "xlix",
      "l", "li", "lii", "liii", "liv", "lv", "lvi", "lvii", "lviii", "lix", "lx",
    ];
    for (let index = 0; index < numerals.length; index++) {
      const numeral = numerals[index];
      const number = 40 + index;
      if (numeral === "l") {
        expect(mappings).not.toHaveProperty("l");
        expect(expandAbbreviations(numeral, mappings)).toBe(numeral);
      } else {
        expect(mappings[numeral as keyof typeof mappings]).toBe(String(number));
        expect(expandAbbreviations(numeral, mappings))
          .toBe(`<span class="dict-expanded">${number}</span>`);
      }
    }
    expect(expandAbbreviations("live liver civil l lx li", mappings))
      .toBe('live liver civil l <span class="dict-expanded">60</span> <span class="dict-expanded">51</span>');
  });

  it("covers every lowercase Roman numeral from 61 through 99 without mapping bare l", () => {
    const roman = (value: number) => {
      const tens = ["", "x", "xx", "xxx", "xl", "l", "lx", "lxx", "lxxx", "xc"];
      const ones = ["", "i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix"];
      return tens[Math.floor(value / 10)] + ones[value % 10];
    };
    for (let number = 61; number <= 99; number++) {
      const numeral = roman(number);
      expect(mappings[numeral as keyof typeof mappings]).toBe(String(number));
      expect(expandAbbreviations(numeral, mappings))
        .toBe(`<span class="dict-expanded">${number}</span>`);
    }
    expect(mappings["lxvii"]).toBe("67");
    expect(mappings["xcix"]).toBe("99");
    expect(mappings).not.toHaveProperty("l");
    expect(expandAbbreviations("l civil live lxvii xcix", mappings))
      .toBe('l civil live <span class="dict-expanded">67</span> <span class="dict-expanded">99</span>');
  });

  it.each([
    ["Mod. Rev.", "Modern Review"],
    ["n. divin.", "divine name"],
    ["Rel.Bab.", "Religion of Babylonia"],
    ["Sa", "Samuel"],
    ["vandeVelde", "van de Velde"],
    ["Narrat.", "Narrative"],
    ["vandeVelde (Mem", "van de Velde (Memoir"],
    ["hypothet.", "hypothetical"],
    ["Ms.", "Manuscript"],
    ["Wisd. lit.", "Wisdom literature"],
    ["text. error", "textual error"],
    ["mispunct.", "mispunctuation"],
    ["Eng. Tr", "English translation"],
    ["lat.", "latitude"],
    ["partit.", "partitively"],
    ["kine", "cattle"],
    ["Shlm (", "Shalmaneser ("],
    ["Say (Ac.", "Sayce (Academy"],
    ["geogr.", "geographical"],
    ["volunt.", "voluntative (volitive)"],
    ["conjs.", "conjunctions"],
    ["Keilinschr.", "Keilinschriften"],
    ["Hdb. d. Zendsprache", "Handbuch der Zendsprache"],
    ["praegn.", "pregnant"],
  ])("expands requested BDB key %s", (key, expansion) => {
    expect(mappings[key as keyof typeof mappings]).toBe(expansion);
    expect(expandAbbreviations(key, mappings))
      .toBe(`<span class="dict-expanded">${expansion}</span>`);
  });

  it("resolves contextual keys after superscript conversion, ahead of generic keys", () => {
    for (const [source, expansion] of [
      ["vandeVelde<sup>Mem i. 4</sup>", "van de Velde (Memoir"],
      ["Say<sup>Ac. 4</sup>", "Sayce (Academy"],
      ["Shlm<sup>4</sup>", "Shalmaneser ("],
    ]) {
      expect(expandAbbreviations(convertSupTagsToParens(source), mappings))
        .toContain(`<span class="dict-expanded">${expansion}</span>`);
    }
    expect(expandAbbreviations("lat. c.", mappings))
      .toBe('<span class="dict-expanded">latitude circa</span>');
    expect(expandAbbreviations("Sam Say vandeVelde", mappings))
      .toBe('<span class="dict-expanded">Samuel</span> <span class="dict-expanded">Sayce</span> <span class="dict-expanded">van de Velde</span>');
  });

  it("does not expand false-positive Ki, literal Kimchi, or substrings of words", () => {
    expect(mappings).not.toHaveProperty("Ki");
    expect(expandAbbreviations("Ki Kings Kimchi", mappings)).toBe("Ki Kings Kimchi");
    expect(expandAbbreviations("Samaritan Salvage kinetic hypothetical", mappings))
      .toBe("Samaritan Salvage kinetic hypothetical");
  });

  const rawlinsonAliases = [
    ["IR", 1], ["II. R", 2], ["ii. R", 2], ["III R", 3],
    ["V. R", 5], ["VR", 5], ["V R", 5], ["v R.", 5],
  ] as const;
  const rawlinsonMappings = Object.fromEntries(
    rawlinsonAliases.map(([key]) => [key, mappings[key]]),
  );

  it.each(rawlinsonAliases)("expands numeric Rawlinson citation %s without consuming its locator", (alias, volume) => {
    const title = `<span class="dict-expanded">Rawlinson, Cuneiform Inscriptions ${volume}</span>`;
    expect(expandAbbreviations(`${alias} 35:19`, rawlinsonMappings)).toBe(`${title} 35:19`);
    expect(expandAbbreviations(convertSupTagsToParens(`${alias}<sup>35:19</sup>`), rawlinsonMappings))
      .toBe(`${title} (35:19)`);
    expect(expandAbbreviations(`${alias}<a data-ref="Genesis 35:19" href="/Genesis.35.19">35:19</a>`, rawlinsonMappings))
      .toBe(`${title}<a data-ref="Genesis 35:19" href="/Genesis.35.19">35:19</a>`);
  });

  it("keeps WAI to the short work title with no volume", () => {
    expect(expandAbbreviations("WAI", mappings))
      .toBe('<span class="dict-expanded">Rawlinson, Cuneiform Inscriptions</span>');
  });

  it("expands Sefaria's lowercase ii. R before a linked citation without changing the link", () => {
    const citation = 'ii. R <a data-ref="Exodus 36:19" href="/Exodus.36.19">36:19</a> a. b';
    expect(expandAbbreviations(citation, rawlinsonMappings))
      .toBe('<span class="dict-expanded">Rawlinson, Cuneiform Inscriptions 2</span> <a data-ref="Exodus 36:19" href="/Exodus.36.19">36:19</a> a. b');
  });

  it.each(rawlinsonAliases)("does not expand %s without a numeric citation", (alias) => {
    for (const following of ["", " see", " (text)", ' <a href="/work">text</a>']) {
      expect(expandAbbreviations(`${alias}${following}`, rawlinsonMappings))
        .toBe(`${alias}${following}`);
    }
    expect(expandAbbreviations(`pre${alias} 35:19`, rawlinsonMappings))
      .toBe(`pre${alias} 35:19`);
  });

  it("does not create global R or unapproved Roman/volume mappings", () => {
    expect(expandAbbreviations("R 35:19", rawlinsonMappings)).toBe("R 35:19");
    expect(expandAbbreviations("RV 35:19", rawlinsonMappings)).toBe("RV 35:19");
    expect(expandAbbreviations("IV R 35:19", rawlinsonMappings)).toBe("IV R 35:19");
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

  it.each(["a.", "r.", "S."])(
    "does not globally expand rejected single-letter key %s",
    (abbreviation) => {
      expect(expandAbbreviations(abbreviation, jastrowMappings)).toBe(
        abbreviation,
      );
    },
  );
});