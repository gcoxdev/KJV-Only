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
  ProgressValue,
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
      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="size-4 text-muted-foreground" />
            Install the app on this device
          </CardTitle>
          <CardDescription>
            Install adds the app shell. Offline content downloads are managed separately below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
            <p className="text-xs leading-5 text-muted-foreground">
              {isPwaInstalled
                ? "Already installed on this device."
                : canInstallPwa
                  ? "Install is available in this browser."
                  : "This browser has not exposed an install prompt for this session. On Android or Brave, use the browser menu and choose Install app or Add to Home screen."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/70">
        <CardHeader>
          <CardTitle>Offline Storage</CardTitle>
          <CardDescription>
            Download the content bundles you want available without a network connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            {storageEstimate
              ? `Using ${formatOfflineBytes(storageEstimate.usage)} of ${formatOfflineBytes(storageEstimate.quota)} available browser storage.`
              : "Browser storage usage is not available in this environment."}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            Each bundle below can now be downloaded, refreshed, or cleared separately.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {bundleDefinitions.map((bundle) => {
          const status = bundleStatuses[bundle.id];
          const percent =
            status.total > 0 ? Math.round((status.cached / status.total) * 100) : 0;
          const downloadPercent =
            status.total > 0 ? Math.round((status.completed / status.total) * 100) : 0;
          const Icon = bundle.icon;
          const isReady = bundle.urls.length > 0;

          return (
            <Card key={bundle.id} className="border-border/70 bg-card/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  {bundle.title}
                </CardTitle>
                <CardDescription>{bundle.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>{bundle.sizeLabel}</span>
                  <span>
                    {status.cached}/{status.total} files cached
                  </span>
                </div>
                <Progress value={status.downloading ? downloadPercent : percent}>
                  <ProgressLabel>
                    {status.downloading ? "Downloading" : "Cached"}
                  </ProgressLabel>
                  <ProgressValue>
                    {status.downloading ? `${downloadPercent}%` : `${percent}%`}
                  </ProgressValue>
                </Progress>
                {status.error ? (
                  <p className="text-xs text-destructive">{status.error}</p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant={status.cached === status.total && status.total > 0 ? "outline" : "default"}
                    disabled={!isReady || activeBundleId !== null || clearingBundleId !== null}
                    onClick={() => {
                      void runBundleDownload(bundle, false);
                    }}
                  >
                    {status.cached === status.total && status.total > 0
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
                  {!isReady ? (
                    <p className="text-xs text-muted-foreground">Preparing asset list…</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
