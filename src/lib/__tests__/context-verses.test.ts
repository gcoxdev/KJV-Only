import { describe, expect, it } from "vitest";

import {
  clampContextVerseCount,
  MAX_CONTEXT_VERSE_COUNT,
  MIN_CONTEXT_VERSE_COUNT,
} from "@/lib/context-verses";

describe("context verse preferences", () => {
  it("rounds and bounds the number of verses shown on each side", () => {
    expect(clampContextVerseCount(2.6)).toBe(3);
    expect(clampContextVerseCount(0)).toBe(MIN_CONTEXT_VERSE_COUNT);
    expect(clampContextVerseCount(100)).toBe(MAX_CONTEXT_VERSE_COUNT);
  });

  it("uses the safe minimum for non-finite values", () => {
    expect(clampContextVerseCount(Number.NaN)).toBe(MIN_CONTEXT_VERSE_COUNT);
    expect(clampContextVerseCount(Number.POSITIVE_INFINITY)).toBe(
      MIN_CONTEXT_VERSE_COUNT,
    );
  });
});
