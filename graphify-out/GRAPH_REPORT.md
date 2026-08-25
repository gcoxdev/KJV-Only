# Graph Report - .  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3216 nodes · 6516 edges · 207 communities (177 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `850972e5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- plugins.tsx
- utils.ts
- search-page.tsx
- settings-dialog.tsx
- color-picker.tsx
- enum
- cn
- reader-panel-tree.tsx
- reader-transfer.ts
- sidebar.tsx
- references.ts
- kjv-reader.tsx
- dependencies
- genealogy-tree-dialog.tsx
- properties
- reader-data.ts
- Modern locations (modern.jsonl)
- enum
- Largest Differences
- note-links.ts
- properties
- compilerOptions
- Data, Offline Cache, and Deployment
- button.tsx
- properties
- properties
- notes-page.tsx
- properties
- properties
- properties
- fetch-map-photos.mjs
- bible.ts
- required
- properties
- Codebase Improvement Plan
- download-page.tsx
- reference-command.ts
- reader-layout.ts
- compilerOptions
- lib/bookmarks.ts
- reader.ts
- components.json
- scripts
- enum
- report-strongs-derivation-links.mjs
- maps.ts
- use-panel-interaction-controller.ts
- required
- definitions
- build-genealogy-compact.mjs
- layout-hash.ts
- properties
- properties
- description
- definitions
- properties
- import_osis_to_sqlite.py
- devDependencies
- required
- properties
- properties
- genealogy.ts
- definitions
- enum
- use-strongs-search-tool.ts
- properties
- enum
- createId
- enum
- geo_source
- build-kjv-runtime-manifest.mjs
- reader-study-sidebar.tsx
- card.tsx
- use-reader-view-models.ts
- use-workspace-navigation.ts
- properties
- check-dist.mjs
- ReaderTab
- ^s[0-9a-f]{6}$
- enum
- build-map-json.mjs
- properties
- enum
- properties
- definitions
- enum
- required
- id
- media_object_alternate
- Webster Source Analysis
- use-study-workspace-state.ts
- required
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- use-leaf-history.ts
- enum
- properties
- suggested
- Assessment Follow-Up and Final Hardening Record
- KJV Only Hardening Remediation Report
- KJV Only Project Assessment
- build-topics-index.mjs
- why-kjv-only-page.tsx
- geojson_geometry
- geometry.json
- enum
- Genealogy Note Reference Report
- static-page.tsx
- help-page.tsx
- use-word-study-navigation.ts
- media_parent
- items
- image.json
- source.json
- sw.js
- Genealogy Note Cleanup Preview
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- vite.config.ts
- how-to-get-saved-page.tsx
- welcome-home-page.tsx
- use-verse-search-index.ts
- enum
- votes
- ^a[0-9a-f]{6}$
- Webster Coverage Report
- websters-import-ready-candidates.md
- Webster Proposed Add List
- editor.tsx
- enum
- osm_version
- enum
- enum
- modifier
- What changed
- Security assessment
- websters-coverage-refined-report.md
- websters-high-value-candidates-report.md
- tsconfig.json
- package.json
- alternate_roots
- review
- enum
- enum
- root
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- Webster Import Preview
- App.tsx
- service-worker-cache.ts
- alternate_verses
- from
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
- types
- descriptions
- meters_per_pixel
- thumbnails
- kml_file
- lonlat
- image_id
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
- amazon_url
- source_id
- amazon_id
- best_commentaries_series_id
- google_books_url
- logos_resource_id
- logos_url
- olivetree_id
- google_books_id
- type
- url
- web_archive_url
- logos_id
- worldcat_id

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 57 edges
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

## Communities (207 total, 30 thin omitted)

### Community 0 - "plugins.tsx"
Cohesion: 0.06
Nodes (64): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+56 more)

### Community 1 - "utils.ts"
Cohesion: 0.06
Nodes (65): ConcordanceReferencePopover, ConcordanceReferencePopoverProps, GenealogyPersonDetails(), GenealogyPersonDetailsProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, resetStudySearchDraft(), shouldShowStudySearchResetButton() (+57 more)

### Community 2 - "search-page.tsx"
Cohesion: 0.05
Nodes (73): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), ProgressPanelContent(), BookGroup (+65 more)

### Community 3 - "settings-dialog.tsx"
Cohesion: 0.05
Nodes (67): SettingsDialogProps, Slider(), Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), bootstrap (+59 more)

### Community 4 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 5 - "enum"
Cohesion: 0.03
Nodes (71): altar, cliff, field, ford, gate, hill, map, mine (+63 more)

### Community 6 - "cn"
Cohesion: 0.05
Nodes (60): OldEnglishTool(), PhrasesTool(), TopicsTool(), UnitsTool(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+52 more)

### Community 7 - "reader-panel-tree.tsx"
Cohesion: 0.06
Nodes (53): frameworks, roleItems, Example(), ExampleWrapper(), AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyBookmarksTool, LazyNotesPage (+45 more)

### Community 8 - "reader-transfer.ts"
Cohesion: 0.08
Nodes (52): usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), BookmarksExportPayload, createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile() (+44 more)

### Community 9 - "sidebar.tsx"
Cohesion: 0.05
Nodes (45): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebar(), StudyToolsSidebarProps, Separator(), Sheet(), SheetContent(), SheetDescription() (+37 more)

### Community 10 - "references.ts"
Cohesion: 0.10
Nodes (50): useWordStudyNavigation(), collapseGenealogyNameVariant(), collectGenealogyCorpusData(), AIDictionaryIndex, aiDictionaryIndexCache, bibleWordBookAliasCache, chapterVerseKey(), earliestOrderedKey() (+42 more)

### Community 11 - "kjv-reader.tsx"
Cohesion: 0.07
Nodes (43): GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, KJVReader(), LazyGenealogyTreeDialog, LazyMapAndPhotoDialogs, LazyReaderStudySidebar (+35 more)

### Community 12 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 13 - "genealogy-tree-dialog.tsx"
Cohesion: 0.09
Nodes (36): BookChapterPicker(), BookPickerDialogProps, CompletionCelebration(), CompletionCelebrationProps, CONFETTI_COLORS, GenealogyNode(), GenealogyRelationGrid(), GenealogyTreeDialog() (+28 more)

### Community 14 - "properties"
Cohesion: 0.04
Nodes (45): enum, type, path, point, geometry, enum, type, additionalProperties (+37 more)

### Community 15 - "reader-data.ts"
Cohesion: 0.09
Nodes (35): deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), TOPIC_LETTERS, TopicsToolEntry, useTopicsTool(), parseBooks(), isPositiveSafeInteger(), KJV_CORPUS_MANIFEST_URL (+27 more)

### Community 16 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (39): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+31 more)

### Community 17 - "enum"
Cohesion: 0.05
Nodes (39): altar, cliff, field, ford, gate, hill, mine, pool (+31 more)

### Community 18 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 19 - "note-links.ts"
Cohesion: 0.14
Nodes (25): $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode, NoteLinkAutoLinkPlugin(), applyInternalLink(), bookCodeForIndex(), bookPattern(), buildNoteLinkHref() (+17 more)

### Community 20 - "properties"
Cohesion: 0.06
Nodes (33): type, $ref, properties, type, $ref, type, type, type (+25 more)

### Community 21 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 22 - "Data, Offline Cache, and Deployment"
Cohesion: 0.07
Nodes (23): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Local Bible corpus contract (+15 more)

### Community 23 - "button.tsx"
Cohesion: 0.14
Nodes (19): ReferenceCommandDialogProps, Button(), buttonVariants, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+11 more)

### Community 24 - "properties"
Cohesion: 0.08
Nodes (27): items, type, items, type, items, type, items, type (+19 more)

### Community 25 - "properties"
Cohesion: 0.09
Nodes (25): $ref, type, items, additionalProperties, properties, pattern, type, geometry_id (+17 more)

### Community 26 - "notes-page.tsx"
Cohesion: 0.18
Nodes (22): createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps, parseSerializedState(), scopeFromContext(), scopeSummary() (+14 more)

### Community 27 - "properties"
Cohesion: 0.07
Nodes (27): additionalProperties, type, type, type, pattern, type, type, the (+19 more)

### Community 28 - "properties"
Cohesion: 0.09
Nodes (25): pattern, type, items, additionalProperties, pattern, properties, type, items (+17 more)

### Community 29 - "properties"
Cohesion: 0.08
Nodes (26): $ref, $ref, pattern, type, type, $ref, $ref, the (+18 more)

### Community 30 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 31 - "bible.ts"
Cohesion: 0.14
Nodes (15): BookChapterPickerProps, createDefaultSearchPageState(), useReaderSearchPages(), normalizeRanges(), useVerseHighlights(), UseVerseHighlightsArgs, clearSingleLeafReferenceIfMissing(), filterRecordEntries() (+7 more)

### Community 32 - "required"
Cohesion: 0.09
Nodes (24): types, required, required, geojson_file, types, additionalProperties, class, friendly_id (+16 more)

### Community 33 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 34 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 35 - "download-page.tsx"
Cohesion: 0.16
Nodes (23): bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage(), DownloadPageProps (+15 more)

### Community 36 - "reference-command.ts"
Cohesion: 0.13
Nodes (24): actionIcon(), ReferenceCommandDialog(), buildReferenceCommandActions(), createReferenceParser(), flattenParsedEntities(), formatCrossChapterRangeLabel(), formatReferenceRanges(), isFullSingleChapterReference() (+16 more)

### Community 37 - "reader-layout.ts"
Cohesion: 0.16
Nodes (22): closeLeafInTab(), collectSameOrientationSplitIds(), countLeaves(), createdLeafIdFromWrappedNode(), directionOrientation(), findContiguousGroupRootId(), findGroupTargetNodeId(), findNodeById() (+14 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 39 - "lib/bookmarks.ts"
Cohesion: 0.21
Nodes (20): useReaderBookmarks(), UseReaderBookmarksArgs, BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical() (+12 more)

### Community 40 - "reader.ts"
Cohesion: 0.15
Nodes (20): OpenWordInStudyToolsArgs, Setter, WordStudyCoordinatorParams, AIDictionaryEntry, AIDictionaryPayload, BibleWordBookEntry, BibleWordBookPayload, ConcordancePayload (+12 more)

### Community 41 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 42 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, audit, build, build:all, build:concordance, build:data, build:data-manifest, build:genealogy (+15 more)

### Community 43 - "enum"
Cohesion: 0.09
Nodes (23): enum, attribution, CC-BY-2.0, CC-BY-2.5, CC-BY-3.0, CC-BY-4.0, CC-BY-SA-1.0, CC-BY-SA-2.0 (+15 more)

### Community 44 - "report-strongs-derivation-links.mjs"
Cohesion: 0.09
Nodes (21): allKeys, crossPrefix, findings, greek, greekFindings, greekKeys, greekPath, hebrew (+13 more)

### Community 45 - "maps.ts"
Cohesion: 0.16
Nodes (17): MapAndPhotoDialogs(), MapBoundsSync, UseMapDialogStateArgs, useMapsSearchTool(), AncientMapEntry, AncientMapPayload, boundsForGeoJson(), cleanMapMarkup() (+9 more)

### Community 46 - "use-panel-interaction-controller.ts"
Cohesion: 0.16
Nodes (20): ReaderWordHighlight, SwapLeafState, UpdateActiveTab, usePanelInteractionController(), UsePanelInteractionControllerParams, collectLeafIds(), splitNodeById(), updateSplitOrientation() (+12 more)

### Community 47 - "required"
Cohesion: 0.10
Nodes (22): required, items, minItems, type, items, type, additionalProperties, required (+14 more)

### Community 48 - "definitions"
Cohesion: 0.09
Nodes (22): definitions, geojson_file, geometry_id, lonlat, lonlat_mixed_precision, modern_id, uri, url_slug (+14 more)

### Community 49 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 50 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 51 - "properties"
Cohesion: 0.10
Nodes (21): type, type, $ref, $ref, type, $ref, type, properties (+13 more)

### Community 52 - "properties"
Cohesion: 0.14
Nodes (14): type, $ref, media_object_thumbnail, pattern, type, additionalProperties, properties, type (+6 more)

### Community 53 - "description"
Cohesion: 0.11
Nodes (21): geojson_geometry, geojson_point, type, additionalProperties, properties, required, type, additionalProperties (+13 more)

### Community 54 - "definitions"
Cohesion: 0.10
Nodes (20): definitions, geojson_file, geometry_id, json_file, lonlat_mixed_precision, lonlats, uri, pattern (+12 more)

### Community 55 - "properties"
Cohesion: 0.18
Nodes (11): type, properties, meters, radius_geometry_id, same_as, type, $ref, enum (+3 more)

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

### Community 61 - "genealogy.ts"
Cohesion: 0.20
Nodes (17): useGenealogySearchTool(), canonicalizeGenealogyPersonNames(), decodeGenealogyPayload(), decodeParent(), decodeReferences(), decodeRelation(), dedupeReferences(), enrichGenealogyPayload() (+9 more)

### Community 62 - "definitions"
Cohesion: 0.11
Nodes (18): pattern, type, pattern, type, definitions, ancient_id, ancient_or_modern_id, image_id (+10 more)

### Community 63 - "enum"
Cohesion: 0.11
Nodes (18): vote_tag, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar, authority_traditional (+10 more)

### Community 64 - "use-strongs-search-tool.ts"
Cohesion: 0.20
Nodes (13): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), loadStrongsGreek(), loadStrongsHebrew() (+5 more)

### Community 65 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 66 - "enum"
Cohesion: 0.12
Nodes (17): >, near, enum, actual, another part of same historical site, artifact, bay, correct location, wrong site (+9 more)

### Community 67 - "createId"
Cohesion: 0.26
Nodes (15): buildTargetedReaderPanelInTabState(), resolveTargetedReaderPanelAction(), usePanelRouting(), createGenesisReaderTab(), createWelcomeHomeTab(), useReaderStartup(), UseReaderStartupParams, useTabActions() (+7 more)

### Community 68 - "enum"
Cohesion: 0.13
Nodes (16): enum, type, enum, id_source, source, enum, type, ancient (+8 more)

### Community 69 - "geo_source"
Cohesion: 0.22
Nodes (9): geo_source, additionalProperties, required, type, type, additionalProperties, required, type (+1 more)

### Community 70 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 71 - "reader-study-sidebar.tsx"
Cohesion: 0.16
Nodes (12): ReaderPanelTree, ReaderPanelTreeProps, ReaderStudySidebar, ReaderStudySidebarProps, EMPTY_LEAF_NEIGHBORS, ReaderWorkspacePanels, ReaderWorkspacePanelsProps, BookmarksTool() (+4 more)

### Community 72 - "card.tsx"
Cohesion: 0.18
Nodes (12): ReaderStatusScreen(), ReaderStatusScreenProps, RESOURCE_SECTIONS, ResourceItem, ResourceSection, ResourcesPage(), Card(), CardAction() (+4 more)

### Community 73 - "use-reader-view-models.ts"
Cohesion: 0.15
Nodes (14): SettingsPanelContentProps, BookmarksToolProps, StudyToolsPanelProps, NotesSidebarProps, StudyInfoCounts, StudyToolInput, StudyToolKey, UseNotesSidebarViewModelParams (+6 more)

### Community 74 - "use-workspace-navigation.ts"
Cohesion: 0.26
Nodes (11): ChapterRef, useWorkspaceNavigation(), UseWorkspaceNavigationParams, findLeafNode(), swapLeafContent(), updateLeafNode(), isDedicatedLeafViewTab(), nextSearchTabTitle() (+3 more)

### Community 75 - "properties"
Cohesion: 0.13
Nodes (15): type, $ref, type, $ref, properties, best_commentaries_book_id, best_commentaries_url, display_name (+7 more)

### Community 76 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 77 - "ReaderTab"
Cohesion: 0.29
Nodes (12): elementOffsetWithin(), usePendingReaderScroll(), UsePendingReaderScrollParams, VerseHighlightRange, calculateReaderScrollTop(), dequeuePendingReaderScrollTarget(), prunePendingReaderScrollTargets(), queuePendingReaderScrollTarget() (+4 more)

### Community 78 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 79 - "enum"
Cohesion: 0.14
Nodes (14): role, enum, type, satellite, role, enum, type, role (+6 more)

### Community 80 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 81 - "properties"
Cohesion: 0.12
Nodes (16): type, $ref, media_object, pattern, type, $ref, additionalProperties, properties (+8 more)

### Community 82 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 83 - "properties"
Cohesion: 0.15
Nodes (13): additionalProperties, properties, type, type, combined, common_noun, helper, instance_types (+5 more)

### Community 84 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 85 - "enum"
Cohesion: 0.15
Nodes (13): article, chapter, website, map, enum, book, book set, coordinates (+5 more)

### Community 86 - "required"
Cohesion: 0.24
Nodes (12): file, required, enum, credit, description, file, image_id, placeholder (+4 more)

### Community 87 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 88 - "media_object_alternate"
Cohesion: 0.13
Nodes (16): media_object_alternate, media_object_google, $ref, additionalProperties, properties, type, additionalProperties, properties (+8 more)

### Community 89 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 90 - "use-study-workspace-state.ts"
Cohesion: 0.26
Nodes (9): normalizeReaderMode(), normalizeTabsOrientation(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS, UseStudyWorkspaceStateArgs (+1 more)

### Community 91 - "required"
Cohesion: 0.10
Nodes (20): required, class, name, score, additionalProperties, required, type, additionalProperties (+12 more)

### Community 92 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 93 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 94 - "use-leaf-history.ts"
Cohesion: 0.31
Nodes (8): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams

### Community 95 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 96 - "properties"
Cohesion: 0.20
Nodes (10): time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average, vote_count (+2 more)

### Community 97 - "suggested"
Cohesion: 0.20
Nodes (10): $ref, $ref, label_line, label_line_horizontal, rough_boundary, suggested, $ref, additionalProperties (+2 more)

### Community 98 - "Assessment Follow-Up and Final Hardening Record"
Cohesion: 0.20
Nodes (7): Assessment Follow-Up and Final Hardening Record, Executive result, Graphify architecture map, Release control, Residual and deferred work, Security assessment, Verification record

### Community 99 - "KJV Only Hardening Remediation Report"
Cohesion: 0.20
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 100 - "KJV Only Project Assessment"
Cohesion: 0.20
Nodes (10): Architecture map, Design-system and UX implementation assessment, Documentation and operational ownership, Executive assessment, Final judgment, Graphify results, KJV Only Project Assessment, Overall posture (+2 more)

### Community 101 - "build-topics-index.mjs"
Cohesion: 0.29
Nodes (8): BOOK_CODE_MAP, compareTopic(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), toTitleCase()

### Community 102 - "why-kjv-only-page.tsx"
Cohesion: 0.20
Nodes (8): CASE_AT_A_GLANCE, EXTERNAL_SOURCES, ExternalSource, KJV_ONLY_SECTIONS, KJVOnlySection, ScriptureReference, WhyKJVOnlyPage(), WhyKJVOnlyPageProps

### Community 103 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 104 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, id, required, $schema, type, geometry, format, land_or_water

### Community 105 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 106 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 107 - "static-page.tsx"
Cohesion: 0.28
Nodes (7): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), StaticPageProps

### Community 108 - "help-page.tsx"
Cohesion: 0.31
Nodes (8): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), CardDescription()

### Community 109 - "use-word-study-navigation.ts"
Cohesion: 0.28
Nodes (6): contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, UseWordStudyNavigationParams, VerseToken, NoteLinkTarget

### Community 110 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 111 - "items"
Cohesion: 0.25
Nodes (8): additionalProperties, required, type, url, source_urls, items, type, osm_version

### Community 112 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 113 - "source.json"
Cohesion: 0.25
Nodes (7): additionalProperties, definitions, uri, $schema, type, pattern, type

### Community 114 - "sw.js"
Cohesion: 0.36
Nodes (6): APP_SHELL, cacheFirst(), LIVE_DATA_PREFIXES, networkFirst(), shouldCacheResponse(), shouldUseNetworkFirst()

### Community 115 - "Genealogy Note Cleanup Preview"
Cohesion: 0.25
Nodes (7): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Preview, Genealogy Note Cleanup Preview, Sample Previews, Seth / Sheth (seth_17), Summary

### Community 117 - "normalize-strongs-derivation-links.mjs"
Cohesion: 0.29
Nodes (6): allKeys, files, normalizeStrongsRef(), replaceDerivationRefs(), repoRoot, summary

### Community 118 - "vite.config.ts"
Cohesion: 0.39
Nodes (4): EXACT_RUNTIME_ASSETS, isAllowedRuntimeFile(), RUNTIME_PUBLIC_ENTRIES, runtimeAssetRequestPath()

### Community 119 - "how-to-get-saved-page.tsx"
Cohesion: 0.29
Nodes (7): GospelStep, HowToGetSavedPage(), HowToGetSavedPageProps, ReferenceList(), renderReferenceText(), ROMANS_ROAD_STEPS, ScriptureReference

### Community 120 - "welcome-home-page.tsx"
Cohesion: 0.36
Nodes (7): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, DailyScriptureTopicsPayload, loadDailyScriptureTopics()

### Community 121 - "use-verse-search-index.ts"
Cohesion: 0.43
Nodes (5): EMPTY_STATE, useVerseSearchIndex(), VerseSearchIndexState, beginPerformanceMeasure(), measureSynchronous()

### Community 122 - "enum"
Cohesion: 0.29
Nodes (7): place_modifier, <, near, enum, type, along, on

### Community 123 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

### Community 124 - "^a[0-9a-f]{6}$"
Cohesion: 0.29
Nodes (7): additionalProperties, type, additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, ancient_associations

### Community 125 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 126 - "websters-import-ready-candidates.md"
Cohesion: 0.29
Nodes (6): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary

### Community 127 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 128 - "editor.tsx"
Cohesion: 0.38
Nodes (4): Editor(), editorConfig, nodes, editorTheme

### Community 129 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, class, human,natural, special

### Community 130 - "osm_version"
Cohesion: 0.33
Nodes (6): properties, minimum, type, osm_version, url, $ref

### Community 131 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, modifier, center n-s, center radial, west linear increasing

### Community 132 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, color, black_and_white, color, colorized

### Community 133 - "modifier"
Cohesion: 0.33
Nodes (6): type, modifier, source, properties, enum, type

### Community 134 - "What changed"
Cohesion: 0.33
Nodes (6): Compatibility preserved, Corpus and release integrity, Offline/cache behavior, Reader ownership and structure, Startup and search performance, What changed

### Community 135 - "Security assessment"
Cohesion: 0.33
Nodes (6): Defense-in-depth items not validated as current vulnerabilities, Dependency and supply-chain posture, Required remediations, Security assessment, Threat model, Validated findings

### Community 136 - "websters-coverage-refined-report.md"
Cohesion: 0.33
Nodes (5): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere

### Community 137 - "websters-high-value-candidates-report.md"
Cohesion: 0.33
Nodes (5): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary

### Community 138 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 139 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 140 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 141 - "review"
Cohesion: 0.40
Nodes (5): review, enum, type, automatic, uncertain

### Community 142 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 143 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 144 - "root"
Cohesion: 0.40
Nodes (5): root, additionalProperties, required, type, source

### Community 145 - "Recommendation disposition"
Cohesion: 0.40
Nodes (5): Priority 0 — security and deployment, Priority 1 — ownership and structure, Priority 2 — performance and delivery, Priority 3 — design, testing, and operations, Recommendation disposition

### Community 146 - "Structural assessment"
Cohesion: 0.40
Nodes (5): Main structural problem: orchestration concentration, Recommended target structure, State and persistence, Structural assessment, What is working well

### Community 147 - "Prioritized hardening roadmap"
Cohesion: 0.40
Nodes (5): Prioritized hardening roadmap, Priority 0 — prevent avoidable security and deployment failures, Priority 1 — create stable ownership boundaries, Priority 2 — remove main-thread and delivery bottlenecks, Priority 3 — consistency and maintainability

### Community 148 - "Webster Import Preview"
Cohesion: 0.40
Nodes (4): Notes, Preview Entries, Summary, Webster Import Preview

### Community 150 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 151 - "alternate_verses"
Cohesion: 0.50
Nodes (4): patternProperties, type, ^[0-9a-z]{1,8}$, alternate_verses

### Community 152 - "from"
Cohesion: 0.50
Nodes (4): enum, type, from, accuracy_claims

### Community 153 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 154 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 155 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 156 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 157 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 158 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 159 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 160 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 161 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 162 - "url_slug"
Cohesion: 0.67
Nodes (3): url_slug, pattern, type

### Community 163 - "types"
Cohesion: 0.29
Nodes (7): $ref, translations, types, items, type, items, type

### Community 164 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 165 - "meters_per_pixel"
Cohesion: 0.67
Nodes (3): enum, type, meters_per_pixel

### Community 166 - "thumbnails"
Cohesion: 0.67
Nodes (3): thumbnails, patternProperties, type

### Community 167 - "kml_file"
Cohesion: 0.67
Nodes (3): kml_file, pattern, type

### Community 168 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 169 - "image_id"
Cohesion: 0.67
Nodes (3): image_id, pattern, type

### Community 170 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 171 - "friendly_id"
Cohesion: 0.67
Nodes (3): pattern, type, friendly_id

### Community 172 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

### Community 190 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

## Knowledge Gaps
- **1337 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1332 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enum` connect `enum` to `enum`, `properties`, `enum`, `enum`, `description`, `enum`, `properties`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `color-picker.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `settings-dialog.tsx`, `cn`, `sidebar.tsx`, `dependencies`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1337 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05717171717171717 - nodes in this community are weakly interconnected._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06330625895843286 - nodes in this community are weakly interconnected._