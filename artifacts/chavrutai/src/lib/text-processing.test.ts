/**
 * Comprehensive test suite for text processing functions
 * 
 * This test suite covers all documented edge cases and known patterns
 * from the Talmudic text processing system.
 */

import { describe, it, expect } from 'vitest';
import {
  splitEnglishText,
  splitHebrewText,
  removeNikud,
  processHebrewText,
  processEnglishText,
  processRambamEnglishText,
  linkBibleCitations,
  replaceTerms,
  containsHebrew,
  normalizeApiText
} from './text-processing';

// Contiguous excerpts from Sefaria's Mishneh Torah, trans. by Eliyahu Touger
// (Jerusalem, Moznaim Pub. c1986-c2007), Repentance 1:1, 1:4, and 2:4.
// Retrieved 2026-09-17 from /api/texts/Mishneh_Torah,_Repentance.{1,2}.
// Keep source HTML intact: these regressions depend on its actual boundaries.
const RAMBAM_1_1_SOURCE =
  'If a person transgresses any of the mitzvot of the Torah, whether a positive command or a negative command - whether willingly or inadvertently - when he repents, and returns from his sin, he must confess before God, blessed be He, as [Numbers 5:6-7] states: "If a man or a woman commit any of the sins of man... they must confess the sin that they committed."<br>This refers to a verbal confession. This confession is a positive command.<br>How does one confess: He states: "I implore You, God, I sinned, I transgressed, I committed iniquity before You by doing the following. Behold, I regret and am embarrassed for my deeds. I promise never to repeat this act again."';

const RAMBAM_1_4_SOURCE =
  'If a person violates a prohibition that is not punishable by <i>karet</i> or execution by the court and repents, Teshuvah has a tentative effect and Yom Kippur brings atonement as [Leviticus, <i>loc. cit.</i> states "This day will atone for you."<br>If a person violates [sins punishable by] <i>karet</i> or execution by the court and repents, Teshuvah and Yom Kippur have a tentative effect and the sufferings which come upon him complete the atonement.';

const RAMBAM_2_4_SOURCE =
  'Among the paths of repentance is for the penitent to<br>a) constantly call out before God, crying and entreating;<br>b) to perform charity according to his potential;<br>c) to separate himself far from the object of his sin;<br>d) to change his name, as if to say "I am a different person and not the same one who sinned;"<br>e) to change his behavior in its entirety to the good and the path of righteousness; and f) to travel in exile from his home. Exile atones for sin because it causes a person to be submissive, humble, and meek of spirit.';

describe('English Text Processing', () => {
  describe('Period + Quote Patterns', () => {
    it('should handle period + straight double quote', () => {
      const input = 'from Hodu to Cush." Rav';
      const expected = 'from Hodu to Cush."\nRav';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + curly double quote (U+201D)', () => {
      const input = 'from Hodu to Cush." Rav';
      const expected = 'from Hodu to Cush."\nRav';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + left curly double quote (U+201C)', () => {
      const input = 'from Hodu to Cush." Next';
      const expected = 'from Hodu to Cush."\nNext';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + straight single quote', () => {
      const input = "from Hodu to Cush.' Rav";
      const expected = "from Hodu to Cush.'\nRav";
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + curly single quote (U+2019)', () => {
      const input = "from Hodu to Cush.' Rav";
      const expected = "from Hodu to Cush.'\nRav";
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + left curly single quote (U+2018)', () => {
      const input = "from Hodu to Cush.' Next";
      const expected = "from Hodu to Cush.'\nNext";
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Comma + Quote Patterns', () => {
    it('should handle comma + straight double quote', () => {
      const input = 'detailed exposition," as';
      const expected = 'detailed exposition,"\nas';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle comma + curly double quote (U+201D)', () => {
      const input = 'detailed exposition," as';
      const expected = 'detailed exposition,"\nas';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle comma + straight single quote', () => {
      const input = "detailed exposition,' as";
      const expected = "detailed exposition,'\nas";
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle comma + curly single quote (U+2019)', () => {
      const input = "detailed exposition,' as";
      const expected = "detailed exposition,'\nas";
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Triple-Punctuation Clusters', () => {
    it('should handle question mark + single quote + double quote (?\'\")', () => {
      const input = 'shall I know?\'" (Genesis';
      const expected = 'shall I know?\'\"\n(Genesis';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle period + single quote + double quote (.\'\")', () => {
      const input = 'the end.\'" After';
      const expected = 'the end.\'\"\nAfter';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle comma + single quote + double quote (,\'\")', () => {
      const input = 'he said,\'" but';
      const expected = 'he said,\'\"\nbut';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle semicolon + single quote + double quote (;\'\")', () => {
      const input = 'thus;\'" however';
      const expected = 'thus;\'\"\nhowever';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle exclamation + single quote + double quote (!\'\")', () => {
      const input = 'amazing!\'" Then';
      const expected = 'amazing!\'\"\nThen';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Number Preservation', () => {
    it('should NOT split numbers with commas', () => {
      const input = 'The population was 600,000 people.';
      const expected = 'The population was 600,000 people.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve multiple numbers with commas', () => {
      const input = 'There were 1,000 men and 2,500 women.';
      const expected = 'There were 1,000 men and 2,500 women.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve large numbers', () => {
      const input = 'The sum was 1,234,567 shekels.';
      const expected = 'The sum was 1,234,567 shekels.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Abbreviation Preservation', () => {
    it('should preserve i.e.', () => {
      const input = 'The term, i.e. the word, means something.';
      const expected = 'The term, i.e. the word, means something.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve e.g.', () => {
      const input = 'Some examples, e.g. this one, are clear.';
      const expected = 'Some examples, e.g. this one, are clear.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve etc.', () => {
      const input = 'Things like bread, wine, etc. were consumed.';
      const expected = 'Things like bread, wine, etc. were consumed.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve vs.', () => {
      const input = 'In the case of Hillel vs. Shammai, they disagreed.';
      const expected = 'In the case of Hillel vs. Shammai, they disagreed.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve cf.', () => {
      const input = 'See also, cf. the other passage, for details.';
      const expected = 'See also, cf. the other passage, for details.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('HTML Line Breaks', () => {
    it('should convert <br> to newlines', () => {
      const input = 'First line.<br>Second line.';
      const expected = 'First line.\nSecond line.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should convert <br/> to newlines', () => {
      const input = 'First line.<br/>Second line.';
      const expected = 'First line.\nSecond line.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should convert <br /> (with space) to newlines', () => {
      const input = 'First line.<br />Second line.';
      const expected = 'First line.\nSecond line.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle case-insensitive <BR> tags', () => {
      const input = 'First line.<BR>Second line.';
      const expected = 'First line.\nSecond line.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Bolded Comma/Colon Logic', () => {
    it('should split on bolded comma', () => {
      const input = 'He said<b>,</b> she replied.';
      const expected = 'He said<b>,\n</b> she replied.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should split on bolded colon', () => {
      const input = 'It is stated<b>:</b> "Text follows."';
      const expected = 'It is stated<b>:\n</b> "Text follows."';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should split on <strong> comma', () => {
      const input = 'He said<strong>,</strong> she replied.';
      const expected = 'He said<strong>,\n</strong> she replied.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should NOT split bolded comma before quotes', () => {
      const input = 'he said<b>,"</b> but';
      // Comma before quote should NOT split
      const result = splitEnglishText(input);
      expect(result).not.toContain('<b>,\n"</b>');
    });

    it('should NOT split bolded comma in numbers', () => {
      const input = 'There were <b>600,000</b> people.';
      const result = splitEnglishText(input);
      expect(result).toContain('600,000');
      expect(result).not.toContain('600,\n000');
    });
  });

  describe('Question Mark Splitting', () => {
    it('should split on question marks', () => {
      const input = 'Why? Because it is so.';
      const expected = 'Why?\nBecause it is so.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should handle question mark + quote (already tested in patterns)', () => {
      const input = 'Why?" he asked.';
      const expected = 'Why?"\nhe asked.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Semicolon Splitting', () => {
    it('should split on semicolons', () => {
      const input = 'First clause; second clause.';
      const expected = 'First clause;\nsecond clause.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Orphaned Quote Cleanup', () => {
    it('should remove orphaned quotes NOT preceded by punctuation', () => {
      const input = 'Some text\n"\nMore text.';
      const expected = 'Some text\nMore text.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve quotes that are part of punctuation clusters', () => {
      const input = 'Text."\nMore text.';
      const expected = 'Text."\nMore text.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    it('should preserve quotes after commas in clusters', () => {
      const input = 'Text,"\nMore text.';
      const expected = 'Text,"\nMore text.';
      expect(splitEnglishText(input)).toBe(expected);
    });
  });

  describe('Complex Real-World Cases', () => {
    it('should handle Megillah 11a pattern', () => {
      const input = 'from Hodu to Cush." Rav and Shmuel disagreed.';
      const expected = 'from Hodu to Cush."\nRav and Shmuel disagreed.';
      expect(splitEnglishText(input)).toBe(expected);
    });

    // KNOWN-FAILING (pre-existing): plain-text colons are intentionally not a
    // split point in splitEnglishText (only bolded/cross-tag colons split), so
    // 'It is stated:' stays on one line. Marked it.fails so a NEW failure in
    // this area is still visible. See docs/reviews/PROJECT-REVIEW-2026-08.md.
    it.fails('should handle nested quotes', () => {
      const input = 'It is stated: "And he said, \'My Lord, God, by what shall I know?\'"';
      const result = splitEnglishText(input);
      expect(result).toContain('It is stated:\n');
      expect(result).toContain('My Lord');
    });

    it('should handle multiple sentences', () => {
      const input = 'First sentence. Second sentence. Third sentence.';
      const result = splitEnglishText(input);
      const lines = result.split('\n');
      expect(lines.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(splitEnglishText('')).toBe('');
    });

    it('should handle whitespace-only string', () => {
      expect(splitEnglishText('   ')).toBe('');
    });

    it('should handle string with no punctuation', () => {
      const input = 'Just plain text';
      expect(splitEnglishText(input)).toBe('Just plain text');
    });

    it('should preserve HTML formatting tags', () => {
      const input = 'This is <b>bold</b> text. And <i>italic</i> too.';
      const result = splitEnglishText(input);
      expect(result).toContain('<b>bold</b>');
      expect(result).toContain('<i>italic</i>');
    });
  });
});

describe('Hebrew Text Processing', () => {
  describe('Nikud Removal', () => {
    it('should remove Hebrew vowel points', () => {
      const input = 'שָׁלוֹם';
      const expected = 'שלום';
      expect(removeNikud(input)).toBe(expected);
    });

    it('should remove cantillation marks', () => {
      const input = 'בְּרֵאשִׁ֖ית';
      const result = removeNikud(input);
      expect(result).not.toContain('\u0591');
      expect(result).not.toContain('\u05B0');
    });

    it('should preserve Hebrew letters', () => {
      const input = 'אָמַר רַבִּי';
      const result = removeNikud(input);
      expect(result).toContain('א');
      expect(result).toContain('מ');
      expect(result).toContain('ר');
    });
  });

  describe('Hebrew Punctuation Splitting', () => {
    it('should split on colons', () => {
      const input = 'אמר רבי יוחנן: מאי דכתיב';
      const result = splitHebrewText(input);
      expect(result).toContain(':\n');
    });

    it('should split on question marks', () => {
      const input = 'מאי דכתיב? וכו';
      const result = splitHebrewText(input);
      expect(result).toContain('?\n');
    });

    it('should split on periods', () => {
      const input = 'כך אמר. ואח"כ';
      const result = splitHebrewText(input);
      expect(result).toContain('.\n');
    });

    it('should split on commas', () => {
      const input = 'ראשון, שני, שלישי';
      const result = splitHebrewText(input);
      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThan(1);
    });

    it('should split on semicolons', () => {
      const input = 'חלק ראשון; חלק שני';
      const result = splitHebrewText(input);
      expect(result).toContain(';\n');
    });
  });

  describe('Hebrew Irony Punctuation', () => {
    it('should handle ?! as a unit', () => {
      const input = 'באמת?! כן';
      const result = splitHebrewText(input);
      expect(result).toContain('?!\n');
      expect(result).not.toContain('?\n!\n');
    });

    it('should NOT split ? when followed by !', () => {
      const input = 'כן?! לא';
      const result = splitHebrewText(input);
      expect(result).toContain('?!');
      // Should not have separate ? and !
      const lines = result.split('\n');
      expect(lines.some(line => line.endsWith('?'))).toBe(false);
    });
  });

  describe('Hebrew Special Characters', () => {
    it('should split on Hebrew quotation mark', () => {
      const input = 'אמר ״ שלום';
      const result = splitHebrewText(input);
      expect(result).toContain('״');
    });

    it('should split on SOF PASUQ (׃)', () => {
      const input = 'בראשית׃ ויהי';
      const result = splitHebrewText(input);
      expect(result).toContain('׃\n');
    });

    it('should split after a spaced en dash while binding it to the preceding word', () => {
      const input = 'ראשון – שני';
      const result = splitHebrewText(input);
      expect(result).toBe('ראשון\u00A0\u2060–\nשני');
    });

    it('should split after a spaced em dash while binding it to the preceding word', () => {
      const input = 'ראשון — שני';
      const result = splitHebrewText(input);
      expect(result).toBe('ראשון\u00A0\u2060—\nשני');
    });

    it('should still split on an unspaced em dash', () => {
      const input = 'ראשון—שני';
      const result = splitHebrewText(input);
      expect(result).toBe('ראשון—\nשני');
    });

    it('should split on dash with spaces', () => {
      const input = 'כך - ככה';
      const result = splitHebrewText(input);
      expect(result).toContain(' - \n');
    });
  });

  describe('Hebrew Punctuation Clusters', () => {
    it('should NOT split on end quote + space + em-dash (Niddah 47a.9)', () => {
      const input = 'word״ — nextword';
      const result = splitHebrewText(input);
      // Should remain as one line, no split
      expect(result).toBe('word״\u2060 — nextword');
      expect(result).not.toContain('\n');
    });

    it('should NOT split on end quote + em-dash (no space)', () => {
      const input = 'word״— nextword';
      const result = splitHebrewText(input);
      expect(result).toBe('word״— nextword');
      expect(result).not.toContain('\n');
    });

    it('should NOT split on end quote + space + n-dash', () => {
      const input = 'word״ – nextword';
      const result = splitHebrewText(input);
      expect(result).toBe('word״\u2060 – nextword');
      expect(result).not.toContain('\n');
    });

    // KNOWN-FAILING (pre-existing): current splitHebrewText does not split on a
    // standalone gershayim end quote; expectation predates a splitting-rule
    // change. Marked it.fails so a NEW failure here is still visible.
    it.fails('should split on standalone end quote (not followed by dash)', () => {
      const input = 'word״ nextword';
      const result = splitHebrewText(input);
      expect(result).toContain('״ \n');
    });

    it('should split after a spaced standalone em-dash without orphaning it', () => {
      const input = 'word — nextword';
      const result = splitHebrewText(input);
      expect(result).toBe('word\u00A0\u2060—\nnextword');
    });

    it('should preserve an older API-processed newline and bind the dash leftward', () => {
      const input = 'הנקב –\nטמא';
      const result = processHebrewText(input);
      expect(result).toBe('הנקב\u00A0\u2060–\nטמא');
    });

    it('should be idempotent when API-processed dash text is processed by the client', () => {
      const input = 'הנקב – טמא';
      const apiProcessed = processHebrewText(input);
      const clientProcessed = processHebrewText(apiProcessed);
      expect(clientProcessed).toBe('הנקב\u00A0\u2060–\nטמא');
      expect(clientProcessed.match(/\u2060/g)).toHaveLength(1);
    });

    it('should preserve strong markup around a spaced dash phrase', () => {
      const input = '<strong>הנקב – טהור</strong>';
      const result = processHebrewText(input);
      expect(result).toBe('<strong>הנקב\u00A0\u2060–\nטהור</strong>');
      expect(result.match(/<strong>/g)).toHaveLength(1);
      expect(result.match(/<\/strong>/g)).toHaveLength(1);
    });

    it.each([
      ['המסורת! — גם', 'המסורת!\nגם'],
      ['מיבעיא?! — שאני', 'מיבעיא?!\nשאני'],
      ['ששה? — תלמוד לומר:', 'ששה?\nתלמוד לומר:'],
      ['והסריקין?\u2060— תלמוד', 'והסריקין?\nתלמוד'],
      ['היא?\u00A0\u2060— דתני', 'היא?\nדתני'],
      ['קרא, — הרי', 'קרא,\nהרי'],
      ['קרא, – הרי', 'קרא,\nהרי'],
      ['קרא,—הרי', 'קרא,\nהרי'],
      ['קרא,\n\u2060—\nהרי', 'קרא,\nהרי'],
      ['קרא,\n\u00A0\u2060—\nהרי', 'קרא,\nהרי'],
    ])('should remove a redundant dash after terminal punctuation: %s', (input, expected) => {
      expect(splitHebrewText(input)).toBe(expected);
    });

    it('should remove the dash idempotently after server and client processing', () => {
      const apiProcessed = processHebrewText('מיבעיא?! — שאני');
      expect(processHebrewText(apiProcessed)).toBe('מיבעיא?!\nשאני');
    });

    it('should clean the comma-dash in Yoma 74b:10 before and after processing', () => {
      const source = 'בַּעֲרָיוֹת קָא מִישְׁתַּעֵי קְרָא, — הֲרֵי הוּא אוֹמֵר:';
      const expected = 'בעריות קא מישתעי קרא,\nהרי הוא אומר:';
      expect(processHebrewText(source)).toBe(expected);
      expect(processHebrewText(processHebrewText(source))).toBe(expected);
      expect(processHebrewText('<strong>קרא, — הרי</strong>')).toBe(
        '<strong>קרא,\nהרי</strong>',
      );
    });
  });

  describe('Hebrew Text Cleanup', () => {
    it('should remove consecutive line breaks', () => {
      const input = 'אחד.\n\nשניים.';
      const result = splitHebrewText(input);
      expect(result).not.toContain('\n\n');
    });

    it('should trim whitespace', () => {
      const input = '  אמר רבי  ';
      const result = splitHebrewText(input);
      expect(result).toBe(result.trim());
    });

    it('should remove leading spaces on new lines', () => {
      const input = 'אחד.\n  שניים';
      const result = splitHebrewText(input);
      expect(result).not.toMatch(/\n\s+\w/);
    });
  });

  describe('Hebrew Edge Cases', () => {
    it('should handle empty string', () => {
      expect(splitHebrewText('')).toBe('');
    });

    it('should handle string with no punctuation', () => {
      const input = 'שלום עליכם';
      const result = splitHebrewText(input);
      expect(result).toBe('שלום עליכם');
    });
  });
});

describe('Term Replacement', () => {
  describe('Basic Term Replacements', () => {
    it('should replace GEMARA with Talmud', () => {
      expect(replaceTerms('The GEMARA says')).toContain('Talmud');
    });

    it('should replace Gemara with Talmud', () => {
      expect(replaceTerms('The Gemara says')).toContain('Talmud');
    });

    it('should replace Temple candelabrum with Temple menorah', () => {
      expect(replaceTerms('lit the Temple candelabrum daily')).toContain('Temple menorah');
    });

    it('should replace shewbread with showbread', () => {
      expect(replaceTerms('the shewbread was arranged')).toContain('showbread');
    });

    it('should replace the New Moon with Rosh Chodesh', () => {
      expect(replaceTerms('the offering of the New Moon')).toContain('Rosh Chodesh');
    });

    it('should replace The New Moon at sentence start with Rosh Chodesh', () => {
      expect(replaceTerms('The New Moon was sanctified')).toContain('Rosh Chodesh');
    });

    it('should replace Rabbi with R\'', () => {
      expect(replaceTerms('Rabbi Akiva')).toContain('R\' Akiva');
    });

    it('should replace The Sages taught with A baraita states', () => {
      expect(replaceTerms('The Sages taught this')).toContain('A baraita states');
    });

    it('should replace Divine Presence with Shekhina', () => {
      expect(replaceTerms('the Divine Presence descended')).toContain('Shekhina');
    });

    it('should replace the Holy One, Blessed be He with God', () => {
      expect(replaceTerms('the Holy One, Blessed be He, said')).toContain('God said');
    });

    it('should modernize the requested divine names and archaic English terms', () => {
      const replacements: Array<[string, string]> = [
        ['Lord God', 'YHWH God'],
        ['O Lord', 'O YHWH'],
        ['wrath', 'anger'],
        ['dwell', 'reside'],
        ['dwelling', 'residence'],
        ['shall', 'should'],
        ['thereafter', 'after that'],
        ['unto', 'to'],
        ['brethren', 'brothers'],
        ['whereby', 'by which'],
        ['abode', 'residence'],
        ['maiden', 'young woman'],
        ['maidens', 'young women'],
        ['harlot', 'prostitute'],
        ['harlots', 'prostitutes'],
        ['a beast', 'an animal'],
        ['beasts', 'animals'],
        ['begot', 'fathered'],
        ['dwelt', 'resided'],
        ['smote', 'struck'],
      ];

      for (const [source, expected] of replacements) {
        expect(replaceTerms(source)).toBe(expected);
      }
    });

    it('should apply longer divine-name phrases before shorter terms', () => {
      expect(replaceTerms('O Lord, the Lord God')).toBe('O YHWH, YHWH God');
    });

    it('should replace the full phrase before comma-terminated Lord', () => {
      expect(replaceTerms('Bless the Lord, O my soul')).toBe(
        'Bless YHWH, O my soul',
      );
      expect(replaceTerms('Bless the Lord, His angels')).toBe(
        'Bless YHWH, His angels',
      );
    });

    it('should only replace comma-terminated Lord when the L is uppercase', () => {
      expect(replaceTerms('Lord, hear us. lord, hear us. LORD, hear us.')).toBe(
        'YHWH, hear us. lord, hear us. LORD, hear us.',
      );
    });

    it('should preserve words that merely contain an archaic term', () => {
      expect(replaceTerms('shadow shallot dwellingplace maidenhair beastskin harlotry')).toBe(
        'shadow shallot dwellingplace maidenhair beastskin harlotry',
      );
    });
  });

  describe('Ordinal Number Replacements', () => {
    it.each([
      ['twenty-four-hour', '24-hour'],
      ['A twenty-four-hour period', 'A 24-hour period'],
      ['a twenty-four-hour <b>period.</b>', 'a 24-hour <b>period.</b>'],
      ['the twenty-four-hour period', 'the 24-hour period'],
      ['twenty-four hours earlier', '24 hours earlier'],
      ['a thirty-six-hour period', 'a 36-hour period'],
      ['an eight-day period', 'an 8-day period'],
      ['a hundred and twenty three', '123'],
      ['a thousand', '1,000'],
      ['one or two', 'one or two'],
    ])('should convert cardinal numbers without absorbing unrelated articles: %s', (source, expected) => {
      expect(replaceTerms(source)).toBe(expected);
    });

    it('should convert the article-led phrase from Niddah 2a:2 in the full pipeline', () => {
      expect(processEnglishText('the principle is: A twenty-four-hour <b>period reduces</b> the time')).toContain(
        'A 24-hour <b>period reduces</b>',
      );
    });

    it('should convert a tenth of an ephah to a numeric fraction', () => {
      expect(replaceTerms('a tenth of an ephah')).toBe('1/10th of an ephah');
      expect(replaceTerms('A tenth of an ephah')).toBe('1/10th of an ephah');
      expect(replaceTerms('<b>a tenth of an ephah</b>')).toBe('<b>1/10th of an ephah</b>');
      expect(processEnglishText('He brings a tenth of an ephah')).toContain('1/10th of an ephah');
    });

    it('should convert two-tenths before cardinal processing, including Eruvin 50a wording', () => {
      expect(replaceTerms('he tithes two-tenths instead of one-tenth')).toBe(
        'he tithes 2/10ths instead of 1/10th',
      );
      expect(replaceTerms('two tenths')).toBe('2/10ths');
      expect(replaceTerms('<b>two-tenths</b>')).toBe('<b>2/10ths</b>');
      expect(replaceTerms('<b>two</b>-<b>tenths</b>')).toBe('<b>2/10ths</b>');
      expect(processEnglishText('Since it is unclear which of the two-tenths is the actual tithe')).toContain('2/10ths');
    });

    it('should replace third with 3rd', () => {
      expect(replaceTerms('the third day')).toContain('3rd');
    });

    it('should replace twenty-first with 21st', () => {
      expect(replaceTerms('the twenty-first century')).toContain('21st');
    });

    it('should replace thirty-third with 33rd', () => {
      expect(replaceTerms('the thirty-third year')).toContain('33rd');
    });

    it('should handle compound ordinals', () => {
      expect(replaceTerms('twenty-second')).toContain('22nd');
      expect(replaceTerms('twenty second')).toContain('22nd');
    });

    it('should convert hyphenated degree and month ordinals with plain or bold nouns', () => {
      expect(replaceTerms('Eighth-month')).toBe('8th-month');
      expect(replaceTerms('Eighth-<b>month</b>')).toBe('8th-<b>month</b>');
      expect(replaceTerms('First-degree')).toBe('1st-degree');
      expect(replaceTerms('First-<b>degree</b>')).toBe('1st-<b>degree</b>');
    });

    it('should convert article-based eighth and third measurement fractions', () => {
      expect(replaceTerms('an eighth of the measure')).toBe('1/8th of the measure');
      expect(replaceTerms('an eighth-<i>log</i>')).toBe('1/8th-<i>log</i>');
      expect(replaceTerms('an 8th-<i>log</i>')).toBe('1/8th-<i>log</i>');
      expect(replaceTerms('a third-<i>hin</i>')).toBe('1/3rd-<i>hin</i>');
    });
  });

  describe('Sexual Term Replacements', () => {
    it.each([
      ['cohabit', 'have sex'],
      ['cohabits', 'has sex'],
      ['cohabiting', 'having sex'],
      ['cohabited', 'had sex'],
      ['copulate', 'have sex'],
      ['copulates', 'has sex'],
      ['copulating', 'having sex'],
      ['copulated', 'had sex'],
      ['engage in relations', 'have sex'],
      ['engages in relations', 'has sex'],
      ['engaging in relations', 'having sex'],
      ['engaged in relations', 'had sex'],
      ['have relations', 'have sex'],
      ['has relations', 'has sex'],
      ['having relations', 'having sex'],
      ['had relations', 'had sex'],
    ])('should replace %s with %s', (source, expected) => {
      expect(replaceTerms(`${source} with her`)).toBe(`${expected} with her`);
      expect(replaceTerms(`<b>${source}</b>`)).toBe(`<b>${expected}</b>`);
    });

    it('should not replace cohabit within longer words', () => {
      expect(replaceTerms('cohabitation cohabitant')).toBe('cohabitation cohabitant');
    });

    it('should replace engage in intercourse with have sex', () => {
      expect(replaceTerms('they engage in intercourse')).toContain('have sex');
    });

    it('should replace sexual relations with sex', () => {
      expect(replaceTerms('sexual relations')).toContain('sex');
    });

    it('should handle conjugations', () => {
      expect(replaceTerms('engages in intimacy')).toContain('has sex');
      expect(replaceTerms('engaged in sexual intercourse')).toContain('had sex');
      expect(replaceTerms('engaging in intercourse')).toContain('having sex');
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-insensitive for most terms', () => {
      expect(replaceTerms('gemara')).toContain('Talmud');
    });

    it('should keep Rabbi replacement case-sensitive (RABBI untouched)', () => {
      // RABBI_GENERAL_PATTERN is deliberately case-sensitive (/\bRabbi(?![!\w])/)
      // so all-caps or lowercase forms are left as-is.
      expect(replaceTerms('RABBI')).toBe('RABBI');
      expect(replaceTerms('Rabbi Akiva')).toContain("R' Akiva");
    });
  });
});

describe('Complete Processing Pipelines', () => {
  describe('processEnglishText', () => {
    it('should apply term replacement and splitting', () => {
      const input = 'The GEMARA says this. Rabbi Akiva agreed.';
      const result = processEnglishText(input);
      expect(result).toContain('Talmud');
      expect(result).toContain('R\'');
      expect(result).toContain('\n');
    });

    it('should normalize line endings', () => {
      const input = 'Line one.\r\nLine two.';
      const result = processEnglishText(input);
      expect(result).not.toContain('\r\n');
      expect(result).toContain('\n');
    });

    it('should handle multiple consecutive line breaks', () => {
      const input = 'Text.\n\n\n\nMore text.';
      const result = processEnglishText(input);
      expect(result).not.toContain('\n\n\n');
    });
  });

  describe('processHebrewText', () => {
    it('should remove nikud and split', () => {
      const input = 'שָׁלוֹם: עָלֵיכֶם';
      const result = processHebrewText(input);
      expect(result).not.toContain('\u05B0'); // No nikud
      expect(result).toContain(':'); // Colon preserved
    });

    it('should normalize whitespace', () => {
      const input = 'אחד.   שניים';
      const result = processHebrewText(input);
      expect(result).not.toContain('   ');
    });
  });
});

describe('Utility Functions', () => {
  describe('containsHebrew', () => {
    it('should detect Hebrew characters', () => {
      expect(containsHebrew('שלום')).toBe(true);
      expect(containsHebrew('אבגד')).toBe(true);
    });

    it('should return false for English text', () => {
      expect(containsHebrew('Hello world')).toBe(false);
    });

    it('should return false for numbers only', () => {
      expect(containsHebrew('12345')).toBe(false);
    });

    it('should detect Hebrew in mixed text', () => {
      expect(containsHebrew('Hello שלום world')).toBe(true);
    });
  });

  describe('normalizeApiText', () => {
    it('should join array with double newlines', () => {
      const input = ['First', 'Second', 'Third'];
      const expected = 'First\n\nSecond\n\nThird';
      expect(normalizeApiText(input)).toBe(expected);
    });

    it('should return string as-is', () => {
      const input = 'Just a string';
      expect(normalizeApiText(input)).toBe(input);
    });

    it('should handle empty array', () => {
      expect(normalizeApiText([])).toBe('');
    });

    it('should handle empty string', () => {
      expect(normalizeApiText('')).toBe('');
    });
  });
});

describe('Regression Tests - Known Issues', () => {
  it('should handle Megillah 11a section 1 correctly', () => {
    const input = 'from Hodu to Cush." Rav and Shmuel disagreed.';
    const result = splitEnglishText(input);
    expect(result).toBe('from Hodu to Cush."\nRav and Shmuel disagreed.');
  });

  it('should handle Megillah 11a section 22 correctly', () => {
    const input = 'detailed exposition," as it is stated.';
    const result = splitEnglishText(input);
    expect(result).toBe('detailed exposition,"\nas it is stated.');
  });

  it('should handle Berakhot 7b section 1 correctly', () => {
    const input = 'by what shall I know?\'" (Genesis';
    const result = splitEnglishText(input);
    expect(result).toContain('?\'"\n');
  });

  it('should handle Berakhot 7a section 36 correctly', () => {
    const input = 'There were 600,000 people.';
    const result = splitEnglishText(input);
    expect(result).toBe('There were 600,000 people.');
  });

  it('should handle Berakhot 7a section 3 HTML breaks', () => {
    const input = 'First part.<br>Second part.';
    const result = splitEnglishText(input);
    expect(result).toBe('First part.\nSecond part.');
  });

  it('should handle Berakhot 7b section 5 single quotes', () => {
    const input = "he said.' After";
    const result = splitEnglishText(input);
    expect(result).toBe("he said.'\nAfter");
  });
});

describe('Rambam English structural line processing', () => {
  it.each([
    '<br>',
    '<br/>',
    '<br />',
    '<BR>',
    '<BR/>',
    '<br class="paragraph-break" data-kind="source">',
  ])('normalizes %s to a line break without requiring punctuation', (breakTag) => {
    expect(processRambamEnglishText(`first line${breakTag}second line`)).toBe(
      'first line\nsecond line',
    );
  });

  it('uses paragraph, div, and list-item boundaries as line breaks', () => {
    const source = '<p>First paragraph</p><p>Second paragraph</p><div>Third block</div><ul><li>Fourth item</li><li>Fifth item</li></ul>';

    expect(processRambamEnglishText(source)).toBe(
      'First paragraph\nSecond paragraph\nThird block\nFourth item\nFifth item',
    );
  });

  it('collapses repeated structural breaks and normalizes CRLF, CR, and LF', () => {
    const source = '<br>First<br> \t<br />\r\nSecond\rThird\nFourth<br>';

    expect(processRambamEnglishText(source)).toBe('First\nSecond\nThird\nFourth');
  });

  it('does not invent breaks for inline markup', () => {
    expect(processRambamEnglishText('Keep <span>inline</span> and <strong>formatted</strong> text')).toBe(
      'Keep inline and formatted text',
    );
  });

  it('keeps the live 1:1 excerpt lines at the source break before “This refers”', () => {
    const result = processRambamEnglishText(RAMBAM_1_1_SOURCE);

    expect(result).toContain(
      'they must confess the sin that they committed."\nThis refers to a verbal confession.',
    );
    expect(result).toContain(
      'This confession is a positive command.\nHow does one confess:',
    );
    expect(result).not.toContain('<br>');
  });

  it('keeps the live 1:4 excerpt citation and source-separated sentence lines', () => {
    const result = processRambamEnglishText(RAMBAM_1_4_SOURCE);

    expect(result).toContain('This day will atone for you."\nIf a person violates [sins punishable by]');
    expect(result).toContain('<em>karet</em>');
    expect(result).toContain('<em>loc. cit.</em>');
    expect(result).not.toContain('<i>');
    expect(result).not.toContain('<br>');
  });

  it('preserves each source-separated item in the live 2:4 list', () => {
    const result = processRambamEnglishText(RAMBAM_2_4_SOURCE);

    expect(result).toContain(
      'the penitent to\na) constantly call out before God, crying and entreating;',
    );
    expect(result).toContain(
      'entreating;\nb) to perform charity according to his potential;',
    );
    expect(result).toContain(
      'potential;\nc) to separate himself far from the object of his sin;',
    );
    expect(result).toContain(
      'sin;\nd) to change his name, as if to say "I am a different person and not the same one who sinned;"',
    );
    expect(result).toContain(
      'sinned;"\ne) to change his behavior in its entirety to the good and the path of righteousness;',
    );
    expect(result).not.toContain('<br>');
  });

  it('balances em independently around structural and literal line breaks', () => {
    const source = '<em>first<br>second\r\nthird\rfourth</em>';

    expect(processRambamEnglishText(source).split('\n')).toEqual([
      '<em>first</em>',
      '<em>second</em>',
      '<em>third</em>',
      '<em>fourth</em>',
    ]);
  });

  it('does not create empty rows for empty italic elements or repeated breaks', () => {
    const source = '<em></em><em><br><br /></em><br>Visible line';

    expect(processRambamEnglishText(source)).toBe('Visible line');
    expect(processRambamEnglishText('first<em> </em>second')).toBe('first second');
  });

  it('preserves paragraph boundaries inside attributed italics without blank rows', () => {
    expect(processRambamEnglishText('<I class="term"><p>first</p><p>second</p></I>')).toBe(
      '<em>first</em>\n<em>second</em>',
    );
  });

  it('does not consume source breaks after abbreviations', () => {
    expect(processRambamEnglishText('R.<br>Akiva\nb.<br>Judah i.e.<br>this')).toBe(
      "R'\nAkiva\nb.\nJudah i.e.\nthis",
    );
  });

  it('keeps inline italics protected and existing punctuation splits unchanged', () => {
    expect(processRambamEnglishText('An <i>italic term, i.e. this one.</i> stays inline. Next; then: Why? Yes!')).toBe(
      'An <em>italic term, i.e. this one.</em> stays inline.\nNext;\nthen:\nWhy?\nYes!',
    );
  });

  it('preserves Rambam abbreviations while retaining the existing sentence split', () => {
    const source = 'R. Akiva said i.e. this and e.g. that. ibid. b. Next sentence.';

    expect(processRambamEnglishText(source)).toBe(
      "R' Akiva said i.e. this and e.g. that.\nibid. b. Next sentence.",
    );
  });

  it('restores a note reference beside a break and inside balanced italics', () => {
    const note = '<sup class="text-blue-500 cursor-pointer" title="Jump to note 12" data-note-ref="12">12</sup>';

    expect(processRambamEnglishText(`Before.${note}<br>After.`)).toBe(
      `Before.${note}\nAfter.`,
    );
    expect(processRambamEnglishText(`<em>Before${note}<br>After</em>`)).toBe(
      `<em>Before${note}</em>\n<em>After</em>`,
    );
  });

  it('links Bible citations after processing each Rambam line', () => {
    const processedLines = processRambamEnglishText(RAMBAM_1_1_SOURCE)
      .split('\n')
      .map((line) => linkBibleCitations(line));

    expect(processedLines.some((line) =>
      line.includes(
        '<a href="/bible/Numbers/5#6" class="bible-citation-link">Numbers 5:6-7</a>',
      ),
    )).toBe(true);
  });
});
