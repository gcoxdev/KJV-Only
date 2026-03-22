import { type ReactNode } from "react";
import {
  BookMarkedIcon,
  BookTextIcon,
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
  SidebarFooter,
  SidebarHeader,
  useSidebar,
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
  topicsContent: ReactNode;
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
  topicsContent,
  notesContent,
  bookmarksContent,
}: StudyToolsSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  if (!visible) {
    return null;
  }

  return (
    <Sidebar side="right" className="h-screen min-w-0 border-l border-sidebar-border/80 bg-sidebar/95 backdrop-blur-sm">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 bg-sidebar/85 px-3 py-3">
        <ToggleGroup
          value={[activeTab]}
          onValueChange={(value) => {
            const nextValue = value[0];
            if (
              nextValue === "tools" ||
              nextValue === "topics" ||
              nextValue === "notes" ||
              nextValue === "bookmarks"
            ) {
              onActiveTabChange(nextValue);
            }
          }}
          variant="outline"
          size="sm"
          spacing={0}
          className="flex w-full"
        >
          <ToggleGroupItem
            value="tools"
            className="min-w-0 grow basis-auto justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <ToolboxIcon />
            Tools
          </ToggleGroupItem>
          <ToggleGroupItem
            value="topics"
            className="min-w-0 grow basis-auto justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <BookTextIcon />
            Topics
          </ToggleGroupItem>
          <ToggleGroupItem
            value="notes"
            className="min-w-0 grow basis-auto justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <NotebookPenIcon />
            Notes
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bookmarks"
            className="min-w-0 grow basis-auto justify-center data-[pressed]:border-primary! data-[pressed]:bg-primary/92! data-[pressed]:text-primary-foreground! hover:data-[pressed]:bg-primary/90! hover:data-[pressed]:text-primary-foreground!"
          >
            <BookMarkedIcon />
            Bookmarks
          </ToggleGroupItem>
        </ToggleGroup>
      </SidebarHeader>
      <SidebarContent className="min-w-0 max-w-full px-2 pb-3">
        {activeTab === "tools" ? (
          <div className="flex min-w-0 max-w-full flex-col gap-2 overflow-x-hidden [contain:inline-size]">
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
              className="workspace-panel-elevated min-w-0 max-w-full w-full rounded-2xl border px-3 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
              multiple
              value={accordionValue}
              onValueChange={(value) =>
                onAccordionValueChange(value.filter(Boolean) as string[])
              }
            >
              {toolsContent}
            </Accordion>
          </div>
        ) : activeTab === "topics" ? (
          <div className="min-w-0 max-w-full pt-1 overflow-x-hidden [contain:inline-size]">
            <div className="workspace-panel-elevated min-w-0 max-w-full w-full rounded-2xl border p-3">
              {topicsContent}
            </div>
          </div>
        ) : activeTab === "notes" ? (
          <div className="min-w-0 max-w-full pt-1 overflow-x-hidden [contain:inline-size]">
            <div className="workspace-panel-elevated min-w-0 max-w-full w-full rounded-2xl border p-3">
              {notesContent}
            </div>
          </div>
        ) : (
          <div className="min-w-0 max-w-full pt-1 overflow-x-hidden [contain:inline-size]">
            <div className="workspace-panel-elevated min-w-0 max-w-full w-full rounded-2xl border p-3">
              {bookmarksContent}
            </div>
          </div>
        )}
      </SidebarContent>
      {isMobile ? (
        <SidebarFooter className="border-t border-sidebar-border/70 bg-sidebar/90 px-3 py-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setOpenMobile(false)}
          >
            Close Sidebar
          </Button>
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
