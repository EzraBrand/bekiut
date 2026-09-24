import type { CSSProperties } from "react";

const NAVY = "#1b4a6e";
const CREAM = "#f7f1e8";

const betPath =
  "M317.38 364L185.26 364L196.42 318.28L287.86 318.28Q292.90 307.48 295.42 298.66Q297.94 289.84 299.02 281.02Q300.10 272.20 300.10 261.76L300.10 261.76Q300.10 243.40 297.40 233.50Q294.70 223.60 288.58 219.82Q282.46 216.04 272.38 216.04L272.38 216.04L217.66 216.04Q204.70 216.04 200.02 209.74Q195.34 203.44 195.34 192.28L195.34 192.28Q195.34 182.20 197.86 173.20Q200.38 164.20 203.08 157.54Q205.78 150.88 206.86 149.08L206.86 149.08L213.70 149.08L213.70 157Q213.70 162.04 216.58 164.02Q219.46 166 221.98 166L221.98 166L283.18 166Q291.82 166 299.74 169.78Q307.66 173.56 312.88 182.74Q318.10 191.92 318.10 208.84L318.10 208.84L318.10 258.16Q318.10 280.48 312.34 295.60Q306.58 310.72 302.98 318.28L302.98 318.28L328.54 318.28L317.38 364Z";

const styles = {
  canvas: {
    width: "min(600px, 100%)",
    minHeight: "540px",
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
    boxSizing: "border-box",
    padding: "28px 20px",
    background: "#e8ece7",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  } satisfies CSSProperties,
  card: {
    width: "100%",
    maxWidth: "560px",
    overflow: "hidden",
    borderRadius: "12px",
    background: "#fbfaf7",
    boxShadow: "0 1px 1px rgba(39, 55, 47, 0.08), 0 4px 12px rgba(39, 55, 47, 0.09)",
  } satisfies CSSProperties,
  art: {
    position: "relative",
    width: "100%",
    aspectRatio: "1200 / 630",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    background: NAVY,
  } satisfies CSSProperties,
  metadata: {
    padding: "14px 16px 15px",
    background: "#fbfaf7",
  } satisfies CSSProperties,
};

function BetMark() {
  return (
    <svg
      aria-label="Bekiut"
      role="img"
      viewBox="0 0 512 512"
      style={{ width: "clamp(180px, 46vw, 280px)", height: "auto", display: "block" }}
    >
      <path fill={CREAM} d={betPath} />
    </svg>
  );
}

/**
 * WhatsApp OG direction: the artwork contains only the familiar Bekiut mark,
 * leaving naming and explanatory copy to the platform's native metadata area.
 */
export function Icon() {
  return (
    <main style={styles.canvas}>
      <article aria-label="WhatsApp link preview for Bekiut" style={styles.card}>
        <div style={styles.art}>
          <BetMark />
        </div>
        <div style={styles.metadata}>
          <div
            style={{
              marginBottom: "6px",
              color: "#7b817b",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.075em",
              lineHeight: 1.2,
              textTransform: "uppercase",
            }}
          >
            bekiut.com
          </div>
          <div
            style={{
              color: "#28312d",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "17px",
              fontWeight: 700,
              letterSpacing: "-0.012em",
              lineHeight: 1.24,
            }}
          >
            Bekiut – Study Classical Jewish Texts
          </div>
          <p
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              margin: "7px 0 0",
              color: "#69716c",
              fontSize: "12px",
              lineHeight: 1.42,
            }}
          >
            Study Talmud, Tanakh, Mishnah, and other classical Jewish texts for free, with bilingual Hebrew-English text and modern study tools.
          </p>
        </div>
      </article>
    </main>
  );
}