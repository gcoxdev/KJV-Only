import {
  useCallback,
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { ProgressPanelContentProps } from "@/components/reader/progress-dialog";
import type { ReaderStudyToolsContentProps } from "@/components/reader/reader-study-tools-content";
import type { SettingsPanelContentProps } from "@/components/reader/settings-dialog";
import type { BookmarksToolProps } from "@/components/reader/study-tools/bookmarks-tool";
import type { NotesTool } from "@/components/reader/study-tools/notes-tool";
import {
  STUDY_ACCORDION_ITEMS,
  deriveStudySidebarState,
} from "@/hooks/use-study-sidebar-state";
import {
  defaultHighlightColor,
  normalizeHighlightColor,
} from "@/lib/highlight-color";
import type { Book } from "@/types/bible";
import type { NotesContext, ReaderNote } from "@/types/notes";

type StudyToolKey = keyof ReaderStudyToolsContentProps;
type StudyToolInput<Key extends StudyToolKey> = Omit<
  ReaderStudyToolsContentProps[Key],
  "hasInfo" | "isOpen"
>;

type StudyInfoCounts = {
  crossRefs: number;
  concordance: number;
  websters: number;
  aiDictionary: number;
  strongs: number;
  bibleWordBook: number;
  kjvWordsPhrases: number;
  maps: number;
  hitchcocks: number;
  genealogy: number;
};

type UseStudyToolsViewModelParams = {
  accordionValue: string[];
  onAccordionValueChange: (value: string[]) => void;
  infoCounts: StudyInfoCounts;
  crossRefsProps: StudyToolInput<"crossRefsProps">;
  concordanceProps: StudyToolInput<"concordanceProps">;
  webstersProps: StudyToolInput<"webstersProps">;
  aiDictionaryProps: StudyToolInput<"aiDictionaryProps">;
  strongsProps: StudyToolInput<"strongsProps">;
  kjvWordsPhrasesProps: Omit<
    StudyToolInput<"kjvWordsPhrasesProps">,
    "onSearch"
  >;
  onOldEnglishSearch: (term: string) => void;
  onPhrasesSearch: (term: string) => void;
  onUnitsSearch: (term: string) => void;
  bibleWordBookProps: StudyToolInput<"bibleWordBookProps">;
  mapsProps: StudyToolInput<"mapsProps">;
  genealogyProps: StudyToolInput<"genealogyProps">;
  hitchcocksProps: StudyToolInput<"hitchcocksProps">;
};

export function useStudyToolsViewModel({
  accordionValue,
  onAccordionValueChange,
  infoCounts,
  crossRefsProps,
  concordanceProps,
  webstersProps,
  aiDictionaryProps,
  strongsProps,
  kjvWordsPhrasesProps,
  onOldEnglishSearch,
  onPhrasesSearch,
  onUnitsSearch,
  bibleWordBookProps,
  mapsProps,
  genealogyProps,
  hitchcocksProps,
}: UseStudyToolsViewModelParams) {
  const sidebarState = deriveStudySidebarState({
    accordionValue,
    crossRefsCount: infoCounts.crossRefs,
    concordanceCount: infoCounts.concordance,
    webstersCount: infoCounts.websters,
    aiDictionaryCount: infoCounts.aiDictionary,
    strongsCount: infoCounts.strongs,
    bibleWordBookCount: infoCounts.bibleWordBook,
    kjvWordsPhrasesCount: infoCounts.kjvWordsPhrases,
    mapsCount: infoCounts.maps,
    hitchcocksCount: infoCounts.hitchcocks,
    genealogyCount: infoCounts.genealogy,
  });

  const onKjvWordsPhrasesSearch = useCallback(
    (term: string) => {
      onOldEnglishSearch(term);
      onPhrasesSearch(term);
      onUnitsSearch(term);
    },
    [onOldEnglishSearch, onPhrasesSearch, onUnitsSearch],
  );
  const onExpandAll = useCallback(() => {
    onAccordionValueChange([...STUDY_ACCORDION_ITEMS]);
  }, [onAccordionValueChange]);
  const onCollapseAll = useCallback(() => {
    onAccordionValueChange([]);
  }, [onAccordionValueChange]);

  const sharedStudyToolsProps: ReaderStudyToolsContentProps = {
    crossRefsProps: {
      hasInfo: sidebarState.hasCrossRefsInfo,
      isOpen: sidebarState.isCrossRefsSectionOpen,
      ...crossRefsProps,
    },
    concordanceProps: {
      hasInfo: sidebarState.hasConcordanceInfo,
      isOpen: sidebarState.isConcordanceSectionOpen,
      ...concordanceProps,
    },
    webstersProps: {
      hasInfo: sidebarState.hasWebstersInfo,
      isOpen: sidebarState.isWebstersSectionOpen,
      ...webstersProps,
    },
    aiDictionaryProps: {
      hasInfo: sidebarState.hasAIDictionaryInfo,
      isOpen: sidebarState.isAIDictionarySectionOpen,
      ...aiDictionaryProps,
    },
    strongsProps: {
      hasInfo: sidebarState.hasStrongsInfo,
      isOpen: sidebarState.isStrongsSectionOpen,
      ...strongsProps,
    },
    kjvWordsPhrasesProps: {
      hasInfo: sidebarState.hasKjvWordsPhrasesInfo,
      isOpen: sidebarState.isKjvWordsPhrasesSectionOpen,
      ...kjvWordsPhrasesProps,
      onSearch: onKjvWordsPhrasesSearch,
    },
    bibleWordBookProps: {
      hasInfo: sidebarState.hasBibleWordBookInfo,
      isOpen: sidebarState.isBibleWordBookSectionOpen,
      ...bibleWordBookProps,
    },
    mapsProps: {
      hasInfo: sidebarState.hasMapsInfo,
      isOpen: sidebarState.isMapsSectionOpen,
      ...mapsProps,
    },
    genealogyProps: {
      hasInfo: sidebarState.hasGenealogyInfo,
      isOpen: sidebarState.isGenealogySectionOpen,
      ...genealogyProps,
    },
    hitchcocksProps: {
      hasInfo: sidebarState.hasHitchcocksInfo,
      isOpen: sidebarState.isHitchcocksSectionOpen,
      ...hitchcocksProps,
    },
  };

  return {
    allStudyAccordionsOpen: sidebarState.allStudyAccordionsOpen,
    sharedStudyToolsProps,
    onExpandAll,
    onCollapseAll,
  };
}

type UseSettingsViewModelParams = Omit<
  SettingsPanelContentProps,
  | "onIncreaseFontSize"
  | "onDecreaseFontSize"
  | "onResetFontSize"
  | "onLightHighlightColorChange"
  | "onResetLightHighlightColor"
  | "onDarkHighlightColorChange"
  | "onResetDarkHighlightColor"
> & {
  setFontSize: Dispatch<SetStateAction<number>>;
  setLightHighlightColor: Dispatch<SetStateAction<string>>;
  setDarkHighlightColor: Dispatch<SetStateAction<string>>;
};

export function useSettingsViewModel({
  setFontSize,
  setLightHighlightColor,
  setDarkHighlightColor,
  activeTab,
  onActiveTabChange,
  theme,
  onThemeChange,
  readerColorTheme,
  onReaderColorThemeChange,
  fontSize,
  lightHighlightColor,
  darkHighlightColor,
  verseSpacing,
  onVerseSpacingChange,
  contextVerseCount,
  onContextVerseCountChange,
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
  referenceLinkOpenTarget,
  onReferenceLinkOpenTargetChange,
  showWelcomeHomeAtStartup,
  onShowWelcomeHomeAtStartupChange,
}: UseSettingsViewModelParams) {
  const onIncreaseFontSize = useCallback(() => {
    setFontSize((current) => current + 4);
  }, [setFontSize]);
  const onDecreaseFontSize = useCallback(() => {
    setFontSize((current) => Math.max(8, current - 4));
  }, [setFontSize]);
  const onResetFontSize = useCallback(() => {
    setFontSize(16);
  }, [setFontSize]);
  const onLightHighlightColorChange = useCallback(
    (value: string) => {
      setLightHighlightColor(normalizeHighlightColor(value));
    },
    [setLightHighlightColor],
  );
  const onResetLightHighlightColor = useCallback(() => {
    setLightHighlightColor(defaultHighlightColor());
  }, [setLightHighlightColor]);
  const onDarkHighlightColorChange = useCallback(
    (value: string) => {
      setDarkHighlightColor(normalizeHighlightColor(value));
    },
    [setDarkHighlightColor],
  );
  const onResetDarkHighlightColor = useCallback(() => {
    setDarkHighlightColor(defaultHighlightColor());
  }, [setDarkHighlightColor]);

  return {
    activeTab,
    onActiveTabChange,
    theme,
    onThemeChange,
    readerColorTheme,
    onReaderColorThemeChange,
    fontSize,
    onIncreaseFontSize,
    onDecreaseFontSize,
    onResetFontSize,
    lightHighlightColor,
    onLightHighlightColorChange,
    onResetLightHighlightColor,
    darkHighlightColor,
    onDarkHighlightColorChange,
    onResetDarkHighlightColor,
    verseSpacing,
    onVerseSpacingChange,
    contextVerseCount,
    onContextVerseCountChange,
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
    referenceLinkOpenTarget,
    onReferenceLinkOpenTargetChange,
    showWelcomeHomeAtStartup,
    onShowWelcomeHomeAtStartupChange,
  } satisfies SettingsPanelContentProps;
}

export function useBookmarksViewModel(props: BookmarksToolProps) {
  return props;
}

export function useProgressViewModel(props: ProgressPanelContentProps) {
  return props;
}

type NotesSidebarProps = ComponentProps<typeof NotesTool>;

type UseNotesSidebarViewModelParams = {
  books: Book[];
  generalNotes: ReaderNote[];
  contextNotes: ReaderNote[];
  notesContext: NotesContext | null;
  openNotesTab: (noteId?: string | null) => void;
  closeRightSidebarForMobile: () => void;
  createGeneralNote: () => string;
  createContextNote: (context: NotesContext | null) => string | null;
  setNotesContext: Dispatch<SetStateAction<NotesContext | null>>;
};

export function useNotesSidebarViewModel({
  books,
  generalNotes,
  contextNotes,
  notesContext,
  openNotesTab,
  closeRightSidebarForMobile,
  createGeneralNote,
  createContextNote,
  setNotesContext,
}: UseNotesSidebarViewModelParams) {
  const onOpenNotesTab = useCallback(
    (noteId?: string | null) => {
      openNotesTab(noteId);
      closeRightSidebarForMobile();
    },
    [closeRightSidebarForMobile, openNotesTab],
  );
  const onCreateGeneralNote = useCallback(() => {
    const noteId = createGeneralNote();
    openNotesTab(noteId);
    closeRightSidebarForMobile();
  }, [closeRightSidebarForMobile, createGeneralNote, openNotesTab]);
  const onCreateContextNote = useCallback(() => {
    const noteId = createContextNote(notesContext);
    if (noteId) {
      openNotesTab(noteId);
      closeRightSidebarForMobile();
    }
  }, [
    closeRightSidebarForMobile,
    createContextNote,
    notesContext,
    openNotesTab,
  ]);
  const onSetChapterContext = useCallback(() => {
    setNotesContext((current) => {
      if (!current) {
        return current;
      }
      return {
        bookIndex: current.bookIndex,
        chapterIndex: current.chapterIndex,
      };
    });
  }, [setNotesContext]);

  return {
    books,
    generalNotes,
    contextNotes,
    context: notesContext,
    onOpenNotesTab,
    onCreateGeneralNote,
    onCreateContextNote,
    onSetChapterContext,
  } satisfies NotesSidebarProps;
}
