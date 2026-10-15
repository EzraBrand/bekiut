import L from "leaflet";
import { mapBackgrounds, type MapBackground } from "./map-backgrounds";

/** Raster tiles avoid WebGL initialization and asynchronous vector-source failures. */
export function addPlacesBasemap(
  map: L.Map,
  callbacks: { onProblem: (kind: "tileerror" | "timeout" | "webgl") => void; onReady: () => void },
  timeout: number,
  background: MapBackground = "landscape",
): () => void {
  let raster: L.TileLayer | undefined;
  const key = import.meta.env.VITE_MAPTILER_API_KEY;
  const attribution = '<a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">&copy; MapTiler</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">&copy; OpenStreetMap contributors</a>';
  const logo = new L.Control({ position: "bottomleft" });
  logo.onAdd = () => {
    const link = L.DomUtil.create("a");
    link.href = "https://www.maptiler.com/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.innerHTML = '<img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler" width="100" height="30" />';
    L.DomEvent.disableClickPropagation(link);
    return link;
  };
  logo.addTo(map);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failed = false;
  const stopTimer = () => clearTimeout(timer);
  const fail = () => {
    failed = true;
    stopTimer();
    callbacks.onProblem("tileerror");
  };
  try {
    if (!key) throw new Error("MapTiler browser key not configured");
    const style = mapBackgrounds[background].style;
    raster = L.tileLayer(`https://api.maptiler.com/maps/${style}/{z}/{x}/{y}.png?key=${encodeURIComponent(key)}`, {
      tileSize: 512, zoomOffset: -1, maxZoom: 19, attribution, className: "places-raster-tiles",
    });
    const loading = () => {
      if (!timer && !failed) timer = setTimeout(() => {
        timer = undefined;
        callbacks.onProblem("timeout");
      }, timeout);
    };
    loading();
    raster.on("loading", loading);
    raster.on("load", () => {
      stopTimer();
      timer = undefined;
      if (!failed) callbacks.onReady();
    });
    // Do not log provider errors: request URLs may contain the browser key.
    raster.on("tileerror", fail);
    raster.addTo(map);
  } catch {
    fail();
  }
  return () => {
    stopTimer();
    logo.remove();
    raster?.remove();
  };
}
