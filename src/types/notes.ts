export type NotesContext = {
  bookIndex: number;
  chapterIndex: number;
  verseNumber?: number;
  word?: string;
};

export type NoteScope =
  | { type: "general" }
  | { type: "book"; bookIndex: number }
  | { type: "chapter"; bookIndex: number; chapterIndex: number }
  | {
      type: "verse";
      bookIndex: number;
      chapterIndex: number;
      verseNumber: number;
    }
  | {
      type: "word";
      bookIndex: number;
      chapterIndex: number;
      verseNumber?: number;
      word: string;
    };

export type ReaderNote = {
  id: string;
  title: string;
  body: string;
  scope: NoteScope;
  createdAt: number;
  updatedAt: number;
};

export type NotesTabFilter = "all" | "general" | "context";

export type NotesTabState = {
  selectedNoteId: string | null;
  filter: NotesTabFilter;
  context: NotesContext | null;
};
