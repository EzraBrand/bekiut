import { expect, it } from "vitest";
import data from "@/shared/data/lexicon-mappings/jastrow.json";
import { expandAbbreviations } from "./dictionary-format";

it.each([
  ["Trachten d. Jud.", "Trachten der Juden"],
  ["Cambr.", "Cambridge"],
  ["Carm.", "Carmoly"],
  ["Catal. of Rabb. Semin.", "Catalog of Rabbinical Seminary"],
  ["Chrest. Ar.", "Chrestomathie arabe"],
  ["Koh. in Ar.", "Kohut in Arukh"],
  ["Derenb.", "Derenbourg"],
  ["Diehrenf.", "Dyhernfurth"],
])("expands %s in inline and tooltip modes", (source, target) => {
  expect(expandAbbreviations(source, data.mappings)).toContain(`>${target}</span>`);
  expect(expandAbbreviations(source, data.mappings, { display: "original" }))
    .toContain(`data-bdb-expansion="${encodeURIComponent(target)}"`);
});
