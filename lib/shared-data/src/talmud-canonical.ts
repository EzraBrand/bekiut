import {
  decodeURIComponentBounded,
  getTractateSlug,
  isValidTractate,
} from "./tractates";
import { isValidPage } from "./talmud-navigation";

export interface TalmudPathCanonicalization {
  canonicalPath: string;
  isCanonical: boolean;
}

/**
 * Normalize a valid Talmud pathname to the URL shape used by the reader.
 *
 * This deliberately only returns a result for a known tractate and an
 * in-range folio. Callers can therefore use a null result to leave unknown or
 * invalid paths alone for normal 404 handling rather than redirecting them to
 * a fabricated page.
 *
 * Two decoding passes are enough for the encoded aliases that have existed in
 * the wild (including one double-encoded alias), while keeping attacker input
 * bounded and rejecting malformed escapes.
 */
export function getTalmudPathCanonicalization(
  rawPathname: string,
): TalmudPathCanonicalization | null {
  const pathname =
    rawPathname.length > 1 && rawPathname.endsWith("/")
      ? rawPathname.slice(0, -1)
      : rawPathname;
  const match = pathname.match(
    /^\/(?:talmud|tractate)\/([^/]+)(?:\/([^/]+))?$/i,
  );
  if (!match) return null;

  const tractate = decodeURIComponentBounded(match[1]);
  // A valid tractate name contains no percent escapes. Reject residual
  // escapes after the two bounded passes rather than allowing a downstream
  // normalizer to accidentally perform a third pass.
  if (!tractate || tractate.includes("/") || tractate.includes("%")) return null;
  if (!isValidTractate(tractate)) return null;

  const canonicalSlug = getTractateSlug(tractate);
  let canonicalPath = `/talmud/${canonicalSlug}`;

  if (match[2] !== undefined) {
    const folio = decodeURIComponentBounded(match[2]);
    const folioMatch = folio?.match(/^(\d{1,3})([ab])$/i);
    if (!folio || folio.includes("%") || !folioMatch) return null;

    const folioNumber = Number(folioMatch[1]);
    const side = folioMatch[2].toLowerCase() as "a" | "b";
    if (!isValidPage(tractate, folioNumber, side)) return null;
    canonicalPath += `/${folioNumber}${side}`;
  }

  return {
    canonicalPath,
    // Trailing slashes are accepted for validation, but are not part of the
    // current canonical URL and should therefore redirect as well.
    isCanonical: rawPathname === canonicalPath,
  };
}

/**
 * Return the canonical Talmud path for a valid alias, or null when the input
 * is not a recognized Talmud route.
 */
export function getCanonicalTalmudPath(rawPathname: string): string | null {
  return getTalmudPathCanonicalization(rawPathname)?.canonicalPath ?? null;
}

/**
 * Normalize a folio token for direct SEO factory callers. Route middleware
 * performs full tractate/page validation; this helper only canonicalizes the
 * spelling of a syntactically valid token.
 */
export function normalizeTalmudFolio(rawFolio: string): string | null {
  const folio = decodeURIComponentBounded(rawFolio);
  const match = folio?.match(/^(\d{1,3})([ab])$/i);
  return match ? `${Number(match[1])}${match[2].toLowerCase()}` : null;
}