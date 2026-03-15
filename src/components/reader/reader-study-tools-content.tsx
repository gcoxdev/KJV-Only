import type { ComponentProps } from "react";

import { CrossRefsTool } from "@/components/reader/study-tools/cross-refs-tool";
import { ConcordanceTool } from "@/components/reader/study-tools/concordance-tool";
import { WebstersTool } from "@/components/reader/study-tools/websters-tool";
import { StrongsTool } from "@/components/reader/study-tools/strongs-tool";
import { KJVWordsPhrasesTool } from "@/components/reader/study-tools/kjv-words-phrases-tool";
import { BibleWordBookTool } from "@/components/reader/study-tools/bible-word-book-tool";
import { MapsTool } from "@/components/reader/study-tools/maps-tool";
import { GenealogyTool } from "@/components/reader/study-tools/genealogy-tool";
import { HitchcocksTool } from "@/components/reader/study-tools/hitchcocks-tool";

export type ReaderStudyToolsContentProps = {
  crossRefsProps: ComponentProps<typeof CrossRefsTool>;
  concordanceProps: ComponentProps<typeof ConcordanceTool>;
  webstersProps: ComponentProps<typeof WebstersTool>;
  strongsProps: ComponentProps<typeof StrongsTool>;
  kjvWordsPhrasesProps: ComponentProps<typeof KJVWordsPhrasesTool>;
  bibleWordBookProps: ComponentProps<typeof BibleWordBookTool>;
  mapsProps: ComponentProps<typeof MapsTool>;
  genealogyProps: ComponentProps<typeof GenealogyTool>;
  hitchcocksProps: ComponentProps<typeof HitchcocksTool>;
};

export function ReaderStudyToolsContent({
  crossRefsProps,
  concordanceProps,
  webstersProps,
  strongsProps,
  kjvWordsPhrasesProps,
  bibleWordBookProps,
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
      <KJVWordsPhrasesTool {...kjvWordsPhrasesProps} />
      <BibleWordBookTool {...bibleWordBookProps} />
      <MapsTool {...mapsProps} />
      <GenealogyTool {...genealogyProps} />
      <HitchcocksTool {...hitchcocksProps} />
    </>
  );
}
