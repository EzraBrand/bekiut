import { NavDropdown } from "./nav-dropdown";

export function DictionariesNav() {
  return <NavDropdown label="Dictionaries" id="dictionaries" items={[
    { title: "Jastrow", href: "/jastrow", description: "Rabbinic Hebrew and Aramaic", group: "Rabbinic texts" },
    { title: "BDB", href: "/bdb", description: "Biblical Hebrew", group: "Biblical texts" },
  ]} />;
}
