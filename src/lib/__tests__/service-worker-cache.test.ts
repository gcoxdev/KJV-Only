import { describe, expect, it } from "vitest";

import {
  isRangedRequest,
  shouldCacheServiceWorkerResponse,
} from "@/lib/service-worker-cache";

describe("service worker cache guards", () => {
  it("treats range requests as bypass-only requests", () => {
    expect(isRangedRequest("bytes=0-")).toBe(true);
    expect(isRangedRequest(" bytes=100-200 ")).toBe(true);
    expect(isRangedRequest(null)).toBe(false);
    expect(isRangedRequest(undefined)).toBe(false);
    expect(isRangedRequest("   ")).toBe(false);
  });

  it("only allows full 200 responses to be cached", () => {
    expect(shouldCacheServiceWorkerResponse(200)).toBe(true);
    expect(shouldCacheServiceWorkerResponse(206)).toBe(false);
    expect(shouldCacheServiceWorkerResponse(404)).toBe(false);
  });
});
