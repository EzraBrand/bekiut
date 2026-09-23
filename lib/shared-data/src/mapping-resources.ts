export interface MappingResourceDataset {
  "@context": "https://schema.org";
  "@type": "Dataset";
  "@id": string;
  name: string;
  description: string;
  url: string;
  license: string;
  creator: {
    "@type": "Organization";
    name: "Bekiut";
    url: string;
  };
  isAccessibleForFree: true;
  inLanguage: string;
  keywords: string[];
}

type MappingResourceDefinition = Pick<
  MappingResourceDataset,
  "name" | "description" | "inLanguage" | "keywords"
>;

const MAPPING_RESOURCES: Record<string, MappingResourceDefinition> = {
  "/bdb/abbreviations": {
    name: "BDB Abbreviations Expansion Table",
    description:
      "Bekiut's curated mappings for expanding scholarly abbreviations in the Brown-Driver-Briggs Hebrew lexicon. The MIT license applies only to Bekiut's curated expansion mappings, not to source lexicon content.",
    inLanguage: "en",
    keywords: [
      "BDB abbreviations",
      "Brown-Driver-Briggs abbreviations",
      "Biblical Hebrew lexicon",
      "Hebrew Bible study",
    ],
  },
  "/jastrow/abbreviations": {
    name: "Jastrow Dictionary Abbreviations Expansion Table",
    description:
      "Bekiut's curated mappings for expanding source, grammatical, bibliographic, and scholarly abbreviations in the Jastrow Dictionary. The MIT license applies only to Bekiut's curated expansion mappings, not to source lexicon content.",
    inLanguage: "en",
    keywords: [
      "Jastrow abbreviations",
      "Talmud dictionary abbreviations",
      "Rabbinic Hebrew",
      "Aramaic dictionary",
    ],
  },
  "/talmud/term-replacements": {
    name: "Talmud English Term Replacement Mappings",
    description:
      "Bekiut's curated mappings of older English terms to clearer terms used in its Talmud reader. The MIT license applies only to Bekiut's curated replacement mappings, not to any source translation or Talmud text.",
    inLanguage: "en",
    keywords: [
      "Talmud terminology",
      "English term replacements",
      "archaic English terms",
      "Jewish text study",
    ],
  },
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getMappingResourceStructuredData(
  pathname: string,
  baseUrl: string,
): MappingResourceDataset | null {
  const definition = MAPPING_RESOURCES[pathname];
  if (!definition) return null;

  const origin = trimTrailingSlash(baseUrl);
  const url = `${origin}${pathname}`;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${url}#dataset`,
    ...definition,
    url,
    license: `${origin}/mapping-license.txt`,
    creator: {
      "@type": "Organization",
      name: "Bekiut",
      url: origin,
    },
    isAccessibleForFree: true,
  };
}