import { NavDropdown } from "./nav-dropdown";

export function ToolsNav() {
  return <NavDropdown label="Tools" id="tools" items={[
    { title: "Talmud Term Index", href: "/term-index", description: "Browse recurring Talmudic terms", group: "Indexes & reference" },
    { title: "Mishnah Map", href: "/mishnah-map", description: "Locate Mishnah passages in the Talmud", group: "Indexes & reference" },
    { title: "Biblical Index", href: "/biblical-index", description: "Find biblical verses cited in the Talmud", group: "Indexes & reference" },
    { title: "Sugya Viewer", href: "/sugya-viewer", description: "Study custom Talmud text ranges", group: "Explore & read" },
    { title: "Places — Biblical & Talmudic Map", href: "/places", description: "Explore the geography of the sources", group: "Explore & read" },
    { title: "Famous Pages", href: "/suggested-pages", description: "Discover well-known Talmud passages", group: "Explore & read" },
    { title: "J.N. Epstein's Introductions", href: "/scholarship", description: "Read introductions to Talmudic literature", group: "Explore & read" },
  ]} />;
}
