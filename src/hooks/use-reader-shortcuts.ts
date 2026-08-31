import { useCallback, useMemo, type Dispatch, type SetStateAction } from "react"

import { useKeyboardShortcutDispatcher } from "@/hooks/use-keyboard-shortcuts"
import { collectLeafIds, findLeafNode } from "@/lib/reader-layout"
import type { LeafNeighbors } from "@/lib/reader-neighbors"
import type {
  LeafNode,
  PanelDirection,
  ReaderTab,
} from "@/types/reader"
import type { ShortcutBindings } from "@/lib/keyboard-shortcut-runtime"

type LeafLocationPatch = Partial<
  Pick<
    LeafNode,
    "bookIndex" | "chapterIndex" | "view" | "pickerTestament" | "pickerBookIndex"
  >
>

type UseReaderShortcutsParams = {
  bindings: ShortcutBindings
  tabs: ReaderTab[]
  activeTab: ReaderTab | null
  activeTabId: string | null
  activePanelLeafId: string | null
  setActiveTabId: Dispatch<SetStateAction<string | null>>
  onOpenReference: () => void
  onOpenSearch: () => void
  sidebarAvailable: boolean
  isSidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
  onOpenShortcutSettings: () => void
  onAddTab: () => void
  onCloseTab: (tabId: string) => void
  onRenameTab: (tabId: string) => void
  onMoveTab: (tabId: string, direction: -1 | 1) => void
  onMoveChapter: (leafId: string, direction: -1 | 1) => void
  onUpdateLeafLocation: (leafId: string, patch: LeafLocationPatch) => void
  onSplitLeaf: (leafId: string, direction: PanelDirection) => void
  onCloseLeaf: (leafId: string) => void
  onToggleFullscreenLeaf: (leafId: string) => Promise<void>
  canGoHistoryBack: (leafId: string) => boolean
  canGoHistoryForward: (leafId: string) => boolean
  onGoHistoryBack: (leafId: string) => void
  onGoHistoryForward: (leafId: string) => void
  onToggleGroupOrientation: (leafId: string) => void
  onOpenPanelMenu: (leafId: string) => void
  onMoveLeafToNewTab: (leafId: string) => void
  panelNeighborsForLeaf: (leafId: string) => LeafNeighbors
  onFocusPanel: (leafId: string) => void
  onMoveLeaf: (leafId: string, direction: PanelDirection) => void
  onInsertPanelInGroup: (leafId: string, direction: PanelDirection) => void
  onAddAroundGroup: (leafId: string, direction: PanelDirection) => void
  onToggleHighlightMode: (leafId: string) => void
  onClearHighlights: (leafId: string) => void
  onBookmarkChapter: (bookIndex: number, chapterIndex: number) => void
  onBookmarkSelection: (leafId: string) => void
  highlightedVerseRangesByLeafId: Record<
    string,
    Array<{ start: number; end: number }>
  >
}

export function useReaderShortcuts({
  bindings,
  tabs,
  activeTab,
  activeTabId,
  activePanelLeafId,
  setActiveTabId,
  onOpenReference,
  onOpenSearch,
  sidebarAvailable,
  isSidebarOpen,
  onSidebarOpenChange,
  onOpenShortcutSettings,
  onAddTab,
  onCloseTab,
  onRenameTab,
  onMoveTab,
  onMoveChapter,
  onUpdateLeafLocation,
  onSplitLeaf,
  onCloseLeaf,
  onToggleFullscreenLeaf,
  canGoHistoryBack,
  canGoHistoryForward,
  onGoHistoryBack,
  onGoHistoryForward,
  onToggleGroupOrientation,
  onOpenPanelMenu,
  onMoveLeafToNewTab,
  panelNeighborsForLeaf,
  onFocusPanel,
  onMoveLeaf,
  onInsertPanelInGroup,
  onAddAroundGroup,
  onToggleHighlightMode,
  onClearHighlights,
  onBookmarkChapter,
  onBookmarkSelection,
  highlightedVerseRangesByLeafId,
}: UseReaderShortcutsParams) {
  const activeLeaf = useMemo(() => {
    if (!activeTab) return null
    if (activePanelLeafId) {
      const selected = findLeafNode(activeTab.root, activePanelLeafId)
      if (selected) return selected
    }
    const firstLeafId = collectLeafIds(activeTab.root)[0]
    return firstLeafId ? findLeafNode(activeTab.root, firstLeafId) : null
  }, [activePanelLeafId, activeTab])

  const activateRelativeTab = useCallback(
    (step: -1 | 1) => {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId)
      if (currentIndex < 0 || tabs.length < 2) return
      const nextIndex = (currentIndex + step + tabs.length) % tabs.length
      setActiveTabId(tabs[nextIndex].id)
    },
    [activeTabId, setActiveTabId, tabs],
  )

  const withActiveLeaf = (callback: (leaf: LeafNode) => void) => {
    if (activeLeaf) callback(activeLeaf)
  }
  const withActiveReaderLeaf = (callback: (leaf: LeafNode) => void) => {
    if (activeLeaf?.view === "reader") callback(activeLeaf)
  }
  const dismissTopLayer = () => {
    const target =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : document.body
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    )
  }

  useKeyboardShortcutDispatcher(bindings, {
    "general.reference": onOpenReference,
    "general.search": onOpenSearch,
    "general.sidebar": () => {
      if (sidebarAvailable) onSidebarOpenChange(!isSidebarOpen)
    },
    "general.previousChapter": () =>
      withActiveReaderLeaf((leaf) => onMoveChapter(leaf.id, -1)),
    "general.nextChapter": () =>
      withActiveReaderLeaf((leaf) => onMoveChapter(leaf.id, 1)),
    "general.showShortcuts": onOpenShortcutSettings,
    "general.dismiss": dismissTopLayer,
    "tab.new": onAddTab,
    "tab.close": () => {
      if (activeTabId) onCloseTab(activeTabId)
    },
    "tab.rename": () => {
      if (activeTabId) onRenameTab(activeTabId)
    },
    "tab.previous": () => activateRelativeTab(-1),
    "tab.next": () => activateRelativeTab(1),
    "tab.movePrevious": () => {
      if (activeTabId) onMoveTab(activeTabId, -1)
    },
    "tab.moveNext": () => {
      if (activeTabId) onMoveTab(activeTabId, 1)
    },
    "panel.addRight": () =>
      withActiveLeaf((leaf) => onSplitLeaf(leaf.id, "right")),
    "panel.close": () => withActiveLeaf((leaf) => onCloseLeaf(leaf.id)),
    "panel.fullscreen": () =>
      withActiveLeaf((leaf) => void onToggleFullscreenLeaf(leaf.id)),
    "panel.home": () =>
      withActiveLeaf((leaf) => {
        onUpdateLeafLocation(leaf.id, {
          view: "picker",
          pickerTestament:
            leaf.pickerTestament ??
            (leaf.view === "reader" ? (leaf.bookIndex < 39 ? "old" : "new") : null),
          pickerBookIndex:
            leaf.pickerBookIndex ?? (leaf.view === "reader" ? leaf.bookIndex : null),
        })
      }),
    "panel.historyBack": () =>
      withActiveLeaf((leaf) => {
        if (canGoHistoryBack(leaf.id)) onGoHistoryBack(leaf.id)
      }),
    "panel.historyForward": () =>
      withActiveLeaf((leaf) => {
        if (canGoHistoryForward(leaf.id)) onGoHistoryForward(leaf.id)
      }),
    "panel.toggleOrientation": () =>
      withActiveLeaf((leaf) => onToggleGroupOrientation(leaf.id)),
    "panel.moveToTab": () =>
      withActiveLeaf((leaf) => onOpenPanelMenu(leaf.id)),
    "panel.moveToNewTab": () =>
      withActiveLeaf((leaf) => onMoveLeafToNewTab(leaf.id)),
    "panel.focusLeft": () =>
      withActiveLeaf((leaf) => {
        const neighbor = panelNeighborsForLeaf(leaf.id).left
        if (neighbor) onFocusPanel(neighbor)
      }),
    "panel.focusRight": () =>
      withActiveLeaf((leaf) => {
        const neighbor = panelNeighborsForLeaf(leaf.id).right
        if (neighbor) onFocusPanel(neighbor)
      }),
    "panel.focusUp": () =>
      withActiveLeaf((leaf) => {
        const neighbor = panelNeighborsForLeaf(leaf.id).up
        if (neighbor) onFocusPanel(neighbor)
      }),
    "panel.focusDown": () =>
      withActiveLeaf((leaf) => {
        const neighbor = panelNeighborsForLeaf(leaf.id).down
        if (neighbor) onFocusPanel(neighbor)
      }),
    "panel.splitLeft": () =>
      withActiveLeaf((leaf) => onSplitLeaf(leaf.id, "left")),
    "panel.splitRight": () =>
      withActiveLeaf((leaf) => onSplitLeaf(leaf.id, "right")),
    "panel.splitUp": () =>
      withActiveLeaf((leaf) => onSplitLeaf(leaf.id, "up")),
    "panel.splitDown": () =>
      withActiveLeaf((leaf) => onSplitLeaf(leaf.id, "down")),
    "panel.moveLeft": () => withActiveLeaf((leaf) => onMoveLeaf(leaf.id, "left")),
    "panel.moveRight": () =>
      withActiveLeaf((leaf) => onMoveLeaf(leaf.id, "right")),
    "panel.moveUp": () => withActiveLeaf((leaf) => onMoveLeaf(leaf.id, "up")),
    "panel.moveDown": () => withActiveLeaf((leaf) => onMoveLeaf(leaf.id, "down")),
    "panel.insertLeft": () =>
      withActiveLeaf((leaf) => onInsertPanelInGroup(leaf.id, "left")),
    "panel.insertRight": () =>
      withActiveLeaf((leaf) => onInsertPanelInGroup(leaf.id, "right")),
    "panel.insertUp": () =>
      withActiveLeaf((leaf) => onInsertPanelInGroup(leaf.id, "up")),
    "panel.insertDown": () =>
      withActiveLeaf((leaf) => onInsertPanelInGroup(leaf.id, "down")),
    "panel.aroundLeft": () =>
      withActiveLeaf((leaf) => onAddAroundGroup(leaf.id, "left")),
    "panel.aroundRight": () =>
      withActiveLeaf((leaf) => onAddAroundGroup(leaf.id, "right")),
    "panel.aroundUp": () =>
      withActiveLeaf((leaf) => onAddAroundGroup(leaf.id, "up")),
    "panel.aroundDown": () =>
      withActiveLeaf((leaf) => onAddAroundGroup(leaf.id, "down")),
    "reader.highlightMode": () =>
      withActiveReaderLeaf((leaf) => onToggleHighlightMode(leaf.id)),
    "reader.clearHighlights": () =>
      withActiveReaderLeaf((leaf) => onClearHighlights(leaf.id)),
    "reader.bookmarkChapter": () =>
      withActiveReaderLeaf((leaf) =>
        onBookmarkChapter(leaf.bookIndex, leaf.chapterIndex),
      ),
    "reader.bookmarkSelection": () =>
      withActiveReaderLeaf((leaf) => {
        if ((highlightedVerseRangesByLeafId[leaf.id]?.length ?? 0) > 0) {
          onBookmarkSelection(leaf.id)
        }
      }),
  })

  return activeLeaf?.id ?? null
}
