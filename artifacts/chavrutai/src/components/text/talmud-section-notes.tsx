import { useEffect, useState, type ReactNode } from "react";

export const noteReferenceClass = "inline-block min-w-5 rounded-sm bg-primary/10 px-1 py-0.5 text-xs font-bold leading-normal text-primary hover:bg-primary/20 underline decoration-primary/50 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary scroll-mt-32 transition-colors";

export interface SectionNote {
  number: number;
  paragraphs: string[];
}

export function TalmudSectionNotes({ id, notes, children }: {
  id: string;
  notes: SectionNote[];
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [target, setTarget] = useState<number | null>(null);

  useEffect(() => {
    if (target === null || !expanded) return;
    const element = document.getElementById(`${id}-note-${target}`);
    element?.focus({ preventScroll: true });
    element?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    setTarget(null);
  }, [target, expanded, id]);

  return (
    <div onClick={event => {
      const reference = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-talmud-note]");
      if (!reference) return;
      setExpanded(true);
      setTarget(Number(reference.dataset.talmudNote));
    }}>
      {children}
      {notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/40">
          <button
            id={`${id}-notes-toggle`}
            type="button"
            aria-expanded={expanded}
            aria-controls={`${id}-notes`}
            onClick={() => setExpanded(value => !value)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden="true">{expanded ? "▼" : "▶"}</span>
            {expanded ? "Hide notes" : `Notes (${notes.length})`}
          </button>
          <div id={`${id}-notes`} role="region" aria-labelledby={`${id}-notes-toggle`} hidden={!expanded} className="mt-3 space-y-2 text-sm text-muted-foreground max-w-prose">
            {notes.map(note => (
              <div key={note.number} id={`${id}-note-${note.number}`} tabIndex={-1} className="flex gap-2 scroll-mt-24">
                <sup className="leading-5 flex-shrink-0">
                  <a
                    href={`#${id}-ref-${note.number}`}
                    aria-label={`Return to reference ${note.number} in the main text`}
                    title={`Return to reference ${note.number}`}
                    className={noteReferenceClass}
                    onClick={event => {
                      event.preventDefault();
                      const reference = document.getElementById(`${id}-ref-${note.number}`);
                      reference?.focus({ preventScroll: true });
                      reference?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    {note.number}
                  </a>
                </sup>
                <div className="english-text min-w-0">
                  {note.paragraphs.map((html, index) => (
                    <p key={index} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}