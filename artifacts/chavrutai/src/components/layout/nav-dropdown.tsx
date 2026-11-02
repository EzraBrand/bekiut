import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import "./nav-dropdown.css";

export interface NavItem { title: string; href: string; description?: string; group: string; }

/** Mouse hover is an enhancement; Radix retains touch/click and keyboard behavior. */
export function NavDropdown({ label, id, items }: { label: string; id: string; items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const hover = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const groups = [...new Set(items.map(item => item.group))];
  const cancelClose = () => clearTimeout(timer.current);
  useEffect(() => () => clearTimeout(timer.current), []);
  const closeLater = () => {
    cancelClose();
    if (hover.current) timer.current = setTimeout(() => setOpen(false), 200);
  };
  return (
    <DropdownMenu modal={false} open={open} onOpenChange={value => {
      cancelClose();
      setOpen(value);
    }}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="grouped-nav-trigger"
          data-testid={`nav-button-${id}`}
          onPointerEnter={event => {
            cancelClose();
            if (event.pointerType === "mouse" && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !open) {
              hover.current = true;
              setOpen(true);
            }
          }}
          onPointerLeave={closeLater}
          onPointerDown={event => {
            // Clicking an already-hovered trigger pins it open rather than toggling it shut.
            if (hover.current && open && event.button === 0 && !event.ctrlKey) event.preventDefault();
            hover.current = false;
            cancelClose();
          }}
          onKeyDown={() => { hover.current = false; cancelClose(); }}>
          {label}<svg className="grouped-nav-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.3" /></svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={12} sideOffset={11}
        className={`grouped-nav-panel ${id === "dictionaries" ? "grouped-nav-dictionaries" : ""}`}
        aria-label={label}
        onPointerEnter={cancelClose} onPointerLeave={closeLater}
        onKeyDown={() => { hover.current = false; cancelClose(); }}
        onCloseAutoFocus={event => { if (hover.current) event.preventDefault(); }}>
        <div className="grouped-nav-heading"><h2>{label}</h2></div>
        <div className="grouped-nav-columns">
          {groups.map((group, index) => (
            <DropdownMenuGroup className="grouped-nav-column" key={group} aria-labelledby={`${id}-group-${index}`}>
              <DropdownMenuLabel className="grouped-nav-section" id={`${id}-group-${index}`}>{group}</DropdownMenuLabel>
              {items.filter(item => item.group === group).map(item => (
                <DropdownMenuItem asChild key={item.href}>
                  <Link href={item.href} className="grouped-nav-item"
                    data-testid={`nav-link-${item.href.slice(1)}`}>
                    <span className="grouped-nav-copy">
                      <span className="grouped-nav-title">{item.title}</span>
                      {item.description && <span className="grouped-nav-description">{item.description}</span>}
                    </span>
                    <span className="grouped-nav-arrow" aria-hidden="true">›</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
