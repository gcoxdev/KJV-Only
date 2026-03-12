import { type RefObject } from "react";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  EllipsisIcon,
  PencilLineIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ReaderTab, TabsOrientation } from "@/types/reader";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

type TabsStripProps = {
  tabs: ReaderTab[];
  activeTabId: string | null;
  tabsOrientation: TabsOrientation;
  tabEndRef: RefObject<HTMLDivElement | null>;
  onActivateTab: (tabId: string) => void;
  onOpenRenameDialog: (tabId: string) => void;
  onMoveTab: (tabId: string, direction: -1 | 1) => void;
  onCloseTab: (tabId: string) => void;
  onAddTab: () => void;
};

export function TabsStrip({
  tabs,
  activeTabId,
  tabsOrientation,
  tabEndRef,
  onActivateTab,
  onOpenRenameDialog,
  onMoveTab,
  onCloseTab,
  onAddTab,
}: TabsStripProps) {
  return (
    <ScrollArea className="h-full w-full">
      <div
        className={cn(
          "p-2.5",
          tabsOrientation === "vertical"
            ? "flex flex-col items-stretch gap-2"
            : "flex w-max items-center gap-2",
        )}
      >
        {tabs.map((tab, index) => {
          const active = tab.id === activeTabId;
          const canMoveLeft = tabs.length > 1 && index > 0;
          const canMoveRight = tabs.length > 1 && index < tabs.length - 1;
          const moveBackwardLabel =
            tabsOrientation === "vertical" ? "Move Up" : "Move Left";
          const moveForwardLabel =
            tabsOrientation === "vertical" ? "Move Down" : "Move Right";
          const MoveBackwardIcon =
            tabsOrientation === "vertical" ? ArrowUpIcon : ArrowLeftIcon;
          const MoveForwardIcon =
            tabsOrientation === "vertical" ? ArrowDownIcon : ArrowRightIcon;
          return (
            <ButtonGroup
              key={tab.id}
              className={cn(tabsOrientation === "vertical" && "w-full")}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivateTab(tab.id)}
                className={cn(
                  "min-w-28 justify-start border-subtle-divider/80 bg-workspace-panel-elevated text-left shadow-none",
                  tabsOrientation === "vertical" &&
                    "h-auto w-full min-w-0 flex-1 whitespace-normal wrap-break-word py-1.5 text-left leading-tight",
                  active &&
                    "border-primary! bg-primary/92! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground!",
                )}
              >
                {tab.title}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className={cn(
                        "relative border-subtle-divider/80 bg-workspace-panel-elevated",
                        tabsOrientation === "vertical" && "h-auto self-stretch",
                        active &&
                          "border-primary! bg-primary/92! text-primary-foreground! hover:bg-primary/90! hover:text-primary-foreground! before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-primary-foreground/35 before:content-['']",
                      )}
                      aria-label={`Tab options for ${tab.title}`}
                    >
                      <EllipsisIcon />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onOpenRenameDialog(tab.id)}>
                      <PencilLineIcon />
                      Relabel Tab
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  {tabs.length > 1 ? (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {canMoveLeft ? (
                          <DropdownMenuItem onClick={() => onMoveTab(tab.id, -1)}>
                            <MoveBackwardIcon />
                            {moveBackwardLabel}
                          </DropdownMenuItem>
                        ) : null}
                        {canMoveRight ? (
                          <DropdownMenuItem onClick={() => onMoveTab(tab.id, 1)}>
                            <MoveForwardIcon />
                            {moveForwardLabel}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onCloseTab(tab.id)}>
                          <XIcon />
                          Close Tab
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          );
        })}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={onAddTab}
          aria-label="New Tab"
          className={cn(
            "border-dashed border-subtle-divider/80 bg-workspace-panel/70",
            tabsOrientation === "vertical" && "w-full",
          )}
        >
          <PlusIcon />
        </Button>
        <div ref={tabEndRef} />
      </div>
      <ScrollBar
        orientation={tabsOrientation === "vertical" ? "vertical" : "horizontal"}
      />
    </ScrollArea>
  );
}
