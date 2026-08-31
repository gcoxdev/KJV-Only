export const DEFAULT_SHORTCUT_BINDINGS = {
  "general.reference": ["Mod+K"],
  "general.search": ["/"],
  "general.sidebar": ["Mod+\\"],
  "general.previousChapter": ["["],
  "general.nextChapter": ["]"],
  "general.saveNote": ["Mod+Enter"],
  "general.showShortcuts": ["Shift+/"],
  "general.dismiss": ["Escape"],
  "tab.new": ["T", "N"],
  "tab.close": ["T", "C"],
  "tab.rename": ["T", "R"],
  "tab.previous": ["G", "["],
  "tab.next": ["G", "]"],
  "tab.movePrevious": ["T", "["],
  "tab.moveNext": ["T", "]"],
  "panel.addRight": ["P", "N"],
  "panel.close": ["P", "C"],
  "panel.fullscreen": ["P", "F"],
  "panel.home": ["P", "H"],
  "panel.historyBack": ["P", "["],
  "panel.historyForward": ["P", "]"],
  "panel.toggleOrientation": ["P", "O"],
  "panel.moveToTab": ["P", "T"],
  "panel.moveToNewTab": ["P", "Shift+T"],
  "panel.focusLeft": ["Alt+ArrowLeft"],
  "panel.focusRight": ["Alt+ArrowRight"],
  "panel.focusUp": ["Alt+ArrowUp"],
  "panel.focusDown": ["Alt+ArrowDown"],
  "panel.splitLeft": ["P", "S", "ArrowLeft"],
  "panel.splitRight": ["P", "S", "ArrowRight"],
  "panel.splitUp": ["P", "S", "ArrowUp"],
  "panel.splitDown": ["P", "S", "ArrowDown"],
  "panel.moveLeft": ["P", "M", "ArrowLeft"],
  "panel.moveRight": ["P", "M", "ArrowRight"],
  "panel.moveUp": ["P", "M", "ArrowUp"],
  "panel.moveDown": ["P", "M", "ArrowDown"],
  "panel.insertLeft": ["P", "I", "ArrowLeft"],
  "panel.insertRight": ["P", "I", "ArrowRight"],
  "panel.insertUp": ["P", "I", "ArrowUp"],
  "panel.insertDown": ["P", "I", "ArrowDown"],
  "panel.aroundLeft": ["P", "A", "ArrowLeft"],
  "panel.aroundRight": ["P", "A", "ArrowRight"],
  "panel.aroundUp": ["P", "A", "ArrowUp"],
  "panel.aroundDown": ["P", "A", "ArrowDown"],
  "reader.highlightMode": ["P", "L"],
  "reader.clearHighlights": ["P", "X"],
  "reader.bookmarkChapter": ["P", "B"],
  "reader.bookmarkSelection": ["P", "Shift+B"],
} as const satisfies Record<string, readonly string[]>

export type ShortcutActionId = keyof typeof DEFAULT_SHORTCUT_BINDINGS
export type ShortcutBinding = string[] | null
export type ShortcutBindings = Record<ShortcutActionId, ShortcutBinding>

const CODE_KEYS: Readonly<Record<string, string>> = {
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  Backquote: "`",
  Backslash: "\\",
  BracketLeft: "[",
  BracketRight: "]",
  Comma: ",",
  Equal: "=",
  Minus: "-",
  Period: ".",
  Semicolon: ";",
  Slash: "/",
  Space: "Space",
}

const NAMED_KEYS = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Backspace",
  "Delete",
  "End",
  "Enter",
  "Escape",
  "Home",
  "PageDown",
  "PageUp",
  "Space",
])

function normalizeKeyName(key: string) {
  if (key.length === 1) return /^[a-z]$/i.test(key) ? key.toUpperCase() : key
  if (NAMED_KEYS.has(key)) return key
  return /^F(?:[1-9]|1[0-2])$/.test(key) ? key : null
}

export function shortcutStrokeFromKeyboardEvent(event: KeyboardEvent) {
  if (["Alt", "Control", "Meta", "Shift"].includes(event.key)) return null
  const key = CODE_KEYS[event.code] ?? normalizeKeyName(event.key)
  if (!key) return null
  const parts: string[] = []
  if (event.ctrlKey || event.metaKey) parts.push("Mod")
  if (event.altKey) parts.push("Alt")
  if (event.shiftKey) parts.push("Shift")
  parts.push(key)
  return parts.join("+")
}

export function defaultShortcutBindings(): ShortcutBindings {
  return Object.fromEntries(
    Object.entries(DEFAULT_SHORTCUT_BINDINGS).map(([id, binding]) => [
      id,
      [...binding],
    ]),
  ) as ShortcutBindings
}

function isShortcutStroke(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 40) {
    return false
  }
  const parts = value.split("+")
  const key = parts.at(-1)
  if (!key || normalizeKeyName(key) === null) return false
  const modifiers = parts.slice(0, -1)
  return (
    new Set(modifiers).size === modifiers.length &&
    modifiers.every((part) => part === "Mod" || part === "Alt" || part === "Shift")
  )
}

export function shortcutStrokeHasCommandModifier(stroke: string) {
  const parts = stroke.split("+")
  return parts.includes("Mod") || parts.includes("Alt")
}

export function parseShortcutBindings(value: unknown): ShortcutBindings {
  const bindings = defaultShortcutBindings()
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return bindings
  }
  for (const actionId of Object.keys(DEFAULT_SHORTCUT_BINDINGS) as ShortcutActionId[]) {
    if (!(actionId in value)) continue
    const stored = (value as Record<string, unknown>)[actionId]
    if (stored === null) {
      bindings[actionId] = null
    } else if (
      Array.isArray(stored) &&
      stored.length > 0 &&
      stored.length <= 3 &&
      stored.every(isShortcutStroke) &&
      (actionId !== "general.saveNote" ||
        shortcutStrokeHasCommandModifier(stored[0]))
    ) {
      bindings[actionId] = [...stored]
    }
  }
  return bindings
}

export function shortcutBindingEquals(
  left: readonly string[] | null,
  right: readonly string[] | null,
) {
  return (
    left === right ||
    (left !== null &&
      right !== null &&
      left.length === right.length &&
      left.every((stroke, index) => stroke === right[index]))
  )
}

export function shortcutBindingStartsWith(
  binding: readonly string[],
  sequence: readonly string[],
) {
  return (
    sequence.length <= binding.length &&
    sequence.every((stroke, index) => binding[index] === stroke)
  )
}

export function isEditableShortcutTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("input, textarea, select, [contenteditable='true']") !== null)
  )
}
