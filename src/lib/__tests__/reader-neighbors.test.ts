import { describe, expect, it } from "vitest";

import {
  leafIdsAtGroupEdge,
  type LeafRect,
} from "@/lib/reader-neighbors";

const GRID_RECTS = new Map<string, LeafRect>([
  ["top-left", { x: 0, y: 0, width: 50, height: 50 }],
  ["top-right", { x: 50, y: 0, width: 50, height: 50 }],
  ["bottom-left", { x: 0, y: 50, width: 50, height: 50 }],
  ["bottom-right", { x: 50, y: 50, width: 50, height: 50 }],
]);

const GRID_LEAF_IDS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

describe("reader neighbor helpers", () => {
  it.each([
    ["left", ["top-left", "bottom-left"]],
    ["right", ["top-right", "bottom-right"]],
    ["up", ["top-left", "top-right"]],
    ["down", ["bottom-left", "bottom-right"]],
  ] as const)("finds leaves at the %s edge of a group", (direction, expected) => {
    expect(leafIdsAtGroupEdge(GRID_LEAF_IDS, GRID_RECTS, direction)).toEqual(
      expected,
    );
  });

  it("preserves leaf order and includes coordinates within the epsilon", () => {
    const rects = new Map<string, LeafRect>([
      ["second", { x: 0.4, y: 10, width: 40, height: 20 }],
      ["first", { x: 0, y: 0, width: 40, height: 10 }],
    ]);

    expect(leafIdsAtGroupEdge(["first", "second"], rects, "left")).toEqual([
      "first",
      "second",
    ]);
    expect(
      leafIdsAtGroupEdge(["first", "second"], rects, "left", 0.25),
    ).toEqual(["first"]);
  });

  it("ignores leaves without geometry and returns no edge for an empty group", () => {
    expect(
      leafIdsAtGroupEdge(["top-left", "missing"], GRID_RECTS, "right"),
    ).toEqual(["top-left"]);
    expect(leafIdsAtGroupEdge([], GRID_RECTS, "down")).toEqual([]);
    expect(leafIdsAtGroupEdge(["missing"], GRID_RECTS, "down")).toEqual([]);
  });
});
