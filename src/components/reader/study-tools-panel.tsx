import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyMinusIcon, CopyPlusIcon } from "lucide-react";

import { ReaderStudyToolsContent, type ReaderStudyToolsContentProps } from "@/components/reader/reader-study-tools-content";

type StudyToolsPanelProps = {
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  canExpand: boolean;
  canCollapse: boolean;
} & ReaderStudyToolsContentProps;

export function StudyToolsPanel({
  accordionValue,
  onAccordionValueChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  ...toolsProps
}: StudyToolsPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-2">
      <div className="sticky top-0 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onExpandAll}
            disabled={!canExpand}
          >
            <CopyPlusIcon />
            Expand All
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onCollapseAll}
            disabled={!canCollapse}
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
            onAccordionValueChange(value.filter(Boolean) as string[])
          }
        >
          <ReaderStudyToolsContent {...toolsProps} />
        </Accordion>
      </div>
    </div>
  );
}
