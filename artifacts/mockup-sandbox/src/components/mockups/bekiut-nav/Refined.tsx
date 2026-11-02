import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, BookOpen, BookText, Check, ChevronDown, FileText, Layers, List, Map, MapPin, ScanText } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import "./Refined.css";

// Isolated adaptation of _source/nav-dropdown.tsx: same labels, order and URLs.
const tools = [
  { title: "Talmud Term Index", href: "/term-index", icon: List },
  { title: "Mishnah Map", href: "/mishnah-map", icon: Map },
  { title: "Biblical Index", href: "/biblical-index", icon: BookText },
  { title: "Sugya Viewer", href: "/sugya-viewer", icon: ScanText },
  { title: "Places — Biblical & Talmudic Map", href: "/places", icon: MapPin },
  { title: "Famous Pages", href: "/suggested-pages", icon: Layers },
  { title: "J.N. Epstein's Introductions", href: "/scholarship", icon: FileText },
];
const dictionaries = [
  { title: "Jastrow", href: "/jastrow", icon: BookOpen, description: "Rabbinic Hebrew and Aramaic" },
  { title: "BDB", href: "/bdb", icon: BookText, description: "Biblical Hebrew" },
];
type MenuName = "Tools" | "Dictionaries";

export function Refined() {
  const [open, setOpen] = useState<MenuName | null>("Tools");
  const [selected, setSelected] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false);
  const uid = useId();
  const cancelClose = () => clearTimeout(closeTimer.current);
  const closeLater = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => { if (hovered.current) setOpen(null); }, 200);
  };
  useEffect(() => {
    const pointerDown = (event: PointerEvent) => {
      if (!root.current?.querySelector("header")?.contains(event.target as Node)) setOpen(null);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(current => {
          if (current) root.current?.querySelector<HTMLButtonElement>(`[data-menu="${current}"]`)?.focus();
          return null;
        });
      }
    };
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("keydown", escape);
      clearTimeout(closeTimer.current);
      clearTimeout(noticeTimer.current);
    };
  }, []);
  const select = (event: MouseEvent<HTMLAnchorElement>, href: string, title: string) => {
    event.preventDefault();
    setSelected(href);
    setAnnouncement(`${title} selected`);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setAnnouncement(""), 2200);
  };
  const keyboard = (event: KeyboardEvent, name: MenuName) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    hovered.current = false;
    cancelClose();
    setOpen(name);
    requestAnimationFrame(() => {
      const links = Array.from(root.current?.querySelectorAll<HTMLAnchorElement>(`[data-panel="${name}"] a`) ?? []);
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : event.key === "ArrowDown" ? (index + 1) % links.length : (index - 1 + links.length) % links.length;
      links[next]?.focus();
    });
  };
  return (
    <div className="bk-refined" ref={root} onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(null);
    }}>
      <header className="bk-refined-header">
        <div className="bk-refined-bar">
          <a className="bk-refined-logo" href="/" onClick={event => select(event, "/", "Bekiut")}>
            <img src="/__mockup/images/bekiut-logo.png" width="33" height="33" alt="" />
            <span>Bekiut</span>
          </a>
          <nav className="bk-refined-nav" aria-label="Main navigation">
            <a href="#library" onClick={event => select(event, "#library", "Library")}>Library</a>
            <a href="/search" onClick={event => select(event, "/search", "Search")}>Search</a>
            {(["Dictionaries", "Tools"] as const).map(name => (
              <div className="bk-refined-group" key={name} onPointerEnter={event => {
                cancelClose();
                if (event.pointerType === "mouse" && window.matchMedia("(hover: hover)").matches) {
                  hovered.current = true;
                  setOpen(name);
                }
              }} onPointerLeave={closeLater}>
                <button type="button" data-menu={name} className="bk-refined-trigger"
                  id={`${uid}-${name}-trigger`} aria-expanded={open === name} aria-controls={`${uid}-${name}`}
                  onKeyDown={event => keyboard(event, name)}
                  onClick={() => {
                    cancelClose();
                    if (hovered.current && open === name) hovered.current = false;
                    else { hovered.current = false; setOpen(open === name ? null : name); }
                  }}>
                  {name}<ChevronDown size={12} strokeWidth={1.6} aria-hidden="true" />
                </button>
                {open === name && (
                  <div className="bk-refined-panel" id={`${uid}-${name}`} data-panel={name} aria-labelledby={`${uid}-${name}-trigger`}
                    onPointerEnter={cancelClose} onKeyDown={event => keyboard(event, name)}>
                    <div className="bk-refined-menu-heading"><span>{name === "Tools" ? "Study tools" : "Dictionaries"}</span><span>{name === "Tools" ? "7 resources" : "2 lexicons"}</span></div>
                    {(name === "Tools" ? tools : dictionaries).map(item => {
                      const Icon = item.icon;
                      return <a key={item.href} href={item.href} className="bk-refined-item" data-selected={selected === item.href} onClick={event => select(event, item.href, item.title)}>
                        <Icon size={17} strokeWidth={1.45} aria-hidden="true" />
                        <span>{item.title}{"description" in item && <small>{String(item.description)}</small>}</span>
                        {selected === item.href ? <Check className="bk-refined-arrow" size={14} aria-hidden="true" /> : <ArrowRight className="bk-refined-arrow" size={14} strokeWidth={1.5} aria-hidden="true" />}
                      </a>;
                    })}
                  </div>
                )}
              </div>
            ))}
            <a href="/about" onClick={event => select(event, "/about", "About Bekiut")}>About Bekiut</a>
          </nav>
        </div>
      </header>
      <main className="bk-refined-context">
        <h1>Study Classical Jewish Texts</h1>
        <p>The Talmud, Tanakh, Mishnah, and more —<br /> with bilingual Hebrew-English text</p>
        <div className="bk-refined-context-rule" />
      </main>
      <div role="status" aria-live="polite">{announcement && <div className="bk-refined-status">{announcement}</div>}</div>
    </div>
  );
}
