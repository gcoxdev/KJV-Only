import { useSyncExternalStore } from "react";
import type { SojournModel } from "@/data/bible-timeline";

// Both timeline tools use the same working chronology for this app session.
let model: SojournModel = "egypt430";
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => model;
function setModel(next: SojournModel) {
  if (next === model) return;
  model = next;
  listeners.forEach(listener => listener());
}
export function useTimelineModel() {
  return [useSyncExternalStore(subscribe, getSnapshot), setModel] as const;
}
