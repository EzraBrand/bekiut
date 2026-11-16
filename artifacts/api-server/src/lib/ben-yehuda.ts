import type { BenYehudaEntry } from "@workspace/shared-data/ben-yehuda";
import { fetchSefaria } from "./sefaria-fetch";
import { AsyncTtlLruCache } from "./async-ttl-lru-cache";
import { DictionaryUnavailableError } from "./dictionary-recovery";
import { logger } from "./logger";

const cache = new AsyncTtlLruCache<BenYehudaEntry[]>(96, 120_000);
const linkedCache = new AsyncTtlLruCache<string[] | null>(96, 120_000);
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

/** Word lookup supplies identity; the reader endpoint supplies Sefaria's citation markup. */
export async function linkedBenYehudaDefinition(entry: BenYehudaEntry): Promise<BenYehudaEntry> {
  const definition = await linkedCache.load(entry.headword, async () => {
    try {
      const ref = `Ben Yehuda Dictionary, ${entry.headword}.1`;
      const response = await fetchSefaria(
        `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?return_format=wrap_all_entities`,
        {}, 4_000,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data || typeof data !== "object" || !("versions" in data) || !Array.isArray(data.versions)) {
        throw new Error("Invalid reader response");
      }
      const text = data.versions.find(v =>
        v && v.language === "he" && v.versionTitle === "Ben Yehuda Dictionary")?.text;
      // Never replace a complete word record with a partial or different response.
      if (!Array.isArray(text) || text.length !== entry.content.definition.length ||
          !text.every((p: unknown) => typeof p === "string")) throw new Error("Invalid reader paragraphs");
      return text as string[];
    } catch (error) {
      // Citation enrichment is optional: keep the complete source available on outage.
      // Cache this outcome briefly too, avoiding repeated slow upstream calls.
      logger.warn({ err: error, rid: entry.rid }, "Ben-Yehuda citation enrichment unavailable; serving source markup");
      return null;
    }
  }).value;
  return definition ? { ...entry, content: { definition } } : entry;
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
  const selected = selectBenYehudaEntries(entries, q, rid);
  return Promise.all(selected.map(linkedBenYehudaDefinition));
}
