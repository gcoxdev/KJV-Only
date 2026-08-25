import { describe, expect, it } from "vitest"

import {
  buildServiceWorkerScriptUrl,
  isAppServiceWorkerScriptUrl,
} from "@/lib/register-sw"

describe("service-worker script URL", () => {
  it("carries the centralized cache contract without an import dependency", () => {
    const scriptUrl = buildServiceWorkerScriptUrl("https://example.test", {
      cacheName: "kjv-only-cache-v7",
      cachePrefix: "kjv-only-cache-",
    })
    const parsed = new URL(scriptUrl)

    expect(parsed.pathname).toBe("/sw.js")
    expect(parsed.searchParams.get("cacheName")).toBe("kjv-only-cache-v7")
    expect(parsed.searchParams.get("cachePrefix")).toBe("kjv-only-cache-")
  })

  it("recognizes only the same-origin application worker path", () => {
    expect(
      isAppServiceWorkerScriptUrl(
        "https://example.test/sw.js?cacheName=kjv-only-cache-v7",
        "https://example.test",
      ),
    ).toBe(true)
    expect(
      isAppServiceWorkerScriptUrl(
        "https://other.test/sw.js?cacheName=kjv-only-cache-v7",
        "https://example.test",
      ),
    ).toBe(false)
    expect(
      isAppServiceWorkerScriptUrl(
        "https://example.test/other-sw.js",
        "https://example.test",
      ),
    ).toBe(false)
    expect(isAppServiceWorkerScriptUrl("not a url", "https://example.test")).toBe(
      false,
    )
  })
})
