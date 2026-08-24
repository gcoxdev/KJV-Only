/// <reference lib="webworker" />

import { parseBooks } from "@/lib/bible-payload"

self.addEventListener(
  "message",
  async (event: MessageEvent<{ url: string }>) => {
    try {
      const response = await fetch(event.data.url, { cache: "no-cache" })
      if (!response.ok) {
        throw new Error(`Could not load ${event.data.url}`)
      }
      const books = parseBooks((await response.json()) as unknown)
      if (!books || books.length === 0) {
        throw new Error(`Invalid reader data format in ${event.data.url}`)
      }
      self.postMessage({ books })
    } catch (error) {
      self.postMessage({
        error: error instanceof Error ? error.message : "Bible data worker failed",
      })
    }
  },
)
