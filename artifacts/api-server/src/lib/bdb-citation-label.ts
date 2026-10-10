/**
 * Metadata supplies the book/chapter context, never replacement evidence.
 * Keep the printed locator and everything after it (f., ff., punctuation, etc.).
 * In particular a disagreement such as printed 149:9 / metadata 140:9 must
 * not silently rewrite the printed citation. The href remains independent.
 */
export function bdbCitationLabel(source: string, reference: string): string {
  const ref = reference.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
  const printed = source.match(/^((?:(?:[1-3]\s*)?[^\d]+?)?)(\d+(?::\d+)?(?:[-–]\d+(?::\d+)?)?)([\s\S]*)$/u);
  if (!ref || !printed) return source;
  const [, book, chapter, verse] = ref;
  const [, , locator, qualifiers] = printed;
  const contextualLocator = !locator.includes(":") && verse
    ? `${chapter}:${locator}` : locator;
  return `${book} ${contextualLocator}${qualifiers}`;
}
