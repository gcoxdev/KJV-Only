import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookOpenCheckIcon, BookOpenIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bookCodeForIndex, iconPath } from "@/lib/reader-view";

type ProgressChapter = {
  chapterIndex: number;
  chapterNumber: number;
  read: boolean;
};

type ProgressBook = {
  name: string;
  bookIndex: number;
  read: number;
  total: number;
  chapters: ProgressChapter[];
};

type ProgressTestament = {
  label: string;
  read: number;
  total: number;
  books: ProgressBook[];
};

type ProgressByTestament = {
  old: ProgressTestament;
  new: ProgressTestament;
  total: { read: number; total: number };
};

type ProgressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalProgressPercent: number;
  progressByTestament: ProgressByTestament;
  onSetAllTestamentChaptersRead: (testament: "old" | "new", read: boolean) => void;
  onSetAllBookChaptersRead: (bookIndex: number, read: boolean) => void;
  onOpenChapterInNewTab: (bookIndex: number, chapterIndex: number) => void;
  onToggleChapterRead: (bookIndex: number, chapterIndex: number) => void;
  onResetAllProgress: () => void;
};

export function ProgressDialog({
  open,
  onOpenChange,
  totalProgressPercent,
  progressByTestament,
  onSetAllTestamentChaptersRead,
  onSetAllBookChaptersRead,
  onOpenChapterInNewTab,
  onToggleChapterRead,
  onResetAllProgress,
}: ProgressDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reading Progress</AlertDialogTitle>
          <AlertDialogDescription>
            Track chapter completion across the whole Bible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="max-h-[65vh] space-y-3 overflow-auto pr-1 text-sm">
          <Progress value={totalProgressPercent} className="w-full">
            <ProgressLabel className="font-semibold">Whole Bible</ProgressLabel>
            <ProgressValue>
              {() =>
                `${progressByTestament.total.read}/${progressByTestament.total.total} (${totalProgressPercent}%)`
              }
            </ProgressValue>
          </Progress>

          <Accordion className="w-full rounded-md border px-3" multiple defaultValue={[]}>
            {[progressByTestament.old, progressByTestament.new].map((testament) => {
              const testamentPercent =
                testament.total > 0
                  ? Math.round((testament.read / testament.total) * 100)
                  : 0;
              const testamentCode = testament.label.startsWith("Old") ? "OT" : "NT";
              const testamentIconSrc = iconPath(
                testamentPercent === 100 ? "color" : "bw",
                testamentCode,
              );

              return (
                <AccordionItem key={testament.label} value={testament.label} className="w-full">
                  <AccordionTrigger className="w-full">
                    <div className="flex w-full items-center gap-3">
                      <img
                        src={testamentIconSrc}
                        alt={`${testament.label} icon`}
                        className="size-10 shrink-0"
                      />
                      <Progress value={testamentPercent} className="w-full">
                        <ProgressLabel>{testament.label}</ProgressLabel>
                        <ProgressValue>
                          {() =>
                            `${testament.read}/${testament.total} (${testamentPercent}%)`
                          }
                        </ProgressValue>
                      </Progress>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <Accordion className="w-full rounded-md border px-2" multiple defaultValue={[]}>
                      {testament.books.map((book) => {
                        const bookPercent =
                          book.total > 0
                            ? Math.round((book.read / book.total) * 100)
                            : 0;
                        const bookIconSrc = iconPath(
                          bookPercent === 100 ? "color" : "bw",
                          bookCodeForIndex(book.bookIndex),
                        );

                        return (
                          <AccordionItem
                            key={book.name}
                            value={`${testament.label}-${book.name}`}
                            className="w-full"
                          >
                            <AccordionTrigger className="w-full px-1">
                              <div className="flex w-full items-center gap-3">
                                <img
                                  src={bookIconSrc}
                                  alt={`${book.name} icon`}
                                  className="size-10 shrink-0"
                                />
                                <Progress value={bookPercent} className="w-full">
                                  <ProgressLabel className="text-xs">{book.name}</ProgressLabel>
                                  <ProgressValue className="text-xs">
                                    {() => `${book.read}/${book.total} (${bookPercent}%)`}
                                  </ProgressValue>
                                </Progress>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-2 px-1">
                              <div className="space-y-1">
                                {book.chapters.map((chapter) => (
                                  <div
                                    key={`${book.name}-${chapter.chapterNumber}`}
                                    className="flex items-center gap-2"
                                  >
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="flex-1 justify-start"
                                      onClick={() =>
                                        onOpenChapterInNewTab(
                                          book.bookIndex,
                                          chapter.chapterIndex,
                                        )
                                      }
                                    >
                                      {`Chapter ${chapter.chapterNumber}`}
                                    </Button>
                                    <Button
                                      variant={chapter.read ? "secondary" : "outline"}
                                      size="sm"
                                      onClick={() =>
                                        onToggleChapterRead(
                                          book.bookIndex,
                                          chapter.chapterIndex,
                                        )
                                      }
                                    >
                                      {chapter.read ? <BookOpenIcon /> : <BookOpenCheckIcon />}
                                      {chapter.read ? "Read" : "Mark Read"}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    onSetAllBookChaptersRead(
                                      book.bookIndex,
                                      book.read !== book.total,
                                    )
                                  }
                                >
                                  {book.read === book.total
                                    ? "Mark all incomplete"
                                    : "Mark all complete"}
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onSetAllTestamentChaptersRead(
                            testamentCode === "OT" ? "old" : "new",
                            testament.read !== testament.total,
                          )
                        }
                      >
                        {testament.read === testament.total
                          ? "Mark testament incomplete"
                          : "Mark testament complete"}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (window.confirm("Reset all reading progress?")) {
                onResetAllProgress();
              }
            }}
          >
            Reset Progress
          </Button>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
