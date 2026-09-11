import { lazy, Suspense, useMemo, useState } from "react";
import { PinIcon, PinOffIcon, XIcon } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ToolReferenceList } from "@/components/reader/tool-reference-list";
import type { TimelineToolProps } from "./study-tools/timeline-tool";
import { buildContextTimeline, CONTEXT_TIMELINE_COVERAGE, CONTEXT_TIMELINE_SOURCES, selectContextTimeline, type TimelineFilter, type TimelineScope } from "@/data/contextual-timeline";
import { TIMELINE_COLLECTIONS, TIMELINE_PHASES } from "@/data/contextual-timeline-nt";
import { TIMELINE_METHOD } from "@/data/bible-timeline";
import { timelineDateSummary, timelineKindLabel } from "@/lib/bible-timeline";
import { useTimelineModel } from "@/hooks/use-timeline-model";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const TimelineChart = lazy(() => import("./bible-timeline-chart"));
const TRACKS = { biblical: "Biblical events", historical: "Historical context" };

export default function ContextualTimelineDialog({ open, onOpenChange, context, books, renderPreview, onOpenReference, onCloseSidebar }: Omit<TimelineToolProps, "isOpen"> & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [pinned, setPinned] = useState<typeof context>(null);
  const current = pinned ?? context;
  const bookIndex = current?.bookIndex ?? 0;
  const chapterIndex = current?.chapterIndex ?? 0;
  const book = books[bookIndex];
  const [scope, setScope] = useState<TimelineScope>(context ? "chapter" : "world");
  const [phase, setPhase] = useState("all");
  const collection = scope === "gospels" || scope === "paul" ? scope : undefined;
  const [filter, setFilter] = useState<TimelineFilter>("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>();
  const [model, setModel] = useTimelineModel();
  const compact = useIsMobile() && expanded;
  const allRecords = useMemo(() => buildContextTimeline(model), [model]);
  const selection = useMemo(() => selectContextTimeline(allRecords, book?.name ?? "", chapterIndex + 1, scope, filter, query, phase), [allRecords, book?.name, chapterIndex, scope, filter, query, phase]);
  const selected = selection.records.find(record => record.id === selectedId) ?? selection.records.find(record => record.emphasized) ?? selection.records[0];
  const openReference = (ref: string) => { onOpenChange(false); onOpenReference(ref); };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className={cn("flex max-h-[94dvh] w-[96vw] max-w-[96vw] flex-col gap-3 overflow-hidden p-3 sm:max-w-6xl", expanded && "h-[96dvh] max-h-[96dvh] gap-2 p-2")}>
      <div className={cn("shrink-0 pr-10", compact && "sr-only")}>
        <DialogTitle>Historical timeline{collection ? ` · ${TIMELINE_COLLECTIONS[collection]}` : current && book ? ` · ${book.name} ${chapterIndex + 1}` : ""}</DialogTitle>
        <DialogDescription className="mt-1">Biblical events and world history · KJV first · provisional calendar dates</DialogDescription>
      </div>
      <Tooltip><TooltipTrigger render={<DialogClose render={<Button variant="outline" size="icon-sm" className="absolute top-2 right-2 z-10 rounded-full" aria-label="Close timeline" />} />}><XIcon /></TooltipTrigger><TooltipContent>Close timeline</TooltipContent></Tooltip>
      <div className={cn("flex min-h-0 flex-col gap-3 overflow-y-auto", expanded && "flex-1 overflow-hidden gap-2")}>
        <div className={cn("flex shrink-0 flex-col gap-2", compact && "hidden")}>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(bookIndex)} onValueChange={value => { if (value !== null) { setPinned({ bookIndex: Number(value), chapterIndex: 0 }); setScope("chapter"); } }}>
              <SelectTrigger aria-label="Timeline book" className="min-w-36"><SelectValue>{book?.name ?? "Select book"}</SelectValue></SelectTrigger>
              <SelectContent className="w-max min-w-56 max-w-[calc(100vw-2rem)]"><SelectGroup>{books.map((item, index) => <SelectItem key={item.name} value={String(index)}><span className="whitespace-nowrap">{item.name}</span></SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Select value={String(chapterIndex)} onValueChange={value => { if (value !== null) { setPinned({ bookIndex, chapterIndex: Number(value) }); setScope("chapter"); } }}>
              <SelectTrigger aria-label="Timeline chapter"><SelectValue>Chapter {chapterIndex + 1}</SelectValue></SelectTrigger>
              <SelectContent><SelectGroup>{book?.chapters.map((item, index) => <SelectItem key={item.chapter} value={String(index)}>Chapter {item.chapter}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <Button size="sm" variant={pinned ? "secondary" : "outline"} disabled={!current} aria-pressed={!!pinned} onClick={() => setPinned(pinned ? null : current)}>{pinned ? <PinOffIcon data-icon="inline-start" /> : <PinIcon data-icon="inline-start" />}{pinned ? "Follow reader" : "Pin chapter"}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scope} onValueChange={value => { if (value !== null) { setScope(value as TimelineScope); setPhase("all"); } }}>
              <SelectTrigger aria-label="Timeline collection"><SelectValue>{TIMELINE_COLLECTIONS[scope]}</SelectValue></SelectTrigger>
              <SelectContent className="w-max min-w-48"><SelectGroup>{Object.entries(TIMELINE_COLLECTIONS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            {collection ? <Select value={phase} onValueChange={value => { if (value !== null) setPhase(value); }}>
              <SelectTrigger aria-label="Timeline stage" className="max-w-full"><SelectValue>{phase === "all" ? "All stages" : phase}</SelectValue></SelectTrigger>
              <SelectContent className="w-max min-w-56 max-w-[calc(100vw-2rem)]"><SelectGroup><SelectItem value="all">All stages</SelectItem>{TIMELINE_PHASES[collection].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectGroup></SelectContent>
            </Select> : null}
            <ToggleGroup value={[filter]} variant="outline" size="sm" aria-label="Historical timeline content" onValueChange={values => { if (values[0]) setFilter(values[0] as TimelineFilter); }}>
              <ToggleGroupItem value="all">All</ToggleGroupItem><ToggleGroupItem value="biblical">Biblical</ToggleGroupItem><ToggleGroupItem value="historical">Historical context</ToggleGroupItem>
            </ToggleGroup>
            <Input className="min-w-36 flex-1" aria-label="Find timeline entries" placeholder="Find a person or event…" value={query} onChange={event => setQuery(event.target.value)} />
          </div>
          {!expanded ? <>
            <p className="text-xs text-muted-foreground" role="status">{selection.note}</p>
            <Accordion className="rounded-lg border px-3"><AccordionItem value="method"><AccordionTrigger>Sources &amp; method · provisional chronology</AccordionTrigger><AccordionContent className="flex flex-col gap-3">
              <p>Biblical means narrated in Scripture; external evidence may support its calendar placement. Bold entries relate to the selected passage. Historical contemporaries do not imply a meeting or influence. Reigns and lifespans are labeled separately. Undated entries remain in the list. Gospel harmony compares clear parallels and keeps disputed matches separate. Paul’s route follows Acts; letter-based travel and unfulfilled plans remain unplaced. Collection lists follow a reading sequence, while the chart shows only supported calendar windows.</p>
              <Select value={model} onValueChange={value => { if (value === "egypt430" || value === "promise430") setModel(value); }}>
                <SelectTrigger aria-label="Historical chronology model"><SelectValue>{model === "egypt430" ? "430 years in Egypt" : "430 years from the promise"}</SelectValue></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value="egypt430">430 years in Egypt</SelectItem><SelectItem value="promise430">430 years from the promise</SelectItem></SelectGroup></SelectContent>
              </Select>
              <p>This setting is shared with the genealogy timeline. Reviewed context covers {CONTEXT_TIMELINE_COVERAGE.chapters} chapters across {CONTEXT_TIMELINE_COVERAGE.books.length} books: {CONTEXT_TIMELINE_COVERAGE.books.join(", ")}. Book view includes only reviewed episodes.</p>
              {TIMELINE_METHOD.slice(0, 7).map(method => <div key={method.title}><h4 className="font-semibold">{method.title}</h4><p>{method.text}</p><ToolReferenceList references={method.references} highlightWord="" renderPreview={renderPreview} onOpenReference={openReference} onCloseSidebar={onCloseSidebar} /></div>)}
            </AccordionContent></AccordionItem></Accordion>
          </> : null}
        </div>
        <Suspense fallback={<p role="status">Loading chart…</p>}><TimelineChart records={selection.records} tracks={TRACKS} chartLabel="Historical timeline chart" selectedId={selected?.id} onSelect={setSelectedId} expanded={expanded} compact={compact} onExpandedChange={setExpanded} /></Suspense>
        {!expanded ? <div className="grid gap-3 sm:grid-cols-2">
          <div role="group" aria-label="Historical timeline entries" className="flex max-h-72 flex-col gap-1 overflow-y-auto rounded-lg border p-1">
            {selection.records.length ? selection.records.map(record => <Button key={record.id} variant={record.id === selected?.id ? "secondary" : "ghost"} aria-pressed={record.id === selected?.id} className="h-auto justify-start whitespace-normal p-2 text-left" onClick={() => setSelectedId(record.id)}><span className="flex flex-col gap-1"><span className={record.emphasized ? "font-semibold" : ""}>{record.label}{record.emphasized ? (collection ? "" : " · Passage context") : ""}</span><span className="text-xs text-muted-foreground">{record.narrative?.phase ?? TRACKS[record.track]} · {timelineDateSummary(record)}</span></span></Button>) : <p className="p-2 text-sm">No entries match this view. Clear the search, change the filter, or choose Wider history.</p>}
          </div>
          {selected ? <article aria-label="Historical timeline evidence" className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-lg border p-3 text-sm">
            <h3 className="font-semibold">{selected.label}</h3>
            <div className="flex flex-wrap gap-1"><Badge variant="secondary">{TRACKS[selected.track]}</Badge><Badge variant="outline">{timelineKindLabel(selected)}</Badge></div>
            {selected.narrative ? <Badge variant="outline" className="self-start">{selected.narrative.phase}</Badge> : null}
            <p>{timelineDateSummary(selected)}</p><p>{selected.note}</p><p className="text-muted-foreground">{selected.relevance}</p>
            {selected.narrative ? <div className="flex flex-col gap-2" aria-label="Narrative passages">
              <h4 className="font-semibold">{selected.narrative.collection === "gospels" ? "Gospel accounts & related passages" : "Narrative passages"}</h4>
              <p className="text-xs text-muted-foreground">Open a passage at its first verse. Grouped sections can contain successive events or related teachings.</p>
              <div className="flex flex-wrap gap-1">{selected.narrative.passages.map(passage => <Button key={passage.label} variant="outline" size="sm" className="h-auto whitespace-normal py-1 text-left" onClick={() => openReference(passage.reference)}>{passage.label}</Button>)}</div>
            </div> : null}
            {selected.references.length ? <><h4 className="font-semibold">KJV passages</h4><ToolReferenceList references={selected.references} highlightWord="" renderPreview={renderPreview} onOpenReference={openReference} onCloseSidebar={onCloseSidebar} /></> : <p className="text-muted-foreground">Historical comparison; no KJV passage dates this person or event.</p>}
            {selected.sources.map(id => { const source = CONTEXT_TIMELINE_SOURCES[id]; return <div key={id}><a href={source.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{source.title}</a><p className="text-xs text-muted-foreground">{source.use}</p></div>; })}
          </article> : null}
        </div> : null}
      </div>
    </DialogContent>
  </Dialog>;
}
