import { useReadChapters } from "@/hooks/use-read-chapters"
import { useReaderCorpus } from "@/hooks/use-reader-corpus"
import { useReaderPreferences } from "@/hooks/use-reader-preferences"
import { useReaderSearchPages } from "@/hooks/use-reader-search-pages"
import { useVerseSearchIndex } from "@/hooks/use-verse-search-index"
import type { TabsOrientation } from "@/types/reader"

type UseReaderControllerOptions = {
  tabsOrientation: TabsOrientation
  setTabsOrientation: (orientation: TabsOrientation) => void
  searchEnabled: boolean
}

/**
 * Stable façade for reader-wide state that crosses feature boundaries.
 * New controller-owned slices should be composed here instead of adding more
 * persistence or lifecycle policy directly to KJVReader.
 */
export function useReaderController(options: UseReaderControllerOptions) {
  const corpus = useReaderCorpus()
  const verseSearch = useVerseSearchIndex(
    corpus.books,
    options.searchEnabled && corpus.isCorpusLoaded,
  )
  const searchPages = useReaderSearchPages(corpus.books)

  return {
    preferences: useReaderPreferences(options),
    readingProgress: useReadChapters(),
    corpus,
    searchPages,
    verseSearch: {
      ...verseSearch,
      isBuilding:
        options.searchEnabled &&
        (!corpus.isCorpusLoaded || verseSearch.isBuilding),
      isReady:
        options.searchEnabled && corpus.isCorpusLoaded && verseSearch.isReady,
      error: corpus.loadError ?? verseSearch.error,
    },
  }
}
