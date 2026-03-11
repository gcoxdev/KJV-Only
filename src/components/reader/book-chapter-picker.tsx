import { ChevronRightIcon } from "lucide-react";

import type { Book } from "@/types/bible";
import { Button } from "@/components/ui/button";

type BookChapterPickerProps = {
  books: Book[];
  selectedTestament: "old" | "new" | null;
  selectedBookIndex: number | null;
  currentBookIndex: number | null;
  currentChapterIndex: number | null;
  onSelectTestament: (testament: "old" | "new") => void;
  onBackToTestaments: () => void;
  onSelectBook: (bookIndex: number) => void;
  onGoToBookSelection: (testament: "old" | "new") => void;
  onGoToChapterSelection: (testament: "old" | "new", bookIndex: number) => void;
  onSelectChapter: (bookIndex: number, chapterIndex: number) => void;
};

export function BookChapterPicker({
  books,
  selectedTestament,
  selectedBookIndex,
  currentBookIndex,
  currentChapterIndex,
  onSelectTestament,
  onBackToTestaments,
  onSelectBook,
  onGoToBookSelection,
  onGoToChapterSelection,
  onSelectChapter,
}: BookChapterPickerProps) {
  const oldTestamentBooks = books.slice(0, 39);
  const newTestamentBooks = books.slice(39);
  const currentTestament =
    currentBookIndex === null ? null : currentBookIndex < 39 ? "old" : "new";
  const displayTestament = selectedTestament ?? currentTestament;
  const testamentBooks =
    displayTestament === "old"
      ? oldTestamentBooks
      : displayTestament === "new"
        ? newTestamentBooks
        : [];
  const currentBookMatchesTestament =
    displayTestament !== null && displayTestament === currentTestament;
  const currentBook =
    currentBookMatchesTestament && currentBookIndex !== null
      ? books[currentBookIndex]
      : null;
  const breadcrumbBook = selectedBookIndex !== null ? books[selectedBookIndex] : currentBook;
  const breadcrumbBookIndex =
    selectedBookIndex !== null
      ? selectedBookIndex
      : currentBookMatchesTestament
        ? currentBookIndex
        : null;
  const breadcrumbChapterIndex =
    currentBookMatchesTestament &&
    breadcrumbBookIndex === currentBookIndex &&
    currentChapterIndex !== null
      ? currentChapterIndex
      : null;
  const pageBook =
    selectedBookIndex !== null && displayTestament !== null
      ? books[selectedBookIndex]
      : null;
  const selectedTestamentLabel =
    displayTestament === "old" ? "Old Testament" : "New Testament";

  return (
    <div className="space-y-3">
      {displayTestament ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => onBackToTestaments()}>
            {selectedTestamentLabel}
          </Button>
          {breadcrumbBook ? (
            <>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGoToBookSelection(displayTestament)}
              >
                {breadcrumbBook.name}
              </Button>
            </>
          ) : null}
          {breadcrumbBook && breadcrumbChapterIndex !== null ? (
            <>
              <ChevronRightIcon className="size-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onGoToChapterSelection(displayTestament, breadcrumbBookIndex!)
                }
              >
                {breadcrumbChapterIndex + 1}
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {!selectedTestament ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">Testament</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={displayTestament === "old" ? "default" : "outline"}
              onClick={() => onSelectTestament("old")}
            >
              Old Testament
            </Button>
            <Button
              variant={displayTestament === "new" ? "default" : "outline"}
              onClick={() => onSelectTestament("new")}
            >
              New Testament
            </Button>
          </div>
        </>
      ) : !pageBook ? (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedTestamentLabel} Books
          </p>
          <div className="flex flex-wrap gap-2">
            {testamentBooks.map((book, localBookIndex) => {
              const startIndex = selectedTestament === "old" ? 0 : 39;

              return (
                <Button
                  key={book.name}
                  variant={
                    currentBookMatchesTestament &&
                    currentBookIndex === startIndex + localBookIndex
                      ? "default"
                      : "outline"
                  }
                  className="h-auto whitespace-normal px-3 py-2 text-left"
                  onClick={() => onSelectBook(startIndex + localBookIndex)}
                >
                  {book.name}
                </Button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-muted-foreground">
            {pageBook.name} Chapters
          </p>
          <div className="flex flex-wrap gap-2">
            {pageBook.chapters.map((chapter, chapterIndex) => (
              <Button
                key={`${pageBook.name}-${chapter.chapter}`}
                variant={
                  selectedBookIndex === currentBookIndex &&
                  currentChapterIndex === chapterIndex
                    ? "default"
                    : "outline"
                }
                className="size-10"
                onClick={() => onSelectChapter(selectedBookIndex!, chapterIndex)}
              >
                {chapter.chapter}
              </Button>
              ))}
            </div>
        </>
      )}
    </div>
  );
}
