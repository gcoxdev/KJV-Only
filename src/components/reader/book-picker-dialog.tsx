import type { Book } from "@/types/bible";
import type { LeafNode } from "@/types/reader";
import { BookChapterPicker } from "@/components/reader/book-chapter-picker";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BookPickerDialogProps = {
  open: boolean;
  books: Book[];
  leaf: LeafNode | null;
  onSelectTestament: (testament: NonNullable<LeafNode["pickerTestament"]>) => void;
  onBackToTestaments: () => void;
  onSelectBook: (bookIndex: number) => void;
  onGoToBookSelection: (testament: NonNullable<LeafNode["pickerTestament"]>) => void;
  onGoToChapterSelection: (
    testament: NonNullable<LeafNode["pickerTestament"]>,
    bookIndex: number,
  ) => void;
  onSelectChapter: (bookIndex: number, chapterIndex: number) => void;
  onClose: () => void;
};

export function BookPickerDialog({
  open,
  books,
  leaf,
  onSelectTestament,
  onBackToTestaments,
  onSelectBook,
  onGoToBookSelection,
  onGoToChapterSelection,
  onSelectChapter,
  onClose,
}: BookPickerDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Choose Book and Chapter</AlertDialogTitle>
        </AlertDialogHeader>
        {leaf ? (
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <BookChapterPicker
              books={books}
              selectedTestament={leaf.pickerTestament}
              selectedBookIndex={leaf.pickerBookIndex}
              currentBookIndex={leaf.bookIndex}
              currentChapterIndex={leaf.chapterIndex}
              onSelectTestament={onSelectTestament}
              onBackToTestaments={onBackToTestaments}
              onSelectBook={onSelectBook}
              onGoToBookSelection={onGoToBookSelection}
              onGoToChapterSelection={onGoToChapterSelection}
              onSelectChapter={onSelectChapter}
            />
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
