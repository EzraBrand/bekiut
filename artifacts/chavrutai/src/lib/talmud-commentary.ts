/**
 * Reader-specific extraction of the running commentary from the English
 * Talmud text.
 *
 * `processEnglishText` has already established paragraph boundaries by the
 * time this function is called.  This module deliberately works on those
 * boundaries rather than changing the shared text-processing pipeline.
 */

export interface TalmudCommentaryParagraph {
  html: string;
  noteNumber?: number;
}

export interface TalmudCommentaryNote {
  number: number;
  paragraphs: string[];
}

export interface TalmudCommentary {
  paragraphs: TalmudCommentaryParagraph[];
  notes: TalmudCommentaryNote[];
}

interface OpenTag {
  name: string;
  normalizedName: string;
  markup: string;
}

interface ProcessedLine {
  html: string;
  isTranslation: boolean;
  isSectionMarker: boolean;
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

const HTML_ENTITY_PATTERN = /&(?:#x[\da-f]+|#\d+|[a-z][a-z\d]+);/gi;
const WHITESPACE_ENTITY_PATTERN = /&(?:nbsp|#160|#x*a0|tab|newline);/gi;

/**
 * Find the end of an HTML tag while allowing `>` in a quoted attribute.
 */
function findTagEnd(text: string, start: number): number {
  let quote: '"' | "'" | null = null;

  for (let index = start + 1; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index;
    }
  }

  return -1;
}

function parseTag(markup: string): {
  type: 'open' | 'close' | 'other';
  name?: string;
  selfClosing?: boolean;
} {
  if (markup.startsWith('<!--') || markup.startsWith('<!') || markup.startsWith('<?')) {
    return { type: 'other' };
  }

  const match = markup.match(/^<\s*(\/?)\s*([A-Za-z][\w:-]*)([\s\S]*?)>$/);
  if (!match) return { type: 'other' };

  const [, slash, name, rest] = match;
  if (slash) return { type: 'close', name };

  return {
    type: 'open',
    name,
    selfClosing: VOID_ELEMENTS.has(name.toLowerCase()) || /\/\s*>$/.test(markup),
  };
}

function hasSectionMarkerClass(markup: string): boolean {
  const classAttribute = markup.match(
    /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i,
  );
  if (!classAttribute) return false;

  const classValue = classAttribute[1] || classAttribute[2] || classAttribute[3] || '';
  return classValue.split(/\s+/).some(className => className.toLowerCase() === 'section-marker');
}

function hasSubstantiveCharacter(text: string): boolean {
  // Punctuation entity names are not letters. Decode numeric references so
  // encoded letters/numbers still count as substantive translation.
  const withoutEntities = text.replace(HTML_ENTITY_PATTERN, entity => {
    if (!entity.startsWith('&#')) return '';
    const hex = /^&#x/i.test(entity);
    const codePoint = parseInt(entity.slice(hex ? 3 : 2, -1), hex ? 16 : 10);
    return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : '';
  });
  return /[\p{L}\p{N}]/u.test(withoutEntities);
}

function hasVisibleText(text: string): boolean {
  const withoutWhitespaceEntities = text.replace(WHITESPACE_ENTITY_PATTERN, '');
  return /\S/.test(withoutWhitespaceEntities);
}

function closingMarkup(tag: OpenTag): string {
  return `</${tag.name}>`;
}

/**
 * Process one newline-delimited paragraph while carrying the HTML stack from
 * the preceding paragraph.  Every returned paragraph is independently valid
 * HTML: tags open at a boundary are closed at the end and reopened at the
 * beginning of the next paragraph.
 */
function processLine(line: string, openTags: OpenTag[]): ProcessedLine | null {
  const tagsAtStart = openTags.slice();
  let hasBoldText = false;
  let hasSectionMarker = false;
  let hasText = false;
  let sawOpeningTag = false;
  let sawClosingTag = false;
  let cursor = 0;

  const consumeText = (text: string) => {
    if (!text) return;
    if (hasVisibleText(text)) hasText = true;

    const inBold = openTags.some(
      tag => tag.normalizedName === 'b' || tag.normalizedName === 'strong',
    );
    if (inBold && hasSubstantiveCharacter(text)) hasBoldText = true;

    if (openTags.some(tag => tag.normalizedName === 'span' && hasSectionMarkerClass(tag.markup))) {
      hasSectionMarker = true;
    }
  };

  while (cursor < line.length) {
    const tagStart = line.indexOf('<', cursor);
    if (tagStart === -1) {
      consumeText(line.slice(cursor));
      break;
    }

    if (tagStart > cursor) {
      consumeText(line.slice(cursor, tagStart));
    }

    const tagEnd = findTagEnd(line, tagStart);
    if (tagEnd === -1) {
      // A literal less-than sign is text, not an HTML tag.
      consumeText(line.slice(tagStart));
      break;
    }

    const markup = line.slice(tagStart, tagEnd + 1);
    const parsed = parseTag(markup);
    if (parsed.type === 'other') {
      // Comments/declarations are retained in the HTML but do not contribute
      // visible or substantive text.
      cursor = tagEnd + 1;
      continue;
    }

    if (parsed.type === 'open' && parsed.name) {
      sawOpeningTag = true;
      if (hasSectionMarkerClass(markup)) hasSectionMarker = true;
      if (!parsed.selfClosing) {
        openTags.push({
          name: parsed.name,
          normalizedName: parsed.name.toLowerCase(),
          markup,
        });
      }
    } else if (parsed.type === 'close' && parsed.name) {
      sawClosingTag = true;
      const normalizedName = parsed.name.toLowerCase();
      for (let index = openTags.length - 1; index >= 0; index -= 1) {
        if (openTags[index].normalizedName === normalizedName) {
          openTags.splice(index);
          break;
        }
      }
    }

    cursor = tagEnd + 1;
  }

  // Empty formatting tags are not translation, but retaining a complete
  // empty element avoids silently dropping source markup.  A boundary-only
  // closing tag (which can occur when formatting crosses a newline) is still
  // ignored.
  const hasEmptyElement = sawOpeningTag && sawClosingTag;
  if (!hasText && !hasSectionMarker && !hasEmptyElement) return null;

  const prefix = tagsAtStart.map(tag => tag.markup).join('');
  const suffix = openTags
    .slice()
    .reverse()
    .map(tag => closingMarkup(tag))
    .join('');

  return {
    html: `${prefix}${line.trim()}${suffix}`,
    isTranslation: hasBoldText || hasSectionMarker,
    isSectionMarker: hasSectionMarker,
  };
}

/**
 * Extract standalone non-bold Talmud commentary into numbered notes.
 *
 * Bold/strong text is the translated text; a paragraph containing any
 * substantive Unicode letter or number inside one of those tags remains in
 * the main text. Complete commentary blocks ending in .?! can become notes;
 * comma/semicolon/colon/dash-linked paragraphs are evaluated together. The opening
 * prose paragraph stays inline, and each complete note block needs at least 13 words.
 */
export function extractTalmudCommentary(processed: string): TalmudCommentary {
  if (!processed) return { paragraphs: [], notes: [] };

  const openTags: OpenTag[] = [];
  const lines = processed.replace(/\r\n?/g, '\n').split('\n');
  const keptParagraphs: TalmudCommentaryParagraph[] = [];
  const notes: TalmudCommentaryNote[] = [];
  let pendingNoteParagraphs: string[] = [];
  let pendingWordCount = 0;
  let nextNoteNumber = 1;
  let continuesPreviousClause = false;
  let hasOpeningParagraph = false;

  const commitNote = () => {
    if (pendingNoteParagraphs.length === 0) return;
    if (pendingWordCount < 13) {
      keptParagraphs.push(...pendingNoteParagraphs.map(html => ({ html })));
      pendingNoteParagraphs = [];
      pendingWordCount = 0;
      return;
    }

    const number = nextNoteNumber;
    nextNoteNumber += 1;
    notes.push({ number, paragraphs: pendingNoteParagraphs });

    if (keptParagraphs.length === 0) {
      keptParagraphs.push({ html: '', noteNumber: number });
    } else {
      keptParagraphs[keptParagraphs.length - 1].noteNumber = number;
    }
    pendingNoteParagraphs = [];
    pendingWordCount = 0;
  };

  const classified = lines.flatMap(line => {
    const processedLine = processLine(line, openTags);
    if (!processedLine) return [];

    // Inspect rendered punctuation, not closing formatting/citation tags.
    const visibleText = processedLine.html
      .replace(/<[^>]*>/g, '')
      .replace(/&(?:quot|rdquo|ldquo);/gi, '"')
      .replace(/&(?:apos|rsquo|lsquo);/gi, "'")
      .replace(/&(?:nbsp|#160);/gi, ' ')
      .trim();
    const words = visibleText
      .replace(/&#(x[\da-f]+|\d+);/gi, (_, value: string) => {
        const code = /^x/i.test(value) ? parseInt(value.slice(1), 16) : parseInt(value, 10);
        return code <= 0x10ffff ? String.fromCodePoint(code) : '';
      })
      .replace(/&[a-z][a-z\d]*;/gi, ' ')
      .split(/\s+/)
      .filter(word => /[\p{L}\p{N}]/u.test(word));
    const isOpening = words.length > 0 && !processedLine.isSectionMarker && !hasOpeningParagraph;
    if (words.length > 0 && !processedLine.isSectionMarker) {
      hasOpeningParagraph = true;
    }
    return [{
      ...processedLine,
      visibleText,
      eligible: !processedLine.isTranslation && words.length > 0 && !isOpening,
      wordCount: words.length,
      complete: /[.?!][”’"')\]]*$/.test(visibleText),
      linksNext: /[,;:—–-][”’"')\]]*$/.test(visibleText),
    }];
  });

  for (let index = 0; index < classified.length; index += 1) {
    const first = classified[index];
    let end = index;
    // A linked clause can move only with its complete, wholly unbolded
    // continuation. Never extract a prefix of an unfinished commentary block.
    if (first.eligible && !continuesPreviousClause) {
      while (classified[end].linksNext && classified[end + 1]?.eligible) {
        end += 1;
      }
    }
    const moveBlock = first.eligible && !continuesPreviousClause && classified[end].complete;
    const block = classified.slice(index, end + 1);

    if (!moveBlock) {
      commitNote();
      keptParagraphs.push(...block.map(paragraph => ({ html: paragraph.html })));
    } else {
      pendingNoteParagraphs.push(...block.map(paragraph => paragraph.html));
      pendingWordCount += block.reduce((total, paragraph) => total + paragraph.wordCount, 0);
    }
    for (const paragraph of block) {
      if (paragraph.visibleText) continuesPreviousClause = paragraph.linksNext;
    }
    index = end;
  }

  commitNote();

  return { paragraphs: keptParagraphs, notes };
}