import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/lib/places";
import { addPlacesBasemap } from "./places-basemap";
import { updatePlaceLabels } from "./place-labels";
import type { MapBackground } from "./map-backgrounds";
import { mapRegions, type MapRegion } from "./map-regions";

export interface PlacesMapProps {
  background?: MapBackground;
  labels?: boolean;
  region?: MapRegion;
  places: Place[];
  selectedId: string | null;
  /** Increments on every selection so repeated selection re-focuses. */
  focusToken: number;
  /** Increments to request fitting all visible places. */
  fitToken: number;
  onSelect: (id: string) => void;
  onTileProblem: (kind: "tileerror" | "timeout" | "webgl") => void;
  onTilesOk: () => void;
}

const TILE_TIMEOUT_MS = 12000;

function markerIcon(selected: boolean, certainty: Place["certainty"]) {
  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<span class="places-pin${selected ? " is-selected" : ""} places-pin-${certainty.toLowerCase()}"></span>`,
  });
}

export default function PlacesMap({
  places,
  selectedId,
  focusToken,
  fitToken,
  onSelect,
  onTileProblem,
  onTilesOk,
  background = "landscape",
  labels = true,
  region = "all",
}: PlacesMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const cb = useRef({ onSelect, onTileProblem, onTilesOk });
  cb.current = { onSelect, onTileProblem, onTilesOk };

  useEffect(() => {
    if (!elRef.current) return;
    const map = L.map(elRef.current, { center: [32, 36], zoom: 5, scrollWheelZoom: false, worldCopyJump: false });
    mapRef.current = map;
    L.control.scale({ imperial: false }).addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const removeBasemap = addPlacesBasemap(map, {
      onProblem: kind => cb.current.onTileProblem(kind),
      onReady: () => cb.current.onTilesOk(),
    }, TILE_TIMEOUT_MS, background);
    return () => {
      removeBasemap();
    };
  }, [background]);

  // Markers for visible places
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();
    places.forEach((p) => {
      const m = L.marker([p.latitude, p.longitude], {
        icon: markerIcon(p.id === selectedId, p.certainty),
        keyboard: true,
        title: p.name,
        alt: `${p.name} (${p.certainty})`,
        riseOnHover: true,
      });
      m.on("click", () => cb.current.onSelect(p.id));
      m.bindTooltip(p.name, { direction: "top", offset: [0, -10], permanent: true, className: "places-name-label" });
      m.addTo(map);
      const el = m.getElement();
      if (el) {
        el.setAttribute("aria-label", `${p.name}, ${p.certainty.toLowerCase()} location. Show details`);
        el.setAttribute("role", "button");
        // Leaflet already translates Enter to click; add Space without page scrolling.
        el.addEventListener("keydown", (event) => {
          if (event.key === " ") {
            event.preventDefault();
            cb.current.onSelect(p.id);
          }
        });
      }
      markersRef.current.set(p.id, m);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places]);

  // Selection styling
  useEffect(() => {
    places.forEach((p) => {
      const m = markersRef.current.get(p.id);
      if (!m) return;
      m.setIcon(markerIcon(p.id === selectedId, p.certainty));
      m.setZIndexOffset(p.id === selectedId ? 1000 : 0);
      const el = m.getElement();
      if (el) {
        el.setAttribute("aria-label", `${p.name}, ${p.certainty.toLowerCase()} location. Show details`);
        el.setAttribute("role", "button");
        el.setAttribute("aria-pressed", String(p.id === selectedId));
      }
    });
  }, [selectedId, places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => updatePlaceLabels(map, markersRef.current, places, selectedId, labels);
    update();
    map.on("moveend zoomend resize", update);
    const cleanups: (() => void)[] = [];
    markersRef.current.forEach(marker => {
      const reveal = () => {
        const el = marker.getTooltip()?.getElement();
        if (el) el.style.visibility = "visible";
      };
      marker.on("mouseover", reveal).on("mouseout", update);
      const icon = marker.getElement();
      icon?.addEventListener("focus", reveal);
      icon?.addEventListener("blur", update);
      cleanups.push(() => {
        marker.off("mouseover", reveal).off("mouseout", update);
        icon?.removeEventListener("focus", reveal);
        icon?.removeEventListener("blur", update);
      });
    });
    return () => { map.off("moveend zoomend resize", update); cleanups.forEach(fn => fn()); };
  }, [places, selectedId, labels]);

  // Focus selected (repeatable)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;
    map.flyTo([p.latitude, p.longitude], Math.max(map.getZoom(), 9), { duration: 0.6, animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken]);

  // Fit all
  useEffect(() => {
    const map = mapRef.current;
    if (!map || places.length === 0) return;
    const selected = places.find((p) => p.id === selectedId);
    const bounds = mapRegions[region].bounds;
    if (bounds) {
      map.fitBounds(bounds, { padding: [24, 24] });
    } else if (selected) {
      map.setView([selected.latitude, selected.longitude], 9);
    } else {
      const b = L.latLngBounds(places.map((p) => [p.latitude, p.longitude] as [number, number]));
      map.fitBounds(b, { padding: [28, 28], maxZoom: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitToken, region]);

  return (
    <div
      ref={elRef}
      className="h-full w-full"
      role="region"
      aria-label="Map of places. Markers are keyboard focusable; press Enter to show details."
      data-testid="map-places"
    />
  );
}
