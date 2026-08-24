/// <reference lib="webworker" />

import { buildVerseSearchIndex } from "@/lib/verse-search-index"
import type { Book } from "@/types/bible"

self.addEventListener("message", (event: MessageEvent<{ books: Book[] }>) => {
  try {
    self.postMessage({ index: buildVerseSearchIndex(event.data.books) })
  } catch (error) {
    self.postMessage({
      error:
        error instanceof Error
          ? error.message
          : "Could not prepare Bible search.",
    })
  }
})
