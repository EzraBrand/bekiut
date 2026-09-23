import { Link } from "wouter";

const RESOURCES = [
  { href: "/bdb/abbreviations", label: "BDB abbreviations" },
  { href: "/jastrow/abbreviations", label: "Jastrow abbreviations" },
  { href: "/talmud/term-replacements", label: "Talmud term replacements" },
];

interface MappingResourceLinksProps {
  currentPath: string;
}

export function MappingResourceLinks({ currentPath }: MappingResourceLinksProps) {
  return (
    <aside
      className="mb-6 rounded border border-border bg-muted/30 p-4 text-sm"
      aria-label="Related mapping resources"
      data-testid="mapping-resource-links"
    >
      <p className="font-medium text-foreground mb-2">Related mapping tables</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {RESOURCES.map((resource) =>
          resource.href === currentPath ? (
            <span
              key={resource.href}
              className="text-muted-foreground"
              aria-current="page"
            >
              {resource.label}
            </span>
          ) : (
            <Link
              key={resource.href}
              href={resource.href}
              className="text-primary hover:underline"
              data-testid={`link-related-${resource.href.split("/").filter(Boolean).join("-")}`}
            >
              {resource.label}
            </Link>
          ),
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Bekiut&apos;s curated mapping tables and associated project-owned processing
        code are available under the{" "}
        <a
          href="/mapping-license.txt"
          className="text-primary hover:underline"
          data-testid="link-mapping-license"
        >
          MIT License
        </a>
        . This license does not cover third-party dictionary, source-text, or
        translation material.
      </p>
    </aside>
  );
}