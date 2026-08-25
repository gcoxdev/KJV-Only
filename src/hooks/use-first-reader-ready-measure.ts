import { useEffect, useRef } from "react";

import { beginPerformanceMeasure } from "@/lib/performance";

export function useFirstReaderReadyMeasure() {
  const finishMeasureRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const finishMeasure = beginPerformanceMeasure("kjv:first-reader-ready");
    finishMeasureRef.current = finishMeasure;
    return () => {
      if (finishMeasureRef.current === finishMeasure) {
        finishMeasure();
        finishMeasureRef.current = null;
      }
    };
  }, []);

  return finishMeasureRef;
}
