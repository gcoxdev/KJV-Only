import {
  useCallback,
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import type { VerseHighlightRange } from "@/hooks/use-verse-highlights";
import {
  calculateReaderScrollTop,
  dequeuePendingReaderScrollTarget,
  selectPendingReaderScrollTargetForActiveTab,
} from "@/lib/reader-scroll-targets";
import { panelViewportElement } from "@/lib/reader-view";
import type { PendingReaderScrollTarget, ReaderTab } from "@/types/reader";

const MAX_SCROLL_ATTEMPTS = 60;

function elementOffsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let offset = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    offset += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return offset;
}

type UsePendingReaderScrollParams = {
  activeTabId: string | null;
  tabs: ReaderTab[];
  highlightedVerseRangesByLeafId: Record<string, VerseHighlightRange[]>;
  pendingReaderScrollTargets: PendingReaderScrollTarget[];
  setPendingReaderScrollTargets: Dispatch<
    SetStateAction<PendingReaderScrollTarget[]>
  >;
  panelElementRefs: RefObject<Record<string, HTMLDivElement | null>>;
};

export function usePendingReaderScroll({
  activeTabId,
  tabs,
  highlightedVerseRangesByLeafId,
  pendingReaderScrollTargets,
  setPendingReaderScrollTargets,
  panelElementRefs,
}: UsePendingReaderScrollParams) {
  const scrollVerseIntoView = useCallback(
    (
      leafId: string,
      bookIndex: number,
      chapterIndex: number,
      verseStart: number,
      verseEnd = verseStart,
    ) => {
      let attempts = 0;

      const attemptScroll = () => {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        const chapterRoot = panelElement?.querySelector<HTMLElement>(
          "[data-reader-chapter-root]",
        );
        const chapterMatches =
          chapterRoot?.dataset.bookIndex === `${bookIndex}` &&
          chapterRoot?.dataset.chapterIndex === `${chapterIndex}`;
        const startVerseElement = chapterMatches
          ? panelElement?.querySelector<HTMLElement>(
              `[data-verse-number="${verseStart}"]`,
            )
          : null;
        const endVerseElement = chapterMatches
          ? panelElement?.querySelector<HTMLElement>(
              `[data-verse-number="${verseEnd}"]`,
            )
          : null;
        const panelIsVisible = Boolean(panelElement && panelElement.offsetParent);

        if (startVerseElement && endVerseElement && viewport && panelIsVisible) {
          const startTop = elementOffsetWithin(startVerseElement, viewport);
          const endTop = elementOffsetWithin(endVerseElement, viewport);
          const blockTop = Math.min(startTop, endTop);
          const blockBottom = Math.max(
            startTop + startVerseElement.offsetHeight,
            endTop + endVerseElement.offsetHeight,
          );
          const blockHeight = Math.max(
            startVerseElement.offsetHeight,
            blockBottom - blockTop,
          );
          const nextTop = calculateReaderScrollTop(
            blockTop,
            blockHeight,
            viewport.clientHeight,
            viewport.scrollHeight,
          );

          if (blockHeight >= viewport.clientHeight) {
            startVerseElement.scrollIntoView({
              block: "start",
              inline: "nearest",
              behavior: "smooth",
            });
            return;
          }

          viewport.scrollTo({
            top: nextTop,
            behavior: "smooth",
          });
          return;
        }

        if (attempts < MAX_SCROLL_ATTEMPTS) {
          attempts += 1;
          requestAnimationFrame(attemptScroll);
        }
      };

      requestAnimationFrame(attemptScroll);
    },
    [panelElementRefs],
  );

  const scrollChapterToTop = useCallback(
    (leafId: string, bookIndex: number, chapterIndex: number) => {
      let attempts = 0;

      const attemptScroll = () => {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        const chapterRoot = panelElement?.querySelector<HTMLElement>(
          "[data-reader-chapter-root]",
        );
        const chapterMatches =
          chapterRoot?.dataset.bookIndex === `${bookIndex}` &&
          chapterRoot?.dataset.chapterIndex === `${chapterIndex}`;
        const panelIsVisible = Boolean(panelElement && panelElement.offsetParent);

        if (chapterMatches && viewport && panelIsVisible) {
          viewport.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }

        if (attempts < MAX_SCROLL_ATTEMPTS) {
          attempts += 1;
          requestAnimationFrame(attemptScroll);
        }
      };

      requestAnimationFrame(attemptScroll);
    },
    [panelElementRefs],
  );

  useEffect(() => {
    const pendingReaderScrollTarget =
      selectPendingReaderScrollTargetForActiveTab(
        pendingReaderScrollTargets,
        tabs,
        activeTabId,
      );
    if (!pendingReaderScrollTarget) {
      return;
    }

    let cancelled = false;
    const run = () => {
      if (cancelled) {
        return;
      }
      requestAnimationFrame(() => {
        if (cancelled) {
          return;
        }
        requestAnimationFrame(() => {
          if (cancelled) {
            return;
          }
          if (pendingReaderScrollTarget.mode === "chapter-top") {
            scrollChapterToTop(
              pendingReaderScrollTarget.leafId,
              pendingReaderScrollTarget.bookIndex,
              pendingReaderScrollTarget.chapterIndex,
            );
          } else {
            scrollVerseIntoView(
              pendingReaderScrollTarget.leafId,
              pendingReaderScrollTarget.bookIndex,
              pendingReaderScrollTarget.chapterIndex,
              pendingReaderScrollTarget.verseStart,
              pendingReaderScrollTarget.verseEnd,
            );
          }
          setPendingReaderScrollTargets((current) =>
            dequeuePendingReaderScrollTarget(
              current,
              pendingReaderScrollTarget,
            ),
          );
        });
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    activeTabId,
    highlightedVerseRangesByLeafId,
    pendingReaderScrollTargets,
    scrollChapterToTop,
    scrollVerseIntoView,
    setPendingReaderScrollTargets,
    tabs,
  ]);
}
