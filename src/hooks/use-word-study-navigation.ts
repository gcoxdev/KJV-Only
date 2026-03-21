import { useCallback } from "react";

import { chapterVerseKey, normalizeConcordanceWord, normalizeStrongsCode } from "@/lib/references";
import type { CrossRefsPayload } from "@/types/reader";
import type { NotesContext, NoteLinkTarget } from "@/types/notes";
import type { VerseToken } from "@/types/bible";

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

type WordTokenMatch = { token: VerseToken; tokenIndex: number } | null;

type UseWordStudyNavigationParams = {
  crossRefs: CrossRefsPayload | null;
  ensureCrossRefsLoaded: () => Promise<CrossRefsPayload>;
  openStudyTool: (tool: "cross-refs" | "concordance") => void;
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
  resolveWordTokenAtLocation: (
    bookIndex: number,
    chapterIndex: number,
    verseNumber: number,
    rawWord: string,
  ) => WordTokenMatch;
  syncTokenAccordionState: (
    rawWord: string,
    options?: {
      verseNumber?: number | null;
      bookIndex?: number;
      chapterIndex?: number;
      strongCode?: string | null;
    },
  ) => void;
  openWordInStudyTools: (args: {
    rawWord: string;
    bookIndex: number;
    chapterIndex: number;
    verseNumber: number | null;
    tokenIndex: number | null;
    strongCode: string | null;
  }) => void;
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
  crossRefs,
  ensureCrossRefsLoaded,
  openStudyTool,
  setCrossRefsError,
  setIsCrossRefsLoading,
  setSelectedCrossReferences,
  setNotesContext,
  openReaderTarget,
  notesLinkOpenTarget,
  setActiveReaderWordHighlight,
  resolveWordTokenAtLocation,
  syncTokenAccordionState,
  openWordInStudyTools,
  setTokenPopup,
}: UseWordStudyNavigationParams) {
  const openCrossReferencesForVerse = useCallback(
    (bookIndex: number, chapterIndex: number, verseNumber: number) => {
      setNotesContext({
        bookIndex,
        chapterIndex,
        verseNumber,
      });
      const key = chapterVerseKey(bookIndex, chapterIndex, verseNumber);

      openStudyTool("cross-refs");
      setCrossRefsError(null);
      setIsCrossRefsLoading(true);

      const applyCrossRefsSelection = (data: CrossRefsPayload) => {
        setSelectedCrossReferences({
          key,
          references: data[key] ?? [],
        });
        setIsCrossRefsLoading(false);
      };

      if (crossRefs) {
        applyCrossRefsSelection(crossRefs);
        return;
      }

      void ensureCrossRefsLoaded()
        .then((data) => {
          applyCrossRefsSelection(data);
        })
        .catch((error) => {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to load cross-reference data";
          setCrossRefsError(message);
          setIsCrossRefsLoading(false);
        });
    },
    [
      crossRefs,
      ensureCrossRefsLoaded,
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
          target.bookIndex,
          target.chapterIndex,
          target.verseNumber,
          rawWord,
        );
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
        openWordInStudyTools({
          rawWord,
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
          tokenIndex: matchedToken?.tokenIndex ?? null,
          strongCode: matchedToken?.token.strong
            ? normalizeStrongsCode(matchedToken.token.strong)
            : null,
        });
        syncTokenAccordionState(rawWord, {
          bookIndex: target.bookIndex,
          chapterIndex: target.chapterIndex,
          verseNumber: target.verseNumber,
          strongCode: matchedToken?.token.strong
            ? normalizeStrongsCode(matchedToken.token.strong)
            : null,
        });
        return;
      }

      openReaderTarget(target, notesLinkOpenTarget);
    },
    [
      notesLinkOpenTarget,
      openReaderTarget,
      openWordInStudyTools,
      resolveWordTokenAtLocation,
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
      if (!token.strong && !token.added) {
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
        openCrossReferencesForVerse(bookIndex, chapterIndex, verseNumber);
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

      const normalizedCode = token.strong
        ? normalizeStrongsCode(token.strong)
        : null;
      openWordInStudyTools({
        rawWord,
        bookIndex,
        chapterIndex,
        verseNumber:
          Number.isFinite(verseNumber) && verseNumber > 0 ? verseNumber : null,
        tokenIndex,
        strongCode: normalizedCode,
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
