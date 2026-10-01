export const BDB_GREEK_LETTERS = 'αβγδεζηθικλμνξοπρστυφχψω';

// Parenthesized section markers must be separate from words on both sides.
// Otherwise Ακ(κ)αταν gains an anchor inside the word, splitting the text nodes
// before transliteration. Keep the same three captures for outline and HTML.
export const BDB_GREEK_MARKER_RE = new RegExp(
  `(^|[\\s;>—–:\\-]|(?<![\\p{L}\\p{M}])\\()([${BDB_GREEK_LETTERS}])(\\.|\\))(?![\\p{L}\\p{M}])`,
  'gu',
);

export function wrapBdbGreekMarkers(html: string, idPrefix: string): string {
  const occCount: Record<string, number> = {};
  return html.replace(BDB_GREEK_MARKER_RE, (_match, lead: string, letter: string, trailer: string) => {
    const occ = (occCount[letter] = (occCount[letter] ?? -1) + 1);
    const id = `${idPrefix}-greek-${letter}-${occ}`;
    if (trailer === '.') {
      return `${lead}<span id="${id}" class="scroll-mt-20">${letter}.</span>`;
    }
    return `${lead}<span id="${id}" class="scroll-mt-20">${letter}</span>)`;
  });
}