import { BLOCKED_URL, sanitizeUrl } from "@/lib/url-policy"

export { BLOCKED_URL, sanitizeUrl } from "@/lib/url-policy"

type OpenWindow = (
  url?: string | URL,
  target?: string,
  features?: string,
) => Window | null

export function openUrlInNewTab(
  url: string,
  openWindow: OpenWindow = window.open.bind(window),
) {
  const sanitizedUrl = sanitizeUrl(url)
  if (sanitizedUrl === BLOCKED_URL) {
    return false
  }

  const openedWindow = openWindow(
    sanitizedUrl,
    "_blank",
    "noopener,noreferrer",
  )
  if (openedWindow) {
    openedWindow.opener = null
  }
  return true
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
)
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  // Maybe show a dialog where they user can type the URL before inserting it.
  return url === "https://" || urlRegExp.test(url)
}
