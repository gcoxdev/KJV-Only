export const STUDY_ACCORDION_ITEMS = [
  "cross-refs",
  "concordance",
  "websters",
  "strongs",
  "units",
  "maps",
  "hitchcocks",
  "old-english",
  "genealogy",
] as const;

type UseStudySidebarStateArgs = {
  accordionValue: string[];
  crossRefsCount: number;
  concordanceCount: number;
  webstersCount: number;
  strongsCount: number;
  unitsCount: number;
  mapsCount: number;
  hitchcocksCount: number;
  oldEnglishCount: number;
  genealogyCount: number;
};

export function useStudySidebarState({
  accordionValue,
  crossRefsCount,
  concordanceCount,
  webstersCount,
  strongsCount,
  unitsCount,
  mapsCount,
  hitchcocksCount,
  oldEnglishCount,
  genealogyCount,
}: UseStudySidebarStateArgs) {
  const allStudyAccordionsOpen = STUDY_ACCORDION_ITEMS.every((item) =>
    accordionValue.includes(item),
  );
  const openStudySections = new Set(accordionValue);

  return {
    allStudyAccordionsOpen,
    isCrossRefsSectionOpen: openStudySections.has("cross-refs"),
    isConcordanceSectionOpen: openStudySections.has("concordance"),
    isWebstersSectionOpen: openStudySections.has("websters"),
    isStrongsSectionOpen: openStudySections.has("strongs"),
    isUnitsSectionOpen: openStudySections.has("units"),
    isMapsSectionOpen: openStudySections.has("maps"),
    isGenealogySectionOpen: openStudySections.has("genealogy"),
    isHitchcocksSectionOpen: openStudySections.has("hitchcocks"),
    isOldEnglishSectionOpen: openStudySections.has("old-english"),
    hasCrossRefsInfo: crossRefsCount > 0,
    hasConcordanceInfo: concordanceCount > 0,
    hasWebstersInfo: webstersCount > 0,
    hasStrongsInfo: strongsCount > 0,
    hasUnitsInfo: unitsCount > 0,
    hasMapsInfo: mapsCount > 0,
    hasHitchcocksInfo: hitchcocksCount > 0,
    hasOldEnglishInfo: oldEnglishCount > 0,
    hasGenealogyInfo: genealogyCount > 0,
  };
}

export const deriveStudySidebarState = useStudySidebarState;
