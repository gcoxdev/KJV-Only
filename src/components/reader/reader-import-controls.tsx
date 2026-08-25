import type { RefObject } from "react";

import type { ImportSummaryState } from "@/hooks/use-panel-transfer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ReaderImportControlsProps = {
  importSummary: ImportSummaryState | null;
  notesImportInputRef: RefObject<HTMLInputElement | null>;
  bookmarksImportInputRef: RefObject<HTMLInputElement | null>;
  onImportNotesFile: (file: File | null) => Promise<void>;
  onImportBookmarksFile: (file: File | null) => Promise<void>;
  onCloseImportSummary: () => void;
};

export function ReaderImportControls({
  importSummary,
  notesImportInputRef,
  bookmarksImportInputRef,
  onImportNotesFile,
  onImportBookmarksFile,
  onCloseImportSummary,
}: ReaderImportControlsProps) {
  return (
    <>
      <input
        ref={notesImportInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.currentTarget.value = "";
          void onImportNotesFile(file);
        }}
      />
      <input
        ref={bookmarksImportInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.currentTarget.value = "";
          void onImportBookmarksFile(file);
        }}
      />
      <AlertDialog
        open={importSummary !== null}
        onOpenChange={(open) => {
          if (!open) {
            onCloseImportSummary();
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {importSummary?.isError
                ? `Import ${importSummary?.kind === "bookmarks" ? "Bookmarks" : "Notes"} Failed`
                : `${importSummary?.kind === "bookmarks" ? "Bookmarks" : "Notes"} Imported`}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-2">
              <span className="block">{importSummary?.message}</span>
              {importSummary && !importSummary.isError ? (
                <>
                  <span className="block">
                    Imported: {importSummary.importedCount}
                  </span>
                  <span className="block">
                    Replaced existing: {importSummary.replacedCount}
                  </span>
                  <span className="block">
                    Skipped invalid: {importSummary.skippedCount}
                  </span>
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onCloseImportSummary}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
