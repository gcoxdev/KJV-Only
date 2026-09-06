import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export async function buildOfflineInventory(root: string, urls: string[]) {
  const assets: Record<string, { bytes: number; sha256: string }> = {};
  const pending = [...new Set(urls)].sort();
  // Bound memory while avoiding thousands of sequential file-open round trips.
  await Promise.all(Array.from({ length: Math.min(8, pending.length) }, async () => {
    for (;;) {
      const url = pending.pop();
      if (url === undefined) return;
      const hash = createHash("sha256");
      let bytes = 0;
      for await (const chunk of createReadStream(path.join(root, url), { highWaterMark: 1024 * 1024 })) {
        bytes += chunk.length;
        hash.update(chunk);
      }
      assets[url] = { bytes, sha256: hash.digest("hex") };
    }
  }));
  if (assets["/index.html"]) assets["/"] = assets["/index.html"];
  let mapUrls: string[] | undefined;
  if (assets["/maps/data/map.json"]) {
    const entries: Array<{ geojson_file: string }> = JSON.parse(await fs.readFile(path.join(root, "maps/data/map.json"), "utf8"));
    mapUrls = ["/maps/data/map.json", ...new Set(entries.map((entry) => `/maps/geometry/${entry.geojson_file}`))].sort();
    if (mapUrls.some((url) => !assets[url])) throw new Error("Map index references an asset missing from the offline inventory");
  }
  return { schemaVersion: 1 as const, mapUrls, assets: Object.fromEntries(Object.entries(assets).sort(([a], [b]) => a.localeCompare(b))) };
}

export async function writeOfflineInventory(root: string, urls: string[]) {
  const inventory = await buildOfflineInventory(root, urls);
  await fs.writeFile(path.join(root, "offline-inventory.json"), JSON.stringify(inventory));
}
