import { Component, lazy, Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Search, X } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { getStaticSEO } from "@workspace/shared-data/seo-data";
import { PageShell, PageHeader, PageSection, SectionHeading } from "@/components/layout";
import { filterPlaces, gazetteerSources, places } from "@/lib/places";
import { PlaceDetails, googleMapsUrl } from "@/components/places/place-details";
import "@/components/places/places.css";
import { mapBackgrounds, type MapBackground } from "@/components/places/map-backgrounds";
import { mapRegions, type MapRegion } from "@/components/places/map-regions";

type Corpus = "all" | "biblical" | "talmudic";
type MapProblem = null | "tileerror" | "timeout" | "import" | "webgl";

const loadMap = () => import("@/components/places/places-map");

class MapBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const problemText: Record<Exclude<MapProblem, null>, string> = {
  webgl: "Your browser cannot display the vector map. A simpler MapTiler map is shown instead, using its default labels.",
  tileerror: "The MapTiler map images failed to load. Network access or the map key’s domain restrictions may be the cause.",
  timeout: "The MapTiler map did not respond in time.",
  import: "The map component could not be loaded.",
};

export default function PlacesPage() {
  useSEO(getStaticSEO("/places", window.location.origin)!);

  const [query, setQuery] = useState("");
  const [corpus, setCorpus] = useState<Corpus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusToken, setFocusToken] = useState(0);
  const [fitToken, setFitToken] = useState(0);
  const [problem, setProblem] = useState<MapProblem>(null);
  const [attempt, setAttempt] = useState(0);
  const [background, setBackground] = useState<MapBackground>("landscape");
  const [labels, setLabels] = useState(true);
  const [region, setRegion] = useState<MapRegion>("all");
  const detailsRef = useRef<HTMLDivElement>(null);
  const mapAnchorRef = useRef<HTMLDivElement>(null);

  const LazyMap = useMemo(() => lazy(loadMap), [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(() => filterPlaces(query, corpus), [query, corpus]);
  const selected = useMemo(() => visible.find((p) => p.id === selectedId) ?? null, [visible, selectedId]);

  const applyFilter = (q: string, c: Corpus) => {
    setRegion("all");
    const next = filterPlaces(q, c);
    if (selectedId && !next.some((p) => p.id === selectedId)) setSelectedId(null);
    setFitToken((t) => t + 1);
  };

  const select = useCallback((id: string, from: "list" | "map") => {
    setRegion("all");
    setSelectedId(id);
    setFocusToken((t) => t + 1);
    if (from === "list") {
      mapAnchorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      requestAnimationFrame(() => detailsRef.current?.focus({ preventScroll: true }));
    }
  }, []);
  const onMapSelect = useCallback((id: string) => select(id, "map"), [select]);
  const onTileProblem = useCallback((k: "tileerror" | "timeout" | "webgl") => setProblem((p) => p === "webgl" ? k : p ?? k), []);
  const onTilesOk = useCallback(() => setProblem((p) => (p === "timeout" ? null : p)), []);

  const reset = () => {
    setRegion("all");
    setQuery("");
    setCorpus("all");
    setSelectedId(null);
    setFitToken((t) => t + 1);
  };

  const retry = () => {
    setProblem(null);
    setAttempt((a) => a + 1);
  };

  const corpusOptions: { value: Corpus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "biblical", label: "Biblical" },
    { value: "talmudic", label: "Talmudic" },
  ];

  const placeList = (
        <div className="min-w-0" data-testid="places-list-section">
          <h2 className="font-georgia text-2xl mb-4">Explore places</h2>
          <div className="space-y-3 mb-3">
            <label className="relative block">
              <span className="sr-only">Search places by name or alias</span>
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                dir="auto"
                value={query}
                onChange={(e) => { setQuery(e.target.value); applyFilter(e.target.value, corpus); }}
                placeholder="Search, e.g. Shiloh or ירושלים"
                className="w-full h-10 pl-8 pr-8 rounded border border-border bg-background text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid="input-place-search"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(""); applyFilter("", corpus); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Clear search" data-testid="button-clear-search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <div className="flex items-center gap-2">
              <div role="group" aria-label="Filter by corpus" className="inline-flex border border-border rounded overflow-hidden text-sm">
                {corpusOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={corpus === o.value}
                    onClick={() => { setCorpus(o.value); applyFilter(query, o.value); }}
                    className={`px-3 h-9 transition-colors active:scale-[0.97] ${corpus === o.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    data-testid={`button-filter-${o.value}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 h-9 px-2 text-sm text-muted-foreground hover:text-foreground active:scale-[0.97] transition" data-testid="button-reset">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset
              </button>
            </div>
            <p className="text-xs text-muted-foreground" aria-live="polite" data-testid="text-result-count">
              {visible.length} of {places.length} places
            </p>
          </div>
          {visible.length === 0 ? (
            <div className="border border-dashed border-border rounded p-5 text-sm text-muted-foreground" data-testid="list-empty">
              No curated place matches “<bdi>{query}</bdi>”. Try an alias or another spelling, or{" "}
              <button type="button" onClick={reset} className="underline underline-offset-2">reset</button>.
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 border border-border rounded max-h-[28rem] overflow-y-auto" aria-label="Places">
              {visible.map((p) => {
                const active = p.id === selectedId;
                return (
                  <li key={p.id} className="border-b border-border">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => select(p.id, "list")}
                      className={`w-full text-left px-3 py-2.5 transition-colors border-l-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${active ? "bg-accent border-l-primary" : "border-l-transparent hover:bg-muted"}`}
                      data-testid={`button-place-${p.id}`}
                    >
                      <span className="block font-georgia"><bdi>{p.name}</bdi></span>
                      {p.certainty === "Disputed" && <span className="block text-xs text-muted-foreground">Disputed identification</span>}
                      <span className="block text-xs text-muted-foreground truncate">
                        {Array.from(new Set(p.sources.map((s) => s.corpus))).map((c) => (c === "biblical" ? "Biblical" : "Talmudic")).join(" · ")}
                        {p.aliases.length > 0 && <> · <bdi>{p.aliases.slice(0, 2).join(", ")}</bdi></>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
  );

  return (
    <PageShell mainClassName="max-w-7xl">
      <PageHeader
        category="tanakh"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Places" }]}
        title={<span className="inline-flex flex-wrap items-baseline gap-3">Places <span className="text-xs font-sans uppercase tracking-widest border border-border text-muted-foreground rounded px-1.5 py-0.5" data-testid="badge-experimental">Experimental</span></span>}
        titleTestId="text-page-title"
      >
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          Explore {places.length} biblical and Talmudic places. Choose a marker on the map or a name from the list below to see its location, history, and sources.
        </p>
      </PageHeader>

      <div className="space-y-8 pb-10">
        {/* Map and details precede the list in both visual and keyboard order. */}
        <div className="min-w-0 space-y-4">
          <div ref={mapAnchorRef} className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Map overview</p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Show all places and clear the selection, search, and filters"
              data-testid="button-reset-map"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset map
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div role="group" aria-labelledby="places-regions-label" className="flex flex-wrap items-center gap-1">
              <span id="places-regions-label" className="mr-2">Regions</span>
              {(Object.keys(mapRegions) as MapRegion[]).map(value => (
                <button key={value} type="button" data-testid={`button-region-${value}`} aria-pressed={region === value}
                  onClick={() => { setRegion(value); setSelectedId(null); setFitToken(t => t + 1); }}
                  className={`rounded border px-2 py-1.5 ${region === value ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{mapRegions[value].label}</button>
              ))}
            </div>
            <label className="ml-auto flex items-center gap-2">Background
              <select aria-label="Map background" data-testid="select-map-background" value={background}
                onChange={e => { setBackground(e.target.value as MapBackground); setProblem(null); }}
                className="rounded border bg-background px-2 py-1.5">
                {Object.entries(mapBackgrounds).map(([value, option]) => <option key={value} value={value}>{option.label}</option>)}
              </select>
            </label>
            <div className="flex w-full justify-end">
              <label className="flex items-center gap-2"><input type="checkbox" data-testid="toggle-place-labels" checked={labels} onChange={e => setLabels(e.target.checked)} />Place labels</label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground" aria-live="polite">{mapBackgrounds[background].description} All backgrounds show modern geography.</p>
          <p className="text-xs text-muted-foreground">Labels appear where space permits; zoom in for more. Regional views move the map without filtering the list. These are viewing areas, not ancient borders.</p>
          <div className="places-map-frame h-[24rem] sm:h-[32rem] lg:h-[38rem] border border-border rounded overflow-hidden bg-muted">
            {problem !== "import" && (
              <MapBoundary key={attempt} onError={() => setProblem("import")}>
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted" data-testid="map-loading" />}>
                  <LazyMap
                    key={attempt}
                    places={visible}
                    selectedId={selected?.id ?? null}
                    focusToken={focusToken}
                    fitToken={fitToken}
                    background={background}
                    labels={labels}
                    region={region}
                    onSelect={onMapSelect}
                    onTileProblem={onTileProblem}
                    onTilesOk={onTilesOk}
                  />
                </Suspense>
              </MapBoundary>
            )}
            {problem === "import" && <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground p-6 text-center">Map unavailable. The list and details remain fully usable.</div>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Identification certainty legend">
            {(["Established", "Approximate", "Disputed"] as const).map(certainty => (
              <span key={certainty} className="inline-flex items-center gap-1">
                <span aria-hidden="true" className={`places-pin places-pin-${certainty.toLowerCase()}`} />{certainty}
              </span>
            ))}
          </div>
          {problem && (
            <div role="alert" className="flex flex-wrap items-start gap-3 border border-[var(--category-mishneh-torah)] rounded p-3 text-sm" data-testid="alert-map-problem">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-[var(--category-mishneh-torah)]" aria-hidden="true" />
              <p className="flex-1 min-w-[12rem]">
                {problemText[problem]} You can still use the list and details{selected ? <>, or <a className="underline" href={googleMapsUrl(selected)} target="_blank" rel="noopener noreferrer">open {selected.name} in Google Maps</a></> : ""}.
              </p>
              <button type="button" onClick={retry} className="inline-flex items-center gap-1 px-3 h-8 rounded border border-border hover:bg-accent active:scale-[0.97] transition" data-testid="button-retry-map">
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry map
              </button>
            </div>
          )}
          <PlaceDetails ref={detailsRef} place={selected} />
        </div>
        {placeList}
      </div>

      <PageSection>
        <SectionHeading className="mb-3">About this list</SectionHeading>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground max-w-3xl">
          <p>These {places.length} places are a curated selection of well-known sites. They are not ranked by how often they are mentioned and are not a frequency list.</p>
          <p>A place's Biblical or Talmudic label means only that it appears in the supplied gazetteer lists (<a className="underline" href={gazetteerSources.biblical} target="_blank" rel="noopener noreferrer">biblical</a>, <a className="underline" href={gazetteerSources.talmudic} target="_blank" rel="noopener noreferrer">Talmudic</a>). It is not an exhaustive record of every attestation in either corpus.</p>
          <p>Each marker is a reference point for a modern identification. It does not depict ancient boundaries, extent, or settlement history. “Established” means the identification is widely accepted, not that the pin locates every historical use of the name. “Approximate” marks city-level or less precise locations; “Disputed” flags competing identifications.</p>
          <p>The Babylonian Jewish centers Sura, Pumbedita, Nehardea, and Meḥoza are included. Sura, Pumbedita, and Nehardea have disputed locations: their pins show cited proposals or nearby reference points, not verified academy sites. Read each place’s coordinate note before interpreting its marker.</p>
          <p>Regional entries, such as Cappadocia and Adiabene, use a reference point within the region and are labeled accordingly. Sites with no usable location proposal and non-geographic terms (such as Sheol and “Truth”) are excluded. Hebrew aliases are editorial search aids.</p>
          <p>The modern basemap is provided by <a className="underline" href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">MapTiler</a>, using OpenStreetMap and other credited data. Requests send your IP address and page referrer to MapTiler and count against the site’s MapTiler allowance. Labels prefer English; names without a translation may use a local-language fallback. This is not a map of ancient borders.</p>
        </div>
      </PageSection>
    </PageShell>
  );
}
