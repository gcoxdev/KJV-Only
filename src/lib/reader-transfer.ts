import type { ReaderBookmark } from "@/types/bookmarks";
import type { NoteScope, ReaderNote } from "@/types/notes";
import { isSafeUrl } from "@/lib/url-policy";

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

export const READER_TRANSFER_LIMITS = {
  maxFileBytes: 8 * 1024 * 1024,
  maxEntries: 5_000,
  maxIdLength: 256,
  maxTitleLength: 1_000,
  maxBodyLength: 2 * 1024 * 1024,
  maxLabelLength: 2_000,
  maxBookmarkNoteLength: 256 * 1024,
  maxWordLength: 256,
  maxSelectionRanges: 1_000,
  maxEditorNodes: 20_000,
  maxEditorDepth: 64,
} as const;

const MAX_DATE_TIMESTAMP = 8_640_000_000_000_000;
const EDITOR_ELEMENT_TYPES = new Set([
  "root",
  "paragraph",
  "heading",
  "quote",
  "list",
  "listitem",
  "link",
  "autolink",
  "kjv-link",
]);
const EDITOR_LEAF_TYPES = new Set(["text", "linebreak", "tab"]);
const EDITOR_NODE_TYPES = new Set([
  ...EDITOR_ELEMENT_TYPES,
  ...EDITOR_LEAF_TYPES,
]);
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const LIST_TYPES = new Set(["bullet", "number", "check"]);

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isSafeIndex(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function isSafePositiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

export function isValidReaderTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isSafeInteger(value) &&
    Math.abs(value) <= MAX_DATE_TIMESTAMP
  );
}

export function assertReaderImportFileSize(size: number) {
  if (!Number.isFinite(size) || size < 0 || size > READER_TRANSFER_LIMITS.maxFileBytes) {
    throw new Error(
      `Import files must be ${READER_TRANSFER_LIMITS.maxFileBytes / 1024 / 1024} MB or smaller.`,
    );
  }
}

function hasSafeOptionalString(value: unknown, maxLength: number) {
  return value === undefined || value === null || isBoundedString(value, maxLength);
}

function hasSafeLinkAttributes(node: Record<string, unknown>) {
  if (!isBoundedString(node.url, 4_096) || !isSafeUrl(node.url)) {
    return false;
  }
  if (!hasSafeOptionalString(node.rel, 512) || !hasSafeOptionalString(node.title, 2_000)) {
    return false;
  }
  if (
    node.target !== undefined &&
    node.target !== null &&
    node.target !== "_blank" &&
    node.target !== "_self"
  ) {
    return false;
  }
  const relTokens =
    typeof node.rel === "string"
      ? node.rel.toLowerCase().split(/\s+/).filter(Boolean)
      : [];
  return !relTokens.includes("opener");
}

function isSupportedEditorNode(node: Record<string, unknown>) {
  if (typeof node.type !== "string" || !EDITOR_NODE_TYPES.has(node.type)) {
    return false;
  }
  if (
    node.version !== undefined &&
    (!Number.isSafeInteger(node.version) || (node.version as number) < 1)
  ) {
    return false;
  }
  if (node.type === "text" && !isBoundedString(node.text, READER_TRANSFER_LIMITS.maxBodyLength)) {
    return false;
  }
  if (node.type === "heading" && !HEADING_TAGS.has(node.tag as string)) {
    return false;
  }
  if (
    node.type === "list" &&
    (!LIST_TYPES.has(node.listType as string) || !isSafePositiveInteger(node.start))
  ) {
    return false;
  }
  if (
    node.type === "listitem" &&
    node.value !== undefined &&
    !isSafePositiveInteger(node.value)
  ) {
    return false;
  }
  if (
    (node.type === "link" || node.type === "autolink" || node.type === "kjv-link") &&
    !hasSafeLinkAttributes(node)
  ) {
    return false;
  }
  if (EDITOR_ELEMENT_TYPES.has(node.type)) {
    return (
      Array.isArray(node.children) &&
      node.children.every(isRecord)
    );
  }
  return node.children === undefined;
}

export function isSupportedSerializedEditorState(parsed: unknown) {
  if (!isRecord(parsed) || !isRecord(parsed.root) || parsed.root.type !== "root") {
    return false;
  }

  const pending: Array<{ value: Record<string, unknown>; depth: number }> = [
    { value: parsed.root, depth: 0 },
  ];
  let visitedNodes = 0;

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      break;
    }
    if (current.depth > READER_TRANSFER_LIMITS.maxEditorDepth) {
      return false;
    }

    visitedNodes += 1;
    if (
      visitedNodes > READER_TRANSFER_LIMITS.maxEditorNodes ||
      !isSupportedEditorNode(current.value)
    ) {
      return false;
    }

    if (Array.isArray(current.value.children)) {
      if (
        visitedNodes + pending.length + current.value.children.length >
        READER_TRANSFER_LIMITS.maxEditorNodes
      ) {
        return false;
      }
      for (let index = current.value.children.length - 1; index >= 0; index -= 1) {
        const child = current.value.children[index];
        if (!isRecord(child)) {
          return false;
        }
        pending.push({ value: child, depth: current.depth + 1 });
      }
    }
  }

  return true;
}

function hasSafeEditorPayload(body: string) {
  if (!body.trimStart().startsWith("{")) {
    return true;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch {
    return true;
  }
  if (!isRecord(parsed) || !("root" in parsed)) {
    return true;
  }
  return isSupportedSerializedEditorState(parsed);
}

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
    return isSafeIndex(scope.bookIndex);
  }

  if (scope.type === "chapter") {
    return isSafeIndex(scope.bookIndex) && isSafeIndex(scope.chapterIndex);
  }

  if (scope.type === "verse") {
    return (
      isSafeIndex(scope.bookIndex) &&
      isSafeIndex(scope.chapterIndex) &&
      isSafePositiveInteger(scope.verseNumber)
    );
  }

  if (scope.type === "word") {
    return (
      isSafeIndex(scope.bookIndex) &&
      isSafeIndex(scope.chapterIndex) &&
      isBoundedString(scope.word, READER_TRANSFER_LIMITS.maxWordLength) &&
      (scope.verseNumber === undefined || isSafePositiveInteger(scope.verseNumber))
    );
  }

  return false;
}

export function isValidReaderNote(note: unknown): note is ReaderNote {
  return (
    isRecord(note) &&
    isBoundedString(note.id, READER_TRANSFER_LIMITS.maxIdLength) &&
    isBoundedString(note.title, READER_TRANSFER_LIMITS.maxTitleLength) &&
    isBoundedString(note.body, READER_TRANSFER_LIMITS.maxBodyLength) &&
    hasSafeEditorPayload(note.body) &&
    isValidReaderTimestamp(note.createdAt) &&
    isValidReaderTimestamp(note.updatedAt) &&
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

export function isValidReaderBookmark(bookmark: unknown): bookmark is ReaderBookmark {
  if (
    !isRecord(bookmark) ||
    !isBoundedString(bookmark.id, READER_TRANSFER_LIMITS.maxIdLength) ||
    !isBoundedString(bookmark.label, READER_TRANSFER_LIMITS.maxLabelLength) ||
    !isBoundedString(bookmark.note, READER_TRANSFER_LIMITS.maxBookmarkNoteLength) ||
    !isValidReaderTimestamp(bookmark.createdAt) ||
    !isValidReaderTimestamp(bookmark.updatedAt) ||
    !isRecord(bookmark.scope) ||
    typeof bookmark.scope.type !== "string"
  ) {
    return false;
  }

  if (bookmark.scope.type === "chapter") {
    return (
      bookmark.type === "chapter" &&
      isSafeIndex(bookmark.scope.bookIndex) &&
      isSafeIndex(bookmark.scope.chapterIndex)
    );
  }

  if (bookmark.scope.type === "verse") {
    return (
      bookmark.type === "verse" &&
      isSafeIndex(bookmark.scope.bookIndex) &&
      isSafeIndex(bookmark.scope.chapterIndex) &&
      isSafePositiveInteger(bookmark.scope.verseNumber)
    );
  }

  if (bookmark.scope.type === "selection") {
    return (
      bookmark.type === "selection" &&
      isSafeIndex(bookmark.scope.bookIndex) &&
      isSafeIndex(bookmark.scope.chapterIndex) &&
      Array.isArray(bookmark.scope.ranges) &&
      bookmark.scope.ranges.length <= READER_TRANSFER_LIMITS.maxSelectionRanges &&
      bookmark.scope.ranges.every(
        (range) =>
          isRecord(range) &&
          isSafePositiveInteger(range.start) &&
          isSafePositiveInteger(range.end),
      )
    );
  }

  if (bookmark.scope.type === "range") {
    return (
      bookmark.type === "range" &&
      isRecord(bookmark.scope.start) &&
      isRecord(bookmark.scope.end) &&
      isSafeIndex(bookmark.scope.start.bookIndex) &&
      isSafeIndex(bookmark.scope.start.chapterIndex) &&
      isSafePositiveInteger(bookmark.scope.start.verseNumber) &&
      isSafeIndex(bookmark.scope.end.bookIndex) &&
      isSafeIndex(bookmark.scope.end.chapterIndex) &&
      isSafePositiveInteger(bookmark.scope.end.verseNumber)
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
  if (text.length > READER_TRANSFER_LIMITS.maxFileBytes) {
    throw new Error(
      `Import files must be ${READER_TRANSFER_LIMITS.maxFileBytes / 1024 / 1024} MB or smaller.`,
    );
  }
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

  if (entries.length > READER_TRANSFER_LIMITS.maxEntries) {
    throw new Error(
      `The ${key} file contains more than ${READER_TRANSFER_LIMITS.maxEntries.toLocaleString()} entries.`,
    );
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

export function assertReaderEntryMergeLimit(
  kind: "notes" | "bookmarks",
  existingEntries: ReadonlyArray<{ id: string }>,
  importedEntries: ReadonlyArray<{ id: string }>,
) {
  const mergedIds = new Set(existingEntries.map((entry) => entry.id));
  for (const entry of importedEntries) {
    mergedIds.add(entry.id);
    if (mergedIds.size > READER_TRANSFER_LIMITS.maxEntries) {
      throw new Error(
        `Importing these ${kind} would exceed the ${READER_TRANSFER_LIMITS.maxEntries.toLocaleString()}-entry limit. No ${kind} were changed.`,
      );
    }
  }
  return mergedIds.size;
}

export type StoredReaderEntriesParseResult<T> = {
  entries: T[];
  skippedInvalidCount: number;
};

function parseStoredEntries<T>(
  text: string,
  kind: "notes" | "bookmarks",
  isValidEntry: (value: unknown) => value is T,
): StoredReaderEntriesParseResult<T> {
  if (text.length > READER_TRANSFER_LIMITS.maxFileBytes) {
    throw new Error(`Stored ${kind} exceed the recovery size limit.`);
  }
  const parsed = JSON.parse(text) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`Stored ${kind} are not a collection.`);
  }
  if (parsed.length > READER_TRANSFER_LIMITS.maxEntries) {
    throw new Error(`Stored ${kind} exceed the entry limit.`);
  }
  const entries = parsed.filter(isValidEntry);
  return {
    entries,
    skippedInvalidCount: parsed.length - entries.length,
  };
}

export function parseStoredNotesPayloadDetailed(
  text: string,
): StoredReaderEntriesParseResult<ReaderNote> {
  return parseStoredEntries(text, "notes", isValidReaderNote);
}

export function parseStoredBookmarksPayloadDetailed(
  text: string,
): StoredReaderEntriesParseResult<ReaderBookmark> {
  return parseStoredEntries(text, "bookmarks", isValidReaderBookmark);
}

export function parseStoredNotesPayload(text: string): ReaderNote[] {
  return parseStoredNotesPayloadDetailed(text).entries;
}

export function parseStoredBookmarksPayload(text: string): ReaderBookmark[] {
  return parseStoredBookmarksPayloadDetailed(text).entries;
}
