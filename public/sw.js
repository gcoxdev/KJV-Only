const APP_CACHE = "kjv-only-cache-v3"
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"]
const LIVE_DATA_PREFIXES = ["/references/", "/data/", "/maps/"]

function shouldUseNetworkFirst(requestUrl) {
  return LIVE_DATA_PREFIXES.some((prefix) => requestUrl.pathname.startsWith(prefix))
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE)

  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    return cached || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(APP_CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== APP_CACHE) {
            return caches.delete(key)
          }
          return Promise.resolve()
        })
      )
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html").then((cached) => cached || Response.error())
      )
    )
    return
  }

  if (shouldUseNetworkFirst(requestUrl)) {
    event.respondWith(networkFirst(event.request))
    return
  }

  event.respondWith(cacheFirst(event.request))
})
