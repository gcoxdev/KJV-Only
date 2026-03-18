import {
  LexicalComposer,
} from "@lexical/react/LexicalComposer"
import type { InitialConfigType } from "@lexical/react/LexicalComposer"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import type { EditorState, LexicalEditor, SerializedEditorState } from "lexical"

import { editorTheme } from "@/components/editor/themes/editor-theme"
import { isInternalNoteLink } from "@/lib/note-links"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Book } from "@/types/bible"
import type { BookmarkScope } from "@/types/bookmarks"
import type { NotesContext } from "@/types/notes"

import { nodes } from "./nodes"
import { Plugins } from "./plugins"

const editorConfig: InitialConfigType = {
  namespace: "EditorV2",
  theme: editorTheme,
  nodes,
  onError: (error: Error) => {
    console.error(error)
  },
}

export function Editor({
  editorState,
  editorSerializedState,
  readOnly = false,
  showToolbar = true,
  autoFocus = true,
  onChange,
  onSerializedChange,
  internalLinking,
  onInternalLinkClick,
  onEditorReady,
}: {
  editorState?: EditorState
  editorSerializedState?: SerializedEditorState
  readOnly?: boolean
  showToolbar?: boolean
  autoFocus?: boolean
  onChange?: (editorState: EditorState) => void
  onSerializedChange?: (editorSerializedState: SerializedEditorState) => void
  internalLinking?: {
    books: Book[]
    mode: "notes"
    context: NotesContext | null
    highlightScope: BookmarkScope | null
  } | null
  onInternalLinkClick?: (href: string) => void
  onEditorReady?: (editor: LexicalEditor) => void
}) {
  return (
    <div
      className="bg-background flex h-full min-h-0 flex-col overflow-hidden rounded-lg border shadow"
      onClickCapture={(event) => {
        if (!readOnly || !onInternalLinkClick) {
          return
        }
        const target = event.target
        if (!(target instanceof HTMLElement)) {
          return
        }
        const anchor = target.closest("a")
        const href = anchor?.getAttribute("href")
        if (!href || !isInternalNoteLink(href)) {
          return
        }
        event.preventDefault()
        event.stopPropagation()
        onInternalLinkClick(href)
      }}
    >
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editable: !readOnly,
          ...(editorState ? { editorState } : {}),
          ...(editorSerializedState
            ? { editorState: JSON.stringify(editorSerializedState) }
            : {}),
        }}
      >
        <TooltipProvider>
          <Plugins
            showToolbar={showToolbar && !readOnly}
            autoFocus={autoFocus}
            internalLinking={internalLinking}
            onEditorReady={onEditorReady}
          />

          <OnChangePlugin
            ignoreSelectionChange={true}
            onChange={(editorState) => {
              onChange?.(editorState)
              onSerializedChange?.(editorState.toJSON())
            }}
          />
        </TooltipProvider>
      </LexicalComposer>
    </div>
  )
}
