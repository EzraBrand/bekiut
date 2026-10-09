// The words API moves the headword's frequency subscript out of the HTML.
// Restore it before the reader's existing frequency formatter runs.
export function restoreBdbOccurrences<T extends { definition: string }>(
  lexicon: string, occurrences: unknown, senses: T[],
): T[] {
  const count = typeof occurrences === "string" || typeof occurrences === "number"
    ? String(occurrences).trim() : "";
  if (lexicon !== "BDB Dictionary" || !/^\d[\d,]*$/.test(count) || !senses.length) return senses;
  if (/<sub\b[^>]*>\s*[\d,]+\s*<\/sub>/i.test(senses[0].definition)) return senses;
  return [{ ...senses[0], definition: `<sub>${count}</sub> ${senses[0].definition}` }, ...senses.slice(1)];
}
