/**
 * Refresh the limited ל index experiment. Raw responses are cached locally;
 * only compact, source-derived metadata is shipped to readers.
 * Run: pnpm --filter @workspace/scripts exec tsx src/generate-jastrow-lamed-details.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildEntryDetail, selectExactEntry } from "@workspace/shared-data/jastrow-index-details";

const root = fileURLToPath(new URL("../../", import.meta.url));
const sourcePath = `${root}artifacts/chavrutai/src/shared/data/lexicon-headwords/jastrow.json`;
const outputPath = `${root}artifacts/chavrutai/src/shared/data/lexicon-headwords/jastrow-lamed-details.json`;
const cache = `${root}scripts/.cache/jastrow-lamed`;
await mkdir(cache, { recursive: true });
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const words: string[] = source.headwords.filter((word: string) => word.startsWith("ל"));
const records: Record<string, ReturnType<typeof buildEntryDetail> | { status: "unavailable" | "ambiguous" }> = {};
let cursor = 0;
let completed = 0;
async function getEntries(word: string): Promise<unknown[]> {
  const path = `${cache}/${encodeURIComponent(word)}.json`;
  try { return JSON.parse(await readFile(path, "utf8")); } catch { /* Fetch missing cache entries. */ }
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const lookup = word.replace(/\s*(?:[IVX]+(?:\s*[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?|[⁰¹²³⁴⁵⁶⁷⁸⁹]+)\s*$/, "");
      const response = await fetch(`https://www.sefaria.org/api/words/${encodeURIComponent(lookup)}?lexicon=Jastrow%20Dictionary`, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const entries = await response.json();
      if (!Array.isArray(entries)) throw new Error("Unexpected lexicon response");
      await writeFile(path, JSON.stringify(entries));
      return entries;
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
    }
  }
  throw lastError;
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < words.length) {
    const word = words[cursor++];
    try {
      const entry = selectExactEntry(word, await getEntries(word));
      records[word] = entry ? buildEntryDetail(entry) : { status: "ambiguous" };
    } catch (error) {
      console.error(`Unavailable: ${word}: ${String(error)}`);
      records[word] = { status: "unavailable" };
    }
    completed++;
    if (completed % 50 === 0) console.log(`${completed}/${words.length}`);
  }
}));
const output = {
  generatedAt: new Date().toISOString(),
  source: "https://www.sefaria.org/api/words/",
  letter: "ל",
  counting: "Original definition text including quotations and citations; HTML and headwords excluded. Unicode word segments.",
  entries: records,
};
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n");
const counts = Object.values(records).reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log(JSON.stringify(counts));
