import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useChapterData } from './chapter-data';

function ChapterCount({ tractate }: { tractate: string }) {
  const chapters = useChapterData(tractate);
  return createElement('p', null, `${chapters.length} Chapters`);
}

describe('bundled chapter metadata', () => {
  it('renders all nine Berakhot chapters on the first render without effects or downloads', () => {
    expect(renderToStaticMarkup(createElement(ChapterCount, { tractate: 'Berakhot' })))
      .toBe('<p>9 Chapters</p>');
  });

  it.each(['Bava Batra', 'Bava-Batra', 'Bava_Batra', 'Bava%20Batra'])(
    'resolves normalized route %s immediately',
    (tractate) => {
      expect(renderToStaticMarkup(createElement(ChapterCount, { tractate })))
        .toBe('<p>10 Chapters</p>');
    },
  );

  it('includes nonempty data for every bundled tractate', () => {
    const files = import.meta.glob<unknown[]>('../../../../talmud-data/chapters/*.json', {
      eager: true, import: 'default',
    });
    for (const path of Object.keys(files)) {
      const tractate = path.split('/').pop()!.replace('.json', '');
      expect(renderToStaticMarkup(createElement(ChapterCount, { tractate })))
        .not.toBe('<p>0 Chapters</p>');
    }
  });
});