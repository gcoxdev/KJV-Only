import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MinusSquareIcon,
  PlusSquareIcon,
  SearchIcon,
} from "lucide-react";

import type { Book, Verse } from "@/types/bible";
import type { SearchMatch, SearchMode, SearchPageState } from "@/types/reader";
import { formatDisplayTokenText, isPunctuationToken } from "@/components/reader/chapter-text-content";
import { bookCodeForIndex, iconPath, renderHighlightedTerms, renderHighlightedText } from "@/lib/reader-view";
import { buildRegexMatcher, createSearchableVerseEntry, matchSelectedWords } from "@/lib/search";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type SearchPageProps = {
  books: Book[];
  concordanceWords: string[];
  ensureConcordanceWordsLoaded: () => Promise<unknown>;
  state: SearchPageState;
  onStateChange: (patch: Partial<SearchPageState>) => void;
  onOpenResult: (
    bookIndex: number,
    chapterIndex: number,
    verseStart: number,
    verseEnd?: number,
  ) => void;
};

type VerseIndexEntry = SearchMatch & {
  textLower: string;
  searchWords: string[];
  searchWordsLower: string[];
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
const MAX_CONCORDANCE_SUGGESTIONS = 40;

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
  state,
  onStateChange,
  onOpenResult,
}: SearchPageProps) {
  const [isBookFilterOpen, setIsBookFilterOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const {
    searchMode,
    caseSensitive,
    chipInput,
    phraseInput,
    selectedWords,
    results,
    error,
  } = state;
  const [chipInputDraft, setChipInputDraft] = useState(chipInput);
  const [phraseInputDraft, setPhraseInputDraft] = useState(phraseInput);
  const deferredChipInput = useDeferredValue(chipInputDraft);

  useEffect(() => {
    setChipInputDraft(chipInput);
  }, [chipInput]);

  useEffect(() => {
    setPhraseInputDraft(phraseInput);
  }, [phraseInput]);

  useEffect(() => {
    if (chipInputDraft === chipInput) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onStateChange({ chipInput: chipInputDraft });
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [chipInput, chipInputDraft, onStateChange]);

  useEffect(() => {
    if (phraseInputDraft === phraseInput) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onStateChange({ phraseInput: phraseInputDraft });
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [onStateChange, phraseInput, phraseInputDraft]);

  const expandedBookTree = useMemo(
    () => new Set(state.expandedBookTree),
    [state.expandedBookTree],
  );
  const selectedBookIndexes = useMemo(
    () => new Set(state.selectedBookIndexes),
    [state.selectedBookIndexes],
  );

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
    if (
      state.selectedBookIndexes.length === 0 ||
      selectedBookIndexes.size === 0 ||
      selectedBookIndexes.size > books.length
    ) {
      onStateChange({ selectedBookIndexes: Array.from(nextAll) });
      return;
    }
    for (const selected of selectedBookIndexes) {
      if (selected >= books.length) {
        onStateChange({ selectedBookIndexes: Array.from(nextAll) });
        return;
      }
    }
  }, [books, onStateChange, selectedBookIndexes, state.selectedBookIndexes.length]);

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
            ...createSearchableVerseEntry(text),
          });
        });
      });
    });
    return indexed;
  }, [books]);

  const concordanceWordEntries = useMemo(
    () =>
      concordanceWords.map((word) => ({
        word,
        lower: word.toLowerCase(),
      })),
    [concordanceWords],
  );

  const concordanceSuggestions = useMemo(() => {
    const query = deferredChipInput.trim().toLowerCase();
    if (query.length < 2) {
      return [] as string[];
    }
    const selected = new Set(selectedWords.map((word) => word.toLowerCase()));
    const startsWith: string[] = [];
    const includes: string[] = [];

    for (const entry of concordanceWordEntries) {
      if (selected.has(entry.lower)) {
        continue;
      }
      if (entry.lower.startsWith(query)) {
        startsWith.push(entry.word);
      } else if (entry.lower.includes(query)) {
        includes.push(entry.word);
      }

      if (startsWith.length + includes.length >= MAX_CONCORDANCE_SUGGESTIONS) {
        break;
      }
    }

    return [...startsWith, ...includes].slice(0, MAX_CONCORDANCE_SUGGESTIONS);
  }, [concordanceWordEntries, deferredChipInput, selectedWords]);

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
      { id: "nt-rev", label: "Prophecy", iconCode: "REV", indices: clampGroupIndices([65], books.length) },
    ].filter((group) => group.indices.length > 0);

    return { otGroups, ntGroups };
  }, [books.length]);

  const selectedBookCount = selectedBookIndexes.size;

  const toggleTreeNode = (nodeId: string) => {
    const next = (() => {
      const current = new Set(state.expandedBookTree);
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    })();
    onStateChange({ expandedBookTree: Array.from(next) });
  };

  const addWordChip = (word: string) => {
    const clean = word.trim();
    if (!clean) {
      return;
    }
    const lowerClean = clean.toLowerCase();
    const next = (() => {
      const current = state.selectedWords;
      if (current.some((item) => item.toLowerCase() === lowerClean)) {
        return current;
      }
      return [...current, clean];
    })();
    setChipInputDraft("");
    onStateChange({ selectedWords: next, chipInput: "" });
  };

  const removeWordChip = (word: string) => {
    const lowerWord = word.toLowerCase();
    onStateChange({
      selectedWords: state.selectedWords.filter(
        (item) => item.toLowerCase() !== lowerWord,
      ),
    });
  };

  const toggleBookSelection = (bookIndex: number, nextChecked: boolean) => {
    const next = (() => {
      const current = new Set(state.selectedBookIndexes);
      const next = new Set(current);
      if (nextChecked) {
        next.add(bookIndex);
      } else {
        next.delete(bookIndex);
      }
      return next;
    })();
    onStateChange({ selectedBookIndexes: Array.from(next) });
  };

  const setIndicesSelection = (indices: number[], nextChecked: boolean) => {
    const next = (() => {
      const current = new Set(state.selectedBookIndexes);
      const next = new Set(current);
      indices.forEach((index) => {
        if (nextChecked) {
          next.add(index);
        } else {
          next.delete(index);
        }
      });
      return next;
    })();
    onStateChange({ selectedBookIndexes: Array.from(next) });
  };

  const search = () => {
    onStateChange({ error: null });
    let matcher: ((entry: VerseIndexEntry) => boolean) | null = null;

    if (searchMode === "contains-any" || searchMode === "contains-all") {
      if (selectedWords.length === 0) {
        onStateChange({
          error: "Select at least one word for this search mode.",
          results: [],
        });
        return;
      }
      const needles = caseSensitive
        ? selectedWords.map((word) => word.trim()).filter(Boolean)
        : selectedWords.map((word) => word.trim().toLowerCase()).filter(Boolean);
      if (needles.length === 0) {
        onStateChange({
          error: "Select at least one word for this search mode.",
          results: [],
        });
        return;
      }
      matcher =
        searchMode === "contains-any" || searchMode === "contains-all"
          ? (entry) =>
              matchSelectedWords(
                entry,
                needles,
                searchMode,
                caseSensitive,
              )
          : null;
    }

    if (searchMode === "contains-phrase") {
      const phrase = phraseInputDraft.trim();
      if (!phrase) {
        onStateChange({ error: "Enter a phrase to search.", results: [] });
        return;
      }
      const needle = caseSensitive ? phrase : phrase.toLowerCase();
      matcher = (entry) =>
        (caseSensitive ? entry.text : entry.textLower).includes(needle);
    }

    if (searchMode === "regex") {
      const pattern = phraseInputDraft.trim();
      if (!pattern) {
        onStateChange({ error: "Enter a regular expression.", results: [] });
        return;
      }
      try {
        const { regex, error: regexError } = buildRegexMatcher(
          pattern,
          caseSensitive,
        );
        if (!regex) {
          onStateChange({
            error: regexError,
            results: [],
          });
          return;
        }
        matcher = (entry) => regex.test(entry.text);
      } catch {
        onStateChange({ error: "Invalid regular expression.", results: [] });
        return;
      }
    }

    if (!matcher) {
      onStateChange({ results: [] });
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
      onStateChange({ results: matches });
      setIsSearching(false);
    });
  };

  const allBooksSelected = sameSet(selectedBookIndexes, allBookIndexes);
  const hasSearchOutput = results.length > 0 || Boolean(error);

  const clearResults = () => {
    onStateChange({
      results: [],
      error: null,
    });
  };

  const renderResultText = (match: SearchMatch) => {
    if (searchMode === "contains-any" || searchMode === "contains-all") {
      return renderHighlightedTerms(
        match.text,
        selectedWords,
        `${match.bookIndex}-${match.chapterIndex}-${match.verseNumber}`,
      );
    }

    if (searchMode === "contains-phrase") {
      return renderHighlightedText(
        match.text,
        phraseInputDraft.trim(),
        `${match.bookIndex}-${match.chapterIndex}-${match.verseNumber}`,
      );
    }

    return match.text;
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 p-2">
      <div className="workspace-panel-elevated flex flex-col gap-2 rounded-2xl border p-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="workspace-heading text-xl font-semibold">Search</h2>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Search Mode
          </Label>
          <ToggleGroup
            value={[searchMode]}
            onValueChange={(value) => {
              const nextValue = value[0];
              if (nextValue) {
                onStateChange({ searchMode: nextValue as SearchMode });
              }
            }}
            variant="outline"
            spacing={0}
            className="grid w-full grid-cols-2 gap-0 lg:grid-cols-4"
          >
            <ToggleGroupItem value="contains-any">{SEARCH_MODE_LABELS["contains-any"]}</ToggleGroupItem>
            <ToggleGroupItem value="contains-all">{SEARCH_MODE_LABELS["contains-all"]}</ToggleGroupItem>
            <ToggleGroupItem value="contains-phrase">{SEARCH_MODE_LABELS["contains-phrase"]}</ToggleGroupItem>
            <ToggleGroupItem value="regex">{SEARCH_MODE_LABELS.regex}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 rounded-full border border-subtle-divider/80 bg-workspace-panel px-3 py-1.5 text-sm">
            <Checkbox
              checked={caseSensitive}
              onCheckedChange={(value) =>
                onStateChange({ caseSensitive: isChecked(value) })
              }
            />
            Case-sensitive
          </label>

          <Button
            type="button"
            variant="outline"
            className="bg-workspace-panel"
            onClick={openBookFilterDialog}
          >
            {`Scope • ${selectedBookCount}/${books.length} books`}
          </Button>
        </div>
      </div>

      {searchMode === "contains-any" || searchMode === "contains-all" ? (
        <div className="workspace-panel flex flex-col gap-2 rounded-2xl border p-3">
          <Label htmlFor="search-chip-input">Words</Label>
          <div className="rounded-2xl border border-subtle-divider/80 bg-workspace-panel-elevated p-2">
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedWords.map((word) => (
                <button
                  key={word}
                  type="button"
                  className="study-accent-chip inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
                  onClick={() => removeWordChip(word)}
                >
                  {word}
                  <span aria-hidden="true" className="text-muted-foreground">
                    ×
                  </span>
                </button>
              ))}
            </div>
            <Input
              id="search-chip-input"
              value={chipInputDraft}
              onChange={(event) =>
                setChipInputDraft(event.currentTarget.value)
              }
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
            {chipInputDraft.trim() ? (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl border border-subtle-divider/80 bg-background/60">
                <div className="p-1">
                  {chipInputDraft.trim().length < 2 ? (
                    <p className="px-2 py-1 text-sm text-muted-foreground">
                      Type at least 2 characters for suggestions.
                    </p>
                  ) : concordanceSuggestions.length > 0 ? (
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
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="workspace-panel flex flex-col gap-2 rounded-2xl border p-3">
          <Label htmlFor="search-phrase-input">
            {searchMode === "regex" ? "Regular expression" : "Phrase"}
          </Label>
          <Input
            id="search-phrase-input"
            value={phraseInputDraft}
            onChange={(event) =>
              setPhraseInputDraft(event.currentTarget.value)
            }
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

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={search} disabled={isSearching}>
          <SearchIcon />
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearResults}
          disabled={!hasSearchOutput}
        >
          Clear Results
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Separator />

      <div className="workspace-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border p-2">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Results Summary
            </p>
            <p className="text-sm font-medium text-foreground">
              {results.length === 0
                ? "No verses loaded yet"
                : `${results.length} matching verses`}
            </p>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1 rounded-2xl border border-subtle-divider/80 bg-workspace-panel-elevated">
          <div className="divide-y divide-subtle-divider/70 pb-1">
            {results.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                Run a search to review matching verses in book order.
              </p>
            ) : (
              results.map((match) => (
                <button
                  key={`${match.bookIndex}-${match.chapterIndex}-${match.verseNumber}`}
                  type="button"
                  className="group block w-full px-3 py-2 text-left hover:bg-reference-tint/60"
                  onClick={() =>
                    onOpenResult(
                      match.bookIndex,
                      match.chapterIndex,
                      match.verseNumber,
                      match.verseNumber,
                    )
                  }
                >
                  <p className="tabular-data text-sm font-medium text-foreground">
                    {`${match.bookName} ${match.chapterIndex + 1}:${match.verseNumber}`}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90">
                    {renderResultText(match)}
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
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1 text-sm">
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
                      width={20}
                      height={20}
                      className="size-5 rounded-sm"
                    />
                    <span className="font-medium">Entire Bible</span>
                  </div>

                  {expandedBookTree.has("entire") ? (
                    <div className="ml-7 flex flex-col gap-1 border-l pl-3">
                      <div className="flex flex-col gap-1">
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
                            width={20}
                            height={20}
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
