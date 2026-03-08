import type { Book, VerseToken } from "@/types/bible";

export type ReaderPayload = {
  books?: Book[];
};

export type ConcordancePayload = Record<string, string[]>;
export type CrossRefsPayload = Record<string, string[]>;
export type HitchcocksPayload = Record<string, string>;
export type OldEnglishPayload = Record<string, string[]>;

export type GenealogyVerseByName = {
  name: string;
  verses: string[];
  numOccurrences?: number;
  numVerses?: number;
};

export type GenealogyRelation = {
  name: string;
  id: string;
  verse?: string;
};

export type GenealogyParentRef = {
  name: string;
  id: string;
};

export type GenealogyPerson = {
  id: string;
  names: string[];
  gender?: string;
  notes?: string;
  verses?: {
    byName?: GenealogyVerseByName[];
    totalOccurrences?: number;
    totalVerses?: number;
    first?: string;
  };
  father?: GenealogyParentRef;
  mother?: GenealogyParentRef;
  spouses?: GenealogyRelation[];
  siblings?: GenealogyRelation[];
  children?: GenealogyRelation[];
};

export type GenealogyPayload = GenealogyPerson[];

export type WebstersEntry = {
  pronunciation?: string;
  definitions: Array<{
    type: string;
    text: string;
  }>;
};

export type WebstersPayload = Record<string, WebstersEntry>;

export type StrongsEntry = {
  kjv_def?: string;
  strongs_def?: string;
  lemma?: string;
  translit?: string;
  derivation?: string;
  pron?: string;
  kjv_refs?: Record<string, string[]>;
};

export type StrongsPayload = Record<string, StrongsEntry>;

export type PanelDirection = "left" | "right" | "up" | "down";
export type SplitOrientation = "horizontal" | "vertical";
export type TabsOrientation = "horizontal" | "vertical";
export type IconVariant = "bw" | "color";

export type LeafNode = {
  id: string;
  type: "leaf";
  view: "reader" | "picker" | "search";
  bookIndex: number;
  chapterIndex: number;
  pickerTestament: "old" | "new" | null;
  pickerBookIndex: number | null;
};

export type SplitNode = {
  id: string;
  type: "split";
  orientation: SplitOrientation;
  ratio: number;
  first: PanelNode;
  second: PanelNode;
};

export type PanelNode = LeafNode | SplitNode;

export type ReaderTab = {
  id: string;
  title: string;
  root: PanelNode;
};

export type TokenPopupState = {
  token: VerseToken;
  x: number;
  y: number;
};
