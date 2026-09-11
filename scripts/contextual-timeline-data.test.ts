import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import type { Book } from "../src/types/bible";
import { BOOK_ICON_CODES } from "../src/lib/references";
import { WRITING_CONTEXTS } from "../src/data/contextual-timeline-writings";
import { NT_NARRATIVE_DETAILS } from "../src/data/contextual-timeline-nt";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, selectContextTimeline } from "../src/data/contextual-timeline";

const records = buildContextTimeline();
it("validates the reviewed ranges and Old and New Testament chapter references against the shipped KJV", () => {
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  const byName = new Map(books.map(book => [book.name, book]));
  for (const narrative of Object.values(NT_NARRATIVE_DETAILS)) for (const passage of narrative.passages) {
    const book = byName.get(passage.book)!;
    expect(book.chapters[passage.startChapter - 1]?.verses[passage.startVerse - 1], passage.label).toBeDefined();
    expect(book.chapters[passage.endChapter - 1]?.verses[passage.endVerse - 1], passage.label).toBeDefined();
    expect(passage.startChapter < passage.endChapter || (passage.startChapter === passage.endChapter && passage.startVerse <= passage.endVerse), passage.label).toBe(true);
  }
  for (const book of books.slice(39, 43)) {
    const covered = new Set<string>();
    for (const narrative of Object.values(NT_NARRATIVE_DETAILS).filter(item => item.collection === "gospels")) {
      for (const p of narrative.passages.filter(p => p.book === book.name)) {
        for (let chapter = p.startChapter; chapter <= p.endChapter; chapter++) {
          const last = chapter === p.endChapter ? p.endVerse : book.chapters[chapter - 1].verses.length;
          for (let verse = chapter === p.startChapter ? p.startVerse : 1; verse <= last; verse++) covered.add(`${chapter}:${verse}`);
        }
      }
    }
    for (const chapter of book.chapters) for (const verse of chapter.verses) expect(covered.has(`${chapter.chapter}:${verse.verse}`), `${book.name} ${chapter.chapter}:${verse.verse}`).toBe(true);
  }
  for (const book of [...books.slice(0, 8), ...books.slice(39)]) {
    expect(Object.keys(CHAPTER_TIMELINE_MAP[book.name]), book.name).toHaveLength(book.chapters.length);
    for (const chapter of book.chapters) {
      const selection = selectContextTimeline(records, book.name, chapter.chapter, "chapter", "biblical");
      expect(selection.mapped).toBe(true);
      expect(selection.records.some(record => record.emphasized)).toBe(true);
    }
  }
  const citations = [...records.flatMap(record => record.references), ...WRITING_CONTEXTS.flatMap(w => w.references), ...Object.values(CHAPTER_TIMELINE_MAP).flatMap(chapters => Object.values(chapters).flatMap(mapping => mapping.references ?? []))];
  for (const ref of citations) {
    const [code, chapter, verse] = ref.split(".");
    expect(books[BOOK_ICON_CODES.findIndex(bookCode => bookCode === code)]?.chapters[Number(chapter) - 1]?.verses[Number(verse) - 1], ref).toBeDefined();
  }
  for (const writing of WRITING_CONTEXTS) expect(writing.chapters, writing.book).toHaveLength(byName.get(writing.book)!.chapters.length);
});
