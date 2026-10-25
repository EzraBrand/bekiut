import { ALL_BIBLE_BOOKS } from "@workspace/shared-data/bible-books";

/** A range opens at its first verse; the Bible reader displays one chapter. */
export function bibleInputHref(input: string): string | null {
  let ref = input.trim();
  try {
    if (/^https?:\/\//i.test(ref)) {
      const url = new URL(ref);
      if (!/^(www\.)?sefaria\.org(\.il)?$/i.test(url.hostname)) return null;
      ref = url.pathname.slice(1);
    }
    ref = decodeURIComponent(ref).replace(/_/g, " ");
  } catch { return null; }
  const match = ref.match(/^(.+?)[ .](\d+)(?:[.:](\d+))?(?:-\d+(?:[.:]\d+)?)?$/);
  if (!match) return null;
  const book = ALL_BIBLE_BOOKS.find(book =>
    [book.name, book.sefaria, book.slug, book.hebrew].some(name => name.toLowerCase() === match[1].toLowerCase()));
  const chapter = Number(match[2]);
  const verse = Number(match[3] || 1);
  if (!book || chapter < 1 || chapter > book.chapters || verse < 1) return null;
  return `/bible/${book.slug}/${chapter}#${verse}`;
}

export function rangeEndPages(pages: string[], from: string): string[] {
  const start = pages.indexOf(from);
  return start < 0 ? [] : pages.slice(start, start + 10);
}
