import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export interface NavItem { title: string; href: string; description?: string; }

/** Mouse hover is an enhancement; Radix retains touch/click and keyboard behavior. */
export function NavDropdown({ label, id, items }: { label: string; id: string; items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const hover = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
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
        <button type="button" className="font-medium text-foreground hover:text-primary whitespace-nowrap"
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
          {label} <span aria-hidden="true" className="text-xs">▾</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={12} sideOffset={8}
        className="w-72 max-w-[calc(100vw-24px)] bg-card text-left"
        onPointerEnter={cancelClose} onPointerLeave={closeLater}
        onKeyDown={() => { hover.current = false; cancelClose(); }}
        onCloseAutoFocus={event => { if (hover.current) event.preventDefault(); }}>
        {items.map(item => (
          <DropdownMenuItem asChild key={item.href}>
            <Link href={item.href} className="block px-3 py-2 hover:bg-secondary"
              data-testid={`nav-link-${item.href.slice(1)}`}>
              <span className="text-foreground">{item.title}</span>
              {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
