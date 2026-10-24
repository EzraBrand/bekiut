import { normalizeHebrew } from "./lexicon-index";

const collator = new Intl.Collator("he", { numeric: true, sensitivity: "base" });
const vocalizedCollator = new Intl.Collator("he", { sensitivity: "variant" });
const superscripts = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const romanValues: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function sortKey(headword: string) {
  const vocalizedBase = headword.trim().replace(/(?:\s+[IVXLCDM]+|\s*[⁰¹²³⁴⁵⁶⁷⁸⁹\d]+)$/u, "").trim();
  const normalized = normalizeHebrew(headword).trim();
  const match = normalized.match(/^(.*?)(?:\s+([IVXLCDM]+)|\s*([⁰¹²³⁴⁵⁶⁷⁸⁹]+|\d+))$/u);
  if (!match) return { base: normalized, vocalizedBase, homograph: 0 };
  let homograph = 0;
  if (match[2]) {
    const roman = match[2];
    for (let i = 0; i < roman.length; i++) {
      const value = romanValues[roman[i]];
      homograph += value < (romanValues[roman[i + 1]] ?? 0) ? -value : value;
    }
  } else {
    homograph = Number(match[3].replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/gu, char => String(superscripts.indexOf(char))));
  }
  return { base: match[1].trim(), vocalizedBase, homograph };
}

/** Sort display copies only: preserve canonical headwords and lookup URLs. */
export function sortJastrowHeadwords(headwords: readonly string[]): string[] {
  return headwords.map(headword => ({ headword, ...sortKey(headword) }))
    .sort((a, b) => collator.compare(a.base, b.base) ||
      vocalizedCollator.compare(a.vocalizedBase, b.vocalizedBase) ||
      a.homograph - b.homograph || collator.compare(a.headword, b.headword))
    .map(item => item.headword);
}
