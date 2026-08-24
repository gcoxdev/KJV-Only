type KjvOnlyCacheConfig = Readonly<{
  cachePrefix: string;
  cacheName: string;
}>;

declare global {
  // Global configuration is initialized by the classic cache-config script.
  var KJV_ONLY_CACHE_CONFIG: KjvOnlyCacheConfig | undefined;

  interface Window {
    KJV_ONLY_CACHE_CONFIG?: KjvOnlyCacheConfig;
  }
}

export {};
