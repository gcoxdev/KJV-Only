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

export function filterRecordEntries<T>(
  current: Record<string, T>,
  validLeafIds: ReadonlySet<string>,
) {
  const nextEntries = Object.entries(current).filter(([leafId]) =>
    validLeafIds.has(leafId),
  );

  if (nextEntries.length === Object.keys(current).length) {
    return current;
  }

  return Object.fromEntries(nextEntries) as Record<string, T>;
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

export function clearSingleLeafReferenceIfMissing<T extends { leafId: string }>(
  current: T | null,
  validLeafIds: ReadonlySet<string>,
) {
  if (!current || validLeafIds.has(current.leafId)) {
    return current;
  }
  return null;
}
