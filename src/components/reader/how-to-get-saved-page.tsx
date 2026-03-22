import type { ReactNode } from "react";

import { HeartHandshakeIcon } from "lucide-react";

import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseBibleReference } from "@/lib/references";
import type { Book } from "@/types/bible";

type ScriptureReference = {
  reference: string;
};

type GospelStep = {
  title: string;
  summary: string;
  references: ScriptureReference[];
};

type HowToGetSavedPageProps = {
  books: Book[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

const ROMANS_ROAD_STEPS: GospelStep[] = [
  {
    title: "1. Every man is a sinner before God",
    summary:
      "Salvation begins with the truth that all have sinned and none are righteous in themselves.",
    references: [
      { reference: "ROM.3.10" },
      { reference: "ROM.3.23" },
    ],
  },
  {
    title: "2. Sin brings death and judgment",
    summary:
      "Sin is not light or harmless. Its wages are death, and without Christ a man remains condemned.",
    references: [
      { reference: "ROM.6.23" },
      { reference: "ROM.5.12" },
    ],
  },
  {
    title: "3. God commendeth his love toward us in Christ",
    summary:
      "Though we were sinners, Christ died for us. Salvation is provided by what Jesus Christ did, not by what we do.",
    references: [
      { reference: "ROM.5.8" },
      { reference: "ROM.5.9" },
    ],
  },
  {
    title: "4. Salvation is received by faith, not by works",
    summary:
      "A sinner is not saved by reform, religion, or personal righteousness, but by believing on the Lord Jesus Christ.",
    references: [
      { reference: "ROM.4.5" },
      { reference: "ROM.6.23" },
      { reference: "ROM.10.9" },
      { reference: "ROM.10.10" },
    ],
  },
  {
    title: "5. Call upon the name of the Lord",
    summary:
      "The sinner who believes the gospel should call upon the Lord Jesus Christ for salvation.",
    references: [
      { reference: "ROM.10.13" },
      { reference: "ROM.10.17" },
    ],
  },
  {
    title: "6. In Christ there is peace and assurance",
    summary:
      "The one justified by faith has peace with God and stands no longer under condemnation.",
    references: [
      { reference: "ROM.5.1" },
      { reference: "ROM.8.1" },
    ],
  },
];

function renderReferenceText(books: Book[], reference: string) {
  const parsed = parseBibleReference(reference);
  if (!parsed) {
    return "";
  }

  const book = books[parsed.bookIndex];
  if (!book) {
    return "";
  }

  const chapterTexts: string[] = [];
  for (
    let chapterIndex = parsed.startChapterIndex;
    chapterIndex <= parsed.endChapterIndex;
    chapterIndex += 1
  ) {
    const chapter = book.chapters[chapterIndex];
    if (!chapter) {
      continue;
    }

    const verseStart =
      chapterIndex === parsed.startChapterIndex ? parsed.startVerse : 1;
    const verseEnd =
      chapterIndex === parsed.endChapterIndex
        ? parsed.endVerse
        : chapter.verses[chapter.verses.length - 1]?.verse ?? 0;

    const text = chapter.verses
      .filter((verse) => verse.verse >= verseStart && verse.verse <= verseEnd)
      .map((verse) =>
        verse.tokens.reduce((result, token, index) => {
          const tokenText = token.divineName ? token.text.toUpperCase() : token.text;
          const noLeadingSpace =
            index === 0 || /^['")\].,;:!?]+$/.test(tokenText) || tokenText === "'s";
          return `${result}${noLeadingSpace ? "" : " "}${tokenText}`;
        }, ""),
      )
      .join(" ");

    if (text) {
      chapterTexts.push(text);
    }
  }

  return chapterTexts.join(" ");
}

function ReferenceList({
  books,
  references,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
  inline = false,
}: {
  books: Book[];
  references: ScriptureReference[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
  inline?: boolean;
}) {
  return (
    <div
      className={
        inline
          ? "flex flex-col items-start gap-y-3 pt-1"
          : "flex flex-wrap gap-2 pt-1"
      }
    >
      {references.map((item) => (
        <div
          key={item.reference}
          className={
            inline
              ? "flex w-full max-w-full items-start gap-2"
              : "flex flex-col gap-1 rounded-lg border border-border/70 bg-background/70 px-3 py-2"
          }
        >
          <ConcordanceReferencePopover
            reference={item.reference}
            highlightWord=""
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
          {renderReferenceText(books, item.reference) ? (
            <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
              {renderReferenceText(books, item.reference)}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function HowToGetSavedPage({
  books,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: HowToGetSavedPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <HeartHandshakeIcon className="size-4 text-muted-foreground" />
            The Romans Road to Salvation
          </CardTitle>
          <CardDescription>
            A simple presentation from the book of Romans showing man's need,
            God's provision in Christ, and the Bible's call to believe on the
            Lord Jesus Christ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            The Bible shows that man is a sinner, that sin brings death, that
            Christ died and rose again for sinners, and that whosoever believes
            on him and calls upon him shall be saved.
          </p>
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Need
              </p>
              <p className="mt-2 text-sm leading-6">
                Every man is a sinner before a holy God.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Provision
              </p>
              <p className="mt-2 text-sm leading-6">
                Jesus Christ died and rose again for sinners.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Response
              </p>
              <p className="mt-2 text-sm leading-6">
                Believe on Christ and call upon the Lord.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {ROMANS_ROAD_STEPS.map((step) => (
          <Card key={step.title} className="border-border/70 bg-card/70 shadow-sm">
            <CardHeader className="gap-2">
              <CardTitle className="text-base sm:text-lg">{step.title}</CardTitle>
              <CardDescription>{step.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReferenceList
                books={books}
                references={step.references}
                renderPreview={renderPreview}
                onOpenReference={onOpenReference}
                onCloseSidebar={onCloseSidebar}
                inline
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-base sm:text-lg">What Should You Do?</CardTitle>
          <CardDescription>
            Believe on the Lord Jesus Christ. Do not trust your works, your
            religion, or your feelings. Trust Christ alone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            If God is dealing with your heart, come to him honestly. Confess
            that you are a sinner, believe that Jesus Christ died for your sins
            and rose again, and call upon him for mercy and salvation.
          </p>
          <ReferenceList
            books={books}
            references={[
              { reference: "1CO.15.1-4" },
              { reference: "EPH.1.13" },
              { reference: "ACT.16.31" },
              { reference: "EPH.2.8-9" },
              { reference: "TIT.3.5-6" },
              { reference: "JHN.3.16" },
            ]}
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
            inline
          />
        </CardContent>
      </Card>
    </div>
  );
}
