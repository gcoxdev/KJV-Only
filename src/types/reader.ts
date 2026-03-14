import type { Book, VerseToken } from "@/types/bible";

export type ReaderPayload = {
  books?: Book[];
};

export type ConcordancePayload = {
  verses: string[];
  words: Record<string, number[]>;
};
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

export type GenealogyCompactPayload = {
  v: string[];
  w: string[];
  p: Array<
    [
      string,
      number[],
      string?,
      [
        Array<[number, number[], number?, number?]>,
        number?,
        number?,
        number?,
      ]?,
      string?,
      string?,
      Array<[string, number?]>?,
      Array<[string, number?]>?,
      Array<[string, number?]>?,
    ]
  >;
};

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

export type StrongsCompactPayload = {
  v: string[];
  w: string[];
  s: string[];
  e: Record<
    string,
    [number?, number?, number?, number?, number?, number?, Array<[number, number[]]>?]
  >;
};

export type SearchMode =
  | "contains-any"
  | "contains-all"
  | "contains-phrase"
  | "regex";

export type SearchMatch = {
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  bookName: string;
  text: string;
};

export type SearchPageState = {
  searchMode: SearchMode;
  caseSensitive: boolean;
  chipInput: string;
  phraseInput: string;
  isControlsCollapsed: boolean;
  selectedWords: string[];
  expandedBookTree: string[];
  selectedBookIndexes: number[];
  results: SearchMatch[];
  error: string | null;
};

export type StaticPageId =
  | "saved"
  | "kjv-only"
  | "resources"
  | "churches"
  | "download"
  | "donate"
  | "credits"
  | "whats-new"
  | "about"
  | "contact"
  | "help";

export type StudyWorkspaceTab = "tools" | "notes" | "bookmarks";
export type StudyWorkspaceTool =
  | "cross-refs"
  | "concordance"
  | "websters"
  | "strongs"
  | "old-english"
  | "maps"
  | "genealogy"
  | "hitchcocks";

export type PanelDirection = "left" | "right" | "up" | "down";
export type SplitOrientation = "horizontal" | "vertical";
export type TabsOrientation = "horizontal" | "vertical";
export type IconVariant = "bw" | "color";

export type LeafNode = {
  id: string;
  type: "leaf";
  view: "reader" | "picker" | "search" | "notes" | "page";
  bookIndex: number;
  chapterIndex: number;
  pickerTestament: "old" | "new" | null;
  pickerBookIndex: number | null;
  pageId: StaticPageId | null;
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
