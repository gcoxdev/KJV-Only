import { describe, expect, it } from "vitest";

import { sanitizeUrl, validateUrl } from "@/components/editor/utils/url";

describe("editor url helpers", () => {
  it("accepts internal kjv note links", () => {
    expect(validateUrl("kjv://verse/42/2/16")).toBe(true);
    expect(sanitizeUrl("kjv://verse/42/2/16")).toBe("kjv://verse/42/2/16");
  });
});
