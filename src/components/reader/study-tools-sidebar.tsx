import { useState, type ReactNode } from "react";
import {
  BookMarkedIcon,
  CopyMinusIcon,
  CopyPlusIcon,
  NotebookPenIcon,
  ToolboxIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

type StudyToolsSidebarProps = {
  visible: boolean;
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  canExpand: boolean;
  canCollapse: boolean;
  toolsContent: ReactNode;
  notesContent: ReactNode;
  bookmarksContent: ReactNode;
};

export function StudyToolsSidebar({
  visible,
  accordionValue,
  onAccordionValueChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  toolsContent,
  notesContent,
  bookmarksContent,
}: StudyToolsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"tools" | "notes" | "bookmarks">("tools");

  if (!visible) {
    return null;
  }

  return (
    <Sidebar side="right" className="h-screen">
      <SidebarHeader className="gap-3 border-b px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Study Workspace</h2>
        </div>
        <ToggleGroup
          value={[activeTab]}
          onValueChange={(value) => {
            const nextValue = value[0];
            if (
              nextValue === "tools" ||
              nextValue === "notes" ||
              nextValue === "bookmarks"
            ) {
              setActiveTab(nextValue);
            }
          }}
          variant="outline"
          size="sm"
          className="grid w-full grid-cols-3"
        >
          <ToggleGroupItem value="tools" className="justify-center">
            <ToolboxIcon />
            Tools
          </ToggleGroupItem>
          <ToggleGroupItem value="notes" className="justify-center">
            <NotebookPenIcon />
            Notes
          </ToggleGroupItem>
          <ToggleGroupItem value="bookmarks" className="justify-center">
            <BookMarkedIcon />
            Bookmarks
          </ToggleGroupItem>
        </ToggleGroup>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-3">
        {activeTab === "tools" ? (
          <div className="flex flex-col gap-2">
            <div className="sticky top-0 z-10 flex flex-col gap-2 bg-sidebar px-1 pt-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
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
                  onClick={onCollapseAll}
                  disabled={!canCollapse}
                >
                  <CopyMinusIcon />
                  Collapse All
                </Button>
              </div>
              <Separator />
            </div>
            <Accordion
              className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
              multiple
              value={accordionValue}
              onValueChange={(value) =>
                onAccordionValueChange(value.filter(Boolean) as string[])
              }
            >
              {toolsContent}
            </Accordion>
          </div>
        ) : activeTab === "notes" ? (
          <div className="w-full rounded-md border p-2">{notesContent}</div>
        ) : (
          <div className="w-full rounded-md border p-2">{bookmarksContent}</div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
