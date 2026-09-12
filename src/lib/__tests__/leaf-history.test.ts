import { describe, expect, it } from "vitest";

import {
  buildLeafHistoryEntry,
  leafHistoryEntryEquals,
  canNavigateLeafHistory,
  reconcileLeafHistoryState,
} from "@/hooks/use-leaf-history";
import type { LeafNode } from "@/types/reader";

function leaf(overrides: Partial<LeafNode> = {}): LeafNode {
  return {
    id: "leaf-1",
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

describe("leaf history helpers", () => {
  it("preserves tool selection and records navigation within a genealogy panel", () => {
    const first = buildLeafHistoryEntry(leaf({ view: "visual-tool", visualTool: { kind: "genealogy", personId: "JesusChrist" } }));
    const next = buildLeafHistoryEntry(leaf({ view: "visual-tool", visualTool: { kind: "genealogy", personId: "Joseph" } }));
    expect(first.visualTool).toEqual({ kind: "genealogy", personId: "JesusChrist" });
    expect(leafHistoryEntryEquals(first, next)).toBe(false);
    expect(leafHistoryEntryEquals(first, { ...first, visualTool: { ...first.visualTool! } })).toBe(true);
    const history = reconcileLeafHistoryState({ "leaf-1": { entries: [first], index: 0 } }, new Map([["leaf-1", next]]), new Set());
    expect(history["leaf-1"]).toEqual({ entries: [first, next], index: 1 });
  });

  it("clears forward history after back navigation followed by a new view", () => {
    const pickerEntry = buildLeafHistoryEntry(leaf());
    const toolsEntry = buildLeafHistoryEntry(leaf({ view: "tools" }));
    const notesEntry = buildLeafHistoryEntry(leaf({ view: "notes" }));

    const pending = new Set<string>(["leaf-1"]);
    const afterBack = reconcileLeafHistoryState(
      {
        "leaf-1": {
          entries: [pickerEntry, toolsEntry],
          index: 0,
        },
      },
      new Map([["leaf-1", pickerEntry]]),
      pending,
    );

    expect(afterBack).toEqual({
      "leaf-1": {
        entries: [pickerEntry, toolsEntry],
        index: 0,
      },
    });
    expect(pending.has("leaf-1")).toBe(false);

    const afterNewNavigation = reconcileLeafHistoryState(
      afterBack,
      new Map([["leaf-1", notesEntry]]),
      pending,
    );

    expect(afterNewNavigation).toEqual({
      "leaf-1": {
        entries: [pickerEntry, notesEntry],
        index: 1,
      },
    });
  });

  it("keeps an identical current entry without rewriting history", () => {
    const pickerEntry = buildLeafHistoryEntry(leaf());
    const current = {
      "leaf-1": {
        entries: [pickerEntry],
        index: 0,
      },
    };

    expect(
      reconcileLeafHistoryState(
        current,
        new Map([["leaf-1", pickerEntry]]),
        new Set(),
      ),
    ).toBe(current);
  });

  it("reports whether leaf history can go backward or forward", () => {
    const history = {
      entries: [
        buildLeafHistoryEntry(leaf()),
        buildLeafHistoryEntry(leaf({ view: "tools" })),
      ],
      index: 0,
    };

    expect(canNavigateLeafHistory(history, -1)).toBe(false);
    expect(canNavigateLeafHistory(history, 1)).toBe(true);
    expect(canNavigateLeafHistory({ ...history, index: 1 }, -1)).toBe(true);
    expect(canNavigateLeafHistory({ ...history, index: 1 }, 1)).toBe(false);
    expect(canNavigateLeafHistory(undefined, -1)).toBe(false);
  });
});
