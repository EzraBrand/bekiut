import { dictionaryExcerpt, type DictionaryPreview } from "./selection-dictionary";
import { wiktionaryHref } from "./hebrew-selection";

export type WiktionaryLanguage = "en" | "he";
const recent = new Map<string, { at: number; entries: DictionaryPreview[] }>();
const unexpected = () => new Error("Wiktionary returned an unexpected response. Try again or open the full entry.");

/** The English-edition definition endpoint groups entries by language, not by page. */
export function englishWiktionaryEntries(body: unknown, word: string): DictionaryPreview[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw unexpected();
  const entries: DictionaryPreview[] = [];
  for (const [code, language] of [["he", "Hebrew"], ["arc", "Aramaic"]] as const) {
    const groups = (body as Record<string, unknown>)[code];
    if (groups === undefined) continue;
    if (!Array.isArray(groups)) throw unexpected();
    groups.forEach((group, index) => {
      if (!group || group.language !== language || typeof group.partOfSpeech !== "string" ||
          !Array.isArray(group.definitions) ||
          !group.definitions.every((sense: { definition?: unknown }) => typeof sense?.definition === "string")) throw unexpected();
      const definitions = group.definitions.map((sense: { definition: string }) => dictionaryExcerpt(sense.definition));
      if (!definitions.length) return;
      entries.push({
        headword: word,
        label: `${language} · ${group.partOfSpeech}`,
        excerpt: dictionaryExcerpt(definitions.map((text: string, i: number) => `${i + 1}. ${text}`).join(" ")),
        href: `${wiktionaryHref("en", word)}#${language}`,
        identity: `${code}-${index}`,
      });
    });
  }
  // An API error object must not masquerade as a successful empty language result.
  if ("error" in body || "status" in body || !Object.values(body).every(Array.isArray)) throw unexpected();
  return entries;
}

/** Hebrew Wiktionary has no REST definition endpoint. Its Action API renders
 * numbered definition lists before each headword's subsidiary h3 sections.
 * Only those lists are excerpted: never grammar tables, citations or translations.
 */
export function hebrewWiktionaryEntries(body: unknown, word: string): DictionaryPreview[] {
  const response = body as { error?: { code?: string }; parse?: { title?: unknown; text?: unknown; pageid?: unknown } } | null;
  if (response?.error?.code === "missingtitle") return [];
  if (response?.error || typeof response?.parse?.title !== "string" || typeof response.parse.text !== "string") throw unexpected();
  const title = response.parse.title;
  const doc = new DOMParser().parseFromString(response.parse.text, "text/html");
  const content = doc.querySelector(".mw-parser-output");
  if (!content) throw unexpected();
  let headword = title;
  let anchor = "";
  let inDefinitions = true;
  const entries: DictionaryPreview[] = [];
  for (const element of Array.from(content.children)) {
    const heading = element.matches("h2,h3,h4,h5,h6") ? element : element.querySelector("h2,h3,h4,h5,h6");
    if (heading) {
      inDefinitions = heading.tagName === "H2";
      if (inDefinitions) {
        headword = heading.textContent?.trim() || title;
        anchor = heading.id;
      }
      continue;
    }
    if (!inDefinitions || element.tagName !== "OL") continue;
    const definitions = Array.from(element.children).filter(node => node.tagName === "LI").map(node => {
      const copy = node.cloneNode(true) as Element;
      copy.querySelectorAll("dl,ul,ol,sup,script,style").forEach(child => child.remove());
      return dictionaryExcerpt(copy.innerHTML);
    }).filter(Boolean);
    if (!definitions.length) continue;
    entries.push({
      headword, label: "Hebrew",
      excerpt: dictionaryExcerpt(definitions.map((text, i) => `${i + 1}. ${text}`).join(" ")),
      href: `${wiktionaryHref("he", title)}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`,
      identity: `${response.parse.pageid ?? word}-${entries.length}`,
    });
  }
  if (!entries.length) throw new Error("The Wiktionary page exists, but a definition preview is unavailable. Open the full entry below.");
  return entries;
}

export async function fetchWiktionaryPreview(language: WiktionaryLanguage, word: string, signal: AbortSignal): Promise<DictionaryPreview[]> {
  const key = `${language}:${word}`;
  const cached = recent.get(key);
  if (cached && Date.now() - cached.at < 300_000) return cached.entries;
  const url = language === "en"
    ? `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`
    : `https://he.wiktionary.org/w/api.php?${new URLSearchParams({
      action: "parse", page: word, prop: "text", format: "json", formatversion: "2", origin: "*", redirects: "1",
    })}`;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 12_000);
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer" });
    if (language === "en" && response.status === 404) return [];
    if (!response.ok) throw new Error(`Wiktionary is unavailable (HTTP ${response.status}). Try again or use the links below.`);
    const body: unknown = await response.json();
    const entries = language === "en" ? englishWiktionaryEntries(body, word) : hebrewWiktionaryEntries(body, word);
    if (entries.length && !controller.signal.aborted) {
      recent.delete(key);
      recent.set(key, { at: Date.now(), entries });
      while (recent.size > 30) recent.delete(recent.keys().next().value!);
    }
    return entries;
  } catch (error) {
    if (signal.aborted) throw error;
    if (controller.signal.aborted) throw new Error("Wiktionary took too long to respond. Retry or open the full entry below.");
    if (error instanceof TypeError) throw new Error("Could not reach Wiktionary. Check your connection or open the full entry below.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}
