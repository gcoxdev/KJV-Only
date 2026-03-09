export type BookmarkType = "chapter" | "verse" | "range";

export type BookmarkPoint = {
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number;
};

export type BookmarkScope =
  | {
      type: "chapter";
      bookIndex: number;
      chapterIndex: number;
    }
  | {
      type: "verse";
      bookIndex: number;
      chapterIndex: number;
      verseNumber: number;
    }
  | {
      type: "range";
      start: BookmarkPoint;
      end: BookmarkPoint;
    };

export type ReaderBookmark = {
  id: string;
  type: BookmarkType;
  scope: BookmarkScope;
  label: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

