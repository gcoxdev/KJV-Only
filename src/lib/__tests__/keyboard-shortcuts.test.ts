import { afterEach, describe, expect, it, vi } from "vitest"

import {
  SHORTCUT_DEFINITIONS,
  defaultShortcutBindings,
  findShortcutConflict,
  formatShortcutStroke,
  isEditableShortcutTarget,
  parseShortcutBindings,
  shortcutBindingEquals,
  shortcutBindingStartsWith,
  shortcutStrokeFromKeyboardEvent,
  shortcutStrokeHasCommandModifier,
} from "@/lib/keyboard-shortcuts"

const keyboardEvent = (
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent =>
  ({
    key: "k",
    code: "KeyK",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  }) as KeyboardEvent

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("keyboard shortcuts", () => {
  it("provides a unique, conflict-free default for every action", () => {
    const defaults = defaultShortcutBindings()
    expect(Object.keys(defaults)).toHaveLength(SHORTCUT_DEFINITIONS.length)

    for (const definition of SHORTCUT_DEFINITIONS) {
      expect(defaults[definition.id]).toEqual(definition.defaultBinding)
      expect(findShortcutConflict(defaults, definition.id, defaults[definition.id])).toBeNull()
    }
  })

  it("preserves valid overrides and safely ignores malformed bindings", () => {
    const parsed = parseShortcutBindings({
      "general.search": ["Mod+Shift+F"],
      "tab.new": null,
      "tab.close": [],
      "panel.close": ["Invalid modifier+C"],
      "general.saveNote": ["S", "N"],
      unknown: ["Q"],
    })

    expect(parsed["general.search"]).toEqual(["Mod+Shift+F"])
    expect(parsed["tab.new"]).toBeNull()
    expect(parsed["tab.close"]).toEqual(["T", "C"])
    expect(parsed["panel.close"]).toEqual(["P", "C"])
    expect(parsed["general.saveNote"]).toEqual(["Mod+Enter"])
    expect(Object.hasOwn(parsed, "unknown")).toBe(false)
  })

  it("falls back to defaults for invalid preference containers and strokes", () => {
    const defaults = defaultShortcutBindings()

    expect(parseShortcutBindings(null)).toEqual(defaults)
    expect(parseShortcutBindings([])).toEqual(defaults)

    const parsed = parseShortcutBindings({
      "general.reference": [""],
      "general.search": ["F13"],
      "general.sidebar": ["Mod+Mod+K"],
      "tab.new": ["T", "N", "Enter", "Q"],
      "tab.close": [42],
      "general.saveNote": ["Alt+Enter"],
    })

    expect(parsed["general.reference"]).toEqual(defaults["general.reference"])
    expect(parsed["general.search"]).toEqual(defaults["general.search"])
    expect(parsed["general.sidebar"]).toEqual(defaults["general.sidebar"])
    expect(parsed["tab.new"]).toEqual(defaults["tab.new"])
    expect(parsed["tab.close"]).toEqual(defaults["tab.close"])
    expect(parsed["general.saveNote"]).toEqual(["Alt+Enter"])
  })

  it("fills newly introduced actions from defaults", () => {
    const parsed = parseShortcutBindings({ "general.search": ["F6"] })
    expect(parsed["general.search"]).toEqual(["F6"])
    expect(parsed["panel.focusRight"]).toEqual(["Alt+ArrowRight"])
    expect(parsed["panel.splitLeft"]).toEqual(["P", "S", "ArrowLeft"])
  })

  it("detects exact and prefix conflicts between chord bindings", () => {
    const bindings = defaultShortcutBindings()
    expect(
      findShortcutConflict(bindings, "general.search", ["T", "N"]),
    ).toHaveProperty("id", "tab.new")
    expect(
      findShortcutConflict(bindings, "general.search", ["P", "S"]),
    ).toHaveProperty("id", "panel.splitLeft")
    expect(findShortcutConflict(bindings, "general.search", ["F8"])).toBeNull()
    expect(shortcutBindingStartsWith(["P", "S", "ArrowLeft"], ["P", "S"])).toBe(true)
    expect(shortcutBindingEquals(["P", "S"], ["P", "S"])).toBe(true)
  })

  it("formats portable modifier and arrow labels", () => {
    expect(formatShortcutStroke("Mod+Shift+K", false)).toBe("Ctrl+Shift+K")
    expect(formatShortcutStroke("Mod+Shift+K", true)).toBe("⌘⇧K")
    expect(formatShortcutStroke("Alt+ArrowLeft", false)).toBe("Alt+←")
    expect(formatShortcutStroke("ArrowLeft", false)).toBe("←")
  })

  it("normalizes keyboard events into portable shortcut strokes", () => {
    expect(shortcutStrokeFromKeyboardEvent(keyboardEvent({ key: "Alt" }))).toBeNull()
    expect(
      shortcutStrokeFromKeyboardEvent(keyboardEvent({ key: "Dead", code: "Dead" })),
    ).toBeNull()
    expect(
      shortcutStrokeFromKeyboardEvent(
        keyboardEvent({ key: "?", code: "Slash", shiftKey: true }),
      ),
    ).toBe("Shift+/")
    expect(
      shortcutStrokeFromKeyboardEvent(
        keyboardEvent({ key: "k", ctrlKey: true, altKey: true, shiftKey: true }),
      ),
    ).toBe("Mod+Alt+Shift+K")
    expect(
      shortcutStrokeFromKeyboardEvent(
        keyboardEvent({ key: "k", metaKey: true }),
      ),
    ).toBe("Mod+K")
    expect(shortcutStrokeFromKeyboardEvent(keyboardEvent({ key: "F12" }))).toBe("F12")
    expect(shortcutStrokeFromKeyboardEvent(keyboardEvent({ key: "F13" }))).toBeNull()

    expect(shortcutStrokeHasCommandModifier("Mod+K")).toBe(true)
    expect(shortcutStrokeHasCommandModifier("Alt+ArrowLeft")).toBe(true)
    expect(shortcutStrokeHasCommandModifier("Shift+K")).toBe(false)
  })

  it("compares bindings across null, length, and content differences", () => {
    const binding = ["P", "S"]

    expect(shortcutBindingEquals(binding, binding)).toBe(true)
    expect(shortcutBindingEquals(null, null)).toBe(true)
    expect(shortcutBindingEquals(null, binding)).toBe(false)
    expect(shortcutBindingEquals(binding, ["P"])).toBe(false)
    expect(shortcutBindingEquals(binding, ["P", "M"])).toBe(false)
    expect(shortcutBindingStartsWith(["P"], ["P", "S"])).toBe(false)
    expect(shortcutBindingStartsWith(["P", "S"], ["P", "M"])).toBe(false)
  })

  it("recognizes editable shortcut targets without treating other elements as inputs", () => {
    class FakeHTMLElement {
      readonly isContentEditable: boolean
      private readonly insideEditableControl: boolean

      constructor(
        isContentEditable: boolean,
        insideEditableControl: boolean,
      ) {
        this.isContentEditable = isContentEditable
        this.insideEditableControl = insideEditableControl
      }

      closest() {
        return this.insideEditableControl ? this : null
      }
    }

    vi.stubGlobal("HTMLElement", FakeHTMLElement)

    expect(isEditableShortcutTarget(null)).toBe(false)
    expect(isEditableShortcutTarget({} as EventTarget)).toBe(false)
    expect(
      isEditableShortcutTarget(new FakeHTMLElement(true, false) as unknown as EventTarget),
    ).toBe(true)
    expect(
      isEditableShortcutTarget(new FakeHTMLElement(false, true) as unknown as EventTarget),
    ).toBe(true)
    expect(
      isEditableShortcutTarget(new FakeHTMLElement(false, false) as unknown as EventTarget),
    ).toBe(false)
  })
})
