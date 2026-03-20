import { describe, expect, it } from "vitest";

import { sanitizeUrl, validateUrl } from "@/components/editor/utils/url";

describe("editor url helpers", () => {
  it("accepts internal kjv note links", () => {
    expect(validateUrl("kjv://JHN.3.16")).toBe(true);
    expect(sanitizeUrl("kjv://JHN.3.16")).toBe("kjv://JHN.3.16");
  });
});
