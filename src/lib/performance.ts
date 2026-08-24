let performanceMeasureSequence = 0

export function beginPerformanceMeasure(name: string) {
  if (typeof performance === "undefined") {
    return () => undefined
  }
  performanceMeasureSequence += 1
  const measureId = performanceMeasureSequence
  const startMark = `${name}:start:${measureId}`
  const endMark = `${name}:end:${measureId}`
  let finished = false
  performance.mark(startMark)
  return () => {
    if (finished) {
      return
    }
    finished = true
    performance.mark(endMark)
    performance.measure(name, startMark, endMark)
    performance.clearMarks(startMark)
    performance.clearMarks(endMark)
  }
}

export function measureSynchronous<T>(name: string, operation: () => T): T {
  const finish = beginPerformanceMeasure(name)
  try {
    return operation()
  } finally {
    finish()
  }
}
