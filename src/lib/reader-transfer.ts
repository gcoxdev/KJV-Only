import type { ReaderBookmark } from "@/types/bookmarks";
import type { NoteScope, ReaderNote } from "@/types/notes";

type NonGeneralNoteScope = Exclude<NoteScope, { type: "general" }>;
type ScopedReaderNote = ReaderNote & { scope: NonGeneralNoteScope };

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

export type ImportParseResult<T> = {
  entries: T[];
  totalEntries: number;
  skippedInvalidCount: number;
  source: "array" | "wrapped";
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
  const scopedNotes = notes.filter(
    (note): note is ScopedReaderNote => note.scope.type !== "general",
  );
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

function parseImportArrayPayload(
  text: string,
  key: "notes" | "bookmarks",
): {
  entries: unknown[];
  source: "array" | "wrapped";
} {
  const parsed = JSON.parse(text) as unknown;
  const entries = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed[key])
      ? parsed[key]
      : null;

  if (!entries) {
    throw new Error(`Invalid ${key} file.`);
  }

  if (entries.length === 0) {
    throw new Error(`The ${key} file does not contain any entries.`);
  }

  return {
    entries,
    source: Array.isArray(parsed) ? "array" : "wrapped",
  };
}

export function parseImportedNotesPayloadDetailed(
  text: string,
): ImportParseResult<ReaderNote> {
  const { entries, source } = parseImportArrayPayload(text, "notes");
  const validNotes = entries.filter(isValidReaderNote);
  const skippedInvalidCount = entries.length - validNotes.length;

  if (validNotes.length === 0) {
    throw new Error("The notes file does not contain any valid entries.");
  }

  const normalizedNotes = looksLikeLegacyOneBasedNotes(validNotes)
    ? validNotes.map(normalizeLegacyImportedNote)
    : validNotes;

  return {
    entries: normalizedNotes,
    totalEntries: entries.length,
    skippedInvalidCount,
    source,
  };
}

export function parseImportedNotesPayload(text: string): ReaderNote[] {
  return parseImportedNotesPayloadDetailed(text).entries;
}

export function parseImportedBookmarksPayloadDetailed(
  text: string,
): ImportParseResult<ReaderBookmark> {
  const { entries, source } = parseImportArrayPayload(text, "bookmarks");
  const validBookmarks = entries.filter(isValidReaderBookmark);
  const skippedInvalidCount = entries.length - validBookmarks.length;

  if (validBookmarks.length === 0) {
    throw new Error("The bookmarks file does not contain any valid entries.");
  }

  return {
    entries: validBookmarks,
    totalEntries: entries.length,
    skippedInvalidCount,
    source,
  };
}

export function parseImportedBookmarksPayload(text: string): ReaderBookmark[] {
  return parseImportedBookmarksPayloadDetailed(text).entries;
}
