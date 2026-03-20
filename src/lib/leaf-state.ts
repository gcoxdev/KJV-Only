export function swapRecordEntries<T>(
  current: Record<string, T>,
  sourceLeafId: string,
  targetLeafId: string,
) {
  const next = { ...current };
  const sourceValue = current[sourceLeafId];
  const targetValue = current[targetLeafId];

  if (targetValue === undefined) {
    delete next[sourceLeafId];
  } else {
    next[sourceLeafId] = targetValue;
  }

  if (sourceValue === undefined) {
    delete next[targetLeafId];
  } else {
    next[targetLeafId] = sourceValue;
  }

  return next;
}

export function swapSingleLeafReference<T extends { leafId: string }>(
  current: T | null,
  sourceLeafId: string,
  targetLeafId: string,
) {
  if (!current) {
    return current;
  }
  if (current.leafId === sourceLeafId) {
    return { ...current, leafId: targetLeafId };
  }
  if (current.leafId === targetLeafId) {
    return { ...current, leafId: sourceLeafId };
  }
  return current;
}
