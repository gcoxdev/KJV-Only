const SUPPORTED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "kjv:",
  "mailto:",
  "sms:",
  "tel:",
]);

const URL_SCHEME = /^([a-z][a-z\d+.-]*):/i;

function hasControlCharacters(value: string) {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0x1f || codePoint === 0x7f;
  });
}

export const BLOCKED_URL = "about:blank";

export function sanitizeUrl(url: string): string {
  const normalized = url.trim();
  if (!normalized || hasControlCharacters(normalized)) {
    return BLOCKED_URL;
  }

  const scheme = normalized.match(URL_SCHEME)?.[1]?.toLowerCase();
  if (scheme && !SUPPORTED_URL_PROTOCOLS.has(`${scheme}:`)) {
    return BLOCKED_URL;
  }

  return normalized;
}

export function isSafeUrl(url: string) {
  return sanitizeUrl(url) !== BLOCKED_URL;
}
