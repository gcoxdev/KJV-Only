import {
  createContext,
  memo,
  type ReactNode,
  useContext,
  useId,
  useState,
} from "react";
import { ExternalLinkIcon, ListTreeIcon } from "lucide-react";

import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table";
import { useOptionalSidebar } from "@/components/ui/sidebar";
import type { ToolReferenceDisplayMode } from "@/types/reader";

type ReferencePreviewRenderer = (
  reference: string,
  highlightWord: string,
  options?: {
    includeContext?: boolean;
    citationActions?: ReactNode;
    contextId?: string;
  },
) => ReactNode;

type ToolReferenceListProps = {
  references: string[];
  highlightWord: string;
  renderPreview: ReferencePreviewRenderer;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

const SCROLLABLE_REFERENCE_COUNT = 6;
const INITIAL_REFERENCE_ROWS = 50;
const REFERENCE_ROW_BATCH_SIZE = 50;
const ToolReferenceDisplayModeContext =
  createContext<ToolReferenceDisplayMode>("buttons");

export function ToolReferenceDisplayModeProvider({
  mode,
  children,
}: {
  mode: ToolReferenceDisplayMode;
  children: ReactNode;
}) {
  return (
    <ToolReferenceDisplayModeContext.Provider value={mode}>
      {children}
    </ToolReferenceDisplayModeContext.Provider>
  );
}

function useToolReferenceDisplayMode() {
  return useContext(ToolReferenceDisplayModeContext);
}

export const ToolReferenceList = memo(function ToolReferenceList({
  references,
  highlightWord,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: ToolReferenceListProps) {
  const displayMode = useToolReferenceDisplayMode();
  const sidebar = useOptionalSidebar();
  const listId = useId().replace(/[^a-zA-Z0-9_-]/g, "-");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    () => new Set(),
  );
  const [visibleReferenceCount, setVisibleReferenceCount] = useState(
    INITIAL_REFERENCE_ROWS,
  );

  if (displayMode === "buttons") {
    return (
      <div
        data-tool-reference-display="buttons"
        className="flex flex-wrap gap-1.5"
      >
        {references.map((reference, index) => (
          <ConcordanceReferencePopover
            key={`${reference}-${index}`}
            reference={reference}
            highlightWord={highlightWord}
            renderPreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
        ))}
      </div>
    );
  }

  const openReference = (reference: string) => {
    onOpenReference(reference);
    const supportsHover =
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) {
      sidebar?.setOpenMobile(false);
      onCloseSidebar();
    }
  };

  const visibleReferences = references.slice(0, visibleReferenceCount);
  const remainingReferenceCount = references.length - visibleReferences.length;

  const table = (
    <Table className="table-fixed">
      <TableCaption className="sr-only">Scripture references</TableCaption>
      <TableBody>
        {visibleReferences.map((reference, index) => {
          const rowKey = `${reference}-${index}`;
          const isExpanded = expandedRows.has(rowKey);
          const contextId = `tool-reference-context-${listId}-${rowKey.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
          const citationActions = (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => openReference(reference)}
              >
                <ExternalLinkIcon data-icon="inline-start" />
                Open
              </Button>
              <Button
                type="button"
                size="xs"
                variant={isExpanded ? "secondary" : "outline"}
                aria-controls={contextId}
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedRows((current) => {
                    const next = new Set(current);
                    if (next.has(rowKey)) {
                      next.delete(rowKey);
                    } else {
                      next.add(rowKey);
                    }
                    return next;
                  })
                }
              >
                <ListTreeIcon data-icon="inline-start" />
                {isExpanded ? "Hide" : "Context"}
              </Button>
            </div>
          );
          return (
            <TableRow key={rowKey} data-reference={reference}>
              <TableCell className="w-full min-w-0 align-top whitespace-normal break-words">
                <div
                  className="min-w-0 text-xs leading-relaxed [content-visibility:auto] [contain-intrinsic-size:auto_5rem]"
                >
                  {renderPreview(reference, highlightWord, {
                    includeContext: isExpanded,
                    citationActions,
                    contextId,
                  })}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      {remainingReferenceCount > 0 ? (
        <TableFooter>
          <TableRow>
            <TableCell className="text-center">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setVisibleReferenceCount((current) =>
                    Math.min(
                      references.length,
                      current + REFERENCE_ROW_BATCH_SIZE,
                    ),
                  )
                }
              >
                Show more ({remainingReferenceCount} remaining)
              </Button>
            </TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  );

  return references.length > SCROLLABLE_REFERENCE_COUNT ? (
    <ScrollArea
      data-tool-reference-display="table"
      className="h-[min(24rem,60vh)] w-full min-w-0 max-w-full rounded-md border"
    >
      {table}
    </ScrollArea>
  ) : (
    <div
      data-tool-reference-display="table"
      className="w-full min-w-0 max-w-full rounded-md border"
    >
      {table}
    </div>
  );
});
