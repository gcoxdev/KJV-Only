import { describe, expect, it } from "vitest"

import { beginPerformanceMeasure, measureSynchronous } from "@/lib/performance"

describe("performance measurements", () => {
  it("returns the operation value and records a named duration", () => {
    performance.clearMeasures("test:operation")
    expect(measureSynchronous("test:operation", () => 42)).toBe(42)
    expect(performance.getEntriesByName("test:operation")).toHaveLength(1)
  })

  it("keeps overlapping measurements independent and finishers idempotent", () => {
    performance.clearMeasures("test:overlap")
    const finishFirst = beginPerformanceMeasure("test:overlap")
    const finishSecond = beginPerformanceMeasure("test:overlap")

    finishSecond()
    finishFirst()
    finishFirst()

    expect(performance.getEntriesByName("test:overlap")).toHaveLength(2)
  })
})
