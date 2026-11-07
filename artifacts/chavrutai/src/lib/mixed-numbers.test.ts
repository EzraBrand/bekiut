import { describe, expect, it } from "vitest";
import { parseMixedNumbers } from "@workspace/text-processing/number-parser";
import { replaceTerms } from "@workspace/text-processing";

describe("mixed fractional numbers", () => {
  it.each([
    ["twenty-eight and a half dinars", "28½ dinars"],
    ["twenty eight and a half", "28½"],
    ["twenty‑eight and a half", "28½"],
    ["twenty-eight-and-a-half", "28½"],
    ["one-hundred-and-six-and-two-thirds", "106⅔"],
    ["one hundred and six and two thirds", "106⅔"],
    ["ninety-three and one-third", "93⅓"],
    ["a hundred and a half", "100½"],
    ["two thousand and twenty-eight and a half", "2,028½"],
    ["28 and a half", "28½"],
    ["1,028 and three quarters", "1,028¾"],
    ["one and one half", "1½"],
    ["one-and-one-half", "1½"],
    ["thirteen and a third", "13⅓"],
    ["forty-two and five eighths", "42⅝"],
    ["forty-two and two sevenths", "42 2/7"],
    ["<b>twenty-eight and a half dinars, and half of a sixth</b>",
      "<b>28½ dinars, and half of a sixth</b>"],
  ])("%s → %s", (source, expected) => {
    expect(parseMixedNumbers(source)).toBe(expected);
  });

  it("handles every tens/unit combination before shorter fraction replacements", () => {
    const tens = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const units = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    for (const [t, word] of tens.entries()) {
      for (const [u, unit] of units.entries()) {
        const whole = word + (unit ? `-${unit}` : "");
        for (const [fraction, glyph] of [["a half", "½"], ["one-third", "⅓"], ["two thirds", "⅔"], ["three quarters", "¾"]]) {
          expect(replaceTerms(`${whole} and ${fraction} dinars`)).toBe(`${(t + 2) * 10 + u}${glyph} dinars`);
        }
      }
    }
  });

  it("preserves HTML attributes and nonnumeric phrases", () => {
    const source = '<a title="twenty-eight and a half">twenty-eight and a half</a>';
    expect(parseMixedNumbers(source)).toBe('<a title="twenty-eight and a half">28½</a>');
    for (const text of ["one must give half", "half of a sixth", "twenty-eight dinars and a half", "third day", "one and another"]) {
      expect(parseMixedNumbers(text)).toBe(text);
    }
  });

  it("processes Bekhorot 50a:2 source HTML through the real replacement pipeline", () => {
    const source = 'worth <b>twenty-eight and a half dinars, and half of a sixth</b> of a dinar, in Arabian silver dinars.';
    const result = replaceTerms(source);
    expect(result).toContain('<b>28½ dinars,');
    expect(result).not.toContain('20-8');
  });
});
