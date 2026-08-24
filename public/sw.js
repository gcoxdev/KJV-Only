importScripts("/app-cache-config.js")

const { cacheName: APP_CACHE, cachePrefix: APP_CACHE_PREFIX } =
  self.KJV_ONLY_CACHE_CONFIG
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/app-cache-config.js",
]
const LIVE_DATA_PREFIXES = ["/references/", "/data/", "/maps/"]

function shouldUseNetworkFirst(requestUrl) {
  return LIVE_DATA_PREFIXES.some((prefix) => requestUrl.pathname.startsWith(prefix))
}

function isRangedRequest(request) {
  const rangeHeader = request.headers.get("range")
  return typeof rangeHeader === "string" && rangeHeader.trim().length > 0
}

function shouldCacheResponse(response) {
  return response.status === 200
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE)
  let response

  try {
    response = await fetch(request)
  } catch {
    const cached = await cache.match(request)
    return cached || Response.error()
  }

  if (shouldCacheResponse(response)) {
    try {
      await cache.put(request, response.clone())
    } catch {
      // A cache quota failure must not turn a successful online request into an error.
    }
  }
  return response
}

async function cacheFirst(request) {
  const cache = await caches.open(APP_CACHE)
  const cached = await cache.match(request)
  if (cached) {
    return cached
  }

  const response = await fetch(request)
  if (shouldCacheResponse(response)) {
    try {
      await cache.put(request, response.clone())
    } catch {
      // Continue serving the fetched response when persistent storage is full.
    }
  }
  return response
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key.startsWith(APP_CACHE_PREFIX) && key !== APP_CACHE) {
              return caches.delete(key)
            }
            return Promise.resolve()
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (isRangedRequest(event.request)) {
    event.respondWith(fetch(event.request))
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches
          .open(APP_CACHE)
          .then((cache) => cache.match("/index.html"))
          .then((cached) => cached || Response.error())
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
