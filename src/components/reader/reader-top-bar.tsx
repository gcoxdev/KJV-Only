import {
  ChartBarIcon,
  CheckIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
} from "lucide-react";
import { STATIC_PAGES } from "@/lib/static-pages";
import type { StaticPageId } from "@/types/reader";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

type ReaderTopBarProps = {
  isStudyMode: boolean;
  isShareCopied: boolean;
  showSidebarToggle: boolean;
  onStudyModeChange: (checked: boolean) => void;
  onOpenSearch: () => void;
  onShareLayout: () => void;
  onOpenProgress: () => void;
  onOpenSettings: () => void;
  onOpenPage: (pageId: StaticPageId) => void;
};

export function ReaderTopBar({
  isStudyMode,
  isShareCopied,
  showSidebarToggle,
  onStudyModeChange,
  onOpenSearch,
  onShareLayout,
  onOpenProgress,
  onOpenSettings,
  onOpenPage,
}: ReaderTopBarProps) {
  return (
    <header className="z-20 flex shrink-0 items-center justify-between border-b border-subtle-divider/80 bg-workspace-chrome/90 px-3 py-2 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <MenuIcon aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onOpenProgress}>
              <ChartBarIcon />
              Reading Progress
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenSettings}>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Pages</DropdownMenuLabel>
              {STATIC_PAGES.filter(
                (page) => page.id !== "settings" && page.id !== "progress",
              ).map((page) => (
                <DropdownMenuItem
                  key={page.id}
                  onClick={() => onOpenPage(page.id)}
                >
                  <page.icon />
                  {page.menuLabel}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/icons/app-icon.png"
            alt="KJV Only icon"
            width={24}
            height={24}
            className="size-6"
          />
          <p className="workspace-heading truncate text-lg font-semibold leading-none">
            KJV Only
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open search"
          onClick={onOpenSearch}
        >
          <SearchIcon aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Share layout"
          onClick={onShareLayout}
          title={isShareCopied ? "Layout link copied" : "Share layout"}
        >
          {isShareCopied ? <CheckIcon aria-hidden="true" /> : <Share2Icon aria-hidden="true" />}
        </Button>
        <div className="flex items-center gap-2">
          <span className="tabular-data text-sm font-medium">
            {isStudyMode ? "Study" : "Read"}
          </span>
          <Switch
            id="study-mode"
            checked={isStudyMode}
            onCheckedChange={onStudyModeChange}
            aria-label={isStudyMode ? "Switch to read mode" : "Switch to study mode"}
          />
        </div>
        {isStudyMode && showSidebarToggle ? (
          <SidebarTrigger className="border border-subtle-divider/70 bg-workspace-panel" />
        ) : null}
      </div>
    </header>
  );
}
