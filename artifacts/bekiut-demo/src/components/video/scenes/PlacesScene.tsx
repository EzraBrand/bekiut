import { motion } from 'framer-motion';
import { C, Caption, Eyebrow, IMG, sceneExit } from '../parts';

// approximate pin positions over the captured map panel (percent of frame)
const PINS = [
  { x: 64, y: 70 },
  { x: 72, y: 76 },
  { x: 58, y: 82 },
];

export function PlacesScene() {
  return (
    <motion.div className="absolute inset-0" style={{ background: C.parchment }} exit={{ opacity: 1 }}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.45, x: '-8vw', y: '-14vh' }}
        animate={{ scale: 1.1, x: '0vw', y: '0vh' }}
        transition={{ duration: 4, ease: [0.25, 0.6, 0.3, 1] }}
        style={{ transformOrigin: '62% 75%' }}
      >
        <img src={IMG('places.png')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        {PINS.map((p, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 2.4], opacity: [0, 0.8, 0] }}
            transition={{ delay: 0.5 + i * 0.5, duration: 1.4, repeat: 1 }}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: '4vmin', height: '4vmin', marginLeft: '-2vmin', marginTop: '-2vmin', borderRadius: '50%', border: `0.4vmin solid ${C.rambam}` }}
          />
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: '-4vw' }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{ position: 'absolute', left: '5vw', top: '9vh', background: 'rgba(247,241,232,0.94)', padding: '3vmin 3.5vmin', borderLeft: `0.8vmin solid ${C.rambam}`, maxWidth: '40vw', boxShadow: '0 2vmin 5vmin rgba(18,50,75,0.18)' }}
      >
        <Eyebrow color={C.rambam}>Places</Eyebrow>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '6vmin', color: C.ink, lineHeight: 1.1, marginTop: '1vmin' }}>The places behind the texts.</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '2.8vmin', color: C.muted, marginTop: '1.5vmin' }}>A searchable map with sourced identification notes.</div>
      </motion.div>
      {/* navy iris handoff */}
      <motion.div
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ clipPath: ['circle(0% at 50% 50%)', 'circle(0% at 50% 50%)', 'circle(80% at 50% 50%)'] }}
        transition={{ duration: 4, times: [0, 0.86, 1], ease: 'easeIn' }}
        style={{ position: 'absolute', inset: 0, background: C.navy, zIndex: 30 }}
      />
      <Caption text="Explore the places behind the texts." delay={0.3} hold={2.9} />
    </motion.div>
  );
}
