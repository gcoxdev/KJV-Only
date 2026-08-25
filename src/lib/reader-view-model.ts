function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  return Object.getPrototypeOf(value) === Object.prototype;
}

export function areReaderViewModelsEqual(
  previous: unknown,
  next: unknown,
): boolean {
  if (Object.is(previous, next)) {
    return true;
  }
  if (!isPlainRecord(previous) || !isPlainRecord(next)) {
    return false;
  }

  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);
  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  return previousKeys.every(
    (key) =>
      Object.hasOwn(next, key) &&
      areReaderViewModelsEqual(previous[key], next[key]),
  );
}
