import {
  shortcutBindingStartsWith,
  type ShortcutActionId,
  type ShortcutBindings,
} from "@/lib/keyboard-shortcut-runtime"

export * from "@/lib/keyboard-shortcut-runtime"

export const SHORTCUT_CATEGORIES = [
  "General",
  "Tabs",
  "Panels",
  "Panel layout",
  "Reader panel",
] as const

export type ShortcutCategory = (typeof SHORTCUT_CATEGORIES)[number]

export type ShortcutDefinition = {
  id: string
  label: string
  description: string
  category: ShortcutCategory
  defaultBinding: readonly string[]
}

const shortcut = <const Id extends string>(
  id: Id,
  label: string,
  description: string,
  category: ShortcutCategory,
  ...defaultBinding: string[]
): ShortcutDefinition & { id: Id } => ({
  id,
  label,
  description,
  category,
  defaultBinding,
})

export const SHORTCUT_DEFINITIONS = [
  shortcut("general.reference", "Open reference command", "Open a Bible reference or app command.", "General", "Mod+K"),
  shortcut("general.search", "Open Search", "Open a new Search tab.", "General", "/"),
  shortcut("general.sidebar", "Toggle sidebar", "Open or close the study sidebar.", "General", "Mod+\\"),
  shortcut("general.previousChapter", "Previous chapter", "Go to the previous chapter in the active reader panel.", "General", "["),
  shortcut("general.nextChapter", "Next chapter", "Go to the next chapter in the active reader panel.", "General", "]"),
  shortcut("general.saveNote", "Save active note", "Save changes in the active Notes panel.", "General", "Mod+Enter"),
  shortcut("general.showShortcuts", "Show keyboard shortcuts", "Open Settings directly to this Shortcuts tab.", "General", "Shift+/"),
  shortcut("general.dismiss", "Dismiss or cancel", "Close the top menu or dialog, or cancel a pending shortcut chord.", "General", "Escape"),

  shortcut("tab.new", "New tab", "Add a new workspace tab.", "Tabs", "T", "N"),
  shortcut("tab.close", "Close active tab", "Close the active workspace tab when another tab remains.", "Tabs", "T", "C"),
  shortcut("tab.rename", "Relabel active tab", "Open the relabel dialog for the active tab.", "Tabs", "T", "R"),
  shortcut("tab.previous", "Previous tab", "Activate the previous workspace tab.", "Tabs", "G", "["),
  shortcut("tab.next", "Next tab", "Activate the next workspace tab.", "Tabs", "G", "]"),
  shortcut("tab.movePrevious", "Move active tab backward", "Move the active tab left or up.", "Tabs", "T", "["),
  shortcut("tab.moveNext", "Move active tab forward", "Move the active tab right or down.", "Tabs", "T", "]"),

  shortcut("panel.addRight", "Add panel to the right", "Split the active panel and add a panel on its right.", "Panels", "P", "N"),
  shortcut("panel.close", "Close active panel", "Close the active panel when the tab has more than one panel.", "Panels", "P", "C"),
  shortcut("panel.fullscreen", "Toggle panel full screen", "Enter or exit full screen for the active panel.", "Panels", "P", "F"),
  shortcut("panel.home", "Panel Home", "Open the book picker in the active panel.", "Panels", "P", "H"),
  shortcut("panel.historyBack", "Panel history back", "Go back in the active panel's navigation history.", "Panels", "P", "["),
  shortcut("panel.historyForward", "Panel history forward", "Go forward in the active panel's navigation history.", "Panels", "P", "]"),
  shortcut("panel.toggleOrientation", "Toggle group orientation", "Switch the active panel group's horizontal or vertical orientation.", "Panels", "P", "O"),
  shortcut("panel.moveToTab", "Move panel to an existing tab", "Open the active panel menu to choose an existing tab.", "Panels", "P", "T"),
  shortcut("panel.moveToNewTab", "Move panel to a new tab", "Move the active panel into a new workspace tab.", "Panels", "P", "Shift+T"),
  shortcut("panel.focusLeft", "Focus panel to the left", "Make the neighboring panel to the left active.", "Panels", "Alt+ArrowLeft"),
  shortcut("panel.focusRight", "Focus panel to the right", "Make the neighboring panel to the right active.", "Panels", "Alt+ArrowRight"),
  shortcut("panel.focusUp", "Focus panel above", "Make the neighboring panel above active.", "Panels", "Alt+ArrowUp"),
  shortcut("panel.focusDown", "Focus panel below", "Make the neighboring panel below active.", "Panels", "Alt+ArrowDown"),

  shortcut("panel.splitLeft", "Split panel left", "Add a panel to the left of the active panel.", "Panel layout", "P", "S", "ArrowLeft"),
  shortcut("panel.splitRight", "Split panel right", "Add a panel to the right of the active panel.", "Panel layout", "P", "S", "ArrowRight"),
  shortcut("panel.splitUp", "Split panel above", "Add a panel above the active panel.", "Panel layout", "P", "S", "ArrowUp"),
  shortcut("panel.splitDown", "Split panel below", "Add a panel below the active panel.", "Panel layout", "P", "S", "ArrowDown"),
  shortcut("panel.moveLeft", "Move panel left", "Swap the active panel with its left neighbor.", "Panel layout", "P", "M", "ArrowLeft"),
  shortcut("panel.moveRight", "Move panel right", "Swap the active panel with its right neighbor.", "Panel layout", "P", "M", "ArrowRight"),
  shortcut("panel.moveUp", "Move panel up", "Swap the active panel with its upper neighbor.", "Panel layout", "P", "M", "ArrowUp"),
  shortcut("panel.moveDown", "Move panel down", "Swap the active panel with its lower neighbor.", "Panel layout", "P", "M", "ArrowDown"),
  shortcut("panel.insertLeft", "Insert panel left in group", "Insert a panel to the left within the current group.", "Panel layout", "P", "I", "ArrowLeft"),
  shortcut("panel.insertRight", "Insert panel right in group", "Insert a panel to the right within the current group.", "Panel layout", "P", "I", "ArrowRight"),
  shortcut("panel.insertUp", "Insert panel above in group", "Insert a panel above within the current group.", "Panel layout", "P", "I", "ArrowUp"),
  shortcut("panel.insertDown", "Insert panel below in group", "Insert a panel below within the current group.", "Panel layout", "P", "I", "ArrowDown"),
  shortcut("panel.aroundLeft", "Add panel left around group", "Add a panel to the left of the current group.", "Panel layout", "P", "A", "ArrowLeft"),
  shortcut("panel.aroundRight", "Add panel right around group", "Add a panel to the right of the current group.", "Panel layout", "P", "A", "ArrowRight"),
  shortcut("panel.aroundUp", "Add panel above group", "Add a panel above the current group.", "Panel layout", "P", "A", "ArrowUp"),
  shortcut("panel.aroundDown", "Add panel below group", "Add a panel below the current group.", "Panel layout", "P", "A", "ArrowDown"),

  shortcut("reader.highlightMode", "Toggle highlight mode", "Turn highlight selection on or off in the active reader panel.", "Reader panel", "P", "L"),
  shortcut("reader.clearHighlights", "Clear panel highlights", "Clear selected verse highlights in the active reader panel.", "Reader panel", "P", "X"),
  shortcut("reader.bookmarkChapter", "Bookmark current chapter", "Bookmark the chapter shown in the active reader panel.", "Reader panel", "P", "B"),
  shortcut("reader.bookmarkSelection", "Bookmark highlighted verses", "Bookmark highlighted verses in the active reader panel.", "Reader panel", "P", "Shift+B"),
] as const satisfies readonly ShortcutDefinition[]

const DEFINITION_BY_ID = new Map(
  SHORTCUT_DEFINITIONS.map((definition) => [definition.id, definition]),
)

export function shortcutDefinition(actionId: ShortcutActionId) {
  return DEFINITION_BY_ID.get(actionId) as (typeof SHORTCUT_DEFINITIONS)[number]
}

export function findShortcutConflict(
  bindings: ShortcutBindings,
  actionId: ShortcutActionId,
  candidate: readonly string[] | null,
) {
  if (!candidate) return null
  for (const definition of SHORTCUT_DEFINITIONS) {
    if (definition.id === actionId) continue
    const binding = bindings[definition.id]
    if (!binding) continue
    if (
      shortcutBindingStartsWith(binding, candidate) ||
      shortcutBindingStartsWith(candidate, binding)
    ) {
      return definition
    }
  }
  return null
}

const DISPLAY_KEY: Readonly<Record<string, string>> = {
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",
  Backspace: "Backspace",
  Delete: "Delete",
  Enter: "Enter",
  Space: "Space",
}

export function formatShortcutStroke(stroke: string, isMac = false) {
  return stroke
    .split("+")
    .map((part) => {
      if (part === "Mod") return isMac ? "⌘" : "Ctrl"
      if (part === "Alt") return isMac ? "⌥" : "Alt"
      if (part === "Shift") return isMac ? "⇧" : "Shift"
      return DISPLAY_KEY[part] ?? part
    })
    .join(isMac ? "" : "+")
}
