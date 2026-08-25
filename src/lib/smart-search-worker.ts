import type { Book } from "@/types/bible";
import type { SearchMatch } from "@/types/reader";
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

export type VerseSearchWorkerRequest =
  | { type: "build-index"; books: Book[] }
  | ({ type: "smart-search"; requestId: number } & SmartVerseSearchRequest)
  | { type: "cancel-smart-search"; requestId: number };

export type VerseSearchWorkerResponse =
  | { type: "index-ready"; index: VerseSearchIndexEntry[] }
  | { type: "index-error"; message: string }
  | ({ type: "smart-search-update"; requestId: number } & SmartVerseSearchUpdate)
  | { type: "smart-search-error"; requestId: number; message: string };
