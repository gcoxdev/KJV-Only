import { describe, expect, it } from "vitest";

import { parseLayoutHash } from "@/lib/layout-hash";

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
});
