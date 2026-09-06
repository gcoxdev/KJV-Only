import type { ReactNode } from "react";
import { HouseIcon, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReaderControlTooltip } from "@/components/reader/reader-control-tooltip";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

type StudyToolsSidebarProps = {
  visible: boolean;
  title: string;
  icon: LucideIcon;
  isHome: boolean;
  onHome: () => void;
  onActivate: () => void;
  children: ReactNode;
};

export function StudyToolsSidebar({ visible, title, icon: Icon, isHome, onHome, onActivate, children }: StudyToolsSidebarProps) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();
  if (!visible) return null;

  return (
    <Sidebar side="right" className="h-screen min-w-0 border-l border-sidebar-border/80 bg-sidebar/95 backdrop-blur-sm">
      <section aria-label="Study sidebar" inert={!(isMobile ? openMobile : open)} className="flex h-full min-h-0 min-w-0 flex-col"
        onFocusCapture={onActivate} onPointerDownCapture={onActivate}>
        <SidebarHeader className="border-b border-sidebar-border/70 p-2">
          <div className="flex min-h-7 min-w-0 items-center gap-2">
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <h2 className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{title}</h2>
            {!isHome && (
              <ReaderControlTooltip label="Sidebar Home">
                <Button type="button" variant="outline" size="icon-sm" aria-label="Sidebar Home" onClick={onHome}>
                  <HouseIcon />
                </Button>
              </ReaderControlTooltip>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </SidebarContent>
        {isMobile && (
          <SidebarFooter className="border-t border-sidebar-border/70 p-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => setOpenMobile(false)}>
              Close Sidebar
            </Button>
          </SidebarFooter>
        )}
      </section>
    </Sidebar>
  );
}
