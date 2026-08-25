import { expect, test } from "@playwright/test"
import { readFileSync } from "node:fs"

const ISOLATION_TEST_URL = "/icons/app-icon.svg?cache-isolation-test=1"
const APP_CACHE = readFileSync(
  new URL("../public/app-cache-config.js", import.meta.url),
  "utf8",
).match(/cacheName:\s*["']([^"']+)["']/)?.[1]

if (!APP_CACHE) {
  throw new Error("Could not read the application cache name")
}

test.skip(
  !process.env.PLAYWRIGHT_USE_PREVIEW,
  "Service-worker upgrade checks require the production preview",
)

test("upgrades and reads only application-owned caches", async ({ page, context }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Genesis 1", exact: true })).toBeVisible()

  await page.evaluate(async () => {
    const config = (
      globalThis as typeof globalThis & {
        KJV_ONLY_CACHE_CONFIG?: {
          cacheName: string
          cachePrefix: string
        }
      }
    ).KJV_ONLY_CACHE_CONFIG
    if (!config) {
      throw new Error("Missing application cache configuration")
    }
    const workerUrl = new URL("/sw.js", window.location.origin)
    workerUrl.searchParams.set("cacheName", config.cacheName)
    workerUrl.searchParams.set("cachePrefix", config.cachePrefix)
    workerUrl.searchParams.set("upgrade-test", "1")
    const registration = await navigator.serviceWorker.ready
    await registration.unregister()
    await caches.open("kjv-only-cache-obsolete-test")
    await caches.open("unrelated-application-cache")
    await navigator.serviceWorker.register(workerUrl.href)
  })

  await expect
    .poll(
      () =>
        page.evaluate(async (currentCacheName) => {
          const keys = await caches.keys()
          return {
            current: keys.includes(currentCacheName),
            obsolete: keys.includes("kjv-only-cache-obsolete-test"),
            unrelated: keys.includes("unrelated-application-cache"),
          }
        }, APP_CACHE),
      { timeout: 30_000 },
    )
    .toEqual({ current: true, obsolete: false, unrelated: true })

  await page.evaluate(async ({ isolationTestUrl, currentCacheName }) => {
    const appCache = await caches.open(currentCacheName)
    await appCache.delete(isolationTestUrl)
    const unrelated = await caches.open("unrelated-application-cache")
    await unrelated.put(
      isolationTestUrl,
      new Response("poison", { headers: { "content-type": "image/svg+xml" } }),
    )
  }, { isolationTestUrl: ISOLATION_TEST_URL, currentCacheName: APP_CACHE })
  await context.setOffline(true)
  const isolatedCacheResult = await page.evaluate(async (isolationTestUrl) => {
    try {
      return await (await fetch(isolationTestUrl)).text()
    } catch {
      return "network-error"
    }
  }, ISOLATION_TEST_URL)
  expect(isolatedCacheResult).toBe("network-error")
  await context.setOffline(false)

  await page.evaluate(() => caches.delete("unrelated-application-cache"))
})
