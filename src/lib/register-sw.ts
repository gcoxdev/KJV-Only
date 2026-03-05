export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return
  }

  // Service workers should not run in Vite dev mode because they can cache
  // module/chunk responses and break HMR or load mismatched React bundles.
  if (import.meta.env.DEV) {
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      void Promise.all(registrations.map((registration) => registration.unregister()))
    })

    if ("caches" in window) {
      void caches.keys().then((keys) => {
        void Promise.all(keys.map((key) => caches.delete(key)))
      })
    }
    return
  }

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js")
  })
}
