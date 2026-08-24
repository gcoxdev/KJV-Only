import { useEffect, useState } from "react"

import { loadKjvBooks, loadKjvBootstrap } from "@/lib/reader-data"
import type { Book } from "@/types/bible"

export type ReaderCorpusState = {
  books: Book[]
  isCorpusLoaded: boolean
  loadError: string | null
}

const INITIAL_STATE: ReaderCorpusState = {
  books: [],
  isCorpusLoaded: false,
  loadError: null,
}

export function applyBootstrapReaderCorpus(
  current: ReaderCorpusState,
  books: Book[],
): ReaderCorpusState {
  return current.isCorpusLoaded
    ? current
    : { ...current, books, loadError: null }
}

export function applyFullReaderCorpus(books: Book[]): ReaderCorpusState {
  return { books, isCorpusLoaded: true, loadError: null }
}

export function readerCorpusErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Failed to load generated reader data"
}

export function applyReaderCorpusError(
  current: ReaderCorpusState,
  error: unknown,
): ReaderCorpusState {
  return { ...current, loadError: readerCorpusErrorMessage(error) }
}

/**
 * Owns the progressive Bible-data lifecycle. Genesis 1 may become readable
 * first, while the canonical full Book[] continues loading in the background.
 */
export function useReaderCorpus() {
  const [state, setState] = useState<ReaderCorpusState>(INITIAL_STATE)

  useEffect(() => {
    let cancelled = false

    void loadKjvBootstrap()
      .then((bootstrapBooks) => {
        if (cancelled) return
        setState((current) =>
          applyBootstrapReaderCorpus(current, bootstrapBooks),
        )
      })
      .catch(() => {
        // The bootstrap is an optimization. The full corpus remains canonical.
      })

    void loadKjvBooks()
      .then((books) => {
        if (cancelled) return
        setState(applyFullReaderCorpus(books))
      })
      .catch((error) => {
        if (cancelled) return
        setState((current) => applyReaderCorpusError(current, error))
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
