import { createContext, useContext } from "react";
import type { VisualToolRequest } from "@/types/reader";

/** Return false to let the caller open its existing dialog. */
export const VisualToolTargetContext = createContext<(request: VisualToolRequest) => boolean>(() => false);
export function useVisualToolTarget() {
  return useContext(VisualToolTargetContext);
}

/** Load the destination, then dismiss its source immediately before navigating. */
export const VisualToolNavigateContext = createContext<((request: VisualToolRequest, beforeOpen?: () => boolean) => Promise<void>) | null>(null);
export function useVisualToolNavigate() {
  return useContext(VisualToolNavigateContext);
}
