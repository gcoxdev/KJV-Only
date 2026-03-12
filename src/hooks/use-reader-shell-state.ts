import { startTransition, useState } from "react";

import type { TabsOrientation } from "@/types/reader";

export function normalizeReaderMode(
  value: string | null | undefined,
): "study" | "read" {
  return value === "read" ? "read" : "study";
}

export function normalizeTabsOrientation(value: string | null | undefined): TabsOrientation {
  return value === "vertical" ? "vertical" : "horizontal";
}

type UseReaderShellStateArgs = {
  initialTabsOrientation?: TabsOrientation;
};

export function useReaderShellState({
  initialTabsOrientation = "horizontal",
}: UseReaderShellStateArgs = {}) {
  const [mode, setMode] = useState<"study" | "read">("study");
  const [tabsOrientation, setTabsOrientation] = useState<TabsOrientation>(
    initialTabsOrientation,
  );
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(mode === "study");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isGenealogyTreeOpen, setIsGenealogyTreeOpen] = useState(false);
  const [genealogyTreePersonId, setGenealogyTreePersonId] = useState<string | null>(
    null,
  );

  const setIsStudyMode = (nextIsStudyMode: boolean) => {
    startTransition(() => {
      setMode(nextIsStudyMode ? "study" : "read");
      setIsRightSidebarOpen(nextIsStudyMode);
    });
  };

  return {
    isStudyMode: mode === "study",
    mode,
    tabsOrientation,
    isRightSidebarOpen,
    isSettingsOpen,
    isProgressOpen,
    isGenealogyTreeOpen,
    genealogyTreePersonId,
    setMode,
    setIsStudyMode,
    setTabsOrientation,
    setIsRightSidebarOpen,
    setIsSettingsOpen,
    setIsProgressOpen,
    setIsGenealogyTreeOpen,
    setGenealogyTreePersonId,
  };
}
