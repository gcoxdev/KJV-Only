import { OrganizationBadges, OrganizationFields, OrganizationFilters } from '@/components/reader/study-organization';
import { matchesOrganization, organizationError, parseTags } from '@/lib/study-organization';
import { useId, useMemo, useState } from "react";
import {
  Edit3Icon,
  Trash2Icon,
} from "lucide-react";

import type { Book } from "@/types/bible";
import type { ReaderBookmark } from "@/types/bookmarks";
import {
  bookmarkScopeLabel,
} from "@/lib/bookmarks";
import { Button } from "@/components/ui/button";
import { parseBookmarkLocation } from "@/lib/reference-command";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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

export type BookmarksToolProps = {
  books: Book[];
  bookmarks: ReaderBookmark[];
  onOpenBookmark: (bookmark: ReaderBookmark) => void;
  onUpdateBookmark: (bookmarkId: string, patch: Partial<Pick<ReaderBookmark, "label" | "note" | "folder" | "tags" | "scope">>) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
};

export function BookmarksTool({
  books,
  bookmarks,
  onOpenBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
}: BookmarksToolProps) {
  const sortedBookmarks = useMemo(
    () => [...bookmarks].sort((a, b) => b.updatedAt - a.updatedAt),
    [bookmarks],
  );
  const fieldId = useId();
  const [draftLocation, setDraftLocation] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [folderFilter, setFolderFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [draftFolder, setDraftFolder] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const filteredBookmarks = sortedBookmarks.filter((item) => matchesOrganization(item, folderFilter, tagFilter));
  const [draftLabel, setDraftLabel] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingBookmark = useMemo(
    () => sortedBookmarks.find((bookmark) => bookmark.id === editingId) ?? null,
    [editingId, sortedBookmarks],
  );

  const locationChanged = editingBookmark !== null && draftLocation.trim() !== bookmarkScopeLabel(editingBookmark.scope, books);
  const nextScope = useMemo(() => locationChanged ? parseBookmarkLocation(draftLocation, books) : editingBookmark?.scope ?? null,
    [books, draftLocation, editingBookmark, locationChanged]);
  const locationError = editingBookmark && !nextScope ? "Enter a valid chapter, verse, verse selection, or continuous passage range." : null;

  return (
    <div className="flex flex-col gap-3">
      <OrganizationFilters className="px-0" items={bookmarks} folder={folderFilter} tag={tagFilter} onFolderChange={setFolderFilter} onTagChange={setTagFilter} />
      {filteredBookmarks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{bookmarks.length ? "No bookmarks match these filters." : "No bookmarks yet."}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="rounded-md border p-2">
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left hover:bg-muted/30"
                  onClick={() => onOpenBookmark(bookmark)}
                >
                  <p className="truncate text-sm font-medium">
                    {bookmark.label.trim() || bookmarkScopeLabel(bookmark.scope, books)}
                  </p>
                  <p className="text-xs text-muted-foreground">Location: {bookmarkScopeLabel(bookmark.scope, books)}</p>
                  <OrganizationBadges item={bookmark} />
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
                      setDraftLocation(bookmarkScopeLabel(bookmark.scope, books));
                      setDraftFolder(bookmark.folder ?? "");
                      setDraftTags((bookmark.tags ?? []).join(", "));
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
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
            <DialogDescription>Edit the display label and the Bible passage this bookmark opens.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-label`}>Bookmark label</FieldLabel>
              <Input id={`${fieldId}-label`} value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} placeholder="Bookmark label" maxLength={120} />
              <FieldDescription>A display name for this bookmark.</FieldDescription>
            </Field>
            <Field data-invalid={Boolean(locationError)}>
              <FieldLabel htmlFor={`${fieldId}-location`}>Bookmark location</FieldLabel>
              <Input id={`${fieldId}-location`} value={draftLocation} onChange={(event) => setDraftLocation(event.target.value)} maxLength={500} aria-invalid={Boolean(locationError)} aria-describedby={`${fieldId}-location-help`} />
              {locationError ? <FieldError id={`${fieldId}-location-help`}>{locationError}</FieldError> :
                <FieldDescription id={`${fieldId}-location-help`}>Opens {nextScope ? bookmarkScopeLabel(nextScope, books) : "the selected passage"}.</FieldDescription>}
            </Field>
            <Field>
              <FieldLabel htmlFor={`${fieldId}-note`}>Note</FieldLabel>
              <Textarea id={`${fieldId}-note`} value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Optional note" rows={4} />
            </Field>
          </FieldGroup>
          <OrganizationFields folder={draftFolder} tagsText={draftTags} onFolderChange={setDraftFolder} onTagsChange={setDraftTags} items={bookmarks} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!editingBookmark || !nextScope) {
                  return;
                }
                const nextLabel = draftLabel.trim();
                if (!nextLabel) {
                  return;
                }
                onUpdateBookmark(editingBookmark.id, {
                  label: nextLabel,
                  ...(locationChanged ? { scope: nextScope } : {}),
                  note: draftNote.trim(),
                  folder: draftFolder.trim(),
                  tags: parseTags(draftTags),
                });
                setEditingId(null);
              }}
              disabled={!draftLabel.trim() || !nextScope || Boolean(organizationError(draftFolder, draftTags))}
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
