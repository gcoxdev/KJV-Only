export function beginPerformanceMeasure(name: string) {
  if (typeof performance === "undefined") {
    return () => undefined
  }
  const startMark = `${name}:start`
  const endMark = `${name}:end`
  performance.mark(startMark)
  return () => {
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
