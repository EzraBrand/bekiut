import { motion } from 'framer-motion';
import { C, Caption, Eyebrow, IMG, Page, sceneExit } from '../parts';

export function DictionaryScene() {
  return (
    <motion.div
      className="absolute inset-0"
      style={{ background: C.navyDeep }}
      initial={{ clipPath: 'inset(0 0 0 100%)' }}
      animate={{ clipPath: 'inset(0 0 0 0%)' }}
      transition={{ duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
      exit={sceneExit}
    >
      {/* big punch words */}
      <div style={{ position: 'absolute', left: '6vw', top: '11vh', width: '50vw', height: '24vmin' }}>
        <Eyebrow color="#9cc3dc">Two classic dictionaries</Eyebrow>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: [0, 1, 1, 0], y: [30, 0, 0, -30] }}
          transition={{ delay: 0.3, duration: 2.3, times: [0, 0.15, 0.85, 1] }}
          style={{ position: 'absolute', top: '4vmin', fontFamily: 'var(--font-display)', fontSize: '15vmin', color: C.cream, lineHeight: 1.1 }}
        >
          Jastrow
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.45, duration: 0.5 }}
          style={{ position: 'absolute', top: '6vmin', fontFamily: 'var(--font-display)', fontSize: '6.6vmin', color: C.cream, lineHeight: 1.1, whiteSpace: 'nowrap' }}
        >
          Brown–Driver–Briggs
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        style={{ position: 'absolute', left: '6vw', top: '43vh', width: '34vw', fontFamily: 'var(--font-body)', fontSize: '3.2vmin', lineHeight: 1.4, color: '#c9d8e4' }}
      >
        Talmudic Aramaic and Biblical Hebrew lexicons — with abbreviations explained and entry-by-entry navigation.
      </motion.div>

      {/* depth-swapping planes */}
      <motion.div
        initial={{ x: '60vw', rotate: 4, zIndex: 2 }}
        animate={{ x: ['60vw', '0vw', '0vw', '-4vw'], scale: [1, 1, 0.88, 0.88], y: ['0vh', '0vh', '-6vh', '-6vh'], zIndex: 1, rotate: [4, -3, -3, -5] }}
        transition={{ duration: 5.5, times: [0, 0.14, 0.48, 1], ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '44vw', top: '14vh', width: '50vw', height: '62vh' }}
      >
        <Page src={IMG('jastrow.png')} url="bekiut.com/jastrow" style={{ inset: 0 }} />
      </motion.div>
      <motion.div
        initial={{ x: '60vw', rotate: 6, opacity: 0 }}
        animate={{ x: ['60vw', '60vw', '4vw', '6vw'], opacity: [0, 1, 1, 1], rotate: [6, 6, 2, 3] }}
        transition={{ duration: 5.5, times: [0, 0.4, 0.55, 1], ease: 'easeInOut' }}
        style={{ position: 'absolute', left: '42vw', top: '26vh', width: '50vw', height: '62vh', zIndex: 3 }}
      >
        <Page src={IMG('bdb.png')} url="bekiut.com/bdb" style={{ inset: 0 }} />
      </motion.div>

      <Caption text="Look up words in Jastrow and Brown–Driver–Briggs." delay={0.3} hold={3.6} />
    </motion.div>
  );
}
