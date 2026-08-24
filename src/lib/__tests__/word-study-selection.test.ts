import { describe, expect, it } from "vitest";

import {
  deriveTokenAccordionState,
  findGenealogyMatches,
  findMapMatches,
  resolveAIDictionarySelectionAtLocation,
  resolvePhraseSelectionAtLocation,
  resolveWordTokenAtLocation,
} from "@/lib/word-study-selection";
import type { Book } from "@/types/bible";
import type {
  AIDictionaryPayload,
  GenealogyPayload,
  PhrasesPayload,
} from "@/types/reader";

const books: Book[] = [
  {
    name: "Genesis",
    chapters: [
      {
        chapter: 1,
        verses: [
          {
            verse: 1,
            tokens: [
              { text: "In" },
              { text: "the" },
              { text: "beginning" },
              { text: "God", strong: "H0430" },
              { text: "created" },
              { text: "the" },
              { text: "heaven" },
              { text: "and" },
              { text: "the" },
              { text: "earth." },
            ],
          },
          {
            verse: 2,
            tokens: [
              { text: "Word" },
              { text: "and" },
              { text: "word,", strong: "G3056" },
            ],
          },
        ],
      },
    ],
  },
];

describe("word-study location selection", () => {
  it("prefers the longest phrase containing the clicked token", () => {
    const phrases: PhrasesPayload = {
      "the beginning": { meaning: "Short match" },
      "in the beginning": { meaning: "Longest match" },
    };

    expect(
      resolvePhraseSelectionAtLocation(books, phrases, 0, 0, 1, 1),
    ).toEqual({
      key: "in the beginning",
      entry: phrases["in the beginning"],
    });
    expect(
      resolvePhraseSelectionAtLocation(books, phrases, 0, 0, 99, 1),
    ).toBeNull();
  });

  it("resolves AI dictionary phrase aliases at the clicked token", () => {
    const dictionary: AIDictionaryPayload = {
      "make the world": {
        definitions: ["Create the world."],
        aliases: ["created the heaven"],
      },
    };

    expect(
      resolveAIDictionarySelectionAtLocation(
        books,
        dictionary,
        0,
        0,
        1,
        5,
      ),
    ).toEqual({
      key: "make the world",
      entry: dictionary["make the world"],
    });
  });

  it("prefers a Strong's-tagged duplicate token and keeps a plain fallback", () => {
    expect(resolveWordTokenAtLocation(books, 0, 0, 2, "word")).toEqual({
      token: { text: "word,", strong: "G3056" },
      tokenIndex: 2,
    });
    expect(resolveWordTokenAtLocation(books, 0, 0, 2, "and")).toEqual({
      token: { text: "and" },
      tokenIndex: 1,
    });
    expect(resolveWordTokenAtLocation(books, 0, 0, 2, "missing")).toBeNull();
  });

  it("normalizes straight and curly apostrophes for token lookup", () => {
    const apostropheBooks: Book[] = [
      {
        name: "Test",
        chapters: [
          {
            chapter: 1,
            verses: [{ verse: 1, tokens: [{ text: "Jacob’s" }] }],
          },
        ],
      },
    ];

    expect(
      resolveWordTokenAtLocation(apostropheBooks, 0, 0, 1, "Jacob's"),
    ).toEqual({ token: { text: "Jacob’s" }, tokenIndex: 0 });
  });
});

describe("word-study payload matching", () => {
  const genealogy: GenealogyPayload = [
    {
      id: "exact",
      names: ["Adam"],
    },
    {
      id: "frequent",
      names: ["A man"],
      verses: {
        byName: [{ name: "Adam", verses: ["GEN.2.7", "GEN.3.17"] }],
        totalVerses: 20,
      },
    },
    {
      id: "current",
      names: ["The first man"],
      verses: {
        byName: [{ name: "Adam", verses: ["GEN.1.1"] }],
        totalVerses: 1,
      },
    },
    {
      id: "current",
      names: ["Duplicate Adam"],
      verses: {
        byName: [{ name: "Adam", verses: ["GEN.1.1"] }],
        totalVerses: 0,
      },
    },
  ];

  it("ranks current-reference, verse-backed, then exact-name genealogy matches", () => {
    expect(
      findGenealogyMatches(genealogy, "Adam", "GEN.1.1").map(
        (person) => person.id,
      ),
    ).toEqual(["current", "frequent", "exact"]);
    expect(findGenealogyMatches(genealogy, "nobody")).toEqual([]);
  });

  it("matches map translations with punctuation and Unicode dash normalization", () => {
    const bathSheba = {
      translations: ["Bath-sheba"],
      modern_names: [],
      types: ["settlement"],
      verses: [],
      geojson_file: "bath-sheba.geojson",
    };
    const maps = [
      bathSheba,
      {
        translations: ["Jerusalem"],
        modern_names: [],
        types: ["city"],
        verses: [],
        geojson_file: "jerusalem.geojson",
      },
    ];

    expect(findMapMatches(maps, "Bath–sheba,")).toEqual([bathSheba]);
    expect(findMapMatches(maps, "Bethlehem")).toEqual([]);
  });

  it("derives the existing accordion order from matching payloads", () => {
    const mapEntry = {
      translations: ["Adam"],
      modern_names: [],
      types: ["person"],
      verses: [],
      geojson_file: "adam.geojson",
    };

    expect(
      deriveTokenAccordionState("Adam", {
        bookIndex: 0,
        chapterIndex: 0,
        verseNumber: 1,
        concordanceData: {
          verses: ["GEN.1.1"],
          words: { Adam: [0] },
        },
        webstersData: { Adam: { definitions: [] } },
        aiDictionaryData: { Adam: { definitions: ["A man."] } },
        bibleWordBookData: { Adam: { meaning: "Man", body: "A man." } },
        strongCode: "G0001",
        strongsGreekData: { G0001: { lemma: "alpha" } },
        strongsHebrewData: {},
        ancientMapsData: [mapEntry],
        hitchcocksData: { Adam: "Red earth" },
        oldEnglishData: { Adam: ["A test definition"] },
        genealogyData: genealogy,
      }),
    ).toEqual([
      "cross-refs",
      "concordance",
      "websters",
      "ai-dictionary",
      "bible-word-book",
      "strongs",
      "maps",
      "hitchcocks",
      "kjv-words-phrases",
      "genealogy",
    ]);
  });
});
