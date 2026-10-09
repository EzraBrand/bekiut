import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { bdbExpandedTerms } from "@/shared/data/lexicon-mappings/bdb-expanded-terms";

const selector = ".dictionary-content [data-bdb-expansion]";
type Active = { trigger: HTMLElement; pinned: boolean; source: string; expansion: string };

/** One delegated panel for HTML-based senses; links retain their native action. */
export function BdbAbbreviationPanel({ revision }: { revision: unknown }) {
  return <DictionaryAbbreviationPanel revision={revision} categories={bdbExpandedTerms} />;
}

export function DictionaryAbbreviationPanel({ revision, categories = {} }: {
  revision: unknown;
  categories?: Record<string, { category: string }>;
}) {
  const [active, setActive] = useState<Active | null>(null);
  const current = useRef(active);
  current.current = active;
  const panel = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const cancel = () => clearTimeout(timer);
    const close = (restore = false) => {
      cancel();
      const trigger = current.current?.trigger;
      if (restore && trigger?.isConnected) trigger.focus({ preventScroll: true });
      current.current = null;
      setActive(null);
    };
    const find = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return (target.closest(selector) ?? target.closest("a")?.querySelector(selector)) as HTMLElement | null;
    };
    const open = (trigger: HTMLElement, pinned: boolean) => {
      cancel();
      if (!pinned && current.current?.pinned) return;
      const next = { trigger, pinned, source: decodeURIComponent(trigger.dataset.bdbSource!),
        expansion: decodeURIComponent(trigger.dataset.bdbExpansion!) };
      current.current = next;
      setActive(next);
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (panel.current?.contains(e.target as Node)) { cancel(); return; }
      const trigger = find(e.target);
      if (trigger) open(trigger, false);
    };
    const leave = () => {
      cancel();
      timer = setTimeout(() => {
        const focused = document.activeElement;
        if (!current.current?.pinned && focused !== current.current?.trigger &&
            !panel.current?.contains(focused)) close();
      }, 180);
    };
    const focus = (e: FocusEvent) => {
      const trigger = find(e.target);
      if (trigger) open(trigger, false);
      else if (!panel.current?.contains(e.target as Node)) close();
    };
    const click = (e: MouseEvent) => {
      const trigger = find(e.target);
      if (!trigger || trigger.closest("a")) return;
      if (current.current?.trigger === trigger && current.current.pinned) close(true);
      else open(trigger, true);
    };
    const outside = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !find(e.target)) close();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && current.current) {
        e.preventDefault();
        const restore = !!panel.current?.contains(document.activeElement);
        close(restore);
      }
    };
    const scroll = (e: Event) => {
      if (!panel.current?.contains(e.target as Node)) close(!!panel.current?.contains(document.activeElement));
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", leave);
    document.addEventListener("focusin", focus);
    document.addEventListener("focusout", leave);
    document.addEventListener("click", click);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", scroll);
    return () => {
      cancel();
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", leave);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("focusout", leave);
      document.removeEventListener("click", click);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", scroll);
    };
  }, []);
  useEffect(() => { current.current = null; setActive(null); }, [revision]);
  useLayoutEffect(() => {
    if (!active || !panel.current) return;
    const anchor = active.trigger.closest("a") ?? active.trigger;
    anchor.setAttribute("aria-describedby", "bdb-abbreviation-explanation");
    if (active.trigger.tagName === "BUTTON") active.trigger.setAttribute("aria-expanded", String(active.pinned));
    const rect = active.trigger.getBoundingClientRect();
    const size = panel.current.getBoundingClientRect();
    setPosition({
      left: Math.max(8, Math.min(rect.left, window.innerWidth - size.width - 8)),
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - size.height - 8)),
    });
    if (active.pinned) panel.current.querySelector("button")?.focus({ preventScroll: true });
    return () => {
      anchor.removeAttribute("aria-describedby");
      active.trigger.removeAttribute("aria-expanded");
    };
  }, [active]);
  const dismiss = () => {
    const trigger = active?.trigger;
    // Restore first: the focus handler runs before closing, so it cannot reopen.
    trigger?.focus({ preventScroll: true });
    current.current = null;
    setActive(null);
  };
  return <>
    <style>{`
      .dictionary-content .bdb-abbreviation { font: inherit; color: inherit; background: none; border: 0; padding: 0; display: inline; text-align: inherit; cursor: help; text-decoration: underline dotted; text-underline-offset: .2em; }
      .dictionary-content .bdb-abbreviation:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; border-radius: 2px; }
    `}</style>
    {active && createPortal(
      <div ref={panel} id="bdb-abbreviation-explanation" role={active.pinned ? "dialog" : "tooltip"}
        aria-label={active.pinned ? "Abbreviation expansion" : undefined}
        className="fixed z-50 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md"
        style={{ ...position, width: "min(360px, calc(100vw - 16px))", maxHeight: "calc(100dvh - 16px)", overflowY: "auto", overflowWrap: "anywhere" }}>
        <div className="flex items-start justify-between gap-4">
          <strong dir="auto">{active.source}</strong>
          {active.pinned && <button type="button" onClick={dismiss} className="text-sm underline focus-visible:outline" aria-label="Close abbreviation expansion">Close</button>}
        </div>
        <p dir="auto" className="mt-2 text-base">{active.expansion}</p>
        {categories[active.expansion.trim()] && <p className="mt-2 text-xs text-muted-foreground">{categories[active.expansion.trim()].category}</p>}
      </div>, document.body,
    )}
  </>;
}
