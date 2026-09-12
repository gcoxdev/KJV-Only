import { timelineWindowKey, type TimelineWindow } from "@/lib/timeline-view-state";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import moment, { type MomentInput } from "moment";
import { Timeline } from "vis-timeline/peer";
import type { DataItem, TimelineOptions } from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MaximizeIcon, MinimizeIcon, ScanIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimelineYear, hasUnknownEnd, hasUnknownStart, timelineDate, timelinePlotBounds, type TimelineRecord } from "@/lib/bible-timeline";

function textNode(text: string, className?: string) {
  const element = document.createElement("span");
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export default function BibleTimelineChart({ savedWindow, onWindowChange, records, selectedId, onSelect, expanded, compact, onExpandedChange, tracks, chartLabel = "Genealogy timeline chart" }: {
  savedWindow?: TimelineWindow;
  onWindowChange?: (window: TimelineWindow) => void;
  records: (TimelineRecord & { track?: string; emphasized?: boolean })[];
  tracks?: Record<string, string>; chartLabel?: string; selectedId?: string; onSelect: (id: string) => void;
  expanded: boolean; onExpandedChange: (expanded: boolean) => void;
  compact: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const timeline = useRef<Timeline | null>(null);
  const fitSelection = useRef<(() => void) | null>(null);
  const [error, setError] = useState(false);
  const select = useEffectEvent(onSelect);
  const readSavedWindow = useEffectEvent(() => savedWindow);
  const saveWindow = useEffectEvent((window: TimelineWindow) => onWindowChange?.(window));
  const rememberWindow = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (!container.current) return;
    const plotted = records.filter(record => timelinePlotBounds(record));
    if (!plotted.length) return;
    const windowKey = timelineWindowKey(plotted);
    const remembered = readSavedWindow();
    const restored = remembered?.key === windowKey ? remembered : undefined;
    const groups = tracks ? Object.entries(tracks).filter(([id]) => plotted.some(record => record.track === id)).map(([id, content], order) => ({ id, content, order })) : plotted.map((record, order) => ({ id: record.id, content: record.label, order }));
    const bounds = plotted.map(record => timelinePlotBounds(record)!);
    const firstYear = Math.min(...bounds.map(([start]) => start));
    const lastYear = Math.max(...bounds.map(([, end]) => end));
    const padding = Math.max(3, Math.ceil((lastYear - firstYear) * 0.1));
    const yearStep = (start: Date, end: Date) => {
      const years = Math.max(1, (end.getTime() - start.getTime()) / (365.25 * 86400000));
      const labels = Math.max(2, ((container.current?.clientWidth ?? 400) - 120) / 90);
      return [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].find(step => step >= years / labels) ?? 20000;
    };
    const initialStart = timelineDate(firstYear - padding);
    const initialEnd = timelineDate(lastYear + padding);
    let axisStep = yearStep(initialStart, initialEnd);
    const labels = new Map<string, HTMLElement>();
    let disposed = false;
    const sizeLabels = () => {
      const width = container.current?.querySelector<HTMLElement>(".vis-panel.vis-center")?.clientWidth ?? 0;
      if (width > 0) container.current?.style.setProperty("--bible-time-label-width", `${Math.min(260, Math.max(40, (width - 40) * 0.45))}px`);
      return width;
    };
    const items: DataItem[] = plotted.map(record => {
      const [start, end] = timelinePlotBounds(record)!;
      return {
        id: record.id, group: tracks ? record.track : record.id, content: record.label,
        start: timelineDate(start), ...(end > start ? {
          end: timelineDate(end),
          // Keep labels and endpoints tied to dates while panning. The library's
          // auto alignment pins labels to the viewport, and limitSize clips bars.
          align: "left" as const, limitSize: false,
        } : {}),
        // Point items keep their marker in the row; boxes also create an axis dot.
        type: record.kind === "event" || record.placement ? "point" : end > start ? "range" : "box",
        className: ["bible-time-item", `bible-time-${record.kind}`,
          record.placement ? "bible-time-estimate" : "", record.emphasized ? "bible-time-emphasized" : "",
          !record.placement && hasUnknownStart(record) ? "bible-time-open-start" : "", !record.placement && hasUnknownEnd(record) ? "bible-time-open-end" : ""].filter(Boolean).join(" "),
      };
    });
    const options: TimelineOptions = {
      ...(restored ? { start: new Date(restored.start), end: new Date(restored.end) } : {}),
      height: "100%", stack: !!tracks, groupOrder: "order", groupHeightMode: tracks ? "auto" : "fixed",
      margin: { item: 10, axis: 12 }, orientation: "top", showCurrentTime: false,
      showMajorLabels: false,
      editable: false, selectable: true, multiselect: false, verticalScroll: true,
      timeAxis: { scale: "year", step: axisStep },
      zoomKey: "ctrlKey", zoomMin: 1000 * 60 * 60 * 24 * 365 * 5,
      zoomMax: Math.max(1000 * 60 * 60 * 24 * 366 * 6000, restored ? restored.end - restored.start + 1 : 0),
      moment: (date: MomentInput) => moment.utc(date),
      template: (item: DataItem) => {
        // vis compares template HTML and may retain the previous node.
        const label = labels.get(String(item.id)) ?? textNode(item.content, "bible-time-label");
        labels.set(String(item.id), label);
        return label;
      },
      groupTemplate: (group: { content: string } | null) => textNode(group?.content ?? ""),
      format: { minorLabels: date => formatTimelineYear(moment.utc(date).year()), majorLabels: () => "" },
      onInitialDrawComplete: () => { if (!disposed && !restored) fitSelection.current?.(); },
    };
    let instance: Timeline;
    try {
      instance = new Timeline(container.current, items, groups, options);
      timeline.current = instance;
      const publishWindow = (persist: boolean) => {
        const { start, end } = instance.getWindow();
        container.current?.setAttribute("data-window-start", String(start.getTime()));
        container.current?.setAttribute("data-window-end", String(end.getTime()));
        if (persist) saveWindow({ start: start.getTime(), end: end.getTime(), key: windowKey });
      };
      rememberWindow.current = () => publishWindow(true);
      publishWindow(false);
      fitSelection.current = () => {
        const width = sizeLabels();
        if (!width) return;
        instance.redraw();
        // Measure every row, including those currently scrolled out of view.
        // Native fit only counts a point's diamond, not its label.
        instance.getItemRange();
        const anchors = plotted.flatMap(record => {
          const [start, end] = timelinePlotBounds(record)!;
          const label = labels.get(record.id);
          const item = label?.closest<HTMLElement>(".vis-item");
          const content = label?.closest<HTMLElement>(".vis-item-content");
          const labelWidth = content?.offsetWidth ?? 0;
          const boxWidth = item?.offsetWidth ?? labelWidth;
          const isPoint = record.kind === "event" || !!record.placement;
          const isBox = !isPoint && start === end;
          return [{
            date: timelineDate(start).getTime(),
            left: isBox ? boxWidth / 2 : isPoint ? 6 : 0,
            right: isBox ? boxWidth / 2 : isPoint ? boxWidth : labelWidth + 2,
          }, ...(end > start ? [{ date: timelineDate(end).getTime(), left: 0, right: 0 }] : [])];
        });
        // Find a scale at which every pair of date anchors and their text fits.
        // Pixel padding changes the view only, never the underlying event dates.
        const margin = 12;
        let scale = 1000 * 60 * 60 * 24 * 365 * 5 / width;
        for (const left of anchors) for (const right of anchors) {
          const available = width - left.left - right.right - margin * 2;
          if (available > 0) scale = Math.max(scale, (right.date - left.date) / available);
        }
        const start = Math.min(...anchors.map(anchor => anchor.date - (anchor.left + margin) * scale));
        const interval = Math.ceil(width * scale);
        instance.setOptions({ zoomMax: Math.max(1000 * 60 * 60 * 24 * 366 * 6000, interval + 1) });
        instance.setWindow(new Date(Math.floor(start)), new Date(Math.ceil(start + interval)), { animation: false });
      };
      // vis owns this scrolling panel. Give keyboard users native scrolling too.
      const rows = container.current.querySelector<HTMLElement>(".vis-left");
      if (rows) {
        rows.tabIndex = 0;
        rows.setAttribute("role", "region");
        rows.setAttribute("aria-label", "Timeline rows");
      }
      instance.on("rangechanged", ({ start, end, byUser }: { start: Date; end: Date; byUser?: boolean }) => {
        publishWindow(!!byUser);
        const nextStep = yearStep(start, end);
        if (nextStep !== axisStep) {
          axisStep = nextStep;
          instance.setOptions({ timeAxis: { scale: "year", step: axisStep } });
        }
      });
      instance.on("select", ({ items: ids }: { items: (string | number)[] }) => {
        if (ids[0] !== undefined) select(String(ids[0]));
      });
    } catch {
      queueMicrotask(() => setError(true));
      return;
    }
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        sizeLabels();
        instance.redraw();
        const { start, end } = instance.getWindow();
        const nextStep = yearStep(start, end);
        if (nextStep !== axisStep) {
          axisStep = nextStep;
          instance.setOptions({ timeAxis: { scale: "year", step: axisStep } });
        }
      });
    });
    observer.observe(container.current);
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(resizeFrame); instance.destroy(); timeline.current = null; fitSelection.current = null; rememberWindow.current = null; };
  }, [records, tracks]);
  useEffect(() => { timeline.current?.setSelection(selectedId ? [selectedId] : []); }, [selectedId, records]);
  const hasDates = records.some(record => timelinePlotBounds(record));
  const emptyContext = !!tracks && !hasDates;
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", expanded && "min-h-0 flex-1")}>
      <div className={cn("flex shrink-0 flex-wrap items-center gap-2", compact && "pr-10", emptyContext && !expanded && "hidden")} role="group" aria-label="Timeline navigation">
        {[
          { label: "Zoom in", icon: ZoomInIcon, action: () => timeline.current?.zoomIn(0.4, { animation: false }) },
          { label: "Zoom out", icon: ZoomOutIcon, action: () => timeline.current?.zoomOut(0.4, { animation: false }) },
          { label: "Fit selection", icon: ScanIcon, action: () => fitSelection.current?.() },
        ].map(({ label, icon: Icon, action }) => <Tooltip key={label}>
          <TooltipTrigger render={<Button size={compact ? "icon" : "sm"} variant="outline" aria-label={label} disabled={emptyContext} onClick={() => { action(); rememberWindow.current?.(); }} />}>
            {compact ? <Icon /> : label}
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>)}
        <Button size="sm" variant="outline" aria-expanded={expanded} onClick={() => onExpandedChange(!expanded)}>
          {expanded ? <MinimizeIcon data-icon="inline-start" /> : <MaximizeIcon data-icon="inline-start" />}{expanded ? "Collapse chart" : "Expand chart"}
        </Button>
        {!expanded && !emptyContext ? <span className="text-xs text-muted-foreground">Drag to pan · Ctrl + scroll or pinch to zoom</span> : null}
      </div>
      {error ? <p role="alert">The chart could not load. Use the timeline list below.</p> : null}
      {!hasDates ? <p className="text-sm text-muted-foreground">No supported calendar placements in this selection. {expanded ? "Collapse the chart to see the undated entries." : "Entries and evidence remain in the list below."}</p> : null}
      <div ref={container} className={cn("bible-timeline min-w-0 overflow-hidden rounded-lg border", expanded ? "min-h-0 flex-1" : "h-80", !hasDates && "hidden")} role="region" aria-label={chartLabel} />
      <div className={cn("flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground", (compact || emptyContext) && "hidden")} aria-label="Timeline legend">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-point" />Single date</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key" />Span of time</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-window" />Uncertain event date (not duration)</span>
        {records.some(record => record.placement) ? <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-estimate" />Estimated placement (not lifespan)</span> : null}
        <span>Broken ends: birth/death unknown · All calendar dates approximate</span>
      </div>
    </div>
  );
}
