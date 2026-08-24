import { describe, expect, it } from "vitest"

import { runRegexSearch } from "@/lib/regex-search"
import { createSearchableVerseEntry } from "@/lib/search"

const entries = [
  {
    bookIndex: 0,
    chapterIndex: 0,
    verseNumber: 1,
    bookName: "Genesis",
    ...createSearchableVerseEntry("In the beginning God created"),
  },
  {
    bookIndex: 1,
    chapterIndex: 0,
    verseNumber: 1,
    bookName: "Exodus",
    ...createSearchableVerseEntry("Now these are the names"),
  },
]

describe("regex search worker domain", () => {
  it("preserves selection, case, result shape, and ordering", () => {
    const result = runRegexSearch({
      entries,
      selectedBookIndexes: [0],
      pattern: "beginning|names",
      caseSensitive: false,
    })

    expect(result.error).toBeNull()
    expect(result.matches).toEqual([
      {
        bookIndex: 0,
        chapterIndex: 0,
        verseNumber: 1,
        bookName: "Genesis",
        text: "In the beginning God created",
      },
    ])
  })

  it("rejects invalid and excessively long patterns", () => {
    expect(
      runRegexSearch({
        entries,
        selectedBookIndexes: [0, 1],
        pattern: "(",
        caseSensitive: false,
      }).error,
    ).toBeTruthy()
    expect(
      runRegexSearch({
        entries,
        selectedBookIndexes: [0, 1],
        pattern: "a".repeat(513),
        caseSensitive: false,
      }).error,
    ).toContain("512")
  })
})
