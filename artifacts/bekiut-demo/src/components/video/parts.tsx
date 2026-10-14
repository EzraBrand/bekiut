import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

export const IMG = (n: string) => `${import.meta.env.BASE_URL}images/${n}`;

export const C = {
  navy: '#1b4a6e',
  navyDeep: '#12324b',
  parchment: '#f5eee8',
  cream: '#f7f1e8',
  ink: '#2b2622',
  muted: '#6b6057',
  bavli: '#4b7a8a',
  tanakh: '#5a7a4a',
  mishnah: '#7a5a4a',
  yeru: '#6a5a8a',
  rambam: '#8a6a3a',
};
export const BARS = [C.bavli, C.tanakh, C.mishnah, C.yeru, C.rambam];

export const sceneExit = { opacity: 0, transition: { duration: 0.35 } };

/** A real site capture rendered as a floating browser page. */
export function Page({
  src,
  url,
  style,
  children,
}: {
  src: string;
  url: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        background: '#fbf8f4',
        borderRadius: '0.9vmin',
        overflow: 'hidden',
        boxShadow: '0 3vmin 7vmin rgba(18,50,75,0.22), 0 0.4vmin 1vmin rgba(18,50,75,0.12)',
        border: '1px solid rgba(27,74,110,0.15)',
        ...style,
      }}
    >
      <div
        style={{
          height: '3.4vmin',
          background: '#ece2d6',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8vmin',
          padding: '0 1.4vmin',
          borderBottom: '1px solid rgba(27,74,110,0.12)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: '1vmin', height: '1vmin', borderRadius: '50%', background: 'rgba(27,74,110,0.25)' }} />
        ))}
        <span
          style={{
            marginLeft: '1.2vmin',
            fontFamily: 'var(--font-body)',
            fontSize: '1.5vmin',
            color: C.muted,
            background: '#f7f1e8',
            borderRadius: '0.6vmin',
            padding: '0.3vmin 1.2vmin',
          }}
        >
          {url}
        </span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 3.4vmin)', overflow: 'hidden' }}>
        {children ?? (
          <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
        )}
      </div>
    </div>
  );
}

/** Lower caption mirroring the narration for muted viewing. */
export function Caption({ text, delay, hold }: { text: string; delay: number; hold: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -6] }}
      transition={{ duration: hold, delay, times: [0, 0.06, 0.94, 1], ease: 'easeOut' }}
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '5.5vh',
        zIndex: 40,
        whiteSpace: 'nowrap',
      }}
    >
      <div
        style={{
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-body)',
          fontSize: '2.6vmin',
          fontWeight: 500,
          color: C.cream,
          background: 'rgba(18,50,75,0.86)',
          padding: '1vmin 2.4vmin',
          borderRadius: '0.6vmin',
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

export function Eyebrow({ children, color = C.navy, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '2vmin',
        fontWeight: 700,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
