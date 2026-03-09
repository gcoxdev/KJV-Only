import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MinusSquareIcon,
  PlusSquareIcon,
  SearchIcon,
} from "lucide-react";

import type { Book, Verse } from "@/types/bible";
import { formatDisplayTokenText, isPunctuationToken } from "@/components/reader/chapter-text-content";
import { bookCodeForIndex, iconPath } from "@/lib/reader-view";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type SearchMode = "contains-any" | "contains-all" | "contains-phrase" | "regex";

type SearchPageProps = {
  books: Book[];
  concordanceWords: string[];
  ensureConcordanceWordsLoaded: () => Promise<unknown>;
  onOpenResult: (
    bookIndex: number,
    chapterIndex: number,
    verseStart: number,
    verseEnd?: number,
  ) => void;
};

type SearchMatch = {
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
  bookName: string;
  text: string;
};

type VerseIndexEntry = SearchMatch & {
  textLower: string;
};

type BookGroup = {
  id: string;
  label: string;
  iconCode: string;
  indices: number[];
};

const SEARCH_MODE_LABELS: Record<SearchMode, string> = {
  "contains-any": "Contains any",
  "contains-all": "Contains all",
  "contains-phrase": "Contains phrase",
  regex: "Regular expression",
};

function formatVerseText(verse: Verse) {
  let value = "";
  verse.tokens.forEach((token, index) => {
    if (index > 0 && !isPunctuationToken(token.text)) {
      value += " ";
    }
    value += formatDisplayTokenText(token);
  });
  return value;
}

function clampGroupIndices(indices: number[], max: number) {
  return indices.filter((value) => value >= 0 && value < max);
}

function sameSet(a: Set<number>, b: Set<number>) {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
}

function isChecked(value: boolean | "indeterminate") {
  return value === true;
}

export function SearchPage({
  books,
  concordanceWords,
  ensureConcordanceWordsLoaded,
  onOpenResult,
}: SearchPageProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>("contains-any");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [chipInput, setChipInput] = useState("");
  const [phraseInput, setPhraseInput] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isBookFilterOpen, setIsBookFilterOpen] = useState(false);
  const [expandedBookTree, setExpandedBookTree] = useState<Set<string>>(
    () => new Set(["entire", "old", "new"]),
  );
  const [selectedBookIndexes, setSelectedBookIndexes] = useState<Set<number>>(
    () => new Set(books.map((_, index) => index)),
  );
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const openBookFilterDialog = () => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
    window.requestAnimationFrame(() => {
      setIsBookFilterOpen(true);
    });
  };

  useEffect(() => {
    const nextAll = new Set(books.map((_, index) => index));
    if (selectedBookIndexes.size === 0 || selectedBookIndexes.size > books.length) {
      setSelectedBookIndexes(nextAll);
      return;
    }
    for (const selected of selectedBookIndexes) {
      if (selected >= books.length) {
        setSelectedBookIndexes(nextAll);
        return;
      }
    }
  }, [books, selectedBookIndexes]);

  useEffect(() => {
    if (searchMode === "contains-any" || searchMode === "contains-all") {
      void ensureConcordanceWordsLoaded();
    }
  }, [ensureConcordanceWordsLoaded, searchMode]);

  const verseIndex = useMemo<VerseIndexEntry[]>(() => {
    const indexed: VerseIndexEntry[] = [];
    books.forEach((book, bookIndex) => {
      book.chapters.forEach((chapter, chapterIndex) => {
        chapter.verses.forEach((verse) => {
          const text = formatVerseText(verse);
          indexed.push({
            bookIndex,
            chapterIndex,
            verseNumber: verse.verse,
            bookName: book.name,
            text,
            textLower: text.toLowerCase(),
          });
        });
      });
    });
    return indexed;
  }, [books]);

  const concordanceSuggestions = useMemo(() => {
    const query = chipInput.trim().toLowerCase();
    if (!query) {
      return [] as string[];
    }
    const selected = new Set(selectedWords.map((word) => word.toLowerCase()));
    return concordanceWords
      .filter((word) => word.toLowerCase().includes(query))
      .filter((word) => !selected.has(word.toLowerCase()))
      .slice(0, 50);
  }, [chipInput, concordanceWords, selectedWords]);

  const allBookIndexes = useMemo(
    () => new Set(books.map((_, index) => index)),
    [books],
  );

  const oldTestament = useMemo(
    () => clampGroupIndices(Array.from({ length: 39 }, (_, index) => index), books.length),
    [books.length],
  );
  const newTestament = useMemo(
    () => clampGroupIndices(
      Array.from({ length: Math.max(books.length - 39, 0) }, (_, index) => index + 39),
      books.length,
    ),
    [books.length],
  );

  const groupedBooks = useMemo(() => {
    const otGroups: BookGroup[] = [
      { id: "ot-pent", label: "Books of Moses", iconCode: "BM", indices: clampGroupIndices([0, 1, 2, 3, 4], books.length) },
      { id: "ot-hist", label: "History Books", iconCode: "HB", indices: clampGroupIndices([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], books.length) },
      { id: "ot-poet", label: "Poetic Books", iconCode: "PB", indices: clampGroupIndices([17, 18, 19, 20, 21], books.length) },
      { id: "ot-major", label: "Major Prophets", iconCode: "MJ", indices: clampGroupIndices([22, 23, 24, 25, 26], books.length) },
      { id: "ot-minor", label: "Minor Prophets", iconCode: "MN", indices: clampGroupIndices([27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38], books.length) },
    ].filter((group) => group.indices.length > 0);

    const ntGroups: BookGroup[] = [
      { id: "nt-gos-acts", label: "Gospels and Acts", iconCode: "GA", indices: clampGroupIndices([39, 40, 41, 42, 43], books.length) },
      { id: "nt-paul", label: "Pauline Epistles", iconCode: "PE", indices: clampGroupIndices([44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57], books.length) },
      { id: "nt-general", label: "General Epistles", iconCode: "GE", indices: clampGroupIndices([58, 59, 60, 61, 62, 63, 64], books.length) },
      { id: "nt-rev", label: "Revelation", iconCode: "REV", indices: clampGroupIndices([65], books.length) },
    ].filter((group) => group.indices.length > 0);

    return { otGroups, ntGroups };
  }, [books.length]);

  const selectedBookCount = selectedBookIndexes.size;

  const toggleTreeNode = (nodeId: string) => {
    setExpandedBookTree((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const addWordChip = (word: string) => {
    const clean = word.trim();
    if (!clean) {
      return;
    }
    const lowerClean = clean.toLowerCase();
    setSelectedWords((current) => {
      if (current.some((item) => item.toLowerCase() === lowerClean)) {
        return current;
      }
      return [...current, clean];
    });
    setChipInput("");
  };

  const removeWordChip = (word: string) => {
    const lowerWord = word.toLowerCase();
    setSelectedWords((current) =>
      current.filter((item) => item.toLowerCase() !== lowerWord),
    );
  };

  const toggleBookSelection = (bookIndex: number, nextChecked: boolean) => {
    setSelectedBookIndexes((current) => {
      const next = new Set(current);
      if (nextChecked) {
        next.add(bookIndex);
      } else {
        next.delete(bookIndex);
      }
      return next;
    });
  };

  const setIndicesSelection = (indices: number[], nextChecked: boolean) => {
    setSelectedBookIndexes((current) => {
      const next = new Set(current);
      indices.forEach((index) => {
        if (nextChecked) {
          next.add(index);
        } else {
          next.delete(index);
        }
      });
      return next;
    });
  };

  const search = () => {
    setError(null);
    let matcher: ((entry: VerseIndexEntry) => boolean) | null = null;

    if (searchMode === "contains-any" || searchMode === "contains-all") {
      if (selectedWords.length === 0) {
        setError("Select at least one word for this search mode.");
        setResults([]);
        return;
      }
      const needles = caseSensitive
        ? selectedWords.map((word) => word.trim()).filter(Boolean)
        : selectedWords.map((word) => word.trim().toLowerCase()).filter(Boolean);
      if (needles.length === 0) {
        setError("Select at least one word for this search mode.");
        setResults([]);
        return;
      }
      matcher =
        searchMode === "contains-any"
          ? (entry) =>
              needles.some((needle) =>
                (caseSensitive ? entry.text : entry.textLower).includes(needle),
              )
          : (entry) =>
              needles.every((needle) =>
                (caseSensitive ? entry.text : entry.textLower).includes(needle),
              );
    }

    if (searchMode === "contains-phrase") {
      const phrase = phraseInput.trim();
      if (!phrase) {
        setError("Enter a phrase to search.");
        setResults([]);
        return;
      }
      const needle = caseSensitive ? phrase : phrase.toLowerCase();
      matcher = (entry) =>
        (caseSensitive ? entry.text : entry.textLower).includes(needle);
    }

    if (searchMode === "regex") {
      const pattern = phraseInput.trim();
      if (!pattern) {
        setError("Enter a regular expression.");
        setResults([]);
        return;
      }
      try {
        const regex = new RegExp(pattern, caseSensitive ? "g" : "gi");
        matcher = (entry) => regex.test(entry.text);
      } catch (regexError) {
        const message =
          regexError instanceof Error ? regexError.message : "Invalid regular expression.";
        setError(message);
        setResults([]);
        return;
      }
    }

    if (!matcher) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    window.requestAnimationFrame(() => {
      const selected = selectedBookIndexes;
      const matches = verseIndex
        .filter((entry) => selected.has(entry.bookIndex))
        .filter((entry) => matcher(entry))
        .slice(0, 500)
        .map(({ bookIndex, chapterIndex, verseNumber, bookName, text }) => ({
          bookIndex,
          chapterIndex,
          verseNumber,
          bookName,
          text,
        }));
      setResults(matches);
      setIsSearching(false);
    });
  };

  const allBooksSelected = sameSet(selectedBookIndexes, allBookIndexes);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchMode}
          onValueChange={(value) => setSearchMode(value as SearchMode)}
        >
          <SelectTrigger className="w-[13rem]">
            <SelectValue>{SEARCH_MODE_LABELS[searchMode]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains-any">
              {SEARCH_MODE_LABELS["contains-any"]}
            </SelectItem>
            <SelectItem value="contains-all">
              {SEARCH_MODE_LABELS["contains-all"]}
            </SelectItem>
            <SelectItem value="contains-phrase">
              {SEARCH_MODE_LABELS["contains-phrase"]}
            </SelectItem>
            <SelectItem value="regex">{SEARCH_MODE_LABELS.regex}</SelectItem>
          </SelectContent>
        </Select>

        <label className="inline-flex items-center gap-2 text-sm">
          <Checkbox
            checked={caseSensitive}
            onCheckedChange={(value) => setCaseSensitive(isChecked(value))}
          />
          Case-sensitive
        </label>

        <Button
          type="button"
          variant="outline"
          onClick={openBookFilterDialog}
        >
          {`Books (${selectedBookCount}/${books.length})`}
        </Button>
      </div>

      {searchMode === "contains-any" || searchMode === "contains-all" ? (
        <div className="space-y-2">
          <Label htmlFor="search-chip-input">Words</Label>
          <div className="rounded-md border p-2">
            <div className="mb-2 flex flex-wrap gap-1">
              {selectedWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                >
                  {word}
                  <button
                    type="button"
                    aria-label={`Remove ${word}`}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => removeWordChip(word)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              id="search-chip-input"
              value={chipInput}
              onChange={(event) => setChipInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") {
                  return;
                }
                event.preventDefault();
                const topSuggestion = concordanceSuggestions[0];
                if (topSuggestion) {
                  addWordChip(topSuggestion);
                }
              }}
              placeholder="Type to find concordance words..."
            />
            {chipInput.trim() ? (
              <ScrollArea className="mt-2 h-40 rounded border">
                <div className="p-1">
                  {concordanceSuggestions.length > 0 ? (
                    concordanceSuggestions.map((word) => (
                      <button
                        key={word}
                        type="button"
                        className="block w-full rounded px-2 py-1 text-left text-sm text-foreground hover:bg-muted/50 hover:text-foreground"
                        onClick={() => addWordChip(word)}
                      >
                        {word}
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-1 text-sm text-muted-foreground">
                      No matching concordance words.
                    </p>
                  )}
                </div>
              </ScrollArea>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="search-phrase-input">
            {searchMode === "regex" ? "Regular expression" : "Phrase"}
          </Label>
          <Input
            id="search-phrase-input"
            value={phraseInput}
            onChange={(event) => setPhraseInput(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                search();
              }
            }}
            placeholder={
              searchMode === "regex"
                ? "Example: \\bfaith\\b"
                : "Enter exact phrase..."
            }
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="button" onClick={search} disabled={isSearching}>
          <SearchIcon />
          Search
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Separator />

      <div className="min-h-0 flex-1 overflow-hidden">
        <p className="mb-2 px-1 text-sm font-medium text-muted-foreground">
          {`Results - ${results.length} matches found`}
        </p>
        <ScrollArea className="h-full rounded border">
          <div className="divide-y">
            {results.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                Run a search to see matching verses.
              </p>
            ) : (
              results.map((match) => (
                <button
                  key={`${match.bookIndex}-${match.chapterIndex}-${match.verseNumber}`}
                  type="button"
                  className="group block w-full px-3 py-2 text-left hover:bg-muted/50"
                  onClick={() =>
                    onOpenResult(
                      match.bookIndex,
                      match.chapterIndex,
                      match.verseNumber,
                      match.verseNumber,
                    )
                  }
                >
                  <p className="text-sm font-medium text-foreground">
                    {`${match.bookName} ${match.chapterIndex + 1}:${match.verseNumber}`}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground group-hover:text-foreground/90">
                    {match.text}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog open={isBookFilterOpen} onOpenChange={setIsBookFilterOpen}>
        <AlertDialogContent className="max-h-[calc(100vh-2rem)] w-[min(95vw,48rem)] max-w-lg! overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>Book Selector</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh] pr-2">
              <div className="space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="size-6"
                      onClick={() => toggleTreeNode("entire")}
                    >
                      {expandedBookTree.has("entire") ? (
                        <ChevronDownIcon />
                      ) : (
                        <ChevronRightIcon />
                      )}
                    </Button>
                    <Checkbox
                      checked={allBooksSelected}
                      onCheckedChange={(value) =>
                        setIndicesSelection(
                          Array.from(allBookIndexes),
                          isChecked(value),
                        )
                      }
                    />
                    <img
                      src="/icons/app-icon.png"
                      alt="Entire Bible icon"
                      className="size-5 rounded-sm"
                    />
                    <span className="font-medium">Entire Bible</span>
                  </div>

                  {expandedBookTree.has("entire") ? (
                    <div className="ml-7 space-y-1 border-l pl-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-6"
                            onClick={() => toggleTreeNode("old")}
                          >
                            {expandedBookTree.has("old") ? (
                              <ChevronDownIcon />
                            ) : (
                              <ChevronRightIcon />
                            )}
                          </Button>
                          <Checkbox
                            checked={
                              oldTestament.length > 0 &&
                              oldTestament.every((index) =>
                                selectedBookIndexes.has(index),
                              )
                            }
                            onCheckedChange={(value) =>
                              setIndicesSelection(
                                oldTestament,
                                isChecked(value),
                              )
                            }
                          />
                          <img
                            src={iconPath("color", "OT")}
                            alt="Old Testament icon"
                            className="size-5 shrink-0"
                          />
                          <span className="font-medium">Old Testament</span>
                        </div>
                        {expandedBookTree.has("old") ? (
                          <div className="ml-7 space-y-1 border-l pl-3">
                            {groupedBooks.otGroups.map((group) => {
                              const groupNodeId = `group-${group.id}`;
                              const groupExpanded = expandedBookTree.has(groupNodeId);
                              return (
                                <div key={group.id} className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="size-6"
                                      onClick={() => toggleTreeNode(groupNodeId)}
                                    >
                                      {groupExpanded ? (
                                        <MinusSquareIcon />
                                      ) : (
                                        <PlusSquareIcon />
                                      )}
                                    </Button>
                                    <Checkbox
                                      checked={group.indices.every((index) =>
                                        selectedBookIndexes.has(index),
                                      )}
                                      onCheckedChange={(value) =>
                                        setIndicesSelection(
                                          group.indices,
                                          isChecked(value),
                                        )
                                      }
                                    />
                                    <img
                                      src={iconPath("color", group.iconCode)}
                                      alt={`${group.label} icon`}
                                      className="size-5 shrink-0"
                                    />
                                    <span>{group.label}</span>
                                  </div>
                                  {groupExpanded ? (
                                    <div className="ml-7 grid grid-cols-1 gap-1 border-l pl-3 md:grid-cols-2">
                                      {group.indices.map((bookIndex) => (
                                        <label
                                          key={`book-${bookIndex}`}
                                          className="flex min-w-0 items-center gap-2"
                                        >
                                          <Checkbox
                                            checked={selectedBookIndexes.has(bookIndex)}
                                            onCheckedChange={(value) =>
                                              toggleBookSelection(
                                                bookIndex,
                                                isChecked(value),
                                              )
                                            }
                                          />
                                          <img
                                            src={iconPath("color", bookCodeForIndex(bookIndex))}
                                            alt={`${books[bookIndex]?.name ?? `Book ${bookIndex + 1}`} icon`}
                                            className="size-5 shrink-0"
                                          />
                                          <span className="min-w-0 break-words whitespace-normal">
                                            {books[bookIndex]?.name ?? `Book ${bookIndex + 1}`}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="size-6"
                            onClick={() => toggleTreeNode("new")}
                          >
                            {expandedBookTree.has("new") ? (
                              <ChevronDownIcon />
                            ) : (
                              <ChevronRightIcon />
                            )}
                          </Button>
                          <Checkbox
                            checked={
                              newTestament.length > 0 &&
                              newTestament.every((index) =>
                                selectedBookIndexes.has(index),
                              )
                            }
                            onCheckedChange={(value) =>
                              setIndicesSelection(
                                newTestament,
                                isChecked(value),
                              )
                            }
                          />
                          <img
                            src={iconPath("color", "NT")}
                            alt="New Testament icon"
                            className="size-5 shrink-0"
                          />
                          <span className="font-medium">New Testament</span>
                        </div>
                        {expandedBookTree.has("new") ? (
                          <div className="ml-7 space-y-1 border-l pl-3">
                            {groupedBooks.ntGroups.map((group) => {
                              const groupNodeId = `group-${group.id}`;
                              const groupExpanded = expandedBookTree.has(groupNodeId);
                              return (
                                <div key={group.id} className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="size-6"
                                      onClick={() => toggleTreeNode(groupNodeId)}
                                    >
                                      {groupExpanded ? (
                                        <MinusSquareIcon />
                                      ) : (
                                        <PlusSquareIcon />
                                      )}
                                    </Button>
                                    <Checkbox
                                      checked={group.indices.every((index) =>
                                        selectedBookIndexes.has(index),
                                      )}
                                      onCheckedChange={(value) =>
                                        setIndicesSelection(
                                          group.indices,
                                          isChecked(value),
                                        )
                                      }
                                    />
                                    <img
                                      src={iconPath("color", group.iconCode)}
                                      alt={`${group.label} icon`}
                                      className="size-5 shrink-0"
                                    />
                                    <span>{group.label}</span>
                                  </div>
                                  {groupExpanded ? (
                                    <div className="ml-7 grid grid-cols-1 gap-1 border-l pl-3 md:grid-cols-2">
                                      {group.indices.map((bookIndex) => (
                                        <label
                                          key={`book-${bookIndex}`}
                                          className="flex min-w-0 items-center gap-2"
                                        >
                                          <Checkbox
                                            checked={selectedBookIndexes.has(bookIndex)}
                                            onCheckedChange={(value) =>
                                              toggleBookSelection(
                                                bookIndex,
                                                isChecked(value),
                                              )
                                            }
                                          />
                                          <img
                                            src={iconPath("color", bookCodeForIndex(bookIndex))}
                                            alt={`${books[bookIndex]?.name ?? `Book ${bookIndex + 1}`} icon`}
                                            className="size-5 shrink-0"
                                          />
                                          <span className="min-w-0 break-words whitespace-normal">
                                            {books[bookIndex]?.name ?? `Book ${bookIndex + 1}`}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </ScrollArea>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsBookFilterOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
