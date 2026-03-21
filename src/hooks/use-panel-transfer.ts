import { useCallback, useRef, useState } from "react";

import {
  createBookmarksExportPayload,
  createNotesExportPayload,
  downloadJsonFile,
  parseImportedBookmarksPayloadDetailed,
  parseImportedNotesPayloadDetailed,
} from "@/lib/reader-transfer";
import type { ReaderBookmark } from "@/types/bookmarks";
import type { ReaderNote } from "@/types/notes";

export type ImportSummaryState = {
  kind: "notes" | "bookmarks";
  importedCount: number;
  replacedCount: number;
  skippedCount: number;
  isError: boolean;
  message: string;
};

type UsePanelTransferParams = {
  readerNotes: ReaderNote[];
  readerBookmarks: ReaderBookmark[];
  importNotes: (notes: ReaderNote[]) => void;
  importBookmarks: (bookmarks: ReaderBookmark[]) => void;
};

export function usePanelTransfer({
  readerNotes,
  readerBookmarks,
  importNotes,
  importBookmarks,
}: UsePanelTransferParams) {
  const [importSummary, setImportSummary] = useState<ImportSummaryState | null>(
    null,
  );
  const notesImportInputRef = useRef<HTMLInputElement | null>(null);
  const bookmarksImportInputRef = useRef<HTMLInputElement | null>(null);

  const exportNotes = useCallback(() => {
    downloadJsonFile(
      `kjv-reader-notes-${new Date().toISOString().slice(0, 10)}.json`,
      createNotesExportPayload(readerNotes),
    );
  }, [readerNotes]);

  const exportBookmarks = useCallback(() => {
    downloadJsonFile(
      `kjv-reader-bookmarks-${new Date().toISOString().slice(0, 10)}.json`,
      createBookmarksExportPayload(readerBookmarks),
    );
  }, [readerBookmarks]);

  const handleImportNotesFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }
      try {
        const result = parseImportedNotesPayloadDetailed(await file.text());
        importNotes(result.entries);
        const existingIds = new Set(readerNotes.map((note) => note.id));
        const replacedCount = result.entries.filter((note) =>
          existingIds.has(note.id),
        ).length;
        setImportSummary({
          kind: "notes",
          importedCount: result.entries.length,
          replacedCount,
          skippedCount: result.skippedInvalidCount,
          isError: false,
          message:
            result.skippedInvalidCount > 0
              ? "Imported the valid notes and skipped invalid entries."
              : "Imported all notes successfully.",
        });
      } catch (error) {
        setImportSummary({
          kind: "notes",
          importedCount: 0,
          replacedCount: 0,
          skippedCount: 0,
          isError: true,
          message:
            error instanceof Error ? error.message : "Failed to import notes.",
        });
      }
    },
    [importNotes, readerNotes],
  );

  const handleImportBookmarksFile = useCallback(
    async (file: File | null) => {
      if (!file) {
        return;
      }
      try {
        const result = parseImportedBookmarksPayloadDetailed(await file.text());
        importBookmarks(result.entries);
        const existingIds = new Set(readerBookmarks.map((bookmark) => bookmark.id));
        const replacedCount = result.entries.filter((bookmark) =>
          existingIds.has(bookmark.id),
        ).length;
        setImportSummary({
          kind: "bookmarks",
          importedCount: result.entries.length,
          replacedCount,
          skippedCount: result.skippedInvalidCount,
          isError: false,
          message:
            result.skippedInvalidCount > 0
              ? "Imported the valid bookmarks and skipped invalid entries."
              : "Imported all bookmarks successfully.",
        });
      } catch (error) {
        setImportSummary({
          kind: "bookmarks",
          importedCount: 0,
          replacedCount: 0,
          skippedCount: 0,
          isError: true,
          message:
            error instanceof Error
              ? error.message
              : "Failed to import bookmarks.",
        });
      }
    },
    [importBookmarks, readerBookmarks],
  );

  const closeImportSummary = useCallback(() => {
    setImportSummary(null);
  }, []);

  return {
    importSummary,
    closeImportSummary,
    notesImportInputRef,
    bookmarksImportInputRef,
    exportNotes,
    exportBookmarks,
    handleImportNotesFile,
    handleImportBookmarksFile,
  };
}
