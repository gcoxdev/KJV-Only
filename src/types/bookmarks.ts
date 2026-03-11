export type BookmarkRange = {
  start: number;
  end: number;
};

export type BookmarkType = "chapter" | "verse" | "range" | "selection";

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
    }
  | {
      type: "selection";
      bookIndex: number;
      chapterIndex: number;
      ranges: BookmarkRange[];
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
