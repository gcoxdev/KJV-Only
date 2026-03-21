import { describe, expect, it } from "vitest";

import {
  buildTargetedReaderPanelInTabState,
  resolveTargetedReaderPanelAction,
} from "@/hooks/use-panel-routing";
import { contextFromNoteLinkTarget } from "@/hooks/use-word-study-navigation";
import type { ReaderTab } from "@/types/reader";
import type { NoteLinkTarget } from "@/types/notes";

function leaf(
  id: string,
  overrides: Partial<ReaderTab["root"]> = {},
): ReaderTab["root"] {
  return {
    id,
    type: "leaf",
    view: "picker",
    bookIndex: 0,
    chapterIndex: 0,
    pickerTestament: null,
    pickerBookIndex: null,
    pageId: null,
    ...overrides,
  };
}

describe("panel routing helpers", () => {
  it("maps note word links back into word notes context", () => {
    const target: NoteLinkTarget = {
      type: "word",
      bookIndex: 1,
      chapterIndex: 2,
      verseNumber: 3,
      word: "grace",
    };

    expect(contextFromNoteLinkTarget(target)).toEqual({
      bookIndex: 1,
      chapterIndex: 2,
      verseNumber: 3,
      word: "grace",
    });
  });

  it("maps note range links to the range start for context selection", () => {
    const target: NoteLinkTarget = {
      type: "range",
      start: {
        bookIndex: 3,
        chapterIndex: 4,
        verseNumber: 5,
      },
      end: {
        bookIndex: 3,
        chapterIndex: 5,
        verseNumber: 6,
      },
    };

    expect(contextFromNoteLinkTarget(target)).toEqual({
      bookIndex: 3,
      chapterIndex: 4,
      verseNumber: 5,
    });
  });

  it("creates a targeted reader panel in the active tab", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Welcome Home",
        root: leaf("home", { view: "page", pageId: "welcome-home" }),
      },
      {
        id: "tab-2",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    const result = buildTargetedReaderPanelInTabState(tabs, "tab-2", {
      type: "verse",
      bookIndex: 42,
      chapterIndex: 3,
      verseNumber: 16,
    });

    expect(result).not.toBeNull();
    expect(result?.nextLeafId).toBeTruthy();
    expect(result?.nextTabs).toHaveLength(2);
    expect(result?.nextTabs[0]).toEqual(tabs[0]);
    expect(result?.nextTabs[1].root).toMatchObject({
      type: "split",
      orientation: "horizontal",
      ratio: 42,
      first: tabs[1].root,
    });
    expect((result?.nextTabs[1].root as Extract<ReaderTab["root"], { type: "split" }>).second).toMatchObject({
      id: result?.nextLeafId,
      type: "leaf",
      view: "reader",
      bookIndex: 42,
      chapterIndex: 3,
    });
  });

  it("uses the start chapter when creating a targeted range panel", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    const result = buildTargetedReaderPanelInTabState(tabs, "tab-1", {
      type: "range",
      start: {
        bookIndex: 42,
        chapterIndex: 7,
        verseNumber: 53,
      },
      end: {
        bookIndex: 42,
        chapterIndex: 8,
        verseNumber: 11,
      },
    });

    expect(result).not.toBeNull();
    expect((result?.nextTabs[0].root as Extract<ReaderTab["root"], { type: "split" }>).second).toMatchObject({
      view: "reader",
      bookIndex: 42,
      chapterIndex: 7,
    });
  });

  it("returns null when there is no active tab to target", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    expect(
      buildTargetedReaderPanelInTabState(tabs, null, {
        type: "chapter",
        bookIndex: 0,
        chapterIndex: 0,
      }),
    ).toBeNull();
  });

  it("reuses the targeted panel when it still exists", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    expect(
      resolveTargetedReaderPanelAction(tabs, "reader", "tab-1"),
    ).toEqual({
      type: "reuse",
      tabId: "tab-1",
      leafId: "reader",
    });
  });

  it("creates a new targeted panel in the active tab when the target is missing", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    expect(
      resolveTargetedReaderPanelAction(tabs, "missing-leaf", "tab-1"),
    ).toEqual({
      type: "create-in-active-tab",
    });
  });

  it("falls back to a normal new-panel path when there is no active tab to create into", () => {
    const tabs: ReaderTab[] = [
      {
        id: "tab-1",
        title: "Genesis 1",
        root: leaf("reader", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      },
    ];

    expect(
      resolveTargetedReaderPanelAction(tabs, "missing-leaf", null),
    ).toEqual({
      type: "fallback-new-panel",
    });
  });
});
