import type { DictionaryEntry } from "@/lib/dictionary-format";

export type DictionaryId = "jastrow" | "bdb";

export type DictionarySearchFailure =
  | { kind: "unavailable"; message: string }
  | { kind: "error"; message: string; status?: number };

export type DictionarySearchOutcome =
  | { kind: "ok"; entries: DictionaryEntry[] }
  | DictionarySearchFailure;

export const DICTIONARY_LABELS: Record<DictionaryId, { name: string; scope: string; path: string }> = {
  jastrow: { name: "Jastrow", scope: "rabbinic Hebrew and Aramaic", path: "/jastrow" },
  bdb: { name: "BDB", scope: "biblical Hebrew", path: "/bdb" },
};

export function otherDictionary(id: DictionaryId): DictionaryId {
  return id === "jastrow" ? "bdb" : "jastrow";
}

export function dictionaryQueryHref(id: DictionaryId, query: string): string {
  const q = query.trim();
  return q ? `${DICTIONARY_LABELS[id].path}?q=${encodeURIComponent(q)}` : DICTIONARY_LABELS[id].path;
}

export function filterValidEntries(entries: unknown): DictionaryEntry[] {
  return Array.isArray(entries)
    ? entries.filter((entry: DictionaryEntry) =>
        entry && entry.headword && entry.content && Array.isArray(entry.content.senses))
    : [];
}

/** Classify a dictionary search response per the backend contract. */
export async function classifyDictionaryResponse(response: Response): Promise<DictionarySearchOutcome> {
  let body: unknown = null;
  try { body = await response.json(); } catch { body = null; }
  if (response.ok) {
    if (!Array.isArray(body)) return { kind: "error", message: "The dictionary returned an unexpected response." };
    return { kind: "ok", entries: filterValidEntries(body) };
  }
  const payload = (body && typeof body === "object" ? body : {}) as { message?: unknown; code?: unknown };
  const serverMessage = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : "";
  if (response.status === 503 || payload.code === "DICTIONARY_UNAVAILABLE") {
    return { kind: "unavailable", message: serverMessage || "The dictionary service is temporarily unavailable." };
  }
  return {
    kind: "error",
    status: response.status,
    message: serverMessage || `The search could not be completed (error ${response.status}).`,
  };
}
