import { useCallback, useState } from "react"

import { filterRecordEntries, swapRecordEntries } from "@/lib/leaf-state"
import type { Book } from "@/types/bible"
import type { SearchPageState } from "@/types/reader"

export function createDefaultSearchPageState(books: Book[]): SearchPageState {
  return {
    searchMode: "smart",
    caseSensitive: false,
    chipInput: "",
    phraseInput: "",
    lastSearchMode: null,
    lastSearchCaseSensitive: false,
    lastSearchPhraseInput: "",
    lastSearchSelectedWords: [],
    isControlsCollapsed: false,
    selectedWords: [],
    expandedBookTree: ["entire", "old", "new"],
    selectedBookIndexes: books.map((_, index) => index),
    currentPage: 1,
    results: [],
    error: null,
  }
}

/** Owns per-panel search UI state and leaf lifecycle bookkeeping. */
export function useReaderSearchPages(books: Book[]) {
  const [stateByLeafId, setStateByLeafId] = useState<
    Record<string, SearchPageState>
  >({})

  const createDefaultState = useCallback(
    () => createDefaultSearchPageState(books),
    [books],
  )

  const changeState = useCallback(
    (leafId: string, patch: Partial<SearchPageState>) => {
      setStateByLeafId((current) => ({
        ...current,
        [leafId]: {
          ...(current[leafId] ?? createDefaultState()),
          ...patch,
        },
      }))
    },
    [createDefaultState],
  )

  const initializeState = useCallback(
    (leafId: string) => {
      setStateByLeafId((current) => ({
        ...current,
        [leafId]: createDefaultState(),
      }))
    },
    [createDefaultState],
  )

  const pruneState = useCallback((activeLeafIds: Set<string>) => {
    setStateByLeafId((current) =>
      filterRecordEntries(current, activeLeafIds),
    )
  }, [])

  const swapState = useCallback((firstLeafId: string, secondLeafId: string) => {
    setStateByLeafId((current) =>
      swapRecordEntries(current, firstLeafId, secondLeafId),
    )
  }, [])

  return {
    stateByLeafId,
    changeState,
    initializeState,
    pruneState,
    swapState,
  }
}
