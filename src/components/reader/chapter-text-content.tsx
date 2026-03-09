import { Fragment, memo, useMemo } from "react";

import type { Verse, VerseToken } from "@/types/bible";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export function isPunctuationToken(tokenText: string) {
  return /^[,.;:!?)]/.test(tokenText);
}

export function formatDisplayTokenText(token: VerseToken) {
  if (!token.divineName) {
    return token.text;
  }

  const possessiveMatch = token.text.match(/^(.+?)(['’])([sS])$/);
  if (possessiveMatch) {
    const [, base, apostrophe] = possessiveMatch;
    return `${base.toUpperCase()}${apostrophe}s`;
  }

  return token.text.toUpperCase();
}

function renderToken(
  token: VerseToken,
  isStudyMode: boolean,
  onOpenDetails: (element: HTMLElement, token: VerseToken) => void,
) {
  const tokenClassName = cn(token.added && "italic");
  const displayText = formatDisplayTokenText(token);

  if (!isStudyMode) {
    return <span className={tokenClassName}>{displayText}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className="cursor-pointer rounded-sm px-0.5 py-0.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/60"
      aria-label={`Details for ${displayText}`}
      onClick={(event) => {
        event.stopPropagation();
        onOpenDetails(event.currentTarget, token);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onOpenDetails(event.currentTarget, token);
        }
      }}
    >
      <span className={tokenClassName}>{displayText}</span>
    </span>
  );
}

function renderVerseTokens(
  tokens: VerseToken[],
  isStudyMode: boolean,
  onOpenDetails: (element: HTMLElement, token: VerseToken) => void,
) {
  return tokens.map((token, tokenIndex) => {
    const leadingSpace = tokenIndex > 0 && !isPunctuationToken(token.text);

    return (
      <Fragment key={`${token.text}-${tokenIndex}`}>
        {leadingSpace ? " " : null}
        {renderToken(token, isStudyMode, onOpenDetails)}
      </Fragment>
    );
  });
}

type ChapterTextContentProps = {
  bookName: string;
  chapterNumber: number;
  verses: Verse[];
  flowVersesByParagraph: boolean;
  readModeParagraphIndent: boolean;
  showVerseNumbers: boolean;
  isStudyMode: boolean;
  enableVerseSelection: boolean;
  bookmarkModeEnabled: boolean;
  pendingRangeStartVerseNumber: number | null;
  verseSpacing: number;
  onOpenTokenDetails: (element: HTMLElement, token: VerseToken) => void;
  onSelectVerse: (verseNumber: number) => void;
};

export const ChapterTextContent = memo(
  function ChapterTextContent({
    bookName,
    chapterNumber,
    verses,
    flowVersesByParagraph,
    readModeParagraphIndent,
    showVerseNumbers,
    isStudyMode,
    enableVerseSelection,
    bookmarkModeEnabled,
    pendingRangeStartVerseNumber,
    verseSpacing,
    onOpenTokenDetails,
    onSelectVerse,
  }: ChapterTextContentProps) {
    const paragraphGroups = useMemo(() => {
      const grouped: Verse[][] = [];
      let currentGroup: Verse[] = [];
      for (const verse of verses) {
        if (currentGroup.length === 0 || verse.paragraphStart) {
          if (currentGroup.length > 0) {
            grouped.push(currentGroup);
          }
          currentGroup = [verse];
        } else {
          currentGroup.push(verse);
        }
      }
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
      }
      return grouped;
    }, [verses]);

    return (
      <div
        className="flex w-full flex-col p-2"
        style={{ rowGap: `${verseSpacing}px` }}
      >
        {flowVersesByParagraph
          ? paragraphGroups.map((group, groupIndex) => (
              <article
                key={`${bookName}-${chapterNumber}-paragraph-${groupIndex}`}
                data-verse-number={group[0]?.verse ?? 1}
                className="[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]"
                onClick={(event) => {
                  if (!enableVerseSelection) {
                    return;
                  }
                  const target = event.target as HTMLElement;
                  const withVerse = target.closest<HTMLElement>(
                    "[data-verse-number]",
                  );
                  const fallbackVerse = group[0]?.verse ?? 1;
                  const raw =
                    withVerse?.dataset.verseNumber ?? `${fallbackVerse}`;
                  const verseNumber = Number.parseInt(raw, 10);
                  if (Number.isFinite(verseNumber) && verseNumber > 0) {
                    onSelectVerse(verseNumber);
                  }
                }}
              >
                <p
                  className="text-pretty leading-7"
                  style={
                    readModeParagraphIndent &&
                    (groupIndex === 0 || group[0]?.paragraphStart)
                      ? { textIndent: "1.5rem" }
                      : undefined
                  }
                >
                  {group.map((verse, verseIndex) => (
                    <Fragment
                      key={`${bookName}-${chapterNumber}-${verse.verse}`}
                    >
                      {verseIndex > 0 ? " " : null}
                      <span
                        data-verse-number={verse.verse}
                        className={cn(verse.redLetter && "text-red-700")}
                      >
                        {bookmarkModeEnabled ? (
                          <span
                            className="mr-1 inline-flex h-7 items-center align-top"
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            <Checkbox
                              checked={
                                pendingRangeStartVerseNumber === verse.verse
                              }
                              aria-label={`Select verse ${verse.verse} for bookmark`}
                              onCheckedChange={() => {
                                onSelectVerse(verse.verse);
                              }}
                            />
                          </span>
                        ) : null}
                        {showVerseNumbers ? (
                          <span className="mr-2 inline-flex w-7 shrink-0 justify-end text-xs leading-7 font-semibold tabular-nums text-muted-foreground">
                            {verse.verse}
                          </span>
                        ) : null}
                        {renderVerseTokens(
                          verse.tokens,
                          isStudyMode,
                          onOpenTokenDetails,
                        )}
                      </span>
                    </Fragment>
                  ))}
                </p>
              </article>
            ))
          : verses.map((verse) => (
              <article
                key={`${bookName}-${chapterNumber}-${verse.verse}`}
                data-verse-number={verse.verse}
                className="[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]"
                onClick={() => {
                  if (enableVerseSelection) {
                    onSelectVerse(verse.verse);
                  }
                }}
              >
                <p
                  className={cn(
                    "leading-7",
                    (showVerseNumbers || bookmarkModeEnabled) &&
                      "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {bookmarkModeEnabled ? (
                      <span
                        className="inline-flex h-7 items-center align-top"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        <Checkbox
                          checked={pendingRangeStartVerseNumber === verse.verse}
                          aria-label={`Select verse ${verse.verse} for bookmark`}
                          onCheckedChange={() => {
                            onSelectVerse(verse.verse);
                          }}
                        />
                      </span>
                    ) : null}
                    {showVerseNumbers ? (
                      <span className="inline-flex w-7 shrink-0 justify-start text-xs leading-7 font-semibold tabular-nums text-muted-foreground">
                        {verse.verse}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-pretty",
                      verse.redLetter && "text-red-700",
                    )}
                    style={
                      readModeParagraphIndent &&
                      (verse.verse === 1 || verse.paragraphStart)
                        ? { textIndent: "1.5rem" }
                        : undefined
                    }
                  >
                    {renderVerseTokens(
                      verse.tokens,
                      isStudyMode,
                      onOpenTokenDetails,
                    )}
                  </span>
                </p>
              </article>
            ))}
      </div>
    );
  },
  (prev, next) =>
    prev.bookName === next.bookName &&
    prev.chapterNumber === next.chapterNumber &&
    prev.verses === next.verses &&
    prev.flowVersesByParagraph === next.flowVersesByParagraph &&
    prev.readModeParagraphIndent === next.readModeParagraphIndent &&
    prev.showVerseNumbers === next.showVerseNumbers &&
    prev.isStudyMode === next.isStudyMode &&
    prev.enableVerseSelection === next.enableVerseSelection &&
    prev.bookmarkModeEnabled === next.bookmarkModeEnabled &&
    prev.pendingRangeStartVerseNumber === next.pendingRangeStartVerseNumber &&
    prev.verseSpacing === next.verseSpacing,
);
