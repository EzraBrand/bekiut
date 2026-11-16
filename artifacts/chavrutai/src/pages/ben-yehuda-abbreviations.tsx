import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageShell, PageHeader } from "@/components/layout";
import { useSEO } from "@/hooks/use-seo";
import { getStaticSEO } from "@workspace/shared-data/seo-data";
import { BEN_YEHUDA_ABBREVIATIONS } from "@/lib/ben-yehuda-abbreviations";
import { MappingResourceLinks } from "@/components/mapping-resource-links";

const contexts = { prose: "Explanatory prose", citation: "Citations only", grammar: "Opening grammar only" };
const normalize = (value: string) => value.replace(/[׳’]/g, "'").replace(/״/g, '"').toLowerCase();
type SortKey = "source" | "expansion";

export default function BenYehudaAbbreviations() {
  useSEO(getStaticSEO("/ben-yehuda/abbreviations", window.location.origin)!);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("source");
  const [ascending, setAscending] = useState(true);
  const rows = useMemo(() => {
    const q = normalize(query.trim());
    return BEN_YEHUDA_ABBREVIATIONS.filter(row =>
      [row.source, row.expansion, contexts[row.context]].some(value => normalize(value).includes(q)))
      .sort((a, b) => a[sortKey].localeCompare(b[sortKey], "he") * (ascending ? 1 : -1));
  }, [query, sortKey, ascending]);
  const sort = (key: SortKey) => {
    if (key === sortKey) setAscending(value => !value);
    else { setSortKey(key); setAscending(true); }
  };
  return (
    <PageShell testId="ben-yehuda-abbreviations-page">
      <PageHeader title="Ben-Yehuda Abbreviations" breadcrumbs={[
        { label: "Ben-Yehuda Dictionary", href: "/ben-yehuda" }, { label: "Abbreviations" },
      ]}>
        <p className="text-sm text-muted-foreground mb-3">
          The {BEN_YEHUDA_ABBREVIATIONS.length} reviewed mappings used by the Bekiut Ben-Yehuda reader.
          Hover, focus, or tap an abbreviation in an entry to see its meaning, or enable inline expansion.
          Citation names and grammatical labels expand only in their respective contexts.
          Ambiguous forms and divine-name spellings are left unchanged.
        </p>
        <p className="text-sm text-muted-foreground">
          See also Sefaria’s{" "}
          <a href="https://www.sefaria.org/Ben_Yehuda_Dictionary,_Prolegomena,_List_of_Books_Used"
            target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            List of Books Used
          </a>{" "}— a bibliography, rather than an abbreviation key.
        </p>
      </PageHeader>
      <MappingResourceLinks currentPath="/ben-yehuda/abbreviations" />
      <div className="border-t border-border pt-6 mb-4">
        <Input type="search" aria-label="Filter abbreviations or expansions"
          placeholder="Filter abbreviations or expansions…" value={query}
          onChange={event => setQuery(event.target.value)} className="max-w-md rounded" data-testid="input-filter" />
        <p className="text-xs text-muted-foreground mt-2" aria-live="polite">
          Showing {rows.length} of {BEN_YEHUDA_ABBREVIATIONS.length}
        </p>
      </div>
      <div className="overflow-x-auto border-t border-border mb-12">
        <table className="w-full table-fixed text-sm" data-testid="abbreviations-table">
          <colgroup><col className="w-[110px] sm:w-[21%]" /><col /></colgroup>
          <thead className="text-left text-muted-foreground">
            <tr>{(["source", "expansion"] as const).map(key => (
              <th key={key} scope="col" className="px-2 sm:px-4 py-2 font-medium"
                aria-sort={sortKey === key ? ascending ? "ascending" : "descending" : "none"}>
                <button type="button" onClick={() => sort(key)} className="hover:text-foreground"
                  data-testid={`sort-${key}`}>
                  {key === "source" ? "Abbreviation" : "Expansion"}{sortKey === key ? ascending ? " ▲" : " ▼" : ""}
                </button>
              </th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.source} className="border-t border-border hover:bg-secondary">
                <td className="px-2 sm:px-4 py-2 align-top [overflow-wrap:anywhere]">
                  <span dir="rtl" lang="he" className="font-hebrew">{row.source}</span>
                </td>
                <td className="px-2 sm:px-4 py-2 align-top [overflow-wrap:anywhere]">
                  <span dir="rtl" lang="he" className="font-hebrew">{row.expansion}</span>
                  <span className="block mt-1 text-xs text-muted-foreground">{contexts[row.context]}</span>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={2} className="px-4 py-6 text-center text-muted-foreground">No matches.</td></tr>}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
