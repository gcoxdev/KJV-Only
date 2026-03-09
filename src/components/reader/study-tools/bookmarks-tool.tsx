import { useMemo, useState } from "react";
import {
  BookmarkIcon,
  Edit3Icon,
  Trash2Icon,
} from "lucide-react";

import type { Book } from "@/types/bible";
import type { BookmarkPoint, ReaderBookmark } from "@/types/bookmarks";
import {
  bookmarkScopeLabel,
} from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BookmarksToolProps = {
  books: Book[];
  bookmarks: ReaderBookmark[];
  bookmarkModeEnabled: boolean;
  pendingRangeStart: BookmarkPoint | null;
  currentChapter: { bookIndex: number; chapterIndex: number } | null;
  onToggleBookmarkMode: () => void;
  onCreateChapterBookmark: (bookIndex: number, chapterIndex: number) => void;
  onOpenBookmark: (bookmark: ReaderBookmark) => void;
  onUpdateBookmark: (bookmarkId: string, patch: Partial<Pick<ReaderBookmark, "label" | "note">>) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
};

function formatRangeStart(point: BookmarkPoint, books: Book[]) {
  const bookName = books[point.bookIndex]?.name ?? `Book ${point.bookIndex + 1}`;
  return `${bookName} ${point.chapterIndex + 1}:${point.verseNumber}`;
}

export function BookmarksTool({
  books,
  bookmarks,
  bookmarkModeEnabled,
  pendingRangeStart,
  currentChapter,
  onToggleBookmarkMode,
  onCreateChapterBookmark,
  onOpenBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
}: BookmarksToolProps) {
  const sortedBookmarks = useMemo(
    () => [...bookmarks].sort((a, b) => b.updatedAt - a.updatedAt),
    [bookmarks],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingBookmark = useMemo(
    () => sortedBookmarks.find((bookmark) => bookmark.id === editingId) ?? null,
    [editingId, sortedBookmarks],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={bookmarkModeEnabled ? "default" : "outline"}
          onClick={onToggleBookmarkMode}
        >
          <BookmarkIcon />
          {bookmarkModeEnabled ? "Bookmark Mode: On" : "Bookmark Mode: Off"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!currentChapter}
          onClick={() => {
            if (!currentChapter) {
              return;
            }
            onCreateChapterBookmark(currentChapter.bookIndex, currentChapter.chapterIndex);
          }}
        >
          + Chapter
        </Button>
      </div>

      {pendingRangeStart ? (
        <p className="text-xs text-muted-foreground">
          Range start selected at {formatRangeStart(pendingRangeStart, books)}. Navigate and tap another verse to finish.
        </p>
      ) : null}

      <Separator />

      {sortedBookmarks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
      ) : (
        <div className="space-y-2">
          {sortedBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="rounded-md border p-2">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left hover:bg-muted/30"
                  onClick={() => onOpenBookmark(bookmark)}
                >
                  <p className="truncate text-sm font-medium">
                    {bookmarkScopeLabel(bookmark.scope, books)}
                  </p>
                  <p className="line-clamp-2 pt-1 text-xs text-muted-foreground">
                    {bookmark.note.trim() || "No note"}
                  </p>
                </button>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(bookmark.id);
                      setDraftLabel(bookmark.label);
                      setDraftNote(bookmark.note);
                    }}
                    aria-label={`Edit ${bookmark.label}`}
                  >
                    <Edit3Icon />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setDeletingId(bookmark.id)}
                    aria-label={`Delete ${bookmark.label}`}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(editingBookmark)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
            <DialogDescription>Update the bookmark label or note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={draftLabel}
              onChange={(event) => setDraftLabel(event.target.value)}
              placeholder="Bookmark label"
              maxLength={120}
            />
            <Textarea
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="Optional note"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!editingBookmark) {
                  return;
                }
                const nextLabel = draftLabel.trim();
                if (!nextLabel) {
                  return;
                }
                onUpdateBookmark(editingBookmark.id, {
                  label: nextLabel,
                  note: draftNote.trim(),
                });
                setEditingId(null);
              }}
              disabled={!draftLabel.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete bookmark?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deletingId) {
                  return;
                }
                onDeleteBookmark(deletingId);
                setDeletingId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
