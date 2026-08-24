import { describe, expect, it } from "vitest"

import { measureSynchronous } from "@/lib/performance"

describe("performance measurements", () => {
  it("returns the operation value and records a named duration", () => {
    performance.clearMeasures("test:operation")
    expect(measureSynchronous("test:operation", () => 42)).toBe(42)
    expect(performance.getEntriesByName("test:operation")).toHaveLength(1)
  })
})
