import { useMemo } from "react";

import type { Book } from "@/types/bible";
import { chapterProgressKey } from "@/lib/reader-view";
import { buildLeafNeighborMap, type LeafNeighbors } from "@/lib/reader-neighbors";
import type { ReaderTab } from "@/types/reader";

type UseReaderDerivedStateArgs = {
  books: Book[];
  tabs: ReaderTab[];
  activeTabId: string | null;
  readChapters: Set<string>;
};

export function useReaderDerivedState({
  books,
  tabs,
  activeTabId,
  readChapters,
}: UseReaderDerivedStateArgs) {
  const chapterRefs = useMemo(
    () =>
      books.flatMap((book, bIndex) =>
        book.chapters.map((_, cIndex) => ({
          bookIndex: bIndex,
          chapterIndex: cIndex,
        })),
      ),
    [books],
  );

  const chapterRefIndex = useMemo(() => {
    const map = new Map<string, number>();
    chapterRefs.forEach((ref, index) => {
      map.set(`${ref.bookIndex}-${ref.chapterIndex}`, index);
    });
    return map;
  }, [chapterRefs]);

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [activeTabId, tabs],
  );

  const modelLeafNeighbors = useMemo<Map<string, LeafNeighbors>>(
    () => (activeTab ? buildLeafNeighborMap(activeTab.root) : new Map()),
    [activeTab],
  );

  const existingTabTargets = useMemo(
    () =>
      tabs
        .map((tab, index) => ({
          id: tab.id,
          index,
          title: tab.title,
        }))
        .filter((tab) => tab.id !== activeTabId),
    [tabs, activeTabId],
  );

  const progressByTestament = useMemo(() => {
    const oldBooks = books.slice(0, 39);
    const newBooks = books.slice(39);

    const makeBookProgress = (book: Book, bookIndex: number) => {
      const total = book.chapters.length;
      const chapters = book.chapters.map((chapter, chapterIndex) => {
        const read = readChapters.has(
          chapterProgressKey(bookIndex, chapterIndex),
        );
        return {
          chapterIndex,
          chapterNumber: chapter.chapter,
          read,
        };
      });
      const read = chapters.reduce(
        (count, chapter) => count + (chapter.read ? 1 : 0),
        0,
      );
      return { name: book.name, bookIndex, read, total, chapters };
    };

    const oldBookProgress = oldBooks.map((book, index) =>
      makeBookProgress(book, index),
    );
    const newBookProgress = newBooks.map((book, index) =>
      makeBookProgress(book, index + 39),
    );

    const summarize = (items: { read: number; total: number }[]) =>
      items.reduce(
        (acc, item) => ({
          read: acc.read + item.read,
          total: acc.total + item.total,
        }),
        { read: 0, total: 0 },
      );

    const oldSummary = summarize(oldBookProgress);
    const newSummary = summarize(newBookProgress);
    const totalSummary = {
      read: oldSummary.read + newSummary.read,
      total: oldSummary.total + newSummary.total,
    };

    return {
      old: { label: "Old Testament", ...oldSummary, books: oldBookProgress },
      new: { label: "New Testament", ...newSummary, books: newBookProgress },
      total: totalSummary,
    };
  }, [books, readChapters]);

  const readChapterCountByBook = useMemo(() => {
    const counts = new Map<number, number>();
    for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
      const book = books[bookIndex];
      let count = 0;
      for (
        let chapterIndex = 0;
        chapterIndex < book.chapters.length;
        chapterIndex += 1
      ) {
        if (readChapters.has(chapterProgressKey(bookIndex, chapterIndex))) {
          count += 1;
        }
      }
      counts.set(bookIndex, count);
    }
    return counts;
  }, [books, readChapters]);

  const totalProgressPercent =
    progressByTestament.total.total > 0
      ? Math.round(
          (progressByTestament.total.read / progressByTestament.total.total) *
            100,
        )
      : 0;

  return {
    chapterRefs,
    chapterRefIndex,
    activeTab,
    modelLeafNeighbors,
    existingTabTargets,
    progressByTestament,
    readChapterCountByBook,
    totalProgressPercent,
  };
}
