import { describe, expect, it } from "vitest"

import { createDefaultSearchPageState } from "@/hooks/use-reader-search-pages"
import type { Book } from "@/types/bible"

describe("createDefaultSearchPageState", () => {
  it("starts with the complete currently loaded book scope", () => {
    const books: Book[] = [
      { name: "Genesis", chapters: [] },
      { name: "Exodus", chapters: [] },
    ]

    expect(createDefaultSearchPageState(books)).toMatchObject({
      searchMode: "smart",
      selectedBookIndexes: [0, 1],
      resultSort: "relevance",
      showResultContext: false,
      resultFacets: null,
      results: [],
      error: null,
    })
  })
})
