import { normalizeConcordanceWord } from "@/lib/references"
import type { Book, Verse } from "@/types/bible"
import type { SearchMode } from "@/types/reader"

export type SearchableVerseEntry = {
  text: string
  textLower: string
  searchWords: string[]
  searchWordsLower: string[]
  searchWordPhonetics: string[]
}

export type VerseSearchIndexEntry = SearchableVerseEntry & {
  bookIndex: number
  chapterIndex: number
  verseNumber: number
  bookName: string
}

export type PreparedSelectedWordSearch = {
  needles: string[]
  mode: Extract<SearchMode, "contains-any" | "contains-all">
  caseSensitive: boolean
}

function phoneticCode(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z]/g, "")
  if (!normalized) return ""

  const firstLetter = normalized[0]
  const replacements = normalized
    .replace(/PH/g, "F")
    .replace(/GH/g, "G")
    .replace(/KN/g, "N")
    .replace(/WR/g, "R")
    .replace(/QU/g, "K")
    .replace(/CK/g, "K")
    .replace(/SCH/g, "S")
    .replace(/SH/g, "S")
    .replace(/CH/g, "K")
    .replace(/TH/g, "T")
    .replace(/TZ/g, "Z")
    .replace(/TS/g, "Z")
    .replace(/CZ/g, "Z")
  const encode = (character: string) => {
    if ("BFPV".includes(character)) return "1"
    if ("CGJKQSXZ".includes(character)) return "2"
    if ("DT".includes(character)) return "3"
    if (character === "L") return "4"
    if ("MN".includes(character)) return "5"
    if (character === "R") return "6"
    return ""
  }
  let encoded = ""
  let previousDigit = encode(firstLetter)
  for (const character of replacements.slice(1)) {
    const digit = encode(character)
    if (!digit) {
      previousDigit = ""
    } else if (digit !== previousDigit) {
      encoded += digit
      previousDigit = digit
    }
  }
  return `${firstLetter}${encoded}`.slice(0, 5)
}

function isPunctuationTokenText(text: string) {
  return /^[,.;:!?)]$/.test(text) || /^['"]$/.test(text) || /^--?$/.test(text)
}

function normalizeSearchDisplayText(text: string) {
  return text.replace(/[’‘]/g, "'").replace(/[‐‑‒–—−]/g, "-")
}

function formatSearchTokenText(verse: Verse, tokenIndex: number) {
  const token = verse.tokens[tokenIndex]
  const normalized = normalizeSearchDisplayText(token.text)
  return token.divineName ? normalized.toUpperCase() : normalized
}

function formatVerseText(verse: Verse) {
  let value = ""
  verse.tokens.forEach((_, index) => {
    const tokenText = formatSearchTokenText(verse, index)
    if (index > 0 && !isPunctuationTokenText(tokenText)) value += " "
    value += tokenText
  })
  return value
}

export function extractSearchWords(text: string) {
  return text
    .split(/\s+/)
    .map((word) => normalizeConcordanceWord(normalizeSearchDisplayText(word)))
    .filter(Boolean)
}

export function createSearchableVerseEntry(text: string): SearchableVerseEntry {
  const searchWords = extractSearchWords(text)
  return {
    text,
    textLower: text.toLowerCase(),
    searchWords,
    searchWordsLower: searchWords.map((word) => word.toLowerCase()),
    searchWordPhonetics: searchWords.map((word) => phoneticCode(word.toLowerCase())),
  }
}

export function buildVerseSearchIndex(books: Book[]): VerseSearchIndexEntry[] {
  const indexed: VerseSearchIndexEntry[] = []
  books.forEach((book, bookIndex) => {
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.verses.forEach((verse) => {
        indexed.push({
          bookIndex,
          chapterIndex,
          verseNumber: verse.verse,
          bookName: book.name,
          ...createSearchableVerseEntry(formatVerseText(verse)),
        })
      })
    })
  })
  return indexed
}

export function prepareSelectedWordSearch(
  selectedWords: string[],
  mode: Extract<SearchMode, "contains-any" | "contains-all">,
  caseSensitive: boolean,
) {
  const normalizedNeedles = selectedWords
    .map((word) => normalizeConcordanceWord(word.trim()))
    .filter(Boolean)
  if (normalizedNeedles.length === 0) return null

  return {
    needles: caseSensitive
      ? normalizedNeedles
      : normalizedNeedles.map((word) => word.toLowerCase()),
    mode,
    caseSensitive,
  } satisfies PreparedSelectedWordSearch
}

export function matchPreparedSelectedWords(
  entry: Pick<SearchableVerseEntry, "searchWords" | "searchWordsLower">,
  prepared: PreparedSelectedWordSearch,
) {
  const haystack = prepared.caseSensitive
    ? entry.searchWords
    : entry.searchWordsLower
  return prepared.mode === "contains-any"
    ? prepared.needles.some((needle) => haystack.includes(needle))
    : prepared.needles.every((needle) => haystack.includes(needle))
}

export function matchSelectedWords(
  entry: Pick<SearchableVerseEntry, "searchWords" | "searchWordsLower">,
  selectedWords: string[],
  mode: Extract<SearchMode, "contains-any" | "contains-all">,
  caseSensitive: boolean,
) {
  const prepared = prepareSelectedWordSearch(
    selectedWords,
    mode,
    caseSensitive,
  )
  return prepared ? matchPreparedSelectedWords(entry, prepared) : false
}
