type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const LOCAL_STORAGE_ISSUE_EVENT = "kjv:local-storage-issue";
const localStorageIssueKeys = new Set<string>();

export function reportLocalStorageIssue(key: string) {
  localStorageIssueKeys.add(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(LOCAL_STORAGE_ISSUE_EVENT, { detail: { key } }),
    );
  }
}

export function consumeLocalStorageIssueKeys() {
  const keys = Array.from(localStorageIssueKeys);
  localStorageIssueKeys.clear();
  return keys;
}

export const READER_STORAGE_KEYS = {
  theme: "theme",
  displaySettings: "kjv-display-settings-v1",
  readChapters: "kjv-read-chapters-v1",
  notes: "kjv-reader-notes-v1",
  bookmarks: "kjv-reader-bookmarks-v1",
  searchLibrary: "kjv-search-library-v1",
} as const;

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) {
    return storage;
  }
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readLocalStorageValue(
  key: string,
  storage?: StorageLike,
): string | null {
  try {
    const target = resolveStorage(storage);
    if (!target) {
      if (typeof window !== "undefined") reportLocalStorageIssue(key);
      return null;
    }
    return target.getItem(key);
  } catch {
    reportLocalStorageIssue(key);
    return null;
  }
}

export function readLocalStorageJson<T>(
  key: string,
  storage?: StorageLike,
): T | null {
  const value = readLocalStorageValue(key, storage);
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    reportLocalStorageIssue(key);
    return null;
  }
}

export function writeLocalStorageValue(
  key: string,
  value: string,
  storage?: StorageLike,
) {
  try {
    const target = resolveStorage(storage);
    if (!target) {
      if (typeof window !== "undefined") reportLocalStorageIssue(key);
      return false;
    }
    target.setItem(key, value);
    return true;
  } catch {
    reportLocalStorageIssue(key);
    return false;
  }
}

export function writeLocalStorageJson(
  key: string,
  value: unknown,
  storage?: StorageLike,
) {
  try {
    return writeLocalStorageValue(key, JSON.stringify(value), storage);
  } catch {
    reportLocalStorageIssue(key);
    return false;
  }
}

export function removeLocalStorageValue(key: string, storage?: StorageLike) {
  try {
    const target = resolveStorage(storage);
    if (!target) {
      if (typeof window !== "undefined") reportLocalStorageIssue(key);
      return false;
    }
    target.removeItem(key);
    return true;
  } catch {
    reportLocalStorageIssue(key);
    return false;
  }
}
