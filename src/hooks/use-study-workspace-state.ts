import { startTransition, useCallback, useState } from "react";

import type { StudyWorkspaceTab, StudyWorkspaceTool } from "@/types/reader";

const STUDY_WORKSPACE_TABS: StudyWorkspaceTab[] = ["tools", "notes", "bookmarks"];
const STUDY_WORKSPACE_TOOLS: StudyWorkspaceTool[] = [
  "cross-refs",
  "concordance",
  "websters",
  "strongs",
  "old-english",
  "bible-word-book",
  "phrases",
  "units",
  "maps",
  "genealogy",
  "hitchcocks",
];

export function normalizeStudyWorkspaceTab(
  value: string | null | undefined,
): StudyWorkspaceTab {
  return STUDY_WORKSPACE_TABS.includes(value as StudyWorkspaceTab)
    ? (value as StudyWorkspaceTab)
    : "tools";
}

export function normalizeStudyWorkspaceTool(
  value: string | null | undefined,
): StudyWorkspaceTool {
  return STUDY_WORKSPACE_TOOLS.includes(value as StudyWorkspaceTool)
    ? (value as StudyWorkspaceTool)
    : "concordance";
}

export type UseStudyWorkspaceStateArgs = {
  initialAccordionValue: string[];
};

export function useStudyWorkspaceState({
  initialAccordionValue,
}: UseStudyWorkspaceStateArgs) {
  const [activeTab, setActiveTab] = useState<StudyWorkspaceTab>("tools");
  const [activeTool, setActiveTool] = useState<StudyWorkspaceTool>("concordance");
  const [accordionValue, setAccordionValue] = useState<string[]>(
    initialAccordionValue,
  );

  const showTool = useCallback((tool: StudyWorkspaceTool) => {
    startTransition(() => {
      setActiveTab("tools");
      setActiveTool(tool);
      setAccordionValue((current) =>
        current.includes(tool) ? current : [...current, tool],
      );
    });
  }, []);

  const handleAccordionValueChange = useCallback((value: string[]) => {
    setAccordionValue(value);
    const nextTool = [...value]
      .reverse()
      .find((item): item is StudyWorkspaceTool =>
        STUDY_WORKSPACE_TOOLS.includes(item as StudyWorkspaceTool),
      );
    if (nextTool) {
      setActiveTool(nextTool);
    }
  }, []);

  return {
    activeTab,
    activeTool,
    accordionValue,
    setActiveTab,
    setActiveTool,
    setAccordionValue: handleAccordionValueChange,
    showTool,
  };
}
