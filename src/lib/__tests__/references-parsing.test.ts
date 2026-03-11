import { describe, expect, it } from "vitest";

import {
  chapterVerseKey,
  escapeRegExp,
  normalizeStrongsCode,
  parseBibleReference,
} from "@/lib/references";

describe("reference parsing helpers", () => {
  it("normalizes strongs codes", () => {
    expect(normalizeStrongsCode("g25")).toBe("G0025");
    expect(normalizeStrongsCode(" H 430 ")).toBe("H0430");
    expect(normalizeStrongsCode("abc")).toBeNull();
  });

  it("parses single-chapter and cross-chapter references", () => {
    expect(parseBibleReference("GEN.1.2-5")).toEqual({
      bookIndex: 0,
      startChapterIndex: 0,
      endChapterIndex: 0,
      startVerse: 2,
      endVerse: 5,
      bookCode: "GEN",
    });

    expect(parseBibleReference("1CH.10.14:11.3")).toEqual({
      bookIndex: 12,
      startChapterIndex: 9,
      endChapterIndex: 10,
      startVerse: 14,
      endVerse: 3,
      bookCode: "1CH",
    });

    expect(parseBibleReference("BAD.1.1")).toBeNull();
  });

  it("formats chapter verse keys and escapes regex", () => {
    expect(chapterVerseKey(42, 2, 16)).toBe("JHN.3.16");
    expect(escapeRegExp("a+b?c")).toBe("a\\+b\\?c");
  });
});
