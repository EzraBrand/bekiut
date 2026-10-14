import { forwardRef } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { gazetteerSources, type Place } from "@/lib/places";

const corpusLabel = { biblical: "Biblical", talmudic: "Talmudic" } as const;

export function googleMapsUrl(p: Place) {
  return `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;
}

const certaintyTone: Record<Place["certainty"], string> = {
  Established: "border-[var(--category-tanakh)] text-[var(--category-tanakh)]",
  Approximate: "border-[var(--category-mishneh-torah)] text-[var(--category-mishneh-torah)]",
  Disputed: "border-[var(--category-mishnah)] text-[var(--category-mishnah)]",
};

const linkCls = "inline-flex items-center gap-1 underline underline-offset-2 decoration-dotted hover:decoration-solid text-primary";

export const PlaceDetails = forwardRef<HTMLDivElement, { place: Place | null }>(function PlaceDetails({ place }, ref) {
  if (!place) {
    return (
      <div ref={ref} tabIndex={-1} className="border border-dashed border-border rounded p-6 text-sm text-muted-foreground" data-testid="details-empty">
        <MapPin className="h-5 w-5 mb-2 opacity-60" aria-hidden="true" />
        Choose a place from the list or a marker on the map to read its sources, identification and coordinate citation.
      </div>
    );
  }
  const corpora = Array.from(new Set(place.sources.map((s) => s.corpus)));
  return (
    <article
      ref={ref}
      tabIndex={-1}
      key={place.id}
      aria-live="polite"
      className="places-details border border-border rounded bg-card p-5 md:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid={`details-place-${place.id}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-georgia text-2xl" data-testid="text-place-name"><bdi>{place.name}</bdi></h2>
        <span className={`text-xs uppercase tracking-wider border rounded px-1.5 py-0.5 ${certaintyTone[place.certainty]}`} data-testid="text-place-certainty">
          {place.certainty}
        </span>
      </div>
      {place.aliases.length > 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          Also: {place.aliases.map((a, i) => (
            <span key={a}>{i > 0 && " · "}<bdi className="text-foreground">{a}</bdi></span>
          ))}
        </p>
      )}

      <dl className="grid gap-4 text-sm leading-relaxed">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Geographic identification</dt>
          <dd>{place.identification}</dd>
          {place.identificationSources && (
            <dd className="mt-2">
              <ul className="space-y-1" aria-label="Identification references">
                {place.identificationSources.map(source => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className={linkCls}>
                      {source.title}<ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </dd>
          )}
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Appears in supplied lists</dt>
          <dd>
            <ul className="space-y-1">
              {place.sources.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="h-[2px] w-3 mt-[0.6rem] shrink-0" style={{ backgroundColor: `var(--category-${s.corpus === "biblical" ? "tanakh" : "talmud-bavli"})` }} aria-hidden="true" />
                  <span><span className="text-muted-foreground">{corpusLabel[s.corpus]}:</span> <bdi>{s.name}</bdi></span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Coordinates</dt>
          <dd className="space-y-1">
            <p className="font-mono text-[0.8rem]" data-testid="text-place-coords">
              {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
            </p>
            <p>{place.coordinateNote}</p>
            <p>
              Source:{" "}
              <a href={place.coordinateSource.url} target="_blank" rel="noopener noreferrer" className={linkCls} data-testid="link-coordinate-source">
                {place.coordinateSource.title}<ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
            <p>
              <a href={googleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className={linkCls} data-testid="link-google-maps">
                Open these coordinates in Google Maps<ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Gazetteer lists</dt>
          <dd className="flex flex-wrap gap-x-4 gap-y-1">
            {corpora.map((c) => (
              <a key={c} href={gazetteerSources[c]} target="_blank" rel="noopener noreferrer" className={linkCls} data-testid={`link-gazetteer-${c}`}>
                {corpusLabel[c]} list<ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            ))}
          </dd>
        </div>
      </dl>
    </article>
  );
});
