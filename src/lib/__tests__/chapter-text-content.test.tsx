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
});
