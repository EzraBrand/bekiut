import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import "./Grouped.css";

// The source dropdown's destination order and hover enhancement are retained.
const tools = [
  { title: "Talmud Term Index", href: "/term-index", description: "Browse recurring Talmudic terms" },
  { title: "Mishnah Map", href: "/mishnah-map", description: "Locate Mishnah passages in the Talmud" },
  { title: "Biblical Index", href: "/biblical-index", description: "Find biblical verses cited in the Talmud" },
  { title: "Sugya Viewer", href: "/sugya-viewer", description: "Study custom Talmud text ranges" },
  { title: "Places — Biblical & Talmudic Map", href: "/places", description: "Explore the geography of the sources" },
  { title: "Famous Pages", href: "/suggested-pages", description: "Discover well-known Talmud passages" },
  { title: "J.N. Epstein's Introductions", href: "/scholarship", description: "Read introductions to Talmudic literature" },
];
const dictionaries = [
  { title: "Jastrow", href: "/jastrow", description: "Rabbinic Hebrew and Aramaic" },
  { title: "BDB", href: "/bdb", description: "Biblical Hebrew" },
];
type Menu = "Tools" | "Dictionaries";

export function Grouped() {
  const [open, setOpen] = useState<Menu | null>("Tools");
  const [selected, setSelected] = useState("");
  const [notice, setNotice] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toolsButton = useRef<HTMLButtonElement>(null);
  const dictionaryButton = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hovered = useRef(false);
  const cancelClose = () => clearTimeout(closeTimer.current);
  const closeLater = () => {
    cancelClose();
    if (hovered.current) closeTimer.current = setTimeout(() => setOpen(null), 180);
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      clearTimeout(closeTimer.current);
      clearTimeout(noticeTimer.current);
    };
  }, []);
  const focusLink = () => requestAnimationFrame(() => panel.current?.querySelector<HTMLAnchorElement>("a")?.focus());
  const choose = (label: string, href: string) => {
    setSelected(href);
    setNotice(`${label} selected`);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 2200);
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      cancelClose();
      (open === "Tools" ? toolsButton : dictionaryButton).current?.focus();
      setOpen(null);
    }
    if (panel.current?.contains(event.target as Node) && ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const links = Array.from(panel.current.querySelectorAll<HTMLAnchorElement>("a"));
      const index = links.indexOf(document.activeElement as HTMLAnchorElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links[next]?.focus();
    }
  };
  const trigger = (label: Menu) => (
    <button type="button" ref={label === "Tools" ? toolsButton : dictionaryButton}
      className="bg-trigger" aria-expanded={open === label} aria-controls={`bg-${label.toLowerCase()}-panel`}
      onPointerEnter={event => {
        cancelClose();
        if (event.pointerType === "mouse" && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
          hovered.current = true;
          setOpen(label);
        }
      }} onPointerLeave={closeLater}
      onClick={event => {
        cancelClose();
        if (hovered.current && open === label && event.detail > 0) { hovered.current = false; return; }
        hovered.current = false;
        setOpen(open === label ? null : label);
      }}
      onKeyDown={event => {
        hovered.current = false;
        cancelClose();
        if (event.key === "ArrowDown") { event.preventDefault(); setOpen(label); focusLink(); }
      }}>
      {label}<svg className="bg-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.3" /></svg>
    </button>
  );
  const renderItem = (item: typeof tools[number]) => (
    <a className="bg-item" href={item.href} key={item.href} data-selected={selected === item.href}
      onClick={event => { event.preventDefault(); choose(item.title, item.href); }}>
      <span className="bg-item-copy"><span className="bg-item-title">{item.title}</span><span className="bg-item-description">{item.description}</span></span>
      <span className="bg-item-arrow" aria-hidden="true">{selected === item.href ? "✓" : "›"}</span>
    </a>
  );
  return (
    <div className="bekiut-grouped" onKeyDown={keyboard}>
      <header className="bg-header">
        <div className="bg-header-inner" ref={root} onBlur={event => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(null);
        }}>
          <a className="bg-logo" href="/" onClick={event => { event.preventDefault(); setOpen(null); }}>
            <img src="/__mockup/images/bekiut-logo.png" alt="" width="34" height="34" /><span>Bekiut</span>
          </a>
          <nav className="bg-nav" aria-label="Main navigation">
            <a href="#library" onClick={event => { event.preventDefault(); setOpen(null); choose("Library", "#library"); }}>Library</a>
            <a href="/search" onClick={event => { event.preventDefault(); setOpen(null); choose("Search", "/search"); }}>Search</a>
            {trigger("Dictionaries")}{trigger("Tools")}
            <a className="bg-about" href="/about" onClick={event => { event.preventDefault(); setOpen(null); choose("About Bekiut", "/about"); }}>About Bekiut</a>
          </nav>
          {open && <div className={`bg-panel ${open === "Dictionaries" ? "bg-dictionaries" : ""}`} id={`bg-${open.toLowerCase()}-panel`}
            ref={panel} aria-label={open} onPointerEnter={cancelClose} onPointerLeave={closeLater}
            onKeyDown={() => { hovered.current = false; cancelClose(); }}>
            <div className="bg-panel-heading">
              <h2>{open === "Tools" ? "Tools for your study" : "Find the right meaning"}</h2>
              <p>{open === "Tools" ? "Find a reference. Follow a passage. Explore further." : "Two dictionaries, each with a distinct scope."}</p>
            </div>
            <div className="bg-columns">
              {open === "Tools" ? <>
                <section className="bg-column" aria-labelledby="bg-reference">
                  <h3 className="bg-section-label" id="bg-reference">Indexes &amp; reference</h3>
                  {tools.slice(0, 3).map(renderItem)}
                </section>
                <section className="bg-column" aria-labelledby="bg-explore">
                  <h3 className="bg-section-label" id="bg-explore">Explore &amp; read</h3>
                  {tools.slice(3).map(renderItem)}
                </section>
              </> : <>
                <section className="bg-column" aria-labelledby="bg-rabbinic">
                  <h3 className="bg-section-label" id="bg-rabbinic">Rabbinic texts</h3>{renderItem(dictionaries[0])}
                </section>
                <section className="bg-column" aria-labelledby="bg-biblical">
                  <h3 className="bg-section-label" id="bg-biblical">Biblical texts</h3>{renderItem(dictionaries[1])}
                </section>
              </>}
            </div>
          </div>}
        </div>
      </header>
      <main className="bg-context">
        <h1>Study Classical Jewish Texts</h1>
        <p>The Talmud, Tanakh, Mishnah, and more —<br />with bilingual Hebrew-English text</p>
        <div className="bg-context-rule" />
      </main>
      {notice && <div className="bg-status" role="status">{notice}</div>}
    </div>
  );
}

export default Grouped;
