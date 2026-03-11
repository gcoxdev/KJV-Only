import { describe, expect, it } from "vitest";

import {
  defaultHighlightColor,
  normalizeHighlightColor,
  readableHighlightTextColor,
} from "@/lib/highlight-color";

describe("highlight color helpers", () => {
  it("normalizes invalid values to the default color", () => {
    expect(defaultHighlightColor()).toBe("#fafac5");
    expect(normalizeHighlightColor(undefined)).toBe("#fafac5");
    expect(normalizeHighlightColor("#ABCDEF")).toBe("#abcdef");
    expect(normalizeHighlightColor("#000")).toBe("#fafac5");
  });

  it("returns a readable text color for light and dark highlights", () => {
    expect(readableHighlightTextColor("#fafac5")).toBe("#111111");
    expect(readableHighlightTextColor("#111111")).toBe("#ffffff");
  });
});
