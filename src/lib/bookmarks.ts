import type { Book } from "@/types/bible";
import type {
  BookmarkPoint,
  BookmarkScope,
  BookmarkType,
  ReaderBookmark,
} from "@/types/bookmarks";

const BOOKMARK_TYPE_ORDER: Record<BookmarkType, number> = {
  chapter: 0,
  verse: 1,
  range: 2,
};

function comparePoint(a: BookmarkPoint, b: BookmarkPoint) {
  if (a.bookIndex !== b.bookIndex) return a.bookIndex - b.bookIndex;
  if (a.chapterIndex !== b.chapterIndex) return a.chapterIndex - b.chapterIndex;
  return a.verseNumber - b.verseNumber;
}

export function normalizeRangePoints(start: BookmarkPoint, end: BookmarkPoint) {
  return comparePoint(start, end) <= 0 ? { start, end } : { start: end, end: start };
}

function scopeType(scope: BookmarkScope): BookmarkType {
  return scope.type;
}

function refLabel(point: BookmarkPoint, books: Book[]) {
  const bookName = books[point.bookIndex]?.name ?? `Book ${point.bookIndex + 1}`;
  return `${bookName} ${point.chapterIndex + 1}:${point.verseNumber}`;
}

export function bookmarkScopeLabel(scope: BookmarkScope, books: Book[]) {
  if (scope.type === "chapter") {
    const bookName = books[scope.bookIndex]?.name ?? `Book ${scope.bookIndex + 1}`;
    return `${bookName} ${scope.chapterIndex + 1}`;
  }
  if (scope.type === "verse") {
    return refLabel(scope, books);
  }
  const normalized = normalizeRangePoints(scope.start, scope.end);
  return `${refLabel(normalized.start, books)}-${refLabel(normalized.end, books)}`;
}

export function bookmarkScopeSummary(scope: BookmarkScope, books: Book[]) {
  if (scope.type === "chapter") {
    return `Chapter • ${bookmarkScopeLabel(scope, books)}`;
  }
  if (scope.type === "verse") {
    return `Verse • ${bookmarkScopeLabel(scope, books)}`;
  }
  const normalized = normalizeRangePoints(scope.start, scope.end);
  const sameChapter =
    normalized.start.bookIndex === normalized.end.bookIndex &&
    normalized.start.chapterIndex === normalized.end.chapterIndex;
  if (sameChapter) {
    const bookName =
      books[normalized.start.bookIndex]?.name ??
      `Book ${normalized.start.bookIndex + 1}`;
    return `Range • ${bookName} ${normalized.start.chapterIndex + 1}:${normalized.start.verseNumber}-${normalized.end.verseNumber}`;
  }
  return `Range • ${bookmarkScopeLabel(scope, books)}`;
}

export function bookmarkCanonicalKey(scope: BookmarkScope) {
  if (scope.type === "chapter") {
    return `chapter:${scope.bookIndex}:${scope.chapterIndex}`;
  }
  if (scope.type === "verse") {
    return `verse:${scope.bookIndex}:${scope.chapterIndex}:${scope.verseNumber}`;
  }
  const normalized = normalizeRangePoints(scope.start, scope.end);
  return `range:${normalized.start.bookIndex}:${normalized.start.chapterIndex}:${normalized.start.verseNumber}:${normalized.end.bookIndex}:${normalized.end.chapterIndex}:${normalized.end.verseNumber}`;
}

export function compareBookmarkCanonical(a: ReaderBookmark, b: ReaderBookmark) {
  const typeOrderDelta = BOOKMARK_TYPE_ORDER[scopeType(a.scope)] - BOOKMARK_TYPE_ORDER[scopeType(b.scope)];
  if (typeOrderDelta !== 0) {
    return typeOrderDelta;
  }

  if (a.scope.type === "chapter" && b.scope.type === "chapter") {
    if (a.scope.bookIndex !== b.scope.bookIndex) return a.scope.bookIndex - b.scope.bookIndex;
    return a.scope.chapterIndex - b.scope.chapterIndex;
  }

  if (a.scope.type === "verse" && b.scope.type === "verse") {
    return comparePoint(a.scope, b.scope);
  }

  if (a.scope.type === "range" && b.scope.type === "range") {
    const aRange = normalizeRangePoints(a.scope.start, a.scope.end);
    const bRange = normalizeRangePoints(b.scope.start, b.scope.end);
    const startDelta = comparePoint(aRange.start, bRange.start);
    if (startDelta !== 0) return startDelta;
    return comparePoint(aRange.end, bRange.end);
  }

  return 0;
}

export function sortBookmarksCanonical(bookmarks: ReaderBookmark[]) {
  return [...bookmarks].sort(compareBookmarkCanonical);
}

export function bookmarkBookIndex(scope: BookmarkScope) {
  if (scope.type === "chapter" || scope.type === "verse") {
    return scope.bookIndex;
  }
  const normalized = normalizeRangePoints(scope.start, scope.end);
  return normalized.start.bookIndex;
}

