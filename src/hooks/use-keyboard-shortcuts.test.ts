import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const reactHarness = vi.hoisted(() => ({
  cleanups: [] as Array<() => void>,
}))

vi.mock("react", () => ({
  useCallback: <T,>(callback: T) => callback,
  useEffect: (effect: () => void | (() => void)) => {
    const cleanup = effect()
    if (cleanup) reactHarness.cleanups.push(cleanup)
  },
  useRef: <T,>(initialValue: T) => ({ current: initialValue }),
  useState: <T,>(initialValue: T | (() => T)) => [
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue,
    vi.fn(),
  ],
}))

import { useKeyboardShortcutDispatcher } from "@/hooks/use-keyboard-shortcuts"
import { defaultShortcutBindings } from "@/lib/keyboard-shortcuts"

type KeydownListener = (event: KeyboardEvent) => void

const keyboardEvent = (
  overrides: Partial<KeyboardEvent> = {},
): KeyboardEvent =>
  ({
    key: "x",
    code: "KeyX",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    defaultPrevented: false,
    isComposing: false,
    isTrusted: true,
    target: null,
    preventDefault: vi.fn(),
    ...overrides,
  }) as KeyboardEvent

describe("useKeyboardShortcutDispatcher", () => {
  let keydownListener: KeydownListener | null
  let removeEventListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    keydownListener = null
    removeEventListener = vi.fn()
    vi.stubGlobal(
      "HTMLElement",
      class {
        isContentEditable = false
        closest() {
          return null
        }
      },
    )
    vi.stubGlobal("window", {
      addEventListener: vi.fn((type: string, listener: KeydownListener) => {
        if (type === "keydown") keydownListener = listener
      }),
      removeEventListener,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
    })
  })

  afterEach(() => {
    for (const cleanup of reactHarness.cleanups.splice(0)) cleanup()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  const dispatch = (event: KeyboardEvent) => {
    expect(keydownListener).not.toBeNull()
    keydownListener?.(event)
  }

  it("ignores handled, composing, synthetic, editable, and unsupported events", () => {
    const onSearch = vi.fn()
    useKeyboardShortcutDispatcher(defaultShortcutBindings(), {
      "general.search": onSearch,
    })

    dispatch(keyboardEvent({ key: "/", code: "Slash", defaultPrevented: true }))
    dispatch(keyboardEvent({ key: "/", code: "Slash", isComposing: true }))
    dispatch(keyboardEvent({ key: "/", code: "Slash", isTrusted: false }))
    dispatch(keyboardEvent({ key: "Alt", code: "AltLeft" }))
    dispatch(keyboardEvent({ key: "q", code: "KeyQ" }))

    expect(onSearch).not.toHaveBeenCalled()
  })

  it("runs exact shortcuts and multi-stroke chords", () => {
    const onSearch = vi.fn()
    const onNewTab = vi.fn()
    useKeyboardShortcutDispatcher(defaultShortcutBindings(), {
      "general.search": onSearch,
      "tab.new": onNewTab,
    })

    const searchEvent = keyboardEvent({ key: "/", code: "Slash" })
    dispatch(searchEvent)
    expect(searchEvent.preventDefault).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledOnce()

    const chordStart = keyboardEvent({ key: "t", code: "KeyT" })
    const chordEnd = keyboardEvent({ key: "n", code: "KeyN" })
    dispatch(chordStart)
    dispatch(chordEnd)

    expect(chordStart.preventDefault).toHaveBeenCalledOnce()
    expect(chordEnd.preventDefault).toHaveBeenCalledOnce()
    expect(onNewTab).toHaveBeenCalledOnce()
  })

  it("retries a mismatched chord as a new shortcut", () => {
    const onSearch = vi.fn()
    const onNewTab = vi.fn()
    useKeyboardShortcutDispatcher(defaultShortcutBindings(), {
      "general.search": onSearch,
      "tab.new": onNewTab,
    })

    dispatch(keyboardEvent({ key: "t", code: "KeyT" }))
    dispatch(keyboardEvent({ key: "/", code: "Slash" }))

    expect(onNewTab).not.toHaveBeenCalled()
    expect(onSearch).toHaveBeenCalledOnce()
  })

  it("cancels pending chords with Escape, timeout, and cleanup", () => {
    const onNewTab = vi.fn()
    useKeyboardShortcutDispatcher(defaultShortcutBindings(), {
      "tab.new": onNewTab,
    })

    dispatch(keyboardEvent({ key: "t", code: "KeyT" }))
    dispatch(keyboardEvent({ key: "Escape", code: "Escape" }))
    dispatch(keyboardEvent({ key: "n", code: "KeyN" }))
    expect(onNewTab).not.toHaveBeenCalled()

    dispatch(keyboardEvent({ key: "t", code: "KeyT" }))
    vi.advanceTimersByTime(1_200)
    dispatch(keyboardEvent({ key: "n", code: "KeyN" }))
    expect(onNewTab).not.toHaveBeenCalled()

    const cleanup = reactHarness.cleanups.shift()
    cleanup?.()
    expect(removeEventListener).toHaveBeenCalledWith("keydown", keydownListener)
  })
})
