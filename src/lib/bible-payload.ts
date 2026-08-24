import type { Book } from "@/types/bible"
import type { ReaderPayload } from "@/types/reader"

export function parseBooks(input: unknown): Book[] | null {
  if (Array.isArray(input)) {
    return input as Book[]
  }

  if (typeof input === "object" && input !== null) {
    const payload = input as ReaderPayload
    if (Array.isArray(payload.books)) {
      return payload.books
    }
  }

  return null
}
