import { useState } from "react";

/** Same Hebrew fonts the Talmud reader offers (see preferences-context HebrewFont). */
export const BY_FONTS = [
  { id: "assistant", label: "Assistant", stack: "'Assistant', sans-serif" },
  { id: "noto-sans-hebrew", label: "Noto Sans Hebrew", stack: "'Noto Sans Hebrew', sans-serif" },
  { id: "noto-serif-hebrew", label: "Noto Serif Hebrew", stack: "'Noto Serif Hebrew', serif" },
  { id: "frank-ruehl", label: "Frank Ruhl Libre", stack: "'Frank Ruhl Libre', 'Frank Ruehl CLM', 'Times New Roman', serif" },
  { id: "david-libre", label: "David Libre", stack: "'David Libre', serif" },
  { id: "times", label: "Times New Roman", stack: "'Times New Roman', serif" },
  { id: "calibri", label: "Calibri", stack: "'Calibri', 'Segoe UI', sans-serif" },
] as const;

/** Five steps mirroring the Talmud reader's extra-small to extra-large scale. */
export const BY_SIZES = [
  { id: "extra-small", label: "XS", name: "Extra small", rem: "0.875rem" },
  { id: "small", label: "S", name: "Small", rem: "0.9375rem" },
  { id: "medium", label: "M", name: "Medium", rem: "1rem" },
  { id: "large", label: "L", name: "Large", rem: "1.125rem" },
  { id: "extra-large", label: "XL", name: "Extra large", rem: "1.3125rem" },
] as const;

export type BenYehudaFont = typeof BY_FONTS[number]["id"];
export type BenYehudaSize = typeof BY_SIZES[number]["id"];

export const BY_SIZE_KEY = "ben-yehuda-text-size";
export const BY_FONT_KEY = "ben-yehuda-hebrew-font";
export const BY_LEGACY_LARGER_KEY = "ben-yehuda-larger-text";

const isSize = (v: unknown): v is BenYehudaSize => BY_SIZES.some(s => s.id === v);
const isFont = (v: unknown): v is BenYehudaFont => BY_FONTS.some(f => f.id === v);

function read(key: string) {
  try { return localStorage.getItem(key) ?? sessionStorage.getItem(key); } catch { return null; }
}
function write(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage disabled */ }
}

/** Validated, persisted font size/family; migrates the old larger-text boolean. */
export function useBenYehudaTypography() {
  const [size, setSizeState] = useState<BenYehudaSize>(() => {
    const saved = read(BY_SIZE_KEY);
    let initial: BenYehudaSize = "medium";
    if (isSize(saved)) initial = saved;
    else if (read(BY_LEGACY_LARGER_KEY) === "true") initial = "large";
    write(BY_SIZE_KEY, initial);
    try { localStorage.removeItem(BY_LEGACY_LARGER_KEY); sessionStorage.removeItem(BY_LEGACY_LARGER_KEY); } catch { /* ignore */ }
    return initial;
  });
  const [font, setFontState] = useState<BenYehudaFont>(() => {
    const saved = read(BY_FONT_KEY);
    const initial = isFont(saved) ? saved : "assistant";
    write(BY_FONT_KEY, initial);
    return initial;
  });
  const setSize = (next: BenYehudaSize) => { if (!isSize(next)) return; setSizeState(next); write(BY_SIZE_KEY, next); };
  const setFont = (next: BenYehudaFont) => { if (!isFont(next)) return; setFontState(next); write(BY_FONT_KEY, next); };
  const fontStack = BY_FONTS.find(f => f.id === font)!.stack;
  const sizeRem = BY_SIZES.find(s => s.id === size)!.rem;
  return { size, setSize, font, setFont, fontStack, sizeRem };
}
