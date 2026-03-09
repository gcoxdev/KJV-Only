import type { ComponentProps } from "react";

import { CrossRefsTool } from "@/components/reader/study-tools/cross-refs-tool";
import { ConcordanceTool } from "@/components/reader/study-tools/concordance-tool";
import { WebstersTool } from "@/components/reader/study-tools/websters-tool";
import { StrongsTool } from "@/components/reader/study-tools/strongs-tool";
import { OldEnglishTool } from "@/components/reader/study-tools/old-english-tool";
import { MapsTool } from "@/components/reader/study-tools/maps-tool";
import { GenealogyTool } from "@/components/reader/study-tools/genealogy-tool";
import { HitchcocksTool } from "@/components/reader/study-tools/hitchcocks-tool";
import { NotesTool } from "@/components/reader/study-tools/notes-tool";
import { StudyToolsSidebar } from "@/components/reader/study-tools-sidebar";

type ReaderStudySidebarProps = {
  visible: boolean;
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  canExpand: boolean;
  canCollapse: boolean;
  crossRefsProps: ComponentProps<typeof CrossRefsTool>;
  concordanceProps: ComponentProps<typeof ConcordanceTool>;
  webstersProps: ComponentProps<typeof WebstersTool>;
  strongsProps: ComponentProps<typeof StrongsTool>;
  oldEnglishProps: ComponentProps<typeof OldEnglishTool>;
  mapsProps: ComponentProps<typeof MapsTool>;
  genealogyProps: ComponentProps<typeof GenealogyTool>;
  hitchcocksProps: ComponentProps<typeof HitchcocksTool>;
  notesProps: ComponentProps<typeof NotesTool>;
};

export function ReaderStudySidebar({
  visible,
  accordionValue,
  onAccordionValueChange,
  onExpandAll,
  onCollapseAll,
  canExpand,
  canCollapse,
  crossRefsProps,
  concordanceProps,
  webstersProps,
  strongsProps,
  oldEnglishProps,
  mapsProps,
  genealogyProps,
  hitchcocksProps,
  notesProps,
}: ReaderStudySidebarProps) {
  return (
    <StudyToolsSidebar
      visible={visible}
      accordionValue={accordionValue}
      onAccordionValueChange={onAccordionValueChange}
      onExpandAll={onExpandAll}
      onCollapseAll={onCollapseAll}
      canExpand={canExpand}
      canCollapse={canCollapse}
      notesContent={<NotesTool {...notesProps} />}
      toolsContent={
        <>
          <CrossRefsTool {...crossRefsProps} />
          <ConcordanceTool {...concordanceProps} />
          <WebstersTool {...webstersProps} />
          <StrongsTool {...strongsProps} />
          <OldEnglishTool {...oldEnglishProps} />
          <MapsTool {...mapsProps} />
          <GenealogyTool {...genealogyProps} />
          <HitchcocksTool {...hitchcocksProps} />
        </>
      }
    />
  );
}
