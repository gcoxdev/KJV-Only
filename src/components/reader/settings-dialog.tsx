import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  AArrowDownIcon,
  AArrowUpIcon,
  RotateCcwIcon,
} from "lucide-react";
import type { TabsOrientation } from "@/types/reader";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onResetFontSize: () => void;
  verseSpacing: number;
  onVerseSpacingChange: (value: number) => void;
  hideReadModeVerseNumbers: boolean;
  onHideReadModeVerseNumbersChange: (checked: boolean) => void;
  readModeParagraphIndent: boolean;
  onReadModeParagraphIndentChange: (checked: boolean) => void;
  flowVersesByParagraph: boolean;
  onFlowVersesByParagraphChange: (checked: boolean) => void;
  tabsOrientation: TabsOrientation;
  onTabsOrientationChange: (orientation: TabsOrientation) => void;
};

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onResetFontSize,
  verseSpacing,
  onVerseSpacingChange,
  hideReadModeVerseNumbers,
  onHideReadModeVerseNumbersChange,
  readModeParagraphIndent,
  onReadModeParagraphIndentChange,
  flowVersesByParagraph,
  onFlowVersesByParagraphChange,
  tabsOrientation,
  onTabsOrientationChange,
}: SettingsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="sm"
        className="flex max-h-[calc(100vh-1.5rem)] flex-col gap-2 overflow-hidden"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Settings</AlertDialogTitle>
          <AlertDialogDescription>
            Reader preferences for this device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-2 py-2">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <Label htmlFor="theme-mode">Dark Mode</Label>
            <Switch
              id="theme-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                onThemeChange(checked ? "dark" : "light")
              }
            />
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label>Font Size</Label>
              <span className="text-xs text-muted-foreground">{fontSize}px</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onDecreaseFontSize}
              >
                <AArrowDownIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onResetFontSize}
              >
                <RotateCcwIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onIncreaseFontSize}
              >
                <AArrowUpIcon />
              </Button>
            </div>
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="verse-spacing">Verse Spacing</Label>
              <span className="text-xs text-muted-foreground">{verseSpacing}px</span>
            </div>
            <Slider
              id="verse-spacing"
              min={0}
              max={24}
              step={1}
              value={[verseSpacing]}
              onValueChange={(value) => {
                const nextValue = Array.isArray(value) ? value[0] : value;
                onVerseSpacingChange(
                  Math.max(0, Math.min(24, Math.round(nextValue ?? 0))),
                );
              }}
            />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="hide-read-mode-verse-numbers">Hide Verse Numbers</Label>
            <Switch
              id="hide-read-mode-verse-numbers"
              checked={hideReadModeVerseNumbers}
              onCheckedChange={onHideReadModeVerseNumbersChange}
            />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="read-mode-indents">Paragraph Indents</Label>
            <Switch
              id="read-mode-indents"
              checked={readModeParagraphIndent}
              onCheckedChange={onReadModeParagraphIndentChange}
            />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="flow-verses">Flow Verses by Paragraph</Label>
            <Switch
              id="flow-verses"
              checked={flowVersesByParagraph}
              onCheckedChange={onFlowVersesByParagraphChange}
            />
          </div>
          <div className="flex min-w-0 items-center justify-between gap-3 border-t pt-3">
            <Label htmlFor="vertical-tabs">Vertical Tabs</Label>
            <Switch
              id="vertical-tabs"
              checked={tabsOrientation === "vertical"}
              onCheckedChange={(checked) =>
                onTabsOrientationChange(checked ? "vertical" : "horizontal")
              }
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
