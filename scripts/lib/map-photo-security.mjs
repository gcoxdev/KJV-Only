import { randomUUID } from "node:crypto";
import { lookup } from "node:dns/promises";
import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";

export const MAP_PHOTO_LIMITS = {
  maxCandidates: 5_000,
  maxTargetsPerCandidate: 8,
  maxRedirects: 5,
  maxResponseBytes: 20 * 1024 * 1024,
  maxBatchBytes: 2 * 1024 * 1024 * 1024,
  requestTimeoutMs: 30_000,
};

const ALLOWED_DOWNLOAD_HOSTS = new Set(["upload.wikimedia.org"]);
const SAFE_THUMBNAIL_FILE =
  /^[A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(?:jpe?g|png|webp)$/i;

export function validateDownloadUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !ALLOWED_DOWNLOAD_HOSTS.has(url.hostname) ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  ) {
    throw new Error(`Download URL is not permitted: ${url.toString()}`);
  }
  return url;
}

function isPrivateIpv4(address) {
  const [first, second] = address.split(".").map(Number);
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  );
}

export function isPrivateNetworkAddress(address) {
  const normalized = address.toLowerCase().split("%")[0];
  const family = net.isIP(normalized);
  if (family === 4) {
    return isPrivateIpv4(normalized);
  }
  if (family !== 6) {
    return true;
  }
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIpv4(normalized.slice("::ffff:".length));
  }
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    /^fe[89ab]/.test(normalized)
  );
}

export async function assertPublicResolvedAddresses(
  url,
  lookupImpl = lookup,
) {
  const addresses = await lookupImpl(url.hostname, {
    all: true,
    verbatim: true,
  });
  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateNetworkAddress(address))
  ) {
    throw new Error(`Download host resolved to a non-public address: ${url.hostname}`);
  }
}

function isSupportedImage(buffer) {
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
  const isWebp =
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return isJpeg || isPng || isWebp;
}

async function readBoundedImageResponse(response, maxBytes) {
  const contentType = response.headers.get("content-type")?.split(";", 1)[0];
  if (!contentType?.startsWith("image/")) {
    throw new Error(`Expected an image response, received ${contentType ?? "unknown"}`);
  }

  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new Error(`Image response exceeds the ${maxBytes}-byte limit`);
  }
  if (!response.body) {
    throw new Error("Image response did not include a body");
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel("Image response exceeded the byte limit");
        throw new Error(`Image response exceeds the ${maxBytes}-byte limit`);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = Buffer.concat(chunks, totalBytes);
  if (!isSupportedImage(buffer)) {
    throw new Error("Response body is not a supported JPEG, PNG, or WebP image");
  }
  return buffer;
}

export async function fetchImageBuffer(
  value,
  {
    fetchImpl = fetch,
    lookupImpl = lookup,
    maxBytes = MAP_PHOTO_LIMITS.maxResponseBytes,
    timeoutMs = MAP_PHOTO_LIMITS.requestTimeoutMs,
    maxRedirects = MAP_PHOTO_LIMITS.maxRedirects,
  } = {},
) {
  let url = validateDownloadUrl(value);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    await assertPublicResolvedAddresses(url, lookupImpl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        headers: { "user-agent": "kjv-only-map-photo-fetcher/1.0" },
        redirect: "manual",
        signal: controller.signal,
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location || redirectCount === maxRedirects) {
          throw new Error("Download exceeded the redirect limit");
        }
        url = validateDownloadUrl(new URL(location, url).toString());
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await readBoundedImageResponse(response, maxBytes);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Download exceeded the redirect limit");
}

export async function resolveSafeOutputTarget(outputDir, file) {
  if (
    typeof file !== "string" ||
    path.basename(file) !== file ||
    !SAFE_THUMBNAIL_FILE.test(file)
  ) {
    throw new Error(`Unsafe thumbnail filename: ${String(file)}`);
  }

  const requestedOutputRoot = path.resolve(outputDir);
  const outputStats = await fs.lstat(requestedOutputRoot);
  if (!outputStats.isDirectory() || outputStats.isSymbolicLink()) {
    throw new Error("Thumbnail output directory must be a real directory");
  }
  const outputRoot = await fs.realpath(requestedOutputRoot);
  if (outputRoot !== requestedOutputRoot) {
    throw new Error("Thumbnail output directory must not traverse symbolic links");
  }
  const target = path.resolve(outputRoot, file);
  const relative = path.relative(outputRoot, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Thumbnail target escapes the output directory: ${file}`);
  }

  try {
    const stats = await fs.lstat(target);
    if (stats.isSymbolicLink()) {
      throw new Error(`Thumbnail target must not be a symbolic link: ${file}`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  return target;
}

export function assertMapPhotoWriteBudget(
  writtenBytes,
  responseBytes,
  targetCount,
) {
  if (
    !Number.isSafeInteger(writtenBytes) ||
    writtenBytes < 0 ||
    !Number.isSafeInteger(responseBytes) ||
    responseBytes < 0 ||
    !Number.isSafeInteger(targetCount) ||
    targetCount < 1 ||
    targetCount > MAP_PHOTO_LIMITS.maxTargetsPerCandidate
  ) {
    throw new Error("Invalid map-photo write budget inputs");
  }
  const nextWrittenBytes = writtenBytes + responseBytes * targetCount;
  if (
    !Number.isSafeInteger(nextWrittenBytes) ||
    nextWrittenBytes > MAP_PHOTO_LIMITS.maxBatchBytes
  ) {
    throw new Error(
      `Map-photo writes exceeded the ${MAP_PHOTO_LIMITS.maxBatchBytes}-byte batch limit`,
    );
  }
  return nextWrittenBytes;
}

export async function writeFileAtomically(target, buffer) {
  const temporaryPath = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`,
  );
  try {
    await fs.writeFile(temporaryPath, buffer, { flag: "wx" });
    await fs.rename(temporaryPath, target);
  } finally {
    await fs.rm(temporaryPath, { force: true });
  }
}
