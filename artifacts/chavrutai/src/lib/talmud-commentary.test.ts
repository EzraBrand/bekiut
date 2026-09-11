import { describe, expect, it } from 'vitest';
import { extractTalmudCommentary } from './talmud-commentary';

describe('extractTalmudCommentary', () => {
  it.each([',', ';', ':', '?', '!', '—', ''])('keeps section-opening prose inline (%s)', ending => {
    const html = `An explanation with enough words to remain inline${ending}`;
    expect(extractTalmudCommentary(html)).toEqual({ paragraphs: [{ html }], notes: [] });
  });

  it('moves both Berakhot 3a:4 explanatory questions together', () => {
    const paragraphs = [
      'These watches are mentioned in the Bible as segments of the night, but it must be established: Into precisely how many segments is the night divided, 3 or 4?',
      "Moreover, why does R' Eliezer employ such inexact parameters rather than a more precise definition of time (Tosefot HaRosh)?",
    ];
    expect(extractTalmudCommentary(['<b>Translated statement.</b>', ...paragraphs].join('\n')).notes)
      .toEqual([{ number: 1, paragraphs }]);
  });

  it('moves the Berakhot 2b:18 semicolon-linked explanation as one complete block', () => {
    const paragraphs = [
      "Regarding R' Meir’s argument, R' Yehuda asks that since the priests immerse themselves before twilight, they have a long wait until nightfall;",
      'clearly their immersion takes place while it is still day.',
    ];
    const result = extractTalmudCommentary(['<b>Translated statement.</b>', ...paragraphs].join('\n'));
    expect(result).toEqual({
      paragraphs: [{ html: '<b>Translated statement.</b>', noteNumber: 1 }],
      notes: [{ number: 1, paragraphs }],
    });
  });

  it.each([',', ';', ':', '—'])('keeps unfinished blocks and bold-linked continuations inline (%s)', ending => {
    const opening = '<b>Translated statement.</b>';
    const clause = `This explanatory clause has enough words to remain deliberately unfinished within this translated passage${ending}`;
    const continuation = 'Its continuation contains <b>translation</b> and must therefore remain inline within the same translated passage.';
    expect(extractTalmudCommentary(`${opening}\n${clause}`).notes).toEqual([]);
    expect(extractTalmudCommentary(`${opening}\n${clause}\n${continuation}`).notes).toEqual([]);
    expect(extractTalmudCommentary(`<b>${clause}</b>\nThis unbolded continuation must stay attached to the translated clause throughout this paragraph today.`).notes).toEqual([]);
  });

  it('accumulates complete linked blocks and preserves the whole opening block', () => {
    const clause = 'This explanatory clause has enough words to become commentary in this translated section today;';
    const short = 'but not this short continuation.';
    expect(extractTalmudCommentary(`<b>Translation.</b>\n${clause}\n${short}`)).toEqual({
      paragraphs: [{ html: '<b>Translation.</b>', noteNumber: 1 }],
      notes: [{ number: 1, paragraphs: [clause, short] }],
    });
    expect(extractTalmudCommentary(`${clause}\nThis continuation has enough words but belongs to the opening in this translated section today.`).notes).toEqual([]);
  });

  it('preserves linked formatting and accepts terminal punctuation inside closing quotes', () => {
    const paragraphs = [
      'This <i>explanation</i> has enough words to move into notes within this translated section;',
      'its <a href="/bible/Genesis/1">linked continuation</a> has enough words to complete the explanation while preserving formatting exactly!”',
    ];
    expect(extractTalmudCommentary(['<b>Translation.</b>', ...paragraphs].join('\n')).notes)
      .toEqual([{ number: 1, paragraphs }]);
  });

  it('keeps the Berakhot 3b:14 verse continuation inline and moves only the explanation', () => {
    const result = extractTalmudCommentary(
      '<b>“My eyes forestall the watches,\n</b> that I will speak of Your word” (<a href="/bible/Psalms/119#148">Psalms 119:148</a>).\nTaken together, these verses indicate that their author, King David, rose at midnight, two watches before dawn, in order to study Torah.',
    );
    expect(result.paragraphs).toHaveLength(2);
    expect(result.paragraphs[1].html).toContain('that I will speak of Your word');
    expect(result.paragraphs[1].noteNumber).toBe(1);
    expect(result.notes).toHaveLength(1);
    expect(result.notes[0].paragraphs).toHaveLength(1);
    expect(result.notes[0].paragraphs[0]).toMatch(/^Taken together/);
  });

  it('keeps an isolated eleven-word David sentence inline but joins adjacent commentary', () => {
    const translation = '<b>Translation.</b>';
    const davidSentence = 'their author, King David, rose at midnight, two watches before dawn.';
    const adjacentCommentary = 'It follows.';

    expect(extractTalmudCommentary(`${translation}\n${davidSentence}`)).toEqual({
      paragraphs: [{ html: translation }, { html: davidSentence }],
      notes: [],
    });
    expect(extractTalmudCommentary(`${translation}\n${davidSentence}\n${adjacentCommentary}`)).toEqual({
      paragraphs: [{ html: translation, noteNumber: 1 }],
      notes: [{ number: 1, paragraphs: [davidSentence, adjacentCommentary] }],
    });
  });

  it('keeps the Berakhot 3b:9 semicolon clause inline', () => {
    const html = 'The Talmud responds: Generally speaking, two individuals need not be concerned about demons;';
    const result = extractTalmudCommentary(`${html}\nbut, if they are <b>in their place,</b> we are concerned about demons.`);
    expect(result.notes).toEqual([]);
    expect(result.paragraphs[0].html).toBe(html);
  });

  it('handles entirely unbolded sections, empty sections, and resets numbering', () => {
    expect(extractTalmudCommentary('')).toEqual({ paragraphs: [], notes: [] });
    for (let i = 0; i < 2; i++) {
      expect(extractTalmudCommentary(
        'First explanation sentence contains enough words for inline prose throughout this section today.\n' +
        'Second explanation contains enough words to become a note for readers in this section today.',
      )).toEqual({
        paragraphs: [{
          html: 'First explanation sentence contains enough words for inline prose throughout this section today.',
          noteNumber: 1,
        }],
        notes: [{
          number: 1,
          paragraphs: ['Second explanation contains enough words to become a note for readers in this section today.'],
        }],
      });
    }
  });

  it('counts substantive words across adjacent paragraphs, ignoring HTML tags and entities', () => {
    const translation = '<b>The translated statement has enough words to open this section.</b>';
    const twelveWords = 'One <i>two</i> three four five six seven eight nine ten eleven twelve.';
    const thirteenWords = 'One <i>two</i> three four five six seven eight nine ten eleven twelve thirteen.';

    expect(extractTalmudCommentary(`${translation}\n${twelveWords}\n${thirteenWords}`)).toEqual({
      paragraphs: [
        { html: translation, noteNumber: 1 },
      ],
      notes: [{ number: 1, paragraphs: [twelveWords, thirteenWords] }],
    });

    const entityIsNotAWord = 'One two three four five six seven &mdash; eight nine ten eleven twelve.';
    expect(extractTalmudCommentary(`${translation}\n${entityIsNotAWord}`)).toEqual({
      paragraphs: [
        { html: translation },
        { html: entityIsNotAWord },
      ],
      notes: [],
    });
  });

  it('uses thirteen words as the inclusive total note threshold', () => {
    const twelveWords = 'One two three four five six seven eight nine ten eleven twelve.';
    const thirteenthWord = 'Thirteen.';

    expect(extractTalmudCommentary(`<b>Translation.</b>\n${twelveWords}`)).toEqual({
      paragraphs: [
        { html: '<b>Translation.</b>' },
        { html: twelveWords },
      ],
      notes: [],
    });

    expect(extractTalmudCommentary(`<b>Translation.</b>\n${twelveWords}\n${thirteenthWord}`)).toEqual({
      paragraphs: [
        { html: '<b>Translation.</b>', noteNumber: 1 },
      ],
      notes: [{ number: 1, paragraphs: [twelveWords, thirteenthWord] }],
    });
  });

  it('distinguishes encoded substantive characters from encoded punctuation', () => {
    const result = extractTalmudCommentary('<b>&#65;&#x31;</b>\n<b>&mdash;&#8212;</b>');
    expect(result.paragraphs).toEqual([{ html: '<b>&#65;&#x31;</b>' }, { html: '<b>&mdash;&#8212;</b>' }]);
    expect(result.notes).toEqual([]);
  });
  it('extracts the two-paragraph Berakhot 2a example as one note', () => {
    const processed = [
      '<span class="section-marker">Mishnah</span>',
      '<b>From when does one recite Shema in the evening? From the time when the priests enter to partake of their teruma.</b>',
      '<b>Until when does the time for the recitation of the evening Shema extend?</b>',
      'The term used in the Torah (Deuteronomy 6:7) to indicate the time for the recitation of the evening Shema is <i>beshokhbekha</i>, when you lie down.',
      'Therefore, the time for the recitation of Shema is the first portion of the night.',
      '<b>That is the statement of Rabbi Eliezer.</b>',
    ].join('\n');

    expect(extractTalmudCommentary(processed)).toEqual({
      paragraphs: [
        { html: '<span class="section-marker">Mishnah</span>' },
        {
          html: '<b>From when does one recite Shema in the evening? From the time when the priests enter to partake of their teruma.</b>',
        },
        {
          html: '<b>Until when does the time for the recitation of the evening Shema extend?</b>',
          noteNumber: 1,
        },
        { html: '<b>That is the statement of Rabbi Eliezer.</b>' },
      ],
      notes: [
        {
          number: 1,
          paragraphs: [
            'The term used in the Torah (Deuteronomy 6:7) to indicate the time for the recitation of the evening Shema is <i>beshokhbekha</i>, when you lie down.',
            'Therefore, the time for the recitation of Shema is the first portion of the night.',
          ],
        },
      ],
    });
  });

  it('keeps mixed paragraphs and only moves standalone commentary', () => {
    const result = extractTalmudCommentary(
      '<b>Rav says:</b> this sentence includes explanatory prose.\n' +
      'A standalone explanation with enough words to qualify as commentary in this section today.\n' +
      '<b>Shmuel says:</b> another translation.',
    );

    expect(result.paragraphs).toEqual([
      { html: '<b>Rav says:</b> this sentence includes explanatory prose.', noteNumber: 1 },
      { html: '<b>Shmuel says:</b> another translation.' },
    ]);
    expect(result.notes).toEqual([
      { number: 1, paragraphs: ['A standalone explanation with enough words to qualify as commentary in this section today.'] },
    ]);
  });

  it('balances bold, italic, and anchor tags that cross paragraph boundaries', () => {
    const result = extractTalmudCommentary(
      '<a href="/bible/Deuteronomy/6"><i><b>Translation begins\nand continues</b></i></a>\nCommentary with <i>formatting</i> that has enough words to become a note for readers in this section.',
    );

    expect(result.paragraphs).toEqual([
      {
        html: '<a href="/bible/Deuteronomy/6"><i><b>Translation begins</b></i></a>',
      },
      {
        html: '<a href="/bible/Deuteronomy/6"><i><b>and continues</b></i></a>',
        noteNumber: 1,
      },
    ]);
    expect(result.notes).toEqual([
      {
        number: 1,
        paragraphs: ['Commentary with <i>formatting</i> that has enough words to become a note for readers in this section.'],
      },
    ]);
  });

  it('recognizes strong tags, Unicode letters, and numbers as substantive', () => {
    const result = extractTalmudCommentary(
      '<strong>עברית</strong>\n<strong>123</strong>\n<strong>—</strong>\n<strong></strong>\nPlain commentary.',
    );

    expect(result.paragraphs).toEqual([
      { html: '<strong>עברית</strong>' },
      { html: '<strong>123</strong>' },
      { html: '<strong>—</strong>' },
      { html: '<strong></strong>' },
      { html: 'Plain commentary.' },
    ]);
    expect(result.notes).toEqual([]);
  });

  it('keeps the first leading prose inline and joins short paragraphs into note groups', () => {
    const result = extractTalmudCommentary(
      [
        'Leading commentary starts the section and remains visible inline.',
        'Still leading commentary has enough words to form a separate note for readers in this section today.',
        '<b>Translation.</b>',
        'A note after translation contains enough words for extraction from this section today.',
        'Brief aside.',
        'Another note paragraph contains enough words to remain its own note for readers in this section.',
        '<b>More translation.</b>',
        'Trailing commentary contains enough words to form another note for readers in this section today.',
      ].join('\n'),
    );

    expect(result.paragraphs).toEqual([
      {
        html: 'Leading commentary starts the section and remains visible inline.',
        noteNumber: 1,
      },
      { html: '<b>Translation.</b>', noteNumber: 2 },
      { html: '<b>More translation.</b>', noteNumber: 3 },
    ]);
    expect(result.notes).toEqual([
      {
        number: 1,
        paragraphs: ['Still leading commentary has enough words to form a separate note for readers in this section today.'],
      },
      {
        number: 2,
        paragraphs: [
          'A note after translation contains enough words for extraction from this section today.',
          'Brief aside.',
          'Another note paragraph contains enough words to remain its own note for readers in this section.',
        ],
      },
      {
        number: 3,
        paragraphs: ['Trailing commentary contains enough words to form another note for readers in this section today.'],
      },
    ]);
  });

  it('keeps section markers in the main text and does not let headings consume first prose', () => {
    const result = extractTalmudCommentary(
      [
        '  ',
        '',
        '<i></i>',
        '<span class="section-marker">Talmud (<a href="https://www.sefaria.org/Berakhot.2a.1">Berakhot 2a:1</a>)</span>',
        'A note under the heading has enough words to remain inline.',
        '<b>Translated text.</b>',
      ].join('\n'),
    );

    expect(result.paragraphs).toEqual([
      { html: '<i></i>' },
      { html: '<span class="section-marker">Talmud (<a href="https://www.sefaria.org/Berakhot.2a.1">Berakhot 2a:1</a>)</span>' },
      { html: 'A note under the heading has enough words to remain inline.' },
      { html: '<b>Translated text.</b>' },
    ]);
    expect(result.notes).toEqual([]);
    const opener = '§ The Talmud revisits the statement that the righteous would not experience mishaps.';
    expect(extractTalmudCommentary(opener)).toEqual({
      paragraphs: [{ html: opener }],
      notes: [],
    });
  });
});
