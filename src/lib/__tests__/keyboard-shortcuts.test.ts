import { describe, expect, it } from "vitest"

import {
  SHORTCUT_DEFINITIONS,
  defaultShortcutBindings,
  findShortcutConflict,
  formatShortcutStroke,
  parseShortcutBindings,
  shortcutBindingEquals,
  shortcutBindingStartsWith,
} from "@/lib/keyboard-shortcuts"

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
})
