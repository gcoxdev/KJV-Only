import { describe, expect, it } from "vitest"

import { getReadingContinuation } from "@/lib/reading-progress"
import type { Book } from "@/types/bible"

function book(name: string, chapterCount: number): Book {
  return {
    name,
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      chapter: index + 1,
      verses: [],
    })),
  }
}

const books = [book("Genesis", 3), book("Exodus", 2)]

describe("getReadingContinuation", () => {
  it("starts at the first chapter when no progress has been marked", () => {
    expect(getReadingContinuation(books, new Set())).toEqual({
      bookIndex: 0,
      chapterIndex: 0,
      bookName: "Genesis",
      chapterNumber: 1,
    })
  })

  it("continues with the next unread chapter after the most recently marked chapter", () => {
    expect(getReadingContinuation(books, new Set(["0:0", "0:1"]))).toEqual({
      bookIndex: 0,
      chapterIndex: 2,
      bookName: "Genesis",
      chapterNumber: 3,
    })
  })

  it("uses mark order and skips chapters that are already read", () => {
    expect(getReadingContinuation(books, new Set(["0:1", "0:0"]))).toEqual({
      bookIndex: 0,
      chapterIndex: 2,
      bookName: "Genesis",
      chapterNumber: 3,
    })
  })

  it("continues into the next book", () => {
    expect(
      getReadingContinuation(books, new Set(["0:0", "0:1", "0:2"])),
    ).toEqual({
      bookIndex: 1,
      chapterIndex: 0,
      bookName: "Exodus",
      chapterNumber: 1,
    })
  })

  it("wraps to an earlier unread gap after the final chapter", () => {
    expect(getReadingContinuation(books, new Set(["0:1", "1:1"]))).toEqual({
      bookIndex: 0,
      chapterIndex: 0,
      bookName: "Genesis",
      chapterNumber: 1,
    })
  })

  it("returns no continuation when every chapter is read", () => {
    expect(
      getReadingContinuation(
        books,
        new Set(["0:0", "0:1", "0:2", "1:0", "1:1"]),
      ),
    ).toBeNull()
  })

  it("ignores invalid persisted keys when finding the last marked chapter", () => {
    expect(getReadingContinuation(books, new Set(["0:0", "invalid"]))).toEqual({
      bookIndex: 0,
      chapterIndex: 1,
      bookName: "Genesis",
      chapterNumber: 2,
    })
  })
})
