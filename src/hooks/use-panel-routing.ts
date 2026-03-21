import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from "react";

import { normalizeRangePoints } from "@/lib/bookmarks";
import {
  createId,
  createLeaf,
  updateLeafNode,
} from "@/lib/reader-layout";
import type { VerseHighlightRange } from "@/hooks/use-verse-highlights";
import type { Book } from "@/types/bible";
import type {
  BookmarkOpenTarget,
  NotesLinkOpenTarget,
  PanelNode,
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

export type PendingReaderScrollTarget = {
  leafId: string;
  bookIndex: number;
  chapterIndex: number;
  mode: "chapter-top" | "verse-range";
  verseStart: number;
  verseEnd: number;
};

export type ReaderNavigationTarget =
  | { type: "chapter"; bookIndex: number; chapterIndex: number }
  | {
      type: "verse";
      bookIndex: number;
      chapterIndex: number;
      verseNumber: number;
    }
  | {
      type: "selection";
      bookIndex: number;
      chapterIndex: number;
      ranges: Array<{ start: number; end: number }>;
    }
  | {
      type: "range";
      start: {
        bookIndex: number;
        chapterIndex: number;
        verseNumber: number;
      };
      end: {
        bookIndex: number;
        chapterIndex: number;
        verseNumber: number;
      };
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
  findTabContainingLeafId: (
    leafId: string,
    sourceTabs?: ReaderTab[],
  ) => ReaderTab | null;
  clearLeafHighlights: (leafId: string) => void;
  setLeafHighlights: (leafId: string, ranges: VerseHighlightRange[]) => void;
  setSelectedHighlightScope: Dispatch<SetStateAction<BookmarkScope | null>>;
  setPendingReaderScrollTarget: Dispatch<
    SetStateAction<PendingReaderScrollTarget | null>
  >;
  setActiveReaderWordHighlight: Dispatch<
    SetStateAction<ReaderWordHighlight | null>
  >;
};

export function usePanelRouting({
  activeTabId,
  books,
  tabsRef,
  targetedPanelLeafIdRef,
  setTabs,
  setTargetedPanelLeafId,
  showTabById,
  findTabContainingLeafId,
  clearLeafHighlights,
  setLeafHighlights,
  setSelectedHighlightScope,
  setPendingReaderScrollTarget,
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
      if (!activeTabId) {
        return null;
      }

      const currentTabs = tabsRef.current;
      const activeIndex = currentTabs.findIndex((tab) => tab.id === activeTabId);
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
      const active = currentTabs[activeIndex];
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

      const nextTabs = [...currentTabs];
      nextTabs[activeIndex] = { ...active, root: nextRoot };
      tabsRef.current = nextTabs;
      setTabs(nextTabs);

      const nextLeafId = nextLeaf.id;
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

      const applyReaderTargetEffects = (leafId: string) => {
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
          setPendingReaderScrollTarget({
            leafId,
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            mode: "verse-range",
            verseStart: firstRange?.start ?? 1,
            verseEnd: lastRange?.end ?? firstRange?.end ?? firstRange?.start ?? 1,
          });
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
          setPendingReaderScrollTarget({
            leafId,
            bookIndex: normalized.start.bookIndex,
            chapterIndex: normalized.start.chapterIndex,
            mode: "verse-range",
            verseStart: normalized.start.verseNumber,
            verseEnd: endVerseInActiveChapter,
          });
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
          setPendingReaderScrollTarget({
            leafId,
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            mode: "verse-range",
            verseStart: target.verseNumber,
            verseEnd: target.verseNumber,
          });
          return;
        }

        setActiveReaderWordHighlight(null);
        clearLeafHighlights(leafId);
        setSelectedHighlightScope(null);
        setPendingReaderScrollTarget({
          leafId,
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          mode: "chapter-top",
          verseStart: 1,
          verseEnd: 1,
        });
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
        applyReaderTargetEffects(nextLeaf.id);
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

        applyReaderTargetEffects(nextReaderLeaf.id);
        return nextReaderLeaf.id;
      };

      const openInTargetedPanel = () => {
        const currentTargetedPanelLeafId = targetedPanelLeafIdRef.current;
        if (!currentTargetedPanelLeafId) {
          const nextLeafId = createTargetedReaderPanelInActiveTab(target);
          if (nextLeafId) {
            applyReaderTargetEffects(nextLeafId);
            return nextLeafId;
          }
          return openInNewPanel();
        }

        const targetTab = findTabContainingLeafId(currentTargetedPanelLeafId);
        if (!targetTab) {
          return null;
        }

        navigateReaderLeafToTarget(
          targetTab.id,
          currentTargetedPanelLeafId,
          target,
        );
        showTabById(targetTab.id);
        applyReaderTargetEffects(currentTargetedPanelLeafId);
        return currentTargetedPanelLeafId;
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
      books,
      clearLeafHighlights,
      createTargetedReaderPanelInActiveTab,
      findTabContainingLeafId,
      navigateReaderLeafToTarget,
      setActiveReaderWordHighlight,
      setLeafHighlights,
      setPendingReaderScrollTarget,
      setSelectedHighlightScope,
      setTabs,
      showTabById,
      targetedPanelLeafIdRef,
    ],
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
    openBookmarkTarget,
    openSearchResultTarget,
    openChapterReference,
  };
}
