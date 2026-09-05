const workerUrl = new URL(self.location.href)
const APP_CACHE = workerUrl.searchParams.get("cacheName")
const APP_CACHE_PREFIX = workerUrl.searchParams.get("cachePrefix")
const CACHE_TOKEN_PATTERN = /^[a-z0-9][a-z0-9._-]{0,99}$/
if (
  !APP_CACHE ||
  !APP_CACHE_PREFIX ||
  !CACHE_TOKEN_PATTERN.test(APP_CACHE) ||
  !CACHE_TOKEN_PATTERN.test(APP_CACHE_PREFIX) ||
  !APP_CACHE.startsWith(APP_CACHE_PREFIX)
) {
  throw new Error("Invalid service-worker cache configuration")
}
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/app-cache-config.js",
  "/app-shell-assets.json",
  "/data/kjv-manifest.json",
  "/data/kjv-bootstrap.json",
  "/icons/app-icon.svg",
  "/icons/app-icon.png",
  "/icons/app-logo.png",
  "/icons/app-icon-512.png",
  "/icons/app-icon-maskable.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon.png",
  "/topics/daily-scripture-topics.json",
]
const APP_SHELL_ASSET_URL_PATTERN =
  /^\/assets\/[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/
const OFFLINE_ICON_ASSET_URL_PATTERN =
  /^\/icons\/(?:bw|color)\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.png$/
const LIVE_DATA_PREFIXES = ["/references/", "/data/", "/maps/"]
const NETWORK_FIRST_PATHS = new Set([
  "/app-cache-config.js",
  "/app-shell-assets.json",
])

function shouldUseNetworkFirst(requestUrl) {
  return (
    NETWORK_FIRST_PATHS.has(requestUrl.pathname) ||
    LIVE_DATA_PREFIXES.some((prefix) => requestUrl.pathname.startsWith(prefix))
  )
}

function isRangedRequest(request) {
  const rangeHeader = request.headers.get("range")
  return typeof rangeHeader === "string" && rangeHeader.trim().length > 0
}

function shouldCacheResponse(response) {
  return response.status === 200
}

function isAssetList(value) {
  return (
    Array.isArray(value) &&
    value.length <= 500 &&
    value.every(
      (url) => typeof url === "string" && APP_SHELL_ASSET_URL_PATTERN.test(url)
    ) &&
    new Set(value).size === value.length
  )
}

function isOfflineIconAssetList(value) {
  return (
    Array.isArray(value) &&
    value.length <= 250 &&
    value.every(
      (url) =>
        typeof url === "string" && OFFLINE_ICON_ASSET_URL_PATTERN.test(url)
    ) &&
    new Set(value).size === value.length
  )
}

async function cacheAppShell() {
  const cache = await caches.open(APP_CACHE)
  await cache.addAll(APP_SHELL)
  const response = await cache.match("/app-shell-assets.json")
  const manifest = await response?.json()
  if (
    !manifest ||
    manifest.schemaVersion !== 1 ||
    !isAssetList(manifest.startupAssets) ||
    !isAssetList(manifest.assets)
  ) {
    throw new Error("Invalid app-shell asset manifest")
  }
  const offlineIconAssets = manifest.offlineIconAssets ?? []
  if (!isOfflineIconAssetList(offlineIconAssets)) {
    throw new Error("Invalid offline icon asset manifest")
  }
  const assetSet = new Set(manifest.assets)
  if (!manifest.startupAssets.every((url) => assetSet.has(url))) {
    throw new Error("Invalid app-shell startup asset")
  }
  await cache.addAll(
    Array.from(new Set([...manifest.assets, ...offlineIconAssets]))
  )
}

async function networkFirst(request) {
  const cache = await caches.open(APP_CACHE)
  let response

  try {
    response = await fetch(request)
  } catch {
    const cached = await cache.match(request, { ignoreVary: true })
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

async function cacheFirst(request, requestUrl) {
  const cache = await caches.open(APP_CACHE)
  const cached = await cache.match(request, { ignoreVary: true })
  if (cached) {
    return cached
  }

  let response
  try {
    response = await fetch(request)
  } catch {
    if (OFFLINE_ICON_ASSET_URL_PATTERN.test(requestUrl.pathname)) {
      const fallback = await cache.match("/icons/app-icon.svg", {
        ignoreVary: true,
      })
      if (fallback) {
        return fallback
      }
    }
    return Response.error()
  }
  if (shouldCacheResponse(response)) {
    try {
      await cache.put(request, response.clone())
    } catch {
      // Continue serving the fetched response when persistent storage is full.
    }
  }
  return response
}

function prepareClientForUpdate(client) {
  return new Promise((resolve) => {
    const channel = new MessageChannel()
    const finish = () => {
      clearTimeout(timeoutId)
      channel.port1.close()
      resolve()
    }
    const timeoutId = setTimeout(finish, 1500)
    channel.port1.onmessage = finish
    client.postMessage(
      { type: "KJV_ONLY_UPDATE_ACTIVATING" },
      [channel.port2]
    )
  })
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell())
})

self.addEventListener("message", (event) => {
  if (
    !event.data ||
    typeof event.data !== "object" ||
    event.data.type !== "KJV_ONLY_SKIP_WAITING"
  ) {
    return
  }
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => Promise.all(clients.map(prepareClientForUpdate)))
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

  event.respondWith(cacheFirst(event.request, requestUrl))
})
