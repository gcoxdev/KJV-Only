import { describe, expect, it } from "vitest";

import { LAYOUT_HASH_LIMITS, parseLayoutHash } from "@/lib/layout-hash";

describe("layout hash invalid cases", () => {
  it("returns null for malformed hashes", () => {
    expect(parseLayoutHash("")).toBeNull();
    expect(parseLayoutHash("#tab=0")).toBeNull();
    expect(parseLayoutHash("#layout=BadTabWithoutColon")).toBeNull();
    expect(parseLayoutHash("#layout=Tab:broken(")).toBeNull();
  });

  it("falls back safely for malformed titles and clamps active tab index", () => {
    const parsed = parseLayoutHash("#tab=99&tabs=h&layout=%E0%A4%A:GEN.1|Notes:notes");
    expect(parsed).not.toBeNull();
    expect(parsed?.activeTabIndex).toBe(1);
    expect(parsed?.tabs[0]?.title).toBe("Tab 1");
    expect(parsed?.tabs[1]?.title).toBe("Notes");
  });

  it("rejects hashes beyond the aggregate byte and tab budgets", () => {
    expect(
      parseLayoutHash(`#layout=${"x".repeat(LAYOUT_HASH_LIMITS.maxHashLength)}`),
    ).toBeNull();

    const tabs = Array.from(
      { length: LAYOUT_HASH_LIMITS.maxTabs + 1 },
      (_, index) => `Tab${index}:GEN.1`,
    ).join("|");
    expect(parseLayoutHash(`#layout=${tabs}`)).toBeNull();
  });

  it("rejects excessive tree depth and verse-range cardinality", () => {
    let tree = "GEN.1";
    for (let index = 0; index <= LAYOUT_HASH_LIMITS.maxTreeDepth; index += 1) {
      tree = `h50(${tree};GEN.1)`;
    }
    expect(parseLayoutHash(`#layout=Deep:${tree}`)).toBeNull();

    const ranges = Array.from(
      { length: LAYOUT_HASH_LIMITS.maxVerseRanges + 1 },
      (_, index) => String(index + 1),
    ).join(",");
    expect(parseLayoutHash(`#layout=Ranges:GEN.1.${ranges}`)).toBeNull();
  });

  it("rejects an invalid tab atomically instead of applying a partial layout", () => {
    expect(parseLayoutHash("#layout=Reader:GEN.1|Broken:broken(")).toBeNull();
  });
});
