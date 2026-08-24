export function isRangedRequest(rangeHeader: string | null | undefined) {
  return typeof rangeHeader === "string" && rangeHeader.trim().length > 0;
}

export function shouldCacheServiceWorkerResponse(status: number) {
  return status === 200;
}

export function findObsoleteAppCaches(
  cacheNames: readonly string[],
  cachePrefix: string,
  currentCacheName: string
) {
  return cacheNames.filter(
    (cacheName) =>
      cacheName.startsWith(cachePrefix) && cacheName !== currentCacheName
  );
}
