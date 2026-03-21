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

type ScriptureReference = {
  reference: string;
  note?: string;
};

type GospelStep = {
  title: string;
  summary: string;
  references: ScriptureReference[];
};

type HowToGetSavedPageProps = {
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
      { reference: "ROM.3.10", note: "\"There is none righteous, no, not one.\"" },
      { reference: "ROM.3.23", note: "\"For all have sinned, and come short of the glory of God.\"" },
    ],
  },
  {
    title: "2. Sin brings death and judgment",
    summary:
      "Sin is not light or harmless. Its wages are death, and without Christ a man remains condemned.",
    references: [
      { reference: "ROM.6.23", note: "\"For the wages of sin is death...\"" },
      { reference: "ROM.5.12", note: "Death passed upon all men, for that all have sinned." },
    ],
  },
  {
    title: "3. God commendeth his love toward us in Christ",
    summary:
      "Though we were sinners, Christ died for us. Salvation is provided by what Jesus Christ did, not by what we do.",
    references: [
      { reference: "ROM.5.8", note: "\"But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.\"" },
      { reference: "ROM.5.9", note: "We are justified by his blood and saved from wrath through him." },
    ],
  },
  {
    title: "4. Salvation is received by faith, not by works",
    summary:
      "A sinner is not saved by reform, religion, or personal righteousness, but by believing on the Lord Jesus Christ.",
    references: [
      { reference: "ROM.4.5", note: "God justifieth the ungodly; faith is counted for righteousness." },
      { reference: "ROM.10.9", note: "Believe in thine heart that God hath raised him from the dead, and thou shalt be saved." },
      { reference: "ROM.10.10", note: "With the heart man believeth unto righteousness." },
    ],
  },
  {
    title: "5. Call upon the name of the Lord",
    summary:
      "The sinner who believes the gospel should call upon the Lord Jesus Christ for salvation.",
    references: [
      { reference: "ROM.10.13", note: "\"For whosoever shall call upon the name of the Lord shall be saved.\"" },
      { reference: "ROM.10.17", note: "Faith cometh by hearing, and hearing by the word of God." },
    ],
  },
  {
    title: "6. In Christ there is peace and assurance",
    summary:
      "The one justified by faith has peace with God and stands no longer under condemnation.",
    references: [
      { reference: "ROM.5.1", note: "\"Therefore being justified by faith, we have peace with God through our Lord Jesus Christ.\"" },
      { reference: "ROM.8.1", note: "There is therefore now no condemnation to them which are in Christ Jesus." },
    ],
  },
];

function ReferenceList({
  references,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
  inline = false,
}: {
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
              ? "inline-flex max-w-full flex-row flex-wrap items-baseline gap-x-2 gap-y-1"
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
          {item.note ? (
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">
              {item.note}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function HowToGetSavedPage({
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
            references={[
              {
                reference: "ACT.16.31",
                note: "\"Believe on the Lord Jesus Christ, and thou shalt be saved...\"",
              },
              {
                reference: "EPH.2.8-9",
                note: "For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: not of works.",
              },
              {
                reference: "JHN.3.16",
                note: "Whosoever believeth in him should not perish, but have everlasting life.",
              },
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
