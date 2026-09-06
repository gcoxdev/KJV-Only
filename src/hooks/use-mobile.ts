import * as React from "react"

const MOBILE_BREAKPOINT = 768
// Keep touch phones in the same overlay layout when rotated to landscape.
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px), (max-height: ${MOBILE_BREAKPOINT - 1}px) and (pointer: coarse)`

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => {
      setIsMobile(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
