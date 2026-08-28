import { describe, expect, it } from "vitest";

import {
  addRecentSearch,
  EMPTY_SEARCH_LIBRARY,
  parseSearchLibrary,
  SEARCH_LIBRARY_LIMITS,
  upsertSavedSearch,
} from "@/lib/search-library";
import type { SearchDefinition } from "@/types/reader";

const definition: SearchDefinition = {
  searchMode: "regex",
  caseSensitive: true,
  phraseInput: "\\bfaith\\w*\\b",
  selectedWords: [],
  selectedBookIndexes: [44, 45],
  resultSort: "canonical",
  showResultContext: true,
};

describe("search library", () => {
  it("round-trips only a valid versioned schema", () => {
    const library = upsertSavedSearch(EMPTY_SEARCH_LIBRARY, {
      id: "saved-1",
      name: "Faith in Romans",
      definition,
      now: 100,
    });

    expect(parseSearchLibrary(JSON.parse(JSON.stringify(library)))).toEqual(library);
    expect(parseSearchLibrary({ ...library, version: 2 })).toBeNull();
    expect(
      parseSearchLibrary({
        ...library,
        saved: [library.saved[0], library.saved[0]],
      }),
    ).toBeNull();
    expect(
      parseSearchLibrary({
        ...library,
        saved: [{ ...library.saved[0], definition: { ...definition, results: [] } }],
      }),
    ).toEqual(library);
  });

  it("deduplicates recent definitions and enforces the history bound", () => {
    let library = EMPTY_SEARCH_LIBRARY;
    for (let index = 0; index <= SEARCH_LIBRARY_LIMITS.maxRecent; index += 1) {
      library = addRecentSearch(
        library,
        { ...definition, phraseInput: `faith-${index}` },
        index,
      );
    }
    library = addRecentSearch(library, definition, 999);
    library = addRecentSearch(library, definition, 1_000);

    expect(library.recent).toHaveLength(SEARCH_LIBRARY_LIMITS.maxRecent);
    expect(library.recent[0]).toEqual({ definition, usedAt: 1_000 });
    expect(
      library.recent.filter((entry) => entry.definition.phraseInput === definition.phraseInput),
    ).toHaveLength(1);
  });

  it("updates an existing saved definition instead of duplicating it", () => {
    const initial = upsertSavedSearch(EMPTY_SEARCH_LIBRARY, {
      id: "saved-1",
      name: "First name",
      definition,
      now: 100,
    });
    const updated = upsertSavedSearch(initial, {
      id: "saved-2",
      name: "Updated name",
      definition,
      now: 200,
    });

    expect(updated.saved).toHaveLength(1);
    expect(updated.saved[0]).toMatchObject({
      id: "saved-1",
      name: "Updated name",
      createdAt: 100,
      updatedAt: 200,
    });
  });
});
