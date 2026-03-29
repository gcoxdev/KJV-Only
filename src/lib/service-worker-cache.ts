export function isRangedRequest(rangeHeader: string | null | undefined) {
  return typeof rangeHeader === "string" && rangeHeader.trim().length > 0;
}

export function shouldCacheServiceWorkerResponse(status: number) {
  return status === 200;
}
