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

test("refreshes stale manifests and keeps book icons usable offline", async ({
  page,
  context,
}) => {
  const consoleErrors: string[] = []
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text())
    }
  })
  page.on("pageerror", (error) => consoleErrors.push(error.message))

  await page.goto("/")
  await expect(page.getByRole("button", { name: "Genesis 1", exact: true })).toBeVisible()
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)))
    .toBe(true)

  const cacheState = await page.evaluate(async (currentCacheName) => {
    const manifestResponse = await fetch("/app-shell-assets.json", {
      cache: "no-cache",
    })
    const manifest = (await manifestResponse.json()) as {
      schemaVersion: number
      startupAssets: string[]
      assets: string[]
      offlineIconAssets?: string[]
    }
    const iconAssets = manifest.offlineIconAssets ?? []
    const cache = await caches.open(currentCacheName)
    const missingIcons: string[] = []
    for (const url of iconAssets) {
      if (!(await cache.match(url, { ignoreVary: true }))) {
        missingIcons.push(url)
      }
    }

    const staleManifest = { ...manifest }
    delete staleManifest.offlineIconAssets
    await cache.put(
      "/app-shell-assets.json",
      new Response(JSON.stringify(staleManifest), {
        headers: { "content-type": "application/json" },
      }),
    )

    const refreshedManifest = (await (
      await fetch("/app-shell-assets.json", { cache: "no-cache" })
    ).json()) as { offlineIconAssets?: string[] }
    const cachedManifest = (await (
      await cache.match("/app-shell-assets.json")
    )?.json()) as { offlineIconAssets?: string[] } | undefined

    return {
      manifestIconCount: iconAssets.length,
      missingIcons,
      refreshedManifestIconCount:
        refreshedManifest.offlineIconAssets?.length ?? 0,
      cachedManifestIconCount: cachedManifest?.offlineIconAssets?.length ?? 0,
    }
  }, APP_CACHE)

  expect(cacheState.manifestIconCount).toBe(165)
  expect(cacheState.missingIcons).toEqual([])
  expect(cacheState.refreshedManifestIconCount).toBe(165)
  expect(cacheState.cachedManifestIconCount).toBe(165)

  await context.setOffline(true)
  const offlineIcons = await page.evaluate(async () => {
    const cachedBookIcon = await fetch("/icons/bw/LEV.png")
    const missingBookIcon = await fetch("/icons/bw/MISSING.png")
    return {
      cached: {
        ok: cachedBookIcon.ok,
        contentType: cachedBookIcon.headers.get("content-type"),
      },
      fallback: {
        ok: missingBookIcon.ok,
        contentType: missingBookIcon.headers.get("content-type"),
      },
    }
  })
  expect(offlineIcons.cached.ok).toBe(true)
  expect(offlineIcons.cached.contentType).toBe("image/png")
  expect(offlineIcons.fallback.ok).toBe(true)
  expect(offlineIcons.fallback.contentType).toBe("image/svg+xml")

  await page.getByRole("button", { name: "Welcome Home", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Welcome Home", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Genesis 1", exact: true }).click()
  await expect(
    page
      .getByText("In the beginning God created the heaven and the earth.", {
        exact: false,
      })
      .filter({ visible: true }),
  ).toBeVisible()
  expect(consoleErrors).toEqual([])
})

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
