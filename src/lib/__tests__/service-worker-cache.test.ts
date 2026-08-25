import { describe, expect, it } from "vitest";

import {
  findObsoleteAppCaches,
  isRangedRequest,
  shouldCacheServiceWorkerResponse,
} from "@/lib/service-worker-cache";

describe("service-worker cache policy", () => {
  it("only removes obsolete caches owned by this application", () => {
    expect(
      findObsoleteAppCaches(
        ["kjv-only-cache-v6", "kjv-only-cache-v7", "another-app-v1"],
        "kjv-only-cache-",
        "kjv-only-cache-v7"
      )
    ).toEqual(["kjv-only-cache-v6"]);
  });

  it("does not cache partial responses", () => {
    expect(isRangedRequest("bytes=0-100")).toBe(true);
    expect(isRangedRequest(null)).toBe(false);
    expect(shouldCacheServiceWorkerResponse(200)).toBe(true);
    expect(shouldCacheServiceWorkerResponse(206)).toBe(false);
  });
});
