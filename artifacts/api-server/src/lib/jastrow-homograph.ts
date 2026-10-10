// Roman numerals and superscript digits are independent parts of an identity.
const suffix = /\s*(?:[IVX]+(?:\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?|[⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*$/;
export const hasJastrowHomograph = (query: string) => suffix.test(query);
export const jastrowLookupForm = (query: string) =>
  query.replace(suffix, "").normalize("NFD").replace(/[\u0591-\u05c7]/g, "").trim();
const identity = (word: string) => word.normalize("NFD")
  .replace(/[\u0591-\u05c7]/g, "").replace(/\s+/g, "");
export function selectJastrowHomograph<T extends { headword: string; rid?: string }>(query: string, entries: T[]): T[] {
  return entries.filter((entry, index) =>
    identity(entry.headword) === identity(query) &&
    entries.findIndex(other => entry.rid ? other.rid === entry.rid : other.headword === entry.headword) === index);
}
