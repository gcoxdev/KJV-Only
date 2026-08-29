import { lazy, Suspense, useState, type ReactNode } from "react";

import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyMinusIcon, CopyPlusIcon } from "lucide-react";

import {
  ReaderStudyToolsContent,
} from "@/components/reader/reader-study-tools-content";
import { STUDY_ACCORDION_ITEMS } from "@/hooks/use-study-sidebar-state";
import { useStudyToolsSession } from "@/hooks/use-study-tools-session";
import type { AncientMapEntry } from "@/lib/maps";
import type { Book } from "@/types/bible";
import type { NotesContext } from "@/types/notes";
import type { StudyToolsSelectionCommand } from "@/types/reader";

const LazyGenealogyTreeDialog = lazy(async () => {
  const module = await import("@/components/reader/genealogy-tree-dialog");
  return { default: module.GenealogyTreeDialog };
});

export type StudyToolsPanelProps = {
  books: Book[];
  selectionCommand?: StudyToolsSelectionCommand;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
  onOpenMapDialog: (entry: AncientMapEntry) => void;
  onSetNotesContext: (context: NotesContext | null) => void;
};

export function StudyToolsPanel({
  books,
  selectionCommand,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
  onOpenMapDialog,
  onSetNotesContext,
}: StudyToolsPanelProps) {
  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const { toolsProps, genealogyTree } = useStudyToolsSession({
    accordionValue,
    setAccordionValue,
    books,
    selectionCommand,
    renderPreview,
    onOpenReference,
    onCloseSidebar,
    onOpenMapDialog,
    onSetNotesContext,
  });
  const allSectionsOpen = STUDY_ACCORDION_ITEMS.every((item) =>
    accordionValue.includes(item),
  );

  return (
    <>
      <div className="flex h-full min-h-0 flex-col gap-2 p-2">
        <div className="sticky top-0 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setAccordionValue([...STUDY_ACCORDION_ITEMS])}
              disabled={allSectionsOpen}
            >
              <CopyPlusIcon />
              Expand All
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setAccordionValue([])}
              disabled={accordionValue.length === 0}
            >
              <CopyMinusIcon />
              Collapse All
            </Button>
          </div>
          <Separator />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Accordion
            className="workspace-panel-elevated w-full rounded-2xl border px-3 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
            multiple
            value={accordionValue}
            onValueChange={(value) =>
              setAccordionValue(value.filter(Boolean) as string[])
            }
          >
            <ReaderStudyToolsContent
              {...toolsProps}
              openSections={accordionValue}
            />
          </Accordion>
        </div>
      </div>
      {genealogyTree.open ? (
        <Suspense fallback={null}>
          <LazyGenealogyTreeDialog
            open={genealogyTree.open}
            person={genealogyTree.person}
            genealogyById={genealogyTree.genealogyById}
            renderReferencePreview={renderPreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
            onOpenChange={genealogyTree.onOpenChange}
            onSelectPerson={genealogyTree.onSelectPerson}
          />
        </Suspense>
      ) : null}
    </>
  );
}
