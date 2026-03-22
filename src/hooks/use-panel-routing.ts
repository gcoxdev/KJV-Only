import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import { normalizeRangePoints } from "@/lib/bookmarks";
import { buildReaderTabFromTargets } from "@/lib/reference-command";
import { queuePendingReaderScrollTarget } from "@/lib/reader-scroll-targets";
import {
  createId,
  createLeaf,
  findLeafNode,
  updateLeafNode,
} from "@/lib/reader-layout";
import type { VerseHighlightRange } from "@/hooks/use-verse-highlights";
import type { Book } from "@/types/bible";
import type {
  BookmarkOpenTarget,
  NotesLinkOpenTarget,
  PanelNode,
  PendingReaderScrollTarget,
  ReaderNavigationTarget,
  ReaderTab,
  ReferenceLinkOpenTarget,
  SearchResultOpenTarget,
} from "@/types/reader";
import type { BookmarkScope, ReaderBookmark } from "@/types/bookmarks";

type ReaderWordHighlight = {
  leafId: string;
  verseNumber: number;
  word: string;
};

type ReaderOpenDestination =
  | NotesLinkOpenTarget
  | SearchResultOpenTarget
  | BookmarkOpenTarget
  | ReferenceLinkOpenTarget;

type UsePanelRoutingParams = {
  activeTabId: string | null;
  books: Book[];
  tabsRef: MutableRefObject<ReaderTab[]>;
  targetedPanelLeafIdRef: MutableRefObject<string | null>;
  setTabs: Dispatch<SetStateAction<ReaderTab[]>>;
  setTargetedPanelLeafId: Dispatch<SetStateAction<string | null>>;
  showTabById: (tabId: string) => void;
  clearLeafHighlights: (leafId: string) => void;
  setLeafHighlights: (leafId: string, ranges: VerseHighlightRange[]) => void;
  setSelectedHighlightScope: Dispatch<SetStateAction<BookmarkScope | null>>;
  setPendingReaderScrollTargets: Dispatch<
    SetStateAction<PendingReaderScrollTarget[]>
  >;
  setActiveReaderWordHighlight: Dispatch<
    SetStateAction<ReaderWordHighlight | null>
  >;
};

export function buildTargetedReaderPanelInTabState(
  tabs: ReaderTab[],
  activeTabId: string | null,
  target: ReaderNavigationTarget,
) {
  if (!activeTabId) {
    return null;
  }

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);
  if (activeIndex < 0) {
    return null;
  }

  const location =
    target.type === "range"
      ? {
          bookIndex: target.start.bookIndex,
          chapterIndex: target.start.chapterIndex,
        }
      : {
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
        };
  const active = tabs[activeIndex];
  const nextLeaf = createLeaf(
    location.bookIndex,
    location.chapterIndex,
    "reader",
  );
  const nextRoot: PanelNode = {
    id: createId(),
    type: "split",
    orientation: "horizontal",
    ratio: 42,
    first: active.root,
    second: nextLeaf,
  };

  const nextTabs = [...tabs];
  nextTabs[activeIndex] = { ...active, root: nextRoot };

  return {
    nextTabs,
    nextLeafId: nextLeaf.id,
  };
}

export function resolveTargetedReaderPanelAction(
  tabs: ReaderTab[],
  targetedPanelLeafId: string | null,
  activeTabId: string | null,
):
  | { type: "reuse"; tabId: string; leafId: string }
  | { type: "create-in-active-tab" }
  | { type: "fallback-new-panel" } {
  if (targetedPanelLeafId) {
    for (const tab of tabs) {
      if (findLeafNode(tab.root, targetedPanelLeafId)) {
        return {
          type: "reuse",
          tabId: tab.id,
          leafId: targetedPanelLeafId,
        };
      }
    }
  }

  if (activeTabId && tabs.some((tab) => tab.id === activeTabId)) {
    return { type: "create-in-active-tab" };
  }

  return { type: "fallback-new-panel" };
}

export function usePanelRouting({
  activeTabId,
  books,
  tabsRef,
  targetedPanelLeafIdRef,
  setTabs,
  setTargetedPanelLeafId,
  showTabById,
  clearLeafHighlights,
  setLeafHighlights,
  setSelectedHighlightScope,
  setPendingReaderScrollTargets,
  setActiveReaderWordHighlight,
}: UsePanelRoutingParams) {
  const navigateReaderLeafToTarget = useCallback(
    (tabId: string, leafId: string, target: ReaderNavigationTarget) => {
      const location =
        target.type === "range"
          ? {
              bookIndex: target.start.bookIndex,
              chapterIndex: target.start.chapterIndex,
            }
          : {
              bookIndex: target.bookIndex,
              chapterIndex: target.chapterIndex,
            };
      clearLeafHighlights(leafId);
      setSelectedHighlightScope(null);
      setTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                root: updateLeafNode(tab.root, leafId, {
                  bookIndex: location.bookIndex,
                  chapterIndex: location.chapterIndex,
                  view: "reader",
                  pickerTestament: null,
                  pickerBookIndex: null,
                }),
              }
            : tab,
        ),
      );
    },
    [clearLeafHighlights, setSelectedHighlightScope, setTabs],
  );

  const createTargetedReaderPanelInActiveTab = useCallback(
    (target: ReaderNavigationTarget) => {
      const nextState = buildTargetedReaderPanelInTabState(
        tabsRef.current,
        activeTabId,
        target,
      );
      if (!nextState) {
        return null;
      }

      const { nextTabs, nextLeafId } = nextState;
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      targetedPanelLeafIdRef.current = nextLeafId;
      setTargetedPanelLeafId(nextLeafId);
      showTabById(activeTabId);
      return nextLeafId;
    },
    [
      activeTabId,
      setTabs,
      setTargetedPanelLeafId,
      showTabById,
      tabsRef,
      targetedPanelLeafIdRef,
    ],
  );

  const applyReaderTargetEffects = useCallback(
    (target: ReaderNavigationTarget, leafId: string) => {
      if (target.type === "selection") {
        setActiveReaderWordHighlight(null);
        setLeafHighlights(leafId, target.ranges);
        setSelectedHighlightScope({
          type: "selection",
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          ranges: target.ranges,
        });
        const firstRange = target.ranges[0];
        const lastRange = target.ranges[target.ranges.length - 1];
        setPendingReaderScrollTargets((current) =>
          queuePendingReaderScrollTarget(current, {
            leafId,
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            mode: "verse-range",
            verseStart: firstRange?.start ?? 1,
            verseEnd: lastRange?.end ?? firstRange?.end ?? firstRange?.start ?? 1,
          }),
        );
        return;
      }

      if (target.type === "range") {
        const normalized = normalizeRangePoints(target.start, target.end);
        const endVerseInActiveChapter =
          normalized.start.bookIndex === normalized.end.bookIndex &&
          normalized.start.chapterIndex === normalized.end.chapterIndex
            ? normalized.end.verseNumber
            : (books[normalized.start.bookIndex]?.chapters[
                normalized.start.chapterIndex
              ]?.verses.at(-1)?.verse ?? normalized.start.verseNumber);
        setActiveReaderWordHighlight(null);
        setLeafHighlights(leafId, [
          {
            start: normalized.start.verseNumber,
            end: endVerseInActiveChapter,
          },
        ]);
        setSelectedHighlightScope({
          type: "range",
          start: normalized.start,
          end: normalized.end,
        });
        setPendingReaderScrollTargets((current) =>
          queuePendingReaderScrollTarget(current, {
            leafId,
            bookIndex: normalized.start.bookIndex,
            chapterIndex: normalized.start.chapterIndex,
            mode: "verse-range",
            verseStart: normalized.start.verseNumber,
            verseEnd: endVerseInActiveChapter,
          }),
        );
        return;
      }

      if (target.type === "verse") {
        setActiveReaderWordHighlight(null);
        setLeafHighlights(leafId, [
          {
            start: target.verseNumber,
            end: target.verseNumber,
          },
        ]);
        setSelectedHighlightScope({
          type: "verse",
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
        });
        setPendingReaderScrollTargets((current) =>
          queuePendingReaderScrollTarget(current, {
            leafId,
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            mode: "verse-range",
            verseStart: target.verseNumber,
            verseEnd: target.verseNumber,
          }),
        );
        return;
      }

      setActiveReaderWordHighlight(null);
      clearLeafHighlights(leafId);
      setSelectedHighlightScope(null);
      setPendingReaderScrollTargets((current) =>
        queuePendingReaderScrollTarget(current, {
          leafId,
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          mode: "chapter-top",
          verseStart: 1,
          verseEnd: 1,
        }),
      );
    },
    [
      books,
      clearLeafHighlights,
      setActiveReaderWordHighlight,
      setLeafHighlights,
      setPendingReaderScrollTargets,
      setSelectedHighlightScope,
    ],
  );

  const openReaderTarget = useCallback(
    (target: ReaderNavigationTarget, destination: ReaderOpenDestination) => {
      const location =
        target.type === "range"
          ? {
              bookIndex: target.start.bookIndex,
              chapterIndex: target.start.chapterIndex,
            }
          : {
              bookIndex: target.bookIndex,
              chapterIndex: target.chapterIndex,
            };

      const openInNewTab = () => {
        const nextTabId = createId();
        const nextLeaf = createLeaf(
          location.bookIndex,
          location.chapterIndex,
          "reader",
        );
        setTabs((currentTabs) => [
          ...currentTabs,
          {
            id: nextTabId,
            title: `Tab ${currentTabs.length + 1}`,
            root: nextLeaf,
          },
        ]);
        showTabById(nextTabId);
        applyReaderTargetEffects(target, nextLeaf.id);
        return nextLeaf.id;
      };

      const openInNewPanel = () => {
        if (!activeTabId) {
          return openInNewTab();
        }

        const nextReaderLeaf = createLeaf(
          location.bookIndex,
          location.chapterIndex,
          "reader",
        );

        setTabs((currentTabs) => {
          const activeIndex = currentTabs.findIndex(
            (tab) => tab.id === activeTabId,
          );
          if (activeIndex < 0) {
            return currentTabs;
          }
          const active = currentTabs[activeIndex];
          const nextRoot: PanelNode = {
            id: createId(),
            type: "split",
            orientation: "horizontal",
            ratio: 42,
            first: active.root,
            second: nextReaderLeaf,
          };
          const nextTabs = [...currentTabs];
          nextTabs[activeIndex] = { ...active, root: nextRoot };
          return nextTabs;
        });

        applyReaderTargetEffects(target, nextReaderLeaf.id);
        return nextReaderLeaf.id;
      };

      const openInTargetedPanel = () => {
        const action = resolveTargetedReaderPanelAction(
          tabsRef.current,
          targetedPanelLeafIdRef.current,
          activeTabId,
        );

        if (action.type === "create-in-active-tab") {
          const nextLeafId = createTargetedReaderPanelInActiveTab(target);
          if (nextLeafId) {
            applyReaderTargetEffects(target, nextLeafId);
            return nextLeafId;
          }
          return openInNewPanel();
        }

        if (action.type === "fallback-new-panel") {
          return openInNewPanel();
        }

        navigateReaderLeafToTarget(
          action.tabId,
          action.leafId,
          target,
        );
        showTabById(action.tabId);
        applyReaderTargetEffects(target, action.leafId);
        return action.leafId;
      };

      if (destination === "targeted-panel") {
        return openInTargetedPanel();
      }
      if (destination === "new-tab") {
        return openInNewTab();
      }
      return openInNewPanel();
    },
    [
      activeTabId,
      applyReaderTargetEffects,
      createTargetedReaderPanelInActiveTab,
      navigateReaderLeafToTarget,
      setTabs,
      showTabById,
      tabsRef,
      targetedPanelLeafIdRef,
    ],
  );

  const openReaderTargetsInSingleNewTab = useCallback(
    (targets: ReaderNavigationTarget[]) => {
      if (targets.length === 0) {
        return [];
      }

      const nextTabId = createId();
      const nextTabState = buildReaderTabFromTargets(targets);
      setTabs((currentTabs) => [
        ...currentTabs,
        {
          id: nextTabId,
          title: `Tab ${currentTabs.length + 1}`,
          root: nextTabState.root,
        },
      ]);
      showTabById(nextTabId);
      targets.forEach((target, index) => {
        const leafId = nextTabState.leafIds[index];
        if (leafId) {
          applyReaderTargetEffects(target, leafId);
        }
      });
      return nextTabState.leafIds;
    },
    [applyReaderTargetEffects, setTabs, showTabById],
  );

  const openBookmarkTarget = useCallback(
    (bookmark: ReaderBookmark, destination: BookmarkOpenTarget) => {
      if (bookmark.scope.type === "chapter") {
        openReaderTarget(
          {
            type: "chapter",
            bookIndex: bookmark.scope.bookIndex,
            chapterIndex: bookmark.scope.chapterIndex,
          },
          destination,
        );
        return;
      }

      if (bookmark.scope.type === "verse") {
        openReaderTarget(
          {
            type: "verse",
            bookIndex: bookmark.scope.bookIndex,
            chapterIndex: bookmark.scope.chapterIndex,
            verseNumber: bookmark.scope.verseNumber,
          },
          destination,
        );
        return;
      }

      if (bookmark.scope.type === "selection") {
        openReaderTarget(
          {
            type: "selection",
            bookIndex: bookmark.scope.bookIndex,
            chapterIndex: bookmark.scope.chapterIndex,
            ranges: bookmark.scope.ranges,
          },
          destination,
        );
        return;
      }

      const normalized = normalizeRangePoints(
        bookmark.scope.start,
        bookmark.scope.end,
      );
      const isSameChapter =
        normalized.start.bookIndex === normalized.end.bookIndex &&
        normalized.start.chapterIndex === normalized.end.chapterIndex;
      if (isSameChapter) {
        openReaderTarget(
          {
            type:
              normalized.start.verseNumber === normalized.end.verseNumber
                ? "verse"
                : "selection",
            bookIndex: normalized.start.bookIndex,
            chapterIndex: normalized.start.chapterIndex,
            ...(normalized.start.verseNumber === normalized.end.verseNumber
              ? { verseNumber: normalized.start.verseNumber }
              : {
                  ranges: [
                    {
                      start: normalized.start.verseNumber,
                      end: normalized.end.verseNumber,
                    },
                  ],
                }),
          },
          destination,
        );
        return;
      }

      openReaderTarget(
        {
          type: "verse",
          bookIndex: normalized.start.bookIndex,
          chapterIndex: normalized.start.chapterIndex,
          verseNumber: normalized.start.verseNumber,
        },
        destination,
      );
    },
    [openReaderTarget],
  );

  const openSearchResultTarget = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd: number | undefined,
      destination: SearchResultOpenTarget,
    ) => {
      if (
        typeof verseEnd === "number" &&
        Number.isFinite(verseEnd) &&
        verseEnd !== verseStart
      ) {
        openReaderTarget(
          {
            type: "selection",
            bookIndex,
            chapterIndex,
            ranges: [{ start: verseStart, end: verseEnd }],
          },
          destination,
        );
        return;
      }

      openReaderTarget(
        {
          type: "verse",
          bookIndex,
          chapterIndex,
          verseNumber: verseStart,
        },
        destination,
      );
    },
    [openReaderTarget],
  );

  const openChapterReference = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd: number,
      destination: ReferenceLinkOpenTarget,
    ) => {
      openReaderTarget(
        verseStart === verseEnd
          ? {
              type: "verse",
              bookIndex,
              chapterIndex,
              verseNumber: verseStart,
            }
          : {
              type: "selection",
              bookIndex,
              chapterIndex,
              ranges: [{ start: verseStart, end: verseEnd }],
            },
        destination,
      );
    },
    [openReaderTarget],
  );

  return {
    openReaderTarget,
    openReaderTargetsInSingleNewTab,
    openBookmarkTarget,
    openSearchResultTarget,
    openChapterReference,
  };
}
