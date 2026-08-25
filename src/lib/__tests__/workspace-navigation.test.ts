import { describe, expect, it } from "vitest";

import {
  isDedicatedLeafViewTab,
  nextSearchTabTitle,
  panelNodeContainsView,
} from "@/lib/workspace-navigation";
import type { LeafNode, PanelNode, ReaderTab } from "@/types/reader";

function leaf(id: string, view: LeafNode["view"]): LeafNode {
  return {
    id,
    type: "leaf",
    view,
    bookIndex: 0,
    chapterIndex: 0,
    pickerTestament: null,
    pickerBookIndex: null,
    pageId: null,
  };
}

function tab(id: string, title: string, root: PanelNode): ReaderTab {
  return { id, title, root };
}

describe("workspace navigation helpers", () => {
  it("finds a view nested anywhere in a panel tree", () => {
    const root: PanelNode = {
      id: "root",
      type: "split",
      orientation: "horizontal",
      ratio: 50,
      first: leaf("reader", "reader"),
      second: {
        id: "nested",
        type: "split",
        orientation: "vertical",
        ratio: 50,
        first: leaf("notes", "notes"),
        second: leaf("search", "search"),
      },
    };

    expect(panelNodeContainsView(root, "search")).toBe(true);
    expect(panelNodeContainsView(root, "tools")).toBe(false);
  });

  it("recognizes dedicated tabs without treating split tabs as dedicated", () => {
    const dedicated = tab("tools", "Tools", leaf("tools-leaf", "tools"));
    const splitTab = tab("split", "Mixed", {
      id: "root",
      type: "split",
      orientation: "horizontal",
      ratio: 50,
      first: leaf("reader", "reader"),
      second: leaf("tools", "tools"),
    });

    expect(isDedicatedLeafViewTab(dedicated, "tools")).toBe(true);
    expect(isDedicatedLeafViewTab(splitTab, "tools")).toBe(false);
  });

  it("preserves the existing case-insensitive search tab numbering", () => {
    const tabs = [
      tab("one", "Search", leaf("one-leaf", "search")),
      tab("two", "SEARCH results", leaf("two-leaf", "search")),
      tab("three", "Notes", leaf("three-leaf", "notes")),
    ];

    expect(nextSearchTabTitle([])).toBe("Search");
    expect(nextSearchTabTitle(tabs)).toBe("Search 3");
  });
});
