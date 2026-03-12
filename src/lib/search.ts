import { normalizeConcordanceWord } from "@/lib/references";
import type { SearchMode } from "@/types/reader";

type SearchableVerseEntry = {
  text: string;
  textLower: string;
  searchWords: string[];
  searchWordsLower: string[];
};

export function extractSearchWords(text: string) {
  return text
    .split(/\s+/)
    .map((word) => normalizeConcordanceWord(word))
    .filter(Boolean);
}

export function createSearchableVerseEntry(text: string): SearchableVerseEntry {
  const searchWords = extractSearchWords(text);
  return {
    text,
    textLower: text.toLowerCase(),
    searchWords,
    searchWordsLower: searchWords.map((word) => word.toLowerCase()),
  };
}

export function matchSelectedWords(
  entry: Pick<SearchableVerseEntry, "searchWords" | "searchWordsLower">,
  selectedWords: string[],
  mode: Extract<SearchMode, "contains-any" | "contains-all">,
  caseSensitive: boolean,
) {
  const normalizedNeedles = selectedWords
    .map((word) => normalizeConcordanceWord(word.trim()))
    .filter(Boolean);

  if (normalizedNeedles.length === 0) {
    return false;
  }

  const haystack = new Set(
    caseSensitive ? entry.searchWords : entry.searchWordsLower,
  );
  const needles = caseSensitive
    ? normalizedNeedles
    : normalizedNeedles.map((word) => word.toLowerCase());

  return mode === "contains-any"
    ? needles.some((needle) => haystack.has(needle))
    : needles.every((needle) => haystack.has(needle));
}

export function buildRegexMatcher(pattern: string, caseSensitive: boolean) {
  const trimmed = pattern.trim();
  if (!trimmed) {
    return {
      regex: null,
      error: "Enter a regular expression.",
    };
  }

  try {
    return {
      regex: new RegExp(trimmed, caseSensitive ? "" : "i"),
      error: null,
    };
  } catch (error) {
    return {
      regex: null,
      error:
        error instanceof Error ? error.message : "Invalid regular expression.",
    };
  }
}
