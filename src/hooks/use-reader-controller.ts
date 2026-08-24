import { useReadChapters } from "@/hooks/use-read-chapters"
import { useReaderPreferences } from "@/hooks/use-reader-preferences"
import type { TabsOrientation } from "@/types/reader"

type UseReaderControllerOptions = {
  tabsOrientation: TabsOrientation
  setTabsOrientation: (orientation: TabsOrientation) => void
}

/**
 * Stable façade for reader-wide state that crosses feature boundaries.
 * New controller-owned slices should be composed here instead of adding more
 * persistence or lifecycle policy directly to KJVReader.
 */
export function useReaderController(options: UseReaderControllerOptions) {
  return {
    preferences: useReaderPreferences(options),
    readingProgress: useReadChapters(),
  }
}
