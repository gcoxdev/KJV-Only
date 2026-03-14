import { type ReactNode } from "react";
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
import type { StudyWorkspaceTab } from "@/types/reader";

type StudyToolsSidebarProps = {
  visible: boolean;
  activeTab: StudyWorkspaceTab;
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onActiveTabChange: (value: StudyWorkspaceTab) => void;
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
  activeTab,
  accordionValue,
  onAccordionValueChange,
  onActiveTabChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  toolsContent,
  notesContent,
  bookmarksContent,
}: StudyToolsSidebarProps) {
  if (!visible) {
    return null;
  }

  return (
    <Sidebar side="right" className="h-screen border-l border-sidebar-border/80 bg-sidebar/95 backdrop-blur-sm">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 bg-sidebar/85 px-3 py-3">
        <ToggleGroup
          value={[activeTab]}
          onValueChange={(value) => {
            const nextValue = value[0];
            if (
              nextValue === "tools" ||
              nextValue === "notes" ||
              nextValue === "bookmarks"
            ) {
              onActiveTabChange(nextValue);
            }
          }}
          variant="outline"
          size="sm"
          className="grid w-full grid-cols-3"
        >
          <ToggleGroupItem
            value="tools"
            className="justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <ToolboxIcon />
            Tools
          </ToggleGroupItem>
          <ToggleGroupItem
            value="notes"
            className="justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <NotebookPenIcon />
            Notes
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bookmarks"
            className="justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <BookMarkedIcon />
            Bookmarks
          </ToggleGroupItem>
        </ToggleGroup>
      </SidebarHeader>
      <SidebarContent className="px-2 pb-3">
        {activeTab === "tools" ? (
          <div className="flex flex-col gap-2">
            <div className="sticky top-0 z-10 flex flex-col gap-2 bg-sidebar/95 px-1 pt-1 backdrop-blur-sm">
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
            <Accordion
              className="workspace-panel-elevated w-full rounded-2xl border px-3 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
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
          <div className="pt-1">
            <div className="workspace-panel-elevated w-full rounded-2xl border p-3">
              {notesContent}
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <div className="workspace-panel-elevated w-full rounded-2xl border p-3">
              {bookmarksContent}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
