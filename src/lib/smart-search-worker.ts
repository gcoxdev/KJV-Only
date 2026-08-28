import type { Book } from "@/types/bible";
import type { SearchFacets, SearchMatch } from "@/types/reader";
import type { VerseSearchIndexEntry } from "@/lib/verse-search-index";

export type SmartVerseSearchRequest = {
  query: string;
  caseSensitive: boolean;
  selectedBookIndexes: number[];
  resultLimit: number;
};

export type SmartVerseSearchUpdate = {
  matches: SearchMatch[];
  processed: number;
  total: number;
  isComplete: boolean;
};

export type SmartVerseSearchCallbacks = {
  onUpdate: (update: SmartVerseSearchUpdate) => void;
  onError: (message: string) => void;
};

export type RunSmartVerseSearch = (
  request: SmartVerseSearchRequest,
  callbacks: SmartVerseSearchCallbacks,
) => (() => void) | null;

export type SearchResultAnalysisCallbacks = {
  onResult: (facets: SearchFacets) => void;
  onError: (message: string) => void;
};

export type RunSearchResultAnalysis = (
  matches: SearchMatch[],
  callbacks: SearchResultAnalysisCallbacks,
) => (() => void) | null;

export type VerseSearchWorkerRequest =
  | { type: "build-index"; books: Book[] }
  | ({ type: "smart-search"; requestId: number } & SmartVerseSearchRequest)
  | { type: "analyze-search-results"; requestId: number; matches: SearchMatch[] }
  | { type: "cancel-smart-search"; requestId: number };

export type VerseSearchWorkerResponse =
  | { type: "index-ready"; index: VerseSearchIndexEntry[] }
  | { type: "index-error"; message: string }
  | ({ type: "smart-search-update"; requestId: number } & SmartVerseSearchUpdate)
  | { type: "search-result-analysis"; requestId: number; facets: SearchFacets }
  | { type: "search-result-analysis-error"; requestId: number; message: string }
  | { type: "smart-search-error"; requestId: number; message: string };
