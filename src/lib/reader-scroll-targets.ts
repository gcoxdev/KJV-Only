import { findLeafNode } from "@/lib/reader-layout";
import type { PendingReaderScrollTarget, ReaderTab } from "@/types/reader";

export function queuePendingReaderScrollTarget(
  queue: PendingReaderScrollTarget[],
  target: PendingReaderScrollTarget,
) {
  return [...queue.filter((entry) => entry.leafId !== target.leafId), target];
}

export function prunePendingReaderScrollTargets(
  queue: PendingReaderScrollTarget[],
  activeLeafIds: string[] | ReadonlySet<string>,
) {
  const activeLeafIdSet =
    activeLeafIds instanceof Set ? activeLeafIds : new Set(activeLeafIds);
  return queue.filter((entry) => activeLeafIdSet.has(entry.leafId));
}

export function swapPendingReaderScrollTargets(
  queue: PendingReaderScrollTarget[],
  firstLeafId: string,
  secondLeafId: string,
) {
  return queue.map((entry) => {
    if (entry.leafId === firstLeafId) {
      return { ...entry, leafId: secondLeafId };
    }
    if (entry.leafId === secondLeafId) {
      return { ...entry, leafId: firstLeafId };
    }
    return entry;
  });
}

export function dequeuePendingReaderScrollTarget(
  queue: PendingReaderScrollTarget[],
  processed: PendingReaderScrollTarget,
) {
  return queue.filter((entry) => entry !== processed);
}

export function selectPendingReaderScrollTargetForActiveTab(
  queue: PendingReaderScrollTarget[],
  tabs: ReaderTab[],
  activeTabId: string | null,
) {
  if (!activeTabId) {
    return null;
  }

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  if (!activeTab) {
    return null;
  }

  return (
    queue.find((entry) => Boolean(findLeafNode(activeTab.root, entry.leafId))) ?? null
  );
}

export function calculateReaderScrollTop(
  blockTop: number,
  blockHeight: number,
  viewportHeight: number,
  scrollHeight: number,
) {
  const unclampedTop =
    blockHeight >= viewportHeight
      ? blockTop
      : blockTop - viewportHeight / 2 + blockHeight / 2;
  const maxTop = Math.max(0, scrollHeight - viewportHeight);
  return Math.min(Math.max(0, unclampedTop), maxTop);
}
