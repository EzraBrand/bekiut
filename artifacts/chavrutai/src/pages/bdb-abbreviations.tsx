import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/use-seo";
import { getStaticSEO } from "@workspace/shared-data/seo-data";
import { PageShell, PageHeader } from "@/components/layout";
import { MappingResourceLinks } from "@/components/mapping-resource-links";
import {
  filterAndSortBdbRows,
  getBdbTableRows,
  type BdbSortKey,
  type BdbTableRow,
} from "@/lib/bdb-table";
import { getMappingResourceStructuredData } from "@workspace/shared-data/mapping-resources";
import { useScrollingTableHeader } from "@/hooks/use-scrolling-table-header";

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
  const [sortKey, setSortKey] = useState<BdbSortKey>("abbr");
  const [sortAsc, setSortAsc] = useState(true);
  const [category, setCategory] = useState<BdbTableRow["category"] | "all">("all");

  const rows = useMemo(getBdbTableRows, []);
  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.category))].sort((a, b) => a.localeCompare(b)),
    [rows],
  );
  const filtered = useMemo(
    () => filterAndSortBdbRows(rows, query, sortKey, sortAsc, category),
    [rows, query, sortKey, sortAsc, category],
  );
  const { stickyHeaderRef, headerScrollRef, bodyScrollRef } = useScrollingTableHeader();

  const toggleSort = (key: BdbSortKey) => {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const arrow = (key: BdbSortKey) =>
    sortKey === key ? (sortAsc ? " ▲" : " ▼") : "";

  return (
    <PageShell testId="bdb-abbreviations-page" mainClassName="min-w-0">
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
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <Input
              type="search"
              aria-label="Filter abbreviations, expansions, categories, or reference titles"
              placeholder="Filter abbreviations, categories, references…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-testid="input-filter"
              className="max-w-md rounded"
            />
            <div className="flex items-center gap-2">
              <label htmlFor="bdb-category" className="text-sm text-muted-foreground">
                Category
              </label>
              <select
                id="bdb-category"
                value={category}
                onChange={(event) => setCategory(event.target.value as BdbTableRow["category"] | "all")}
                className="border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid="select-category"
              >
                <option value="all">All categories</option>
                {categories.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filtered.length.toLocaleString()} of{" "}
            {rows.length.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Categories describe the expanded meaning, not the abbreviation’s spelling. Uncertain
            categories are Unclassified; an em dash means no verified reference
            is listed. On small screens, scroll the table horizontally.
          </p>
        </div>

        <div className="mb-12 min-w-0 max-w-full">
          <div
            ref={stickyHeaderRef}
            className="sticky z-20 bg-background border-t border-border shadow-[0_1px_0_hsl(var(--border))]"
          >
            <div
              ref={headerScrollRef}
              className="max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              tabIndex={0}
              role="region"
              aria-label="BDB abbreviations column headings, horizontally scrollable"
            >
              <table className="w-full min-w-[760px] table-fixed text-sm">
                <colgroup>
                  <col className="w-9 sm:w-12" />
                  <col className="w-[21%]" />
                  <col />
                  <col className="w-[15%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead className="bg-background text-left">
                  <tr>
                    <th scope="col" className="px-1 py-2 text-center font-medium text-muted-foreground bg-muted border-r-2 border-muted-foreground/60">
                      <span aria-label="Row number">#</span>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium" aria-sort={sortKey === "abbr" ? (sortAsc ? "ascending" : "descending") : "none"}>
                      <button
                        type="button"
                        onClick={() => toggleSort("abbr")}
                        className="hover:text-foreground"
                        data-testid="sort-abbr"
                      >
                        Abbreviation{arrow("abbr")}
                      </button>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium" aria-sort={sortKey === "expansion" ? (sortAsc ? "ascending" : "descending") : "none"}>
                      <button
                        type="button"
                        onClick={() => toggleSort("expansion")}
                        className="hover:text-foreground"
                        data-testid="sort-expansion"
                      >
                        Expansion{arrow("expansion")}
                      </button>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium" aria-sort={sortKey === "category" ? (sortAsc ? "ascending" : "descending") : "none"}>
                      <button type="button" onClick={() => toggleSort("category")} className="hover:text-foreground" data-testid="sort-category">
                        Category{arrow("category")}
                      </button>
                    </th>
                    <th scope="col" className="px-2 py-2 font-medium">External link</th>
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          <div
            ref={bodyScrollRef}
            className="max-w-full overflow-x-scroll overscroll-x-contain focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            tabIndex={0}
            role="region"
            aria-label="BDB abbreviations table, horizontally scrollable"
          >
            <table className="w-full min-w-[760px] table-fixed text-sm" data-testid="abbreviations-table">
              <colgroup>
                <col className="w-9 sm:w-12" />
                <col className="w-[21%]" />
                <col />
                <col className="w-[15%]" />
                <col className="w-[25%]" />
              </colgroup>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Row number</th>
                  <th scope="col">Abbreviation</th>
                  <th scope="col">Expansion</th>
                  <th scope="col">Category</th>
                  <th scope="col">External link</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr
                    key={row.abbr}
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
                    <td className="px-2 py-1.5 align-top [overflow-wrap:anywhere]">{row.category}</td>
                    <td className="px-2 py-1.5 align-top [overflow-wrap:anywhere]">
                      {row.references.length ? (
                        <ul className="space-y-2">
                          {row.references.slice(0, 1).map((reference) => (
                            <li key={reference.url}>
                              <a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-primary dark:text-[#5b9fc5] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
                                {reference.title}
                              </a>
                              <span className="block text-xs text-muted-foreground">{reference.source}</span>
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </PageShell>
  );
}
