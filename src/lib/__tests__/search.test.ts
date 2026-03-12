import { describe, expect, it } from "vitest";

import {
  buildRegexMatcher,
  createSearchableVerseEntry,
  extractSearchWords,
  matchSelectedWords,
} from "@/lib/search";

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
});
