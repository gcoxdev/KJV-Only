import { useCallback, useRef } from "react";
import { $createTextNode, $getSelection, $isRangeSelection, $setSelection, type BaseSelection } from "lexical";
import { Link2Icon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { $createKjvInternalLinkNode } from "@/components/editor/nodes/kjv-internal-link-node";
import { buildNoteLinkHref, formatNoteLinkLabel } from "@/lib/note-links";
import type { NoteLinkTarget } from "@/types/notes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Book } from "@/types/bible";

function applyInternalLink(
  target: NoteLinkTarget,
  books: Book[],
  activeEditor: ReturnType<typeof useToolbarContext>["activeEditor"],
  cachedSelection: BaseSelection | null,
) {
  activeEditor.focus();
  activeEditor.update(() => {
    const currentSelection = $getSelection();
    if (
      cachedSelection &&
      (!$isRangeSelection(currentSelection) || currentSelection.isCollapsed())
    ) {
      $setSelection(cachedSelection.clone());
    }

    const linkNode = $createKjvInternalLinkNode(buildNoteLinkHref(target));
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      linkNode.append($createTextNode(selection.getTextContent()));
      selection.insertNodes([linkNode]);
      return;
    }

    linkNode.append($createTextNode(formatNoteLinkLabel(target, books)));
    if ($isRangeSelection(selection)) {
      selection.insertNodes([linkNode]);
    }
  });
}

export function NoteLinkToolbarPlugin({
  books,
  options,
}: {
  books: Book[];
  options: Array<{ label: string; target: NoteLinkTarget | null }>;
}) {
  const { activeEditor } = useToolbarContext();
  const cachedSelectionRef = useRef<BaseSelection | null>(null);

  const insertTarget = useCallback(
    (target: NoteLinkTarget | null) => {
      if (!target) {
        return;
      }
      applyInternalLink(target, books, activeEditor, cachedSelectionRef.current);
    },
    [activeEditor, books],
  );

  const cacheSelection = useCallback(() => {
    activeEditor.getEditorState().read(() => {
      const selection = $getSelection();
      cachedSelectionRef.current =
        selection && $isRangeSelection(selection) && !selection.isCollapsed()
          ? selection.clone()
          : null;
    });
  }, [activeEditor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Insert Bible link"
            onMouseDown={cacheSelection}
          />
        }
      >
        <Link2Icon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.label}
            disabled={!option.target}
            onClick={() => insertTarget(option.target)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
