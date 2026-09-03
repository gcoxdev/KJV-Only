import { useCallback, useRef } from "react";

import {
  chapterVerseKey,
  normalizeConcordanceWord,
  resolveTokenStrongsCodes,
} from "@/lib/references";
import { resolveWordTokenAtLocation } from "@/lib/word-study-selection";
import type {
  CrossRefsPayload,
  StudyToolsDestination,
} from "@/types/reader";
import type { NotesContext, NoteLinkTarget } from "@/types/notes";
import type { Book, VerseToken } from "@/types/bible";

type ReaderWordHighlight = {
  leafId: string;
  verseNumber: number;
  word: string;
};

type OpenReaderTarget = (
  target:
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
      },
  destination: "new-tab" | "new-panel" | "targeted-panel",
) => string | null;

type UseWordStudyNavigationParams = {
  books: Book[];
  crossRefs: CrossRefsPayload | null;
  ensureCrossRefsLoaded: () => Promise<CrossRefsPayload>;
  openStudyTool: (
    tool: "cross-refs" | "concordance",
    options?: { sourceLeafId?: string | null },
  ) => StudyToolsDestination | null;
  onPanelVerseSelection: (
    leafId: string,
    selection: {
      bookIndex: number;
      chapterIndex: number;
      verseNumber: number;
    },
  ) => void;
  setCrossRefsError: (value: string | null) => void;
  setIsCrossRefsLoading: (value: boolean) => void;
  setSelectedCrossReferences: (value: {
    key: string;
    references: string[];
  } | null) => void;
  setNotesContext: (value: NotesContext | null) => void;
  openReaderTarget: OpenReaderTarget;
  notesLinkOpenTarget: "new-tab" | "new-panel" | "targeted-panel";
  setActiveReaderWordHighlight: (value: ReaderWordHighlight | null) => void;
  syncTokenAccordionState: (
    rawWord: string,
    options?: {
      verseNumber?: number | null;
      bookIndex?: number;
      chapterIndex?: number;
      strongCodes?: string[];
    },
  ) => void;
  openWordInStudyTools: (args: {
    rawWord: string;
    bookIndex: number;
    chapterIndex: number;
    verseNumber: number | null;
    tokenIndex: number | null;
    strongCodes: string[];
    sourceLeafId: string | null;
  }) => StudyToolsDestination | void;
  setTokenPopup: (value: { token: VerseToken; x: number; y: number } | null) => void;
};

export function contextFromNoteLinkTarget(target: NoteLinkTarget): NotesContext {
  if (target.type === "chapter") {
    return {
      bookIndex: target.bookIndex,
      chapterIndex: target.chapterIndex,
    };
  }
  if (target.type === "verse") {
    return {
      bookIndex: target.bookIndex,
      chapterIndex: target.chapterIndex,
      verseNumber: target.verseNumber,
    };
  }
  if (target.type === "range") {
    return {
      bookIndex: target.start.bookIndex,
      chapterIndex: target.start.chapterIndex,
      verseNumber: target.start.verseNumber,
    };
  }
  if (target.type === "selection") {
    return {
      bookIndex: target.bookIndex,
      chapterIndex: target.chapterIndex,
    };
  }
  return {
    bookIndex: target.bookIndex,
    chapterIndex: target.chapterIndex,
    verseNumber: target.verseNumber,
    word: target.word,
  };
}

export function useWordStudyNavigation({
  books,
  crossRefs,
  ensureCrossRefsLoaded,
  openStudyTool,
  onPanelVerseSelection,
  setCrossRefsError,
  setIsCrossRefsLoading,
  setSelectedCrossReferences,
  setNotesContext,
  openReaderTarget,
  notesLinkOpenTarget,
  setActiveReaderWordHighlight,
  syncTokenAccordionState,
  openWordInStudyTools,
  setTokenPopup,
}: UseWordStudyNavigationParams) {
  const crossRefsRequestIdRef = useRef(0);

  const openCrossReferencesForVerse = useCallback(
    (
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      sourceLeafId?: string | null,
    ) => {
      const requestId = ++crossRefsRequestIdRef.current;
      setNotesContext({
        bookIndex,
        chapterIndex,
        verseNumber,
      });
      const key = chapterVerseKey(bookIndex, chapterIndex, verseNumber);

      const selectionTarget = openStudyTool("cross-refs", { sourceLeafId });
      if (selectionTarget?.type === "panel") {
        onPanelVerseSelection(selectionTarget.leafId, {
          bookIndex,
          chapterIndex,
          verseNumber,
        });
        return selectionTarget;
      }
      setCrossRefsError(null);
      setIsCrossRefsLoading(true);

      const applyCrossRefsSelection = (data: CrossRefsPayload) => {
        if (crossRefsRequestIdRef.current !== requestId) {
          return;
        }
        setSelectedCrossReferences({
          key,
          references: data[key] ?? [],
        });
        setIsCrossRefsLoading(false);
      };

      if (crossRefs) {
        applyCrossRefsSelection(crossRefs);
        return selectionTarget ?? undefined;
      }

      void ensureCrossRefsLoaded()
        .then((data) => {
          applyCrossRefsSelection(data);
        })
        .catch((error) => {
          if (crossRefsRequestIdRef.current !== requestId) {
            return;
          }
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load cross-reference data";
          setCrossRefsError(message);
          setIsCrossRefsLoading(false);
        });
      return selectionTarget ?? undefined;
    },
    [
      crossRefs,
      ensureCrossRefsLoaded,
      onPanelVerseSelection,
      openStudyTool,
      setCrossRefsError,
      setIsCrossRefsLoading,
      setNotesContext,
      setSelectedCrossReferences,
    ],
  );

  const openNoteLinkTarget = useCallback(
    (target: NoteLinkTarget) => {
      setNotesContext(contextFromNoteLinkTarget(target));

      if (target.type === "word") {
        const rawWord = normalizeConcordanceWord(target.word) || target.word;
        const matchedToken = resolveWordTokenAtLocation(
          books,
          target.bookIndex,
          target.chapterIndex,
          target.verseNumber,
          rawWord,
        );
        const strongCodes = matchedToken
          ? resolveTokenStrongsCodes(matchedToken.token)
          : [];
        const leafId = openReaderTarget(
          {
            type: "verse",
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            verseNumber: target.verseNumber,
          },
          notesLinkOpenTarget,
        );
        if (leafId) {
          setActiveReaderWordHighlight({
            leafId,
            verseNumber: target.verseNumber,
            word: rawWord,
          });
        }
        openCrossReferencesForVerse(
          target.bookIndex,
          target.chapterIndex,
          target.verseNumber,
          leafId,
        );
        const studyToolsTarget = openWordInStudyTools({
          rawWord,
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
          tokenIndex: matchedToken?.tokenIndex ?? null,
          strongCodes,
          sourceLeafId: leafId,
        });
        if (studyToolsTarget?.type !== "panel") {
          syncTokenAccordionState(rawWord, {
            bookIndex: target.bookIndex,
            chapterIndex: target.chapterIndex,
            verseNumber: target.verseNumber,
            strongCodes,
          });
        }
        return;
      }

      openReaderTarget(target, notesLinkOpenTarget);
    },
    [
      books,
      notesLinkOpenTarget,
      openCrossReferencesForVerse,
      openReaderTarget,
      openWordInStudyTools,
      setActiveReaderWordHighlight,
      setNotesContext,
      syncTokenAccordionState,
    ],
  );

  const openTokenDetailsFromElement = useCallback(
    (
      element: HTMLElement,
      leafId: string,
      token: VerseToken,
      bookIndex: number,
      chapterIndex: number,
      verseNumber: number,
      tokenIndex: number,
    ) => {
      const strongCodes = resolveTokenStrongsCodes(token);
      if (strongCodes.length === 0 && !token.added) {
        const rect = element.getBoundingClientRect();
        const popupWidth = 280;
        const safeX = Math.max(
          8,
          Math.min(window.innerWidth - popupWidth - 8, rect.left),
        );
        const safeY = Math.min(window.innerHeight - 180, rect.bottom + 8);
        setTokenPopup({
          token,
          x: safeX,
          y: safeY,
        });
      } else {
        setTokenPopup(null);
      }

      const rawWord = normalizeConcordanceWord(token.text);
      if (Number.isFinite(verseNumber) && verseNumber > 0) {
        openCrossReferencesForVerse(
          bookIndex,
          chapterIndex,
          verseNumber,
          leafId,
        );
        if (rawWord) {
          setActiveReaderWordHighlight({
            leafId,
            verseNumber,
            word: rawWord,
          });
          setNotesContext({
            bookIndex,
            chapterIndex,
            verseNumber,
            word: rawWord,
          });
        } else {
          setActiveReaderWordHighlight(null);
        }
      } else if (rawWord) {
        setActiveReaderWordHighlight(null);
        setNotesContext({
          bookIndex,
          chapterIndex,
          word: rawWord,
        });
      } else {
        setActiveReaderWordHighlight(null);
      }

      if (!rawWord) {
        return;
      }

      openWordInStudyTools({
        rawWord,
        bookIndex,
        chapterIndex,
        verseNumber:
          Number.isFinite(verseNumber) && verseNumber > 0 ? verseNumber : null,
        tokenIndex,
        strongCodes,
        sourceLeafId: leafId,
      });
    },
    [
      openCrossReferencesForVerse,
      openWordInStudyTools,
      setActiveReaderWordHighlight,
      setNotesContext,
      setTokenPopup,
    ],
  );

  return {
    openCrossReferencesForVerse,
    openNoteLinkTarget,
    openTokenDetailsFromElement,
  };
}
