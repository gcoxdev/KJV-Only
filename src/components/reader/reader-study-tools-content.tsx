import type { ComponentProps } from "react";

import { CrossRefsTool } from "@/components/reader/study-tools/cross-refs-tool";
import { ConcordanceTool } from "@/components/reader/study-tools/concordance-tool";
import { WebstersTool } from "@/components/reader/study-tools/websters-tool";
import { StrongsTool } from "@/components/reader/study-tools/strongs-tool";
import { OldEnglishTool } from "@/components/reader/study-tools/old-english-tool";
import { BibleWordBookTool } from "@/components/reader/study-tools/bible-word-book-tool";
import { PhrasesTool } from "@/components/reader/study-tools/phrases-tool";
import { UnitsTool } from "@/components/reader/study-tools/units-tool";
import { MapsTool } from "@/components/reader/study-tools/maps-tool";
import { GenealogyTool } from "@/components/reader/study-tools/genealogy-tool";
import { HitchcocksTool } from "@/components/reader/study-tools/hitchcocks-tool";

export type ReaderStudyToolsContentProps = {
  crossRefsProps: ComponentProps<typeof CrossRefsTool>;
  concordanceProps: ComponentProps<typeof ConcordanceTool>;
  webstersProps: ComponentProps<typeof WebstersTool>;
  strongsProps: ComponentProps<typeof StrongsTool>;
  oldEnglishProps: ComponentProps<typeof OldEnglishTool>;
  bibleWordBookProps: ComponentProps<typeof BibleWordBookTool>;
  phrasesProps: ComponentProps<typeof PhrasesTool>;
  unitsProps: ComponentProps<typeof UnitsTool>;
  mapsProps: ComponentProps<typeof MapsTool>;
  genealogyProps: ComponentProps<typeof GenealogyTool>;
  hitchcocksProps: ComponentProps<typeof HitchcocksTool>;
};

export function ReaderStudyToolsContent({
  crossRefsProps,
  concordanceProps,
  webstersProps,
  strongsProps,
  oldEnglishProps,
  bibleWordBookProps,
  phrasesProps,
  unitsProps,
  mapsProps,
  genealogyProps,
  hitchcocksProps,
}: ReaderStudyToolsContentProps) {
  return (
    <>
      <CrossRefsTool {...crossRefsProps} />
      <ConcordanceTool {...concordanceProps} />
      <WebstersTool {...webstersProps} />
      <StrongsTool {...strongsProps} />
      <OldEnglishTool {...oldEnglishProps} />
      <BibleWordBookTool {...bibleWordBookProps} />
      <PhrasesTool {...phrasesProps} />
      <UnitsTool {...unitsProps} />
      <MapsTool {...mapsProps} />
      <GenealogyTool {...genealogyProps} />
      <HitchcocksTool {...hitchcocksProps} />
    </>
  );
}
