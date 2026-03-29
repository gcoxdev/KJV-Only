import { useCallback, useEffect, useMemo, useState } from "react";

import {
  AudioLinesIcon,
  DownloadIcon,
  HardDriveDownloadIcon,
  MapIcon,
  RotateCwIcon,
  Trash2Icon,
} from "lucide-react";

import type { Book } from "@/types/bible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import { bookCodeForIndex } from "@/lib/reader-view";
import {
  GENEALOGY_ASSET_VERSION,
  STRONGS_ASSET_VERSION,
  loadAncientMap,
} from "@/lib/reader-data";
import {
  CORE_OFFLINE_URLS,
  deleteOfflineAssetBatch,
  downloadOfflineAssetBatch,
  formatOfflineBytes,
  getCachedOfflineAssetKeys,
} from "@/lib/offline-downloads";

type DownloadPageProps = {
  books: Book[];
  canInstallPwa?: boolean;
  isPwaInstalled?: boolean;
  onInstallPwa?: () => void | Promise<void>;
};

type BundleId = "core" | "maps" | "audio-ot" | "audio-nt";

type BundleDefinition = {
  id: BundleId;
  title: string;
  description: string;
  icon: typeof HardDriveDownloadIcon;
  urls: string[];
  sizeLabel: string;
};

type BundleStatus = {
  total: number;
  cached: number;
  completed: number;
  downloading: boolean;
  error: string | null;
};

const CORE_SIZE_LABEL = "~91 MB";
const MAPS_SIZE_LABEL = "~97 MB";
const OT_AUDIO_SIZE_LABEL = "~559 MB";
const NT_AUDIO_SIZE_LABEL = "~174 MB";

function bundleCachedPercent(status: BundleStatus) {
  return status.total > 0 ? Math.round((status.cached / status.total) * 100) : 0;
}

function bundleDownloadPercent(status: BundleStatus) {
  return status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;
}

function bundleStatusLabel(status: BundleStatus) {
  if (status.downloading) {
    return "Downloading";
  }
  if (status.cached === 0) {
    return "Not downloaded";
  }
  if (status.cached >= status.total && status.total > 0) {
    return "Fully cached";
  }
  return "Partially cached";
}

function buildAudioUrls(books: Book[], range: "old" | "new") {
  const startIndex = range === "old" ? 0 : 39;
  const endIndex = range === "old" ? 39 : books.length;
  const urls: string[] = [];

  for (let bookIndex = startIndex; bookIndex < endIndex; bookIndex += 1) {
    const book = books[bookIndex];
    const code = bookCodeForIndex(bookIndex);
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      urls.push(`/audio/${code}.${chapterIndex + 1}.mp3`);
    }
  }

  return urls;
}

export function DownloadPage({
  books,
  canInstallPwa = false,
  isPwaInstalled = false,
  onInstallPwa,
}: DownloadPageProps) {
  const [mapUrls, setMapUrls] = useState<string[] | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{
    usage: number;
    quota: number;
  } | null>(null);
  const [bundleStatuses, setBundleStatuses] = useState<Record<BundleId, BundleStatus>>({
    core: { total: 0, cached: 0, completed: 0, downloading: false, error: null },
    maps: { total: 0, cached: 0, completed: 0, downloading: false, error: null },
    "audio-ot": { total: 0, cached: 0, completed: 0, downloading: false, error: null },
    "audio-nt": { total: 0, cached: 0, completed: 0, downloading: false, error: null },
  });
  const [activeBundleId, setActiveBundleId] = useState<BundleId | null>(null);
  const [clearingBundleId, setClearingBundleId] = useState<BundleId | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadAncientMap().then((entries) => {
      if (cancelled) {
        return;
      }
      const geometryUrls = Array.from(
        new Set(entries.map((entry) => `/maps/geometry/${entry.geojson_file}`)),
      );
      setMapUrls(["/maps/data/map.json", ...geometryUrls]);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const bundleDefinitions = useMemo<BundleDefinition[]>(() => {
    const definitions: BundleDefinition[] = [
      {
        id: "core",
        title: "Core Bible Data",
        description:
          "Bible text, concordance, cross references, dictionaries, genealogy, and the app shell needed for offline study.",
        icon: HardDriveDownloadIcon,
        urls: [
          ...CORE_OFFLINE_URLS,
          `/references/genealogy.compact.min.json?v=${GENEALOGY_ASSET_VERSION}`,
          `/references/strongs-greek.compact.min.json?v=${STRONGS_ASSET_VERSION}`,
          `/references/strongs-hebrew.compact.min.json?v=${STRONGS_ASSET_VERSION}`,
        ],
        sizeLabel: CORE_SIZE_LABEL,
      },
      {
        id: "maps",
        title: "Maps",
        description:
          "Map index plus referenced GeoJSON geometry for offline place and geography lookup.",
        icon: MapIcon,
        urls: mapUrls ?? [],
        sizeLabel: MAPS_SIZE_LABEL,
      },
      {
        id: "audio-ot",
        title: "Old Testament Audio",
        description: "All Old Testament chapter audio files for offline playback.",
        icon: AudioLinesIcon,
        urls: buildAudioUrls(books, "old"),
        sizeLabel: OT_AUDIO_SIZE_LABEL,
      },
      {
        id: "audio-nt",
        title: "New Testament Audio",
        description: "All New Testament chapter audio files for offline playback.",
        icon: AudioLinesIcon,
        urls: buildAudioUrls(books, "new"),
        sizeLabel: NT_AUDIO_SIZE_LABEL,
      },
    ];

    return definitions;
  }, [books, mapUrls]);

  const totalCachedFiles = useMemo(
    () =>
      Object.values(bundleStatuses).reduce((count, status) => count + status.cached, 0),
    [bundleStatuses],
  );

  const totalBundleFiles = useMemo(
    () =>
      Object.values(bundleStatuses).reduce((count, status) => count + status.total, 0),
    [bundleStatuses],
  );

  const refreshStorageEstimate = useCallback(async () => {
    if (!("storage" in navigator) || typeof navigator.storage.estimate !== "function") {
      setStorageEstimate(null);
      return;
    }

    const estimate = await navigator.storage.estimate();
    setStorageEstimate({
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
    });
  }, []);

  const refreshBundleStatuses = useCallback(async () => {
    const cachedKeys = await getCachedOfflineAssetKeys();
    setBundleStatuses((current) => {
      const next = { ...current };
      for (const bundle of bundleDefinitions) {
        const cached = bundle.urls.reduce((count, url) => {
          const normalized = new URL(url, window.location.origin);
          return count + Number(cachedKeys.has(`${normalized.pathname}${normalized.search}`));
        }, 0);
        next[bundle.id] = {
          ...next[bundle.id],
          total: bundle.urls.length,
          cached,
          completed: next[bundle.id].downloading ? next[bundle.id].completed : cached,
        };
      }
      return next;
    });
  }, [bundleDefinitions]);

  useEffect(() => {
    void refreshBundleStatuses();
    void refreshStorageEstimate();
  }, [refreshBundleStatuses, refreshStorageEstimate]);

  const runBundleDownload = useCallback(
    async (bundle: BundleDefinition, forceRefresh = false) => {
      if (bundle.urls.length === 0 || activeBundleId !== null || clearingBundleId !== null) {
        return;
      }

      setActiveBundleId(bundle.id);
      setBundleStatuses((current) => ({
        ...current,
        [bundle.id]: {
          ...current[bundle.id],
          total: bundle.urls.length,
          completed: 0,
          downloading: true,
          error: null,
        },
      }));

      const { failures } = await downloadOfflineAssetBatch(
        bundle.urls,
        { forceRefresh },
        (completed, total) => {
          setBundleStatuses((current) => ({
            ...current,
            [bundle.id]: {
              ...current[bundle.id],
              total,
              completed,
              downloading: true,
              error: null,
            },
          }));
        },
      );

      setBundleStatuses((current) => ({
        ...current,
        [bundle.id]: {
          ...current[bundle.id],
          downloading: false,
          error:
            failures.length > 0
              ? `${failures.length} file${failures.length === 1 ? "" : "s"} failed.`
              : null,
        },
      }));
      setActiveBundleId(null);
      await refreshBundleStatuses();
      await refreshStorageEstimate();
    },
    [activeBundleId, clearingBundleId, refreshBundleStatuses, refreshStorageEstimate],
  );

  const clearBundleCache = useCallback(async (bundle: BundleDefinition) => {
    if (activeBundleId !== null || clearingBundleId !== null) {
      return;
    }

    setClearingBundleId(bundle.id);
    try {
      await deleteOfflineAssetBatch(bundle.urls);
      setBundleStatuses((current) => ({
        ...current,
        [bundle.id]: {
          ...current[bundle.id],
          cached: 0,
          completed: 0,
          downloading: false,
          error: null,
        },
      }));
      await refreshBundleStatuses();
      await refreshStorageEstimate();
    } finally {
      setClearingBundleId(null);
    }
  }, [activeBundleId, clearingBundleId, refreshBundleStatuses, refreshStorageEstimate]);

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <DownloadIcon className="size-4 text-muted-foreground" />
            Install the app on this device
          </CardTitle>
          <CardDescription>
            Installing adds the app shell to this device. Bible data, maps, and audio are managed separately below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={!canInstallPwa || isPwaInstalled}
              onClick={() => {
                void onInstallPwa?.();
              }}
            >
              Install App
            </Button>
            <Badge variant="outline" className="font-normal">
              {isPwaInstalled
                ? "Installed"
                : canInstallPwa
                  ? "Ready to install"
                  : "Prompt unavailable"}
            </Badge>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
              {isPwaInstalled
                ? "Already installed on this device."
                : canInstallPwa
                  ? "Install is available in this browser."
                  : "This browser has not exposed an install prompt for this session. On Android or Brave, use the browser menu and choose Install app or Add to Home screen."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Offline Library</CardTitle>
          <CardDescription>
            Download only the bundles you want available without a network connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Browser Storage
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {storageEstimate
                ? `Using ${formatOfflineBytes(storageEstimate.usage)} of ${formatOfflineBytes(storageEstimate.quota)} available browser storage.`
                : "Browser storage usage is not available in this environment."}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Cached Files
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {totalCachedFiles}
            </p>
            <p className="text-sm text-muted-foreground">
              of {totalBundleFiles} known files currently cached
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Bundle Actions
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use download for first-time caching, check for missing files to fill gaps, refresh to replace cached files, and clear to free space.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {bundleDefinitions.map((bundle) => {
          const status = bundleStatuses[bundle.id];
          const percent = bundleCachedPercent(status);
          const downloadPercent = bundleDownloadPercent(status);
          const Icon = bundle.icon;
          const isReady = bundle.urls.length > 0;
          const statusLabel = bundleStatusLabel(status);
          const isFullyCached = status.cached === status.total && status.total > 0;

          return (
            <Card key={bundle.id} className="border-border/70 bg-card/70 shadow-sm">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Icon className="size-4 text-muted-foreground" />
                      {bundle.title}
                    </CardTitle>
                    <CardDescription>{bundle.description}</CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={isFullyCached ? "default" : "outline"}>
                      {statusLabel}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      {bundle.sizeLabel}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Cached
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {status.cached}/{status.total}
                    </p>
                    <p className="text-xs">files available offline</p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Current State
                    </p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {status.downloading ? `${downloadPercent}%` : `${percent}%`}
                    </p>
                    <p className="text-xs">
                      {status.downloading ? "download progress" : "cache coverage"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-background/50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Refresh Path
                    </p>
                    <p className="mt-1 text-sm leading-6">
                      {isFullyCached
                        ? "Check for missing files to fill gaps or refresh to replace cached copies."
                        : "Download the bundle first, then use refresh later when you want to replace cached copies."}
                    </p>
                  </div>
                </div>
                <Progress value={status.downloading ? downloadPercent : percent}>
                  <ProgressLabel>
                    {status.downloading ? "Downloading" : "Cached"}
                  </ProgressLabel>
                  <span className="ml-auto text-sm text-muted-foreground tabular-nums">
                    {status.downloading ? `${downloadPercent}%` : `${percent}%`}
                  </span>
                </Progress>
                {status.error ? (
                  <p className="text-xs text-destructive">{status.error}</p>
                ) : null}
                {!isReady ? (
                  <p className="text-xs text-muted-foreground">Preparing asset list…</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant={isFullyCached ? "outline" : "default"}
                    disabled={!isReady || activeBundleId !== null || clearingBundleId !== null}
                    onClick={() => {
                      void runBundleDownload(bundle, false);
                    }}
                  >
                    {isFullyCached
                      ? "Check for Missing Files"
                      : `Download ${bundle.title}`}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isReady || activeBundleId !== null || clearingBundleId !== null}
                    onClick={() => {
                      void runBundleDownload(bundle, true);
                    }}
                  >
                    <RotateCwIcon />
                    Refresh Bundle
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!isReady || activeBundleId !== null || clearingBundleId !== null}
                    onClick={() => {
                      void clearBundleCache(bundle);
                    }}
                  >
                    <Trash2Icon />
                    {clearingBundleId === bundle.id ? "Clearing..." : "Clear Bundle"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
