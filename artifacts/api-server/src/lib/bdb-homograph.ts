const superscripts = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/g;
export const hasBdbHomograph = (query: string) => /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(query);
// Pointed lookup can resolve only the first root even after removing its
// superscript. The consonantal lookup returns candidates for all homographs.
export const bdbLookupForm = (query: string) => identity(query.replace(superscripts, ""));
const identity = (text: string) => text.normalize("NFD").replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "").trim();

/** Keep the requested homograph only; never substitute a different root. */
export function selectBdbHomograph<T extends { headword: string; rid?: string }>(query: string, entries: T[]): T[] {
  if (!hasBdbHomograph(query)) return entries;
  const exact = entries.filter(entry => identity(entry.headword) === identity(query));
  return [...new Map(exact.map(entry => [entry.rid || entry.headword, entry])).values()];
}
