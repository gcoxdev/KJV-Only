import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { readLocalStorageJson, writeLocalStorageJson } from "@/lib/local-storage";
import { parseTimelineViewState, timelineViewStorageKey, type TimelineViewKind, type TimelineViewState } from "@/lib/timeline-view-state";

export type TimelineViewProps = {
  initialViewState?: TimelineViewState;
  onViewStateChange?: (state: TimelineViewState) => void;
};

/** Panels keep independent state in their layout; dialogs remember their last view. */
export function useTimelineViewState(kind: TimelineViewKind, { initialViewState, onViewStateChange }: TimelineViewProps) {
  const [dialogState, setState] = useState(() => parseTimelineViewState(
    initialViewState ?? (onViewStateChange ? undefined : readLocalStorageJson(timelineViewStorageKey(kind))), kind,
  ));
  const panelState = useMemo(() => parseTimelineViewState(initialViewState, kind), [initialViewState, kind]);
  const state = onViewStateChange ? panelState : dialogState;
  const current = useRef(state);
  useLayoutEffect(() => { current.current = state; }, [state]);
  const patch = useCallback((changes: Partial<TimelineViewState>) => {
    const next = parseTimelineViewState({ ...current.current, ...changes }, kind);
    if (JSON.stringify(next) === JSON.stringify(current.current)) return;
    current.current = next;
    if (onViewStateChange) onViewStateChange(next);
    else {
      setState(next);
      writeLocalStorageJson(timelineViewStorageKey(kind), next);
    }
  }, [kind, onViewStateChange]);
  return [state, patch] as const;
}
