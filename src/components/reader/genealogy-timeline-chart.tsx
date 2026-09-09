import { useEffect, useEffectEvent, useRef, useState } from "react";
import moment, { type MomentInput } from "moment";
import { Timeline } from "vis-timeline/peer";
import type { DataItem, TimelineOptions } from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { Button } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimelineYear, hasUnknownEnd, hasUnknownStart, timelineDate, timelinePlotBounds, type TimelineRecord } from "@/lib/bible-timeline";

function textNode(text: string, className?: string) {
  const element = document.createElement("span");
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export default function GenealogyTimelineChart({ records, selectedId, onSelect, expanded, onExpandedChange, onClose }: {
  records: TimelineRecord[]; selectedId?: string; onSelect: (id: string) => void;
  expanded: boolean; onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const timeline = useRef<Timeline | null>(null);
  const fitSelection = useRef<(() => void) | null>(null);
  const [error, setError] = useState(false);
  const select = useEffectEvent(onSelect);
  useEffect(() => {
    if (!container.current) return;
    const plotted = records.filter(record => timelinePlotBounds(record));
    if (!plotted.length) return;
    const groups = plotted.map((record, order) => ({ id: record.id, content: record.label, order }));
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
        id: record.id, group: record.id, content: record.label,
        start: timelineDate(start), ...(end > start ? {
          end: timelineDate(end),
          // Keep labels and endpoints tied to dates while panning. The library's
          // auto alignment pins labels to the viewport, and limitSize clips bars.
          align: "left" as const, limitSize: false,
        } : {}),
        // Point items keep their marker in the row; boxes also create an axis dot.
        type: record.kind === "event" || record.placement ? "point" : end > start ? "range" : "box",
        className: ["bible-time-item", `bible-time-${record.kind}`,
          record.placement ? "bible-time-estimate" : "",
          !record.placement && hasUnknownStart(record) ? "bible-time-open-start" : "", !record.placement && hasUnknownEnd(record) ? "bible-time-open-end" : ""].filter(Boolean).join(" "),
      };
    });
    const options: TimelineOptions = {
      height: "100%", stack: false, groupOrder: "order", groupHeightMode: "fixed",
      margin: { item: 10, axis: 12 }, orientation: "top", showCurrentTime: false,
      showMajorLabels: false,
      editable: false, selectable: true, multiselect: false, verticalScroll: true,
      timeAxis: { scale: "year", step: axisStep },
      zoomKey: "ctrlKey", zoomMin: 1000 * 60 * 60 * 24 * 365 * 5,
      zoomMax: 1000 * 60 * 60 * 24 * 366 * 6000,
      moment: (date: MomentInput) => moment.utc(date),
      template: (item: DataItem) => {
        // vis compares template HTML and may retain the previous node.
        const label = labels.get(String(item.id)) ?? textNode(item.content, "bible-time-label");
        labels.set(String(item.id), label);
        return label;
      },
      groupTemplate: (group: { content: string } | null) => textNode(group?.content ?? ""),
      format: { minorLabels: date => formatTimelineYear(moment.utc(date).year()), majorLabels: () => "" },
      onInitialDrawComplete: () => { if (!disposed) fitSelection.current?.(); },
    };
    let instance: Timeline;
    try {
      instance = new Timeline(container.current, items, groups, options);
      timeline.current = instance;
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
      instance.on("rangechanged", ({ start, end }: { start: Date; end: Date }) => {
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
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(resizeFrame); instance.destroy(); timeline.current = null; fitSelection.current = null; };
  }, [records]);
  useEffect(() => { timeline.current?.setSelection(selectedId ? [selectedId] : []); }, [selectedId, records]);
  const hasDates = records.some(record => timelinePlotBounds(record));
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", expanded && "min-h-0 flex-1")}>
      <div className="flex shrink-0 flex-wrap items-center gap-2" role="group" aria-label="Timeline navigation">
        <Button size="sm" variant="outline" onClick={() => timeline.current?.zoomIn(0.4, { animation: false })}>Zoom in</Button>
        <Button size="sm" variant="outline" onClick={() => timeline.current?.zoomOut(0.4, { animation: false })}>Zoom out</Button>
        <Button size="sm" variant="outline" onClick={() => fitSelection.current?.()}>Fit selection</Button>
        <Button size="sm" variant="outline" aria-expanded={expanded} onClick={() => onExpandedChange(!expanded)}>
          {expanded ? <MinimizeIcon data-icon="inline-start" /> : <MaximizeIcon data-icon="inline-start" />}{expanded ? "Collapse chart" : "Expand chart"}
        </Button>
        {expanded ? <Button size="sm" onClick={onClose}>Close</Button> : null}
        {!expanded ? <span className="text-xs text-muted-foreground">Drag to pan · Ctrl + scroll or pinch to zoom</span> : null}
      </div>
      {error ? <p role="alert">The chart could not load. Use the timeline list below.</p> : null}
      {!hasDates ? <p className="text-sm text-muted-foreground">No supported calendar placements in this selection. {expanded ? "Collapse the chart to see the undated entries." : "People and evidence remain in the list below."}</p> : null}
      <div ref={container} className={cn("bible-timeline min-w-0 overflow-hidden rounded-lg border", expanded ? "min-h-0 flex-1" : "h-80", !hasDates && "hidden")} role="region" aria-label="Genealogy timeline chart" />
      <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Timeline legend">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-point" />Single date</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key" />Span of time</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-window" />Uncertain event date (not duration)</span>
        {records.some(record => record.placement) ? <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="bible-time-key bible-time-key-estimate" />Estimated placement (not lifespan)</span> : null}
        <span>Broken ends: birth/death unknown · All calendar dates approximate</span>
      </div>
    </div>
  );
}
