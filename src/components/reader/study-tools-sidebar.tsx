import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
} from "@/components/ui/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

type StudyToolsSidebarProps = {
  visible: boolean;
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  canExpand: boolean;
  canCollapse: boolean;
  children: ReactNode;
};

export function StudyToolsSidebar({
  visible,
  accordionValue,
  onAccordionValueChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  children,
}: StudyToolsSidebarProps) {
  if (!visible) {
    return null;
  }

  return (
    <Sidebar side="right" className="h-screen">
      <SidebarHeader className="gap-2">
        <h2 className="text-base font-semibold">Study Tools</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onExpandAll}
            disabled={!canExpand}
          >
            Expand All
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCollapseAll}
            disabled={!canCollapse}
          >
            Collapse All
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-3">
        <Accordion
          className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
          multiple
          value={accordionValue}
          onValueChange={(value) => onAccordionValueChange(value.filter(Boolean) as string[])}
        >
          {children}
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}
