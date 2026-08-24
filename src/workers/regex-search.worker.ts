/// <reference lib="webworker" />

import { runRegexSearch } from "@/lib/regex-search"
import type { VerseSearchIndexEntry } from "@/lib/search"

type RegexSearchRequest = {
  entries: VerseSearchIndexEntry[]
  selectedBookIndexes: number[]
  pattern: string
  caseSensitive: boolean
  resultLimit: number
}

self.addEventListener(
  "message",
  (event: MessageEvent<RegexSearchRequest>) => {
    self.postMessage(runRegexSearch(event.data))
  },
)
