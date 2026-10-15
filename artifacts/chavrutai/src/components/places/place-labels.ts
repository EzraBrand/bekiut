import type L from "leaflet";
import type { Place } from "@/lib/places";

// Editorial visibility priority, not frequency or historical importance ranking.
const priority = ["jerusalem", "rome", "sura", "pumbedita", "mehoza", "nehardea", "alexandria", "shushan", "nineveh", "damascus", "tadmor", "tiberias"];
export function updatePlaceLabels(map: L.Map, markers: Map<string, L.Marker>, places: Place[], selectedId: string | null, enabled: boolean) {
  const occupied: { x: number; y: number; w: number; h: number }[] = [];
  const size = map.getSize();
  const rank = (id: string) => id === selectedId ? -1 : priority.includes(id) ? priority.indexOf(id) : 100;
  for (const place of [...places].sort((a, b) => rank(a.id) - rank(b.id))) {
    const marker = markers.get(place.id);
    const element = marker?.getTooltip()?.getElement();
    if (!marker || !element) continue;
    const point = map.latLngToContainerPoint(marker.getLatLng());
    const w = element.offsetWidth || place.name.length * 7 + 20;
    const h = element.offsetHeight || 26;
    const box = { x: point.x - w / 2, y: point.y - h - 20, w, h };
    const selected = place.id === selectedId;
    const inView = box.x >= 0 && box.y >= 0 && box.x + w <= size.x && box.y + h <= size.y;
    const overlaps = occupied.some(b => box.x < b.x + b.w + 6 && box.x + w + 6 > b.x && box.y < b.y + b.h + 6 && box.y + h + 6 > b.y);
    const show = selected || (enabled && inView && !overlaps);
    element.style.visibility = show ? "visible" : "hidden";
    if (show) occupied.push(box);
  }
}
