/**
 * Isolated italic initials often stand for the headword in translated quotations.
 * Preserve ambiguous ones; only expand where grammar/citation context is clear.
 * Called only for single-letter candidates, not compound mappings.
 */
export function preserveJastrowInitial(
  abbreviation: string,
  before: string,
  after: string,
  isolatedItalic: boolean,
): boolean {
  if (!/^[A-Za-z]\.?$/.test(abbreviation)) return false;
  // Also protect unitalicized shorthand after explicit prose cues.
  if (/\b(?:called|meant by|made of|his|her|the|a|an|no|one)\s*$/i.test(before)) return true;
  if (!isolatedItalic) return false;

  if (abbreviation === "s." && /^\s*(?:\d|[IVXLCDM]+(?:\b|[.,]))/.test(after)) return false;
  if (/^[vV]\.$/.test(abbreviation) && /^\s*[\u0590-\u05ff]/.test(after)) return false;
  if (/^[mf]\.?$/.test(abbreviation)) {
    // Morphology at the start, after a separator, or following a Hebrew form.
    // Do not interpret ordinary prose such as "a m. remains forbidden" as gender.
    if ((!before.trim() && /^\s*(?:$|[([,;]|\p{Script=Hebrew}|noun\b)/u.test(after)) || /[;(]\s*$/.test(before) ||
        (/[\u0590-\u05ff]\s*$/.test(before) && /^\s*(?:[\u0590-\u05ff]|[),;.]|$)/.test(after))) return false;
  }
  if (/^[hc]\.$/.test(abbreviation) && (!before.trim() || /\(\s*$/.test(before))) return false;
  return true;
}
