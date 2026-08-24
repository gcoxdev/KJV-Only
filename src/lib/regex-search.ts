import { buildRegexMatcher, type VerseSearchIndexEntry } from "@/lib/search"
import type { SearchMatch } from "@/types/reader"

type RegexSearchOptions = {
  entries: VerseSearchIndexEntry[]
  selectedBookIndexes: readonly number[]
  pattern: string
  caseSensitive: boolean
  resultLimit?: number
}

export function runRegexSearch({
  entries,
  selectedBookIndexes,
  pattern,
  caseSensitive,
  resultLimit = 500,
}: RegexSearchOptions): { matches: SearchMatch[]; error: string | null } {
  const { regex, error } = buildRegexMatcher(pattern, caseSensitive)
  if (!regex) {
    return { matches: [], error }
  }

  const selected = new Set(selectedBookIndexes)
  const matches: SearchMatch[] = []
  for (const entry of entries) {
    if (!selected.has(entry.bookIndex) || !regex.test(entry.text)) {
      continue
    }
    matches.push({
      bookIndex: entry.bookIndex,
      chapterIndex: entry.chapterIndex,
      verseNumber: entry.verseNumber,
      bookName: entry.bookName,
      text: entry.text,
    })
    if (matches.length >= resultLimit) {
      break
    }
  }

  return { matches, error: null }
}
