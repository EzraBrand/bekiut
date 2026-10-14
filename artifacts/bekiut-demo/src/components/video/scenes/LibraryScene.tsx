import { motion } from 'framer-motion';
import { BARS, C, Caption, Eyebrow, IMG, Page, sceneExit } from '../parts';

const CORPORA = [
  ['Babylonian Talmud', 'תלמוד בבלי'],
  ['Tanakh', 'תנ״ך'],
  ['Mishnah', 'משנה'],
  ['Jerusalem Talmud', 'תלמוד ירושלמי'],
  ['Mishneh Torah', 'משנה תורה'],
];

export function LibraryScene() {
  return (
    <motion.div className="absolute inset-0 paper-grain" style={{ background: C.parchment }} exit={sceneExit}>
      {/* left column: corpora */}
      <div style={{ position: 'absolute', left: '6vw', top: '14vh', width: '30vw' }}>
        <Eyebrow>Five bilingual readers</Eyebrow>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '7vmin', lineHeight: 1.05, color: C.ink, margin: '1.5vmin 0 4vmin' }}
        >
          Hebrew &amp; English, together.
        </motion.div>
        {CORPORA.map(([en, he], i) => (
          <motion.div
            key={en}
            initial={{ opacity: 0, x: '-6vw' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.42, type: 'spring', stiffness: 260, damping: 26 }}
            style={{ display: 'flex', alignItems: 'center', gap: '1.6vmin', padding: '1.1vmin 0', borderBottom: '1px solid rgba(27,74,110,0.14)' }}
          >
            <span style={{ width: '4vmin', height: '0.6vmin', background: BARS[i] }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.2vmin', color: C.ink, flex: 1 }}>{en}</span>
            <span dir="rtl" lang="he" style={{ fontFamily: 'var(--font-hebrew)', fontWeight: 700, fontSize: '3.2vmin', color: BARS[i] }}>
              {he}
            </span>
          </motion.div>
        ))}
      </div>

      {/* right: real reader captures under a camera */}
      <motion.div
        className="absolute"
        style={{ left: '40vw', top: '9vh', width: '56vw', height: '78vh', perspective: 1600 }}
        initial={{ opacity: 0, rotateY: -14, scale: 0.92 }}
        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Tanakh behind */}
        <motion.div
          initial={{ y: '20vh', opacity: 0 }}
          animate={{ y: '-4vh', opacity: 1 }}
          transition={{ delay: 3.6, duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Page src={IMG('bible.png')} url="bekiut.com/bible/genesis/1" style={{ left: '14%', top: '0%', width: '86%', height: '82%', opacity: 0.95 }} />
        </motion.div>
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: ['0%', '0%', '-14%'] }}
          transition={{ duration: 6.5, times: [0, 0.55, 1], ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Page src="" url="bekiut.com/talmud/berakhot/2a" style={{ left: 0, top: '8%', width: '88%', height: '92%' }}>
            <motion.img
              src={IMG('talmud.png')}
              initial={{ scale: 1, x: '0%', y: '0%' }}
              animate={{ scale: [1, 1.7, 1.7, 1.7], x: ['0%', '18%', '-16%', '-16%'], y: ['0%', '-4%', '-4%', '-4%'] }}
              transition={{ duration: 6.2, times: [0, 0.3, 0.7, 1], ease: 'easeInOut', delay: 0.4 }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transformOrigin: '50% 30%' }}
            />
          </Page>
        </motion.div>
      </motion.div>

      {/* reading tags */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ delay: 2.3, duration: 1.8, times: [0, 0.15, 0.85, 1] }}
        style={{ position: 'absolute', right: '7vw', top: '16vh', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '2vmin', letterSpacing: '0.18em', color: C.cream, background: C.bavli, padding: '0.8vmin 1.6vmin', zIndex: 5 }}
      >
        עברית · HEBREW
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{ delay: 4.1, duration: 1.6, times: [0, 0.15, 0.85, 1] }}
        style={{ position: 'absolute', left: '43vw', top: '16vh', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '2vmin', letterSpacing: '0.18em', color: C.cream, background: C.navy, padding: '0.8vmin 1.6vmin', zIndex: 5 }}
      >
        ENGLISH
      </motion.div>

      <Caption text="Talmud, Hebrew Bible, Mishnah, Yerushalmi and Maimonides — in Hebrew and English." delay={0.15} hold={6.1} />
    </motion.div>
  );
}
