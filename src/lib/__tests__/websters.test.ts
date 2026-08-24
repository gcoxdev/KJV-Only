import { describe, expect, it } from "vitest";

import { splitWebsterDefinitionLines } from "@/lib/websters";

describe("Webster definition rendering", () => {
  it("preserves supported line breaks as text lines", () => {
    expect(splitWebsterDefinitionLines("First<br/>Second<BR>Third")).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });

  it("leaves unsupported markup as inert text", () => {
    expect(
      splitWebsterDefinitionLines('<img src=x onerror="alert(1)">'),
    ).toEqual(['<img src=x onerror="alert(1)">']);
  });
});
