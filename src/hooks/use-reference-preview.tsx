import { type ReactNode, useCallback, useEffect, useRef } from "react";

import type { Book } from "@/types/bible";
import { normalizeConcordanceWord, parseBibleReference } from "@/lib/references";
import { renderHighlightedText } from "@/lib/reader-view";
import {
  formatDisplayTokenText,
  isPunctuationToken,
} from "@/components/reader/chapter-text-content";

type ReferencePreviewData = {
  citation: string;
  verseLines: Array<{ label: string; text: string }>;
};

type UseReferencePreviewParams = {
  books: Book[];
  openChapterReferenceInNewTab: (
    bookIndex: number,
    chapterIndex: number,
    startVerse: number,
    endVerse: number,
  ) => void;
};

export function useReferencePreview({
  books,
  openChapterReferenceInNewTab,
}: UseReferencePreviewParams) {
  const referencePreviewCacheRef = useRef<Map<string, ReferencePreviewData>>(
    new Map(),
  );

  useEffect(() => {
    referencePreviewCacheRef.current.clear();
  }, [books]);

  const openReference = useCallback(
    (reference: string) => {
      const parsed = parseBibleReference(reference);
      if (!parsed) {
        return;
      }
      const startChapter =
        books[parsed.bookIndex]?.chapters[parsed.startChapterIndex] ?? null;
      const highlightEnd =
        parsed.startChapterIndex === parsed.endChapterIndex
          ? parsed.endVerse
          : (startChapter?.verses[startChapter.verses.length - 1]?.verse ??
            parsed.startVerse);
      openChapterReferenceInNewTab(
        parsed.bookIndex,
        parsed.startChapterIndex,
        parsed.startVerse,
        highlightEnd,
      );
    },
    [books, openChapterReferenceInNewTab],
  );

  const referencePreviewData = useCallback(
    (reference: string) => {
      const cached = referencePreviewCacheRef.current.get(reference);
      if (cached) {
        return cached;
      }

      const parsed = parseBibleReference(reference);
      if (!parsed) {
        const fallback = {
          citation: reference,
          verseLines: [] as Array<{ label: string; text: string }>,
        };
        referencePreviewCacheRef.current.set(reference, fallback);
        return fallback;
      }

      const book = books[parsed.bookIndex];
      const chapters = book?.chapters ?? [];
      if (
        !book ||
        !chapters[parsed.startChapterIndex] ||
        !chapters[parsed.endChapterIndex]
      ) {
        const fallback = {
          citation: reference,
          verseLines: [] as Array<{ label: string; text: string }>,
        };
        referencePreviewCacheRef.current.set(reference, fallback);
        return fallback;
      }

      const MAX_PREVIEW_VERSES = 24;
      const verseLines: Array<{ label: string; text: string }> = [];
      for (
        let chapterIndex = parsed.startChapterIndex;
        chapterIndex <= parsed.endChapterIndex;
        chapterIndex += 1
      ) {
        const chapter = chapters[chapterIndex];
        if (!chapter) {
          continue;
        }

        const start =
          chapterIndex === parsed.startChapterIndex ? parsed.startVerse : 1;
        const end =
          chapterIndex === parsed.endChapterIndex
            ? parsed.endVerse
            : (chapter.verses[chapter.verses.length - 1]?.verse ?? 0);
        const verses = chapter.verses.filter(
          (candidate) => candidate.verse >= start && candidate.verse <= end,
        );

        for (const verse of verses) {
          verseLines.push({
            label: `${chapter.chapter}:${verse.verse}`,
            text: verse.tokens
              .map((token, index) => {
                const leadingSpace = index > 0 && !isPunctuationToken(token.text);
                return `${leadingSpace ? " " : ""}${formatDisplayTokenText(token)}`;
              })
              .join(""),
          });
          if (verseLines.length >= MAX_PREVIEW_VERSES) {
            break;
          }
        }

        if (verseLines.length >= MAX_PREVIEW_VERSES) {
          break;
        }
      }

      const citationVerse =
        parsed.startChapterIndex === parsed.endChapterIndex
          ? parsed.startVerse === parsed.endVerse
            ? `${parsed.startChapterIndex + 1}:${parsed.startVerse}`
            : `${parsed.startChapterIndex + 1}:${parsed.startVerse}-${parsed.endVerse}`
          : `${parsed.startChapterIndex + 1}:${parsed.startVerse}-${parsed.endChapterIndex + 1}:${parsed.endVerse}`;

      const computed = {
        citation: `${book.name} ${citationVerse}`,
        verseLines,
      };
      referencePreviewCacheRef.current.set(reference, computed);
      return computed;
    },
    [books],
  );

  const renderPreview = useCallback(
    (reference: string, highlightWord: string): ReactNode => {
      const { citation, verseLines } = referencePreviewData(reference);
      const needle = normalizeConcordanceWord(highlightWord);

      if (verseLines.length === 0) {
        return (
          <div className="space-y-1">
            <p className="font-semibold">{citation}</p>
            <p>{reference}</p>
          </div>
        );
      }

      return (
        <div className="space-y-1">
          <p className="font-semibold">{citation}</p>
          <div className="space-y-1">
            {verseLines.map((line) => (
              <p key={`${reference}-line-${line.label}`}>
                <span className="mr-1 text-xs font-semibold text-muted-foreground">
                  {line.label}
                </span>
                <span>
                  {renderHighlightedText(
                    line.text,
                    needle,
                    `${reference}-${line.label}`,
                  )}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    },
    [referencePreviewData],
  );

  return { openReference, renderPreview };
}
