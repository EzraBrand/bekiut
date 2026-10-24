/**
 * Generate all 22 letter shards from the Sefaria-derived raw GitHub dataset.
 * Downloads stay in ignored scripts/.cache; only compact metadata is shipped.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildEntryDetail, selectExactEntry, type SourceEntry } from "@workspace/shared-data/jastrow-index-details";

const root = fileURLToPath(new URL("../../", import.meta.url));
const revision = "05c8a79bbf2408f3909151d08d71a6f3e33e9ead";
const source = `https://github.com/UniquePixels/jastrow/tree/${revision}/data/raw`;
const cache = `${root}scripts/.cache/jastrow-bulk`;
const output = `${root}artifacts/chavrutai/src/shared/data/lexicon-headwords/jastrow-entry-details`;
await mkdir(cache, { recursive: true });
await mkdir(output, { recursive: true });
const byHeadword = new Map<string, SourceEntry[]>();
const identity = (word: string) => word.normalize("NFD").replace(/\s+/g, "");
for (const part of [1, 2]) {
  const path = `${cache}/${revision}-part${part}.jsonl`;
  let raw: string;
  try { raw = await readFile(path, "utf8"); } catch {
    const response = await fetch(`https://raw.githubusercontent.com/UniquePixels/jastrow/${revision}/data/raw/jastrow-part${part}.jsonl`, { signal: AbortSignal.timeout(120000) });
    if (!response.ok) throw new Error(`Bulk source failed: HTTP ${response.status}`);
    raw = await response.text();
    await writeFile(path, raw);
  }
  for (const line of raw.split("\n").filter(Boolean)) {
    const entry = JSON.parse(line) as SourceEntry;
    if (entry.parent_lexicon !== "Jastrow Dictionary" || !entry.headword) continue;
    const key = identity(entry.headword);
    byHeadword.set(key, [...(byHeadword.get(key) ?? []), entry]);
  }
}
const index = JSON.parse(await readFile(`${root}artifacts/chavrutai/src/shared/data/lexicon-headwords/jastrow.json`, "utf8"));
const normalize = (word: string) => word.replace(/[\u0591-\u05c7]/g, "")
  .replace(/[ךםןףץ]/g, char => ({ ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" })[char]!);
let ready = 0, pointers = 0, unresolved = 0;
for (const letter of index._metadata.alphabet as string[]) {
  const entries: Record<string, ReturnType<typeof buildEntryDetail> | { status: "unavailable" }> = {};
  for (const word of index.headwords as string[]) {
    if (!normalize(word).startsWith(letter)) continue;
    const entry = selectExactEntry(word, byHeadword.get(identity(word)) ?? []);
    if (!entry) { entries[word] = { status: "unavailable" }; unresolved++; continue; }
    const detail = buildEntryDetail(entry);
    entries[word] = detail;
    ready++;
    if (detail.see) pointers++;
  }
  await writeFile(`${output}/${letter}.json`, JSON.stringify({
    source, license: "CC-BY-NC (Sefaria-derived source, as attributed by the repository)",
    generatedAt: new Date().toISOString(), letter,
    counting: "Approximate original-definition word counts including quotations and citations; excludes HTML and headwords.",
    entries,
  }) + "\n");
}
console.log({ ready, pointers, unresolved, source });
