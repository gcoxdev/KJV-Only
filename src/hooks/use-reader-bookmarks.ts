import { useCallback, useEffect, useState } from "react";

import { bookmarkCanonicalKey, bookmarkScopeLabel, normalizeRangePoints } from "@/lib/bookmarks";
import { createId } from "@/lib/reader-layout";
import type { Book } from "@/types/bible";
import type {
  BookmarkPoint,
  BookmarkScope,
  ReaderBookmark,
} from "@/types/bookmarks";

type UseReaderBookmarksArgs = {
  books: Book[];
};

export function useReaderBookmarks({ books }: UseReaderBookmarksArgs) {
  const [readerBookmarks, setReaderBookmarks] = useState<ReaderBookmark[]>([]);
  const [bookmarkModeEnabled, setBookmarkModeEnabled] = useState(false);
  const [pendingBookmarkRangeStart, setPendingBookmarkRangeStart] =
    useState<BookmarkPoint | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("kjv-reader-bookmarks-v1");
      if (!stored) {
        return;
      }
      const parsed = JSON.parse(stored) as ReaderBookmark[];
      if (!Array.isArray(parsed)) {
        return;
      }
      setReaderBookmarks(parsed);
    } catch {
      // Ignore invalid stored bookmarks payloads.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "kjv-reader-bookmarks-v1",
        JSON.stringify(readerBookmarks),
      );
    } catch {
      // Ignore persistence errors (quota/private mode edge cases).
    }
  }, [readerBookmarks]);

  const upsertBookmark = useCallback(
    (
      scope: BookmarkScope,
      patch?: Partial<Pick<ReaderBookmark, "label" | "note">>,
    ) => {
      const normalizedScope =
        scope.type === "range"
          ? {
              ...scope,
              ...normalizeRangePoints(scope.start, scope.end),
            }
          : scope;
      const scopeKey = bookmarkCanonicalKey(normalizedScope);
      const now = Date.now();
      const defaultLabel = bookmarkScopeLabel(normalizedScope, books);
      const nextLabel = patch?.label?.trim() || defaultLabel;
      const nextNote = patch?.note?.trim() ?? "";
      let nextBookmarkId = createId();

      setReaderBookmarks((current) => {
        const existingIndex = current.findIndex(
          (bookmark) => bookmarkCanonicalKey(bookmark.scope) === scopeKey,
        );

        if (existingIndex < 0) {
          return [
            {
              id: nextBookmarkId,
              type: normalizedScope.type,
              scope: normalizedScope,
              label: nextLabel,
              note: nextNote,
              createdAt: now,
              updatedAt: now,
            },
            ...current,
          ];
        }

        const existing = current[existingIndex];
        nextBookmarkId = existing.id;
        const updated: ReaderBookmark = {
          ...existing,
          type: normalizedScope.type,
          scope: normalizedScope,
          label:
            patch?.label !== undefined
              ? nextLabel
              : existing.label || defaultLabel,
          note: patch?.note !== undefined ? nextNote : existing.note,
          updatedAt: now,
        };

        const next = [...current];
        next.splice(existingIndex, 1);
        return [updated, ...next];
      });

      return nextBookmarkId;
    },
    [books],
  );

  const updateBookmark = useCallback(
    (
      bookmarkId: string,
      patch: Partial<Pick<ReaderBookmark, "label" | "note">>,
    ) => {
      const now = Date.now();
      setReaderBookmarks((current) =>
        current.map((bookmark) =>
          bookmark.id === bookmarkId
            ? {
                ...bookmark,
                ...(patch.label !== undefined
                  ? { label: patch.label.trim() }
                  : null),
                ...(patch.note !== undefined ? { note: patch.note.trim() } : null),
                updatedAt: now,
              }
            : bookmark,
        ),
      );
    },
    [],
  );

  const deleteBookmark = useCallback((bookmarkId: string) => {
    setReaderBookmarks((current) =>
      current.filter((bookmark) => bookmark.id !== bookmarkId),
    );
  }, []);

  const toggleBookmarkMode = useCallback(() => {
    setBookmarkModeEnabled((current) => {
      const next = !current;
      if (!next) {
        setPendingBookmarkRangeStart(null);
      }
      return next;
    });
  }, []);

  const createChapterBookmark = useCallback(
    (bookIndex: number, chapterIndex: number) => {
      upsertBookmark({
        type: "chapter",
        bookIndex,
        chapterIndex,
      });
    },
    [upsertBookmark],
  );

  return {
    readerBookmarks,
    bookmarkModeEnabled,
    pendingBookmarkRangeStart,
    setPendingBookmarkRangeStart,
    upsertBookmark,
    updateBookmark,
    deleteBookmark,
    toggleBookmarkMode,
    createChapterBookmark,
  };
}
