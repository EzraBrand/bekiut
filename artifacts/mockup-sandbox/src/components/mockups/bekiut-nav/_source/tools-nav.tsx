import { NavDropdown } from "./nav-dropdown";

export function ToolsNav() {
  return <NavDropdown label="Tools" id="tools" items={[
    { title: "Talmud Term Index", href: "/term-index" },
    { title: "Mishnah Map", href: "/mishnah-map" },
    { title: "Biblical Index", href: "/biblical-index" },
    { title: "Sugya Viewer", href: "/sugya-viewer" },
    { title: "Places — Biblical & Talmudic Map", href: "/places" },
    { title: "Famous Pages", href: "/suggested-pages" },
    { title: "J.N. Epstein's Introductions", href: "/scholarship" },
  ]} />;
}
