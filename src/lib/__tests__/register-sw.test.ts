import { describe, expect, it } from "vitest"

import {
  buildServiceWorkerScriptUrl,
  isAppServiceWorkerScriptUrl,
  isValidServiceWorkerCacheConfig,
  parseServiceWorkerCacheName,
  registrationWorkerScriptUrls,
  selectAppCacheNames,
} from "@/lib/register-sw"

describe("service-worker script URL", () => {
  it("carries the centralized cache contract without an import dependency", () => {
    const scriptUrl = buildServiceWorkerScriptUrl("https://example.test", {
      cacheName: "kjv-only-cache-v8",
      cachePrefix: "kjv-only-cache-",
    })
    const parsed = new URL(scriptUrl)

    expect(parsed.pathname).toBe("/sw.js")
    expect(parsed.searchParams.get("cacheName")).toBe("kjv-only-cache-v8")
    expect(parsed.searchParams.get("cachePrefix")).toBe("kjv-only-cache-")
  })

  it("recognizes only the same-origin application worker path", () => {
    expect(
      isAppServiceWorkerScriptUrl(
        "https://example.test/sw.js?cacheName=kjv-only-cache-v8",
        "https://example.test",
      ),
    ).toBe(true)
    expect(
      isAppServiceWorkerScriptUrl(
        "https://other.test/sw.js?cacheName=kjv-only-cache-v8",
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

  it("reads the cache version from a registered worker URL", () => {
    expect(
      parseServiceWorkerCacheName(
        "https://example.test/sw.js?cacheName=kjv-only-cache-v8&cachePrefix=kjv-only-cache-",
      ),
    ).toBe("kjv-only-cache-v8")
    expect(parseServiceWorkerCacheName("not a url")).toBeNull()
  })

  it("selects only application-owned caches", () => {
    expect(
      selectAppCacheNames(
        [
          "kjv-only-cache-v7",
          "unrelated-cache-v1",
          "kjv-only-cache-v8",
        ],
        "kjv-only-cache-",
      ),
    ).toEqual(["kjv-only-cache-v7", "kjv-only-cache-v8"])
  })

  it("accepts only the application-owned cache contract", () => {
    expect(
      isValidServiceWorkerCacheConfig({
        cachePrefix: "kjv-only-cache-",
        cacheName: "kjv-only-cache-v8",
      }),
    ).toBe(true)
    expect(
      isValidServiceWorkerCacheConfig({
        cachePrefix: "",
        cacheName: "kjv-only-cache-v8",
      }),
    ).toBe(false)
    expect(
      isValidServiceWorkerCacheConfig({
        cachePrefix: "other-app-",
        cacheName: "other-app-v1",
      }),
    ).toBe(false)
  })

  it("collects each live worker URL from a registration", () => {
    const registration = {
      active: { scriptURL: "https://example.test/sw.js?active=1" },
      installing: { scriptURL: "https://example.test/sw.js?installing=1" },
      waiting: { scriptURL: "https://example.test/sw.js?waiting=1" },
    } as ServiceWorkerRegistration

    expect(registrationWorkerScriptUrls(registration)).toEqual([
      "https://example.test/sw.js?active=1",
      "https://example.test/sw.js?installing=1",
      "https://example.test/sw.js?waiting=1",
    ])
  })
})
