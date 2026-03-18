import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Code2Icon,
  ExpandIcon,
  MinimizeIcon,
  PanelTopIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import type { SerializedEditorState } from "lexical";

import { Editor } from "@/components/blocks/editor-00/editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Book } from "@/types/bible";
import type { BookmarkScope } from "@/types/bookmarks";
import { contextLabel, noteMatchesContext, noteScopeLabel } from "@/lib/notes";
import { parseNoteLinkHref } from "@/lib/note-links";
import type {
  NoteLinkTarget,
  NotesContext,
  NotesTabFilter,
  NotesTabState,
  NoteScope,
  ReaderNote,
} from "@/types/notes";

type NotesPageProps = {
  books: Book[];
  notes: ReaderNote[];
  context: NotesContext | null;
  selectedHighlightScope: BookmarkScope | null;
  tabState: NotesTabState | null;
  onTabStateChange: (patch: Partial<NotesTabState>) => void;
  onCreateGeneralNote: () => string;
  onCreateContextNote: (context: NotesContext | null) => string | null;
  onUpdateNote: (
    noteId: string,
    patch: Partial<Pick<ReaderNote, "title" | "body" | "scope">>,
  ) => void;
  onDeleteNote: (noteId: string) => void;
  onOpenNoteLink: (target: NoteLinkTarget) => void;
};

function createPlainTextSerializedState(text: string): SerializedEditorState {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

function parseSerializedState(body: string): SerializedEditorState | undefined {
  if (!body.trim()) {
    return undefined;
  }
  try {
    return JSON.parse(body) as SerializedEditorState;
  } catch {
    return createPlainTextSerializedState(body);
  }
}

function isNewNote(note: ReaderNote) {
  return !note.body.trim();
}

function formatNoteDateTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function toChapterScope(note: ReaderNote, context: NotesContext | null): NoteScope | null {
  if (note.scope.type === "general") {
    if (!context) {
      return null;
    }
    return {
      type: "chapter",
      bookIndex: context.bookIndex,
      chapterIndex: context.chapterIndex,
    };
  }

  if (note.scope.type === "book") {
    return {
      type: "chapter",
      bookIndex: note.scope.bookIndex,
      chapterIndex: 0,
    };
  }

  return {
    type: "chapter",
    bookIndex: note.scope.bookIndex,
    chapterIndex: note.scope.chapterIndex,
  };
}

function scopeSummary(scope: NoteScope, books: Book[]) {
  return scope.type === "general" ? "General" : `Context - ${noteScopeLabel(scope, books)}`;
}

function scopeFromContext(context: NotesContext | null): NoteScope | null {
  if (!context) {
    return null;
  }
  if (context.word) {
    return {
      type: "word",
      bookIndex: context.bookIndex,
      chapterIndex: context.chapterIndex,
      verseNumber: context.verseNumber,
      word: context.word,
    };
  }
  if (context.verseNumber) {
    return {
      type: "verse",
      bookIndex: context.bookIndex,
      chapterIndex: context.chapterIndex,
      verseNumber: context.verseNumber,
    };
  }
  return {
    type: "chapter",
    bookIndex: context.bookIndex,
    chapterIndex: context.chapterIndex,
  };
}

function serializedStateToBody(editorSerializedState: SerializedEditorState | undefined) {
  return JSON.stringify(editorSerializedState ?? createPlainTextSerializedState(""));
}

export function NotesPage({
  books,
  notes,
  context,
  selectedHighlightScope,
  tabState,
  onTabStateChange,
  onCreateGeneralNote,
  onCreateContextNote,
  onUpdateNote,
  onDeleteNote,
  onOpenNoteLink,
}: NotesPageProps) {
  const filter: NotesTabFilter = tabState?.filter ?? "all";
  const selectedNoteId = tabState?.selectedNoteId ?? null;
  const pageContext = context ?? tabState?.context ?? null;

  const filteredNotes = useMemo(() => {
    if (filter === "general") {
      return notes.filter((note) => note.scope.type === "general");
    }
    if (filter === "context") {
      return notes.filter(
        (note) => note.scope.type !== "general" && noteMatchesContext(note, pageContext),
      );
    }
    return notes;
  }, [filter, notes, pageContext]);

  const selectedNote =
    filteredNotes.find((note) => note.id === selectedNoteId) ??
    notes.find((note) => note.id === selectedNoteId) ??
    null;

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState<SerializedEditorState | undefined>(undefined);
  const [draftSourceBody, setDraftSourceBody] = useState("");
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isNotesListCollapsed, setIsNotesListCollapsed] = useState(false);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [showEditorTools, setShowEditorTools] = useState(true);
  const [isCompactLayout, setIsCompactLayout] = useState(false);
  const [pageElement, setPageElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!selectedNote) {
      setIsEditing(false);
      setDraftTitle("");
      setDraftBody(undefined);
      setDraftSourceBody("");
      setIsSourceMode(false);
      return;
    }

    const nextDraftBody = parseSerializedState(selectedNote.body);
    setDraftTitle(selectedNote.title);
    setDraftBody(nextDraftBody);
    setDraftSourceBody(selectedNote.body);
    setIsEditing(isNewNote(selectedNote));
    setIsSourceMode(false);
  }, [selectedNote?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const element = pageElement;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setIsCompactLayout(width < 1024);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [pageElement]);

  useEffect(() => {
    if (isCompactLayout) {
      setIsNotesListCollapsed(Boolean(selectedNote));
      return;
    }

    setIsNotesListCollapsed(false);
  }, [isCompactLayout, selectedNote]);

  const serializedDraftBody = useMemo(
    () => serializedStateToBody(draftBody),
    [draftBody],
  );

  const hasDraftChanges =
    selectedNote !== null &&
    (draftTitle !== selectedNote.title ||
      (isSourceMode ? draftSourceBody : serializedDraftBody) !== selectedNote.body);

  const sourceModeButtonLabel = isSourceMode ? "Show rich text editor" : "Show note source";

  const saveCurrentNote = () => {
    if (!selectedNote) {
      return;
    }

    const nextBody = isSourceMode ? draftSourceBody : serializedDraftBody;
    onUpdateNote(selectedNote.id, {
      title: draftTitle,
      body: nextBody,
    });
    setIsEditing(false);
    setIsSourceMode(false);
  };

  const cancelEditing = () => {
    if (!selectedNote) {
      return;
    }
    const nextDraftBody = parseSerializedState(selectedNote.body);
    setDraftTitle(selectedNote.title);
    setDraftBody(nextDraftBody);
    setDraftSourceBody(selectedNote.body);
    setIsEditing(false);
    setIsSourceMode(false);
    setShowEditorTools(true);
  };

  const toggleSourceMode = () => {
    setIsSourceMode((current) => {
      const next = !current;
      if (next) {
        setDraftSourceBody(isEditing ? serializedDraftBody : selectedNote?.body ?? "");
      } else if (isEditing) {
        setDraftBody(parseSerializedState(draftSourceBody));
      }
      return next;
    });
  };

  return (
    <div
      ref={setPageElement}
      className={cn(
        "grid h-full min-h-0 gap-3 p-2",
        isCompactLayout ? "grid-cols-1" : "grid-cols-[22rem_minmax(0,1fr)]",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col rounded-md border",
          isNotesListCollapsed && "hidden",
          !isCompactLayout && "flex",
        )}
      >
        <div className="space-y-2 border-b p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Notes</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(!isCompactLayout && "hidden")}
              onClick={() => setIsNotesListCollapsed(true)}
            >
              Hide List
              <ChevronUpIcon />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{contextLabel(pageContext, books)}</p>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => onTabStateChange({ filter: "all" })}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "general" ? "default" : "outline"}
              onClick={() => onTabStateChange({ filter: "general" })}
            >
              General
            </Button>
            <Button
              size="sm"
              variant={filter === "context" ? "default" : "outline"}
              onClick={() => onTabStateChange({ filter: "context" })}
            >
              Context
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const noteId = onCreateGeneralNote();
                onTabStateChange({ selectedNoteId: noteId, filter: "general" });
              }}
            >
              <PlusIcon />
              New General
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const noteId = onCreateContextNote(pageContext);
                if (!noteId) {
                  return;
                }
                onTabStateChange({ selectedNoteId: noteId, filter: "context" });
              }}
              disabled={!pageContext}
            >
              <PlusIcon />
              New Context
            </Button>
          </div>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="divide-y">
            {filteredNotes.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={cn(
                    "block w-full px-3 py-2 text-left text-foreground hover:bg-muted/50 hover:text-foreground",
                    note.id === selectedNoteId && "bg-muted",
                  )}
                  onClick={() => onTabStateChange({ selectedNoteId: note.id })}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">
                      {note.title || "Untitled note"}
                    </p>
                    {note.scope.type !== "general" ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {noteScopeLabel(note.scope, books)}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatNoteDateTime(note.createdAt)}
                    {note.updatedAt !== note.createdAt
                      ? ` • Modified ${formatNoteDateTime(note.updatedAt)}`
                      : ""}
                  </p>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-col rounded-md border",
          isEditorFullscreen &&
            "fixed inset-2 z-50 rounded-xl border bg-background shadow-2xl",
        )}
      >
        {selectedNote ? (
          <>
            <div className="border-b p-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className={cn(!isCompactLayout && "hidden")}
                  onClick={() => setIsNotesListCollapsed((current) => !current)}
                  aria-label={isNotesListCollapsed ? "Show notes list" : "Hide notes list"}
                >
                  {isNotesListCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
                </Button>
                {isEditing ? (
                  <Input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.currentTarget.value)}
                    placeholder="Note title"
                  />
                ) : (
                  <div className="min-w-0 flex-1 truncate rounded-md border px-3 py-2 text-sm">
                    {selectedNote.title || "Untitled note"}
                  </div>
                )}
                <Button
                  type="button"
                  variant={isSourceMode ? "default" : "outline"}
                  size="icon-sm"
                  onClick={toggleSourceMode}
                  aria-label={sourceModeButtonLabel}
                  title={sourceModeButtonLabel}
                >
                  <Code2Icon />
                </Button>
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant={showEditorTools ? "default" : "outline"}
                      size="icon-sm"
                      onClick={() => setShowEditorTools((current) => !current)}
                      aria-label={showEditorTools ? "Hide rich text tools" : "Show rich text tools"}
                    >
                      <PanelTopIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setIsEditorFullscreen((current) => !current)}
                      aria-label={isEditorFullscreen ? "Exit fullscreen note editor" : "Enter fullscreen note editor"}
                    >
                      {isEditorFullscreen ? <MinimizeIcon /> : <ExpandIcon />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={saveCurrentNote}
                      disabled={!hasDraftChanges}
                      aria-label="Save note"
                    >
                      <SaveIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={cancelEditing}
                      aria-label="Cancel editing"
                    >
                      <XIcon />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setIsEditorFullscreen((current) => !current)}
                      aria-label={isEditorFullscreen ? "Exit fullscreen note editor" : "Enter fullscreen note editor"}
                    >
                      {isEditorFullscreen ? <MinimizeIcon /> : <ExpandIcon />}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => {
                        setIsEditing(true);
                        setDraftSourceBody(selectedNote.body);
                        setShowEditorTools(true);
                      }}
                      aria-label="Edit note"
                    >
                      <PencilIcon />
                    </Button>
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button type="button" variant="outline" size="icon-sm" aria-label="Delete note" />}
                  >
                    <Trash2Icon />
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => {
                          onDeleteNote(selectedNote.id);
                          onTabStateChange({ selectedNoteId: null });
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Type:</span>{" "}
                  {scopeSummary(selectedNote.scope, books)}
                </p>
                {isEditing ? (
                  <>
                    {selectedNote.scope.type === "verse" ||
                    selectedNote.scope.type === "word" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-1.5 text-[11px]"
                        onClick={() => {
                          const nextScope = toChapterScope(selectedNote, pageContext);
                          if (!nextScope) {
                            return;
                          }
                          onUpdateNote(selectedNote.id, { scope: nextScope });
                        }}
                        disabled={!toChapterScope(selectedNote, pageContext)}
                      >
                        Convert to Chapter
                      </Button>
                    ) : null}
                    {selectedNote.scope.type === "general" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-1.5 text-[11px]"
                        onClick={() => {
                          const nextScope = scopeFromContext(pageContext);
                          if (!nextScope) {
                            return;
                          }
                          onUpdateNote(selectedNote.id, { scope: nextScope });
                        }}
                        disabled={!scopeFromContext(pageContext)}
                      >
                        Convert to Context
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-1.5 text-[11px]"
                        onClick={() => onUpdateNote(selectedNote.id, { scope: { type: "general" } })}
                      >
                        Convert to General
                      </Button>
                    )}
                  </>
                ) : null}
              </div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  <span className="font-medium text-foreground">Created:</span>{" "}
                  {formatNoteDateTime(selectedNote.createdAt)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Updated:</span>{" "}
                  {formatNoteDateTime(selectedNote.updatedAt)}
                </p>
              </div>
            </div>
            <div className="min-h-0 flex-1 p-2">
              {isSourceMode ? (
                <Textarea
                  className="h-full min-h-full resize-none font-mono text-xs"
                  readOnly={!isEditing}
                  value={isEditing ? draftSourceBody : selectedNote.body}
                  onChange={(event) => setDraftSourceBody(event.currentTarget.value)}
                />
              ) : (
                <Editor
                  key={`${selectedNote.id}-${isEditing ? "edit" : "view"}`}
                  editorSerializedState={
                    isEditing ? draftBody : parseSerializedState(selectedNote.body)
                  }
                  readOnly={!isEditing}
                  showToolbar={isEditing && showEditorTools}
                  autoFocus={isEditing}
                  internalLinking={{
                    books,
                    mode: "notes",
                    context: pageContext,
                    highlightScope: selectedHighlightScope,
                  }}
                  onInternalLinkClick={(href) => {
                    const target = parseNoteLinkHref(href);
                    if (target) {
                      onOpenNoteLink(target);
                    }
                  }}
                  onSerializedChange={(editorSerializedState) => {
                    if (isEditing) {
                      setDraftBody(editorSerializedState);
                      setDraftSourceBody(JSON.stringify(editorSerializedState));
                    }
                  }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-2 p-3 text-sm text-muted-foreground">
            <span>Select a note or create one.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(!isCompactLayout && "hidden")}
              onClick={() => setIsNotesListCollapsed(false)}
            >
              Show List
              <ChevronDownIcon />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
