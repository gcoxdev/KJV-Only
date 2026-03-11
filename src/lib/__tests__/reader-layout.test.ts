import { describe, expect, it } from "vitest";

import {
  collectLeafIds,
  extractLeafNode,
  findGroupTargetNodeId,
  findLeafNode,
  findParentSplitForLeaf,
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

  it("swaps leaf content without changing ids", () => {
    const root = split("root", "horizontal", leaf("a", 0, 0), leaf("b", 1, 1));
    const next = swapLeafContent(root, "a", "b");

    expect(findLeafNode(next, "a")).toMatchObject({ bookIndex: 1, chapterIndex: 1 });
    expect(findLeafNode(next, "b")).toMatchObject({ bookIndex: 0, chapterIndex: 0 });
  });

  it("finds the correct parent split and group target", () => {
    const root = split(
      "outer",
      "horizontal",
      leaf("left", 0, 0),
      split("inner", "vertical", leaf("top", 0, 1), leaf("bottom", 0, 2)),
    );

    expect(findParentSplitForLeaf(root, "top")?.id).toBe("inner");
    expect(findGroupTargetNodeId(root, "top", "left")).toBe("inner");
    expect(findGroupTargetNodeId(root, "top", "down")).toBe("outer");
  });
});
