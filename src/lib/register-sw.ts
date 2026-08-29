type ServiceWorkerCacheConfig = {
  cacheName: string
  cachePrefix: string
}

export type PwaLifecyclePhase =
  | "unsupported"
  | "disabled"
  | "idle"
  | "registering"
  | "installing"
  | "ready"
  | "update-ready"
  | "activating"
  | "error"

export type PwaLifecycleSnapshot = Readonly<{
  phase: PwaLifecyclePhase
  isOnline: boolean
  isControlled: boolean
  configuredCacheName: string | null
  activeCacheName: string | null
  waitingCacheName: string | null
  appCacheNames: readonly string[]
  updateAvailable: boolean
  notificationDismissed: boolean
  isCheckingForUpdate: boolean
  isResetting: boolean
  lastUpdateCheck: number | null
  error: string | null
}>

const SKIP_WAITING_MESSAGE = "KJV_ONLY_SKIP_WAITING"
const FALLBACK_CACHE_PREFIX = "kjv-only-cache-"
const CACHE_TOKEN_PATTERN = /^[a-z0-9][a-z0-9._-]{0,99}$/
const listeners = new Set<() => void>()

let currentRegistration: ServiceWorkerRegistration | null = null
let observedRegistration: ServiceWorkerRegistration | null = null
let waitingWorker: ServiceWorker | null = null
let dismissedWaitingWorker: ServiceWorker | null = null
let registrationStarted = false
let reloadAfterActivation = false
let updateReloadStarted = false
let activationTimeoutId: number | null = null

let snapshot: PwaLifecycleSnapshot = {
  phase:
    typeof navigator !== "undefined" && "serviceWorker" in navigator
      ? "idle"
      : "unsupported",
  isOnline: typeof navigator === "undefined" ? true : navigator.onLine,
  isControlled:
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    navigator.serviceWorker.controller !== null,
  configuredCacheName: null,
  activeCacheName: null,
  waitingCacheName: null,
  appCacheNames: [],
  updateAvailable: false,
  notificationDismissed: false,
  isCheckingForUpdate: false,
  isResetting: false,
  lastUpdateCheck: null,
  error: null,
}

function updateSnapshot(patch: Partial<PwaLifecycleSnapshot>) {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((listener) => listener())
}

function configuredCache() {
  const config = globalThis.KJV_ONLY_CACHE_CONFIG
  return isValidServiceWorkerCacheConfig(config) ? config : null
}

function workerCacheName(worker: ServiceWorker | null | undefined) {
  return worker ? parseServiceWorkerCacheName(worker.scriptURL) : null
}

function registrationPhase(registration: ServiceWorkerRegistration) {
  if (registration.waiting || waitingWorker) {
    return "update-ready" as const
  }
  if (registration.installing) {
    return "installing" as const
  }
  return "ready" as const
}

async function refreshAppCacheNames() {
  if (!("caches" in window)) {
    updateSnapshot({ appCacheNames: [] })
    return
  }

  try {
    const cachePrefix = configuredCache()?.cachePrefix ?? FALLBACK_CACHE_PREFIX
    const cacheNames = selectAppCacheNames(await caches.keys(), cachePrefix)
    updateSnapshot({ appCacheNames: cacheNames })
  } catch {
    // Cache diagnostics are optional and must never interrupt the reader.
  }
}

function exposeWaitingWorker(worker: ServiceWorker) {
  waitingWorker = worker
  updateSnapshot({
    phase: "update-ready",
    waitingCacheName: workerCacheName(worker),
    updateAvailable: true,
    notificationDismissed: dismissedWaitingWorker === worker,
    isCheckingForUpdate: false,
    error: null,
  })
  void refreshAppCacheNames()
}

function observeInstallingWorker(
  registration: ServiceWorkerRegistration,
  worker: ServiceWorker,
) {
  const syncWorkerState = () => {
    if (worker.state === "installed") {
      if (navigator.serviceWorker.controller) {
        exposeWaitingWorker(registration.waiting ?? worker)
      } else {
        updateSnapshot({ phase: "ready", error: null })
      }
      return
    }

    if (worker.state === "activating" || worker.state === "activated") {
      if (!reloadAfterActivation) {
        waitingWorker = null
        updateSnapshot({
          phase: "ready",
          isControlled: navigator.serviceWorker.controller !== null,
          activeCacheName: workerCacheName(
            navigator.serviceWorker.controller ?? registration.active ?? worker,
          ),
          waitingCacheName: null,
          updateAvailable: false,
          notificationDismissed: false,
          error: null,
        })
      }
      void refreshAppCacheNames()
      return
    }

    if (worker.state === "redundant") {
      if (waitingWorker === worker) {
        waitingWorker = null
      }
      updateSnapshot({
        phase: registrationPhase(registration),
        waitingCacheName: workerCacheName(registration.waiting),
        updateAvailable: registration.waiting !== null,
        notificationDismissed: false,
        error: "The application update could not be installed.",
      })
    }
  }

  worker.addEventListener("statechange", syncWorkerState)
  syncWorkerState()
}

function observeRegistration(registration: ServiceWorkerRegistration) {
  currentRegistration = registration
  if (observedRegistration !== registration) {
    observedRegistration = registration
    registration.addEventListener("updatefound", () => {
      const installingWorker = registration.installing
      if (!installingWorker) {
        return
      }
      waitingWorker = null
      dismissedWaitingWorker = null
      updateSnapshot({
        phase: "installing",
        waitingCacheName: null,
        updateAvailable: false,
        notificationDismissed: false,
        error: null,
      })
      observeInstallingWorker(registration, installingWorker)
    })
  }

  if (registration.installing) {
    observeInstallingWorker(registration, registration.installing)
  }
  if (registration.waiting) {
    exposeWaitingWorker(registration.waiting)
    return
  }

  updateSnapshot({
    phase: registrationPhase(registration),
    isControlled: navigator.serviceWorker.controller !== null,
    activeCacheName: workerCacheName(
      navigator.serviceWorker.controller ?? registration.active,
    ),
    waitingCacheName: null,
    updateAvailable: false,
    notificationDismissed: false,
    error: null,
  })
  void refreshAppCacheNames()
}

async function findAppRegistration() {
  const registrations = await navigator.serviceWorker.getRegistrations()
  const origin = window.location.origin
  return (
    registrations.find((registration) =>
      registrationWorkerScriptUrls(registration).some((scriptUrl) =>
        isAppServiceWorkerScriptUrl(scriptUrl, origin),
      ),
    ) ?? null
  )
}

async function startProductionRegistration() {
  const config = configuredCache()
  updateSnapshot({
    phase: "registering",
    configuredCacheName: config?.cacheName ?? null,
    error: null,
  })
  if (!config) {
    updateSnapshot({
      phase: "error",
      error: "The application cache configuration is unavailable.",
    })
    return
  }

  try {
    const registration = await navigator.serviceWorker.register(
      buildServiceWorkerScriptUrl(window.location.origin, config),
      { updateViaCache: "none" },
    )
    observeRegistration(registration)

    if (navigator.onLine) {
      await registration.update()
      updateSnapshot({ lastUpdateCheck: Date.now(), error: null })
    }
  } catch {
    const previousRegistration = await findAppRegistration().catch(() => null)
    if (previousRegistration) {
      observeRegistration(previousRegistration)
      return
    }
    updateSnapshot({
      phase: "error",
      error: "The offline service could not be started.",
    })
  }
}

async function removeDevelopmentServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations()
  const origin = window.location.origin
  const appRegistrations = registrations.filter((registration) =>
    registrationWorkerScriptUrls(registration).some((scriptUrl) =>
      isAppServiceWorkerScriptUrl(scriptUrl, origin),
    ),
  )
  await Promise.all(
    appRegistrations.map((registration) => registration.unregister()),
  )

  if ("caches" in window) {
    const cachePrefix = configuredCache()?.cachePrefix ?? FALLBACK_CACHE_PREFIX
    const appCacheNames = selectAppCacheNames(await caches.keys(), cachePrefix)
    await Promise.all(appCacheNames.map((cacheName) => caches.delete(cacheName)))
  }
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

export function isValidServiceWorkerCacheConfig(
  value: unknown,
): value is ServiceWorkerCacheConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }
  const config = value as Record<string, unknown>
  return (
    config.cachePrefix === FALLBACK_CACHE_PREFIX &&
    typeof config.cacheName === "string" &&
    CACHE_TOKEN_PATTERN.test(config.cacheName) &&
    config.cacheName.startsWith(FALLBACK_CACHE_PREFIX)
  )
}

export function parseServiceWorkerCacheName(scriptUrl: string) {
  try {
    return new URL(scriptUrl).searchParams.get("cacheName")
  } catch {
    return null
  }
}

export function isAppServiceWorkerScriptUrl(scriptUrl: string, origin: string) {
  try {
    const url = new URL(scriptUrl)
    return url.origin === origin && url.pathname === "/sw.js"
  } catch {
    return false
  }
}

export function selectAppCacheNames(
  cacheNames: readonly string[],
  cachePrefix: string,
) {
  return cacheNames.filter((cacheName) => cacheName.startsWith(cachePrefix))
}

export function registrationWorkerScriptUrls(
  registration: ServiceWorkerRegistration,
) {
  return [
    registration.active?.scriptURL,
    registration.installing?.scriptURL,
    registration.waiting?.scriptURL,
  ].filter((scriptUrl): scriptUrl is string => typeof scriptUrl === "string")
}

export function subscribePwaLifecycle(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getPwaLifecycleSnapshot() {
  return snapshot
}

export function registerServiceWorker() {
  if (registrationStarted || !("serviceWorker" in navigator)) {
    return
  }
  registrationStarted = true

  const updateOnlineState = () => {
    updateSnapshot({ isOnline: navigator.onLine })
  }
  window.addEventListener("online", updateOnlineState)
  window.addEventListener("offline", updateOnlineState)
  const reloadForActivatedUpdate = () => {
    if (updateReloadStarted) {
      return
    }
    updateReloadStarted = true
    reloadAfterActivation = false
    if (activationTimeoutId !== null) {
      window.clearTimeout(activationTimeoutId)
      activationTimeoutId = null
    }
    window.location.reload()
  }
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (
      event.data &&
      typeof event.data === "object" &&
      event.data.type === "KJV_ONLY_UPDATE_ACTIVATING"
    ) {
      reloadAfterActivation = true
      event.ports[0]?.postMessage({ type: "KJV_ONLY_UPDATE_READY" })
    }
  })
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadAfterActivation) {
      reloadForActivatedUpdate()
      return
    }

    waitingWorker = null
    dismissedWaitingWorker = null
    updateSnapshot({
      phase: "ready",
      isControlled: navigator.serviceWorker.controller !== null,
      activeCacheName: workerCacheName(navigator.serviceWorker.controller),
      waitingCacheName: null,
      updateAvailable: false,
      notificationDismissed: false,
      error: null,
    })
    void refreshAppCacheNames()
  })

  const config = configuredCache()
  updateSnapshot({ configuredCacheName: config?.cacheName ?? null })

  if (import.meta.env.DEV) {
    updateSnapshot({ phase: "disabled" })
    void removeDevelopmentServiceWorkers().catch(() => {
      // Development cleanup is best effort and must not break Vite startup.
    })
    return
  }

  if (document.readyState === "complete") {
    void startProductionRegistration()
  } else {
    window.addEventListener(
      "load",
      () => {
        void startProductionRegistration()
      },
      { once: true },
    )
  }
}

export async function checkForServiceWorkerUpdate() {
  if (!("serviceWorker" in navigator)) {
    return false
  }
  if (!navigator.onLine) {
    updateSnapshot({ error: "Reconnect before checking for an update." })
    return false
  }

  updateSnapshot({ isCheckingForUpdate: true, error: null })
  try {
    const registration = currentRegistration ?? (await findAppRegistration())
    if (!registration) {
      throw new Error("No application service worker is registered.")
    }
    observeRegistration(registration)
    await registration.update()
    if (registration.waiting) {
      exposeWaitingWorker(registration.waiting)
    }
    updateSnapshot({
      isCheckingForUpdate: false,
      lastUpdateCheck: Date.now(),
      error: null,
    })
    return registration.waiting !== null || waitingWorker !== null
  } catch (error) {
    updateSnapshot({
      isCheckingForUpdate: false,
      error:
        error instanceof Error
          ? error.message
          : "The update check could not be completed.",
    })
    return false
  }
}

export function dismissWaitingServiceWorker() {
  dismissedWaitingWorker = waitingWorker
  updateSnapshot({ notificationDismissed: true })
}

export function activateWaitingServiceWorker() {
  const worker = currentRegistration?.waiting ?? waitingWorker
  if (!worker) {
    updateSnapshot({ error: "No application update is waiting to install." })
    return false
  }

  reloadAfterActivation = true
  updateSnapshot({
    phase: "activating",
    notificationDismissed: false,
    error: null,
  })
  try {
    worker.postMessage({ type: SKIP_WAITING_MESSAGE })
    activationTimeoutId = window.setTimeout(() => {
      reloadAfterActivation = false
      activationTimeoutId = null
      updateSnapshot({
        phase: "update-ready",
        error: "The update did not activate. Try again or reload while online.",
      })
    }, 15_000)
    return true
  } catch {
    reloadAfterActivation = false
    updateSnapshot({
      phase: "update-ready",
      error: "The update could not be activated.",
    })
    return false
  }
}

export async function refreshPwaLifecycleStatus() {
  if (!("serviceWorker" in navigator)) {
    return
  }
  try {
    const registration = currentRegistration ?? (await findAppRegistration())
    if (registration) {
      observeRegistration(registration)
    }
    await refreshAppCacheNames()
  } catch {
    updateSnapshot({ error: "The PWA status could not be refreshed." })
  }
}

export async function resetPwaApplication() {
  if (!("serviceWorker" in navigator)) {
    return false
  }
  if (!navigator.onLine) {
    updateSnapshot({ error: "Reconnect before repairing the app cache." })
    return false
  }

  updateSnapshot({ isResetting: true, error: null })
  try {
    const origin = window.location.origin
    const registrations = await navigator.serviceWorker.getRegistrations()
    const appRegistrations = registrations.filter((registration) =>
      registrationWorkerScriptUrls(registration).some((scriptUrl) =>
        isAppServiceWorkerScriptUrl(scriptUrl, origin),
      ),
    )
    await Promise.all(
      appRegistrations.map((registration) => registration.unregister()),
    )

    if ("caches" in window) {
      const cachePrefix = configuredCache()?.cachePrefix ?? FALLBACK_CACHE_PREFIX
      const appCacheNames = selectAppCacheNames(await caches.keys(), cachePrefix)
      await Promise.all(appCacheNames.map((cacheName) => caches.delete(cacheName)))
    }

    window.location.reload()
    return true
  } catch {
    updateSnapshot({
      isResetting: false,
      error: "The app cache could not be repaired.",
    })
    return false
  }
}
