import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  assertPublicResolvedAddresses,
  assertMapPhotoWriteBudget,
  fetchImageBuffer,
  isPrivateNetworkAddress,
  resolveSafeOutputTarget,
  validateDownloadUrl,
  writeFileAtomically,
} from "./map-photo-security.mjs";

const publicLookup = async () => [{ address: "208.80.154.240", family: 4 }];
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);

describe("map photo security boundaries", () => {
  it("allows only the expected HTTPS Wikimedia origin", () => {
    expect(
      validateDownloadUrl(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/image.jpg",
      ).hostname,
    ).toBe("upload.wikimedia.org");

    for (const value of [
      "http://upload.wikimedia.org/image.jpg",
      "https://user:pass@upload.wikimedia.org/image.jpg",
      "https://upload.wikimedia.org.evil.example/image.jpg",
      "https://127.0.0.1/image.jpg",
      "file:///etc/passwd",
    ]) {
      expect(() => validateDownloadUrl(value)).toThrow("not permitted");
    }
  });

  it("blocks private resolved addresses and redirect escapes", async () => {
    for (const address of [
      "127.0.0.1",
      "10.0.0.1",
      "169.254.169.254",
      "192.168.1.1",
      "::1",
      "fd00::1",
      "fe80::1",
    ]) {
      expect(isPrivateNetworkAddress(address)).toBe(true);
    }
    expect(isPrivateNetworkAddress("208.80.154.240")).toBe(false);
    await expect(
      assertPublicResolvedAddresses(
        new URL("https://upload.wikimedia.org/image.jpg"),
        async () => [{ address: "127.0.0.1", family: 4 }],
      ),
    ).rejects.toThrow("non-public address");

    await expect(
      fetchImageBuffer("https://upload.wikimedia.org/image.jpg", {
        lookupImpl: publicLookup,
        fetchImpl: async () =>
          new Response(null, {
            status: 302,
            headers: { location: "http://127.0.0.1/private" },
          }),
      }),
    ).rejects.toThrow("not permitted");
  });

  it("bounds image responses and accepts a valid control image", async () => {
    const valid = await fetchImageBuffer(
      "https://upload.wikimedia.org/image.jpg",
      {
        lookupImpl: publicLookup,
        fetchImpl: async () =>
          new Response(jpeg, { headers: { "content-type": "image/jpeg" } }),
      },
    );
    expect(valid).toEqual(jpeg);

    await expect(
      fetchImageBuffer("https://upload.wikimedia.org/image.jpg", {
        lookupImpl: publicLookup,
        maxBytes: 3,
        fetchImpl: async () =>
          new Response(jpeg, {
            headers: {
              "content-type": "image/jpeg",
              "content-length": String(jpeg.byteLength),
            },
          }),
      }),
    ).rejects.toThrow("exceeds");
  });

  it("contains output paths, rejects symlinks, and writes atomically", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "kjv-map-photo-test-"));
    try {
      await expect(resolveSafeOutputTarget(root, "../escape.jpg")).rejects.toThrow(
        "Unsafe thumbnail filename",
      );
      await expect(resolveSafeOutputTarget(root, "/tmp/escape.jpg")).rejects.toThrow(
        "Unsafe thumbnail filename",
      );

      const target = await resolveSafeOutputTarget(root, "location.image.jpg");
      await writeFileAtomically(target, jpeg);
      expect(await fs.readFile(target)).toEqual(jpeg);

      const symlink = path.join(root, "linked.image.jpg");
      await fs.symlink(target, symlink);
      await expect(resolveSafeOutputTarget(root, "linked.image.jpg")).rejects.toThrow(
        "symbolic link",
      );

      const externalRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), "kjv-map-photo-external-"),
      );
      const linkedRoot = path.join(root, "linked-root");
      await fs.symlink(externalRoot, linkedRoot);
      await expect(
        resolveSafeOutputTarget(linkedRoot, "location.image.jpg"),
      ).rejects.toThrow("real directory");
      await fs.rm(externalRoot, { recursive: true, force: true });
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("charges the batch budget for every filesystem target", () => {
    expect(assertMapPhotoWriteBudget(10, 20, 3)).toBe(70);
    expect(() =>
      assertMapPhotoWriteBudget(0, 1, 9),
    ).toThrow("Invalid map-photo write budget inputs");
    expect(() =>
      assertMapPhotoWriteBudget(2 * 1024 * 1024 * 1024 - 1, 1, 2),
    ).toThrow("batch limit");
  });
});
