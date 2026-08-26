import { afterEach, describe, expect, it, vi } from "vitest";

import {
  CORE_OFFLINE_URLS,
  buildAudioUrls,
  deleteOfflineAssetBatch,
  loadCoreOfflineUrls,
  parseAppShellAssetManifest,
} from "@/lib/offline-downloads";
import type { Book } from "@/types/bible";

function book(name: string, chapterCount: number): Book {
  return {
    name,
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      chapter: index + 1,
      verses: [],
    })),
  };
}

describe("buildAudioUrls", () => {
  it("builds available Old Testament URLs from a partial bootstrap corpus", () => {
    expect(buildAudioUrls([book("Genesis", 2)], "old")).toEqual([
      "/audio/GEN.1.mp3",
      "/audio/GEN.2.mp3",
    ]);
  });

  it("does not treat a partial Old Testament corpus as New Testament data", () => {
    expect(buildAudioUrls([book("Genesis", 1)], "new")).toEqual([]);
  });

  it("keeps the canonical testament boundary for a full corpus", () => {
    const books = Array.from({ length: 40 }, (_, index) =>
      book(`Book ${index + 1}`, 1),
    );

    expect(buildAudioUrls(books, "old")).toHaveLength(39);
    expect(buildAudioUrls(books, "new")).toEqual(["/audio/MAT.1.mp3"]);
  });
});

describe("app-shell offline manifest", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts a bounded same-origin asset manifest", () => {
    expect(
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: ["/assets/index-abc.js"],
        assets: ["/assets/index-abc.js", "/assets/chunks/tool-def.css"],
        offlineIconAssets: [
          "/icons/bw/GEN.png",
          "/icons/color/GEN.png",
        ],
      }),
    ).toEqual({
      schemaVersion: 1,
      startupAssets: ["/assets/index-abc.js"],
      assets: ["/assets/index-abc.js", "/assets/chunks/tool-def.css"],
      offlineIconAssets: [
        "/icons/bw/GEN.png",
        "/icons/color/GEN.png",
      ],
    });
  });

  it("keeps older manifests valid while treating their icon list as empty", () => {
    expect(
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: ["/assets/index-abc.js"],
        assets: ["/assets/index-abc.js"],
      }),
    ).toEqual({
      schemaVersion: 1,
      startupAssets: ["/assets/index-abc.js"],
      assets: ["/assets/index-abc.js"],
      offlineIconAssets: [],
    });
  });

  it("rejects unsafe, duplicate, or unrelated startup assets", () => {
    expect(() =>
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: [],
        assets: ["/assets/../secret.js"],
      }),
    ).toThrow("Invalid app-shell asset manifest");
    expect(() =>
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: [],
        assets: ["/assets/a.js", "/assets/a.js"],
      }),
    ).toThrow("Invalid app-shell asset manifest");
    expect(() =>
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: ["/assets/start.js"],
        assets: ["/assets/lazy.js"],
      }),
    ).toThrow("Invalid app-shell startup asset");
    expect(() =>
      parseAppShellAssetManifest({
        schemaVersion: 1,
        startupAssets: [],
        assets: [],
        offlineIconAssets: ["/icons/color/../private.png"],
      }),
    ).toThrow("Invalid app-shell asset manifest");
  });

  it("expands the core package with every generated asset", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          schemaVersion: 1,
          startupAssets: ["/assets/index-abc.js"],
          assets: ["/assets/index-abc.js", "/assets/index-def.css"],
          offlineIconAssets: [
            "/icons/bw/GEN.png",
            "/icons/color/GEN.png",
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadCoreOfflineUrls()).resolves.toEqual([
      ...CORE_OFFLINE_URLS,
      "/assets/index-abc.js",
      "/assets/index-def.css",
      "/icons/bw/GEN.png",
      "/icons/color/GEN.png",
    ]);
    expect(fetchMock).toHaveBeenCalledWith("/app-shell-assets.json", {
      cache: "no-cache",
    });
  });

  it("fails closed when the production manifest is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    );

    await expect(loadCoreOfflineUrls()).rejects.toThrow(
      "Could not load app-shell assets (HTTP 503)",
    );
  });

  it("deletes owned assets regardless of cached Vary headers", async () => {
    const deleteMock = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("window", { location: { origin: "https://reader.test" } });
    vi.stubGlobal("caches", {
      open: vi.fn().mockResolvedValue({ delete: deleteMock }),
    });

    await deleteOfflineAssetBatch(["/data/kjv.json?v=1"]);

    expect(deleteMock).toHaveBeenCalledWith(
      "https://reader.test/data/kjv.json?v=1",
      { ignoreSearch: false, ignoreVary: true },
    );
  });
});
