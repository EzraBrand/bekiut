export type BdbCategory =
  | "Grammar"
  | "Scholar"
  | "Language"
  | "Text / source"
  | "Work / journal"
  | "Place / person"
  | "Vocabulary"
  | "Reference notation"
  | "Unclassified";

export interface BdbReference {
  title: string;
  source: string;
  url: string;
}

export interface BdbExpandedTerm {
  category: BdbCategory;
  references: BdbReference[];
}