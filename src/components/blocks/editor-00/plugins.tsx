import { useEffect, useState } from "react"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import type { LexicalEditor } from "lexical"

import { normalizeRangePoints } from "@/lib/bookmarks"
import { ContentEditable } from "@/components/editor/editor-ui/content-editable"
import { AutoLinkPlugin } from "@/components/editor/plugins/auto-link-plugin"
import { FloatingLinkEditorPlugin } from "@/components/editor/plugins/floating-link-editor-plugin"
import { LinkPlugin } from "@/components/editor/plugins/link-plugin"
import { ListMaxIndentLevelPlugin } from "@/components/editor/plugins/list-max-indent-level-plugin"
import { NoteLinkAutoLinkPlugin } from "@/components/editor/plugins/note-link-auto-link-plugin"
import { NoteLinkToolbarPlugin } from "@/components/editor/plugins/toolbar/note-link-toolbar-plugin"
import { ActionsPlugin } from "@/components/editor/plugins/actions/actions-plugin"
import { BlockFormatDropDown } from "@/components/editor/plugins/toolbar/block-format-toolbar-plugin"
import { FormatBulletedList } from "@/components/editor/plugins/toolbar/block-format/format-bulleted-list"
import { FormatCheckList } from "@/components/editor/plugins/toolbar/block-format/format-check-list"
import { FormatHeading } from "@/components/editor/plugins/toolbar/block-format/format-heading"
import { FormatNumberedList } from "@/components/editor/plugins/toolbar/block-format/format-numbered-list"
import { FormatParagraph } from "@/components/editor/plugins/toolbar/block-format/format-paragraph"
import { FormatQuote } from "@/components/editor/plugins/toolbar/block-format/format-quote"
import { ClearFormattingToolbarPlugin } from "@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin"
import { ElementFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/element-format-toolbar-plugin"
import { FontColorToolbarPlugin } from "@/components/editor/plugins/toolbar/font-color-toolbar-plugin"
import { FontFamilyToolbarPlugin } from "@/components/editor/plugins/toolbar/font-family-toolbar-plugin"
import { FontFormatToolbarPlugin } from "@/components/editor/plugins/toolbar/font-format-toolbar-plugin"
import { FontSizeToolbarPlugin } from "@/components/editor/plugins/toolbar/font-size-toolbar-plugin"
import { HistoryToolbarPlugin } from "@/components/editor/plugins/toolbar/history-toolbar-plugin"
import { LinkToolbarPlugin } from "@/components/editor/plugins/toolbar/link-toolbar-plugin"
import { SubSuperToolbarPlugin } from "@/components/editor/plugins/toolbar/subsuper-toolbar-plugin"
import { ToolbarPlugin } from "@/components/editor/plugins/toolbar/toolbar-plugin"
import { Separator } from "@/components/ui/separator"
import type { Book } from "@/types/bible"
import type { BookmarkScope } from "@/types/bookmarks"
import type { NotesContext, NoteLinkTarget } from "@/types/notes"

function EditorReadyPlugin({
  onEditorReady,
}: {
  onEditorReady?: (editor: LexicalEditor) => void
}) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    onEditorReady?.(editor)
  }, [editor, onEditorReady])

  return null
}

function noteLinkTargetFromContext(
  context: NotesContext | null,
  kind: "chapter" | "verse" | "word",
): NoteLinkTarget | null {
  if (!context) {
    return null
  }
  if (kind === "chapter") {
    return {
      type: "chapter",
      bookIndex: context.bookIndex,
      chapterIndex: context.chapterIndex,
    }
  }
  if (kind === "verse") {
    if (!context.verseNumber) {
      return null
    }
    return {
      type: "verse",
      bookIndex: context.bookIndex,
      chapterIndex: context.chapterIndex,
      verseNumber: context.verseNumber,
    }
  }
  if (!context.verseNumber || !context.word) {
    return null
  }
  return {
    type: "word",
    bookIndex: context.bookIndex,
    chapterIndex: context.chapterIndex,
    verseNumber: context.verseNumber,
    word: context.word,
  }
}

function noteLinkTargetFromHighlightScope(
  scope: BookmarkScope | null,
): NoteLinkTarget | null {
  if (!scope) {
    return null
  }
  if (scope.type === "verse") {
    return {
      type: "selection",
      bookIndex: scope.bookIndex,
      chapterIndex: scope.chapterIndex,
      ranges: [{ start: scope.verseNumber, end: scope.verseNumber }],
    }
  }
  if (scope.type === "selection") {
    return {
      type: "selection",
      bookIndex: scope.bookIndex,
      chapterIndex: scope.chapterIndex,
      ranges: scope.ranges,
    }
  }
  if (scope.type === "range") {
    const normalized = normalizeRangePoints(scope.start, scope.end)
    return {
      type: "range",
      start: normalized.start,
      end: normalized.end,
    }
  }
  return null
}

export function Plugins({
  showToolbar = true,
  autoFocus = true,
  internalLinking,
  onEditorReady,
}: {
  showToolbar?: boolean
  autoFocus?: boolean
  internalLinking?: {
    books: Book[]
    mode: "notes"
    context: NotesContext | null
    highlightScope: BookmarkScope | null
  } | null
  onEditorReady?: (editor: LexicalEditor) => void
}) {
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isLinkEditMode, setIsLinkEditMode] = useState(false)

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {/* toolbar plugins */}
      {showToolbar ? (
        <ToolbarPlugin>
          {() => (
            <div className="flex flex-wrap items-center gap-1 border-b p-2">
              <HistoryToolbarPlugin />
              <Separator orientation="vertical" className="h-6" />

              <BlockFormatDropDown>
                <FormatParagraph />
                <FormatHeading levels={["h1", "h2", "h3"]} />
                <FormatBulletedList />
                <FormatNumberedList />
                <FormatCheckList />
                <FormatQuote />
              </BlockFormatDropDown>

              <FontFamilyToolbarPlugin />
              <FontSizeToolbarPlugin />
              <FontFormatToolbarPlugin />
              <SubSuperToolbarPlugin />
              <FontColorToolbarPlugin />
              <ClearFormattingToolbarPlugin />
              <ElementFormatToolbarPlugin separator={false} />
              <LinkToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              {internalLinking?.mode === "notes" ? (
                <NoteLinkToolbarPlugin
                  books={internalLinking.books}
                  options={[
                    {
                      label: "Current Chapter",
                      target: noteLinkTargetFromContext(
                        internalLinking.context,
                        "chapter",
                      ),
                    },
                    {
                      label: "Current Verse",
                      target: noteLinkTargetFromContext(
                        internalLinking.context,
                        "verse",
                      ),
                    },
                    {
                      label: "Selected Word",
                      target: noteLinkTargetFromContext(
                        internalLinking.context,
                        "word",
                      ),
                    },
                    {
                      label: "Selected Verses",
                      target: noteLinkTargetFromHighlightScope(
                        internalLinking.highlightScope,
                      ),
                    },
                  ]}
                />
              ) : null}
            </div>
          )}
        </ToolbarPlugin>
      ) : null}

      <div className="relative min-h-0 flex-1">
        <RichTextPlugin
          contentEditable={
            <div className="h-full min-h-0">
              <div className="h-full min-h-0" ref={onRef}>
                <ContentEditable placeholder={"Start typing ..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* editor plugins */}
        {autoFocus ? <AutoFocusPlugin /> : null}
        <HistoryPlugin />
        <ListPlugin />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <LinkPlugin />
        {internalLinking?.mode === "notes" ? null : <AutoLinkPlugin />}
        {internalLinking?.mode === "notes" ? (
          <NoteLinkAutoLinkPlugin books={internalLinking.books} />
        ) : null}
        <EditorReadyPlugin onEditorReady={onEditorReady} />
        {showToolbar ? (
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        ) : null}
      </div>
      {/* actions plugins */}
      <ActionsPlugin>{null}</ActionsPlugin>
    </div>
  )
}
