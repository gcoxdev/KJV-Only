import { describe, expect, it, vi } from "vitest";

const reactMockState = vi.hoisted(() => ({ overrides: [] as unknown[] }));

vi.mock("react", () => ({
  useCallback: <T extends (...args: never[]) => unknown>(callback: T) => callback,
  useMemo: <T>(factory: () => T) => factory(),
  useState: <T>(initial: T | (() => T)) => {
    const fallback = typeof initial === "function" ? (initial as () => T)() : initial;
    return [
      reactMockState.overrides.length > 0
        ? (reactMockState.overrides.shift() as T)
        : fallback,
      vi.fn(),
    ];
  },
}));

import { useReaderDerivedState } from "@/hooks/use-reader-derived-state";
import {
  useBookmarksViewModel,
  useNotesSidebarViewModel,
  useProgressViewModel,
  useSettingsViewModel,
  useStudyToolsViewModel,
} from "@/hooks/use-reader-view-models";
import { STUDY_ACCORDION_ITEMS } from "@/hooks/use-study-sidebar-state";
import { useTabActions } from "@/hooks/use-tab-actions";
import type { Book } from "@/types/bible";
import type { LeafNode, ReaderTab } from "@/types/reader";

function book(name: string, chapterCount: number): Book {
  return {
    name,
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      chapter: index + 1,
      verses: [],
    })),
  };
}

function leaf(id: string, bookIndex = 0, chapterIndex = 0): LeafNode {
  return {
    id,
    type: "leaf",
    view: "reader",
    bookIndex,
    chapterIndex,
    pickerTestament: null,
    pickerBookIndex: null,
    pageId: null,
  };
}

describe("reader-derived state", () => {
  it("indexes chapters, panels, tabs, and testament progress", () => {
    const books = Array.from({ length: 40 }, (_, index) =>
      book(`Book ${index + 1}`, index === 0 ? 2 : 1),
    );
    const tabs: ReaderTab[] = [
      {
        id: "active",
        title: "Active",
        root: {
          id: "split",
          type: "split",
          orientation: "horizontal",
          ratio: 50,
          first: {
            id: "left",
            type: "leaf",
            view: "reader",
            bookIndex: 0,
            chapterIndex: 0,
            pickerTestament: null,
            pickerBookIndex: null,
            pageId: null,
          },
          second: {
            id: "right",
            type: "leaf",
            view: "reader",
            bookIndex: 0,
            chapterIndex: 1,
            pickerTestament: null,
            pickerBookIndex: null,
            pageId: null,
          },
        },
      },
      {
        id: "other",
        title: "Other",
        root: {
          id: "other-leaf",
          type: "leaf",
          view: "reader",
          bookIndex: 39,
          chapterIndex: 0,
          pickerTestament: null,
          pickerBookIndex: null,
          pageId: null,
        },
      },
    ];

    const result = useReaderDerivedState({
      books,
      tabs,
      activeTabId: "active",
      readChapters: new Set(["0:0", "39:0"]),
    });

    expect(result.chapterRefs).toHaveLength(41);
    expect(result.chapterRefIndex.get("0-1")).toBe(1);
    expect(result.activeTab?.id).toBe("active");
    expect(result.modelLeafNeighbors.size).toBe(2);
    expect(result.existingTabTargets).toEqual([
      { id: "other", index: 1, title: "Other" },
    ]);
    expect(result.progressByTestament.old.read).toBe(1);
    expect(result.progressByTestament.old.total).toBe(40);
    expect(result.progressByTestament.new.read).toBe(1);
    expect(result.progressByTestament.new.total).toBe(1);
    expect(result.progressByTestament.total).toEqual({ read: 2, total: 41 });
    expect(result.readChapterCountByBook.get(0)).toBe(1);
    expect(result.readChapterCountByBook.get(1)).toBe(0);
    expect(result.totalProgressPercent).toBe(5);
  });

  it("returns stable empty summaries without an active tab", () => {
    const result = useReaderDerivedState({
      books: [],
      tabs: [],
      activeTabId: null,
      readChapters: new Set(),
    });

    expect(result.activeTab).toBeNull();
    expect(result.modelLeafNeighbors.size).toBe(0);
    expect(result.progressByTestament.total).toEqual({ read: 0, total: 0 });
    expect(result.totalProgressPercent).toBe(0);
  });
});

describe("reader view-model adapters", () => {
  it("combines study searches and exposes accordion controls and state", () => {
    const onAccordionValueChange = vi.fn();
    const onOldEnglishSearch = vi.fn();
    const onPhrasesSearch = vi.fn();
    const onUnitsSearch = vi.fn();
    const marker = { marker: true };
    const params = {
      accordionValue: [...STUDY_ACCORDION_ITEMS],
      onAccordionValueChange,
      infoCounts: {
        crossRefs: 1,
        concordance: 0,
        websters: 1,
        aiDictionary: 0,
        strongs: 1,
        bibleWordBook: 0,
        kjvWordsPhrases: 1,
        maps: 0,
        hitchcocks: 1,
        genealogy: 0,
      },
      crossRefsProps: marker,
      concordanceProps: marker,
      webstersProps: marker,
      aiDictionaryProps: marker,
      strongsProps: marker,
      kjvWordsPhrasesProps: marker,
      onOldEnglishSearch,
      onPhrasesSearch,
      onUnitsSearch,
      bibleWordBookProps: marker,
      mapsProps: marker,
      genealogyProps: marker,
      hitchcocksProps: marker,
      topicsPanelProps: marker,
    } as unknown as Parameters<typeof useStudyToolsViewModel>[0];

    const model = useStudyToolsViewModel(params);
    model.sharedStudyToolsProps.kjvWordsPhrasesProps.onSearch("cubit");
    model.onCollapseAll();
    model.onExpandAll();

    expect(model.allStudyAccordionsOpen).toBe(true);
    expect(model.studyToolsPanelProps.canExpand).toBe(false);
    expect(model.studyToolsPanelProps.canCollapse).toBe(true);
    expect(model.sharedStudyToolsProps.crossRefsProps).toMatchObject({
      hasInfo: true,
      isOpen: true,
      marker: true,
    });
    expect(model.sharedStudyToolsProps.concordanceProps).toMatchObject({
      hasInfo: false,
      isOpen: true,
    });
    expect(onOldEnglishSearch).toHaveBeenCalledWith("cubit");
    expect(onPhrasesSearch).toHaveBeenCalledWith("cubit");
    expect(onUnitsSearch).toHaveBeenCalledWith("cubit");
    expect(onAccordionValueChange).toHaveBeenNthCalledWith(1, []);
    expect(onAccordionValueChange).toHaveBeenNthCalledWith(
      2,
      STUDY_ACCORDION_ITEMS,
    );
  });

  it("normalizes legacy study sections and empty information counts", () => {
    const marker = {};
    const model = useStudyToolsViewModel({
      accordionValue: ["old-english"],
      onAccordionValueChange: vi.fn(),
      infoCounts: {
        crossRefs: 0,
        concordance: 0,
        websters: 0,
        aiDictionary: 0,
        strongs: 0,
        bibleWordBook: 0,
        kjvWordsPhrases: 0,
        maps: 0,
        hitchcocks: 0,
        genealogy: 0,
      },
      crossRefsProps: marker,
      concordanceProps: marker,
      webstersProps: marker,
      aiDictionaryProps: marker,
      strongsProps: marker,
      kjvWordsPhrasesProps: marker,
      onOldEnglishSearch: vi.fn(),
      onPhrasesSearch: vi.fn(),
      onUnitsSearch: vi.fn(),
      bibleWordBookProps: marker,
      mapsProps: marker,
      genealogyProps: marker,
      hitchcocksProps: marker,
      topicsPanelProps: marker,
    } as unknown as Parameters<typeof useStudyToolsViewModel>[0]);

    expect(model.allStudyAccordionsOpen).toBe(false);
    expect(model.sharedStudyToolsProps.kjvWordsPhrasesProps.isOpen).toBe(true);
    expect(model.sharedStudyToolsProps.kjvWordsPhrasesProps.hasInfo).toBe(false);
    expect(model.studyToolsPanelProps.canExpand).toBe(true);
  });

  it("adapts settings actions without changing their public values", () => {
    const setFontSize = vi.fn();
    const setLightHighlightColor = vi.fn();
    const setDarkHighlightColor = vi.fn();
    const model = useSettingsViewModel({
      setFontSize,
      setLightHighlightColor,
      setDarkHighlightColor,
      activeTab: "reader",
      theme: "dark",
      fontSize: 20,
      lightHighlightColor: "#abcdef",
      darkHighlightColor: "#123456",
    } as unknown as Parameters<typeof useSettingsViewModel>[0]);

    model.onIncreaseFontSize();
    model.onDecreaseFontSize();
    model.onResetFontSize();
    model.onLightHighlightColorChange(" #ABCDEF ");
    model.onResetLightHighlightColor();
    model.onDarkHighlightColorChange("invalid");
    model.onResetDarkHighlightColor();

    expect(setFontSize.mock.calls[0][0](12)).toBe(16);
    expect(setFontSize.mock.calls[1][0](10)).toBe(8);
    expect(setFontSize.mock.calls[1][0](20)).toBe(16);
    expect(setFontSize).toHaveBeenNthCalledWith(3, 16);
    expect(setLightHighlightColor).toHaveBeenNthCalledWith(1, "#abcdef");
    expect(setLightHighlightColor).toHaveBeenNthCalledWith(2, "#fafac5");
    expect(setDarkHighlightColor).toHaveBeenNthCalledWith(1, "#fafac5");
    expect(setDarkHighlightColor).toHaveBeenNthCalledWith(2, "#fafac5");
    expect(model).toMatchObject({
      activeTab: "reader",
      theme: "dark",
      fontSize: 20,
      lightHighlightColor: "#abcdef",
      darkHighlightColor: "#123456",
    });
  });

  it("coordinates note creation, opening, and chapter context", () => {
    const openNotesTab = vi.fn();
    const closeRightSidebarForMobile = vi.fn();
    const createGeneralNote = vi.fn(() => "general-note");
    const createContextNote = vi
      .fn()
      .mockReturnValueOnce("context-note")
      .mockReturnValueOnce(null);
    const setNotesContext = vi.fn();
    const notesContext = { bookIndex: 1, chapterIndex: 2, verseNumber: 3 };
    const generalNotes = [{ id: "general-note" }];
    const contextNotes = [{ id: "context-note" }];
    const model = useNotesSidebarViewModel({
      books: [book("Genesis", 1)],
      generalNotes,
      contextNotes,
      notesContext,
      openNotesTab,
      closeRightSidebarForMobile,
      createGeneralNote,
      createContextNote,
      setNotesContext,
    } as unknown as Parameters<typeof useNotesSidebarViewModel>[0]);

    model.onOpenNotesTab("existing-note");
    model.onCreateGeneralNote();
    model.onCreateContextNote();
    model.onCreateContextNote();
    model.onSetChapterContext();

    expect(openNotesTab).toHaveBeenNthCalledWith(1, "existing-note");
    expect(openNotesTab).toHaveBeenNthCalledWith(2, "general-note");
    expect(openNotesTab).toHaveBeenNthCalledWith(3, "context-note");
    expect(closeRightSidebarForMobile).toHaveBeenCalledTimes(3);
    expect(createContextNote).toHaveBeenCalledWith(notesContext);
    const contextUpdater = setNotesContext.mock.calls[0][0];
    expect(contextUpdater(null)).toBeNull();
    expect(contextUpdater(notesContext)).toEqual({
      bookIndex: 1,
      chapterIndex: 2,
    });
    expect(model).toMatchObject({ generalNotes, contextNotes, context: notesContext });
  });

  it("keeps identity-only bookmark and progress adapters transparent", () => {
    const bookmarks = { marker: "bookmarks" };
    const progress = { marker: "progress" };

    expect(useBookmarksViewModel(bookmarks as never)).toBe(bookmarks);
    expect(useProgressViewModel(progress as never)).toBe(progress);
  });
});

describe("reader tab actions", () => {
  it("moves panels and tabs while preserving a usable source workspace", () => {
    let tabsState: ReaderTab[] = [
      {
        id: "source",
        title: "Source",
        root: {
          id: "source-split",
          type: "split",
          orientation: "horizontal",
          ratio: 50,
          first: leaf("first"),
          second: leaf("second", 0, 1),
        },
      },
      { id: "target", title: "Target", root: leaf("target-leaf", 1, 0) },
    ];
    const setTabs = vi.fn((update: (tabs: ReaderTab[]) => ReaderTab[]) => {
      tabsState = update(tabsState);
    });
    const setActiveTabId = vi.fn();
    const clearAllPanelPreviews = vi.fn();
    const scrollIntoView = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const actions = useTabActions({
      tabs: tabsState,
      setTabs,
      activeTabId: "source",
      setActiveTabId,
      tabsOrientation: "horizontal",
      tabEndRef: { current: { scrollIntoView } },
      clearAllPanelPreviews,
    } as unknown as Parameters<typeof useTabActions>[0]);

    actions.moveLeafToNewTab("missing");
    expect(tabsState).toHaveLength(2);
    actions.moveLeafToNewTab("first");
    expect(tabsState).toHaveLength(3);
    expect(tabsState[0].root).toMatchObject({ id: "second" });
    expect(tabsState[2].root).toMatchObject({ id: "first" });

    actions.moveLeafToExistingTab("second", "source");
    actions.moveLeafToExistingTab("missing", "target");
    actions.moveLeafToExistingTab("second", "target");
    expect(tabsState[0].root).toMatchObject({ type: "leaf", view: "picker" });
    expect(tabsState[1].root).toMatchObject({
      type: "split",
      first: { id: "target-leaf" },
      second: { id: "second" },
    });
    expect(setActiveTabId).toHaveBeenCalledWith("target");
    expect(clearAllPanelPreviews).toHaveBeenCalledTimes(3);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("adds, closes, moves, reorders, and validates tab labels", () => {
    let tabsState: ReaderTab[] = [
      { id: "one", title: "One", root: leaf("one-leaf") },
      { id: "two", title: "Two", root: leaf("two-leaf") },
      { id: "three", title: "Three", root: leaf("three-leaf") },
    ];
    const setTabs = vi.fn((update: (tabs: ReaderTab[]) => ReaderTab[]) => {
      tabsState = update(tabsState);
    });
    const setActiveTabId = vi.fn();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    const actions = useTabActions({
      tabs: tabsState,
      setTabs,
      activeTabId: "two",
      setActiveTabId,
      tabsOrientation: "vertical",
      tabEndRef: { current: { scrollIntoView: vi.fn() } },
      clearAllPanelPreviews: vi.fn(),
    } as unknown as Parameters<typeof useTabActions>[0]);

    actions.addTab();
    expect(tabsState).toHaveLength(4);
    expect(tabsState[3]).toMatchObject({ title: "Tab 4" });

    actions.closeTab("missing");
    actions.closeTab("two");
    expect(tabsState.some((tab) => tab.id === "two")).toBe(false);
    expect(setActiveTabId).toHaveBeenCalledWith("one");

    actions.moveTab("", 1);
    actions.moveTab("missing", 1);
    actions.moveTab("one", -1);
    actions.moveTab("one", 1);
    expect(tabsState[1].id).toBe("one");

    actions.reorderTab("one", "one");
    actions.reorderTab("missing", "three");
    actions.reorderTab("one", "three");
    expect(tabsState.slice(0, 2).map((tab) => tab.id)).toEqual(["one", "three"]);
    expect(tabsState.map((tab) => tab.id)).toContain("one");

    actions.openRenameDialog("missing");
    actions.openRenameDialog("one");
    actions.confirmRenameTab();
    actions.onRenameValueChange("  ");
    actions.onRenameValueChange("Reading");
    actions.onRenameCancel();
    actions.closeTab("three");

    expect(actions.isRenameDialogOpen).toBe(false);
    expect(actions.renameValue).toBe("");
    expect(actions.renameError).toBeNull();
    expect(tabsState.some((tab) => tab.id === "three")).toBe(false);
  });

  it("does not close the only remaining tab or move without an active tab", () => {
    const onlyTab: ReaderTab = {
      id: "only",
      title: "Only",
      root: leaf("only-leaf"),
    };
    let tabsState: ReaderTab[] = [onlyTab];
    const setTabs = vi.fn((update: (tabs: ReaderTab[]) => ReaderTab[]) => {
      tabsState = update(tabsState);
    });
    const actions = useTabActions({
      tabs: tabsState,
      setTabs,
      activeTabId: null,
      setActiveTabId: vi.fn(),
      tabsOrientation: "horizontal",
      tabEndRef: { current: null },
      clearAllPanelPreviews: vi.fn(),
    } as unknown as Parameters<typeof useTabActions>[0]);

    actions.closeTab("only");
    actions.moveLeafToNewTab("only-leaf");
    actions.moveLeafToExistingTab("only-leaf", "other");

    expect(tabsState).toEqual([onlyTab]);
  });

  it("accepts trimmed rename values and rejects empty ones", () => {
    const tabs: ReaderTab[] = [
      { id: "one", title: "One", root: leaf("one-leaf") },
      { id: "two", title: "Two", root: leaf("two-leaf") },
    ];
    let tabsState: ReaderTab[] = tabs;
    const setTabs = vi.fn((update: (current: ReaderTab[]) => ReaderTab[]) => {
      tabsState = update(tabsState);
    });
    const params = {
      tabs,
      setTabs,
      activeTabId: "one",
      setActiveTabId: vi.fn(),
      tabsOrientation: "horizontal",
      tabEndRef: { current: null },
      clearAllPanelPreviews: vi.fn(),
    } as unknown as Parameters<typeof useTabActions>[0];

    reactMockState.overrides.push(true, "one", "  Reading Plan  ", null);
    useTabActions(params).confirmRenameTab();
    expect(tabsState).toEqual([
      { ...tabs[0], title: "Reading Plan" },
      tabs[1],
    ]);

    reactMockState.overrides.push(true, "one", "   ", null);
    useTabActions(params).confirmRenameTab();
    expect(setTabs).toHaveBeenCalledTimes(1);
  });

  it("leaves tab state alone when action targets disappear", () => {
    const tabs: ReaderTab[] = [
      { id: "source", title: "Source", root: leaf("source-leaf") },
      { id: "target", title: "Target", root: leaf("target-leaf") },
    ];
    let tabsState: ReaderTab[] = tabs;
    const setTabs = vi.fn((update: (current: ReaderTab[]) => ReaderTab[]) => {
      tabsState = update(tabsState);
    });
    const baseParams = {
      tabs,
      setTabs,
      setActiveTabId: vi.fn(),
      tabsOrientation: "horizontal",
      tabEndRef: { current: null },
      clearAllPanelPreviews: vi.fn(),
    };

    const missingSource = useTabActions({
      ...baseParams,
      activeTabId: "gone",
    } as unknown as Parameters<typeof useTabActions>[0]);
    missingSource.moveLeafToNewTab("source-leaf");
    missingSource.moveLeafToExistingTab("source-leaf", "target");
    expect(tabsState).toBe(tabs);

    const singleLeafSource = useTabActions({
      ...baseParams,
      activeTabId: "source",
    } as unknown as Parameters<typeof useTabActions>[0]);
    singleLeafSource.moveLeafToNewTab("source-leaf");
    expect(tabsState).toHaveLength(3);
    expect(tabsState[0].root).toMatchObject({ type: "leaf", view: "picker" });

    const noOpSetTabs = vi.fn();
    useTabActions({
      ...baseParams,
      setTabs: noOpSetTabs,
      activeTabId: "source",
    } as unknown as Parameters<typeof useTabActions>[0]).addTab();
    expect(noOpSetTabs).toHaveBeenCalledOnce();
  });
});
