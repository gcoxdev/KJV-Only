import { useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { type Book, type Chapter, type VerseToken } from "@/types/bible"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Reference = {
  bookIndex: number
  chapterIndex: number
}

type ReaderPayload = {
  books?: Book[]
}

function renderToken(token: VerseToken, tokenIndex: number) {
  return (
    <span key={`${token.text}-${tokenIndex}`} className="mr-1.5 inline-flex items-start gap-0.5">
      <span>{token.text}</span>
      {token.strong ? (
        <sup className="rounded-sm bg-muted px-1 py-0.5 text-[0.62rem] leading-none text-muted-foreground">
          {token.strong}
        </sup>
      ) : null}
    </span>
  )
}

function parseBooks(input: unknown): Book[] | null {
  if (Array.isArray(input)) {
    return input as Book[]
  }

  if (typeof input === "object" && input !== null) {
    const payload = input as ReaderPayload
    if (Array.isArray(payload.books)) {
      return payload.books
    }
  }

  return null
}

export function KJVReader() {
  const [books, setBooks] = useState<Book[]>([])
  const [bookIndex, setBookIndex] = useState(0)
  const [chapterIndex, setChapterIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadGeneratedData() {
      try {
        const response = await fetch("/data/kjv.json")
        if (!response.ok) {
          if (!cancelled) {
            setLoadError("Could not load /data/kjv.json")
            setIsLoaded(true)
          }
          return
        }

        const payload = (await response.json()) as unknown
        const parsedBooks = parseBooks(payload)
        if (!parsedBooks || parsedBooks.length === 0 || cancelled) {
          if (!cancelled) {
            setLoadError("Invalid reader data format in /data/kjv.json")
            setIsLoaded(true)
          }
          return
        }

        setBooks(parsedBooks)
        setBookIndex(0)
        setChapterIndex(0)
        setLoadError(null)
        setIsLoaded(true)
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load generated reader data")
          setIsLoaded(true)
        }
      }
    }

    void loadGeneratedData()

    return () => {
      cancelled = true
    }
  }, [])

  const chapterRefs: Reference[] = useMemo(
    () =>
      books.flatMap((book, bIndex) =>
        book.chapters.map((_, cIndex) => ({ bookIndex: bIndex, chapterIndex: cIndex }))
      ),
    [books]
  )

  const hasBooks = books.length > 0
  const safeBookIndex = hasBooks ? Math.min(bookIndex, books.length - 1) : 0
  const book: Book | null = hasBooks ? books[safeBookIndex] : null

  const hasChapters = Boolean(book && book.chapters.length > 0)
  const safeChapterIndex =
    hasChapters && book ? Math.min(chapterIndex, book.chapters.length - 1) : 0
  const chapter: Chapter | null =
    hasChapters && book ? book.chapters[safeChapterIndex] : null

  const refIndex = useMemo(() => {
    if (!book || !chapter) {
      return -1
    }
    return chapterRefs.findIndex(
      (ref) =>
        ref.bookIndex === safeBookIndex && ref.chapterIndex === safeChapterIndex
    )
  }, [book, chapter, chapterRefs, safeBookIndex, safeChapterIndex])

  const hasPrev = refIndex > 0
  const hasNext = refIndex >= 0 && refIndex < chapterRefs.length - 1

  if (!isLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl">KJV Only</CardTitle>
            <CardDescription>Loading Bible data...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (loadError || !book || !chapter) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle className="text-xl">KJV Only</CardTitle>
            <CardDescription>
              {loadError ?? "No Bible data available. Run npm run build:data."}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  function goToChapter(ref: Reference) {
    setBookIndex(ref.bookIndex)
    setChapterIndex(ref.chapterIndex)
  }

  function goToPrevChapter() {
    if (!hasPrev) {
      return
    }
    goToChapter(chapterRefs[refIndex - 1])
  }

  function goToNextChapter() {
    if (!hasNext) {
      return
    }
    goToChapter(chapterRefs[refIndex + 1])
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">KJV Only</CardTitle>
          <CardDescription>
            Basic offline-first reader scaffold with red letters and Strong&apos;s tagging.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              items={books.map((bookItem) => ({ label: bookItem.name, value: bookItem.name }))}
              value={book.name}
              onValueChange={(value) => {
                const nextBookIndex = books.findIndex((bookItem) => bookItem.name === value)
                if (nextBookIndex >= 0) {
                  setBookIndex(nextBookIndex)
                  setChapterIndex(0)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {books.map((bookItem) => (
                    <SelectItem key={bookItem.name} value={bookItem.name}>
                      {bookItem.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              items={book.chapters.map((chapterItem) => ({
                label: `Chapter ${chapterItem.chapter}`,
                value: String(chapterItem.chapter),
              }))}
              value={String(chapter.chapter)}
              onValueChange={(value) => {
                const nextChapterIndex = book.chapters.findIndex(
                  (chapterItem) => String(chapterItem.chapter) === value
                )
                if (nextChapterIndex >= 0) {
                  setChapterIndex(nextChapterIndex)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {book.chapters.map((chapterItem) => (
                    <SelectItem key={`${book.name}-${chapterItem.chapter}`} value={String(chapterItem.chapter)}>
                      Chapter {chapterItem.chapter}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={goToPrevChapter} disabled={!hasPrev}>
              <ChevronLeftIcon />
              Previous Chapter
            </Button>
            <Button variant="outline" onClick={goToNextChapter} disabled={!hasNext}>
              Next Chapter
              <ChevronRightIcon />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {book.name} {chapter.chapter}
          </CardTitle>
          <CardDescription>
            Red text marks Jesus&apos; words. Superscript tags show Strong&apos;s numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {chapter.verses.map((verse) => (
            <article key={`${book.name}-${chapter.chapter}-${verse.verse}`}>
              <p className={verse.redLetter ? "text-pretty leading-7 text-red-700" : "text-pretty leading-7"}>
                <span className="mr-2 align-top text-xs font-semibold text-muted-foreground">
                  {verse.verse}
                </span>
                {verse.tokens.map(renderToken)}
              </p>
            </article>
          ))}
        </CardContent>
      </Card>
    </main>
  )
}
