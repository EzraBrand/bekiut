import { writeFile } from "node:fs/promises";
// Runtime import keeps this one-off export outside the scripts package's TS root.
const source = new URL("../../artifacts/chavrutai/src/lib/places.ts", import.meta.url);
const { places } = await import(source.href) as { places: Record<string, unknown>[] };

// Generate the blog's companion inventory directly from the reader's dataset.
const columns = [
  "id", "name", "aliases", "sources", "latitude", "longitude", "certainty",
  "identification", "coordinateNote", "coordinateSource", "identificationSources",
] as const;
const quote = (value: unknown) => `"${(typeof value === "object" ? JSON.stringify(value) : String(value ?? "")).replaceAll('"', '""')}"`;
const csv = [columns.join(","), ...places.map(place => columns.map(key => quote(place[key] ?? "")).join(","))].join("\n") + "\n";
await writeFile(new URL("../ancient-places-results.csv", import.meta.url), csv);
console.log(`Exported ${places.length} records to scripts/ancient-places-results.csv`);
