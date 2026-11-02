/** Editorial stars are not part of the lookup spelling. Keep source display intact. */
export function cleanDictionaryQuery(query: string): string {
  return query.normalize("NFC").trim().replace(/^[*†‡]+\s*/, "");
}

export function unpointedDictionaryQuery(query: string): string {
  return query.normalize("NFD").replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "").normalize("NFC");
}

export class DictionaryUnavailableError extends Error {
  constructor() {
    super("Dictionary service temporarily unavailable");
    this.name = "DictionaryUnavailableError";
  }
}
