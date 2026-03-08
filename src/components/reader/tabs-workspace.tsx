import type { ReactNode } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import type { TabsOrientation } from "@/types/reader";

type TabsWorkspaceProps = {
  tabsOrientation: TabsOrientation;
  tabsStrip: ReactNode;
  readerContent: ReactNode;
};

export function TabsWorkspace({
  tabsOrientation,
  tabsStrip,
  readerContent,
}: TabsWorkspaceProps) {
  if (tabsOrientation === "horizontal") {
    return (
      <>
        <div className="shrink-0 border-b px-4 py-2 sm:px-6">{tabsStrip}</div>
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {readerContent}
        </div>
      </>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          id="tabs-sidebar"
          defaultSize={150}
          minSize={150}
          maxSize={300}
          collapsible
          className="min-h-0 min-w-0 border-r"
        >
          <div className="h-full w-full px-2 py-2">{tabsStrip}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="reader-content" minSize={15}>
          <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
            {readerContent}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
