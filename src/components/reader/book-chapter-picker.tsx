import { ChevronLeftIcon } from "lucide-react";

import type { Book } from "@/types/bible";
import { Button } from "@/components/ui/button";

type BookChapterPickerProps = {
  books: Book[];
  selectedTestament: "old" | "new" | null;
  selectedBookIndex: number | null;
  onSelectTestament: (testament: "old" | "new") => void;
  onBackToTestaments: () => void;
  onSelectBook: (bookIndex: number) => void;
  onBackToBooks: () => void;
  onSelectChapter: (bookIndex: number, chapterIndex: number) => void;
};

export function BookChapterPicker({
  books,
  selectedTestament,
  selectedBookIndex,
  onSelectTestament,
  onBackToTestaments,
  onSelectBook,
  onBackToBooks,
  onSelectChapter,
}: BookChapterPickerProps) {
  const oldTestamentBooks = books.slice(0, 39);
  const newTestamentBooks = books.slice(39);
  const testamentBooks =
    selectedTestament === "old"
      ? oldTestamentBooks
      : selectedTestament === "new"
        ? newTestamentBooks
        : [];
  const selectedBook =
    selectedBookIndex !== null && selectedTestament
      ? books[selectedBookIndex]
      : null;

  if (!selectedTestament) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Testament</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => onSelectTestament("old")}>
            Old Testament
          </Button>
          <Button variant="outline" onClick={() => onSelectTestament("new")}>
            New Testament
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedBook) {
    const startIndex = selectedTestament === "old" ? 0 : 39;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBackToTestaments}>
            <ChevronLeftIcon />
            Back
          </Button>
          <p className="text-sm font-medium text-muted-foreground">
            {selectedTestament === "old" ? "Old Testament" : "New Testament"}{" "}
            Books
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {testamentBooks.map((book, localBookIndex) => (
            <Button
              key={book.name}
              variant="outline"
              className="h-auto whitespace-normal px-3 py-2 text-left"
              onClick={() => onSelectBook(startIndex + localBookIndex)}
            >
              {book.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onBackToBooks}>
          <ChevronLeftIcon />
          Back
        </Button>
        <p className="text-sm font-medium text-muted-foreground">
          {selectedBook.name} Chapters
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedBook.chapters.map((chapter, chapterIndex) => (
          <Button
            key={`${selectedBook.name}-${chapter.chapter}`}
            variant="outline"
            className="size-10"
            onClick={() => onSelectChapter(selectedBookIndex!, chapterIndex)}
          >
            {chapter.chapter}
          </Button>
        ))}
      </div>
    </div>
  );
}
