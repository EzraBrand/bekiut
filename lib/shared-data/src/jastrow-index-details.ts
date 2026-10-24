export interface SourceEntry {
  headword: string;
  rid: string;
  parent_lexicon: string;
  content: { senses?: SourceSense[] };
}
interface SourceSense { definition?: string; senses?: SourceSense[] }
export interface EntryDetail {
  status: "ready";
  rid: string;
  words: number;
  see?: { headword: string; rid?: string };
}

const identity = (word: string) => word.normalize("NFD").replace(/\s+/g, "");

export function selectExactEntry(headword: string, entries: unknown[]): SourceEntry | undefined {
  const matches = entries.filter((entry): entry is SourceEntry => {
    if (!entry || typeof entry !== "object") return false;
    const row = entry as SourceEntry;
    return row.parent_lexicon === "Jastrow Dictionary" &&
      typeof row.headword === "string" && typeof row.rid === "string" &&
      identity(row.headword) === identity(headword) && Array.isArray(row.content?.senses);
  });
  const unique = [...new Map(matches.map(row => [row.rid, row])).values()];
  return unique.length === 1 ? unique[0] : undefined;
}

export function plainDefinition(html: string): string {
  return html.replace(/<[^>]*>/g, " ")
    .replace(/&#x([a-f0-9]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/g, (_, name: string) =>
      ({ nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" })[name]!)
    .replace(/\s+/g, " ").trim();
}

function definitions(senses: SourceSense[]): string[] {
  return senses.flatMap(sense => [
    ...(typeof sense.definition === "string" ? [sense.definition] : []),
    ...definitions(sense.senses ?? []),
  ]);
}

export function buildEntryDetail(entry: SourceEntry): EntryDetail {
  const html = definitions(entry.content.senses ?? []).join(" ");
  const text = plainDefinition(html);
  const words = [...new Intl.Segmenter("en", { granularity: "word" }).segment(text)]
    .filter(segment => segment.isWordLike).length;
  const detail: EntryDetail = { status: "ready", rid: entry.rid, words };
  // Exactly one explicit Jastrow link introduced by see/v./vide, with no
  // independent definition or prose after it. Uncertain cases keep a count.
  const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)];
  if (links.length !== 1) return detail;
  const link = links[0];
  const before = plainDefinition(html.slice(0, link.index));
  const after = plainDefinition(html.slice((link.index ?? 0) + link[0].length));
  if (!/^[,;:\s]*(?:see|v\.|vide)\s*$/i.test(before) || !/^[.;,\s]*$/.test(after)) return detail;
  const ref = link[1].match(/data-ref=["']Jastrow,\s*([^"']+)["']/i)?.[1];
  if (!ref) return detail;
  // A .1 / " 1" suffix in a text reference is a segment, not a homograph.
  const target = plainDefinition(ref).replace(/[. ]\d+(?::\d+)*$/, "").trim();
  if (target && /[\u05d0-\u05ea]/.test(target)) detail.see = { headword: target };
  return detail;
}
