import { describe, expect, it } from "vitest";

import {
  buildSearchFacets,
  compareSearchMatchesCanonically,
  formatSearchResultsText,
  parseSearchDefinition,
  searchMatchKey,
} from "@/lib/search-features";
import type { SearchDefinition, SearchMatch } from "@/types/reader";

const definition: SearchDefinition = {
  searchMode: "smart",
  caseSensitive: false,
  phraseInput: "work together",
  selectedWords: [],
  selectedBookIndexes: [44, 0, 44],
  resultSort: "relevance",
  showResultContext: false,
};

const matches: SearchMatch[] = [
  {
    bookIndex: 44,
    chapterIndex: 7,
    verseNumber: 28,
    bookName: "Romans",
    text: "All things work together for good.",
  },
  {
    bookIndex: 0,
    chapterIndex: 0,
    verseNumber: 1,
    bookName: "Genesis",
    text: "In the beginning God created the heaven and the earth.",
  },
  {
    bookIndex: 44,
    chapterIndex: 11,
    verseNumber: 4,
    bookName: "Romans",
    text: "We have many members in one body.",
  },
];

describe("search feature helpers", () => {
  it("validates and normalizes the shareable search definition", () => {
    expect(parseSearchDefinition(definition)).toEqual({
      ...definition,
      selectedBookIndexes: [0, 44],
    });
    expect(
      parseSearchDefinition({ ...definition, phraseInput: "" }),
    ).toBeNull();
    expect(
      parseSearchDefinition({ ...definition, selectedBookIndexes: [] }),
    ).toBeNull();
    expect(
      parseSearchDefinition({ ...definition, resultSort: "unknown" }),
    ).toBeNull();
  });

  it("builds loaded-result facets by testament and canonical book order", () => {
    expect(buildSearchFacets(matches)).toEqual({
      total: 3,
      oldTestament: 1,
      newTestament: 2,
      books: [
        { bookIndex: 0, bookName: "Genesis", count: 1 },
        { bookIndex: 44, bookName: "Romans", count: 2 },
      ],
    });
  });

  it("offers canonical sorting without mutating relevance order", () => {
    const relevanceOrder = [...matches];
    const canonical = [...matches].sort(compareSearchMatchesCanonically);

    expect(canonical.map(searchMatchKey)).toEqual([
      "0:0:1",
      "44:7:28",
      "44:11:4",
    ]);
    expect(matches).toEqual(relevanceOrder);
  });

  it("formats deterministic copy/export text with optional context", () => {
    const text = formatSearchResultsText({
      summary: "Smart • work together • 66/66 books",
      results: [matches[0]],
      contextByMatchKey: new Map([
        [
          searchMatchKey(matches[0]),
          {
            previous: null,
            next: {
              ...matches[0],
              verseNumber: 29,
              text: "For whom he did foreknow.",
            },
          },
        ],
      ]),
    });

    expect(text).toContain("Romans 8:28 — All things work together for good.");
    expect(text).toContain("After (29) For whom he did foreknow.");
  });
});
