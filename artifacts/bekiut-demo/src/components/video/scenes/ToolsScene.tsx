import { motion } from 'framer-motion';
import { C, Caption, IMG, Page, sceneExit } from '../parts';

// World: three captures in a row, offsets from stage centre (vw).
const CARDS = [
  { img: 'bibindex.png', url: 'bekiut.com/biblical-index', tag: 'Verse → Talmud', title: 'Biblical Index', x: -34, color: C.tanakh },
  { img: 'mishmap.png', url: 'bekiut.com/mishnah-map', tag: 'Mishnah → Gemara', title: 'Mishnah Map', x: 0, color: C.mishnah },
  { img: 'sugya.png', url: 'bekiut.com/sugya-viewer', tag: 'Any custom range', title: 'Sugya Viewer', x: 34, color: C.bavli },
];

// camera poses: overview, punch each, pull out
const S = 1.75;
const xs = ['0vw', '0vw', `${34 * S}vw`, `${34 * S}vw`, '0vw', '0vw', `${-34 * S}vw`, `${-34 * S}vw`, '0vw'];
const sc = [0.92, 1, S, S, S, S, S, S, 1.05];
const times = [0, 0.12, 0.22, 0.42, 0.48, 0.66, 0.72, 0.9, 1];

export function ToolsScene() {
  return (
    <motion.div className="absolute inset-0 paper-grain" style={{ background: C.parchment }} exit={sceneExit}>
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 0.92 }}
        animate={{ x: xs, scale: sc }}
        transition={{ duration: 6, times, ease: 'easeInOut' }}
      >
        {CARDS.map((c, i) => (
          <motion.div
            key={c.img}
            initial={{ opacity: 0, y: '8vh' }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            style={{ position: 'absolute', left: `${50 + c.x - 15}vw`, top: '30vh', width: '30vw', height: '40vh' }}
          >
            <div style={{ position: 'absolute', top: '-6vh', left: 0, display: 'flex', alignItems: 'center', gap: '1vmin' }}>
              <span style={{ width: '3vmin', height: '0.5vmin', background: c.color }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '3vmin', color: C.ink }}>{c.title}</span>
            </div>
            <Page src={IMG(c.img)} url={c.url} style={{ inset: 0 }} />
          </motion.div>
        ))}
      </motion.div>

      {/* screen-space HUD tags, one per punch-in */}
      {CARDS.map((c, i) => (
        <motion.div
          key={c.tag}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, 0] }}
          transition={{ delay: [1.35, 2.85, 4.35][i], duration: 1.3, times: [0, 0.2, 0.8, 1] }}
          style={{ position: 'absolute', left: '6vw', bottom: '15vh', fontFamily: 'var(--font-display)', fontSize: '7vmin', color: C.cream, background: c.color, padding: '1vmin 3vmin', zIndex: 10 }}
        >
          {c.tag}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, times: [0, 0.2, 0.8, 1] }}
        style={{ position: 'absolute', left: 0, right: 0, top: '10vh', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: '7vmin', color: C.ink }}
      >
        Every text, connected.
      </motion.div>

      <Caption text="Trace verses into the Talmud, map the Mishnah, study any sugya range." delay={0.3} hold={5.2} />
    </motion.div>
  );
}
