import type { ReaderBookmark } from "@/types/bookmarks";
import type { NoteScope, ReaderNote } from "@/types/notes";

type NotesExportPayload = {
  type: "kjv-reader-notes";
  version: 1;
  exportedAt: string;
  notes: ReaderNote[];
};

type BookmarksExportPayload = {
  type: "kjv-reader-bookmarks";
  version: 1;
  exportedAt: string;
  bookmarks: ReaderBookmark[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidNoteScope(scope: unknown): scope is NoteScope {
  if (!isRecord(scope) || typeof scope.type !== "string") {
    return false;
  }

  if (scope.type === "general") {
    return true;
  }

  if (scope.type === "book") {
    return typeof scope.bookIndex === "number";
  }

  if (scope.type === "chapter") {
    return typeof scope.bookIndex === "number" && typeof scope.chapterIndex === "number";
  }

  if (scope.type === "verse") {
    return (
      typeof scope.bookIndex === "number" &&
      typeof scope.chapterIndex === "number" &&
      typeof scope.verseNumber === "number"
    );
  }

  if (scope.type === "word") {
    return (
      typeof scope.bookIndex === "number" &&
      typeof scope.chapterIndex === "number" &&
      typeof scope.word === "string" &&
      (scope.verseNumber === undefined || typeof scope.verseNumber === "number")
    );
  }

  return false;
}

function isValidReaderNote(note: unknown): note is ReaderNote {
  return (
    isRecord(note) &&
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    typeof note.createdAt === "number" &&
    typeof note.updatedAt === "number" &&
    isValidNoteScope(note.scope)
  );
}

function normalizeLegacyImportedNote(note: ReaderNote): ReaderNote {
  if (note.scope.type === "general") {
    return note;
  }

  if (note.scope.type === "book") {
    return {
      ...note,
      scope: {
        ...note.scope,
        bookIndex: Math.max(0, note.scope.bookIndex - 1),
      },
    };
  }

  return {
    ...note,
    scope: {
      ...note.scope,
      bookIndex: Math.max(0, note.scope.bookIndex - 1),
      chapterIndex: Math.max(0, note.scope.chapterIndex - 1),
    },
  };
}

function looksLikeLegacyOneBasedNotes(notes: ReaderNote[]) {
  const scopedNotes = notes.filter((note) => note.scope.type !== "general");
  if (scopedNotes.length === 0) {
    return false;
  }

  const hasAnyZeroBasedIndex = scopedNotes.some((note) => {
    if (note.scope.type === "book") {
      return note.scope.bookIndex === 0;
    }
    return note.scope.bookIndex === 0 || note.scope.chapterIndex === 0;
  });

  if (hasAnyZeroBasedIndex) {
    return false;
  }

  return scopedNotes.every((note) => {
    if (note.scope.type === "book") {
      return note.scope.bookIndex >= 1;
    }
    return note.scope.bookIndex >= 1 && note.scope.chapterIndex >= 1;
  });
}

function isValidReaderBookmark(bookmark: unknown): bookmark is ReaderBookmark {
  if (
    !isRecord(bookmark) ||
    typeof bookmark.id !== "string" ||
    typeof bookmark.label !== "string" ||
    typeof bookmark.note !== "string" ||
    typeof bookmark.createdAt !== "number" ||
    typeof bookmark.updatedAt !== "number" ||
    !isRecord(bookmark.scope) ||
    typeof bookmark.scope.type !== "string"
  ) {
    return false;
  }

  if (bookmark.scope.type === "chapter") {
    return (
      bookmark.type === "chapter" &&
      typeof bookmark.scope.bookIndex === "number" &&
      typeof bookmark.scope.chapterIndex === "number"
    );
  }

  if (bookmark.scope.type === "verse") {
    return (
      bookmark.type === "verse" &&
      typeof bookmark.scope.bookIndex === "number" &&
      typeof bookmark.scope.chapterIndex === "number" &&
      typeof bookmark.scope.verseNumber === "number"
    );
  }

  if (bookmark.scope.type === "selection") {
    return (
      bookmark.type === "selection" &&
      typeof bookmark.scope.bookIndex === "number" &&
      typeof bookmark.scope.chapterIndex === "number" &&
      Array.isArray(bookmark.scope.ranges) &&
      bookmark.scope.ranges.every(
        (range) =>
          isRecord(range) &&
          typeof range.start === "number" &&
          typeof range.end === "number",
      )
    );
  }

  if (bookmark.scope.type === "range") {
    return (
      bookmark.type === "range" &&
      isRecord(bookmark.scope.start) &&
      isRecord(bookmark.scope.end) &&
      typeof bookmark.scope.start.bookIndex === "number" &&
      typeof bookmark.scope.start.chapterIndex === "number" &&
      typeof bookmark.scope.start.verseNumber === "number" &&
      typeof bookmark.scope.end.bookIndex === "number" &&
      typeof bookmark.scope.end.chapterIndex === "number" &&
      typeof bookmark.scope.end.verseNumber === "number"
    );
  }

  return false;
}

export function createNotesExportPayload(notes: ReaderNote[]): NotesExportPayload {
  return {
    type: "kjv-reader-notes",
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
  };
}

export function createBookmarksExportPayload(
  bookmarks: ReaderBookmark[],
): BookmarksExportPayload {
  return {
    type: "kjv-reader-bookmarks",
    version: 1,
    exportedAt: new Date().toISOString(),
    bookmarks,
  };
}

export function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseImportedNotesPayload(text: string): ReaderNote[] {
  const parsed = JSON.parse(text) as unknown;
  const notes = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.notes)
      ? parsed.notes
      : null;

  if (!notes) {
    throw new Error("Invalid notes file.");
  }

  const validNotes = notes.filter(isValidReaderNote);
  if (validNotes.length !== notes.length) {
    throw new Error("Notes file contains invalid entries.");
  }

  if (looksLikeLegacyOneBasedNotes(validNotes)) {
    return validNotes.map(normalizeLegacyImportedNote);
  }

  return validNotes;
}

export function parseImportedBookmarksPayload(text: string): ReaderBookmark[] {
  const parsed = JSON.parse(text) as unknown;
  const bookmarks = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.bookmarks)
      ? parsed.bookmarks
      : null;

  if (!bookmarks) {
    throw new Error("Invalid bookmarks file.");
  }

  const validBookmarks = bookmarks.filter(isValidReaderBookmark);
  if (validBookmarks.length !== bookmarks.length) {
    throw new Error("Bookmarks file contains invalid entries.");
  }
  return validBookmarks;
}
