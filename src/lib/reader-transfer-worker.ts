import {
  parseImportedBookmarksPayloadDetailed,
  parseImportedNotesPayloadDetailed,
  type ImportParseResult,
} from "@/lib/reader-transfer";
import type { ReaderBookmark } from "@/types/bookmarks";
import type { ReaderNote } from "@/types/notes";

type ImportKind = "notes" | "bookmarks";
type ImportResult =
  | ImportParseResult<ReaderNote>
  | ImportParseResult<ReaderBookmark>;

type WorkerResponse = {
  result?: ImportResult;
  error?: string;
};

function createAbortError() {
  const error = new Error("Reader import was cancelled.");
  error.name = "AbortError";
  return error;
}

export function parseReaderImportInWorker(
  kind: "notes",
  text: string,
  signal?: AbortSignal,
): Promise<ImportParseResult<ReaderNote>>;
export function parseReaderImportInWorker(
  kind: "bookmarks",
  text: string,
  signal?: AbortSignal,
): Promise<ImportParseResult<ReaderBookmark>>;
export function parseReaderImportInWorker(
  kind: ImportKind,
  text: string,
  signal?: AbortSignal,
): Promise<ImportResult> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  if (typeof Worker !== "function") {
    return Promise.resolve(
      kind === "notes"
        ? parseImportedNotesPayloadDetailed(text)
        : parseImportedBookmarksPayloadDetailed(text),
    );
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../workers/reader-transfer.worker.ts", import.meta.url),
      { type: "module" },
    );

    const finish = () => {
      signal?.removeEventListener("abort", handleAbort);
      worker.terminate();
    };
    const handleAbort = () => {
      finish();
      reject(createAbortError());
    };

    signal?.addEventListener("abort", handleAbort, { once: true });
    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      finish();
      if (event.data.error || !event.data.result) {
        reject(new Error(event.data.error ?? "Reader import failed."));
        return;
      }
      resolve(event.data.result);
    });
    worker.addEventListener("error", () => {
      finish();
      reject(new Error("Reader import worker failed."));
    });
    worker.postMessage({ kind, text });
  });
}
