import { classifyDictionaryResponse, dictionaryQueryHref, type DictionaryId } from "./dictionary-search";

export interface DictionaryPreview { headword: string; excerpt: string; href: string; identity?: string; label?: string }
const cache = new Map<string, { at: number; entries: DictionaryPreview[] }>();
const MAX_CACHE = 30;

/** Parse inert HTML to text; never inject upstream markup into the live document. */
export function dictionaryExcerpt(html: string, limit = 550): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,.footnote").forEach(node => node.remove());
  doc.querySelectorAll("p,div,br,li").forEach(node => node.append(" "));
  const text = (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
}

export async function fetchSelectionDictionary(id: DictionaryId, query: string, signal: AbortSignal): Promise<DictionaryPreview[]> {
  const key = `${id}:${query}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 300_000) return hit.entries;
  const response = await fetch(`/api/${id}/search?query=${encodeURIComponent(query)}`, { signal });
  if (!response.ok) {
    const outcome = await classifyDictionaryResponse(response);
    throw new Error(outcome.kind === "ok" ? "Unexpected response." : outcome.message);
  }
  const body: unknown = await response.json();
  if (!Array.isArray(body)) throw new Error("The dictionary returned an unexpected response.");
  const entries = body.map(entry => {
    const definitions: unknown = id === "ben-yehuda" ? entry?.content?.definition
      : entry?.content?.senses?.map((sense: { definition?: unknown }) => sense?.definition);
    if (typeof entry?.headword !== "string" || !Array.isArray(definitions) ||
        !definitions.every(part => typeof part === "string") ||
        (entry.rid !== undefined && typeof entry.rid !== "string")) {
      throw new Error("The dictionary returned an unexpected entry. Please retry.");
    }
    return {
      headword: dictionaryExcerpt(entry.headword),
      excerpt: dictionaryExcerpt(definitions.join(" ")),
      identity: entry.rid,
      href: dictionaryQueryHref(id, entry.headword) +
        (entry.rid && id !== "bdb" ? `&rid=${encodeURIComponent(entry.rid)}` : ""),
    };
  });
  if (!signal.aborted && entries.length) {
    cache.delete(key);
    cache.set(key, { at: Date.now(), entries });
    while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value!);
  }
  return entries;
}
