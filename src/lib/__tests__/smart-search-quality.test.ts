import { describe, expect, it } from "vitest";
import {
  buildSmartSearchLookup, createSearchableVerseEntry,
  getIndexedSmartSearchCandidateIndexes, isSmartSearchCandidate,
  prepareSmartSearch, scorePreparedSmartSearch,
} from "@/lib/search";

// Reviewed KJV excerpts and misleading alternatives, shared by both search paths.
const cases = [
  { query: "righteosness", text: "Righteousness exalteth a nation: but sin is a reproach to any people.", unrelated: "The king went down to battle." },
  { query: "begnning", text: "In the beginning God created the heaven and the earth.", unrelated: "And the evening and the morning were the first day." },
  { query: "sheperd", text: "The LORD is my shepherd; I shall not want.", unrelated: "And Adam called his wife's name Eve; because she was the mother of all living." },
  { query: "melchizedek", text: "And Melchizedek king of Salem brought forth bread and wine: and he was the priest of the most high God.", unrelated: "And the children of Israel did evil in the sight of the LORD." },
  { query: "nebuchadnezer", text: "Nebuchadnezzar the king made an image of gold", unrelated: "Now the sons of Issachar were, Tola, and Puah, Jashub, and Shimrom, four." },
  { query: "mercy endureth ever", text: "O give thanks unto the LORD; for he is good: for his mercy endureth for ever.", unrelated: "The king went down to battle." },
  { query: "work together good", text: "And we know that all things work together for good to them that love God", unrelated: "Six days shalt thou labour, and do all thy work" },
  { query: "still small voice", text: "and after the fire a still small voice.", unrelated: "And the LORD spake unto Moses, saying," },
];

describe("reviewed smart-search quality corpus", () => {
  it("does not let short prefix words crowd out a misspelled shepherd search", () => {
    const prepared = prepareSmartSearch("sheperd", false)!;
    const entries = ["she", "shepherd", "shepherds"].map((text, index) => ({
      ...createSearchableVerseEntry(text),
      bookIndex: 0, chapterIndex: 0, verseNumber: index + 1, bookName: "Fixture",
    }));

    expect(getIndexedSmartSearchCandidateIndexes(buildSmartSearchLookup(entries), prepared)).toEqual([1, 2]);
    expect(isSmartSearchCandidate(entries[0], prepared)).toBe(false);
    expect(scorePreparedSmartSearch(entries[0], prepared, new Map())).toBeNull();
    expect(scorePreparedSmartSearch(entries[1], prepared, new Map())).toBeGreaterThan(0);

    // Intentional prefix searches still complete the typed word.
    expect(scorePreparedSmartSearch(entries[1], prepareSmartSearch("shep", false)!, new Map())).toBeGreaterThan(0);
  });

  it.each(cases)("finds $query through indexed and fallback search", ({ query, text, unrelated }) => {
    const prepared = prepareSmartSearch(query, false)!;
    const entries = [unrelated, text].map((value, index) => ({
      ...createSearchableVerseEntry(value),
      bookIndex: 0, chapterIndex: 0, verseNumber: index + 1, bookName: "Fixture",
    }));
    expect(getIndexedSmartSearchCandidateIndexes(buildSmartSearchLookup(entries), prepared)).toContain(1);
    expect(isSmartSearchCandidate(entries[1], prepared)).toBe(true);
    const score = scorePreparedSmartSearch(entries[1], prepared, new Map());
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(scorePreparedSmartSearch(entries[0], prepared, new Map()) ?? 0);
  });

  it.each([
    ["predestinate", "They protest against the decree"],
    ["predestinate", "Thou pouredst out thy wrath"],
    ["righteosness sanctificashun glory", "The king went down to battle"],
  ])("rejects the misleading match %s / %s", (query, text) => {
    expect(scorePreparedSmartSearch(createSearchableVerseEntry(text), prepareSmartSearch(query, false)!, new Map())).toBeNull();
  });

  it.each([
    ['"love"', "For the Father loveth the Son"],
    ['"love"', "To the beloved brethren"],
    ['"love"', "love's power"],
    ['"love"', "love-kindness"],
    ['"still small voice"', "a still small voiced answer"],
  ])("rejects a partial quoted word in %s / %s", (query, text) => {
    const prepared = prepareSmartSearch(query, false)!;
    const entry = createSearchableVerseEntry(text);
    expect(isSmartSearchCandidate(entry, prepared)).toBe(false);
    expect(scorePreparedSmartSearch(entry, prepared, new Map())).toBeNull();
  });

  it.each([
    ['"love"', "Love, joy, peace"],
    ['"love"', "'love'"],
    ['"love"', "beloved, love one another"],
    ['"still small voice"', "and after the fire a still small voice."],
  ])("retains the exact quoted phrase in %s / %s", (query, text) => {
    const prepared = prepareSmartSearch(query, false)!;
    const entry = createSearchableVerseEntry(text);
    expect(isSmartSearchCandidate(entry, prepared)).toBe(true);
    expect(scorePreparedSmartSearch(entry, prepared, new Map())).toBeGreaterThan(0);
  });

  it("respects case for quoted phrases", () => {
    const entry = createSearchableVerseEntry("The LORD is my shepherd");
    expect(scorePreparedSmartSearch(entry, prepareSmartSearch('"the LORD"', true)!, new Map())).toBeNull();
    expect(scorePreparedSmartSearch(entry, prepareSmartSearch('"The LORD"', true)!, new Map())).toBeGreaterThan(0);
  });
});
