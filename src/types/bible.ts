export type VerseToken = {
  text: string
  strong?: string
  lemma?: string
  morph?: string
  added?: boolean
  divineName?: boolean
}

export type VerseNoteReading = {
  type: string
  text: string
}

export type VerseNote = {
  type: string
  text: string
  catchWord?: string
  readings?: VerseNoteReading[]
}

export type Verse = {
  verse: number
  redLetter?: boolean
  tokens: VerseToken[]
  paragraphStart?: boolean
  paragraphMarker?: string
  notes?: VerseNote[]
}

export type Chapter = {
  chapter: number
  verses: Verse[]
}

export type Book = {
  name: string
  chapters: Chapter[]
}
