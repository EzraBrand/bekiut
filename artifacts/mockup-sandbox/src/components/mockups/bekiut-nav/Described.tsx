import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, BookText, ChevronDown, FileText, Highlighter, Layers, ListTree, Map, MapPin, ScanText, Sparkles } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import "./Described.css";

// Isolated adaptation of the extracted NavDropdown, ToolsNav and DictionariesNav.
const tools = [
  { title: "Talmud Term Index", href: "/term-index", description: "Browse recurring Talmudic terms.", icon: ListTree },
  { title: "Mishnah Map", href: "/mishnah-map", description: "Locate Mishnah passages in the Talmud.", icon: Map },
  { title: "Biblical Index", href: "/biblical-index", description: "Find biblical verses cited in the Talmud.", icon: BookText },
  { title: "Sugya Viewer", href: "/sugya-viewer", description: "Study a custom range of Talmud text.", icon: Layers },
  { title: "Places — Biblical & Talmudic Map", href: "/places", description: "Explore the geography behind the texts.", icon: MapPin },
  { title: "Famous Pages", href: "/suggested-pages", description: "Discover well-known Talmud passages.", icon: Highlighter },
  { title: "J.N. Epstein's Introductions", href: "/scholarship", description: "Read introductions to Talmudic literature.", icon: FileText },
];
const dictionaries = [
  { title: "Jastrow", href: "/jastrow", description: "Rabbinic Hebrew and Aramaic", icon: BookOpen },
  { title: "BDB", href: "/bdb", description: "Biblical Hebrew", icon: ScanText },
];
type Menu = "Tools" | "Dictionaries";

export function Described() {
  const [open, setOpen] = useState<Menu | null>("Tools");
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const triggers = useRef<Partial<Record<Menu, HTMLButtonElement | null>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef<Menu | null>(null);
  const cancel = () => clearTimeout(timer.current);
  const closeLater = () => {
    cancel();
    if (hovered.current) timer.current = setTimeout(() => { setOpen(null); hovered.current = null; }, 180);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) { setOpen(null); hovered.current = null; }
    };
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("pointerdown", outside); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(timeout);
  }, [notice]);
  const select = (event: MouseEvent<HTMLAnchorElement>, title: string, href: string) => {
    event.preventDefault();
    setSelected(href);
    setNotice(`${title} selected`);
  };
  const onKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      triggers.current[open]?.focus();
      setOpen(null);
      hovered.current = null;
    }
    if (panel.current?.contains(event.target as Node) && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const links = Array.from(panel.current.querySelectorAll<HTMLAnchorElement>(".bd-item"));
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    }
  };
  return (
    <div className="bd-directory" onKeyDown={onKeys}>
      <header className="bd-header">
        <div className="bd-header-inner" ref={root}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { cancel(); setOpen(null); } }}>
          <a className="bd-brand" href="/" onClick={event => select(event, "Bekiut home", "/")}>
            <img src="/__mockup/images/bekiut-logo.png" alt="" /><span>Bekiut</span>
          </a>
          <nav className="bd-nav" aria-label="Main navigation">
            <a href="#library" onClick={event => select(event, "Library", "#library")}>Library</a>
            <a href="/search" onClick={event => select(event, "Search", "/search")}>Search</a>
            {(["Dictionaries", "Tools"] as Menu[]).map(label => (
              <button key={label} type="button" className="bd-trigger" ref={node => { triggers.current[label] = node; }}
                aria-expanded={open === label} aria-controls={`bd-${label.toLowerCase()}`} id={`bd-trigger-${label.toLowerCase()}`}
                onPointerEnter={event => {
                  cancel();
                  if (event.pointerType === "mouse" && matchMedia("(hover: hover) and (pointer: fine)").matches) {
                    if (open !== label) hovered.current = label;
                    setOpen(label);
                  }
                }}
                onPointerLeave={closeLater}
                onClick={() => {
                  cancel();
                  if (hovered.current === label) { hovered.current = null; setOpen(label); }
                  else setOpen(value => value === label ? null : label);
                }}
                onKeyDown={event => {
                  hovered.current = null;
                  cancel();
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setOpen(label);
                    requestAnimationFrame(() => panel.current?.querySelector<HTMLAnchorElement>(".bd-item")?.focus());
                  }
                }}>
                {label}<ChevronDown size={13} strokeWidth={1.7} aria-hidden="true" />
              </button>
            ))}
            <a href="/about" onClick={event => select(event, "About Bekiut", "/about")}>About Bekiut</a>
          </nav>
          {open && <div className="bd-panel" ref={panel} id={`bd-${open.toLowerCase()}`} aria-labelledby={`bd-trigger-${open.toLowerCase()}`}
            onPointerEnter={cancel} onPointerLeave={closeLater}>
            <div className="bd-panel-heading">
              <h2>{open === "Tools" ? "Find a new way into the text." : "A word opens a world."}</h2>
              <p>{open === "Tools" ? "Indexes, maps, and companions for your study." : "Two trusted companions for the language of the texts."}</p>
            </div>
            <div className="bd-items">
              {(open === "Tools" ? tools : dictionaries).map(({ title, href, description, icon: Icon }) =>
                <a href={href} key={href} className="bd-item" data-selected={selected === href} onClick={event => select(event, title, href)}>
                  <Icon className="bd-item-icon" size={21} strokeWidth={1.45} aria-hidden="true" />
                  <span className="bd-item-copy"><span className="bd-item-title">{title}</span><span className="bd-item-description">{description}</span></span>
                  <ArrowRight className="bd-item-arrow" size={15} aria-hidden="true" />
                </a>
              )}
            </div>
            <div className="bd-panel-footer"><BookOpen size={13} strokeWidth={1.5} aria-hidden="true" />{open === "Tools" ? "Different perspectives. A deeper understanding." : "Read closely. Understand more."}</div>
          </div>}
        </div>
      </header>
      <main className="bd-context">
        <h1>Study Classical Jewish Texts</h1>
        <p>The Talmud, Tanakh, Mishnah, and more —<br />with bilingual Hebrew-English text</p>
        <div className="bd-context-rule" />
      </main>
      {notice && <div className="bd-live" role="status"><Sparkles size={12} aria-hidden="true" style={{ display: "inline", marginRight: 7 }} />{notice}</div>}
    </div>
  );
}
