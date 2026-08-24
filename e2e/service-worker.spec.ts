import { expect, test } from "@playwright/test"

test.skip(
  !process.env.PLAYWRIGHT_USE_PREVIEW,
  "Service-worker upgrade checks require the production preview",
)

test("upgrades and reads only application-owned caches", async ({ page, context }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Genesis 1", exact: true })).toBeVisible()

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready
    await registration.unregister()
    await caches.open("kjv-only-cache-obsolete-test")
    await caches.open("unrelated-application-cache")
    await navigator.serviceWorker.register("/sw.js?upgrade-test=1")
  })

  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const keys = await caches.keys()
          return {
            current: keys.includes("kjv-only-cache-v5"),
            obsolete: keys.includes("kjv-only-cache-obsolete-test"),
            unrelated: keys.includes("unrelated-application-cache"),
          }
        }),
      { timeout: 30_000 },
    )
    .toEqual({ current: true, obsolete: false, unrelated: true })

  await page.evaluate(async () => {
    const appCache = await caches.open("kjv-only-cache-v5")
    await appCache.delete("/icons/app-icon.svg")
    const unrelated = await caches.open("unrelated-application-cache")
    await unrelated.put(
      "/icons/app-icon.svg",
      new Response("poison", { headers: { "content-type": "image/svg+xml" } }),
    )
  })
  await context.setOffline(true)
  const isolatedCacheResult = await page.evaluate(async () => {
    try {
      return await (await fetch("/icons/app-icon.svg")).text()
    } catch {
      return "network-error"
    }
  })
  expect(isolatedCacheResult).toBe("network-error")
  await context.setOffline(false)

  await page.evaluate(() => caches.delete("unrelated-application-cache"))
})
