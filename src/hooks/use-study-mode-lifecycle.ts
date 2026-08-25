import { useEffect } from "react";

export type StudyModeTeardownActions = {
  closeSidebar: () => void;
  resetAccordions: () => void;
  resetConcordance: () => void;
  resetWebsters: () => void;
  resetHitchcocks: () => void;
  resetBibleWordBook: () => void;
  resetOldEnglish: () => void;
  resetGenealogy: () => void;
  resetStrongs: () => void;
  resetMaps: () => void;
  resetMapDialog: () => void;
};

export function runStudyModeTeardown({
  closeSidebar,
  resetAccordions,
  resetConcordance,
  resetWebsters,
  resetHitchcocks,
  resetBibleWordBook,
  resetOldEnglish,
  resetGenealogy,
  resetStrongs,
  resetMaps,
  resetMapDialog,
}: StudyModeTeardownActions) {
  closeSidebar();
  resetAccordions();
  resetConcordance();
  resetWebsters();
  resetHitchcocks();
  resetBibleWordBook();
  resetOldEnglish();
  resetGenealogy();
  resetStrongs();
  resetMaps();
  resetMapDialog();
}

export function useStudyModeLifecycle(
  isStudyMode: boolean,
  {
    closeSidebar,
    resetAccordions,
    resetConcordance,
    resetWebsters,
    resetHitchcocks,
    resetBibleWordBook,
    resetOldEnglish,
    resetGenealogy,
    resetStrongs,
    resetMaps,
    resetMapDialog,
  }: StudyModeTeardownActions,
) {
  useEffect(() => {
    if (isStudyMode) {
      return;
    }

    runStudyModeTeardown({
      closeSidebar,
      resetAccordions,
      resetConcordance,
      resetWebsters,
      resetHitchcocks,
      resetBibleWordBook,
      resetOldEnglish,
      resetGenealogy,
      resetStrongs,
      resetMaps,
      resetMapDialog,
    });
  }, [
    closeSidebar,
    isStudyMode,
    resetAccordions,
    resetBibleWordBook,
    resetConcordance,
    resetGenealogy,
    resetHitchcocks,
    resetMapDialog,
    resetMaps,
    resetOldEnglish,
    resetStrongs,
    resetWebsters,
  ]);
}
