import { readFileSync } from "node:fs";
import sharp from "sharp";

// Graduate approved canvas option C. Rasterize text once so preview bots need no fonts.
const favicon = readFileSync("artifacts/chavrutai/public/favicon.svg", "utf8");
const path = favicon.match(/<path[^>]*d="([^"]+)"/)?.[1];
if (!path) throw new Error("Favicon glyph path not found");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1b4a6e"/>
  <svg x="96" y="132.3" width="348" height="365.4" viewBox="145 125 210 265">
    <path d="${path}" fill="#f7f1e8"/>
  </svg>
  <g fill="#f7f1e8">
    <text x="516" y="222" font-family="Liberation Serif, DejaVu Serif" font-size="80" letter-spacing="-3">Bekiut</text>
    <text x="516" y="288" font-family="DejaVu Sans" font-size="44" font-weight="bold">STUDY CLASSICAL</text>
    <text x="516" y="339" font-family="DejaVu Sans" font-size="44" font-weight="bold">JEWISH TEXTS</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("artifacts/chavrutai/public/bekiut-social-classical-texts.png");