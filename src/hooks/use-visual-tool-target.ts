import { createContext, useContext } from "react";
import type { VisualToolRequest } from "@/types/reader";

/** Return false to let the caller open its existing dialog. */
export const VisualToolTargetContext = createContext<(request: VisualToolRequest) => boolean>(() => false);
export function useVisualToolTarget() {
  return useContext(VisualToolTargetContext);
}
