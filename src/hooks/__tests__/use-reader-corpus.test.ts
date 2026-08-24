import { describe, expect, it } from "vitest"

import {
  applyBootstrapReaderCorpus,
  applyFullReaderCorpus,
  applyReaderCorpusError,
  readerCorpusErrorMessage,
  type ReaderCorpusState,
} from "@/hooks/use-reader-corpus"
import type { Book } from "@/types/bible"

const bootstrap: Book[] = [
  {
    name: "Genesis",
    chapters: [{ chapter: 1, verses: [] }],
  },
]
const full: Book[] = [
  ...bootstrap,
  { name: "Exodus", chapters: [] },
]
const empty: ReaderCorpusState = {
  books: [],
  isCorpusLoaded: false,
  loadError: "old error",
}

describe("reader corpus state transitions", () => {
  it("uses the bootstrap only before the canonical corpus is ready", () => {
    expect(applyBootstrapReaderCorpus(empty, bootstrap)).toEqual({
      books: bootstrap,
      isCorpusLoaded: false,
      loadError: null,
    })

    const loaded = applyFullReaderCorpus(full)
    expect(applyBootstrapReaderCorpus(loaded, bootstrap)).toBe(loaded)
  })

  it("atomically replaces the bootstrap with the full corpus", () => {
    expect(applyFullReaderCorpus(full)).toEqual({
      books: full,
      isCorpusLoaded: true,
      loadError: null,
    })
  })

  it("retains usable data while surfacing a full-corpus failure", () => {
    expect(applyReaderCorpusError(empty, new Error("offline"))).toEqual({
      ...empty,
      loadError: "offline",
    })
    expect(readerCorpusErrorMessage("unknown")).toBe(
      "Failed to load generated reader data",
    )
  })
})
