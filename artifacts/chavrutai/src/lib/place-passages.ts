import { getTractateSlug } from "@workspace/shared-data/tractates";
import type { Place } from "./places";

export interface PlacePassage {
  ref: string;
  text: string;
  highlight?: string;
  type: "talmud" | "bible" | "other";
}
export interface PlacePassageResponse {
  results: PlacePassage[];
  total: number;
  totalPages: number;
}

/** Use source spellings, rather than modern aliases that may never occur in the text. */
export function placePassageQueries(place: Place): string[] {
  const names = [
    ...place.sources.filter(s => s.corpus === "talmudic").map(s => s.name),
    ...place.sources.filter(s => s.corpus === "biblical").map(s => s.name),
  ];
  return [...new Set(names)];
}

/** Same section-anchor convention as the Terms page and full-text search. */
export function placePassageLink(result: PlacePassage): string {
  const match = result.type === "talmud" && result.ref.match(/^([A-Za-z\s]+)\s+(\d+)([ab])(?::(\d+)(?:-\d+)?)?$/);
  if (match) {
    return `/talmud/${getTractateSlug(match[1].trim())}/${match[2]}${match[3]}${match[4] ? `#section-${match[4]}` : ""}`;
  }
  return `/search?q=${encodeURIComponent(result.ref)}&type=talmud`;
}

export async function fetchPlacePassages(query: string, page: number, signal: AbortSignal): Promise<PlacePassageResponse> {
  const params = new URLSearchParams({ query, page: String(page), pageSize: "6", type: "talmud", exact: "false" });
  // Shared API routing, identical to the existing Terms reader.
  const response = await fetch(`/api/search/text?${params}`, { signal });
  if (!response.ok) throw new Error("Talmud search is unavailable.");
  const data = await response.json();
  if (!Array.isArray(data.results) || !Number.isFinite(data.totalPages)) {
    throw new Error("Unexpected search response.");
  }
  return data;
}
