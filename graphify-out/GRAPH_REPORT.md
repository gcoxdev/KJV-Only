# Graph Report - src  (2026-08-23)

## Corpus Check
- 206 files · ~109,036 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1184 nodes · 3725 edges · 48 communities (45 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Reference Data and Study Hooks
- Editor Toolbar System
- Search and Verse Rendering
- Dialogs and Settings
- Color Picker
- Reader Orchestration
- Sidebar and Sheet Primitives
- Top Navigation Menus
- Reference Command Palette
- Layout Tree Operations
- Note Link Parsing
- Notes Workspace
- Form and Progress Primitives
- Panel Routing and Highlights
- Import and Export
- Combobox and Input Groups
- Bookmark Domain
- Map Data and Dialogs
- Study Tool Accordions
- Content Cards and Donation
- Offline Download Management
- Reader Panel Rendering
- Study Sidebar Controls
- Layout Hash Sharing
- Reference Popovers
- Concordance and Strongs UI
- Study Sidebar Composition
- Reader Workspace State
- Lexical Editor Core
- Tab and Panel Creation
- Leaf Navigation History
- Panel Neighbor Derivation
- Static Content Pages
- Study Search and Webster
- Welcome Home
- Help Search
- KJV Rationale Page
- Highlight Color Utilities
- Salvation Content Page
- AI Dictionary Tool
- KJV Phrase Tools
- Maps Study Tool
- Units Study Tool
- Application Bootstrap
- Guided Tour
- Bible Word Book
- Service Worker Cache Tests
- Leaflet Type Shims

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `KJVReader()` - 65 edges
3. `Button()` - 40 edges
4. `useToolbarContext()` - 39 edges
5. `Book` - 38 edges
6. `normalizeConcordanceWord()` - 29 edges
7. `createId()` - 25 edges
8. `useUpdateToolbarHandler()` - 20 edges
9. `SearchPage()` - 19 edges
10. `AccordionItem()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `RgbInput()` --calls--> `cn()`  [EXTRACTED]
  src/components/editor/editor-ui/color-picker.tsx → src/lib/utils.ts
- `KJVReader()` --indirect_call--> `defaultHighlightColor()`  [INFERRED]
  src/components/reader/kjv-reader.tsx → src/lib/highlight-color.ts
- `KJVReader()` --indirect_call--> `normalizeConcordanceWord()`  [INFERRED]
  src/components/reader/kjv-reader.tsx → src/lib/references.ts
- `OldEnglishTool()` --calls--> `cn()`  [EXTRACTED]
  src/components/reader/study-tools/old-english-tool.tsx → src/lib/utils.ts
- `PhrasesTool()` --calls--> `cn()`  [EXTRACTED]
  src/components/reader/study-tools/phrases-tool.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (48 total, 3 thin omitted)

### Community 0 - "Reference Data and Study Hooks"
Cohesion: 0.05
Nodes (86): StrongsTool(), deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, useGenealogySearchTool(), deriveStrongsSearchResults() (+78 more)

### Community 1 - "Editor Toolbar System"
Cohesion: 0.07
Nodes (54): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+46 more)

### Community 2 - "Search and Verse Rendering"
Cohesion: 0.05
Nodes (74): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), buildAudioUrls(), ProgressPanelContent() (+66 more)

### Community 3 - "Dialogs and Settings"
Cohesion: 0.06
Nodes (52): FloatingLinkEditor(), FloatingLinkEditorPlugin(), useFloatingLinkEditorToolbar(), setFloatingElemPositionForLinkEditor(), BookChapterPicker(), BookChapterPickerProps, BookPickerDialogProps, CompletionCelebration() (+44 more)

### Community 4 - "Color Picker"
Cohesion: 0.06
Nodes (64): ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea(), ColorPickerAreaProps, ColorPickerContent(), ColorPickerContentProps (+56 more)

### Community 5 - "Reader Orchestration"
Cohesion: 0.10
Nodes (36): BeforeInstallPromptEvent, isDedicatedLeafViewTab(), KJVReader(), LazyGenealogyTreeDialog, LazyMapAndPhotoDialogs, LazyReaderStudySidebar, LazyRenameTabDialog, panelNodeContainsView() (+28 more)

### Community 6 - "Sidebar and Sheet Primitives"
Cohesion: 0.06
Nodes (33): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), SidebarContext (+25 more)

### Community 7 - "Top Navigation Menus"
Cohesion: 0.10
Nodes (29): frameworks, roleItems, Example(), ExampleWrapper(), ReaderTopBar(), ReaderTopBarProps, collectLeafStates(), getTabIcon() (+21 more)

### Community 8 - "Reference Command Palette"
Cohesion: 0.09
Nodes (33): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+25 more)

### Community 9 - "Layout Tree Operations"
Cohesion: 0.13
Nodes (28): closeLeafInTab(), collectSameOrientationSplitIds(), countLeaves(), createdLeafIdFromWrappedNode(), directionOrientation(), findContiguousGroupRootId(), findGroupTargetNodeId(), findNodeById() (+20 more)

### Community 10 - "Note Link Parsing"
Cohesion: 0.17
Nodes (25): $createKjvInternalLinkNode(), NoteLinkAutoLinkPlugin(), applyInternalLink(), NoteLinkToolbarPlugin(), bookCodeForIndex(), bookPattern(), buildNoteLinkHref(), buildTypedReferenceRegex() (+17 more)

### Community 11 - "Notes Workspace"
Cohesion: 0.16
Nodes (24): createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps, parseSerializedState(), scopeFromContext(), scopeSummary() (+16 more)

### Community 12 - "Form and Progress Primitives"
Cohesion: 0.12
Nodes (25): GenealogyNode(), GenealogyRelationGrid(), AlertDialogOverlay(), Field(), FieldContent(), FieldDescription(), FieldError(), FieldGroup() (+17 more)

### Community 13 - "Panel Routing and Highlights"
Cohesion: 0.12
Nodes (21): ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), UsePanelRoutingParams, usePanelTargeting(), UsePanelTargetingParams, VerseHighlightRange, findLeafNode() (+13 more)

### Community 14 - "Import and Export"
Cohesion: 0.15
Nodes (24): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, BookmarksExportPayload, createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile(), ImportParseResult (+16 more)

### Community 15 - "Combobox and Input Groups"
Cohesion: 0.10
Nodes (20): ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent(), ComboboxGroup(), ComboboxInput(), ComboboxItem() (+12 more)

### Community 16 - "Bookmark Domain"
Cohesion: 0.21
Nodes (21): useReaderBookmarks(), UseReaderBookmarksArgs, BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical() (+13 more)

### Community 17 - "Map Data and Dialogs"
Cohesion: 0.15
Nodes (18): MapAndPhotoDialogs(), MapBoundsSync, useMapDialogState(), UseMapDialogStateArgs, useMapsSearchTool(), AncientMapEntry, AncientMapPayload, boundsForGeoJson() (+10 more)

### Community 18 - "Study Tool Accordions"
Cohesion: 0.15
Nodes (17): CrossRefsTool(), CrossRefsToolProps, selectedLabel(), GenealogyTool(), GenealogyToolProps, HitchcocksResult, HitchcocksTool(), HitchcocksToolProps (+9 more)

### Community 19 - "Content Cards and Donation"
Cohesion: 0.14
Nodes (17): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), ReaderStatusScreen(), ReaderStatusScreenProps (+9 more)

### Community 20 - "Offline Download Management"
Cohesion: 0.17
Nodes (19): bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage(), DownloadPageProps (+11 more)

### Community 21 - "Reader Panel Rendering"
Cohesion: 0.12
Nodes (17): AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage, LeafLocationPatch, ReaderLeafPanel, ReaderLeafPanelProps, ReaderPanelTree (+9 more)

### Community 22 - "Study Sidebar Controls"
Cohesion: 0.13
Nodes (16): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebar(), StudyToolsSidebarProps, ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+8 more)

### Community 23 - "Layout Hash Sharing"
Cohesion: 0.20
Nodes (17): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), normalizeVerseRanges(), ParsedLayoutHash, parseLayoutHash(), parseLeafToken() (+9 more)

### Community 24 - "Reference Popovers"
Cohesion: 0.17
Nodes (12): ConcordanceReferencePopoverProps, PhrasesResult, PhrasesTool(), PhrasesToolProps, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+4 more)

### Community 25 - "Concordance and Strongs UI"
Cohesion: 0.19
Nodes (11): ConcordanceReferencePopover, GenealogyPersonDetails(), GenealogyPersonDetailsProps, ConcordanceEntry, ConcordanceTool(), ConcordanceToolProps, StrongsResult, StrongsToolProps (+3 more)

### Community 26 - "Study Sidebar Composition"
Cohesion: 0.17
Nodes (10): ReaderStudySidebarProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, BookmarksTool(), TopicEntry, TopicsContentProps, TopicsPanel(), TopicsPanelProps (+2 more)

### Community 27 - "Reader Workspace State"
Cohesion: 0.20
Nodes (12): normalizeReaderMode(), normalizeTabsOrientation(), useReaderShellState(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS (+4 more)

### Community 28 - "Lexical Editor Core"
Cohesion: 0.18
Nodes (6): Editor(), editorConfig, nodes, isKjvInternalUrl(), KjvInternalLinkNode, editorTheme

### Community 29 - "Tab and Panel Creation"
Cohesion: 0.33
Nodes (12): createGenesisReaderTab(), createWelcomeHomeTab(), buildTargetedReaderPanelInTabState(), usePanelRouting(), useTabActions(), UseTabActionsArgs, createId(), createInitialTab() (+4 more)

### Community 30 - "Leaf Navigation History"
Cohesion: 0.29
Nodes (9): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams (+1 more)

### Community 31 - "Panel Neighbor Derivation"
Cohesion: 0.27
Nodes (10): UseReaderDerivedStateArgs, collectLeafIds(), buildLeafNeighborMap(), buildLeafNeighborMapFromDom(), collectLeafRects(), LeafNeighbors, LeafRect, neighborForDirection() (+2 more)

### Community 32 - "Static Content Pages"
Cohesion: 0.25
Nodes (9): ResourcesPage(), StaticPage(), StaticPageProps, WhyKJVOnlyPage(), getStaticPage(), STATIC_PAGE_MAP, STATIC_PAGES, StaticPageDefinition (+1 more)

### Community 33 - "Study Search and Webster"
Cohesion: 0.29
Nodes (8): resetStudySearchDraft(), shouldShowStudySearchResetButton(), StudySearchForm(), StudySearchFormProps, WebstersResult, WebstersTool(), WebstersToolProps, WebstersEntry

### Community 34 - "Welcome Home"
Cohesion: 0.29
Nodes (8): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, Switch(), DailyScriptureTopicsPayload, loadDailyScriptureTopics()

### Community 35 - "Help Search"
Cohesion: 0.31
Nodes (8): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), CardContent()

### Community 36 - "KJV Rationale Page"
Cohesion: 0.22
Nodes (7): CASE_AT_A_GLANCE, EXTERNAL_SOURCES, ExternalSource, KJV_ONLY_SECTIONS, KJVOnlySection, ScriptureReference, WhyKJVOnlyPageProps

### Community 37 - "Highlight Color Utilities"
Cohesion: 0.42
Nodes (7): channelToLinear(), contrastRatio(), defaultHighlightColor(), hexToRgb(), normalizeHighlightColor(), readableHighlightTextColor(), relativeLuminance()

### Community 38 - "Salvation Content Page"
Cohesion: 0.29
Nodes (7): GospelStep, HowToGetSavedPage(), HowToGetSavedPageProps, ReferenceList(), renderReferenceText(), ROMANS_ROAD_STEPS, ScriptureReference

### Community 39 - "AI Dictionary Tool"
Cohesion: 0.38
Nodes (6): AIDictionaryResult, AIDictionaryTool(), AIDictionaryToolProps, extractSeeReference(), renderAIDictionaryDefinition(), AIDictionaryEntry

### Community 40 - "KJV Phrase Tools"
Cohesion: 0.29
Nodes (6): CATEGORY_LABELS, KJVWordsPhrasesTool(), KJVWordsPhrasesToolProps, OldEnglishResult, PhrasesResult, UnitsResult

### Community 41 - "Maps Study Tool"
Cohesion: 0.38
Nodes (6): buildLinkedPlaces(), buildReferences(), DedupedLinkedPlace, MapsDisplayEntry, MapsTool(), MapsToolProps

### Community 42 - "Units Study Tool"
Cohesion: 0.33
Nodes (5): CATEGORY_LABELS, UnitsResult, UnitsTool(), UnitsToolProps, UnitsEntry

### Community 44 - "Guided Tour"
Cohesion: 0.40
Nodes (4): GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect

### Community 45 - "Bible Word Book"
Cohesion: 0.40
Nodes (4): BibleWordBookResult, BibleWordBookTool(), BibleWordBookToolProps, BibleWordBookEntry

## Knowledge Gaps
- **208 isolated node(s):** `editorConfig`, `frameworks`, `roleItems`, `Context`, `PossibleRef` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Form and Progress Primitives` to `Reference Data and Study Hooks`, `Editor Toolbar System`, `Search and Verse Rendering`, `Dialogs and Settings`, `Color Picker`, `Sidebar and Sheet Primitives`, `Top Navigation Menus`, `Reference Command Palette`, `Notes Workspace`, `Combobox and Input Groups`, `Study Tool Accordions`, `Content Cards and Donation`, `Reader Panel Rendering`, `Study Sidebar Controls`, `Reference Popovers`, `Concordance and Strongs UI`, `Study Sidebar Composition`, `Study Search and Webster`, `Welcome Home`, `Help Search`, `AI Dictionary Tool`, `KJV Phrase Tools`, `Maps Study Tool`, `Units Study Tool`, `Bible Word Book`?**
  _High betweenness centrality (0.220) - this node is a cross-community bridge._
- **Why does `Book` connect `Bookmark Domain` to `Static Content Pages`, `Editor Toolbar System`, `Search and Verse Rendering`, `Dialogs and Settings`, `Welcome Home`, `Reader Orchestration`, `Salvation Content Page`, `Reference Data and Study Hooks`, `Reference Command Palette`, `Note Link Parsing`, `Notes Workspace`, `Panel Routing and Highlights`, `Study Tool Accordions`, `Content Cards and Donation`, `Offline Download Management`, `Reader Panel Rendering`, `Lexical Editor Core`, `Panel Neighbor Derivation`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `Button()` connect `Dialogs and Settings` to `Editor Toolbar System`, `Search and Verse Rendering`, `Color Picker`, `Sidebar and Sheet Primitives`, `Top Navigation Menus`, `Note Link Parsing`, `Notes Workspace`, `Form and Progress Primitives`, `Combobox and Input Groups`, `Study Tool Accordions`, `Offline Download Management`, `Reader Panel Rendering`, `Study Sidebar Controls`, `Reference Popovers`, `Concordance and Strongs UI`, `Study Sidebar Composition`, `Welcome Home`, `Help Search`, `AI Dictionary Tool`, `Maps Study Tool`, `Guided Tour`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `KJVReader()` (e.g. with `defaultHighlightColor()` and `loadAIDictionary()`) actually correct?**
  _`KJVReader()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `editorConfig`, `frameworks`, `roleItems` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reference Data and Study Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.051589567865981345 - nodes in this community are weakly interconnected._
- **Should `Editor Toolbar System` be split into smaller, more focused modules?**
  _Cohesion score 0.06629243517775996 - nodes in this community are weakly interconnected._