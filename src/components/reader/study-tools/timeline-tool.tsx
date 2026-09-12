import { useVisualToolTarget } from "@/hooks/use-visual-tool-target";
import { lazy, Suspense, useMemo, useState, type ReactNode } from "react";
import { HistoryIcon } from "lucide-react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { buildContextTimeline, CHAPTER_TIMELINE_MAP, CONTEXT_TIMELINE_COVERAGE, selectContextTimeline } from "@/data/contextual-timeline";
import { timelineDateSummary } from "@/lib/bible-timeline";
import { useTimelineModel } from "@/hooks/use-timeline-model";
import type { TimelineReaderContext } from "@/hooks/use-timeline-reader-context";
import type { Book } from "@/types/bible";

const TimelineDialog = lazy(() => import("../contextual-timeline-dialog"));

export type TimelineToolProps = {
  isOpen: boolean;
  context: TimelineReaderContext | null;
  books: Book[];
  renderPreview: (reference: string, word: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function TimelineTool({ isOpen, context, books, ...referenceProps }: TimelineToolProps) {
  const openVisualTool = useVisualToolTarget();
  const [open, setOpen] = useState(false);
  const [model] = useTimelineModel();
  const records = useMemo(() => buildContextTimeline(model), [model]);
  const book = context ? books[context.bookIndex]?.name ?? "" : "";
  const chapter = context ? context.chapterIndex + 1 : 1;
  const mapped = !!CHAPTER_TIMELINE_MAP[book]?.[chapter];
  const preview = useMemo(() => selectContextTimeline(records, book, chapter, "chapter", "biblical"), [records, book, chapter]);
  return <AccordionItem value="timeline">
    <AccordionTrigger className={mapped ? "text-success" : undefined}><HistoryIcon />Timeline</AccordionTrigger>
    <AccordionContent className="flex flex-col gap-2 overflow-visible">
      {isOpen ? <>
        <p className="text-sm font-medium">{book ? `${book} ${chapter}` : "Explore biblical and world history"}</p>
        <p className="text-xs text-muted-foreground">{mapped ? "Biblical events, historical context, and familiar contemporaries." : `Reviewed context covers ${CONTEXT_TIMELINE_COVERAGE.chapters} chapters across ${CONTEXT_TIMELINE_COVERAGE.books.length} books. This passage shows the broader overview.`}</p>
        {mapped ? <ul className="flex flex-col gap-1 text-xs">{preview.records.filter(record => record.emphasized).slice(0, 3).map(record => <li key={record.id}>{record.label}<span className="block text-muted-foreground">{timelineDateSummary(record)}</span></li>)}</ul> : null}
        <Button variant="outline" size="sm" onClick={() => { if (!openVisualTool({ kind: "timeline", context })) setOpen(true); }}><HistoryIcon data-icon="inline-start" />Open timeline</Button>
      </> : null}
    </AccordionContent>
    {open ? <Suspense fallback={<p role="status" className="p-2 text-sm">Loading timeline…</p>}><TimelineDialog open={open} onOpenChange={setOpen} context={context} books={books} {...referenceProps} /></Suspense> : null}
  </AccordionItem>;
}
