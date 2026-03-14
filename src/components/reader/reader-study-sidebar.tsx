import type { ComponentProps } from "react";

import { CrossRefsTool } from "@/components/reader/study-tools/cross-refs-tool";
import { ConcordanceTool } from "@/components/reader/study-tools/concordance-tool";
import { WebstersTool } from "@/components/reader/study-tools/websters-tool";
import { StrongsTool } from "@/components/reader/study-tools/strongs-tool";
import { OldEnglishTool } from "@/components/reader/study-tools/old-english-tool";
import { PhrasesTool } from "@/components/reader/study-tools/phrases-tool";
import { UnitsTool } from "@/components/reader/study-tools/units-tool";
import { MapsTool } from "@/components/reader/study-tools/maps-tool";
import { GenealogyTool } from "@/components/reader/study-tools/genealogy-tool";
import { HitchcocksTool } from "@/components/reader/study-tools/hitchcocks-tool";
import { NotesTool } from "@/components/reader/study-tools/notes-tool";
import { BookmarksTool } from "@/components/reader/study-tools/bookmarks-tool";
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
  crossRefsProps: ComponentProps<typeof CrossRefsTool>;
  concordanceProps: ComponentProps<typeof ConcordanceTool>;
  webstersProps: ComponentProps<typeof WebstersTool>;
  strongsProps: ComponentProps<typeof StrongsTool>;
  oldEnglishProps: ComponentProps<typeof OldEnglishTool>;
  phrasesProps: ComponentProps<typeof PhrasesTool>;
  unitsProps: ComponentProps<typeof UnitsTool>;
  mapsProps: ComponentProps<typeof MapsTool>;
  genealogyProps: ComponentProps<typeof GenealogyTool>;
  hitchcocksProps: ComponentProps<typeof HitchcocksTool>;
  notesProps: ComponentProps<typeof NotesTool>;
  bookmarksProps: ComponentProps<typeof BookmarksTool>;
};

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
  crossRefsProps,
  concordanceProps,
  webstersProps,
  strongsProps,
  oldEnglishProps,
  phrasesProps,
  unitsProps,
  mapsProps,
  genealogyProps,
  hitchcocksProps,
  notesProps,
  bookmarksProps,
}: ReaderStudySidebarProps) {
  return (
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
      notesContent={<NotesTool {...notesProps} />}
      bookmarksContent={<BookmarksTool {...bookmarksProps} />}
      toolsContent={
        <>
          <CrossRefsTool {...crossRefsProps} />
          <ConcordanceTool {...concordanceProps} />
          <WebstersTool {...webstersProps} />
          <StrongsTool {...strongsProps} />
          <OldEnglishTool {...oldEnglishProps} />
          <PhrasesTool {...phrasesProps} />
          <UnitsTool {...unitsProps} />
          <MapsTool {...mapsProps} />
          <GenealogyTool {...genealogyProps} />
          <HitchcocksTool {...hitchcocksProps} />
        </>
      }
    />
  );
}
