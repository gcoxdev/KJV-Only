import { useCallback, useEffect, useRef, useState } from "react"

import {
  defaultShortcutBindings,
  isEditableShortcutTarget,
  parseShortcutBindings,
  shortcutBindingStartsWith,
  shortcutStrokeFromKeyboardEvent,
  type ShortcutActionId,
  type ShortcutBinding,
  type ShortcutBindings,
} from "@/lib/keyboard-shortcut-runtime"
import {
  READER_STORAGE_KEYS,
  readLocalStorageJson,
  reportLocalStorageIssue,
  writeLocalStorageJson,
} from "@/lib/local-storage"

export function useShortcutPreferences() {
  const [bindings, setBindings] = useState<ShortcutBindings>(() => {
    const stored = readLocalStorageJson<unknown>(READER_STORAGE_KEYS.shortcuts)
    return parseShortcutBindings(stored)
  })
  const didMountRef = useRef(false)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    writeLocalStorageJson(READER_STORAGE_KEYS.shortcuts, bindings)
  }, [bindings])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== READER_STORAGE_KEYS.shortcuts) return
      if (event.newValue === null) {
        setBindings(defaultShortcutBindings())
        return
      }
      try {
        setBindings(parseShortcutBindings(JSON.parse(event.newValue)))
      } catch {
        reportLocalStorageIssue(READER_STORAGE_KEYS.shortcuts)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const setBinding = useCallback(
    (actionId: ShortcutActionId, binding: ShortcutBinding) => {
      setBindings((current) => ({
        ...current,
        [actionId]: binding ? [...binding] : null,
      }))
    },
    [],
  )

  const resetBinding = useCallback((actionId: ShortcutActionId) => {
    const defaults = defaultShortcutBindings()
    setBindings((current) => ({
      ...current,
      [actionId]: defaults[actionId],
    }))
  }, [])

  const resetAllBindings = useCallback(() => {
    setBindings(defaultShortcutBindings())
  }, [])

  return { bindings, setBinding, resetBinding, resetAllBindings }
}

type ShortcutHandlers = Partial<Record<ShortcutActionId, () => void>>

export function useKeyboardShortcutDispatcher(
  bindings: ShortcutBindings,
  handlers: ShortcutHandlers,
) {
  const handlersRef = useRef(handlers)
  const pendingSequenceRef = useRef<string[]>([])
  const timeoutRef = useRef<number | null>(null)
  handlersRef.current = handlers

  useEffect(() => {
    const clearPending = () => {
      pendingSequenceRef.current = []
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const matchSequence = (sequence: string[]) =>
      Object.entries(handlersRef.current).filter(([actionId]) => {
        const binding = bindings[actionId as ShortcutActionId]
        return Boolean(binding && shortcutBindingStartsWith(binding, sequence))
      }) as Array<[ShortcutActionId, () => void]>

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || !event.isTrusted) return
      if (event.key === "Escape" && pendingSequenceRef.current.length > 0) {
        clearPending()
        return
      }
      if (isEditableShortcutTarget(event.target)) return

      const stroke = shortcutStrokeFromKeyboardEvent(event)
      if (!stroke) return

      let sequence = [...pendingSequenceRef.current, stroke]
      let matches = matchSequence(sequence)
      if (matches.length === 0 && pendingSequenceRef.current.length > 0) {
        clearPending()
        sequence = [stroke]
        matches = matchSequence(sequence)
      }
      if (matches.length === 0) return

      event.preventDefault()
      const exact = matches.find(([actionId]) => {
        const binding = bindings[actionId]
        return binding?.length === sequence.length
      })
      if (exact) {
        clearPending()
        exact[1]()
        return
      }

      pendingSequenceRef.current = sequence
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(clearPending, 1_200)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      clearPending()
    }
  }, [bindings])
}
