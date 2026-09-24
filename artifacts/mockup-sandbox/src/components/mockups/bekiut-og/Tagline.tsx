const BET_PATH =
  "M317.38 364L185.26 364L196.42 318.28L287.86 318.28Q292.90 307.48 295.42 298.66Q297.94 289.84 299.02 281.02Q300.10 272.20 300.10 261.76L300.10 261.76Q300.10 243.40 297.40 233.50Q294.70 223.60 288.58 219.82Q282.46 216.04 272.38 216.04L272.38 216.04L217.66 216.04Q204.70 216.04 200.02 209.74Q195.34 203.44 195.34 192.28L195.34 192.28Q195.34 182.20 197.86 173.20Q200.38 164.20 203.08 157.54Q205.78 150.88 206.86 149.08L206.86 149.08L213.70 149.08L213.70 157Q213.70 162.04 216.58 164.02Q219.46 166 221.98 166L221.98 166L283.18 166Q291.82 166 299.74 169.78Q307.66 173.56 312.88 182.74Q318.10 191.92 318.10 208.84L318.10 208.84L318.10 258.16Q318.10 280.48 312.34 295.60Q306.58 310.72 302.98 318.28L302.98 318.28L328.54 318.28L317.38 364Z";

/**
 * Hypothesis: a named, legible study invitation helps a first-time reader
 * understand the mark before the link metadata has to do the work.
 */
export function Tagline() {
  return (
    <div className="bekiut-tagline-canvas">
      <style>{`
        .bekiut-tagline-canvas {
          box-sizing: border-box;
          width: min(600px, 100%);
          aspect-ratio: 10 / 9;
          min-height: 0;
          padding: 12px;
          background: #e7ddd0;
          display: grid;
          place-items: center;
          color: #21313e;
          font-family: Georgia, "Times New Roman", serif;
        }
        .bekiut-tagline-canvas *, .bekiut-tagline-canvas *::before, .bekiut-tagline-canvas *::after {
          box-sizing: border-box;
        }
        .bekiut-tagline-card {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #f8f6f1;
          border-radius: 9px;
          box-shadow: 0 1px 2px rgba(52, 45, 35, .16);
          display: grid;
          grid-template-rows: auto 1fr;
        }
        .bekiut-tagline-artwork {
          position: relative;
          width: 100%;
          aspect-ratio: 1200 / 630;
          overflow: hidden;
          background: #1b4a6e;
          color: #f7f1e8;
        }
        .bekiut-tagline-mark {
          position: absolute;
          left: 8%;
          top: 21%;
          width: 29%;
          height: 58%;
        }
        .bekiut-tagline-copy {
          position: absolute;
          left: 43%;
          right: 7%;
          top: 24%;
        }
        .bekiut-tagline-name {
          margin: 0;
          color: #f7f1e8;
          font-size: clamp(28px, 6vw, 64px);
          font-weight: 500;
          line-height: .95;
          letter-spacing: -.04em;
        }
        .bekiut-tagline-divider {
          display: none;
        }
        .bekiut-tagline-line {
          margin: 0;
          max-width: 490px;
          color: #f7f1e8;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: clamp(17px, 3.4vw, 34px);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: .01em;
          text-transform: uppercase;
        }
        .bekiut-tagline-meta {
          min-height: 0;
          padding: 13px 15px 12px;
          background: #fbfaf7;
        }
        .bekiut-tagline-domain {
          margin: 0 0 5px;
          color: #687078;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: .055em;
          text-transform: uppercase;
        }
        .bekiut-tagline-title {
          margin: 0;
          color: #27323b;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.25;
        }
        .bekiut-tagline-description {
          margin: 6px 0 0;
          color: #667078;
          font-family: ui-sans-serif, system-ui, sans-serif;
          font-size: 12px;
          line-height: 1.32;
        }
        @media (max-width: 390px) {
          .bekiut-tagline-canvas { padding: 8px; }
          .bekiut-tagline-meta { padding: 10px 12px; }
          .bekiut-tagline-description { font-size: 11px; margin-top: 4px; }
          .bekiut-tagline-title { font-size: 13px; }
        }
      `}</style>

      <article className="bekiut-tagline-card" aria-label="WhatsApp link preview for Bekiut">
        <div className="bekiut-tagline-artwork" aria-label="Bekiut artwork: Study Classical Jewish Texts">
          <svg className="bekiut-tagline-mark" viewBox="145 125 210 265" aria-hidden="true">
            <path d={BET_PATH} fill="#f7f1e8" />
          </svg>
          <div className="bekiut-tagline-copy">
            <p className="bekiut-tagline-name">Bekiut</p>
            <div className="bekiut-tagline-divider" />
            <p className="bekiut-tagline-line">Study Classical<br />Jewish Texts</p>
          </div>
        </div>
        <div className="bekiut-tagline-meta">
          <p className="bekiut-tagline-domain">bekiut.com</p>
          <h2 className="bekiut-tagline-title">Bekiut – Study Classical Jewish Texts</h2>
          <p className="bekiut-tagline-description">
            Study Talmud, Tanakh, Mishnah, and other classical Jewish texts for free, with bilingual Hebrew-English text and modern study tools.
          </p>
        </div>
      </article>
    </div>
  );
}