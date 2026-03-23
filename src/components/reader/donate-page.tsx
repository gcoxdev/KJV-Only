import type { ReactNode } from "react";

import { ExternalLinkIcon, GiftIcon, HeartHandshakeIcon } from "lucide-react";

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

type DonateReference = {
  reference: string;
};

type DonatePageProps = {
  books: Book[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

const GIVING_REFERENCES: DonateReference[] = [
  { reference: "ACT.20.35" },
  { reference: "1PE.4.10-11" },
  { reference: "ROM.12.6-8" },
  { reference: "2CO.9.7" },
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
}: {
  books: Book[];
  references: DonateReference[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-y-3 pt-1">
      {references.map((item) => (
        <div
          key={item.reference}
          className="flex w-full max-w-full items-start gap-2"
        >
          <ConcordanceReferencePopover
            reference={item.reference}
            highlightWord=""
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
          <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
            {renderReferenceText(books, item.reference)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function DonatePage({
  books,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: DonatePageProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <GiftIcon className="size-4 text-muted-foreground" />
            Support This Work
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            This site and app is intended to remain available and free forever,
            or at least until the Lord returns.
          </p>
          <p>
            At the same time, there are real costs behind keeping it available:
            development time, ongoing maintenance, hosting, domain registration,
            and the general work involved in improving and supporting it. Any
            contribution that helps cover those costs is greatly appreciated.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="text-base sm:text-lg">
            Why This App Was Built
          </CardTitle>
          <CardDescription>
            The same general idea runs through both the work itself and any
            support someone may choose to give back.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            A large part of the reason for building and maintaining this app is
            the conviction that God gives different gifts, abilities, and
            opportunities so they can be used to help others. In that sense,
            this work is meant to be an act of service.
          </p>
          <p>
            If someone wants to reciprocate by helping cover the costs behind
            the app, that is welcome but not necessary.
            {" "}
            The point is willing help given in a right spirit.
          </p>
          <ReferenceList
            books={books}
            references={GIVING_REFERENCES}
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader className="gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <HeartHandshakeIcon className="size-4 text-muted-foreground" />
            Donate with PayPal
          </CardTitle>
          <CardDescription>
            If you want to help cover costs, PayPal is available as a simple
            optional way to give.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
          <p>
            You can use the link below, or scan the QR code on another device.
          </p>
          <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <a
                href="https://www.paypal.com/donate/?business=3HTE99BG8ESZJ&no_recurring=0&currency_code=USD"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-amber-600/70 bg-amber-500 px-3 py-2 text-sm font-medium text-amber-950 shadow-sm transition-colors hover:border-amber-500 hover:bg-amber-400"
              >
                Open PayPal Donate
                <ExternalLinkIcon className="size-4 text-amber-900/80" />
              </a>
              <p className="text-xs leading-5 text-muted-foreground">
                PayPal donation link:
                {" "}
                <a
                  href="https://www.paypal.com/donate/?business=3HTE99BG8ESZJ&no_recurring=0&currency_code=USD"
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-foreground underline underline-offset-4"
                >
                  paypal.com/donate/?business=3HTE99BG8ESZJ
                </a>
              </p>
            </div>
            <img
              src="/other/paypal-donate-qr.svg"
              alt="QR code for the PayPal donation link"
              className="h-32 w-32 rounded-md border border-border/70 bg-white p-2"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
