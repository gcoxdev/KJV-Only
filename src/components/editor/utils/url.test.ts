import { describe, expect, it } from "vitest";

import {
  BLOCKED_URL,
  openUrlInNewTab,
  sanitizeUrl,
  validateUrl,
} from "@/components/editor/utils/url";

describe("editor url helpers", () => {
  it("accepts internal kjv note links", () => {
    expect(validateUrl("kjv://JHN.3.16")).toBe(true);
    expect(sanitizeUrl("kjv://JHN.3.16")).toBe("kjv://JHN.3.16");
  });

  it("rejects executable and control-character URL schemes", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe(BLOCKED_URL);
    expect(sanitizeUrl("JaVaScRiPt:alert(1)")).toBe(BLOCKED_URL);
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe(
      BLOCKED_URL,
    );
    expect(sanitizeUrl("java\nscript:alert(1)")).toBe(BLOCKED_URL);
  });

  it("preserves supported and relative links", () => {
    expect(sanitizeUrl(" https://example.com/path ")).toBe(
      "https://example.com/path",
    );
    expect(sanitizeUrl("mailto:reader@example.com")).toBe(
      "mailto:reader@example.com",
    );
    expect(sanitizeUrl("/help")).toBe("/help");
  });

  it("opens only safe links without opener access", () => {
    const calls: Array<[string | URL | undefined, string | undefined, string | undefined]> = [];
    const openedWindow = { opener: {} } as Window;
    const openWindow = (url?: string | URL, target?: string, features?: string) => {
      calls.push([url, target, features]);
      return openedWindow;
    };

    expect(openUrlInNewTab("javascript:alert(1)", openWindow)).toBe(false);
    expect(calls).toHaveLength(0);

    expect(openUrlInNewTab("https://example.com", openWindow)).toBe(true);
    expect(calls).toEqual([
      ["https://example.com", "_blank", "noopener,noreferrer"],
    ]);
    expect(openedWindow.opener).toBeNull();
  });
});
