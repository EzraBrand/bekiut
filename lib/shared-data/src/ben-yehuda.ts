/** Source paragraphs are intentionally distinct from Jastrow senses. */
export interface BenYehudaEntry {
  headword: string;
  rid?: string;
  parent_lexicon: "Ben Yehuda Dictionary";
  content: { definition: string[] };
  prev_hw?: string;
  next_hw?: string;
}

export function benYehudaHref(headword: string, rid?: string): string {
  return `/ben-yehuda?q=${encodeURIComponent(headword)}${rid ? `&rid=${encodeURIComponent(rid)}` : ""}`;
}

/** Only the terminal numeric paragraph address is stripped, never Roman numerals. */
export function benYehudaHeadwordFromRef(ref: string): string | null {
  let decoded: string;
  try { decoded = decodeURIComponent(ref); } catch { return null; }
  decoded = decoded.replace(/^https?:\/\/(?:www\.)?sefaria\.org(?:\.il)?\//, "").replace(/^\//, "");
  const match = decoded.match(/^Ben[ _]Yehuda[ _]Dictionary,[ _](.+?)(?:\.\d+)?$/);
  if (!match || /^Prolegomena(?:[ ,_]|$)/.test(match[1])) return null;
  return match[1].replace(/_/g, " ").trim();
}
