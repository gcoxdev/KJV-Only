import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import type { Book } from "../src/types/bible";
import { BOOK_ICON_CODES } from "../src/lib/references";
import { WRITING_CONTEXTS } from "../src/data/contextual-timeline-writings";
import { BROAD_BOOK_TOPICS } from "../src/data/contextual-timeline-topics";
import { NT_NARRATIVE_DETAILS } from "../src/data/contextual-timeline-nt";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, selectContextTimeline } from "../src/data/contextual-timeline";
import { JUDGES_INTERVALS, CHRONOLOGY_REVIEWS } from "../src/data/timeline-chronology-review";
import { formatTimelineYear } from "../src/lib/bible-timeline";

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
  for (const book of books.slice(39, 44)) {
    const covered = new Set<string>();
    for (const narrative of Object.values(NT_NARRATIVE_DETAILS).filter(item => item.collection === (book.name === "Acts" ? "paul" : "gospels"))) {
      for (const p of narrative.passages.filter(p => p.book === book.name)) {
        for (let chapter = p.startChapter; chapter <= p.endChapter; chapter++) {
          const last = chapter === p.endChapter ? p.endVerse : book.chapters[chapter - 1].verses.length;
          for (let verse = chapter === p.startChapter ? p.startVerse : 1; verse <= last; verse++) covered.add(`${chapter}:${verse}`);
        }
      }
    }
    for (const chapter of book.chapters.filter(chapter => book.name !== "Acts" || chapter.chapter >= 13)) for (const verse of chapter.verses) expect(covered.has(`${chapter.chapter}:${verse.verse}`), `${book.name} ${chapter.chapter}:${verse.verse}`).toBe(true);
  }
  for (const book of books) {
    expect(Object.keys(CHAPTER_TIMELINE_MAP[book.name]), book.name).toHaveLength(book.chapters.length);
    for (const chapter of book.chapters) {
      const selection = selectContextTimeline(records, book.name, chapter.chapter, "chapter", "biblical");
      expect(selection.mapped).toBe(true);
      expect(selection.records.some(record => record.emphasized)).toBe(true);
    }
  }
  expect(Object.keys(CHAPTER_TIMELINE_MAP).sort()).toEqual(books.map(book => book.name).sort());
  for (const book of BROAD_BOOK_TOPICS) {
    expect(book.topics.length, book.book).toBe(byName.get(book.book)!.chapters.length);
    expect(new Set(book.topics).size, book.book).toBe(book.topics.length);
    expect(book.topics.every(topic => topic.length > 10), book.book).toBe(true);
  }
  const citations = [...records.flatMap(record => record.references), ...WRITING_CONTEXTS.flatMap(w => w.references), ...Object.values(CHAPTER_TIMELINE_MAP).flatMap(chapters => Object.values(chapters).flatMap(mapping => mapping.references ?? []))];
  for (const ref of citations) {
    const [code, chapter, verse] = ref.split(".");
    expect(books[BOOK_ICON_CODES.findIndex(bookCode => bookCode === code)]?.chapters[Number(chapter) - 1]?.verses[Number(verse) - 1], ref).toBeDefined();
  }
  for (const writing of WRITING_CONTEXTS) expect(writing.chapters, writing.book).toHaveLength(byName.get(writing.book)!.chapters.length);
});

it("separates episodes without assigning neighbouring chapters each other's events", () => {
  const chapterIds = (book: string, chapter: number) => selectContextTimeline(records, book, chapter, "chapter", "biblical").records.filter(record => record.emphasized).map(record => record.id);
  expect(chapterIds("Luke", 10)).toEqual(expect.arrayContaining(["gospel-seventy", "gospel-good-samaritan", "gospel-martha-mary"]));
  expect(chapterIds("Luke", 9)).not.toContain("gospel-martha-mary");
  expect(chapterIds("Matthew", 17)).toContain("gospel-temple-tribute");
  expect(chapterIds("Mark", 9)).not.toContain("gospel-temple-tribute");
  expect(chapterIds("Acts", 16)).toEqual(expect.arrayContaining(["paul-philippi", "paul-philippi-prison", "paul-philippi-jailer"]));
  const paul = selectContextTimeline(records, "Acts", 16, "paul", "biblical").records.map(record => record.id);
  expect(paul.indexOf("paul-philippi")).toBeLessThan(paul.indexOf("paul-philippi-prison"));
  expect(paul.indexOf("paul-philippi-prison")).toBeLessThan(paul.indexOf("paul-philippi-jailer"));
  expect(new Set(records.map(record => record.id)).size).toBe(records.length);
});

it("keeps custody recollections and voyage episodes in their narrated chapters", () => {
  const ids = (chapter: number) => selectContextTimeline(records, "Acts", chapter, "chapter", "biblical").records.filter(record => record.emphasized).map(record => record.id);
  expect(ids(22)).toContain("paul-jerusalem-testimony");
  expect(ids(22)).not.toContain("paul-conversion");
  expect(ids(23)).toEqual(expect.arrayContaining(["paul-council-testimony", "paul-murder-plot", "paul-transfer"]));
  expect(ids(27)).toEqual(expect.arrayContaining(["paul-voyage", "paul-euroclydon", "paul-fourteenth-night", "paul-shipwreck"]));
  expect(ids(27)).not.toContain("paul-melita");
  expect(ids(28)).toContain("paul-melita");
  expect(records.find(record => record.id === "paul-voyage")).toMatchObject({ kind: "period", start: 60, end: 61 });
  expect(records.find(record => record.id === "paul-shipwreck")).toMatchObject({ kind: "event", start: 60 });
  expect(records.find(record => record.id === "paul-melita")).toMatchObject({ kind: "date-window", start: 60, end: 61 });
});

it("separates similar Gospel healings and parables by their actual passages", () => {
  const ids = (book: string, chapter: number) => selectContextTimeline(records, book, chapter, "chapter", "biblical").records.filter(record => record.emphasized).map(record => record.id);
  expect(ids("Mark", 8)).toEqual(expect.arrayContaining(["gospel-sign-leaven", "gospel-bethsaida-blind", "gospel-peter-confession", "gospel-first-passion-prediction", "gospel-take-up-cross"]));
  expect(ids("John", 9)).toEqual(expect.arrayContaining(["gospel-blind-shepherd", "gospel-blind-investigation", "gospel-spiritual-sight"]));
  expect(ids("John", 9)).not.toContain("gospel-bethsaida-blind");
  expect(ids("John", 10)).toContain("gospel-good-shepherd");
  expect(ids("John", 10)).not.toContain("gospel-blind-investigation");
  expect(ids("Matthew", 18)).toContain("gospel-matthew-lost-sheep");
  expect(ids("Luke", 15)).not.toContain("gospel-matthew-lost-sheep");
  expect(ids("Matthew", 20)).toContain("gospel-vineyard-labourers");
  expect(ids("Luke", 18)).not.toContain("gospel-vineyard-labourers");
  expect(ids("John", 11)).toEqual(expect.arrayContaining(["gospel-lazarus-news", "gospel-lazarus-raised", "gospel-council-ephraim"]));
  const scenes = records.filter(record => ["gospel-peter-confession", "gospel-blind-shepherd", "gospel-vineyard-labourers"].includes(record.id));
  for (const scene of scenes) expect(scene).toMatchObject({ kind: "date-window", start: 27, end: 30 });
});

it("retains exile constraints without inventing a seventy-year bar or Persian king identity", () => {
  const get = (id: string) => records.find(record => record.id === id)!;
  expect(get("return-decree").start! - get("temple-destroyed").start!).toBe(48);
  expect(get("second-temple").start! - get("temple-destroyed").start!).toBe(70);
  expect(get("return-decree").start! - get("daniel-babylon").start!).toBe(67);
  expect(get("chron-seventy-years").start).toBeUndefined();
  expect(get("chron-seventy-years").end).toBeUndefined();
  for (const id of ["nabonidus-reign", "cambyses-reign", "cambyses-egypt"]) {
    expect(get(id).track).toBe("historical");
    expect(get(id).references).toEqual([]);
    expect(get(id).personIds).toBeUndefined();
  }
  expect(formatTimelineYear(get("cambyses-egypt").start!)).toBe("525 BC");
  expect(CHAPTER_TIMELINE_MAP.Ezra[4].ids).not.toContain("cambyses-reign");
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  const review = CHRONOLOGY_REVIEWS.find(review => review.methodTitle === "Exile and the seventy years")!;
  for (const ref of review.references) {
    const [code, chapter, verse] = ref.split(".");
    expect(books[BOOK_ICON_CODES.indexOf(code)]?.chapters[+chapter - 1]?.verses[+verse - 1], ref).toBeDefined();
  }
  for (const [book, chapter, verse, wording] of [["Jeremiah", 29, 10, "seventy years"], ["2 Chronicles", 36, 21, "threescore and ten years"], ["Zechariah", 7, 5, "seventy years"]] as const) {
    const verseText = books.find(item => item.name === book)!.chapters[chapter - 1].verses[verse - 1].tokens.map(token => token.text).join(" ");
    expect(verseText).toContain(wording);
  }
});

it("keeps Luke's narrated settings and the separate Passion hearings intact", () => {
  const ids = (book: string, chapter: number) => selectContextTimeline(records, book, chapter, "chapter", "biblical").records.filter(record => record.emphasized).map(record => record.id);
  expect(ids("Luke", 14)).toEqual(expect.arrayContaining(["gospel-table-discipleship", "gospel-lowest-room", "gospel-great-supper", "gospel-cost-discipleship"]));
  expect(ids("Luke", 14)).not.toContain("gospel-luke-pharisee-meal");
  expect(ids("Luke", 15)).toEqual(expect.arrayContaining(["gospel-lost-found", "gospel-lost-coin", "gospel-lost-son"]));
  expect(ids("Luke", 17)).toContain("gospel-ten-lepers");
  expect(ids("Luke", 18)).not.toContain("gospel-ten-lepers");
  expect(ids("Luke", 18)).toEqual(expect.arrayContaining(["gospel-persistent-widow", "gospel-pharisee-publican"]));
  expect(ids("Luke", 23)).toContain("gospel-herod-hearing");
  expect(ids("Matthew", 27)).not.toContain("gospel-herod-hearing");
  expect(ids("John", 13)).toEqual(expect.arrayContaining(["gospel-foot-washing", "gospel-judas-departs", "gospel-new-commandment", "gospel-peter-warning"]));
  expect(ids("John", 13)).not.toContain("gospel-supper-greatness");
  expect(records.find(record => record.id === "gospel-rich-man-lazarus")!.personIds).toBeUndefined();
});

it("preserves the KJV custody intervals and keeps the Festus alternative conditional", () => {
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  const acts = books.find(book => book.name === "Acts")!;
  const text = (chapter: number, verse: number) => acts.chapters[chapter - 1].verses[verse - 1].tokens.map(token => token.text).join(" ");
  expect(text(24, 27)).toContain("after two years");
  expect(text(25, 6)).toContain("more than ten days");
  expect(text(28, 11)).toContain("after three months");
  expect(text(28, 30)).toContain("two whole years");
  const get = (id: string) => records.find(record => record.id === id)!;
  expect(get("paul-caesarea").end! - get("paul-caesarea").start!).toBe(2);
  expect(get("paul-rome").end! - get("paul-rome").start!).toBe(2);
  expect(get("paul-rome").start).toBe(61);
  const review = CHRONOLOGY_REVIEWS.find(review => review.methodTitle === "Paul, Festus and the journey to Rome")!;
  for (const ref of review.references) {
    const [code, chapter, verse] = ref.split(".");
    expect(code).toBe("ACT");
    expect(acts.chapters[+chapter - 1]?.verses[+verse - 1], ref).toBeDefined();
  }
  expect(review.text).toContain("conditional comparison");
});

it("keeps Roman history separate from biblical fulfillment and person identity", () => {
  const seneca = records.find(record => record.id === "seneca")!;
  expect(seneca.track).toBe("historical");
  expect(formatTimelineYear(seneca.start!)).toBe("1 BC");
  expect(seneca.personIds).toBeUndefined();
  expect(seneca.references).toEqual([]);
  const laterDestruction = records.find(record => record.id === "jerusalem-70")!;
  expect(laterDestruction).toMatchObject({ track: "historical", start: 70, kind: "event", references: [] });
  expect(CHAPTER_TIMELINE_MAP.Matthew[24].ids).not.toContain("jerusalem-70");
  expect(selectContextTimeline(records, "Acts", 18, "chapter", "historical").records.map(record => record.id)).toContain("seneca");
  expect(records.find(record => record.id === "gospel-crucifixion")!.sources).toContain("crucifixionStudy");
  expect(records.find(record => record.id === "josephus-antiquities")).toMatchObject({ track: "historical", kind: "date-window", start: 93, end: 94, references: [] });
  expect(records.find(record => record.id === "pliny-elder")).toMatchObject({ track: "historical", kind: "life", start: 23, end: 79, references: [] });
});

it("checks the judges review's stated intervals against the KJV without turning their sum into elapsed years", () => {
  const { books } = JSON.parse(readFileSync("public/data/kjv.json", "utf8")) as { books: Book[] };
  const numberWords: Record<number, string> = { 3: "three", 6: "six", 7: "seven", 8: "eight", 10: "ten", 18: "eighteen", 20: "twenty", 22: "twenty and two", 23: "twenty and three", 40: "forty", 80: "fourscore" };
  for (const [, years, ref] of JUDGES_INTERVALS) {
    const [, chapter, verse] = ref.split(".");
    const text = books[BOOK_ICON_CODES.indexOf("JDG")].chapters[+chapter - 1].verses[+verse - 1].tokens.map(token => token.text).join(" ").toLowerCase();
    expect(text, ref).toContain(`${numberWords[years]} years`);
  }
  expect(JUDGES_INTERVALS.reduce((sum, [, years]) => sum + years, 0)).toBe(410);
  expect(CHRONOLOGY_REVIEWS[0].text).toContain("double-counts overlap");
  expect(CHRONOLOGY_REVIEWS[0].references).toContain("JDG.15.20");
  for (const id of ["joshua_391", "samson_586"]) {
    const person = records.find(record => record.id === id);
    if (person) expect(person.start).toBeUndefined();
  }
});
