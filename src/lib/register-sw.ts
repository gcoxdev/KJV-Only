export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return
  }

  // Service workers should not run in Vite dev mode because they can cache
  // module/chunk responses and break HMR or load mismatched React bundles.
  if (import.meta.env.DEV) {
    const appServiceWorkerUrl = new URL("/sw.js", window.location.origin).href
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      const appRegistrations = registrations.filter((registration) =>
        [
          registration.active?.scriptURL,
          registration.installing?.scriptURL,
          registration.waiting?.scriptURL,
        ].includes(appServiceWorkerUrl),
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
    void navigator.serviceWorker.register("/sw.js")
  })
}
