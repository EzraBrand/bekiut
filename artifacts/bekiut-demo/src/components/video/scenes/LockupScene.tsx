import { motion } from 'framer-motion';
import { BARS, C, IMG } from '../parts';

export function LockupScene() {
  return (
    <motion.div className="absolute inset-0" style={{ background: C.navy }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.img
          src={IMG('logo.png')}
          initial={{ scale: 2.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          style={{ width: '22vmin', height: '22vmin', borderRadius: '4vmin', boxShadow: '0 0 0 0.3vmin rgba(247,241,232,0.35)' }}
        />
        <div style={{ overflow: 'hidden', marginTop: '3vmin' }}>
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.2, 0.9, 0.2, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '13vmin', color: C.cream, lineHeight: 1.1 }}
          >
            Bekiut
          </motion.div>
        </div>
        <div style={{ display: 'flex', gap: '1vmin', margin: '2.5vmin 0' }}>
          {BARS.map((c, i) => (
            <motion.span
              key={c}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8 + i * 0.07, duration: 0.4 }}
              style={{ width: '6vmin', height: '0.7vmin', background: c, transformOrigin: 'left' }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.12em' }}
          transition={{ delay: 0.9, duration: 0.6 }}
          style={{ fontFamily: 'var(--font-body)', fontSize: '3.6vmin', fontWeight: 500, color: '#e4edf3' }}
        >
          bekiut.com
        </motion.div>
      </div>
      {/* parchment fade for loop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 3.5, times: [0, 0.88, 1] }}
        style={{ position: 'absolute', inset: 0, background: C.parchment }}
      />
    </motion.div>
  );
}
