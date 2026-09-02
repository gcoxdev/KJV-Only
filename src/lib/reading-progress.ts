import { chapterProgressKey } from "@/lib/reader-view"
import type { Book } from "@/types/bible"

export type ReadingContinuation = {
  bookIndex: number
  chapterIndex: number
  bookName: string
  chapterNumber: number
}

export function getReadingContinuation(
  books: Book[],
  readChapters: Set<string>,
): ReadingContinuation | null {
  const chapters = books.flatMap((book, bookIndex) =>
    book.chapters.map((chapter, chapterIndex) => ({
      bookIndex,
      chapterIndex,
      bookName: book.name,
      chapterNumber: chapter.chapter,
      key: chapterProgressKey(bookIndex, chapterIndex),
    })),
  )

  if (chapters.length === 0) {
    return null
  }

  const chapterIndexByKey = new Map(
    chapters.map((chapter, index) => [chapter.key, index]),
  )
  const markedChapterKeys = Array.from(readChapters)
  let lastMarkedIndex = -1

  for (let index = markedChapterKeys.length - 1; index >= 0; index -= 1) {
    const chapterIndex = chapterIndexByKey.get(markedChapterKeys[index])
    if (chapterIndex !== undefined) {
      lastMarkedIndex = chapterIndex
      break
    }
  }

  for (let offset = 1; offset <= chapters.length; offset += 1) {
    const chapter = chapters[(lastMarkedIndex + offset) % chapters.length]
    if (!readChapters.has(chapter.key)) {
      return {
        bookIndex: chapter.bookIndex,
        chapterIndex: chapter.chapterIndex,
        bookName: chapter.bookName,
        chapterNumber: chapter.chapterNumber,
      }
    }
  }

  return null
}
