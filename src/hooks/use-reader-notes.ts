import { useCallback, useEffect, useMemo, useState } from "react";

import { migrateNoteBodyInternalLinks } from "@/lib/note-links";
import { noteMatchesContext } from "@/lib/notes";
import { createId, findLeafNode, collectLeafIds } from "@/lib/reader-layout";
import type { NotesContext, NotesTabState, ReaderNote } from "@/types/notes";
import type { ReaderTab } from "@/types/reader";

type UseReaderNotesArgs = {
  activeTab: ReaderTab | null;
};

function contextFromScope(scope: ReaderNote["scope"]): NotesContext | null {
  if (scope.type === "general") {
    return null;
  }
  if (scope.type === "book") {
    return {
      bookIndex: scope.bookIndex,
      chapterIndex: 0,
    };
  }
  if (scope.type === "chapter") {
    return {
      bookIndex: scope.bookIndex,
      chapterIndex: scope.chapterIndex,
    };
  }
  if (scope.type === "verse") {
    return {
      bookIndex: scope.bookIndex,
      chapterIndex: scope.chapterIndex,
      verseNumber: scope.verseNumber,
    };
  }
  return {
    bookIndex: scope.bookIndex,
    chapterIndex: scope.chapterIndex,
    verseNumber: scope.verseNumber,
    word: scope.word,
  };
}

export function useReaderNotes({ activeTab }: UseReaderNotesArgs) {
  const [readerNotes, setReaderNotes] = useState<ReaderNote[]>([]);
  const [notesContext, setNotesContext] = useState<NotesContext | null>(null);
  const [notesTabStateByLeafId, setNotesTabStateByLeafId] = useState<
    Record<string, NotesTabState>
  >({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("kjv-reader-notes-v1");
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as ReaderNote[];
      if (!Array.isArray(parsed)) {
        return;
      }
      setReaderNotes(
        parsed.map((note) => ({
          ...note,
          body: migrateNoteBodyInternalLinks(note.body),
        })),
      );
    } catch {
      // Ignore invalid stored notes payloads.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("kjv-reader-notes-v1", JSON.stringify(readerNotes));
    } catch {
      // Ignore persistence errors (quota/private mode edge cases).
    }
  }, [readerNotes]);

  useEffect(() => {
    if (!activeTab) {
      return;
    }
    const readerLeafId = collectLeafIds(activeTab.root).find((leafId) => {
      const leaf = findLeafNode(activeTab.root, leafId);
      return leaf?.view === "reader";
    });
    if (!readerLeafId) {
      return;
    }
    const leaf = findLeafNode(activeTab.root, readerLeafId);
    if (!leaf) {
      return;
    }
    setNotesContext((current) => {
      if (
        current?.bookIndex === leaf.bookIndex &&
        current.chapterIndex === leaf.chapterIndex
      ) {
        return current;
      }
      return {
        bookIndex: leaf.bookIndex,
        chapterIndex: leaf.chapterIndex,
      };
    });
  }, [activeTab]);

  const createGeneralNote = useCallback(() => {
    const noteId = createId();
    const now = Date.now();
    setReaderNotes((current) => [
      {
        id: noteId,
        title: "General note",
        body: "",
        scope: { type: "general" },
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    return noteId;
  }, []);

  const createContextNote = useCallback((context: NotesContext | null) => {
    if (!context) {
      return null;
    }
    const noteId = createId();
    const now = Date.now();
    const scope = context.word
      ? {
          type: "word" as const,
          bookIndex: context.bookIndex,
          chapterIndex: context.chapterIndex,
          verseNumber: context.verseNumber,
          word: context.word,
        }
      : context.verseNumber
        ? {
            type: "verse" as const,
            bookIndex: context.bookIndex,
            chapterIndex: context.chapterIndex,
            verseNumber: context.verseNumber,
          }
        : {
            type: "chapter" as const,
            bookIndex: context.bookIndex,
            chapterIndex: context.chapterIndex,
          };
    setReaderNotes((current) => [
      {
        id: noteId,
        title: "Context note",
        body: "",
        scope,
        createdAt: now,
        updatedAt: now,
      },
      ...current,
    ]);
    return noteId;
  }, []);

  const updateNote = useCallback(
    (noteId: string, patch: Partial<Pick<ReaderNote, "title" | "body" | "scope">>) => {
      const now = Date.now();
      setReaderNotes((current) =>
        current.map((note) =>
          note.id === noteId ? { ...note, ...patch, updatedAt: now } : note,
        ),
      );
    },
    [],
  );

  const deleteNote = useCallback((noteId: string) => {
    setReaderNotes((current) => current.filter((note) => note.id !== noteId));
  }, []);

  const importNotes = useCallback((importedNotes: ReaderNote[]) => {
    setReaderNotes((current) => {
      const merged = new Map<string, ReaderNote>();
      for (const note of current) {
        merged.set(note.id, note);
      }
      for (const note of importedNotes) {
        merged.set(note.id, {
          ...note,
          body: migrateNoteBodyInternalLinks(note.body),
        });
      }
      return [...merged.values()].sort((a, b) => b.updatedAt - a.updatedAt);
    });

    const importedScopedNotes = importedNotes.filter((note) => note.scope.type !== "general");
    if (importedScopedNotes.length === 0) {
      return;
    }

    setNotesContext((current) => {
      const currentMatchesImported = importedScopedNotes.some((note) =>
        noteMatchesContext(note, current),
      );
      if (currentMatchesImported) {
        return current;
      }
      return contextFromScope(importedScopedNotes[0].scope) ?? current;
    });
  }, []);

  const changeNotesTabState = useCallback(
    (leafId: string, patch: Partial<NotesTabState>) => {
      setNotesTabStateByLeafId((current) => ({
        ...current,
        [leafId]: {
          selectedNoteId: current[leafId]?.selectedNoteId ?? null,
          filter: current[leafId]?.filter ?? "all",
          context: current[leafId]?.context ?? notesContext,
          ...patch,
        },
      }));
    },
    [notesContext],
  );

  const initializeNotesTabState = useCallback(
    (leafId: string, state: NotesTabState) => {
      setNotesTabStateByLeafId((current) => ({
        ...current,
        [leafId]: state,
      }));
    },
    [],
  );

  const generalNotes = useMemo(
    () =>
      readerNotes
        .filter((note) => note.scope.type === "general")
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [readerNotes],
  );

  const contextNotes = useMemo(
    () =>
      readerNotes
        .filter(
          (note) =>
            note.scope.type !== "general" &&
            noteMatchesContext(note, notesContext),
        )
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notesContext, readerNotes],
  );

  return {
    readerNotes,
    notesContext,
    setNotesContext,
    notesTabStateByLeafId,
    createGeneralNote,
    createContextNote,
    updateNote,
    deleteNote,
    importNotes,
    changeNotesTabState,
    initializeNotesTabState,
    generalNotes,
    contextNotes,
  };
}
