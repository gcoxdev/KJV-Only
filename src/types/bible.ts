export type VerseToken = {
  text: string
  strong?: string
}

export type Verse = {
  verse: number
  redLetter?: boolean
  tokens: VerseToken[]
}

export type Chapter = {
  chapter: number
  verses: Verse[]
}

export type Book = {
  name: string
  chapters: Chapter[]
}
