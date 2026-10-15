export const mapRegions = {
  all: { label: "All places", bounds: null },
  israel: { label: "Land of Israel", bounds: [[30.8, 34.1], [33.4, 36.1]] },
  judea: { label: "Judea", bounds: [[31.2, 34.6], [32.05, 35.55]] },
  galilee: { label: "Galilee", bounds: [[32.55, 35.0], [33.35, 35.8]] },
  babylonia: { label: "Babylonia", bounds: [[31.3, 43.1], [34, 45.2]] },
  syria: { label: "Syria", bounds: [[33, 35.5], [37, 40.5]] },
  anatolia: { label: "Asia Minor", bounds: [[36, 26], [41.8, 40]] },
} satisfies Record<string, { label: string; bounds: [[number, number], [number, number]] | null }>;

export type MapRegion = keyof typeof mapRegions;
