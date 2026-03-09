import { BookOpenTextIcon, PlusIcon } from "lucide-react";

import type { Book } from "@/types/bible";
import type { NotesContext, ReaderNote } from "@/types/notes";
import { contextLabel, noteScopeLabel } from "@/lib/notes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type NotesToolProps = {
  books: Book[];
  generalNotes: ReaderNote[];
  contextNotes: ReaderNote[];
  context: NotesContext | null;
  onOpenNotesTab: (noteId?: string | null) => void;
  onCreateGeneralNote: () => void;
  onCreateContextNote: () => void;
  onSetChapterContext: () => void;
};

export function NotesTool({
  books,
  generalNotes,
  contextNotes,
  context,
  onOpenNotesTab,
  onCreateGeneralNote,
  onCreateContextNote,
  onSetChapterContext,
}: NotesToolProps) {
  const canSetChapterContext = Boolean(context && (context.verseNumber || context.word));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onOpenNotesTab()}>
          <BookOpenTextIcon />
          Open Notes
        </Button>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">GENERAL</p>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={onCreateGeneralNote}
          >
            <PlusIcon />
            New General
          </Button>
        </div>
        {generalNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No general notes.</p>
        ) : (
          generalNotes.slice(0, 5).map((note) => (
            <button
              key={note.id}
              type="button"
              className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm text-foreground hover:bg-muted/50 hover:text-foreground"
              onClick={() => onOpenNotesTab(note.id)}
            >
              <span className="truncate">{note.title || "Untitled note"}</span>
            </button>
          ))
        )}
      </div>

      <Separator />

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground">CONTEXT</p>
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={onCreateContextNote}
            disabled={!context}
          >
            <PlusIcon />
            New Context
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{contextLabel(context, books)}</p>
          {canSetChapterContext ? (
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs"
              onClick={onSetChapterContext}
            >
              Set to Chapter
            </Button>
          ) : null}
        </div>
        {contextNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes for current context.</p>
        ) : (
          contextNotes.slice(0, 8).map((note) => (
            <button
              key={note.id}
              type="button"
              className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm text-foreground hover:bg-muted/50 hover:text-foreground"
              onClick={() => onOpenNotesTab(note.id)}
            >
              <span className="truncate">{note.title || "Untitled note"}</span>
              <span className="truncate pl-2 text-xs text-muted-foreground">
                {noteScopeLabel(note.scope, books)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
