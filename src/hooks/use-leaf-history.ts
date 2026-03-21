import { useCallback, useEffect, useRef, useState } from "react";

import { swapRecordEntries } from "@/lib/leaf-state";
import { collectLeafIds, findLeafNode } from "@/lib/reader-layout";
import type { LeafNode, ReaderTab } from "@/types/reader";

export type LeafHistoryEntry = {
  view: LeafNode["view"];
  bookIndex: number;
  chapterIndex: number;
  pickerTestament: LeafNode["pickerTestament"];
  pickerBookIndex: number | null;
  pageId: LeafNode["pageId"];
};

type LeafHistoryState = Record<
  string,
  {
    entries: LeafHistoryEntry[];
    index: number;
  }
>;

function buildLeafHistoryEntry(leaf: LeafNode): LeafHistoryEntry {
  return {
    view: leaf.view,
    bookIndex: leaf.bookIndex,
    chapterIndex: leaf.chapterIndex,
    pickerTestament: leaf.pickerTestament,
    pickerBookIndex: leaf.pickerBookIndex,
    pageId: leaf.pageId,
  };
}

function leafHistoryEntryEquals(left: LeafHistoryEntry, right: LeafHistoryEntry) {
  return (
    left.view === right.view &&
    left.bookIndex === right.bookIndex &&
    left.chapterIndex === right.chapterIndex &&
    left.pickerTestament === right.pickerTestament &&
    left.pickerBookIndex === right.pickerBookIndex &&
    left.pageId === right.pageId
  );
}

type UseLeafHistoryParams = {
  tabs: ReaderTab[];
  applyHistoryEntry: (leafId: string, entry: LeafHistoryEntry) => void;
};

export function useLeafHistory({
  tabs,
  applyHistoryEntry,
}: UseLeafHistoryParams) {
  const [leafHistoryByLeafId, setLeafHistoryByLeafId] =
    useState<LeafHistoryState>({});
  const pendingLeafHistoryNavigationRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const leafEntries = new Map<string, LeafHistoryEntry>();

    for (const tab of tabs) {
      for (const leafId of collectLeafIds(tab.root)) {
        const leaf = findLeafNode(tab.root, leafId);
        if (!leaf) {
          continue;
        }
        leafEntries.set(leafId, buildLeafHistoryEntry(leaf));
      }
    }

    setLeafHistoryByLeafId((current) => {
      let changed = false;
      const next: LeafHistoryState = {};

      for (const [leafId, entry] of leafEntries) {
        const existing = current[leafId];
        if (!existing) {
          next[leafId] = { entries: [entry], index: 0 };
          changed = true;
          continue;
        }

        if (pendingLeafHistoryNavigationRef.current.has(leafId)) {
          pendingLeafHistoryNavigationRef.current.delete(leafId);
          next[leafId] = { ...existing };
          continue;
        }

        const currentEntry = existing.entries[existing.index];
        if (currentEntry && leafHistoryEntryEquals(currentEntry, entry)) {
          next[leafId] = existing;
          continue;
        }

        next[leafId] = {
          entries: [...existing.entries.slice(0, existing.index + 1), entry],
          index: existing.index + 1,
        };
        changed = true;
      }

      for (const leafId of Object.keys(current)) {
        if (!leafEntries.has(leafId)) {
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [tabs]);

  const navigateLeafHistory = useCallback(
    (leafId: string, direction: -1 | 1) => {
      const history = leafHistoryByLeafId[leafId];
      if (!history) {
        return;
      }

      const nextIndex = history.index + direction;
      if (nextIndex < 0 || nextIndex >= history.entries.length) {
        return;
      }

      const entry = history.entries[nextIndex];
      pendingLeafHistoryNavigationRef.current.add(leafId);
      setLeafHistoryByLeafId((current) => ({
        ...current,
        [leafId]: {
          ...history,
          index: nextIndex,
        },
      }));
      applyHistoryEntry(leafId, entry);
    },
    [applyHistoryEntry, leafHistoryByLeafId],
  );

  const swapLeafHistoryState = useCallback(
    (sourceLeafId: string, targetLeafId: string) => {
      setLeafHistoryByLeafId((current) =>
        swapRecordEntries(current, sourceLeafId, targetLeafId),
      );
    },
    [],
  );

  return {
    leafHistoryByLeafId,
    navigateLeafHistory,
    swapLeafHistoryState,
  };
}
