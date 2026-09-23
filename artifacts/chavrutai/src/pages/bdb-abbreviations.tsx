import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/use-seo";
import { getStaticSEO } from "@workspace/shared-data/seo-data";
import { PageShell, PageHeader } from "@/components/layout";
import { MappingResourceLinks } from "@/components/mapping-resource-links";
import bdbMappings from "@shared/data/lexicon-mappings/bdb.json";
import { getMappingResourceStructuredData } from "@workspace/shared-data/mapping-resources";

type SortKey = "abbr" | "expansion";

interface Row {
  abbr: string;
  expansion: string;
}

export default function BdbAbbreviations() {
  const seo = getStaticSEO("/bdb/abbreviations", window.location.origin);
  useSEO({
    ...seo!,
    structuredData: getMappingResourceStructuredData(
      "/bdb/abbreviations",
      window.location.origin,
    ) ?? undefined,
  });

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("abbr");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo<Row[]>(() => {
    const m = (bdbMappings as { mappings: Record<string, string> }).mappings;
    return Object.entries(m)
      .filter(([k]) => !k.startsWith("//"))
      .map(([abbr, expansion]) => ({ abbr, expansion }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? rows.filter(
          (r) =>
            r.abbr.toLowerCase().includes(q) ||
            r.expansion.toLowerCase().includes(q),
        )
      : rows;
    const sorted = [...base].sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [rows, query, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  return (
    <PageShell testId="bdb-abbreviations-page">
        <PageHeader
          breadcrumbs={[
            { label: "BDB Dictionary", href: "/bdb" },
            { label: "Abbreviations" },
          ]}
          title="BDB Abbreviations"
        >
          <p className="text-sm text-muted-foreground mb-3">
            A searchable reference for readers of the Hebrew Bible and Old
            Testament, including students, clergy, translators, and scholars using
            Brown–Driver–Briggs. It lists all {rows.length.toLocaleString()}{" "}
            abbreviations expanded inline by the Bekiut BDB reader: scholar
            surnames, grammatical shorthand, Latin phrases, cognate languages,
            biblical book references, ancient versions, and BDB-specific symbols.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            For the original list of abbreviations as published in BDB itself, see{" "}
            <a
              href="https://www.sefaria.org.il/BDB%2C_Abbrevations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-[#5b9fc5] hover:underline"
              data-testid="link-sefaria-abbreviations"
            >
              BDB's own abbreviations list (digitized by Sefaria) →
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            For background and a citable description of an earlier version, read{" "}
            <a
              href="https://www.academia.edu/167336159/BDB_Decoded_A_Curated_Expansion_Table_for_Scholarly_Abbreviations_in_Brown_Driver_Briggs_BDB_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-[#5b9fc5] hover:underline"
              data-testid="link-bdb-decoded-academia"
            >
              “BDB Decoded” on Academia.edu →
            </a>
          </p>
        </PageHeader>

        <MappingResourceLinks currentPath="/bdb/abbreviations" />

        <div className="border-t border-border pt-6 mb-4">
          <Input
            type="search"
            placeholder="Filter abbreviations or expansions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="input-filter"
            className="max-w-md rounded"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length.toLocaleString()} of{" "}
            {rows.length.toLocaleString()}
          </p>
        </div>

        <div className="overflow-x-auto border-t border-border mb-12">
          <table className="w-full table-fixed text-sm" data-testid="abbreviations-table">
            <colgroup>
              <col className="w-9 sm:w-12" />
              <col className="w-[34%]" />
              <col />
            </colgroup>
            <thead className="text-left">
              <tr>
                <th scope="col" className="px-1 py-2 text-center font-medium text-muted-foreground bg-muted border-r-2 border-muted-foreground/60">
                  <span aria-label="Row number">#</span>
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("abbr")}
                    className="hover:text-foreground"
                    data-testid="sort-abbr"
                  >
                    Abbreviation{arrow("abbr")}
                  </button>
                </th>
                <th scope="col" className="px-2 py-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("expansion")}
                    className="hover:text-foreground"
                    data-testid="sort-expansion"
                  >
                    Expansion{arrow("expansion")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={`${row.abbr}-${i}`}
                  className="border-t border-border hover:bg-secondary"
                  data-testid={`row-${i}`}
                >
                  <td className="px-1 py-1.5 text-center text-xs tabular-nums text-muted-foreground align-top bg-muted border-r-2 border-muted-foreground/60">
                    {i + 1}
                  </td>
                  <td className="px-2 py-1.5 font-mono align-top whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {row.abbr}
                  </td>
                  <td className="px-2 py-1.5 align-top [overflow-wrap:anywhere]">{row.expansion}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No matches.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
    </PageShell>
  );
}
