import { useCallback, useEffect, useRef, useState } from "react";

import {
  READER_STORAGE_KEYS,
  readLocalStorageValue,
  reportLocalStorageIssue,
  writeLocalStorageJson,
} from "@/lib/local-storage";
import {
  addRecentSearch,
  EMPTY_SEARCH_LIBRARY,
  parseSearchLibrary,
  SEARCH_LIBRARY_LIMITS,
  SEARCH_LIBRARY_VERSION,
  upsertSavedSearch,
  type SearchLibrary,
} from "@/lib/search-library";
import type { SearchDefinition } from "@/types/reader";

const SEARCH_LIBRARY_CHANGE_EVENT = "kjv:search-library-change";

function loadSearchLibrary() {
  const stored = readLocalStorageValue(READER_STORAGE_KEYS.searchLibrary);
  if (stored === null) {
    return EMPTY_SEARCH_LIBRARY;
  }
  if (stored.length > SEARCH_LIBRARY_LIMITS.maxStorageLength) {
    reportLocalStorageIssue(READER_STORAGE_KEYS.searchLibrary);
    return EMPTY_SEARCH_LIBRARY;
  }
  try {
    const parsed = parseSearchLibrary(JSON.parse(stored) as unknown);
    if (parsed) {
      return parsed;
    }
  } catch {
    // Report the malformed record below.
  }
  reportLocalStorageIssue(READER_STORAGE_KEYS.searchLibrary);
  return EMPTY_SEARCH_LIBRARY;
}

function createSearchId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `search-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Owns the local-only, versioned saved/recent Search library. */
export function useSearchLibrary() {
  const [library, setLibrary] = useState<SearchLibrary>(() => loadSearchLibrary());
  const libraryRef = useRef(library);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === READER_STORAGE_KEYS.searchLibrary) {
        const next = loadSearchLibrary();
        libraryRef.current = next;
        setLibrary(next);
      }
    };
    const handleLibraryChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        const parsed = parseSearchLibrary(event.detail);
        if (parsed) {
          libraryRef.current = parsed;
          setLibrary(parsed);
          return;
        }
      }
      const next = loadSearchLibrary();
      libraryRef.current = next;
      setLibrary(next);
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(SEARCH_LIBRARY_CHANGE_EVENT, handleLibraryChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        SEARCH_LIBRARY_CHANGE_EVENT,
        handleLibraryChange,
      );
    };
  }, []);

  const commit = useCallback((next: SearchLibrary) => {
    const bounded = {
      version: SEARCH_LIBRARY_VERSION,
      saved: next.saved.slice(0, SEARCH_LIBRARY_LIMITS.maxSaved),
      recent: next.recent.slice(0, SEARCH_LIBRARY_LIMITS.maxRecent),
    } satisfies SearchLibrary;
    libraryRef.current = bounded;
    setLibrary(bounded);
    const persisted = writeLocalStorageJson(
      READER_STORAGE_KEYS.searchLibrary,
      bounded,
    );
    window.dispatchEvent(
      new CustomEvent(SEARCH_LIBRARY_CHANGE_EVENT, { detail: bounded }),
    );
    return persisted;
  }, []);

  const recordRecent = useCallback(
    (definition: SearchDefinition) => {
      commit(addRecentSearch(libraryRef.current, definition, Date.now()));
    },
    [commit],
  );

  const save = useCallback(
    (name: string, definition: SearchDefinition) => {
      return commit(
        upsertSavedSearch(libraryRef.current, {
          id: createSearchId(),
          name,
          definition,
          now: Date.now(),
        }),
      );
    },
    [commit],
  );

  const removeSaved = useCallback(
    (id: string) => {
      commit({
        ...libraryRef.current,
        saved: libraryRef.current.saved.filter((entry) => entry.id !== id),
      });
    },
    [commit],
  );

  const clearRecent = useCallback(() => {
    commit({ ...libraryRef.current, recent: [] });
  }, [commit]);

  return {
    library,
    recordRecent,
    save,
    removeSaved,
    clearRecent,
  };
}
