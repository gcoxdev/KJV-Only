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
      <SidebarHeader className="gap-2">
        <h2 className="text-base font-semibold">Study Tools</h2>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={activeTab === "tools" ? "default" : "outline"}
            onClick={() => setActiveTab("tools")}
          >
            <ToolboxIcon />
            Tools
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "notes" ? "default" : "outline"}
            onClick={() => setActiveTab("notes")}
          >
            <NotebookPenIcon />
            Notes
          </Button>
          <Button
            type="button"
            size="sm"
            variant={activeTab === "bookmarks" ? "default" : "outline"}
            onClick={() => setActiveTab("bookmarks")}
          >
            <BookMarkedIcon />
            Bookmarks
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-3">
        {activeTab === "tools" ? (
          <div className="space-y-2">
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
