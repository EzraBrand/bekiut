import type { BenYehudaEntry } from "@workspace/shared-data/ben-yehuda";
import { fetchSefaria } from "./sefaria-fetch";
import { AsyncTtlLruCache } from "./async-ttl-lru-cache";
import { DictionaryUnavailableError } from "./dictionary-recovery";

const cache = new AsyncTtlLruCache<BenYehudaEntry[]>(96, 120_000);
const normalize = (value: string) => value.normalize("NFC").trim();
const unpointed = (value: string) => normalize(value).replace(/[\u0591-\u05BD\u05BF-\u05C7]/g, "");

export function adaptBenYehudaWords(data: unknown): BenYehudaEntry[] {
  if (!Array.isArray(data)) throw new DictionaryUnavailableError();
  return data.filter((entry) => entry?.parent_lexicon === "Ben Yehuda Dictionary").map(entry => {
    if (typeof entry.headword !== "string" || !Array.isArray(entry.content?.definition) ||
        !entry.content.definition.every((paragraph: unknown) => typeof paragraph === "string")) {
      throw new DictionaryUnavailableError();
    }
    return {
      headword: entry.headword,
      parent_lexicon: "Ben Yehuda Dictionary" as const,
      ...(typeof entry.rid === "string" ? { rid: entry.rid } : {}),
      content: { definition: entry.content.definition },
      ...(typeof entry.prev_hw === "string" ? { prev_hw: entry.prev_hw } : {}),
      ...(typeof entry.next_hw === "string" ? { next_hw: entry.next_hw } : {}),
    };
  });
}

export function selectBenYehudaEntries(entries: BenYehudaEntry[], query: string, rid?: string) {
  if (rid) return entries.filter(entry => entry.rid === rid);
  const exact = entries.filter(entry => normalize(entry.headword) === normalize(query));
  if (exact.length) return exact;
  // A requested Roman-numeral homograph must never resolve to its sibling.
  if (/\s[IVXLCDM]+$/.test(query)) {
    return entries.filter(entry => unpointed(entry.headword) === unpointed(query));
  }
  return entries;
}

export async function searchBenYehuda(query: string, rid?: string): Promise<BenYehudaEntry[]> {
  const q = normalize(query);
  const entries = await cache.load(q, async () => {
    async function lookup(word: string) {
      const response = await fetchSefaria(`https://www.sefaria.org/api/words/${encodeURIComponent(word)}`);
      if (response.status === 404) return [];
      if (!response.ok) throw new DictionaryUnavailableError();
      const data = await response.json();
      // Sefaria sometimes represents a missing word as an error object.
      if (data && typeof data === "object" && "error" in data &&
          typeof data.error === "string" && /no (?:information|entry|entries)|not found/i.test(data.error)) return [];
      return adaptBenYehudaWords(data);
    }
    try {
      let found = await lookup(q);
      const bare = unpointed(q).replace(/\s[IVXLCDM]+$/, "");
      if (!found.length && bare !== q) found = await lookup(bare);
      return found;
    } catch (error) {
      if (error instanceof DictionaryUnavailableError) throw error;
      throw new DictionaryUnavailableError();
    }
  }).value;
  return selectBenYehudaEntries(entries, q, rid);
}
