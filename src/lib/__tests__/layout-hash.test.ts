import { describe, expect, it } from "vitest";

import { parseLayoutHash, serializeLayoutHash } from "@/lib/layout-hash";
import type { ReaderTab } from "@/types/reader";

describe("layout hash", () => {
  it("serializes and parses nested layouts with titles and highlights", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Main Study",
        root: {
          id: "split-1",
          type: "split",
          orientation: "horizontal",
          ratio: 60,
          first: {
            id: "leaf-1",
            type: "leaf",
            view: "reader",
            bookIndex: 0,
            chapterIndex: 0,
            pickerTestament: null,
            pickerBookIndex: null,
            pageId: null,
          },
          second: {
            id: "leaf-2",
            type: "leaf",
            view: "page",
            bookIndex: 0,
            chapterIndex: 0,
            pickerTestament: null,
            pickerBookIndex: null,
            pageId: "about",
          },
        },
      },
      {
        id: "tab-2",
        title: "Notes",
        root: {
          id: "leaf-3",
          type: "leaf",
          view: "notes",
          bookIndex: 0,
          chapterIndex: 0,
          pickerTestament: null,
          pickerBookIndex: null,
          pageId: null,
        },
      },
    ];

    const hash = serializeLayoutHash({
      tabs,
      activeTabId: "tab-2",
      tabsOrientation: "vertical",
      highlightedVerseRangesByLeafId: {
        "leaf-1": [
          { start: 3, end: 5 },
          { start: 9, end: 9 },
          { start: 11, end: 12 },
        ],
      },
    });

    expect(hash).toContain("#tab=1");
    expect(hash).toContain("tabs=v");
    expect(hash).toContain("Main%20Study");
    expect(hash).toContain("GEN.1.3-5,9,11-12");

    const parsed = parseLayoutHash(hash);
    expect(parsed).not.toBeNull();
    expect(parsed?.activeTabIndex).toBe(1);
    expect(parsed?.tabsOrientation).toBe("vertical");
    expect(parsed?.tabs.map((tab) => tab.title)).toEqual(["Main Study", "Notes"]);
    expect(parsed?.tabs[0]?.root.type).toBe("split");
    expect(Object.values(parsed?.highlightedVerseRangesByLeafId ?? {})).toContainEqual([
      { start: 3, end: 5 },
      { start: 9, end: 9 },
      { start: 11, end: 12 },
    ]);
  });
});
