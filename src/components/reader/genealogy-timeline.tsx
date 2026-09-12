import { TimelineRelatedTools } from "@/components/reader/timeline-related-tools";
import { timelineRelatedTools } from "@/data/timeline-related-tools";
import { isTimelineEncyclopedia } from "@/lib/timeline-sources";
import type { TimelineViewState } from "@/lib/timeline-view-state";
import { lazy, Suspense, useCallback, useMemo, useState, type ReactNode } from "react";
import { TIMELINE_METHOD, TIMELINE_SOURCES, type SojournModel } from "@/data/bible-timeline";
import { TIMELINE_ERAS, buildLineageTimeline, jesusLineage, timelineEntryCategory, timelineDateSummary, timelineKindLabel, timelinePlotBounds, type JesusLineageBranch, type TimelineContent, type TimelineEra, type TimelineRecord } from "@/lib/bible-timeline";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { GenealogyPerson } from "@/types/reader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ToolReferenceList } from "@/components/reader/tool-reference-list";

const TimelineChart = lazy(() => import("./bible-timeline-chart"));

export default function GenealogyTimeline({ onNavigateAway, viewState, onViewStateChange: patchView, person, genealogyById, onSelectPerson, onOpenReference, renderReferencePreview, onCloseSidebar, expanded, onExpandedChange, records, model, onModelChange }: {
  onNavigateAway?: () => void;
  viewState: TimelineViewState;
  onViewStateChange: (patch: Partial<TimelineViewState>) => void;
  records: TimelineRecord[];
  model: SojournModel;
  onModelChange: (model: SojournModel) => void;
  person: GenealogyPerson | null;
  genealogyById: Map<string, GenealogyPerson>;
  onSelectPerson: (id: string) => void;
  onOpenReference: (ref: string) => void;
  renderReferencePreview: (ref: string, word: string) => ReactNode;
  onCloseSidebar: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const compact = expanded && isMobile;
  const { scope, content, branch, display, query, selectedId } = viewState;
  const era = viewState.era as TimelineEra | "all";
  const setEra = (era: TimelineEra | "all") => patchView({ era });
  const setScope = (scope: string) => patchView({ scope });
  const setContent = (content: TimelineContent) => patchView({ content });
  const setBranch = (branch: JesusLineageBranch) => patchView({ branch });
  const setDisplay = (display: string) => patchView({ display: display === "list" ? "list" : "chart" });
  const setQuery = (query: string) => patchView({ query });
  const [methodOpen, setMethodOpen] = useState(false);
  const lineage = useMemo(() => jesusLineage(genealogyById, branch, person?.id), [genealogyById, branch, person?.id]);
  const family = useMemo(() => {
    const result = new Map<string, { person: GenealogyPerson; relation: string }>();
    if (!person) return result;
    result.set(person.id, { person, relation: "Selected person" });
    const include = (id: string | undefined, relation: string) => {
      const relative = id ? genealogyById.get(id) : undefined;
      if (relative && !result.has(relative.id)) result.set(relative.id, { person: relative, relation });
    };
    include(person.father?.id, "Father"); include(person.mother?.id, "Mother");
    person.spouses?.forEach(relative => include(relative.id, "Spouse"));
    person.siblings?.forEach(relative => include(relative.id, "Sibling"));
    person.children?.forEach(relative => include(relative.id, "Child"));
    return result;
  }, [person, genealogyById]);
  const relatedPeople = useMemo(() => scope === "lineage" ?
    new Map(lineage.members.map((relative, index) => [relative.id, { person: relative, relation: index === 0 ? "Jesus" : `${branch === "mary" ? "Mary's" : "Joseph's"} line` }])) : family,
  [scope, lineage, branch, family]);
  const available = useMemo(() => {
    if (scope === "overview") return records;
    if (scope === "lineage") return buildLineageTimeline(lineage.members, records);
    const matching = records.filter(record => record.personIds?.some(id => relatedPeople.has(id)));
    const represented = new Set(matching.flatMap(record => record.personIds ?? []));
    for (const { person: relative } of relatedPeople.values()) {
      if (!represented.has(relative.id)) matching.push({
        id: `undated-${relative.id}`, label: relative.names[0], personIds: [relative.id], kind: "life", era: "beginnings",
        references: relative.verses?.first ? [relative.verses.first] : [], sources: [],
        note: "This person has no reviewed timeline dates. The reference identifies the person; it does not supply a lifespan or calendar position.",
      });
    }
    return matching;
  }, [records, scope, relatedPeople, lineage]);
  const visible = useMemo(() => available.filter(record =>
    (scope !== "overview" || era === "all" || record.era === era) &&
    (content === "all" || timelineEntryCategory(record) === content) &&
    `${record.label} ${record.references.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()),
  ).sort((a, b) => scope === "lineage" ? 0 : (timelinePlotBounds(a)?.[0] ?? Infinity) - (timelinePlotBounds(b)?.[0] ?? Infinity)), [available, era, scope, content, query]);
  const selected = visible.find(record => record.id === selectedId) ?? visible.find(record => record.personIds?.includes(person?.id ?? "")) ?? visible[0];
  const evidenceReferences = selected ? [...new Set([...selected.references, ...timelineRelatedTools(selected).map(link => link.reference).filter(Boolean)])] : [];
  const select = useCallback((selectedId: string) => patchView({ selectedId }), [patchView]);
  const refs = (references: string[], word = "") => <ToolReferenceList references={references} highlightWord={word}
    renderPreview={renderReferencePreview} onOpenReference={onOpenReference} onCloseSidebar={onCloseSidebar} />;
  const relation = (record: TimelineRecord) => record.personIds?.map(id => relatedPeople.get(id)?.relation).filter(Boolean).join(" / ");
  const treeTarget = selected?.personIds?.find(id => id === person?.id) ?? selected?.personIds?.find(id => genealogyById.has(id));
  return (
    <section aria-label="Adam to Jesus timeline" className={cn("flex min-w-0 flex-col gap-3 p-3 sm:p-4", expanded && "h-full min-h-0 gap-2 overflow-hidden p-2 sm:p-2")}>
      {!expanded ? <p className="text-sm text-muted-foreground">Adam to Jesus · KJV ages and passages, with a provisional historical calendar. Select a person or event to see the evidence.</p> : null}
      <div className={cn("flex shrink-0 flex-wrap items-center gap-2", expanded && "pr-10", compact && "hidden")}>
        <ToggleGroup value={[scope]} onValueChange={values => { if (values[0]) { setScope(values[0]); if (values[0] === "lineage") setContent("people"); } }} variant="outline" size="sm" aria-label="Timeline scope">
          <ToggleGroupItem value="overview">Overview</ToggleGroupItem><ToggleGroupItem value="family" disabled={!person}>Family</ToggleGroupItem>
          <ToggleGroupItem value="lineage" disabled={!lineage.members.length}>Jesus' lineage</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup value={[content]} onValueChange={values => { if (values[0]) setContent(values[0] as TimelineContent); }} variant="outline" size="sm" aria-label="Timeline content">
          <ToggleGroupItem value="all">All</ToggleGroupItem><ToggleGroupItem value="people">People</ToggleGroupItem><ToggleGroupItem value="events">Events</ToggleGroupItem>
        </ToggleGroup>
        {scope === "lineage" ? <Select value={branch} onValueChange={value => { if (value === "mary" || value === "joseph") setBranch(value); }}>
          <SelectTrigger aria-label="Jesus lineage branch"><SelectValue>{branch === "mary" ? "Mary (Luke interpretation)" : "Joseph"}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup><SelectItem value="joseph">Joseph</SelectItem><SelectItem value="mary">Mary (Luke interpretation)</SelectItem></SelectGroup></SelectContent>
        </Select> : <Select value={era} onValueChange={value => { if (value) setEra(value as TimelineEra | "all"); }} disabled={scope === "family"}>
          <SelectTrigger className="min-w-40" aria-label="Timeline period"><SelectValue>{era === "all" ? "All periods" : TIMELINE_ERAS[era]}</SelectValue></SelectTrigger>
          <SelectContent><SelectGroup><SelectItem value="all">All periods</SelectItem>
            {Object.entries(TIMELINE_ERAS).filter(([id]) => records.some(record => record.era === id)).map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>}
        <ToggleGroup className={expanded ? "hidden" : undefined} value={[display]} onValueChange={values => { if (values[0]) setDisplay(values[0]); }} variant="outline" size="sm" aria-label="Timeline display">
          <ToggleGroupItem value="chart">Chart</ToggleGroupItem><ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>
        <Input aria-label="Filter timeline" placeholder="Find a person or event…" value={query} onChange={event => setQuery(event.target.value)} className="min-w-36 flex-1" />
      </div>
      {scope === "lineage" && !expanded ? <div className="rounded-lg border p-3 text-xs text-muted-foreground" role="note" aria-label="Lineage sources">
        <p>Every ancestor appears in lineage order, including generations beyond Matthew's shorter list. Hollow circles mark estimated placements between dated anchors; select one for the calculation. These estimates are not known birth years or lifespans. Mary's connection to Heli is an interpretation of Luke's genealogy; Luke 3:23 names Joseph.</p>
        {refs(branch === "mary" ? ["LUK.3.23", "LUK.3.31", "LUK.3.38"] : ["MAT.1.6", "MAT.1.12", "MAT.1.16", "1CH.3.19"])}
        {!lineage.complete ? <p>This branch stops where a parent link is missing or repeats.</p> : null}
      </div> : null}
      <Accordion className={cn("rounded-lg border bg-muted/20", expanded && "hidden")} value={methodOpen ? ["method"] : []} onValueChange={values => setMethodOpen(values.includes("method"))}>
        <AccordionItem value="method">
          <AccordionTrigger className="px-3"><span>Sources &amp; method <span className="block text-xs font-normal text-muted-foreground">Provisional chronology · {methodOpen ? "Hide explanation" : "Show explanation"}</span></span></AccordionTrigger>
          <AccordionContent className="border-t px-3 pb-3 pt-3">
            <div className="flex max-h-[min(40dvh,24rem)] flex-col gap-3 overflow-y-auto overscroll-contain" role="region" aria-label="Chronology sources and method" tabIndex={0}>
            <div className="flex flex-wrap items-center gap-2 text-sm">Sojourn interpretation
              <Select value={model} onValueChange={value => { if (value === "egypt430" || value === "promise430") onModelChange(value); }}>
                <SelectTrigger aria-label="Sojourn interpretation"><SelectValue>{model === "egypt430" ? "430 years in Egypt" : "430 years from the promise"}</SelectValue></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value="egypt430">430 years in Egypt</SelectItem><SelectItem value="promise430">430 years from the promise</SelectItem></SelectGroup></SelectContent>
              </Select>
            </div>
            {TIMELINE_METHOD.map(method => <div key={method.title} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">{method.title}</h3><p className="text-sm text-muted-foreground">{method.text}</p>{refs(method.references)}
            </div>)}
            <h3 className="text-sm font-semibold">External calendar and historical sources</h3>
            {Object.entries(TIMELINE_SOURCES).filter(([, source]) => !isTimelineEncyclopedia(source)).map(([id, source]) => <p key={id} className="text-sm"><a className="underline underline-offset-4" href={source.url} target="_blank" rel="noreferrer">{source.title}</a><span className="block text-muted-foreground">{source.use}</span></p>)}
            <p className="text-xs text-muted-foreground">Additional calendar source details are listed on the Credits page.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {display === "chart" ? <Suspense fallback={<p role="status">Loading timeline chart…</p>}>
        <TimelineChart savedWindow={viewState.window} onWindowChange={window => patchView({ window })} records={visible} selectedId={selected?.id} onSelect={select} expanded={expanded} compact={compact} onExpandedChange={onExpandedChange} />
      </Suspense> : null}
      {expanded && selected ? <p className="shrink-0 text-xs" aria-live="polite">{selected.label} · {selected.placement ? "" : `${timelineKindLabel(selected)} · `}{timelineDateSummary(selected)}</p> : null}
      <div className={expanded ? "hidden" : "contents"}>
      <p role="status" className="text-xs text-muted-foreground">{visible.length} entries · {visible.filter(record => !timelinePlotBounds(record)).length} with no calendar placement{scope === "family" ? ` · Family of ${person?.names[0]}` : scope === "lineage" ? ` · Jesus' lineage through ${branch === "mary" ? "Mary" : "Joseph"}` : ""}</p>
      {selected ? <article aria-label="Timeline evidence" className="flex min-w-0 flex-col gap-2 rounded-lg border p-3">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold">{selected.label}</h3><Badge variant="outline">{timelineKindLabel(selected)}</Badge></div>
        <p className="text-sm">{timelineDateSummary(selected)}</p>
        {selected.adamYear !== undefined ? <p className="text-sm">Birth: year {selected.adamYear} from Adam in the continuous Genesis calculation.</p> : null}
        <p className="text-sm text-muted-foreground">{selected.note}</p>
        {selected.placement ? <div className="flex flex-col gap-2 text-sm" role="note" aria-label="Placement calculation">
          <h4 className="font-semibold">How this placement was estimated</h4>
          <p>{selected.placement.explanation}</p>
          <p className="text-muted-foreground">The references below support the ancestry and anchor dates. The calculated position is an estimate made by this app; birth and death remain unknown.</p>
        </div> : null}
        {selected.kind === "activity" ? <p className="text-sm">Birth and death dates unknown; this bar does not show a complete lifespan.</p> : null}
        {relation(selected) ? <p className="text-sm">Family relationship: {relation(selected)}</p> : null}
        <TimelineRelatedTools key={selected.id} record={selected} includePeople={!treeTarget} onNavigate={onNavigateAway} />
        {treeTarget ? <Button size="sm" variant="outline" className="self-start" onClick={() => onSelectPerson(treeTarget)}>View {genealogyById.get(treeTarget)?.names[0]} in tree</Button> : null}
        {evidenceReferences.length ? <><h4 className="text-sm font-semibold">KJV passages</h4>{refs(evidenceReferences, selected.label)}</> : <p className="text-sm text-muted-foreground">Historical context; no KJV passage dates this entry.</p>}
        {selected.sources.some(id => !isTimelineEncyclopedia(TIMELINE_SOURCES[id])) ? <div className="flex flex-col gap-1 text-sm"><h4 className="font-semibold">Calendar sources</h4>{selected.sources.filter(id => !isTimelineEncyclopedia(TIMELINE_SOURCES[id])).map(id => <a key={id} className="underline underline-offset-4" href={TIMELINE_SOURCES[id].url} target="_blank" rel="noreferrer">{TIMELINE_SOURCES[id].title}</a>)}</div> : null}
        {selected.sources.some(id => isTimelineEncyclopedia(TIMELINE_SOURCES[id])) ? <p className="text-xs text-muted-foreground">Additional calendar source details are listed on the Credits page.</p> : null}
      </article> : <p>No entries match. Change the people/events filter, clear the search, or choose another scope or period.</p>}
      <div className="flex max-h-80 flex-col gap-1 overflow-y-auto overscroll-contain" role="group" aria-label="Timeline entries">
        {visible.map(record => <Button key={record.id} variant={selected?.id === record.id ? "secondary" : "ghost"} className="h-auto w-full justify-start whitespace-normal py-2 text-left" aria-pressed={selected?.id === record.id} onClick={() => select(record.id)}>
          <span className="flex min-w-0 flex-col gap-1"><span>{record.label}{scope !== "overview" && relation(record) ? ` · ${relation(record)}` : ""}</span><span className="text-xs text-muted-foreground">{timelineDateSummary(record)}</span></span>
        </Button>)}
      </div>
      </div>
    </section>
  );
}
