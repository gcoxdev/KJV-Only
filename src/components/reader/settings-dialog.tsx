import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AArrowDownIcon,
  AArrowUpIcon,
  RotateCcwIcon,
} from "lucide-react";
import type {
  BookmarkOpenTarget,
  NotesLinkOpenTarget,
  SearchResultOpenTarget,
  TabsOrientation,
  WordVerseSelectionTarget,
} from "@/types/reader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
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
  highlightColor: string;
  onHighlightColorChange: (value: string) => void;
  onResetHighlightColor: () => void;
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
  wordVerseSelectionTarget: WordVerseSelectionTarget;
  onWordVerseSelectionTargetChange: (target: WordVerseSelectionTarget) => void;
  notesLinkOpenTarget: NotesLinkOpenTarget;
  onNotesLinkOpenTargetChange: (target: NotesLinkOpenTarget) => void;
  searchResultOpenTarget: SearchResultOpenTarget;
  onSearchResultOpenTargetChange: (target: SearchResultOpenTarget) => void;
  bookmarkOpenTarget: BookmarkOpenTarget;
  onBookmarkOpenTargetChange: (target: BookmarkOpenTarget) => void;
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
  highlightColor,
  onHighlightColorChange,
  onResetHighlightColor,
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
  wordVerseSelectionTarget,
  onWordVerseSelectionTargetChange,
  notesLinkOpenTarget,
  onNotesLinkOpenTargetChange,
  searchResultOpenTarget,
  onSearchResultOpenTargetChange,
  bookmarkOpenTarget,
  onBookmarkOpenTargetChange,
}: SettingsDialogProps) {
  const [draftHighlightColor, setDraftHighlightColor] = useState(highlightColor);
  const wordVerseSelectionTargetLabel =
    wordVerseSelectionTarget === "sidebar"
      ? "Sidebar"
      : wordVerseSelectionTarget === "new-tab"
        ? "New Tab"
        : wordVerseSelectionTarget === "new-panel"
          ? "New Panel"
          : "Targeted Panel";
  const notesLinkTargetLabel =
    notesLinkOpenTarget === "new-tab"
      ? "New Tab"
      : notesLinkOpenTarget === "new-panel"
        ? "New Panel"
        : "Targeted Panel";
  const searchResultTargetLabel =
    searchResultOpenTarget === "new-tab"
      ? "New Tab"
      : searchResultOpenTarget === "new-panel"
        ? "New Panel"
        : "Targeted Panel";
  const bookmarkTargetLabel =
    bookmarkOpenTarget === "new-tab"
      ? "New Tab"
      : bookmarkOpenTarget === "new-panel"
        ? "New Panel"
        : "Targeted Panel";

  useEffect(() => {
    setDraftHighlightColor(highlightColor);
  }, [highlightColor]);

  useEffect(() => {
    if (draftHighlightColor === highlightColor) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onHighlightColorChange(draftHighlightColor);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftHighlightColor, highlightColor, onHighlightColorChange]);

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
              <Label htmlFor="highlight-color">Highlight Color</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {draftHighlightColor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="highlight-color"
                type="color"
                value={draftHighlightColor}
                onChange={(event) =>
                  setDraftHighlightColor(event.currentTarget.value)
                }
                className="h-9 w-14 shrink-0 p-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetHighlightColor}
              >
                <RotateCcwIcon />
                Reset
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
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="word-verse-selection-target">Word / Verse Selection Target</Label>
            </div>
            <Select
              value={wordVerseSelectionTarget}
              onValueChange={(value) => {
                if (
                  value === "sidebar" ||
                  value === "new-tab" ||
                  value === "new-panel" ||
                  value === "targeted-panel"
                ) {
                  onWordVerseSelectionTargetChange(value);
                }
              }}
            >
              <SelectTrigger id="word-verse-selection-target" className="w-full">
                <SelectValue placeholder="Sidebar">
                  {wordVerseSelectionTargetLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sidebar">Sidebar</SelectItem>
                <SelectItem value="new-tab">New Tab</SelectItem>
                <SelectItem value="new-panel">New Panel</SelectItem>
                <SelectItem value="targeted-panel">Targeted Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="notes-link-target">Notes Link Target</Label>
            </div>
            <Select
              value={notesLinkOpenTarget}
              onValueChange={(value) => {
                if (
                  value === "new-tab" ||
                  value === "new-panel" ||
                  value === "targeted-panel"
                ) {
                  onNotesLinkOpenTargetChange(value);
                }
              }}
            >
              <SelectTrigger id="notes-link-target" className="w-full">
                <SelectValue placeholder="New Panel">
                  {notesLinkTargetLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-tab">New Tab</SelectItem>
                <SelectItem value="new-panel">New Panel</SelectItem>
                <SelectItem value="targeted-panel">Targeted Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="search-result-target">Search Result Target</Label>
            </div>
            <Select
              value={searchResultOpenTarget}
              onValueChange={(value) => {
                if (
                  value === "new-tab" ||
                  value === "new-panel" ||
                  value === "targeted-panel"
                ) {
                  onSearchResultOpenTargetChange(value);
                }
              }}
            >
              <SelectTrigger id="search-result-target" className="w-full">
                <SelectValue placeholder="New Panel">
                  {searchResultTargetLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-tab">New Tab</SelectItem>
                <SelectItem value="new-panel">New Panel</SelectItem>
                <SelectItem value="targeted-panel">Targeted Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 border-t pt-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Label htmlFor="bookmark-target">Bookmark Target</Label>
            </div>
            <Select
              value={bookmarkOpenTarget}
              onValueChange={(value) => {
                if (
                  value === "new-tab" ||
                  value === "new-panel" ||
                  value === "targeted-panel"
                ) {
                  onBookmarkOpenTargetChange(value);
                }
              }}
            >
              <SelectTrigger id="bookmark-target" className="w-full">
                <SelectValue placeholder="New Panel">
                  {bookmarkTargetLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new-tab">New Tab</SelectItem>
                <SelectItem value="new-panel">New Panel</SelectItem>
                <SelectItem value="targeted-panel">Targeted Panel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter className="group-data-[size=sm]/alert-dialog-content:flex group-data-[size=sm]/alert-dialog-content:flex-row group-data-[size=sm]/alert-dialog-content:justify-end justify-end sm:flex sm:justify-end">
          <AlertDialogAction onClick={() => onOpenChange(false)} className="w-auto">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
