import { describe, expect, it } from "vitest";

import {
  boundsForGeoJson,
  cleanMapMarkup,
  mapEntrySearchableText,
  matchesMapWord,
  parseJsonl,
} from "@/lib/maps";

describe("maps helpers", () => {
  it("cleans markup and matches normalized words", () => {
    expect(cleanMapMarkup('<modern id="x">Arabian Peninsula</modern>')).toBe(
      "Arabian Peninsula",
    );

    expect(
      matchesMapWord(
        {
          geojson_file: "test.geojson",
          translations: ["Havilah"],
          types: ["region"],
          verses: ["GEN.2.11"],
          modern_names: ["Arabian Peninsula"],
        },
        "havilah,",
        (value) => value.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""),
      ),
    ).toBe(true);
  });

  it("builds searchable text and parses jsonl", () => {
    expect(
      mapEntrySearchableText({
        geojson_file: "test.geojson",
        translations: ["Havilah"],
        types: ["region"],
        verses: ["GEN.2.11"],
        modern_names: ["Arabian Peninsula"],
      }),
    ).toContain("arabian peninsula");

    expect(parseJsonl<{ id: number }>('{"id":1}\n{"id":2}\n')).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it("derives bounds from bbox or coordinates", () => {
    expect(
      boundsForGeoJson({ bbox: [1, 2, 3, 4] }),
    ).toEqual([
      [2, 1],
      [4, 3],
    ]);

    expect(
      boundsForGeoJson({
        features: [
          {
            geometry: {
              coordinates: [
                [10, 20],
                [30, 40],
              ],
            },
          },
        ],
      }),
    ).toEqual([
      [20, 10],
      [40, 30],
    ]);
  });
});
