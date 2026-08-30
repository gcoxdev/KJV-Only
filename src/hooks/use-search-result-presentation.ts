import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { clampContextVerseCount } from "@/lib/context-verses";
import {
  compareSearchMatchesCanonically,
  formatSearchResultsText,
  searchMatchKey,
  type SearchResultContext,
} from "@/lib/search-features";
import type { VerseSearchIndexEntry } from "@/lib/search";
import type { SearchMatch, SearchResultSort } from "@/types/reader";

type UseSearchResultPresentationOptions = {
  results: SearchMatch[];
  resultSort: SearchResultSort;
  showResultContext: boolean;
  contextVerseCount: number;
  verseIndex: VerseSearchIndexEntry[];
  searchSummary: string;
};

/** Derives presentation-only Search ordering, context, and text output. */
export function useSearchResultPresentation({
  results,
  resultSort,
  showResultContext,
  contextVerseCount,
  verseIndex,
  searchSummary,
}: UseSearchResultPresentationOptions) {
  const orderedResults = useMemo(
    () =>
      resultSort === "canonical"
        ? [...results].sort(compareSearchMatchesCanonically)
        : results,
    [resultSort, results],
  );

  const contextByMatchKey = useMemo(() => {
    const contexts = new Map<string, SearchResultContext>();
    if (!showResultContext || results.length === 0) {
      return contexts;
    }
    const perSideCount = clampContextVerseCount(contextVerseCount);
    const indexByKey = new Map<string, number>();
    verseIndex.forEach((entry, index) => {
      indexByKey.set(searchMatchKey(entry), index);
    });
    const toMatch = (entry: VerseSearchIndexEntry): SearchMatch => ({
      bookIndex: entry.bookIndex,
      chapterIndex: entry.chapterIndex,
      verseNumber: entry.verseNumber,
      bookName: entry.bookName,
      text: entry.text,
    });
    for (const match of results) {
      const index = indexByKey.get(searchMatchKey(match));
      if (index === undefined) {
        continue;
      }
      const before = verseIndex
        .slice(Math.max(0, index - perSideCount), index)
        .filter(
          (entry) =>
            entry.bookIndex === match.bookIndex &&
            entry.chapterIndex === match.chapterIndex,
        )
        .map(toMatch);
      const after = verseIndex
        .slice(index + 1, index + perSideCount + 1)
        .filter(
          (entry) =>
            entry.bookIndex === match.bookIndex &&
            entry.chapterIndex === match.chapterIndex,
        )
        .map(toMatch);
      if (before.length > 0 || after.length > 0) {
        contexts.set(searchMatchKey(match), { before, after });
      }
    }
    return contexts;
  }, [contextVerseCount, results, showResultContext, verseIndex]);

  const getExportText = useCallback(
    () =>
      formatSearchResultsText({
        summary: searchSummary,
        results: orderedResults,
        contextByMatchKey: showResultContext ? contextByMatchKey : undefined,
      }),
    [contextByMatchKey, orderedResults, searchSummary, showResultContext],
  );

  const copyResults = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(getExportText());
      toast.success("Search results copied.");
    } catch {
      toast.error("Could not copy the search results.");
    }
  }, [getExportText]);

  const exportResults = useCallback(() => {
    try {
      const url = URL.createObjectURL(
        new Blob([getExportText()], { type: "text/plain;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "kjv-search-results.txt";
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("Search results exported.");
    } catch {
      toast.error("Could not export the search results.");
    }
  }, [getExportText]);

  return {
    orderedResults,
    contextByMatchKey,
    copyResults,
    exportResults,
  };
}
