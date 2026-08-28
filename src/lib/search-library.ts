import {
  parseSearchDefinition,
  searchDefinitionKey,
} from "@/lib/search-features";
import type { SearchDefinition } from "@/types/reader";

export const SEARCH_LIBRARY_VERSION = 1;
export const SEARCH_LIBRARY_LIMITS = {
  maxSaved: 50,
  maxRecent: 20,
  maxNameLength: 120,
  maxIdLength: 200,
  maxStorageLength: 256 * 1024,
} as const;

export type SavedSearch = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  definition: SearchDefinition;
};

export type RecentSearch = {
  usedAt: number;
  definition: SearchDefinition;
};

export type SearchLibrary = {
  version: typeof SEARCH_LIBRARY_VERSION;
  saved: SavedSearch[];
  recent: RecentSearch[];
};

export const EMPTY_SEARCH_LIBRARY: SearchLibrary = {
  version: SEARCH_LIBRARY_VERSION,
  saved: [],
  recent: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

function parseSavedSearch(value: unknown): SavedSearch | null {
  if (!isRecord(value)) {
    return null;
  }
  const definition = parseSearchDefinition(value.definition);
  if (
    typeof value.id !== "string" ||
    !value.id ||
    value.id.length > SEARCH_LIBRARY_LIMITS.maxIdLength ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.length > SEARCH_LIBRARY_LIMITS.maxNameLength ||
    !isTimestamp(value.createdAt) ||
    !isTimestamp(value.updatedAt) ||
    value.updatedAt < value.createdAt ||
    !definition
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name.trim(),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    definition,
  };
}

function parseRecentSearch(value: unknown): RecentSearch | null {
  if (!isRecord(value)) {
    return null;
  }
  const definition = parseSearchDefinition(value.definition);
  if (!isTimestamp(value.usedAt) || !definition) {
    return null;
  }
  return { usedAt: value.usedAt, definition };
}

export function parseSearchLibrary(value: unknown): SearchLibrary | null {
  if (
    !isRecord(value) ||
    value.version !== SEARCH_LIBRARY_VERSION ||
    !Array.isArray(value.saved) ||
    !Array.isArray(value.recent) ||
    value.saved.length > SEARCH_LIBRARY_LIMITS.maxSaved ||
    value.recent.length > SEARCH_LIBRARY_LIMITS.maxRecent
  ) {
    return null;
  }

  const saved = value.saved.map(parseSavedSearch);
  const recent = value.recent.map(parseRecentSearch);
  if (saved.some((entry) => entry === null) || recent.some((entry) => entry === null)) {
    return null;
  }
  const normalizedSaved = saved as SavedSearch[];
  const normalizedRecent = recent as RecentSearch[];
  if (
    new Set(normalizedSaved.map((entry) => entry.id)).size !==
      normalizedSaved.length ||
    new Set(
      normalizedRecent.map((entry) => searchDefinitionKey(entry.definition)),
    ).size !== normalizedRecent.length
  ) {
    return null;
  }

  return {
    version: SEARCH_LIBRARY_VERSION,
    saved: normalizedSaved,
    recent: normalizedRecent,
  };
}

export function addRecentSearch(
  library: SearchLibrary,
  definition: SearchDefinition,
  usedAt: number,
): SearchLibrary {
  const key = searchDefinitionKey(definition);
  return {
    ...library,
    recent: [
      { definition, usedAt },
      ...library.recent.filter(
        (entry) => searchDefinitionKey(entry.definition) !== key,
      ),
    ].slice(0, SEARCH_LIBRARY_LIMITS.maxRecent),
  };
}

export function upsertSavedSearch(
  library: SearchLibrary,
  args: {
    id: string;
    name: string;
    definition: SearchDefinition;
    now: number;
  },
): SearchLibrary {
  const name = args.name.trim().slice(0, SEARCH_LIBRARY_LIMITS.maxNameLength);
  if (!name) {
    return library;
  }
  const key = searchDefinitionKey(args.definition);
  const existing = library.saved.find(
    (entry) => searchDefinitionKey(entry.definition) === key,
  );
  const next: SavedSearch = {
    id: existing?.id ?? args.id,
    name,
    createdAt: existing?.createdAt ?? args.now,
    updatedAt: args.now,
    definition: args.definition,
  };
  return {
    ...library,
    saved: [
      next,
      ...library.saved.filter((entry) => entry.id !== next.id),
    ].slice(0, SEARCH_LIBRARY_LIMITS.maxSaved),
  };
}
