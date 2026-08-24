# Graph Report - .  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3091 nodes · 6133 edges · 213 communities (181 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd1a893b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- plugins.tsx
- kjv-reader.tsx
- color-picker.tsx
- enum
- reader-layout.ts
- sidebar.tsx
- cn
- dependencies
- notes-page.tsx
- note-links.ts
- Modern locations (modern.jsonl)
- enum
- component-example.tsx
- properties
- Largest Differences
- reader-transfer.ts
- reference-command.ts
- settings-dialog.tsx
- reader-panel-tree.tsx
- enum
- reader.ts
- id
- chapter-text-content.tsx
- compilerOptions
- local-storage.ts
- properties
- Data, Offline Cache, and Deployment
- properties
- properties
- properties
- properties
- fetch-map-photos.mjs
- use-leaf-history.ts
- properties
- required
- properties
- definitions
- Codebase Improvement Plan
- download-page.tsx
- genealogy.ts
- compilerOptions
- card.tsx
- lib/bookmarks.ts
- search.ts
- components.json
- scripts
- enum
- report-strongs-derivation-links.mjs
- reader-transfer.test.ts
- required
- build-genealogy-compact.mjs
- bookmarks-tool.tsx
- accordion.tsx
- maps.ts
- layout-hash.ts
- properties
- bible.ts
- definitions
- properties
- import_osis_to_sqlite.py
- devDependencies
- properties
- properties
- enum
- use-reader-corpus.ts
- properties
- properties
- use-reader-notes.ts
- guided-tour.tsx
- build-kjv-runtime-manifest.mjs
- definitions
- properties
- check-dist.mjs
- search-page.tsx
- topics-tool.tsx
- use-study-workspace-state.ts
- ^s[0-9a-f]{6}$
- build-map-json.mjs
- alternate_verses
- properties
- enum
- definitions
- enum
- required
- id
- enum
- description
- KJV Only Hardening Remediation Report
- Webster Source Analysis
- genealogy-tree-dialog.tsx
- kjv-words-phrases-tool.tsx
- source_id
- properties
- required
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- static-page.tsx
- swapRecordEntries
- use-word-study-navigation.ts
- enum
- properties
- required
- enum
- suggested
- KJV Only Project Assessment
- build-topics-index.mjs
- concordance-reference-popover.tsx
- study-search-form.tsx
- kjv-corpus-manifest.ts
- regex-search.ts
- geojson_geometry
- geometry.json
- enum
- Genealogy Note Reference Report
- why-kjv-only-page.tsx
- media_parent
- items
- image.json
- source.json
- sw.js
- Genealogy Note Cleanup Preview
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- vite.config.ts
- donate-page.tsx
- how-to-get-saved-page.tsx
- globals
- welcome-home-page.tsx
- enum
- types
- votes
- ^a[0-9a-f]{6}$
- geometry
- Webster Coverage Report
- websters-import-ready-candidates.md
- Webster Proposed Add List
- ai-dictionary-tool.tsx
- maps-tool.tsx
- enum
- osm_version
- enum
- enum
- enum
- Security assessment
- websters-coverage-refined-report.md
- websters-high-value-candidates-report.md
- tsconfig.json
- package.json
- alternate_roots
- google_books_id
- enum
- enum
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- Webster Import Preview
- App.tsx
- strongs-tool.tsx
- use-study-sidebar-state.ts
- service-worker-cache.ts
- alternate_urls
- contributors
- vote_count
- Testing, linting, and release engineering
- Performance assessment
- Strong's Derivation Link Audit
- WebstersTool
- geometry_id
- lonlat
- modern_id
- source_id
- uri
- lonlat
- descriptions
- meters_per_pixel
- thumbnails
- geometry_id
- geojson_roles
- abbreviation
- friendly_id
- id
- AI Dictionary Current High-Value Gaps
- cache-config.d.ts
- leaflet-shim.d.ts
- eslint-plugin-react-hooks
- shadcn
- tailwindcss
- @tailwindcss/vite
- @types/react
- typescript-eslint
- vite
- @vitejs/plugin-react
- vitest
- @vitest/coverage-v8
- playwright.config.ts
- simplified_precise
- amazon_id
- amazon_url
- best_commentaries_url
- google_books_url
- logos_id
- logos_resource_id
- logos_url
- olivetree_id
- type
- url
- web_archive_url
- worldcat_id

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 67 edges
4. `Book` - 46 edges
5. `Button()` - 40 edges
6. `enum` - 40 edges
7. `useToolbarContext()` - 39 edges
8. `Largest Differences` - 31 edges
9. `react` - 30 edges
10. `normalizeConcordanceWord()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `useComboboxAnchor()` --references--> `react`  [EXTRACTED]
  src/components/ui/combobox.tsx → package.json
- `FormExample()` --references--> `react`  [EXTRACTED]
  src/components/component-example.tsx → package.json
- `useSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json
- `useOptionalSidebar()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json
- `SidebarProvider()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json

## Import Cycles
- None detected.

## Communities (213 total, 32 thin omitted)

### Community 0 - "plugins.tsx"
Cohesion: 0.05
Nodes (70): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+62 more)

### Community 1 - "kjv-reader.tsx"
Cohesion: 0.08
Nodes (57): BeforeInstallPromptEvent, isDedicatedLeafViewTab(), KJVReader(), LazyGenealogyTreeDialog, LazyMapAndPhotoDialogs, LazyReaderStudySidebar, LazyRenameTabDialog, panelNodeContainsView() (+49 more)

### Community 2 - "color-picker.tsx"
Cohesion: 0.06
Nodes (69): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+61 more)

### Community 3 - "enum"
Cohesion: 0.03
Nodes (71): altar, cliff, field, ford, gate, hill, map, mine (+63 more)

### Community 4 - "reader-layout.ts"
Cohesion: 0.08
Nodes (50): createGenesisReaderTab(), createWelcomeHomeTab(), buildTargetedReaderPanelInTabState(), ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), usePanelRouting(), UsePanelRoutingParams (+42 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.06
Nodes (43): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebar(), StudyToolsSidebarProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter() (+35 more)

### Community 6 - "cn"
Cohesion: 0.07
Nodes (44): ButtonGroupSeparator(), ButtonGroupText(), Checkbox(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent() (+36 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 8 - "notes-page.tsx"
Cohesion: 0.09
Nodes (36): BookChapterPicker(), BookPickerDialogProps, CompletionCelebration(), CompletionCelebrationProps, CONFETTI_COLORS, LazyMapGeoJsonView, MapAndPhotoDialogsProps, createPlainTextSerializedState() (+28 more)

### Community 9 - "note-links.ts"
Cohesion: 0.10
Nodes (31): Editor(), editorConfig, nodes, $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode, NoteLinkAutoLinkPlugin(), applyInternalLink() (+23 more)

### Community 10 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (39): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+31 more)

### Community 11 - "enum"
Cohesion: 0.05
Nodes (39): altar, cliff, field, ford, gate, hill, mine, pool (+31 more)

### Community 12 - "component-example.tsx"
Cohesion: 0.12
Nodes (28): frameworks, roleItems, Example(), ExampleWrapper(), BookChapterPickerProps, ReaderTopBar(), ReaderTopBarProps, collectLeafStates() (+20 more)

### Community 13 - "properties"
Cohesion: 0.05
Nodes (37): type, $ref, enum, type, properties, type, $ref, type (+29 more)

### Community 14 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 15 - "reader-transfer.ts"
Cohesion: 0.12
Nodes (34): BookmarksExportPayload, EDITOR_ELEMENT_TYPES, EDITOR_LEAF_TYPES, EDITOR_NODE_TYPES, hasSafeEditorPayload(), hasSafeLinkAttributes(), hasSafeOptionalString(), HEADING_TAGS (+26 more)

### Community 16 - "reference-command.ts"
Cohesion: 0.10
Nodes (29): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandGroup(), CommandItem(), CommandSeparator(), buildReferenceCommandActions() (+21 more)

### Community 17 - "settings-dialog.tsx"
Cohesion: 0.11
Nodes (27): SettingsDialogProps, SettingsPanelContentProps, usePanelTargeting(), UsePanelTargetingParams, channelToLinear(), contrastRatio(), defaultHighlightColor(), hexToRgb() (+19 more)

### Community 18 - "reader-panel-tree.tsx"
Cohesion: 0.09
Nodes (24): AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage, LeafLocationPatch, ReaderLeafPanel, ReaderLeafPanelProps, ReaderPanelTree (+16 more)

### Community 19 - "enum"
Cohesion: 0.07
Nodes (31): enum, enum, source, enum, type, >, ancient, modern (+23 more)

### Community 20 - "reader.ts"
Cohesion: 0.13
Nodes (20): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), parseBooks(), loadStrongsGreek() (+12 more)

### Community 21 - "id"
Cohesion: 0.07
Nodes (30): geojson_geometry, geojson_point, additionalProperties, properties, required, type, additionalProperties, properties (+22 more)

### Community 22 - "chapter-text-content.tsx"
Cohesion: 0.11
Nodes (23): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), TokenPopupCard(), TokenPopupCardProps (+15 more)

### Community 23 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 24 - "local-storage.ts"
Cohesion: 0.18
Nodes (22): useReadChapters(), useReaderController(), UseReaderControllerOptions, useReaderPreferences(), UseReaderPreferencesOptions, useVerseSearchIndex(), consumeLocalStorageIssueKeys(), LOCAL_STORAGE_ISSUE_EVENT (+14 more)

### Community 25 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 26 - "Data, Offline Cache, and Deployment"
Cohesion: 0.08
Nodes (21): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Offline lifecycle (+13 more)

### Community 27 - "properties"
Cohesion: 0.07
Nodes (27): additionalProperties, type, type, type, pattern, type, type, the (+19 more)

### Community 28 - "properties"
Cohesion: 0.08
Nodes (27): $ref, type, type, items, additionalProperties, properties, pattern, type (+19 more)

### Community 29 - "properties"
Cohesion: 0.09
Nodes (25): pattern, type, items, additionalProperties, pattern, properties, type, items (+17 more)

### Community 30 - "properties"
Cohesion: 0.08
Nodes (26): $ref, $ref, pattern, type, type, $ref, $ref, the (+18 more)

### Community 31 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 32 - "use-leaf-history.ts"
Cohesion: 0.13
Nodes (21): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams (+13 more)

### Community 33 - "properties"
Cohesion: 0.07
Nodes (32): items, type, items, type, items, type, items, type (+24 more)

### Community 34 - "required"
Cohesion: 0.09
Nodes (24): types, required, required, geojson_file, types, additionalProperties, class, friendly_id (+16 more)

### Community 35 - "properties"
Cohesion: 0.10
Nodes (25): type, $ref, type, pattern, type, $ref, properties, properties (+17 more)

### Community 36 - "definitions"
Cohesion: 0.08
Nodes (25): definitions, geojson_file, image_id, kml_file, lonlat, lonlat_mixed_precision, modern_id, uri (+17 more)

### Community 37 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 38 - "download-page.tsx"
Cohesion: 0.15
Nodes (23): buildAudioUrls(), bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage() (+15 more)

### Community 39 - "genealogy.ts"
Cohesion: 0.17
Nodes (25): useGenealogySearchTool(), buildGenealogyTokenVariantIndex(), canonicalizeGenealogyPersonNames(), collapseGenealogyNameVariant(), collectChristOnlyReferenceData(), collectJesusOnlyReferenceData(), collectPhraseReferenceData(), collectTokenReferenceData() (+17 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 41 - "card.tsx"
Cohesion: 0.14
Nodes (19): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), ReaderStatusScreen() (+11 more)

### Community 42 - "lib/bookmarks.ts"
Cohesion: 0.21
Nodes (20): useReaderBookmarks(), UseReaderBookmarksArgs, BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical() (+12 more)

### Community 43 - "search.ts"
Cohesion: 0.18
Nodes (23): bestOrderedSpanScore(), consonantSkeleton(), createTrigrams(), getSmartHighlightWords(), getSmartPhoneticCode(), hasOrderedWords(), isSmartSearchCandidate(), isSmartSearchStopWord() (+15 more)

### Community 44 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 45 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, audit, build, build:all, build:concordance, build:data, build:data-manifest, build:genealogy (+15 more)

### Community 46 - "enum"
Cohesion: 0.09
Nodes (23): enum, attribution, CC-BY-2.0, CC-BY-2.5, CC-BY-3.0, CC-BY-4.0, CC-BY-SA-1.0, CC-BY-SA-2.0 (+15 more)

### Community 47 - "report-strongs-derivation-links.mjs"
Cohesion: 0.09
Nodes (21): allKeys, crossPrefix, findings, greek, greekFindings, greekKeys, greekPath, hebrew (+13 more)

### Community 48 - "reader-transfer.test.ts"
Cohesion: 0.14
Nodes (19): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile() (+11 more)

### Community 49 - "required"
Cohesion: 0.10
Nodes (22): required, items, minItems, type, items, type, additionalProperties, required (+14 more)

### Community 50 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 51 - "bookmarks-tool.tsx"
Cohesion: 0.16
Nodes (14): BookmarksToolProps, CommandDialog(), CommandEmpty(), CommandInput(), CommandList(), CommandShortcut(), Dialog(), DialogContent() (+6 more)

### Community 52 - "accordion.tsx"
Cohesion: 0.17
Nodes (17): GenealogyPersonDetails(), GenealogyPersonDetailsProps, BibleWordBookResult, BibleWordBookTool(), BibleWordBookToolProps, ConcordanceEntry, ConcordanceTool(), ConcordanceToolProps (+9 more)

### Community 53 - "maps.ts"
Cohesion: 0.17
Nodes (16): MapAndPhotoDialogs(), MapBoundsSync, UseMapDialogStateArgs, useMapsSearchTool(), AncientMapEntry, boundsForGeoJson(), cleanMapMarkup(), extractCoordinateBounds() (+8 more)

### Community 54 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 55 - "properties"
Cohesion: 0.10
Nodes (21): type, type, $ref, $ref, type, $ref, type, properties (+13 more)

### Community 56 - "bible.ts"
Cohesion: 0.20
Nodes (16): EMPTY_STATE, VerseSearchIndexState, buildVerseSearchIndex(), createSearchableVerseEntry(), extractSearchWords(), formatSearchTokenText(), formatVerseText(), isPunctuationTokenText() (+8 more)

### Community 57 - "definitions"
Cohesion: 0.10
Nodes (20): definitions, geojson_file, geometry_id, json_file, lonlat_mixed_precision, lonlats, uri, pattern (+12 more)

### Community 58 - "properties"
Cohesion: 0.10
Nodes (20): geo_source, additionalProperties, required, type, type, type, additionalProperties, properties (+12 more)

### Community 59 - "import_osis_to_sqlite.py"
Cohesion: 0.23
Nodes (17): Any, Element, Path, collect_chapter_tokens(), flatten_text(), is_red_quote(), local_tag(), main() (+9 more)

### Community 60 - "devDependencies"
Cohesion: 0.11
Nodes (19): @axe-core/playwright, eslint, @eslint/js, eslint-plugin-react-refresh, devDependencies, @axe-core/playwright, eslint, @eslint/js (+11 more)

### Community 61 - "properties"
Cohesion: 0.11
Nodes (19): properties, type, properties, type, minimum, type, comment, name (+11 more)

### Community 62 - "properties"
Cohesion: 0.12
Nodes (19): items, type, items, type, $ref, additionalProperties, properties, type (+11 more)

### Community 63 - "enum"
Cohesion: 0.11
Nodes (18): vote_tag, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar, authority_traditional (+10 more)

### Community 64 - "use-reader-corpus.ts"
Cohesion: 0.20
Nodes (16): bootstrap, empty, full, applyBootstrapReaderCorpus(), applyFullReaderCorpus(), applyReaderCorpusError(), INITIAL_STATE, readerCorpusErrorMessage() (+8 more)

### Community 65 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 66 - "properties"
Cohesion: 0.12
Nodes (17): properties, $ref, $ref, $ref, $ref, $ref, isobands, local (+9 more)

### Community 67 - "use-reader-notes.ts"
Cohesion: 0.24
Nodes (13): NotesTool(), NotesToolProps, contextFromScope(), useReaderNotes(), UseReaderNotesArgs, contextLabel(), noteMatchesContext(), noteScopeLabel() (+5 more)

### Community 68 - "guided-tour.tsx"
Cohesion: 0.40
Nodes (4): GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect

### Community 69 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 70 - "definitions"
Cohesion: 0.13
Nodes (15): pattern, type, pattern, type, definitions, ancient_id, ancient_or_modern_id, image_id (+7 more)

### Community 71 - "properties"
Cohesion: 0.13
Nodes (15): type, type, type, $ref, properties, best_commentaries_book_id, best_commentaries_series_id, display_name (+7 more)

### Community 72 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 73 - "search-page.tsx"
Cohesion: 0.21
Nodes (14): ProgressPanelContent(), BookGroup, clampGroupIndices(), isChecked(), normalizeSearchMode(), sameSet(), SEARCH_HELP_ITEMS, SEARCH_MODE_LABELS (+6 more)

### Community 74 - "topics-tool.tsx"
Cohesion: 0.14
Nodes (13): ReaderStudySidebarProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, BookmarksTool(), GenealogyTool(), StudyToolsPanel(), StudyToolsPanelProps, TopicEntry (+5 more)

### Community 75 - "use-study-workspace-state.ts"
Cohesion: 0.20
Nodes (12): normalizeReaderMode(), normalizeTabsOrientation(), useReaderShellState(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS (+4 more)

### Community 76 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 77 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 78 - "alternate_verses"
Cohesion: 0.50
Nodes (4): patternProperties, type, ^[0-9a-z]{1,8}$, alternate_verses

### Community 79 - "properties"
Cohesion: 0.15
Nodes (13): type, $ref, pattern, type, $ref, properties, pattern, type (+5 more)

### Community 80 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 81 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 82 - "enum"
Cohesion: 0.15
Nodes (13): article, chapter, website, map, enum, book, book set, coordinates (+5 more)

### Community 83 - "required"
Cohesion: 0.18
Nodes (12): media_object, file, additionalProperties, required, type, media_object_thumbnail, credit, file (+4 more)

### Community 84 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 85 - "enum"
Cohesion: 0.17
Nodes (12): role, enum, type, satellite, role, enum, type, enum (+4 more)

### Community 86 - "description"
Cohesion: 0.18
Nodes (12): media_object_alternate, media_object_google, enum, description, image_id, additionalProperties, required, type (+4 more)

### Community 87 - "KJV Only Hardening Remediation Report"
Cohesion: 0.17
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 88 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 89 - "genealogy-tree-dialog.tsx"
Cohesion: 0.23
Nodes (10): GenealogyNode(), GenealogyRelationGrid(), GenealogyTreeDialog(), GenealogyTreeDialogProps, ResolvedRelation, resolveParent(), resolvePersonName(), resolveRelation() (+2 more)

### Community 90 - "kjv-words-phrases-tool.tsx"
Cohesion: 0.12
Nodes (17): CATEGORY_LABELS, KJVWordsPhrasesTool(), KJVWordsPhrasesToolProps, OldEnglishResult, PhrasesResult, UnitsResult, PhrasesResult, PhrasesTool() (+9 more)

### Community 91 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 92 - "properties"
Cohesion: 0.15
Nodes (13): additionalProperties, properties, type, type, combined, common_noun, helper, instance_types (+5 more)

### Community 93 - "required"
Cohesion: 0.10
Nodes (20): required, class, name, score, additionalProperties, required, type, additionalProperties (+12 more)

### Community 94 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 95 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 96 - "static-page.tsx"
Cohesion: 0.25
Nodes (9): ResourcesPage(), StaticPage(), StaticPageProps, WhyKJVOnlyPage(), getStaticPage(), STATIC_PAGE_MAP, STATIC_PAGES, StaticPageDefinition (+1 more)

### Community 97 - "swapRecordEntries"
Cohesion: 0.36
Nodes (7): createDefaultSearchPageState(), useReaderSearchPages(), clearSingleLeafReferenceIfMissing(), filterRecordEntries(), swapRecordEntries(), swapSingleLeafReference(), SearchPageState

### Community 98 - "use-word-study-navigation.ts"
Cohesion: 0.22
Nodes (9): contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, useWordStudyNavigation(), UseWordStudyNavigationParams, WordTokenMatch, normalizeStrongsCode(), NoteLinkTarget (+1 more)

### Community 99 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 100 - "properties"
Cohesion: 0.11
Nodes (19): items, type, properties, identification_ids, score, time_best_fits, time_intercept, time_r_squared (+11 more)

### Community 101 - "required"
Cohesion: 0.20
Nodes (10): required, time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average (+2 more)

### Community 102 - "enum"
Cohesion: 0.20
Nodes (10): enum, type, path, point, geometry, isobands, points, polygon_with_center (+2 more)

### Community 103 - "suggested"
Cohesion: 0.20
Nodes (10): $ref, $ref, label_line, label_line_horizontal, rough_boundary, suggested, $ref, additionalProperties (+2 more)

### Community 104 - "KJV Only Project Assessment"
Cohesion: 0.20
Nodes (10): Architecture map, Design-system and UX implementation assessment, Documentation and operational ownership, Executive assessment, Final judgment, Graphify results, KJV Only Project Assessment, Overall posture (+2 more)

### Community 105 - "build-topics-index.mjs"
Cohesion: 0.29
Nodes (8): BOOK_CODE_MAP, compareTopic(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), toTitleCase()

### Community 106 - "concordance-reference-popover.tsx"
Cohesion: 0.19
Nodes (11): ConcordanceReferencePopoverProps, CrossRefsTool(), CrossRefsToolProps, selectedLabel(), Popover(), PopoverContent(), PopoverDescription(), PopoverHeader() (+3 more)

### Community 107 - "study-search-form.tsx"
Cohesion: 0.22
Nodes (10): resetStudySearchDraft(), shouldShowStudySearchResetButton(), StudySearchForm(), StudySearchFormProps, HitchcocksResult, HitchcocksTool(), HitchcocksToolProps, OldEnglishResult (+2 more)

### Community 108 - "kjv-corpus-manifest.ts"
Cohesion: 0.29
Nodes (8): isPositiveSafeInteger(), KJV_CORPUS_MANIFEST_URL, KjvCorpusAsset, KjvCorpusManifest, parseAsset(), parseKjvCorpusManifest(), HASH, validManifest()

### Community 109 - "regex-search.ts"
Cohesion: 0.29
Nodes (7): RegexSearchOptions, runRegexSearch(), buildRegexMatcher(), entries, VerseSearchIndexEntry, SearchMatch, RegexSearchRequest

### Community 110 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 111 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, id, required, $schema, type, geometry, format, land_or_water

### Community 112 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 113 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 114 - "why-kjv-only-page.tsx"
Cohesion: 0.22
Nodes (7): CASE_AT_A_GLANCE, EXTERNAL_SOURCES, ExternalSource, KJV_ONLY_SECTIONS, KJVOnlySection, ScriptureReference, WhyKJVOnlyPageProps

### Community 115 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 116 - "items"
Cohesion: 0.25
Nodes (8): additionalProperties, required, type, url, source_urls, items, type, osm_version

### Community 117 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 118 - "source.json"
Cohesion: 0.25
Nodes (7): additionalProperties, definitions, uri, $schema, type, pattern, type

### Community 119 - "sw.js"
Cohesion: 0.36
Nodes (6): APP_SHELL, cacheFirst(), LIVE_DATA_PREFIXES, networkFirst(), shouldCacheResponse(), shouldUseNetworkFirst()

### Community 120 - "Genealogy Note Cleanup Preview"
Cohesion: 0.25
Nodes (7): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Preview, Genealogy Note Cleanup Preview, Sample Previews, Seth / Sheth (seth_17), Summary

### Community 122 - "normalize-strongs-derivation-links.mjs"
Cohesion: 0.29
Nodes (6): allKeys, files, normalizeStrongsRef(), replaceDerivationRefs(), repoRoot, summary

### Community 123 - "vite.config.ts"
Cohesion: 0.39
Nodes (4): EXACT_RUNTIME_ASSETS, isAllowedRuntimeFile(), RUNTIME_PUBLIC_ENTRIES, runtimeAssetRequestPath()

### Community 124 - "donate-page.tsx"
Cohesion: 0.29
Nodes (7): ConcordanceReferencePopover, DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText()

### Community 125 - "how-to-get-saved-page.tsx"
Cohesion: 0.29
Nodes (7): GospelStep, HowToGetSavedPage(), HowToGetSavedPageProps, ReferenceList(), renderReferenceText(), ROMANS_ROAD_STEPS, ScriptureReference

### Community 127 - "welcome-home-page.tsx"
Cohesion: 0.36
Nodes (7): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, DailyScriptureTopicsPayload, loadDailyScriptureTopics()

### Community 128 - "enum"
Cohesion: 0.29
Nodes (7): place_modifier, <, near, enum, type, along, on

### Community 129 - "types"
Cohesion: 0.29
Nodes (7): $ref, translations, types, items, type, items, type

### Community 130 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

### Community 131 - "^a[0-9a-f]{6}$"
Cohesion: 0.29
Nodes (7): additionalProperties, type, additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, ancient_associations

### Community 132 - "geometry"
Cohesion: 0.29
Nodes (7): enum, $ref, type, path, point, polygon, geometry

### Community 133 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 134 - "websters-import-ready-candidates.md"
Cohesion: 0.29
Nodes (6): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary

### Community 135 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 136 - "ai-dictionary-tool.tsx"
Cohesion: 0.38
Nodes (6): AIDictionaryResult, AIDictionaryTool(), AIDictionaryToolProps, extractSeeReference(), renderAIDictionaryDefinition(), AIDictionaryEntry

### Community 137 - "maps-tool.tsx"
Cohesion: 0.38
Nodes (6): buildLinkedPlaces(), buildReferences(), DedupedLinkedPlace, MapsDisplayEntry, MapsTool(), MapsToolProps

### Community 138 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, class, human,natural, special

### Community 139 - "osm_version"
Cohesion: 0.33
Nodes (6): properties, minimum, type, osm_version, url, $ref

### Community 140 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, modifier, center n-s, center radial, west linear increasing

### Community 141 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, color, black_and_white, color, colorized

### Community 142 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, natural, probability, class

### Community 143 - "Security assessment"
Cohesion: 0.33
Nodes (6): Defense-in-depth items not validated as current vulnerabilities, Dependency and supply-chain posture, Required remediations, Security assessment, Threat model, Validated findings

### Community 144 - "websters-coverage-refined-report.md"
Cohesion: 0.33
Nodes (5): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere

### Community 145 - "websters-high-value-candidates-report.md"
Cohesion: 0.33
Nodes (5): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary

### Community 146 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 147 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 148 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 150 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 151 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 152 - "Recommendation disposition"
Cohesion: 0.40
Nodes (5): Priority 0 — security and deployment, Priority 1 — ownership and structure, Priority 2 — performance and delivery, Priority 3 — design, testing, and operations, Recommendation disposition

### Community 153 - "Structural assessment"
Cohesion: 0.40
Nodes (5): Main structural problem: orchestration concentration, Recommended target structure, State and persistence, Structural assessment, What is working well

### Community 154 - "Prioritized hardening roadmap"
Cohesion: 0.40
Nodes (5): Prioritized hardening roadmap, Priority 0 — prevent avoidable security and deployment failures, Priority 1 — create stable ownership boundaries, Priority 2 — remove main-thread and delivery bottlenecks, Priority 3 — consistency and maintainability

### Community 155 - "Webster Import Preview"
Cohesion: 0.40
Nodes (4): Notes, Preview Entries, Summary, Webster Import Preview

### Community 157 - "strongs-tool.tsx"
Cohesion: 0.50
Nodes (4): StrongsResult, StrongsTool(), StrongsToolProps, tokenizeStrongsDerivation()

### Community 158 - "use-study-sidebar-state.ts"
Cohesion: 0.50
Nodes (4): deriveStudySidebarState, STUDY_ACCORDION_ITEMS, useStudySidebarState(), UseStudySidebarStateArgs

### Community 159 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 160 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 161 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 162 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 163 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 164 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 165 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 167 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 168 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 169 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 170 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 171 - "uri"
Cohesion: 0.67
Nodes (3): uri, pattern, type

### Community 172 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 173 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 174 - "meters_per_pixel"
Cohesion: 0.67
Nodes (3): enum, type, meters_per_pixel

### Community 175 - "thumbnails"
Cohesion: 0.67
Nodes (3): thumbnails, patternProperties, type

### Community 176 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 178 - "geojson_roles"
Cohesion: 0.67
Nodes (3): additionalProperties, type, geojson_roles

### Community 179 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 180 - "friendly_id"
Cohesion: 0.67
Nodes (3): pattern, type, friendly_id

### Community 181 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

## Knowledge Gaps
- **1285 isolated node(s):** `editorConfig`, `frameworks`, `roleItems`, `Context`, `Props` (+1280 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `plugins.tsx`, `color-picker.tsx`, `sidebar.tsx`, `notes-page.tsx`, `ai-dictionary-tool.tsx`, `maps-tool.tsx`, `component-example.tsx`, `reference-command.ts`, `reader-panel-tree.tsx`, `chapter-text-content.tsx`, `strongs-tool.tsx`, `WebstersTool`, `card.tsx`, `bookmarks-tool.tsx`, `accordion.tsx`, `topics-tool.tsx`, `genealogy-tree-dialog.tsx`, `kjv-words-phrases-tool.tsx`, `concordance-reference-popover.tsx`, `study-search-form.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `color-picker.tsx`, `package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `sidebar.tsx`, `cn`, `dependencies`, `concordance-reference-popover.tsx`, `reader-panel-tree.tsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `editorConfig`, `frameworks`, `roleItems` to the rest of the system?**
  _1285 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05211141060197664 - nodes in this community are weakly interconnected._
- **Should `kjv-reader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08322026232473993 - nodes in this community are weakly interconnected._