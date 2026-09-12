import { useEffect, useRef, useState } from "react";
import { MapIcon, NetworkIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { timelineRelatedTools, timelineToolKey, type TimelineRelatedTool } from "@/data/timeline-related-tools";
import { useVisualToolNavigate } from "@/hooks/use-visual-tool-target";
import type { TimelineRecord } from "@/lib/bible-timeline";

export function TimelineRelatedTools({ record, onNavigate, includePeople = true }: { record: TimelineRecord; onNavigate?: () => void; includePeople?: boolean }) {
  const navigate = useVisualToolNavigate();
  const links = timelineRelatedTools(record, includePeople);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  if (!navigate) return null;
  if (!links.length) return <p className="text-xs text-muted-foreground">No person or place links are available for this entry.</p>;
  const open = async (link: TimelineRelatedTool) => {
    setBusy(timelineToolKey(link));
    setError(null);
    try {
      await navigate(link.request, () => {
        if (!active.current) return false;
        onNavigate?.();
        return true;
      });
    } catch (error) {
      if (active.current) setError(error instanceof Error ? error.message : "Could not open this tool. Try again.");
    } finally {
      if (active.current) setBusy(null);
    }
  };
  const groups = [
    { id: undefined, title: "Event connections", links: links.filter(link => !link.association) },
    { id: "context", title: "Book and heading connections", links: links.filter(link => link.association === "context") },
    { id: "historical", title: "Historical geography", links: links.filter(link => link.association === "historical") },
    { id: "passage", title: "People and places in KJV passages", links: links.filter(link => link.association === "passage") },
  ];
  return <div className="flex flex-col gap-3" role="group" aria-label="Related people and places">
    {groups.filter(group => group.links.length).map(group => <div key={group.id ?? "event"} className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{group.title}</h4>
      {group.id === "passage" ? <p className="text-xs text-muted-foreground">These passages can mention background, recalled events or prophecies as well as the current event.</p> : null}
      <div className="flex flex-wrap items-start gap-2">{(group.id === "passage" && !showAll ? group.links.slice(0, 6) : group.links).map(link => {
        const Icon = link.request.kind === "maps" ? MapIcon : NetworkIcon;
        const key = timelineToolKey(link);
        return <div key={key} className="flex max-w-full flex-col gap-1">
          <Button variant="outline" size="sm" className="h-auto whitespace-normal py-1 text-left"
            disabled={busy !== null} title={link.referenceLabel ?? (link.reference ? `KJV connection: ${link.reference}` : undefined)} onClick={() => void open(link)}>
            {busy === key ? <LoaderCircleIcon data-icon="inline-start" className="animate-spin" /> : <Icon data-icon="inline-start" />}
            {link.request.kind === "maps" ? "Map" : "Genealogy"}: {link.label}
          </Button>
          {link.association ? <span className="text-xs text-muted-foreground">{link.referenceLabel ?? link.reference}</span> : null}
          {link.evidence ? <p className="text-xs text-muted-foreground">{link.evidence}</p> : null}
        </div>;
      })}</div>
      {group.id === "passage" && group.links.length > 6 ? <Button size="sm" variant="ghost" className="self-start" aria-expanded={showAll} onClick={() => setShowAll(value => !value)}>{showAll ? "Show fewer connections" : `Show all ${group.links.length} passage connections`}</Button> : null}
    </div>)}
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
  </div>;
}
