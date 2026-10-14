export const mapBackgrounds = {
  quiet: { label: "Quiet terrain (grayscale)", style: "backdrop-v4", description: "Grayscale terrain with fewer modern city labels." },
  modern: { label: "Modern reference", style: "streets-v2", description: "Full-color streets and modern settlements." },
  landscape: { label: "Landscape (color)", style: "landscape-v4", description: "Colored terrain emphasizing the physical landscape." },
  dataviz: { label: "Soft color", style: "dataviz-v4", description: "Muted colors designed as a background for markers." },
  outdoor: { label: "Outdoor (color)", style: "outdoor-v4", description: "Detailed terrain and outdoor features; more background detail." },
} as const;

export type MapBackground = keyof typeof mapBackgrounds;
