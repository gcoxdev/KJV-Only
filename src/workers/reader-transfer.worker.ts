/// <reference lib="webworker" />

import {
  parseImportedBookmarksPayloadDetailed,
  parseImportedNotesPayloadDetailed,
} from "@/lib/reader-transfer";

type ReaderTransferWorkerRequest = {
  kind: "notes" | "bookmarks";
  text: string;
};

self.addEventListener(
  "message",
  (event: MessageEvent<ReaderTransferWorkerRequest>) => {
    try {
      const result =
        event.data.kind === "notes"
          ? parseImportedNotesPayloadDetailed(event.data.text)
          : parseImportedBookmarksPayloadDetailed(event.data.text);
      self.postMessage({ result });
    } catch (error) {
      self.postMessage({
        error:
          error instanceof Error ? error.message : "Reader import failed.",
      });
    }
  },
);
