import { Fragment, memo, useMemo } from "react";

import type { Verse, VerseToken } from "@/types/bible";
import { normalizeConcordanceWord } from "@/lib/references";
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
  tokenIndex: number,
  isStudyMode: boolean,
  isNoteWordHighlighted: boolean,
  onOpenDetails: (
    element: HTMLElement,
    token: VerseToken,
    tokenIndex: number,
  ) => void,
) {
  const tokenClassName = cn(
    token.added && "italic",
    isNoteWordHighlighted &&
      "rounded-sm bg-amber-200/80 px-0.5 py-0.5 text-amber-950 ring-1 ring-amber-500/60 dark:bg-amber-300/85 dark:text-amber-950 dark:ring-amber-200/70",
  );
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
        onOpenDetails(event.currentTarget, token, tokenIndex);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onOpenDetails(event.currentTarget, token, tokenIndex);
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
  highlightedWord: string | null,
  onOpenDetails: (
    element: HTMLElement,
    token: VerseToken,
    tokenIndex: number,
  ) => void,
) {
  return tokens.map((token, tokenIndex) => {
    const leadingSpace = tokenIndex > 0 && !isPunctuationToken(token.text);
    const normalizedHighlightedWord = highlightedWord
      ? normalizeConcordanceWord(highlightedWord).toLowerCase()
      : "";
    const isNoteWordHighlighted =
      normalizedHighlightedWord.length > 0 &&
      normalizeConcordanceWord(token.text).toLowerCase() === normalizedHighlightedWord;

    return (
      <Fragment key={`${token.text}-${tokenIndex}`}>
        {leadingSpace ? " " : null}
        {renderToken(
          token,
          tokenIndex,
          isStudyMode,
          isNoteWordHighlighted,
          onOpenDetails,
        )}
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
  highlightModeEnabled: boolean;
  highlightedVerseRanges?: Array<{ start: number; end: number }> | null;
  noteWordHighlight?: { verseNumber: number; word: string } | null;
  fontSize: number;
  verseSpacing: number;
  onOpenTokenDetails: (
    element: HTMLElement,
    token: VerseToken,
    verseNumber: number,
    tokenIndex: number,
  ) => void;
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
    highlightModeEnabled,
    highlightedVerseRanges,
    noteWordHighlight,
    fontSize,
    verseSpacing,
    onOpenTokenDetails,
    onSelectVerse,
  }: ChapterTextContentProps) {
    const lineHeight = Math.max(24, Math.round(fontSize * 1.75));
    const verseNumberSize = Math.max(11, Math.round(fontSize * 0.75));

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

    const normalizedHighlightedVerseRanges = useMemo(
      () => highlightedVerseRanges ?? [],
      [highlightedVerseRanges],
    );
    const isVerseHighlighted = useMemo(
      () =>
        normalizedHighlightedVerseRanges.length > 0
          ? (verseNumber: number) =>
              normalizedHighlightedVerseRanges.some(
                (range) =>
                  verseNumber >= range.start && verseNumber <= range.end,
              )
          : () => false,
      [normalizedHighlightedVerseRanges],
    );
    const hasAnyHighlightedVerse = normalizedHighlightedVerseRanges.length > 0;

    return (
      <div
        className="flex w-full flex-col p-2"
        style={{
          rowGap: `${verseSpacing}px`,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
        }}
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
                  className="text-pretty"
                  style={
                    readModeParagraphIndent &&
                    (groupIndex === 0 || group[0]?.paragraphStart)
                      ? {
                          textIndent: "1.5rem",
                          lineHeight: `${lineHeight}px`,
                        }
                      : { lineHeight: `${lineHeight}px` }
                  }
                >
                  {group.map((verse, verseIndex) => (
                    (() => {
                      const highlighted = isVerseHighlighted(verse.verse);

                      return (
                        <Fragment
                          key={`${bookName}-${chapterNumber}-${verse.verse}`}
                        >
                          {verseIndex > 0 ? " " : null}
                          <span
                            data-verse-number={verse.verse}
                            className={cn(
                              hasAnyHighlightedVerse &&
                                !highlightModeEnabled &&
                                "pl-1",
                              verse.redLetter && "text-red-700",
                              highlighted && "verse-reference-highlight",
                            )}
                          >
                            {highlightModeEnabled ? (
                              <span
                                className="mr-1 inline-flex items-center pl-1 align-top"
                                style={{ height: `${lineHeight}px` }}
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                              >
                                <Checkbox
                                  checked={highlighted}
                                  aria-label={`Select verse ${verse.verse} for highlight`}
                                  className={cn(
                                    highlighted &&
                                      "border-[var(--verse-highlight-fg)] text-[var(--verse-highlight-fg)] data-checked:border-[var(--verse-highlight-fg)] data-checked:bg-[var(--verse-highlight-fg)] data-checked:text-[var(--verse-highlight-bg)]",
                                  )}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onSelectVerse(verse.verse);
                                  }}
                                  onCheckedChange={() => {}}
                                />
                              </span>
                            ) : null}
                            {showVerseNumbers ? (
                              <span
                                className={cn(
                                  "mr-2 inline-flex w-7 shrink-0 justify-end font-semibold tabular-nums text-muted-foreground",
                                  highlighted &&
                                    "text-[var(--verse-highlight-fg)]",
                                )}
                                style={{
                                  fontSize: `${verseNumberSize}px`,
                                  lineHeight: `${lineHeight}px`,
                                }}
                              >
                                {verse.verse}
                              </span>
                            ) : null}
                            {renderVerseTokens(
                              verse.tokens,
                              isStudyMode,
                              noteWordHighlight?.verseNumber === verse.verse
                                ? noteWordHighlight.word
                                : null,
                              (element, token, tokenIndex) =>
                                onOpenTokenDetails(
                                  element,
                                  token,
                                  verse.verse,
                                  tokenIndex,
                                ),
                            )}
                          </span>
                        </Fragment>
                      );
                    })()
                  ))}
                </p>
              </article>
            ))
          : verses.map((verse) => (
              (() => {
                const highlighted = isVerseHighlighted(verse.verse);

                return (
                  <article
                    key={`${bookName}-${chapterNumber}-${verse.verse}`}
                    data-verse-number={verse.verse}
                    className={cn(
                      "[content-visibility:auto] [contain-intrinsic-size:0_2.5rem]",
                      hasAnyHighlightedVerse && !highlightModeEnabled && "pl-1",
                      highlighted && "verse-reference-highlight",
                    )}
                    onClick={() => {
                      if (enableVerseSelection && !highlightModeEnabled) {
                        onSelectVerse(verse.verse);
                      }
                    }}
                  >
                    <p
                      className={cn(
                        (showVerseNumbers || highlightModeEnabled) &&
                          "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2",
                      )}
                      style={{ lineHeight: `${lineHeight}px` }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {highlightModeEnabled ? (
                          <span
                            className="inline-flex items-center pl-1 align-top"
                            style={{ height: `${lineHeight}px` }}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                          >
                            <Checkbox
                              checked={highlighted}
                              aria-label={`Select verse ${verse.verse} for highlight`}
                              className={cn(
                                highlighted &&
                                  "border-[var(--verse-highlight-fg)] text-[var(--verse-highlight-fg)] data-checked:border-[var(--verse-highlight-fg)] data-checked:bg-[var(--verse-highlight-fg)] data-checked:text-[var(--verse-highlight-bg)]",
                              )}
                              onClick={(event) => {
                                event.stopPropagation();
                                onSelectVerse(verse.verse);
                              }}
                              onCheckedChange={() => {}}
                            />
                          </span>
                        ) : null}
                        {showVerseNumbers ? (
                          <span
                            className={cn(
                              "inline-flex w-7 shrink-0 justify-start font-semibold tabular-nums text-muted-foreground",
                              highlighted && "text-[var(--verse-highlight-fg)]",
                            )}
                            style={{
                              fontSize: `${verseNumberSize}px`,
                              lineHeight: `${lineHeight}px`,
                            }}
                          >
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
                          noteWordHighlight?.verseNumber === verse.verse
                            ? noteWordHighlight.word
                            : null,
                          (element, token, tokenIndex) =>
                            onOpenTokenDetails(
                              element,
                              token,
                              verse.verse,
                              tokenIndex,
                            ),
                        )}
                      </span>
                    </p>
                  </article>
                );
              })()
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
    prev.highlightModeEnabled === next.highlightModeEnabled &&
    (prev.highlightedVerseRanges?.length ?? 0) ===
      (next.highlightedVerseRanges?.length ?? 0) &&
    (prev.highlightedVerseRanges ?? []).every((range, index) => {
      const other = next.highlightedVerseRanges?.[index];
      return other?.start === range.start && other.end === range.end;
    }) &&
    prev.noteWordHighlight?.verseNumber === next.noteWordHighlight?.verseNumber &&
    prev.noteWordHighlight?.word === next.noteWordHighlight?.word &&
    prev.fontSize === next.fontSize &&
    prev.verseSpacing === next.verseSpacing,
);
