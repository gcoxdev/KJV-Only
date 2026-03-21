import type { ComponentProps } from "react";

import { NotesTool } from "@/components/reader/study-tools/notes-tool";
import { BookmarksTool } from "@/components/reader/study-tools/bookmarks-tool";
import { TopicsPanel, type TopicsPanelProps } from "@/components/reader/study-tools/topics-tool";
import {
  ReaderStudyToolsContent,
  type ReaderStudyToolsContentProps,
} from "@/components/reader/reader-study-tools-content";
import { StudyToolsSidebar } from "@/components/reader/study-tools-sidebar";
import type { StudyWorkspaceTab } from "@/types/reader";

type ReaderStudySidebarProps = {
  visible: boolean;
  activeTab: StudyWorkspaceTab;
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onActiveTabChange: (value: StudyWorkspaceTab) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  canExpand: boolean;
  canCollapse: boolean;
  topicsProps: TopicsPanelProps;
  notesProps: ComponentProps<typeof NotesTool>;
  bookmarksProps: ComponentProps<typeof BookmarksTool>;
} & ReaderStudyToolsContentProps;

export function ReaderStudySidebar({
  visible,
  activeTab,
  accordionValue,
  onAccordionValueChange,
  onActiveTabChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  topicsProps,
  notesProps,
  bookmarksProps,
  ...toolsProps
}: ReaderStudySidebarProps) {
  return (
    <div data-tour="sidebar">
      <StudyToolsSidebar
        visible={visible}
        activeTab={activeTab}
        accordionValue={accordionValue}
        onAccordionValueChange={onAccordionValueChange}
        onActiveTabChange={onActiveTabChange}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
        canExpand={canExpand}
        canCollapse={canCollapse}
        topicsContent={<TopicsPanel {...topicsProps} />}
        notesContent={<NotesTool {...notesProps} />}
        bookmarksContent={<BookmarksTool {...bookmarksProps} />}
        toolsContent={<ReaderStudyToolsContent {...toolsProps} />}
      />
    </div>
  );
}
