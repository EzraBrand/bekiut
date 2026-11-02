import { Link } from "wouter";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

/** "Dictionaries" nav item with Jastrow and BDB beneath it. */
export function DictionariesNav() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
      <button
        type="button"
        className="font-medium text-foreground hover:text-primary whitespace-nowrap"
        data-testid="nav-button-dictionaries"
      >
        Dictionaries <span aria-hidden="true" className="text-xs">▾</span>
      </button>
      </DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={12} sideOffset={8}
          className="w-64 max-w-[calc(100vw-24px)] bg-card text-left">
          <DropdownMenuItem asChild>
            <Link href="/jastrow" className="block px-3 py-2 hover:bg-secondary" data-testid="nav-link-jastrow">
              <span className="text-foreground">Jastrow</span>
              <span className="block text-xs text-muted-foreground">Rabbinic Hebrew and Aramaic</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/bdb" className="block px-3 py-2 hover:bg-secondary" data-testid="nav-link-bdb">
              <span className="text-foreground">BDB</span>
              <span className="block text-xs text-muted-foreground">Biblical Hebrew</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
