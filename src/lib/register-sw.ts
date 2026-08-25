type ServiceWorkerCacheConfig = {
  cacheName: string
  cachePrefix: string
}

export function buildServiceWorkerScriptUrl(
  origin: string,
  config: ServiceWorkerCacheConfig,
) {
  const url = new URL("/sw.js", origin)
  url.searchParams.set("cacheName", config.cacheName)
  url.searchParams.set("cachePrefix", config.cachePrefix)
  return url.href
}

export function isAppServiceWorkerScriptUrl(scriptUrl: string, origin: string) {
  try {
    const url = new URL(scriptUrl)
    return url.origin === origin && url.pathname === "/sw.js"
  } catch {
    return false
  }
}

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return
  }

  // Service workers should not run in Vite dev mode because they can cache
  // module/chunk responses and break HMR or load mismatched React bundles.
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      const appRegistrations = registrations.filter((registration) =>
        [
          registration.active?.scriptURL,
          registration.installing?.scriptURL,
          registration.waiting?.scriptURL,
        ].some(
          (scriptUrl) =>
            typeof scriptUrl === "string" &&
            isAppServiceWorkerScriptUrl(scriptUrl, window.location.origin),
        ),
      )
      void Promise.all(
        appRegistrations.map((registration) => registration.unregister()),
      )
    })

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        const { cachePrefix } =
          globalThis.KJV_ONLY_CACHE_CONFIG ?? {
            cachePrefix: "kjv-only-cache-",
          }
        void Promise.all(
          keys
            .filter((key) => key.startsWith(cachePrefix))
            .map((key) => caches.delete(key)),
        )
      })
    }
    return
  }

  window.addEventListener("load", () => {
    const config = globalThis.KJV_ONLY_CACHE_CONFIG
    if (!config) {
      return
    }
    void navigator.serviceWorker.register(
      buildServiceWorkerScriptUrl(window.location.origin, config),
    )
  })
}
