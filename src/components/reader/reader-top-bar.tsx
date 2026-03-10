import { ChartBarIcon, MenuIcon, SearchIcon, SettingsIcon } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";

type ReaderTopBarProps = {
  isStudyMode: boolean;
  onStudyModeChange: (checked: boolean) => void;
  onOpenSearch: () => void;
  onOpenProgress: () => void;
  onOpenSettings: () => void;
};

export function ReaderTopBar({
  isStudyMode,
  onStudyModeChange,
  onOpenSearch,
  onOpenProgress,
  onOpenSettings,
}: ReaderTopBarProps) {
  return (
    <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon" aria-label="Open menu" />}
          >
            <MenuIcon />
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
              <DropdownMenuItem>How to Get Saved</DropdownMenuItem>
              <DropdownMenuItem>Why KJV Only?</DropdownMenuItem>
              <DropdownMenuItem>Resources</DropdownMenuItem>
              <DropdownMenuItem>Local Churches</DropdownMenuItem>
              <DropdownMenuItem>Download</DropdownMenuItem>
              <DropdownMenuItem>Donate</DropdownMenuItem>
              <DropdownMenuItem>Credits</DropdownMenuItem>
              <DropdownMenuItem>What&apos;s New</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-2">
          <img
            src="/icons/app-icon.png"
            alt="KJV Only icon"
            className="size-5 rounded-sm"
          />
          <p className="font-semibold">KJV Only</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open search"
          onClick={onOpenSearch}
        >
          <SearchIcon />
        </Button>
        <div className="flex items-center gap-2">
          <Label htmlFor="study-mode" className="text-sm">
            {isStudyMode ? "Study" : "Read"}
          </Label>
          <Switch
            id="study-mode"
            checked={isStudyMode}
            onCheckedChange={onStudyModeChange}
          />
        </div>
        {isStudyMode ? <SidebarTrigger /> : null}
      </div>
    </header>
  );
}
