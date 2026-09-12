import { readLocalStorageValue, writeLocalStorageValue } from "@/lib/local-storage";
import { TIMELINE_MODEL_KEY } from "@/lib/timeline-view-state";
import { useSyncExternalStore } from "react";
import type { SojournModel } from "@/data/bible-timeline";

// Both timeline tools share a persisted, explicitly selected working chronology.
let model: SojournModel = readLocalStorageValue(TIMELINE_MODEL_KEY) === "promise430" ? "promise430" : "egypt430";
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => model;
function setModel(next: SojournModel) {
  if (next === model) return;
  model = next;
  writeLocalStorageValue(TIMELINE_MODEL_KEY, next);
  listeners.forEach(listener => listener());
}
export function useTimelineModel() {
  return [useSyncExternalStore(subscribe, getSnapshot), setModel] as const;
}
