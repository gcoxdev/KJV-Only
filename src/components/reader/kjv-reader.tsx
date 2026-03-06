import { Fragment, useEffect, useMemo, useState } from "react"
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  SettingsIcon,
} from "lucide-react"

import { type Book, type Chapter, type VerseToken } from "@/types/bible"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

type Reference = {
  bookIndex: number
  chapterIndex: number
}

type ReaderPayload = {
  books?: Book[]
}

function hasTokenMetadata(token: VerseToken) {
  return Boolean(token.strong || token.lemma || token.morph || token.divineName)
}

function isPunctuationToken(tokenText: string) {
  return /^[,.;:!?)]/.test(tokenText)
}

function formatDisplayTokenText(token: VerseToken) {
  if (!token.divineName) {
    return token.text
  }

  const possessiveMatch = token.text.match(/^(.+?)(['’])([sS])$/)
  if (possessiveMatch) {
    const [, base, apostrophe] = possessiveMatch
    return `${base.toUpperCase()}${apostrophe}s`
  }

  return token.text.toUpperCase()
}

function renderToken(token: VerseToken, isStudyMode: boolean) {
  const tokenClassName = cn(token.added && "italic")
  const displayText = formatDisplayTokenText(token)
  const showMetadata = isStudyMode && hasTokenMetadata(token)

  if (!showMetadata) {
    return <span className={tokenClassName}>{displayText}</span>
  }

  return (
    <Popover>
      <PopoverTrigger
        render={<span />}
        className="cursor-pointer rounded-sm px-0.5 py-0.5 underline decoration-dotted underline-offset-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60"
        aria-label={`Details for ${displayText}`}
      >
        <span className={tokenClassName}>{displayText}</span>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="space-y-2 text-sm">
          <p className="font-medium">{displayText}</p>
          {token.added ? (
            <p className="text-xs text-muted-foreground">
              Added word (italic in KJV typography)
            </p>
          ) : null}
          {token.strong ? (
            <p>
              <span className="text-muted-foreground">Strong&apos;s:</span>{" "}
              <span className="font-mono">{token.strong}</span>
            </p>
          ) : null}
          {token.lemma ? (
            <p>
              <span className="text-muted-foreground">Lemma:</span>{" "}
              <span className="font-mono">{token.lemma}</span>
            </p>
          ) : null}
          {token.morph ? (
            <p>
              <span className="text-muted-foreground">Morph:</span>{" "}
              <span className="font-mono">{token.morph}</span>
            </p>
          ) : null}
          {token.divineName ? (
            <p>
              <span className="text-muted-foreground">Divine Name:</span>{" "}
              Tagged in OSIS as <span className="font-mono">divineName</span>
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function renderVerseTokens(tokens: VerseToken[], isStudyMode: boolean) {
  return tokens.map((token, tokenIndex) => {
    const leadingSpace = tokenIndex > 0 && !isPunctuationToken(token.text)

    return (
      <Fragment key={`${token.text}-${tokenIndex}`}>
        {leadingSpace ? " " : null}
        {renderToken(token, isStudyMode)}
      </Fragment>
    )
  })
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
  const [isStudyMode, setIsStudyMode] = useState(true)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme")
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme)
      return
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    window.localStorage.setItem("theme", theme)
  }, [theme])

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
            <p className="text-sm text-muted-foreground">Loading Bible data...</p>
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
            <p className="text-sm text-muted-foreground">
              {loadError ?? "No Bible data available. Run npm run build:data."}
            </p>
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
    <main className="min-h-screen w-full bg-background">
      <SidebarProvider open={isRightSidebarOpen} onOpenChange={setIsRightSidebarOpen}>
        <SidebarInset className="min-h-screen">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
                >
                  <MenuIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <SettingsIcon />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="text-primary" />
                <p className="font-semibold">KJV Only</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="study-mode" className="text-sm">
                  Study
                </Label>
                <Switch
                  id="study-mode"
                  checked={isStudyMode}
                  onCheckedChange={(checked) => setIsStudyMode(checked)}
                />
              </div>
              <SidebarTrigger side="right" />
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {book.name} {chapter.chapter}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  items={books.map((bookItem) => ({
                    label: bookItem.name,
                    value: bookItem.name,
                  }))}
                  value={book.name}
                  onValueChange={(value) => {
                    const nextBookIndex = books.findIndex(
                      (bookItem) => bookItem.name === value
                    )
                    if (nextBookIndex >= 0) {
                      setBookIndex(nextBookIndex)
                      setChapterIndex(0)
                    }
                  }}
                >
                  <SelectTrigger className="min-w-40 sm:min-w-52">
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
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {book.chapters.map((chapterItem) => (
                        <SelectItem
                          key={`${book.name}-${chapterItem.chapter}`}
                          value={String(chapterItem.chapter)}
                        >
                          Chapter {chapterItem.chapter}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={goToPrevChapter} disabled={!hasPrev}>
                  <ChevronLeftIcon />
                  Prev
                </Button>
                <Button variant="outline" onClick={goToNextChapter} disabled={!hasNext}>
                  Next
                  <ChevronRightIcon />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 pt-6">
              {chapter.verses.map((verse) => (
                <article key={`${book.name}-${chapter.chapter}-${verse.verse}`}>
                  <p
                    className={cn(
                      "text-pretty leading-7",
                      verse.redLetter && "text-red-700",
                      !isStudyMode && verse.paragraphStart && "pl-4 sm:pl-6"
                    )}
                  >
                    <span className="mr-2 align-top text-xs font-semibold text-muted-foreground">
                      {verse.verse}
                    </span>
                    {renderVerseTokens(verse.tokens, isStudyMode)}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>
          </div>
        </SidebarInset>

        <Sidebar side="right" className="min-h-screen">
          <SidebarHeader>
            <h2 className="text-base font-semibold">Sidebar</h2>
            <p className="text-sm text-muted-foreground">
              Placeholder for future tools.
            </p>
          </SidebarHeader>
          <SidebarContent className="text-muted-foreground">
            This right sidebar is ready for study tools, notes, and references.
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>

      <AlertDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Settings</AlertDialogTitle>
            <AlertDialogDescription>
              Reader preferences for this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="theme-mode">Dark Mode</Label>
            <Switch
              id="theme-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
