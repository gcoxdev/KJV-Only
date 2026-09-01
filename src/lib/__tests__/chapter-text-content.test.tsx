import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ChapterTextContent } from "@/components/reader/chapter-text-content";

const verses = [
  {
    verse: 1,
    tokens: [{ text: "In" }, { text: "the" }, { text: "beginning" }],
    paragraphStart: true,
  },
  {
    verse: 2,
    tokens: [{ text: "And" }, { text: "the" }, { text: "earth" }],
  },
];

describe("ChapterTextContent", () => {
  it("does not render content-visibility containment classes on paragraph flow blocks", () => {
    const markup = renderToStaticMarkup(
      <ChapterTextContent
        bookName="Genesis"
        chapterNumber={1}
        verses={verses}
        flowVersesByParagraph
        readModeParagraphIndent={false}
        showVerseNumbers
        isStudyMode={false}
        enableVerseSelection={false}
        highlightModeEnabled={false}
        highlightedVerseRanges={[]}
        noteWordHighlight={null}
        fontSize={16}
        verseSpacing={0}
        onOpenTokenDetails={vi.fn()}
        onSelectVerse={vi.fn()}
      />,
    );

    expect(markup).not.toContain("content-visibility:auto");
    expect(markup).not.toContain("contain-intrinsic-size");
  });

  it("does not render content-visibility containment classes on verse blocks", () => {
    const markup = renderToStaticMarkup(
      <ChapterTextContent
        bookName="Genesis"
        chapterNumber={1}
        verses={verses}
        flowVersesByParagraph={false}
        readModeParagraphIndent={false}
        showVerseNumbers
        isStudyMode={false}
        enableVerseSelection={false}
        highlightModeEnabled={false}
        highlightedVerseRanges={[]}
        noteWordHighlight={null}
        fontSize={16}
        verseSpacing={0}
        onOpenTokenDetails={vi.fn()}
        onSelectVerse={vi.fn()}
      />,
    );

    expect(markup).not.toContain("content-visibility:auto");
    expect(markup).not.toContain("contain-intrinsic-size");
  });

  it("keeps standalone punctuation attached and non-interactive in study mode", () => {
    const markup = renderToStaticMarkup(
      <ChapterTextContent
        bookName="Genesis"
        chapterNumber={1}
        verses={[
          {
            verse: 1,
            tokens: [
              { text: "God" },
              { text: "," },
              { text: "said" },
              { text: ":" },
              { text: "Amen" },
              { text: "." },
            ],
          },
        ]}
        flowVersesByParagraph={false}
        readModeParagraphIndent={false}
        showVerseNumbers={false}
        isStudyMode
        enableVerseSelection={false}
        highlightModeEnabled={false}
        highlightedVerseRanges={[]}
        noteWordHighlight={null}
        fontSize={16}
        verseSpacing={0}
        onOpenTokenDetails={vi.fn()}
        onSelectVerse={vi.fn()}
      />,
    );

    expect(markup.match(/data-inline-study-token="true"/g)).toHaveLength(3);
    expect(markup).toContain('aria-label="Details for God"');
    expect(markup).toContain('aria-label="Details for said"');
    expect(markup).toContain('aria-label="Details for Amen"');
    expect(markup).not.toContain('aria-label="Details for ,"');
    expect(markup).not.toContain('aria-label="Details for :"');
    expect(markup).not.toContain('aria-label="Details for ."');
    expect(markup.replace(/<[^>]+>/g, "")).toBe("God, said: Amen.");
  });
});
