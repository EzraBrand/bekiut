const NAVY = "#1b4a6e";
const CREAM = "#f7f1e8";
const INK = "#172b3b";

function BetMark() {
  return (
    <svg
      aria-label="Bekiut"
      viewBox="0 0 512 512"
      role="img"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <path
        fill={CREAM}
        d="M317.38 364L185.26 364L196.42 318.28L287.86 318.28Q292.90 307.48 295.42 298.66Q297.94 289.84 299.02 281.02Q300.10 272.20 300.10 261.76L300.10 261.76Q300.10 243.40 297.40 233.50Q294.70 223.60 288.58 219.82Q282.46 216.04 272.38 216.04L272.38 216.04L217.66 216.04Q204.70 216.04 200.02 209.74Q195.34 203.44 195.34 192.28L195.34 192.28Q195.34 182.20 197.86 173.20Q200.38 164.20 203.08 157.54Q205.78 150.88 206.86 149.08L206.86 149.08L213.70 149.08L213.70 157Q213.70 162.04 216.58 164.02Q219.46 166 221.98 166L221.98 166L283.18 166Q291.82 166 299.74 169.78Q307.66 173.56 312.88 182.74Q318.10 191.92 318.10 208.84L318.10 208.84L318.10 258.16Q318.10 280.48 312.34 295.60Q306.58 310.72 302.98 318.28L302.98 318.28L328.54 318.28L317.38 364Z"
      />
    </svg>
  );
}

/**
 * Wordmark hypothesis: let the distinctive outlined bet establish recognition,
 * then make the product name legible before a viewer reaches the link metadata.
 */
export function Wordmark() {
  return (
    <main className="bekiut-mockup">
      <article className="link-card" aria-label="WhatsApp link preview for Bekiut">
        <section className="og-artwork" aria-label="Bekiut open graph artwork">
          <div className="brand-lockup">
            <div className="bet-mark">
              <BetMark />
            </div>
            <div className="wordmark">Bekiut</div>
          </div>
          <div className="folio folio-top">BEKIUT · LIBRARY</div>
          <div className="folio folio-bottom">A FREE BILINGUAL LIBRARY</div>
        </section>
        <section className="link-details">
          <div className="domain">bekiut.com</div>
          <h1>Bekiut – Study Classical Jewish Texts</h1>
          <p>
            Study Talmud, Tanakh, Mishnah, and other classical Jewish texts for
            free, with bilingual Hebrew-English text and modern study tools.
          </p>
        </section>
      </article>
      <style>{`
        .bekiut-mockup {
          box-sizing: border-box;
          min-height: 540px;
          width: min(100%, 600px);
          margin: 0 auto;
          padding: 18px;
          display: grid;
          place-items: center;
          background: #e9e4dc;
          color: ${INK};
          font-family: Georgia, "Times New Roman", serif;
        }
        .bekiut-mockup *, .bekiut-mockup *::before, .bekiut-mockup *::after {
          box-sizing: border-box;
        }
        .link-card {
          width: 100%;
          overflow: hidden;
          border: 1px solid #d5d0c7;
          border-radius: 8px;
          background: #fbfaf7;
          box-shadow: 0 2px 7px rgba(31, 48, 61, .11);
        }
        .og-artwork {
          position: relative;
          width: 100%;
          aspect-ratio: 1200 / 630;
          overflow: hidden;
          background: ${NAVY};
          isolation: isolate;
        }
        .brand-lockup {
          position: absolute;
          left: 12%;
          top: 50%;
          display: flex;
          align-items: center;
          gap: clamp(13px, 2.3vw, 25px);
          transform: translateY(-50%);
        }
        .bet-mark {
          width: clamp(70px, 13vw, 142px);
          aspect-ratio: 1;
          flex: none;
        }
        .wordmark {
          color: ${CREAM};
          font-size: clamp(52px, 10.7vw, 116px);
          font-weight: 600;
          letter-spacing: -.065em;
          line-height: .8;
        }
        .folio {
          position: absolute;
          color: rgba(247, 241, 232, .78);
          font-family: "Trebuchet MS", sans-serif;
          font-size: clamp(6px, 1.12vw, 12px);
          font-weight: 700;
          letter-spacing: .15em;
          line-height: 1;
        }
        .folio-top { left: 12%; top: 17%; }
        .folio-bottom { left: 12%; bottom: 17%; }
        .link-details {
          padding: 13px 16px 15px;
          background: #fbfaf7;
        }
        .domain {
          margin-bottom: 5px;
          color: #677279;
          font-family: "Trebuchet MS", sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .035em;
          text-transform: lowercase;
        }
        .link-details h1 {
          margin: 0;
          color: #263741;
          font-family: "Trebuchet MS", sans-serif;
          font-size: clamp(15px, 3vw, 17px);
          font-weight: 700;
          letter-spacing: -.02em;
          line-height: 1.23;
        }
        .link-details p {
          display: -webkit-box;
          overflow: hidden;
          margin: 6px 0 0;
          color: #687077;
          font-family: "Trebuchet MS", sans-serif;
          font-size: clamp(11px, 2.3vw, 12px);
          line-height: 1.38;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        @media (max-width: 380px) {
          .bekiut-mockup { min-height: 0; padding: 10px; }
          .link-details { padding: 11px 13px 12px; }
          .folio-top { top: 14%; }
          .folio-bottom { bottom: 14%; }
        }
      `}</style>
    </main>
  );
}