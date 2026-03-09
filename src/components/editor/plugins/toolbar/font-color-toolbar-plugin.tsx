import { useCallback, useState } from "react"
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
} from "@lexical/selection"
import { $getSelection, $isRangeSelection } from "lexical"
import type { BaseSelection } from "lexical"
import { BaselineIcon } from "lucide-react"

import { useToolbarContext } from "@/components/editor/context/toolbar-context"
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function normalizeHexColor(value: string): string {
  const trimmed = value.trim()

  if (/^#[\da-fA-F]{6}$/.test(trimmed)) {
    return trimmed
  }

  if (/^#[\da-fA-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }

  const rgb = trimmed.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*[\d.]+\s*)?\)$/i
  )
  if (rgb) {
    const toHex = (channel: string) =>
      Math.max(0, Math.min(255, Number(channel)))
        .toString(16)
        .padStart(2, "0")
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`
  }

  return "#000000"
}

export function FontColorToolbarPlugin() {
  const { activeEditor } = useToolbarContext()

  const [fontColor, setFontColor] = useState("#000000")

  const $updateToolbar = (selection: BaseSelection) => {
    if ($isRangeSelection(selection)) {
      const nextColor = normalizeHexColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000000")
      )
      setFontColor((prev) => (prev === nextColor ? prev : nextColor))
    }
  }

  useUpdateToolbarHandler($updateToolbar)

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection()
        if (selection !== null) {
          $patchStyleText(selection, styles)
        }
      })
    },
    [activeEditor]
  )

  const onFontColorSelect = useCallback(
    (value: string) => {
      const nextColor = normalizeHexColor(value)
      setFontColor((prev) => (prev === nextColor ? prev : nextColor))
      applyStyleText({ color: nextColor })
    },
    [applyStyleText]
  )

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon-sm" aria-label="Font color">
        <BaselineIcon className="size-4" />
      </Button>
      <Input
        type="color"
        value={fontColor}
        onChange={(event) => onFontColorSelect(event.target.value)}
        className="h-8 w-10 p-1"
        aria-label="Pick font color"
      />
    </div>
  )
}
