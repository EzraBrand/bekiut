import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

/** "Dictionaries" nav item with Jastrow and BDB beneath it. */
export function DictionariesNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);
  return (
    <div className="relative" ref={ref} onBlur={(e) => { if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button
        type="button"
        className="font-medium text-foreground hover:text-primary whitespace-nowrap"
        aria-expanded={open}
        aria-controls="nav-dictionaries-menu"
        onClick={() => setOpen((v) => !v)}
        data-testid="nav-button-dictionaries"
      >
        Dictionaries <span aria-hidden="true" className="text-xs">▾</span>
      </button>
      {open && (
        <ul id="nav-dictionaries-menu" className="absolute right-0 top-full mt-2 z-50 w-64 rounded border border-border bg-card py-1 shadow-md text-left">
          <li>
            <Link href="/jastrow" onClick={() => setOpen(false)} className="block px-3 py-2 hover:bg-secondary" data-testid="nav-link-jastrow">
              <span className="text-foreground">Jastrow</span>
              <span className="block text-xs text-muted-foreground">Rabbinic Hebrew and Aramaic</span>
            </Link>
          </li>
          <li>
            <Link href="/bdb" onClick={() => setOpen(false)} className="block px-3 py-2 hover:bg-secondary" data-testid="nav-link-bdb">
              <span className="text-foreground">BDB</span>
              <span className="block text-xs text-muted-foreground">Biblical Hebrew</span>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
