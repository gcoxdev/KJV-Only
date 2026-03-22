import { describe, expect, it } from "vitest";

import {
  deriveDictionarySearchResults,
} from "@/hooks/use-dictionary-search-tool";
import {
  deriveConcordanceSearchResults,
} from "@/hooks/use-concordance-crossrefs-tool";
import {
  deriveStrongsSearchResults,
  type StrongsSearchResult,
} from "@/hooks/use-strongs-search-tool";

describe("study tool reset behavior", () => {
  it("dictionary results fall back to the selected entry when the search is cleared", () => {
    const selectedResult = { key: "grace", value: "favor" };
    const indexedEntries = [
      {
        key: "grace",
        keyLower: "grace",
        searchStrings: ["grace", "favor"],
        value: "favor",
      },
      {
        key: "mercy",
        keyLower: "mercy",
        searchStrings: ["mercy", "compassion"],
        value: "compassion",
      },
    ];

    expect(
      deriveDictionarySearchResults(
        indexedEntries,
        (key, value) => ({ key, value }),
        "mer",
        selectedResult,
      ),
    ).toEqual([{ key: "mercy", value: "compassion" }]);

    expect(
      deriveDictionarySearchResults(
        indexedEntries,
        (key, value) => ({ key, value }),
        "",
        selectedResult,
      ),
    ).toEqual([selectedResult]);
  });

  it("concordance results fall back to the selected word when the search is cleared", () => {
    const selectedWord = { key: "grace", references: ["EPH.2.8"] };
    const indexedConcordance = [
      { key: "grace", keyLower: "grace", references: ["EPH.2.8"] },
      { key: "mercy", keyLower: "mercy", references: ["EPH.2.4"] },
    ];

    expect(
      deriveConcordanceSearchResults(indexedConcordance, "mer", selectedWord),
    ).toEqual([{ key: "mercy", references: ["EPH.2.4"] }]);

    expect(
      deriveConcordanceSearchResults(indexedConcordance, "", selectedWord),
    ).toEqual([selectedWord]);
  });

  it("strongs results fall back to the selected entry when the search is cleared", () => {
    const selectedEntry: StrongsSearchResult = {
      code: "G5485",
      testament: "greek",
      entry: {
        kjv_def: "grace",
        strongs_def: "favor",
      },
    };
    const indexedEntries = [
      {
        code: "G5485",
        testament: "greek" as const,
        entry: selectedEntry.entry,
        haystackLower: "g5485 grace favor",
      },
      {
        code: "G1656",
        testament: "greek" as const,
        entry: {
          kjv_def: "mercy",
          strongs_def: "compassion",
        },
        haystackLower: "g1656 mercy compassion",
      },
    ];

    expect(deriveStrongsSearchResults(indexedEntries, selectedEntry, "mer")).toEqual([
      {
        code: "G1656",
        testament: "greek",
        entry: {
          kjv_def: "mercy",
          strongs_def: "compassion",
        },
      },
    ]);

    expect(deriveStrongsSearchResults(indexedEntries, selectedEntry, "")).toEqual([
      selectedEntry,
    ]);
  });
});
