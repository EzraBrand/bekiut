import { motion } from 'framer-motion';
import { BARS, C, Caption, IMG, sceneExit } from '../parts';

export function HookScene() {
  return (
    <motion.div className="absolute inset-0 paper-grain" style={{ background: C.parchment }} exit={sceneExit}>
      {/* camera drift */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 4.5, ease: [0.2, 0.7, 0.3, 1] }}
      >
        {/* center rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          style={{ position: 'absolute', left: '22vw', right: '22vw', top: '50%', height: '0.35vmin', background: C.navy, transformOrigin: 'center' }}
        />
        {/* color bars split out of the rule */}
        {BARS.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: 0, scaleX: 0.2 }}
            animate={{ opacity: [0, 1, 1], x: ['0vw', '0vw', '-80vw'], scaleX: [0.2, 1, 1] }}
            transition={{ delay: 3.55 + i * 0.06, duration: 0.95, times: [0, 0.35, 1], ease: 'easeIn' }}
            style={{ position: 'absolute', left: '22vw', width: '56vw', top: `calc(50% + ${(i - 2) * 1.6}vmin)`, height: '0.9vmin', background: c }}
          />
        ))}

        {/* Hebrew above */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: '51.5%', overflow: 'hidden', textAlign: 'center' }}>
          <motion.div
            dir="rtl"
            lang="he"
            initial={{ y: '105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.45, duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            style={{ fontFamily: 'var(--font-hebrew)', fontWeight: 700, fontSize: '15vmin', lineHeight: 1.15, color: C.navy }}
          >
            בקיאות
          </motion.div>
        </div>

        {/* English below with logo */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '52%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <motion.div
            initial={{ y: '-105%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.2, 0.9, 0.2, 1] }}
            style={{ display: 'flex', alignItems: 'center', gap: '3vmin', paddingBottom: '1vmin' }}
          >
            <motion.img
              src={IMG('logo.png')}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.6, type: 'spring', stiffness: 300, damping: 16 }}
              style={{ width: '11vmin', height: '11vmin', borderRadius: '2vmin' }}
            />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13vmin', color: C.ink, lineHeight: 1.1 }}>Bekiut</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.5em' }}
          animate={{ opacity: 1, letterSpacing: '0.24em' }}
          transition={{ delay: 2.3, duration: 0.9 }}
          style={{ position: 'absolute', top: '13vh', width: '100%', textAlign: 'center', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '2vmin', textTransform: 'uppercase', color: C.bavli }}
        >
          Classical Jewish texts · Hebrew & English
        </motion.div>
      </motion.div>
      <Caption text="Bekiut. The classical Jewish library, side by side." delay={0.4} hold={3.9} />
    </motion.div>
  );
}
