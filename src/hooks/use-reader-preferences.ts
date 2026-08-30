import { useEffect, useRef, useState } from "react"

import {
  READER_STORAGE_KEYS,
  readLocalStorageJson,
  readLocalStorageValue,
  reportLocalStorageIssue,
  writeLocalStorageJson,
  writeLocalStorageValue,
} from "@/lib/local-storage"
import {
  isReaderDisplaySettingsPayload,
  parseReaderDisplaySettings,
  type ReaderDisplaySettings,
} from "@/lib/reader-persistence"
import type { TabsOrientation } from "@/types/reader"

type UseReaderPreferencesOptions = {
  tabsOrientation: TabsOrientation
  setTabsOrientation: (orientation: TabsOrientation) => void
}

export function useReaderPreferences({
  tabsOrientation,
  setTabsOrientation,
}: UseReaderPreferencesOptions) {
  const initialSettingsRef = useRef<ReaderDisplaySettings | null>(null)
  if (initialSettingsRef.current === null) {
    const storedSettings = readLocalStorageJson<unknown>(
      READER_STORAGE_KEYS.displaySettings,
    )
    if (
      storedSettings !== null &&
      !isReaderDisplaySettingsPayload(storedSettings)
    ) {
      reportLocalStorageIssue(READER_STORAGE_KEYS.displaySettings)
    }
    initialSettingsRef.current = parseReaderDisplaySettings(storedSettings)
  }
  const initialSettings = initialSettingsRef.current
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    readLocalStorageValue(READER_STORAGE_KEYS.theme) === "dark" ? "dark" : "light",
  )
  const [readerColorTheme, setReaderColorTheme] = useState(
    initialSettings.readerColorTheme,
  )
  const [fontSize, setFontSize] = useState(initialSettings.fontSize)
  const [lightHighlightColor, setLightHighlightColor] = useState(
    initialSettings.lightHighlightColor,
  )
  const [darkHighlightColor, setDarkHighlightColor] = useState(
    initialSettings.darkHighlightColor,
  )
  const [verseSpacing, setVerseSpacing] = useState(initialSettings.verseSpacing)
  const [contextVerseCount, setContextVerseCount] = useState(
    initialSettings.contextVerseCount,
  )
  const [toolReferenceDisplayMode, setToolReferenceDisplayMode] = useState(
    initialSettings.toolReferenceDisplayMode,
  )
  const [hideReadModeVerseNumbers, setHideReadModeVerseNumbers] = useState(
    initialSettings.hideReadModeVerseNumbers,
  )
  const [readModeParagraphIndent, setReadModeParagraphIndent] = useState(
    initialSettings.readModeParagraphIndent,
  )
  const [flowVersesByParagraph, setFlowVersesByParagraph] = useState(
    initialSettings.flowVersesByParagraph,
  )
  const [showWelcomeHomeAtStartup, setShowWelcomeHomeAtStartup] = useState(
    initialSettings.showWelcomeHomeAtStartup,
  )
  const [wordVerseSelectionTarget, setWordVerseSelectionTarget] = useState(
    initialSettings.wordVerseSelectionTarget,
  )
  const [notesLinkOpenTarget, setNotesLinkOpenTarget] = useState(
    initialSettings.notesLinkOpenTarget,
  )
  const [searchResultOpenTarget, setSearchResultOpenTarget] = useState(
    initialSettings.searchResultOpenTarget,
  )
  const [bookmarkOpenTarget, setBookmarkOpenTarget] = useState(
    initialSettings.bookmarkOpenTarget,
  )
  const [referenceLinkOpenTarget, setReferenceLinkOpenTarget] = useState(
    initialSettings.referenceLinkOpenTarget,
  )
  const didMountSettingsRef = useRef(false)

  useEffect(() => {
    if (initialSettings.tabsOrientation) {
      setTabsOrientation(initialSettings.tabsOrientation)
    }
  }, [initialSettings, setTabsOrientation])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    writeLocalStorageValue(READER_STORAGE_KEYS.theme, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.readerTheme = readerColorTheme
  }, [readerColorTheme])

  useEffect(() => {
    if (!didMountSettingsRef.current) {
      didMountSettingsRef.current = true
      return
    }
    writeLocalStorageJson(READER_STORAGE_KEYS.displaySettings, {
      readerColorTheme,
      fontSize,
      lightHighlightColor,
      darkHighlightColor,
      verseSpacing,
      contextVerseCount,
      toolReferenceDisplayMode,
      hideReadModeVerseNumbers,
      readModeParagraphIndent,
      flowVersesByParagraph,
      showWelcomeHomeAtStartup,
      tabsOrientation,
      wordVerseSelectionTarget,
      notesLinkOpenTarget,
      searchResultOpenTarget,
      bookmarkOpenTarget,
      referenceLinkOpenTarget,
    })
  }, [
    readerColorTheme,
    fontSize,
    lightHighlightColor,
    darkHighlightColor,
    verseSpacing,
    contextVerseCount,
    toolReferenceDisplayMode,
    hideReadModeVerseNumbers,
    readModeParagraphIndent,
    flowVersesByParagraph,
    showWelcomeHomeAtStartup,
    tabsOrientation,
    wordVerseSelectionTarget,
    notesLinkOpenTarget,
    searchResultOpenTarget,
    bookmarkOpenTarget,
    referenceLinkOpenTarget,
  ])

  return {
    theme,
    setTheme,
    readerColorTheme,
    setReaderColorTheme,
    fontSize,
    setFontSize,
    lightHighlightColor,
    setLightHighlightColor,
    darkHighlightColor,
    setDarkHighlightColor,
    verseSpacing,
    setVerseSpacing,
    contextVerseCount,
    setContextVerseCount,
    toolReferenceDisplayMode,
    setToolReferenceDisplayMode,
    hideReadModeVerseNumbers,
    setHideReadModeVerseNumbers,
    readModeParagraphIndent,
    setReadModeParagraphIndent,
    flowVersesByParagraph,
    setFlowVersesByParagraph,
    showWelcomeHomeAtStartup,
    setShowWelcomeHomeAtStartup,
    wordVerseSelectionTarget,
    setWordVerseSelectionTarget,
    notesLinkOpenTarget,
    setNotesLinkOpenTarget,
    searchResultOpenTarget,
    setSearchResultOpenTarget,
    bookmarkOpenTarget,
    setBookmarkOpenTarget,
    referenceLinkOpenTarget,
    setReferenceLinkOpenTarget,
  }
}
