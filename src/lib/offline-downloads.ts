const APP_CACHE_PREFIX = "kjv-only-cache";
const DEFAULT_APP_CACHE_NAME = "kjv-only-cache-v3";

export const CORE_OFFLINE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons/app-icon.png",
  "/data/kjv.json",
  "/references/concordance.compact.delta.min.json",
  "/references/cross-refs.json",
  "/references/websters.json",
  "/references/ai-dictionary.json",
  "/references/hitchcocks.json",
  "/references/bible-word-book.json",
  "/references/old-english.json",
  "/references/phrases.json",
  "/references/units.json",
] as const;

export function normalizeOfflineAssetUrl(url: string) {
  const resolved = new URL(url, window.location.origin);
  return `${resolved.pathname}${resolved.search}`;
}

export async function resolveAppCacheName() {
  const cacheNames = await caches.keys();
  return (
    cacheNames.find((cacheName) => cacheName.startsWith(APP_CACHE_PREFIX)) ??
    DEFAULT_APP_CACHE_NAME
  );
}

export async function openAppCache() {
  const cacheName = await resolveAppCacheName();
  return caches.open(cacheName);
}

export async function clearAppOfflineCaches() {
  const cacheNames = await caches.keys();
  const appCacheNames = cacheNames.filter((cacheName) =>
    cacheName.startsWith(APP_CACHE_PREFIX),
  );
  await Promise.all(appCacheNames.map((cacheName) => caches.delete(cacheName)));
}

export async function getCachedOfflineAssetKeys() {
  const cache = await openAppCache();
  const requests = await cache.keys();
  return new Set(
    requests.map((request) => normalizeOfflineAssetUrl(request.url)),
  );
}

type DownloadOfflineAssetBatchOptions = {
  forceRefresh?: boolean;
};

export async function downloadOfflineAssetBatch(
  urls: string[],
  options?: DownloadOfflineAssetBatchOptions,
  onProgress?: (completed: number, total: number, failures: string[]) => void,
) {
  const cache = await openAppCache();
  const cachedKeys = await getCachedOfflineAssetKeys();
  const failures: string[] = [];
  let completed = 0;
  const total = urls.length;

  for (const url of urls) {
    const absoluteUrl = new URL(url, window.location.origin).toString();
    const normalizedKey = normalizeOfflineAssetUrl(absoluteUrl);

    if (!options?.forceRefresh && cachedKeys.has(normalizedKey)) {
      completed += 1;
      onProgress?.(completed, total, failures);
      continue;
    }

    try {
      const response = await fetch(absoluteUrl, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      await cache.put(absoluteUrl, response.clone());
      cachedKeys.add(normalizedKey);
    } catch {
      failures.push(url);
    }

    completed += 1;
    onProgress?.(completed, total, failures);
  }

  return { failures };
}

export async function deleteOfflineAssetBatch(urls: string[]) {
  const cache = await openAppCache();
  for (const url of urls) {
    const absoluteUrl = new URL(url, window.location.origin).toString();
    await cache.delete(absoluteUrl, { ignoreSearch: false });
  }
}

export function formatOfflineBytes(value: number | null | undefined) {
  if (!value || !Number.isFinite(value) || value <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = value;
  let unitIndex = 0;
  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }
  return `${current.toFixed(current >= 100 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
