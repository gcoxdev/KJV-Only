import { useCallback, useEffect, useState, type RefObject } from "react";

import { panelViewportElement } from "@/lib/reader-view";

export type VerseHighlightRange = {
  start: number;
  end: number;
};

function normalizeRanges(ranges: VerseHighlightRange[]) {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges]
    .map((range) => ({
      start: Math.max(1, Math.min(range.start, range.end)),
      end: Math.max(1, Math.max(range.start, range.end)),
    }))
    .sort((left, right) => left.start - right.start || left.end - right.end);

  const merged: VerseHighlightRange[] = [];
  for (const range of sorted) {
    const previous = merged[merged.length - 1];
    if (!previous || range.start > previous.end + 1) {
      merged.push({ ...range });
      continue;
    }
    previous.end = Math.max(previous.end, range.end);
  }
  return merged;
}

type UseVerseHighlightsArgs = {
  panelElementRefs: RefObject<Record<string, HTMLDivElement | null>>;
  activeTabId: string | null;
  tabsVersion: unknown;
};

export function useVerseHighlights({
  panelElementRefs,
  activeTabId,
  tabsVersion,
}: UseVerseHighlightsArgs) {
  const [pendingVerseHighlights, setPendingVerseHighlights] = useState<
    Record<string, VerseHighlightRange[]>
  >({});
  const [highlightedVerseRangesByLeafId, setHighlightedVerseRangesByLeafId] =
    useState<Record<string, VerseHighlightRange[]>>({});

  const clearAllVerseHighlights = useCallback(() => {
    setHighlightedVerseRangesByLeafId({});
  }, []);

  const clearLeafHighlights = useCallback((leafId: string) => {
    setHighlightedVerseRangesByLeafId((current) => {
      if (!current[leafId]) {
        return current;
      }
      const next = { ...current };
      delete next[leafId];
      return next;
    });
  }, []);

  const setLeafHighlights = useCallback(
    (leafId: string, ranges: VerseHighlightRange[]) => {
      const normalized = normalizeRanges(ranges);
      setHighlightedVerseRangesByLeafId((current) => {
        if (normalized.length === 0) {
          if (!current[leafId]) {
            return current;
          }
          const next = { ...current };
          delete next[leafId];
          return next;
        }
        const previous = current[leafId] ?? [];
        if (
          previous.length === normalized.length &&
          previous.every(
            (range, index) =>
              range.start === normalized[index]?.start &&
              range.end === normalized[index]?.end,
          )
        ) {
          return current;
        }
        return {
          ...current,
          [leafId]: normalized,
        };
      });
    },
    [],
  );

  const queueVerseHighlight = useCallback((leafId: string, range: VerseHighlightRange) => {
    setPendingVerseHighlights((current) => ({
      ...current,
      [leafId]: normalizeRanges([range]),
    }));
  }, []);

  const queueVerseHighlights = useCallback(
    (leafId: string, ranges: VerseHighlightRange[]) => {
      setPendingVerseHighlights((current) => ({
        ...current,
        [leafId]: normalizeRanges(ranges),
      }));
    },
    [],
  );

  const setVerseHighlights = useCallback(
    (next: Record<string, VerseHighlightRange[]>) => {
      setHighlightedVerseRangesByLeafId(
        Object.fromEntries(
          Object.entries(next)
            .map(([leafId, ranges]) => [leafId, normalizeRanges(ranges)])
            .filter(([, ranges]) => ranges.length > 0),
        ),
      );
    },
    [],
  );

  useEffect(() => {
    const entries = Object.entries(pendingVerseHighlights);
    if (entries.length === 0) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      const appliedLeafIds: string[] = [];
      const appliedLeafRanges: Record<string, VerseHighlightRange[]> = {};

      for (const [leafId, verseRanges] of entries) {
        const panelElement = panelElementRefs.current[leafId];
        const viewport = panelViewportElement(panelElement);
        if (!viewport || !panelElement || verseRanges.length === 0) {
          continue;
        }

        const verseElements: HTMLElement[] = [];
        const seen = new Set<HTMLElement>();
        for (const verseRange of verseRanges) {
          for (
            let verseNumber = verseRange.start;
            verseNumber <= verseRange.end;
            verseNumber += 1
          ) {
            const match =
              panelElement.querySelector<HTMLElement>(
                `article[data-verse-number="${verseNumber}"]`,
              ) ??
              panelElement.querySelector<HTMLElement>(
                `[data-verse-number="${verseNumber}"]`,
              );
            if (!match || seen.has(match)) {
              continue;
            }
            seen.add(match);
            verseElements.push(match);
          }
        }
        if (verseElements.length === 0) {
          continue;
        }

        const viewportRect = viewport.getBoundingClientRect();
        let blockTop = Number.POSITIVE_INFINITY;
        let blockBottom = Number.NEGATIVE_INFINITY;
        for (const verseElement of verseElements) {
          const rect = verseElement.getBoundingClientRect();
          const top = rect.top - viewportRect.top + viewport.scrollTop;
          const bottom = rect.bottom - viewportRect.top + viewport.scrollTop;
          blockTop = Math.min(blockTop, top);
          blockBottom = Math.max(blockBottom, bottom);
        }

        const blockHeight = Math.max(1, blockBottom - blockTop);
        const centeredTop =
          blockTop - viewport.clientHeight / 2 + blockHeight / 2;
        const maxTop = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const clampedTop = Math.max(0, Math.min(maxTop, centeredTop));

        viewport.scrollTo({
          top: clampedTop,
          behavior: "auto",
        });
        window.requestAnimationFrame(() => {
          viewport.scrollTo({
            top: clampedTop,
            behavior: "auto",
          });
        });

        appliedLeafIds.push(leafId);
        appliedLeafRanges[leafId] = normalizeRanges(verseRanges);
      }

      if (Object.keys(appliedLeafRanges).length > 0) {
        setHighlightedVerseRangesByLeafId((current) => ({
          ...current,
          ...appliedLeafRanges,
        }));
      }

      if (appliedLeafIds.length > 0) {
        setPendingVerseHighlights((current) => {
          const next = { ...current };
          for (const leafId of appliedLeafIds) {
            delete next[leafId];
          }
          return next;
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeTabId, pendingVerseHighlights, panelElementRefs, tabsVersion]);

  return {
    highlightedVerseRangesByLeafId,
    clearAllVerseHighlights,
    clearLeafHighlights,
    setLeafHighlights,
    queueVerseHighlight,
    queueVerseHighlights,
    setVerseHighlights,
  };
}
