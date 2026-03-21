import { describe, expect, it } from "vitest";

import {
  buildVerseSearchIndex,
  buildRegexMatcher,
  createSearchableVerseEntry,
  extractSearchWords,
  matchSelectedWords,
  scoreSmartSearch,
  suggestConcordanceWords,
  suggestSmartCorrections,
} from "@/lib/search";
import type { Book } from "@/types/bible";

describe("search helpers", () => {
  it("extracts normalized token words from verse text", () => {
    expect(extractSearchWords('In the beginning, God made LORD\'S host.')).toEqual([
      "In",
      "the",
      "beginning",
      "God",
      "made",
      "LORD'S",
      "host",
    ]);
  });

  it("normalizes curly apostrophes for token search", () => {
    const entry = createSearchableVerseEntry("the brethren’s tents");

    expect(matchSelectedWords(entry, ["brethren's"], "contains-any", false)).toBe(
      true,
    );
  });

  it("builds verse search text from displayed divine-name casing", () => {
    const books: Book[] = [
      {
        name: "Exodus",
        chapters: [
          {
            chapter: 6,
            verses: [
              {
                verse: 3,
                tokens: [
                  { text: "by", punctuation: false, divineName: false },
                  { text: "my", punctuation: false, divineName: false },
                  { text: "name", punctuation: false, divineName: false },
                  { text: "Jehovah", punctuation: false, divineName: true },
                ],
              },
            ],
          },
        ],
      },
    ];

    const [entry] = buildVerseSearchIndex(books);

    expect(entry.text).toContain("JEHOVAH");
    expect(entry.searchWords).toContain("JEHOVAH");
  });

  it("matches contains-any and contains-all by token instead of substring", () => {
    const entry = createSearchableVerseEntry("The shell held the seed");

    expect(matchSelectedWords(entry, ["he"], "contains-any", false)).toBe(false);
    expect(matchSelectedWords(entry, ["the"], "contains-any", false)).toBe(true);
    expect(matchSelectedWords(entry, ["the", "seed"], "contains-all", false)).toBe(
      true,
    );
    expect(matchSelectedWords(entry, ["the", "missing"], "contains-all", false)).toBe(
      false,
    );
  });

  it("respects case sensitivity for token search", () => {
    const entry = createSearchableVerseEntry("LORD Lord lord");

    expect(matchSelectedWords(entry, ["lord"], "contains-any", false)).toBe(true);
    expect(matchSelectedWords(entry, ["lord"], "contains-any", true)).toBe(true);
    expect(matchSelectedWords(entry, ["LoRd"], "contains-any", true)).toBe(false);
  });

  it("builds regex matchers without global state", () => {
    const { regex, error } = buildRegexMatcher("faith", false);

    expect(error).toBeNull();
    expect(regex?.test("faith cometh")).toBe(true);
    expect(regex?.test("faith once delivered")).toBe(true);
  });

  it("returns an error for invalid regex patterns", () => {
    const { regex, error } = buildRegexMatcher("(", false);

    expect(regex).toBeNull();
    expect(error).toBeTruthy();
  });

  it("scores exact smart matches above typo-tolerant ones", () => {
    const exact = createSearchableVerseEntry("Faith cometh by hearing");
    const typo = createSearchableVerseEntry("Faint hearted men departed");

    expect(scoreSmartSearch(exact, "faith cometh", false)).toBeGreaterThan(
      scoreSmartSearch(typo, "faith cometh", false) ?? 0,
    );
  });

  it("finds useful smart matches for misspelled words", () => {
    const entry = createSearchableVerseEntry("Righteousness exalteth a nation");

    expect(scoreSmartSearch(entry, "righteosness", false)).toBeGreaterThan(0);
  });

  it("prefers verses where remembered words stay close together", () => {
    const close = createSearchableVerseEntry("Faith cometh by hearing");
    const scattered = createSearchableVerseEntry(
      "Faith is precious and hearing is needful",
    );

    expect(scoreSmartSearch(close, "faith hearing", false)).toBeGreaterThan(
      scoreSmartSearch(scattered, "faith hearing", false) ?? 0,
    );
  });

  it("rejects very weak multiword smart matches", () => {
    const unrelated = createSearchableVerseEntry("The king went down to battle");

    expect(scoreSmartSearch(unrelated, "righteosness sanctificashun glory", false)).toBeNull();
  });

  it("does not let filler words dominate smart ranking", () => {
    const substance = createSearchableVerseEntry("Faith cometh by hearing");
    const filler = createSearchableVerseEntry("The and of the and of");

    expect(scoreSmartSearch(substance, "the faith of", false)).toBeGreaterThan(
      scoreSmartSearch(filler, "the faith of", false) ?? 0,
    );
  });

  it("rewards compact partial remembered phrases", () => {
    const compact = createSearchableVerseEntry("The kingdom of heaven is at hand");
    const loose = createSearchableVerseEntry(
      "The kingdom was proclaimed, and later heaven itself was spoken of at hand",
    );

    expect(scoreSmartSearch(compact, "kingdom heaven at hand", false)).toBeGreaterThan(
      scoreSmartSearch(loose, "kingdom heaven at hand", false) ?? 0,
    );
  });

  it("finds phonetically similar Bible names", () => {
    const methuselah = createSearchableVerseEntry("Methuselah lived nine hundred years");
    const melchisedec = createSearchableVerseEntry("Melchisedec king of Salem brought forth bread");

    expect(scoreSmartSearch(methuselah, "muthuzula", false)).toBeGreaterThan(0);
    expect(scoreSmartSearch(melchisedec, "melchizedek", false)).toBeGreaterThan(0);
  });

  it("prefers the right phonetically similar name over unrelated text", () => {
    const target = createSearchableVerseEntry("Mathusala begat Lamech");
    const unrelated = createSearchableVerseEntry("Many men gathered to battle");

    expect(scoreSmartSearch(target, "methuzalu", false)).toBeGreaterThan(
      scoreSmartSearch(unrelated, "methuzalu", false) ?? 0,
    );
  });

  it("requires quoted smart phrases exactly", () => {
    const exact = createSearchableVerseEntry("For God so loved the world");
    const fuzzyOnly = createSearchableVerseEntry("God loveth all the world");

    expect(scoreSmartSearch(exact, '"loved the world"', false)).toBeGreaterThan(0);
    expect(scoreSmartSearch(fuzzyOnly, '"loved the world"', false)).toBeNull();
  });

  it("prefers exact word matches over fuzzy lookalikes", () => {
    const exact = createSearchableVerseEntry("God loved Jacob");
    const fuzzy = createSearchableVerseEntry("God liveth for ever");

    expect(scoreSmartSearch(exact, "god loved", false)).toBeGreaterThan(
      scoreSmartSearch(fuzzy, "god loved", false) ?? 0,
    );
  });

  it("suggests likely Bible-name completions before short generic words", () => {
    const suggestions = suggestSmartCorrections(
      "methu",
      ["met", "mithcah", "methuselah", "mathusala", "metal"],
      3,
    ).map((entry) => entry.word);

    expect(suggestions[0]).toBe("methuselah");
    expect(suggestions).toContain("mathusala");
    expect(suggestions).not.toContain("met");
  });

  it("uses phonetic similarity for hard Bible-name suggestions", () => {
    const suggestions = suggestSmartCorrections(
      "methus",
      ["mithcah", "melchisedec", "methuselah", "mathusala"],
      3,
    ).map((entry) => entry.word);

    expect(suggestions[0]).toBe("methuselah");
    expect(suggestions[1]).toBe("mathusala");
  });

  it("keeps prefix concordance suggestions ahead of earlier includes matches", () => {
    const suggestions = suggestConcordanceWords(
      [
        "attest",
        "contest",
        "detest",
        "protest",
        "restest",
        "test",
        "testament",
        "tester",
        "testing",
      ],
      "test",
      [],
      5,
    );

    expect(suggestions).toEqual([
      "test",
      "testament",
      "tester",
      "testing",
      "attest",
    ]);
    expect(suggestions).not.toContain("restest");
  });
});
