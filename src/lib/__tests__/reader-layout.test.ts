import { describe, expect, it } from "vitest";

import {
  closeLeafInTab,
  collectLeafIds,
  extractLeafNode,
  findGroupTargetNodeId,
  findLeafNode,
  findParentSplitForLeaf,
  insertLeafIntoParentGroup,
  removeLeafNode,
  splitPanelNode,
  swapLeafContent,
} from "@/lib/reader-layout";
import type { LeafNode, PanelNode } from "@/types/reader";

function leaf(id: string, bookIndex: number, chapterIndex: number): LeafNode {
  return {
    id,
    type: "leaf",
    view: "reader",
    bookIndex,
    chapterIndex,
    pickerTestament: null,
    pickerBookIndex: null,
    pageId: null,
  };
}

function customLeaf(
  id: string,
  overrides: Partial<LeafNode>,
): LeafNode {
  return {
    ...leaf(id, 0, 0),
    ...overrides,
    id,
    type: "leaf",
  };
}

function split(
  id: string,
  orientation: "horizontal" | "vertical",
  first: PanelNode,
  second: PanelNode,
): PanelNode {
  return { id, type: "split", orientation, ratio: 50, first, second };
}

describe("reader layout helpers", () => {
  it("splits a target leaf and returns the created leaf id", () => {
    const root = leaf("a", 0, 0);
    const result = splitPanelNode(root, "a", "right");

    expect(result.createdLeafId).not.toBeNull();
    expect(result.next.type).toBe("split");
    expect(collectLeafIds(result.next)).toHaveLength(2);
  });

  it("removes and extracts leaves correctly", () => {
    const root = split("root", "horizontal", leaf("a", 0, 0), leaf("b", 1, 0));

    const removed = removeLeafNode(root, "a");
    expect(removed.removed).toBe(true);
    expect(removed.next).toEqual(leaf("b", 1, 0));

    const extracted = extractLeafNode(root, "b");
    expect(extracted.extracted?.id).toBe("b");
    expect(extracted.next).toEqual(leaf("a", 0, 0));
  });

  it("resets a single-leaf tab back to picker when closing the leaf", () => {
    const tab = {
      id: "tab-1",
      title: "Welcome Home",
      root: customLeaf("solo", {
        view: "page",
        pageId: "welcome-home",
      }),
    };

    const next = closeLeafInTab(tab, "solo");

    expect(next.root).toMatchObject({
      id: "solo",
      type: "leaf",
      view: "picker",
      pageId: "welcome-home",
      pickerTestament: null,
      pickerBookIndex: null,
    });
  });

  it("removes a leaf from a multi-leaf tab when closing it", () => {
    const tab = {
      id: "tab-1",
      title: "Genesis 1",
      root: split(
        "root",
        "horizontal",
        customLeaf("left", { view: "picker" }),
        customLeaf("right", {
          view: "reader",
          bookIndex: 0,
          chapterIndex: 0,
        }),
      ),
    };

    const next = closeLeafInTab(tab, "left");

    expect(next.root).toMatchObject({
      id: "right",
      type: "leaf",
      view: "reader",
      bookIndex: 0,
      chapterIndex: 0,
    });
  });

  it("swaps leaf content without changing ids", () => {
    const root = split("root", "horizontal", leaf("a", 0, 0), leaf("b", 1, 1));
    const next = swapLeafContent(root, "a", "b");

    expect(findLeafNode(next, "a")).toMatchObject({ bookIndex: 1, chapterIndex: 1 });
    expect(findLeafNode(next, "b")).toMatchObject({ bookIndex: 0, chapterIndex: 0 });
  });

  it("swaps page and picker leaf state completely", () => {
    const root = split(
      "root",
      "vertical",
      customLeaf("top", {
        view: "picker",
        pickerTestament: "old",
        pickerBookIndex: 0,
      }),
      customLeaf("bottom", {
        view: "page",
        pageId: "welcome-home",
      }),
    );

    const next = swapLeafContent(root, "top", "bottom");

    expect(findLeafNode(next, "top")).toMatchObject({
      view: "page",
      pageId: "welcome-home",
      pickerTestament: null,
      pickerBookIndex: null,
    });
    expect(findLeafNode(next, "bottom")).toMatchObject({
      view: "picker",
      pageId: null,
      pickerTestament: "old",
      pickerBookIndex: 0,
    });
  });

  it("finds the correct parent split and group target", () => {
    const root = split(
      "outer",
      "horizontal",
      leaf("left", 0, 0),
      split("inner", "vertical", leaf("top", 0, 1), leaf("bottom", 0, 2)),
    );

    expect(findParentSplitForLeaf(root, "top")?.id).toBe("inner");
    expect(findGroupTargetNodeId(root, "top", "left")).toBe("outer");
    expect(findGroupTargetNodeId(root, "top", "down")).toBe("inner");
  });

  it("inserts around a leaf within the current parent group", () => {
    const root = split("root", "horizontal", leaf("a", 0, 0), leaf("b", 1, 0));

    const insertedRight = insertLeafIntoParentGroup(root, "a", "right");
    expect(insertedRight.changed).toBe(true);
    expect(collectLeafIds(insertedRight.next)).toEqual([
      "a",
      insertedRight.createdLeafId!,
      "b",
    ]);

    const insertedLeft = insertLeafIntoParentGroup(root, "b", "left");
    expect(insertedLeft.changed).toBe(true);
    expect(collectLeafIds(insertedLeft.next)).toEqual([
      "a",
      insertedLeft.createdLeafId!,
      "b",
    ]);
  });

  it("keeps inserting into the same conceptual group on repeated inserts", () => {
    const root = split("root", "horizontal", leaf("a", 0, 0), leaf("b", 1, 0));

    const firstInsert = insertLeafIntoParentGroup(root, "a", "right");
    expect(firstInsert.changed).toBe(true);

    const secondInsert = insertLeafIntoParentGroup(
      firstInsert.next,
      "a",
      "right",
    );
    expect(secondInsert.changed).toBe(true);
    expect(collectLeafIds(secondInsert.next)).toEqual([
      "a",
      secondInsert.createdLeafId!,
      firstInsert.createdLeafId!,
      "b",
    ]);
  });
});
