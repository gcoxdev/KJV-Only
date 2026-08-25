# Graph Report - .  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3233 nodes · 6558 edges · 204 communities (174 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `409e9559`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- utils.ts
- cn
- plugins.tsx
- color-picker.tsx
- enum
- search.ts
- kjv-reader.tsx
- welcome-home-page.tsx
- reader-layout.ts
- dependencies
- notes-page.tsx
- download-page.tsx
- reference-command.ts
- button.tsx
- Modern locations (modern.jsonl)
- enum
- component-example.tsx
- properties
- Largest Differences
- reader-panel-tree.tsx
- reader.ts
- reader-transfer.ts
- references.ts
- use-reader-notes.ts
- use-reader-corpus.ts
- properties
- definitions
- properties
- compilerOptions
- Data, Offline Cache, and Deployment
- properties
- properties
- properties
- properties
- description
- fetch-map-photos.mjs
- reader-data.ts
- use-leaf-history.ts
- required
- properties
- properties
- enum
- Codebase Improvement Plan
- compilerOptions
- components.json
- scripts
- report-strongs-derivation-links.mjs
- reader-persistence.ts
- required
- build-genealogy-compact.mjs
- layout-hash.ts
- definitions
- properties
- chapter-text-content.tsx
- search-page.tsx
- lib/bookmarks.ts
- import_osis_to_sqlite.py
- devDependencies
- required
- properties
- properties
- note-links.ts
- use-strongs-search-tool.ts
- genealogy.ts
- definitions
- enum
- properties
- properties
- enum
- reader-scroll-targets.ts
- use-workspace-navigation.ts
- properties
- use-panel-routing.ts
- build-kjv-runtime-manifest.mjs
- note-link-auto-link-plugin.tsx
- progress-dialog.tsx
- use-reader-view-models.ts
- modern
- required
- properties
- check-dist.mjs
- use-panel-transfer.ts
- ^s[0-9a-f]{6}$
- build-map-json.mjs
- enum
- properties
- definitions
- enum
- reader-view.tsx
- types/notes.ts
- id
- enum
- Webster Source Analysis
- bible.ts
- use-study-workspace-state.ts
- required
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- enum
- properties
- enum
- suggested
- Assessment Follow-Up and Final Hardening Record
- KJV Only Hardening Remediation Report
- KJV Only Project Assessment
- build-topics-index.mjs
- highlight-color.ts
- geojson_geometry
- geometry.json
- enum
- Genealogy Note Reference Report
- use-word-study-navigation.ts
- reader-transfer-worker.ts
- media_parent
- enum
- items
- image.json
- source.json
- sw.js
- Genealogy Note Cleanup Preview
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- vite.config.ts
- editor.tsx
- enum
- votes
- ^a[0-9a-f]{6}$
- geometry
- Webster Coverage Report
- websters-import-ready-candidates.md
- Webster Proposed Add List
- donate-page.tsx
- enum
- osm_version
- enum
- enum
- What changed
- Security assessment
- websters-coverage-refined-report.md
- websters-high-value-candidates-report.md
- beginPerformanceMeasure
- tsconfig.json
- package.json
- alternate_roots
- review
- enum
- enum
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- Webster Import Preview
- types
- service-worker-cache.ts
- alternate_verses
- alternate_urls
- contributors
- vote_count
- Testing, linting, and release engineering
- Performance assessment
- Strong's Derivation Link Audit
- geometry_id
- modern_id
- source_id
- url_slug
- lonlat
- descriptions
- geojson_roles
- abbreviation
- friendly_id
- id
- AI Dictionary Current High-Value Gaps
- cache-config.d.ts
- leaflet-shim.d.ts
- eslint
- globals
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
- precise
- amazon_id
- amazon_url
- best_commentaries_series_id
- best_commentaries_url
- google_books_id
- google_books_url
- logos_id
- logos_resource_id
- logos_url
- olivetree_id
- type
- url
- web_archive_url

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 59 edges
4. `Book` - 53 edges
5. `enum` - 40 edges
6. `Button()` - 40 edges
7. `useToolbarContext()` - 39 edges
8. `Largest Differences` - 31 edges
9. `react` - 30 edges
10. `normalizeConcordanceWord()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `useComboboxAnchor()` --references--> `react`  [EXTRACTED]
  src/components/ui/combobox.tsx → package.json
- `FormExample()` --references--> `react`  [EXTRACTED]
  src/components/component-example.tsx → package.json
- `useLazyRef()` --references--> `react`  [EXTRACTED]
  src/components/editor/editor-ui/color-picker.tsx → package.json
- `VisuallyHiddenInput()` --references--> `react`  [EXTRACTED]
  src/components/editor/editor-ui/color-picker.tsx → package.json
- `SidebarMenuSkeleton()` --references--> `react`  [EXTRACTED]
  src/components/ui/sidebar.tsx → package.json

## Import Cycles
- None detected.

## Communities (204 total, 30 thin omitted)

### Community 0 - "utils.ts"
Cohesion: 0.05
Nodes (73): ConcordanceReferencePopover, ConcordanceReferencePopoverProps, GenealogyPersonDetailsProps, ReaderStudySidebar, ReaderStudySidebarProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, resetStudySearchDraft() (+65 more)

### Community 1 - "cn"
Cohesion: 0.04
Nodes (85): SidebarCloseRequestSync(), SidebarOpenRequestSync(), OldEnglishTool(), PhrasesTool(), StudyToolsSidebar(), StudyToolsSidebarProps, TopicsTool(), UnitsTool() (+77 more)

### Community 2 - "plugins.tsx"
Cohesion: 0.06
Nodes (63): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+55 more)

### Community 3 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 4 - "enum"
Cohesion: 0.03
Nodes (71): altar, cliff, field, ford, gate, hill, map, mine (+63 more)

### Community 5 - "search.ts"
Cohesion: 0.08
Nodes (51): clampGroupIndices(), isChecked(), normalizeSearchMode(), sameSet(), SearchPage(), EMPTY_STATE, useVerseSearchIndex(), VerseSearchIndexState (+43 more)

### Community 6 - "kjv-reader.tsx"
Cohesion: 0.05
Nodes (51): App(), CompletionCelebration(), GenealogyPersonDetails(), GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, KJVReader() (+43 more)

### Community 7 - "welcome-home-page.tsx"
Cohesion: 0.07
Nodes (41): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), GospelStep (+33 more)

### Community 8 - "reader-layout.ts"
Cohesion: 0.13
Nodes (37): ReaderWordHighlight, SwapLeafState, UpdateActiveTab, usePanelInteractionController(), UsePanelInteractionControllerParams, closeLeafInTab(), collectLeafIds(), collectSameOrientationSplitIds() (+29 more)

### Community 9 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 10 - "notes-page.tsx"
Cohesion: 0.10
Nodes (37): BookChapterPicker(), BookPickerDialogProps, CompletionCelebrationProps, CONFETTI_COLORS, GenealogyNode(), GenealogyRelationGrid(), GenealogyTreeDialog(), GenealogyTreeDialogProps (+29 more)

### Community 11 - "download-page.tsx"
Cohesion: 0.08
Nodes (39): bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage(), DownloadPageProps (+31 more)

### Community 12 - "reference-command.ts"
Cohesion: 0.14
Nodes (22): actionIcon(), ReferenceCommandDialog(), buildReferenceCommandActions(), createReferenceParser(), flattenParsedEntities(), formatCrossChapterRangeLabel(), formatReferenceRanges(), isFullSingleChapterReference() (+14 more)

### Community 13 - "button.tsx"
Cohesion: 0.09
Nodes (29): ReferenceCommandDialogProps, Button(), buttonVariants, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+21 more)

### Community 14 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (39): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+31 more)

### Community 15 - "enum"
Cohesion: 0.05
Nodes (39): altar, cliff, field, ford, gate, hill, mine, pool (+31 more)

### Community 16 - "component-example.tsx"
Cohesion: 0.10
Nodes (30): frameworks, roleItems, Example(), ExampleWrapper(), ReaderTopBar(), ReaderTopBarProps, StaticPage(), collectLeafStates() (+22 more)

### Community 17 - "properties"
Cohesion: 0.05
Nodes (37): type, $ref, enum, type, properties, type, $ref, type (+29 more)

### Community 18 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 19 - "reader-panel-tree.tsx"
Cohesion: 0.08
Nodes (27): AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyBookmarksTool, LazyNotesPage, LazyProgressPanelContent, LazySearchPage, LazySettingsPanelContent, LazyStudyToolsPanel (+19 more)

### Community 20 - "reader.ts"
Cohesion: 0.11
Nodes (33): OpenWordInStudyToolsArgs, Setter, WordStudyCoordinatorParams, AncientMapPayload, books, AIDictionarySelection, findGenealogyMatches(), findMapMatches() (+25 more)

### Community 21 - "reader-transfer.ts"
Cohesion: 0.12
Nodes (34): BookmarksExportPayload, EDITOR_ELEMENT_TYPES, EDITOR_LEAF_TYPES, EDITOR_NODE_TYPES, hasSafeEditorPayload(), hasSafeLinkAttributes(), hasSafeOptionalString(), HEADING_TAGS (+26 more)

### Community 22 - "references.ts"
Cohesion: 0.14
Nodes (32): AIDictionaryIndex, aiDictionaryIndexCache, bibleWordBookAliasCache, earliestOrderedKey(), escapeRegExp(), firstKeyIndex(), getAIDictionaryIndex(), getBibleWordBookAliasIndex() (+24 more)

### Community 23 - "use-reader-notes.ts"
Cohesion: 0.17
Nodes (24): useReadChapters(), useReaderBookmarks(), UseReaderBookmarksArgs, useReaderController(), UseReaderControllerOptions, contextFromScope(), useReaderNotes(), UseReaderNotesArgs (+16 more)

### Community 24 - "use-reader-corpus.ts"
Cohesion: 0.10
Nodes (26): bootstrap, empty, full, applyBootstrapReaderCorpus(), applyFullReaderCorpus(), applyReaderCorpusError(), INITIAL_STATE, readerCorpusErrorMessage() (+18 more)

### Community 25 - "properties"
Cohesion: 0.06
Nodes (31): $ref, $ref, pattern, type, type, $ref, $ref, land (+23 more)

### Community 26 - "definitions"
Cohesion: 0.06
Nodes (31): definitions, geojson_file, geometry_id, image_id, kml_file, lonlat, lonlat_mixed_precision, modern_id (+23 more)

### Community 27 - "properties"
Cohesion: 0.08
Nodes (29): type, $ref, media_object_alternate, media_object_google, pattern, type, $ref, additionalProperties (+21 more)

### Community 28 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 29 - "Data, Offline Cache, and Deployment"
Cohesion: 0.07
Nodes (23): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Local Bible corpus contract (+15 more)

### Community 30 - "properties"
Cohesion: 0.08
Nodes (27): items, type, items, type, items, type, items, type (+19 more)

### Community 31 - "properties"
Cohesion: 0.09
Nodes (25): $ref, type, items, additionalProperties, properties, pattern, type, geometry_id (+17 more)

### Community 32 - "properties"
Cohesion: 0.07
Nodes (27): additionalProperties, type, type, type, pattern, type, type, the (+19 more)

### Community 33 - "properties"
Cohesion: 0.09
Nodes (25): pattern, type, items, additionalProperties, pattern, properties, type, items (+17 more)

### Community 34 - "description"
Cohesion: 0.09
Nodes (26): geojson_geometry, geojson_point, type, additionalProperties, properties, required, type, additionalProperties (+18 more)

### Community 35 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 36 - "reader-data.ts"
Cohesion: 0.14
Nodes (22): deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), TOPIC_LETTERS, TopicsToolEntry, useTopicsTool(), augmentConcordanceWithNormalizedWordForms(), DailyScriptureTopicsPayload, deltaDecode() (+14 more)

### Community 37 - "use-leaf-history.ts"
Cohesion: 0.15
Nodes (19): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams (+11 more)

### Community 38 - "required"
Cohesion: 0.09
Nodes (24): types, required, required, geojson_file, types, additionalProperties, class, friendly_id (+16 more)

### Community 39 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 40 - "properties"
Cohesion: 0.08
Nodes (25): type, type, $ref, $ref, type, $ref, enum, type (+17 more)

### Community 41 - "enum"
Cohesion: 0.08
Nodes (25): enum, type, license, attribution, CC-BY-2.0, CC-BY-2.5, CC-BY-3.0, CC-BY-4.0 (+17 more)

### Community 42 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 43 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 44 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 45 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, audit, build, build:all, build:concordance, build:data, build:data-manifest, build:genealogy (+15 more)

### Community 46 - "report-strongs-derivation-links.mjs"
Cohesion: 0.09
Nodes (21): allKeys, crossPrefix, findings, greek, greekFindings, greekKeys, greekPath, hebrew (+13 more)

### Community 47 - "reader-persistence.ts"
Cohesion: 0.14
Nodes (20): UsePanelTargetingParams, defaultReaderDisplaySettings(), finiteClampedInteger(), isOneOf(), isReadChaptersPayload(), isReaderDisplaySettingsPayload(), isRecord(), PANEL_TARGETS (+12 more)

### Community 48 - "required"
Cohesion: 0.10
Nodes (22): required, items, minItems, type, items, type, additionalProperties, required (+14 more)

### Community 49 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 50 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 51 - "definitions"
Cohesion: 0.10
Nodes (20): definitions, geojson_file, geometry_id, json_file, lonlat_mixed_precision, lonlats, uri, pattern (+12 more)

### Community 52 - "properties"
Cohesion: 0.10
Nodes (20): geo_source, additionalProperties, required, type, type, type, additionalProperties, properties (+12 more)

### Community 53 - "chapter-text-content.tsx"
Cohesion: 0.17
Nodes (15): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), TokenPopupCard(), TokenPopupCardProps (+7 more)

### Community 54 - "search-page.tsx"
Cohesion: 0.13
Nodes (15): BookGroup, SEARCH_HELP_ITEMS, SEARCH_MODE_LABELS, SearchPageProps, Checkbox(), Label(), Popover(), PopoverContent() (+7 more)

### Community 55 - "lib/bookmarks.ts"
Cohesion: 0.23
Nodes (17): BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical(), comparePoint(), normalizeBookmarkRanges() (+9 more)

### Community 56 - "import_osis_to_sqlite.py"
Cohesion: 0.23
Nodes (17): Any, Element, Path, collect_chapter_tokens(), flatten_text(), is_red_quote(), local_tag(), main() (+9 more)

### Community 57 - "devDependencies"
Cohesion: 0.11
Nodes (19): @axe-core/playwright, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, @axe-core/playwright, @eslint/js, eslint-plugin-react-hooks (+11 more)

### Community 58 - "required"
Cohesion: 0.11
Nodes (19): items, type, properties, identification_ids, score, url_slug, additionalProperties, required (+11 more)

### Community 59 - "properties"
Cohesion: 0.11
Nodes (19): properties, type, properties, type, minimum, type, comment, name (+11 more)

### Community 60 - "properties"
Cohesion: 0.12
Nodes (19): items, type, items, type, $ref, additionalProperties, properties, type (+11 more)

### Community 61 - "note-links.ts"
Cohesion: 0.23
Nodes (16): applyInternalLink(), NoteLinkToolbarPlugin(), DropdownMenuTrigger(), bookCodeForIndex(), buildNoteLinkHref(), decodeRanges(), encodeRanges(), formatNoteLinkLabel() (+8 more)

### Community 62 - "use-strongs-search-tool.ts"
Cohesion: 0.19
Nodes (14): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), loadStrongsGreek(), loadStrongsHebrew() (+6 more)

### Community 63 - "genealogy.ts"
Cohesion: 0.23
Nodes (16): canonicalizeGenealogyPersonNames(), collapseGenealogyNameVariant(), collectGenealogyCorpusData(), decodeGenealogyPayload(), decodeParent(), decodeReferences(), decodeRelation(), dedupeReferences() (+8 more)

### Community 64 - "definitions"
Cohesion: 0.11
Nodes (18): pattern, type, pattern, type, definitions, ancient_id, ancient_or_modern_id, image_id (+10 more)

### Community 65 - "enum"
Cohesion: 0.11
Nodes (18): vote_tag, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar, authority_traditional (+10 more)

### Community 66 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 67 - "properties"
Cohesion: 0.12
Nodes (17): properties, $ref, $ref, $ref, $ref, isobands, local, point (+9 more)

### Community 68 - "enum"
Cohesion: 0.12
Nodes (17): >, near, enum, actual, another part of same historical site, artifact, bay, correct location, wrong site (+9 more)

### Community 69 - "reader-scroll-targets.ts"
Cohesion: 0.24
Nodes (13): elementOffsetWithin(), usePendingReaderScroll(), UsePendingReaderScrollParams, ActiveReaderWordHighlight, useReaderLeafCleanup(), UseReaderLeafCleanupParams, calculateReaderScrollTop(), dequeuePendingReaderScrollTarget() (+5 more)

### Community 70 - "use-workspace-navigation.ts"
Cohesion: 0.25
Nodes (11): useTopicsPreload(), UseTopicsPreloadParams, ChapterRef, useWorkspaceNavigation(), UseWorkspaceNavigationParams, isDedicatedLeafViewTab(), nextSearchTabTitle(), panelNodeContainsView() (+3 more)

### Community 71 - "properties"
Cohesion: 0.12
Nodes (16): type, $ref, media_object, pattern, type, $ref, additionalProperties, properties (+8 more)

### Community 72 - "use-panel-routing.ts"
Cohesion: 0.19
Nodes (18): buildTargetedReaderPanelInTabState(), ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), usePanelRouting(), UsePanelRoutingParams, createGenesisReaderTab(), createWelcomeHomeTab() (+10 more)

### Community 73 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 74 - "note-link-auto-link-plugin.tsx"
Cohesion: 0.19
Nodes (10): $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode, NoteLinkAutoLinkPlugin(), bookPattern(), buildTypedReferenceRegex(), escapeRegExp(), findBookIndexByName() (+2 more)

### Community 75 - "progress-dialog.tsx"
Cohesion: 0.17
Nodes (13): ProgressBook, ProgressByTestament, ProgressChapter, ProgressDialogProps, ProgressPanelContent(), ProgressTestament, Progress(), ProgressIndicator() (+5 more)

### Community 76 - "use-reader-view-models.ts"
Cohesion: 0.15
Nodes (14): ProgressPanelContentProps, SettingsPanelContentProps, BookmarksToolProps, NotesSidebarProps, StudyInfoCounts, StudyToolInput, StudyToolKey, UseNotesSidebarViewModelParams (+6 more)

### Community 77 - "modern"
Cohesion: 0.14
Nodes (15): enum, type, id_source, source, enum, type, ancient, modern (+7 more)

### Community 78 - "required"
Cohesion: 0.18
Nodes (15): file, required, media_object_thumbnail, enum, credit, description, file, image_id (+7 more)

### Community 79 - "properties"
Cohesion: 0.13
Nodes (15): type, type, $ref, properties, best_commentaries_book_id, display_name, olivetree_url, publisher (+7 more)

### Community 80 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 81 - "use-panel-transfer.ts"
Cohesion: 0.22
Nodes (13): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile() (+5 more)

### Community 82 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 83 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 84 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 85 - "properties"
Cohesion: 0.15
Nodes (13): additionalProperties, properties, type, type, combined, common_noun, helper, instance_types (+5 more)

### Community 86 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 87 - "enum"
Cohesion: 0.15
Nodes (13): article, chapter, website, map, enum, book, book set, coordinates (+5 more)

### Community 88 - "reader-view.tsx"
Cohesion: 0.13
Nodes (17): ReaderPanelTree, ReaderPanelTreeProps, EMPTY_LEAF_NEIGHBORS, ReaderWorkspacePanels, ReaderWorkspacePanelsProps, useReaderDerivedState(), UseReaderDerivedStateArgs, buildLeafNeighborMap() (+9 more)

### Community 89 - "types/notes.ts"
Cohesion: 0.28
Nodes (10): NotesTool(), NotesToolProps, contextLabel(), noteScopeLabel(), NotesContext, NoteScope, NotesTabFilter, NotesTabState (+2 more)

### Community 90 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 91 - "enum"
Cohesion: 0.17
Nodes (12): role, enum, type, satellite, role, enum, type, enum (+4 more)

### Community 92 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 93 - "bible.ts"
Cohesion: 0.23
Nodes (5): BookChapterPickerProps, books, Book, VerseNote, VerseNoteReading

### Community 94 - "use-study-workspace-state.ts"
Cohesion: 0.26
Nodes (9): normalizeReaderMode(), normalizeTabsOrientation(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS, UseStudyWorkspaceStateArgs (+1 more)

### Community 95 - "required"
Cohesion: 0.10
Nodes (20): required, class, name, score, additionalProperties, required, type, additionalProperties (+12 more)

### Community 96 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 97 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 98 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 99 - "properties"
Cohesion: 0.20
Nodes (10): time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average, vote_count (+2 more)

### Community 100 - "enum"
Cohesion: 0.20
Nodes (10): enum, type, path, point, geometry, isobands, points, polygon_with_center (+2 more)

### Community 101 - "suggested"
Cohesion: 0.20
Nodes (10): $ref, $ref, label_line, label_line_horizontal, rough_boundary, suggested, $ref, additionalProperties (+2 more)

### Community 102 - "Assessment Follow-Up and Final Hardening Record"
Cohesion: 0.20
Nodes (7): Assessment Follow-Up and Final Hardening Record, Executive result, Graphify architecture map, Release control, Residual and deferred work, Security assessment, Verification record

### Community 103 - "KJV Only Hardening Remediation Report"
Cohesion: 0.20
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 104 - "KJV Only Project Assessment"
Cohesion: 0.20
Nodes (10): Architecture map, Design-system and UX implementation assessment, Documentation and operational ownership, Executive assessment, Final judgment, Graphify results, KJV Only Project Assessment, Overall posture (+2 more)

### Community 105 - "build-topics-index.mjs"
Cohesion: 0.29
Nodes (8): BOOK_CODE_MAP, compareTopic(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), toTitleCase()

### Community 106 - "highlight-color.ts"
Cohesion: 0.38
Nodes (8): useSettingsViewModel(), channelToLinear(), contrastRatio(), defaultHighlightColor(), hexToRgb(), normalizeHighlightColor(), readableHighlightTextColor(), relativeLuminance()

### Community 107 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 108 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, id, required, $schema, type, geometry, format, land_or_water

### Community 109 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 110 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 111 - "use-word-study-navigation.ts"
Cohesion: 0.28
Nodes (8): contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, useWordStudyNavigation(), UseWordStudyNavigationParams, resolveWordTokenAtLocation(), VerseToken, CrossRefsPayload

### Community 112 - "reader-transfer-worker.ts"
Cohesion: 0.28
Nodes (7): ImportParseResult, createAbortError(), ImportKind, ImportResult, parseReaderImportInWorker(), WorkerResponse, ReaderBookmark

### Community 113 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 114 - "enum"
Cohesion: 0.25
Nodes (8): enum, nonunique_url, anchor, main, not, partial, partial,redirect, redirect

### Community 115 - "items"
Cohesion: 0.25
Nodes (8): additionalProperties, required, type, url, source_urls, items, type, osm_version

### Community 116 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 117 - "source.json"
Cohesion: 0.25
Nodes (7): additionalProperties, definitions, uri, $schema, type, pattern, type

### Community 118 - "sw.js"
Cohesion: 0.36
Nodes (6): APP_SHELL, cacheFirst(), LIVE_DATA_PREFIXES, networkFirst(), shouldCacheResponse(), shouldUseNetworkFirst()

### Community 119 - "Genealogy Note Cleanup Preview"
Cohesion: 0.25
Nodes (7): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Preview, Genealogy Note Cleanup Preview, Sample Previews, Seth / Sheth (seth_17), Summary

### Community 121 - "normalize-strongs-derivation-links.mjs"
Cohesion: 0.29
Nodes (6): allKeys, files, normalizeStrongsRef(), replaceDerivationRefs(), repoRoot, summary

### Community 122 - "vite.config.ts"
Cohesion: 0.39
Nodes (4): EXACT_RUNTIME_ASSETS, isAllowedRuntimeFile(), RUNTIME_PUBLIC_ENTRIES, runtimeAssetRequestPath()

### Community 123 - "editor.tsx"
Cohesion: 0.36
Nodes (5): Editor(), editorConfig, nodes, editorTheme, isInternalNoteLink()

### Community 124 - "enum"
Cohesion: 0.29
Nodes (7): place_modifier, <, near, enum, type, along, on

### Community 125 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

### Community 126 - "^a[0-9a-f]{6}$"
Cohesion: 0.29
Nodes (7): additionalProperties, type, additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, ancient_associations

### Community 127 - "geometry"
Cohesion: 0.29
Nodes (7): enum, $ref, type, path, point, polygon, geometry

### Community 128 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 129 - "websters-import-ready-candidates.md"
Cohesion: 0.29
Nodes (6): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary

### Community 130 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 131 - "donate-page.tsx"
Cohesion: 0.33
Nodes (6): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText()

### Community 132 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, class, natural, human,natural

### Community 133 - "osm_version"
Cohesion: 0.33
Nodes (6): properties, minimum, type, osm_version, url, $ref

### Community 134 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, modifier, center n-s, center radial, west linear increasing

### Community 135 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, color, black_and_white, color, colorized

### Community 136 - "What changed"
Cohesion: 0.33
Nodes (6): Compatibility preserved, Corpus and release integrity, Offline/cache behavior, Reader ownership and structure, Startup and search performance, What changed

### Community 137 - "Security assessment"
Cohesion: 0.33
Nodes (6): Defense-in-depth items not validated as current vulnerabilities, Dependency and supply-chain posture, Required remediations, Security assessment, Threat model, Validated findings

### Community 138 - "websters-coverage-refined-report.md"
Cohesion: 0.33
Nodes (5): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere

### Community 139 - "websters-high-value-candidates-report.md"
Cohesion: 0.33
Nodes (5): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary

### Community 140 - "beginPerformanceMeasure"
Cohesion: 0.67
Nodes (3): useFirstReaderReadyMeasure(), beginPerformanceMeasure(), measureSynchronous()

### Community 141 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 142 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 143 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 144 - "review"
Cohesion: 0.40
Nodes (5): review, enum, type, automatic, uncertain

### Community 145 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 146 - "enum"
Cohesion: 0.40
Nodes (5): enum, type, human, probability, class

### Community 147 - "Recommendation disposition"
Cohesion: 0.40
Nodes (5): Priority 0 — security and deployment, Priority 1 — ownership and structure, Priority 2 — performance and delivery, Priority 3 — design, testing, and operations, Recommendation disposition

### Community 148 - "Structural assessment"
Cohesion: 0.40
Nodes (5): Main structural problem: orchestration concentration, Recommended target structure, State and persistence, Structural assessment, What is working well

### Community 149 - "Prioritized hardening roadmap"
Cohesion: 0.40
Nodes (5): Prioritized hardening roadmap, Priority 0 — prevent avoidable security and deployment failures, Priority 1 — create stable ownership boundaries, Priority 2 — remove main-thread and delivery bottlenecks, Priority 3 — consistency and maintainability

### Community 150 - "Webster Import Preview"
Cohesion: 0.40
Nodes (4): Notes, Preview Entries, Summary, Webster Import Preview

### Community 151 - "types"
Cohesion: 0.29
Nodes (7): $ref, translations, types, items, type, items, type

### Community 152 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 153 - "alternate_verses"
Cohesion: 0.50
Nodes (4): patternProperties, type, ^[0-9a-z]{1,8}$, alternate_verses

### Community 154 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 155 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 156 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 157 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 158 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 159 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 160 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 161 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 162 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 163 - "url_slug"
Cohesion: 0.67
Nodes (3): url_slug, pattern, type

### Community 164 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 165 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 166 - "geojson_roles"
Cohesion: 0.67
Nodes (3): additionalProperties, type, geojson_roles

### Community 167 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 168 - "friendly_id"
Cohesion: 0.67
Nodes (3): pattern, type, friendly_id

### Community 169 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

## Knowledge Gaps
- **1341 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1336 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enum` connect `enum` to `description`, `modern`, `enum`, `properties`, `enum`, `properties`, `geometry`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `color-picker.tsx`, `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `react` connect `color-picker.tsx` to `dependencies`, `plugins.tsx`, `reader-panel-tree.tsx`, `cn`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1341 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.054254711593375214 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.03882741215298 - nodes in this community are weakly interconnected._