import { describe, expect, it } from "vitest";
import {
  annotateAllTransliterations,
  annotateGreekTransliterations,
} from "./transliteration";

describe("Greek optional-letter parentheses", () => {
  it.each([
    ["Ακ(κ)αταν", "Ακ(κ)αταν [Ak(k)atan]"],
    ["Ακ(κ)", "Ακ(κ) [Ak(k)]"],
    ["Α(κκ)α(τ)αν", "Α(κκ)α(τ)αν [A(kk)a(t)an]"],
    ["Ακ(κ)(τ)αν", "Ακ(κ)(τ)αν [Ak(k)(t)an]"],
    ["Ἀκ(κ)ατάν", "Ἀκ(κ)ατάν [Ak(k)atan]"],
    ["Ακ(κ)αταν, αβ", "Ακ(κ)αταν, αβ [Ak(k)atan, ab]"],
    ["(Ακ(κ)αταν)", "(Ακ(κ)αταν [Ak(k)atan])"],
    ["(αβ)", "(αβ [ab])"],
    ["αβ (γδ)", "αβ [ab] (γδ [gd])"],
    ["Ακ(note)αταν", "Ακ [Ak](note)αταν [atan]"],
    ["Ακ(κ note)αταν", "Ακ [Ak](κ [k] note)αταν [atan]"],
    ["Ακ()αταν", "Ακ [Ak]()αταν [atan]"],
    ["Ακ(κ", "Ακ [Ak](κ [k]"],
    ["Ακ)αταν", "Ακ [Ak])αταν [atan]"],
    ["Ακ[κ]αταν", "Ακ [Ak][κ [k]]αταν [atan]"],
    ["αβ; γδ", "αβ [ab]; γδ [gd]"],
  ])("annotates %s without crossing unrelated boundaries", (input, output) => {
    expect(annotateGreekTransliterations(input)).toBe(output);
    expect(annotateAllTransliterations(input)).toBe(output);
    expect(annotateAllTransliterations(output)).toBe(output);
  });

  it("does not change parenthesis handling for other scripts", () => {
    expect(annotateAllTransliterations("ب(ت)ب")).toBe("ب [b](ت [t])ب [b]");
  });
});