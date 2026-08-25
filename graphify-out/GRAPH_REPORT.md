# Graph Report - .  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3170 nodes · 6401 edges · 204 communities (174 shown, 30 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `975039c6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- plugins.tsx
- utils.ts
- color-picker.tsx
- enum
- search-page.tsx
- cn
- use-reader-notes.ts
- references.ts
- settings-dialog.tsx
- sidebar.tsx
- reader-panel-tree.tsx
- kjv-reader.tsx
- dependencies
- properties
- Modern locations (modern.jsonl)
- enum
- reader-layout.ts
- reader-transfer.ts
- Largest Differences
- note-links.ts
- bible.ts
- properties
- reader.ts
- chapter-text-content.tsx
- properties
- compilerOptions
- Data, Offline Cache, and Deployment
- properties
- command.tsx
- properties
- properties
- properties
- fetch-map-photos.mjs
- required
- properties
- Codebase Improvement Plan
- download-page.tsx
- notes-page.tsx
- compilerOptions
- maps.ts
- use-study-workspace-state.ts
- components.json
- scripts
- enum
- report-strongs-derivation-links.mjs
- card.tsx
- lib/bookmarks.ts
- required
- definitions
- build-genealogy-compact.mjs
- use-panel-routing.ts
- layout-hash.ts
- reference-command.ts
- properties
- properties
- description
- reader-transfer.test.ts
- definitions
- import_osis_to_sqlite.py
- devDependencies
- properties
- required
- properties
- properties
- reader-data.ts
- definitions
- enum
- properties
- enum
- welcome-home-page.tsx
- build-kjv-runtime-manifest.mjs
- properties
- check-dist.mjs
- reader-neighbors.ts
- enum
- ^s[0-9a-f]{6}$
- enum
- build-map-json.mjs
- ReaderTab
- use-workspace-navigation.ts
- properties
- enum
- required
- definitions
- enum
- required
- id
- media_object_alternate
- Webster Source Analysis
- required
- properties
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- use-leaf-history.ts
- use-word-study-navigation.ts
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
- media_object_google
- Genealogy Note Reference Report
- editor.tsx
- help-page.tsx
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
- enum
- votes
- ^a[0-9a-f]{6}$
- Webster Coverage Report
- websters-import-ready-candidates.md
- Webster Proposed Add List
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
- progress.tsx
- service-worker-cache.ts
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
- lonlat
- descriptions
- meters_per_pixel
- thumbnails
- use-verse-search-index.ts
- image_id
- lonlat
- abbreviation
- friendly_id
- id
- AI Dictionary Current High-Value Gaps
- cache-config.d.ts
- leaflet-shim.d.ts
- eslint-plugin-react-hooks
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
- amazon_id
- amazon_url
- url_slug
- google_books_id
- google_books_url
- logos_id
- logos_resource_id
- logos_url
- olivetree_id
- type
- url
- web_archive_url
- worldcat_id
- best_commentaries_series_id

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 53 edges
4. `Book` - 50 edges
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

### Community 0 - "plugins.tsx"
Cohesion: 0.06
Nodes (65): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+57 more)

### Community 1 - "utils.ts"
Cohesion: 0.06
Nodes (67): ConcordanceReferencePopover, ConcordanceReferencePopoverProps, GenealogyPersonDetailsProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, resetStudySearchDraft(), shouldShowStudySearchResetButton(), StudySearchForm() (+59 more)

### Community 2 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 3 - "enum"
Cohesion: 0.03
Nodes (71): altar, cliff, field, ford, gate, hill, map, mine (+63 more)

### Community 4 - "search-page.tsx"
Cohesion: 0.07
Nodes (59): ProgressPanelContent(), BookGroup, clampGroupIndices(), isChecked(), normalizeSearchMode(), sameSet(), SEARCH_HELP_ITEMS, SEARCH_MODE_LABELS (+51 more)

### Community 5 - "cn"
Cohesion: 0.06
Nodes (55): GenealogyNode(), GenealogyRelationGrid(), OldEnglishTool(), PhrasesTool(), TopicsTool(), UnitsTool(), AlertDialogOverlay(), ButtonGroup() (+47 more)

### Community 6 - "use-reader-notes.ts"
Cohesion: 0.08
Nodes (51): useReadChapters(), useReaderBookmarks(), useReaderController(), UseReaderControllerOptions, contextFromScope(), useReaderNotes(), UseReaderNotesArgs, useReaderPreferences() (+43 more)

### Community 7 - "references.ts"
Cohesion: 0.09
Nodes (58): OpenWordInStudyToolsArgs, Setter, WordStudyCoordinatorParams, AIDictionaryIndex, aiDictionaryIndexCache, bibleWordBookAliasCache, earliestOrderedKey(), firstKeyIndex() (+50 more)

### Community 8 - "settings-dialog.tsx"
Cohesion: 0.08
Nodes (42): FloatingLinkEditor(), setFloatingElemPositionForLinkEditor(), BookChapterPicker(), BookChapterPickerProps, BookPickerDialogProps, CompletionCelebrationProps, CONFETTI_COLORS, GenealogyTreeDialog() (+34 more)

### Community 9 - "sidebar.tsx"
Cohesion: 0.05
Nodes (47): ReaderStudySidebarProps, SidebarCloseRequestSync(), SidebarOpenRequestSync(), BookmarksTool(), StudyToolsSidebar(), StudyToolsSidebarProps, TopicsPanel(), TopicsPanelProps (+39 more)

### Community 10 - "reader-panel-tree.tsx"
Cohesion: 0.07
Nodes (45): frameworks, roleItems, Example(), ExampleWrapper(), AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage (+37 more)

### Community 11 - "kjv-reader.tsx"
Cohesion: 0.07
Nodes (36): CompletionCelebration(), GenealogyPersonDetails(), GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, BeforeInstallPromptEvent, EMPTY_LEAF_NEIGHBORS (+28 more)

### Community 12 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 13 - "properties"
Cohesion: 0.04
Nodes (45): enum, type, path, point, geometry, enum, type, additionalProperties (+37 more)

### Community 14 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (39): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+31 more)

### Community 15 - "enum"
Cohesion: 0.05
Nodes (39): altar, cliff, field, ford, gate, hill, mine, pool (+31 more)

### Community 16 - "reader-layout.ts"
Cohesion: 0.13
Nodes (35): ReaderWordHighlight, SwapLeafState, UpdateActiveTab, usePanelInteractionController(), UsePanelInteractionControllerParams, closeLeafInTab(), collectLeafIds(), collectSameOrientationSplitIds() (+27 more)

### Community 17 - "reader-transfer.ts"
Cohesion: 0.12
Nodes (36): BookmarksExportPayload, EDITOR_ELEMENT_TYPES, EDITOR_LEAF_TYPES, EDITOR_NODE_TYPES, hasSafeEditorPayload(), hasSafeLinkAttributes(), hasSafeOptionalString(), HEADING_TAGS (+28 more)

### Community 18 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 19 - "note-links.ts"
Cohesion: 0.12
Nodes (27): $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode, NoteLinkAutoLinkPlugin(), applyInternalLink(), NoteLinkToolbarPlugin(), bookCodeForIndex(), bookPattern() (+19 more)

### Community 20 - "bible.ts"
Cohesion: 0.09
Nodes (31): bootstrap, empty, full, applyBootstrapReaderCorpus(), applyFullReaderCorpus(), applyReaderCorpusError(), INITIAL_STATE, readerCorpusErrorMessage() (+23 more)

### Community 21 - "properties"
Cohesion: 0.06
Nodes (33): type, $ref, properties, type, $ref, type, type, type (+25 more)

### Community 22 - "reader.ts"
Cohesion: 0.13
Nodes (28): useGenealogySearchTool(), UsePanelTargetingParams, canonicalizeGenealogyPersonNames(), collapseGenealogyNameVariant(), collectGenealogyCorpusData(), decodeGenealogyPayload(), decodeParent(), decodeReferences() (+20 more)

### Community 23 - "chapter-text-content.tsx"
Cohesion: 0.17
Nodes (15): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), TokenPopupCard(), TokenPopupCardProps (+7 more)

### Community 24 - "properties"
Cohesion: 0.07
Nodes (30): patternProperties, type, $ref, type, type, properties, $ref, pattern (+22 more)

### Community 25 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 26 - "Data, Offline Cache, and Deployment"
Cohesion: 0.07
Nodes (23): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Local Bible corpus contract (+15 more)

### Community 27 - "properties"
Cohesion: 0.08
Nodes (27): items, type, items, type, items, type, items, type (+19 more)

### Community 28 - "command.tsx"
Cohesion: 0.13
Nodes (20): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+12 more)

### Community 29 - "properties"
Cohesion: 0.08
Nodes (25): additionalProperties, type, type, type, pattern, type, the, pattern (+17 more)

### Community 30 - "properties"
Cohesion: 0.09
Nodes (25): pattern, type, items, additionalProperties, pattern, properties, type, items (+17 more)

### Community 31 - "properties"
Cohesion: 0.08
Nodes (26): $ref, $ref, pattern, type, type, $ref, $ref, the (+18 more)

### Community 32 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 33 - "required"
Cohesion: 0.09
Nodes (24): types, required, required, geojson_file, types, additionalProperties, class, friendly_id (+16 more)

### Community 34 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 35 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 36 - "download-page.tsx"
Cohesion: 0.15
Nodes (23): buildAudioUrls(), bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage() (+15 more)

### Community 37 - "notes-page.tsx"
Cohesion: 0.19
Nodes (21): createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps, parseSerializedState(), scopeFromContext(), scopeSummary() (+13 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 39 - "maps.ts"
Cohesion: 0.15
Nodes (18): MapAndPhotoDialogs(), MapBoundsSync, useMapDialogState(), UseMapDialogStateArgs, useMapsSearchTool(), AncientMapEntry, AncientMapPayload, boundsForGeoJson() (+10 more)

### Community 40 - "use-study-workspace-state.ts"
Cohesion: 0.20
Nodes (12): normalizeReaderMode(), normalizeTabsOrientation(), useReaderShellState(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS (+4 more)

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

### Community 45 - "card.tsx"
Cohesion: 0.13
Nodes (18): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), ReaderStatusScreen(), ReaderStatusScreenProps (+10 more)

### Community 46 - "lib/bookmarks.ts"
Cohesion: 0.22
Nodes (19): UseReaderBookmarksArgs, BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical(), comparePoint() (+11 more)

### Community 47 - "required"
Cohesion: 0.10
Nodes (22): required, items, minItems, type, items, type, additionalProperties, required (+14 more)

### Community 48 - "definitions"
Cohesion: 0.09
Nodes (22): definitions, geojson_file, geometry_id, kml_file, lonlat_mixed_precision, modern_id, source_id, uri (+14 more)

### Community 49 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 50 - "use-panel-routing.ts"
Cohesion: 0.18
Nodes (18): createGenesisReaderTab(), createWelcomeHomeTab(), buildTargetedReaderPanelInTabState(), ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), usePanelRouting(), UsePanelRoutingParams (+10 more)

### Community 51 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 52 - "reference-command.ts"
Cohesion: 0.15
Nodes (19): createReferenceParser(), flattenParsedEntities(), formatCrossChapterRangeLabel(), formatReferenceRanges(), isFullSingleChapterReference(), isOsisBookCode(), locationFromTarget(), matchBookOnlyInput() (+11 more)

### Community 53 - "properties"
Cohesion: 0.10
Nodes (21): type, type, $ref, $ref, type, $ref, type, properties (+13 more)

### Community 54 - "properties"
Cohesion: 0.14
Nodes (14): type, $ref, media_object_thumbnail, pattern, type, additionalProperties, properties, type (+6 more)

### Community 55 - "description"
Cohesion: 0.11
Nodes (21): geojson_geometry, geojson_point, type, additionalProperties, properties, required, type, additionalProperties (+13 more)

### Community 56 - "reader-transfer.test.ts"
Cohesion: 0.15
Nodes (17): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile() (+9 more)

### Community 57 - "definitions"
Cohesion: 0.10
Nodes (20): definitions, geojson_file, geometry_id, json_file, lonlat_mixed_precision, lonlats, uri, pattern (+12 more)

### Community 58 - "import_osis_to_sqlite.py"
Cohesion: 0.23
Nodes (17): Any, Element, Path, collect_chapter_tokens(), flatten_text(), is_red_quote(), local_tag(), main() (+9 more)

### Community 59 - "devDependencies"
Cohesion: 0.11
Nodes (19): @axe-core/playwright, eslint, @eslint/js, eslint-plugin-react-refresh, devDependencies, @axe-core/playwright, eslint, @eslint/js (+11 more)

### Community 60 - "properties"
Cohesion: 0.15
Nodes (13): additionalProperties, properties, type, type, combined, common_noun, helper, instance_types (+5 more)

### Community 61 - "required"
Cohesion: 0.12
Nodes (19): items, type, additionalProperties, required, class, identifications, resolutions, verses (+11 more)

### Community 62 - "properties"
Cohesion: 0.11
Nodes (19): properties, type, properties, type, minimum, type, comment, name (+11 more)

### Community 63 - "properties"
Cohesion: 0.12
Nodes (19): items, type, items, type, $ref, additionalProperties, properties, type (+11 more)

### Community 64 - "reader-data.ts"
Cohesion: 0.11
Nodes (29): deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool() (+21 more)

### Community 65 - "definitions"
Cohesion: 0.11
Nodes (18): pattern, type, pattern, type, definitions, ancient_id, ancient_or_modern_id, image_id (+10 more)

### Community 66 - "enum"
Cohesion: 0.11
Nodes (18): vote_tag, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar, authority_traditional (+10 more)

### Community 67 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 68 - "enum"
Cohesion: 0.12
Nodes (17): >, near, enum, actual, another part of same historical site, artifact, bay, correct location, wrong site (+9 more)

### Community 69 - "welcome-home-page.tsx"
Cohesion: 0.18
Nodes (14): StaticPage(), StaticPageProps, DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, DailyScriptureTopicsPayload (+6 more)

### Community 70 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 71 - "properties"
Cohesion: 0.13
Nodes (15): type, $ref, type, $ref, properties, best_commentaries_book_id, best_commentaries_url, display_name (+7 more)

### Community 72 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 73 - "reader-neighbors.ts"
Cohesion: 0.22
Nodes (12): useReaderDerivedState(), UseReaderDerivedStateArgs, buildLeafNeighborMap(), buildLeafNeighborMapFromDom(), collectLeafRects(), LeafNeighbors, LeafRect, neighborForDirection() (+4 more)

### Community 74 - "enum"
Cohesion: 0.15
Nodes (14): enum, enum, source, enum, type, ancient, modern, nonunique_url (+6 more)

### Community 75 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 76 - "enum"
Cohesion: 0.17
Nodes (12): role, enum, type, satellite, role, enum, type, enum (+4 more)

### Community 77 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 78 - "ReaderTab"
Cohesion: 0.32
Nodes (11): elementOffsetWithin(), usePendingReaderScroll(), UsePendingReaderScrollParams, calculateReaderScrollTop(), dequeuePendingReaderScrollTarget(), prunePendingReaderScrollTargets(), queuePendingReaderScrollTarget(), selectPendingReaderScrollTargetForActiveTab() (+3 more)

### Community 79 - "use-workspace-navigation.ts"
Cohesion: 0.30
Nodes (9): ChapterRef, useWorkspaceNavigation(), UseWorkspaceNavigationParams, updateLeafNode(), isDedicatedLeafViewTab(), nextSearchTabTitle(), panelNodeContainsView(), LeafNode (+1 more)

### Community 80 - "properties"
Cohesion: 0.12
Nodes (16): type, $ref, media_object, pattern, type, $ref, additionalProperties, properties (+8 more)

### Community 81 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 82 - "required"
Cohesion: 0.20
Nodes (10): required, time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average (+2 more)

### Community 83 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 84 - "enum"
Cohesion: 0.15
Nodes (13): article, chapter, website, map, enum, book, book set, coordinates (+5 more)

### Community 85 - "required"
Cohesion: 0.24
Nodes (12): file, required, enum, credit, description, file, image_id, placeholder (+4 more)

### Community 86 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 87 - "media_object_alternate"
Cohesion: 0.20
Nodes (10): media_object_alternate, additionalProperties, properties, type, proximity_meters, quality, type, enum (+2 more)

### Community 88 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 89 - "required"
Cohesion: 0.18
Nodes (11): name, score, additionalProperties, required, type, additionalProperties, patternProperties, type (+3 more)

### Community 90 - "properties"
Cohesion: 0.10
Nodes (20): geo_source, additionalProperties, required, type, type, type, additionalProperties, properties (+12 more)

### Community 91 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 92 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 93 - "use-leaf-history.ts"
Cohesion: 0.31
Nodes (8): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams

### Community 94 - "use-word-study-navigation.ts"
Cohesion: 0.27
Nodes (9): contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, useWordStudyNavigation(), UseWordStudyNavigationParams, chapterVerseKey(), normalizeStrongsCode(), OrderedKey (+1 more)

### Community 95 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 96 - "properties"
Cohesion: 0.11
Nodes (19): items, type, properties, identification_ids, score, time_best_fits, time_intercept, time_r_squared (+11 more)

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

### Community 106 - "media_object_google"
Cohesion: 0.25
Nodes (8): media_object_google, $ref, additionalProperties, properties, type, image_id, role, type

### Community 107 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 108 - "editor.tsx"
Cohesion: 0.31
Nodes (6): Editor(), editorConfig, nodes, editorTheme, TooltipProvider(), isInternalNoteLink()

### Community 109 - "help-page.tsx"
Cohesion: 0.31
Nodes (8): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), CardDescription()

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

### Community 120 - "enum"
Cohesion: 0.29
Nodes (7): place_modifier, <, near, enum, type, along, on

### Community 121 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

### Community 122 - "^a[0-9a-f]{6}$"
Cohesion: 0.29
Nodes (7): additionalProperties, type, additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, ancient_associations

### Community 123 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 124 - "websters-import-ready-candidates.md"
Cohesion: 0.29
Nodes (6): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary

### Community 125 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 126 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, class, human,natural, special

### Community 127 - "osm_version"
Cohesion: 0.33
Nodes (6): properties, minimum, type, osm_version, url, $ref

### Community 128 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, modifier, center n-s, center radial, west linear increasing

### Community 129 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, color, black_and_white, color, colorized

### Community 130 - "modifier"
Cohesion: 0.33
Nodes (6): type, modifier, source, properties, enum, type

### Community 131 - "What changed"
Cohesion: 0.33
Nodes (6): Compatibility preserved, Corpus and release integrity, Offline/cache behavior, Reader ownership and structure, Startup and search performance, What changed

### Community 132 - "Security assessment"
Cohesion: 0.33
Nodes (6): Defense-in-depth items not validated as current vulnerabilities, Dependency and supply-chain posture, Required remediations, Security assessment, Threat model, Validated findings

### Community 133 - "websters-coverage-refined-report.md"
Cohesion: 0.33
Nodes (5): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere

### Community 134 - "websters-high-value-candidates-report.md"
Cohesion: 0.33
Nodes (5): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary

### Community 135 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 136 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 137 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 138 - "review"
Cohesion: 0.40
Nodes (5): review, enum, type, automatic, uncertain

### Community 139 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 140 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 141 - "root"
Cohesion: 0.40
Nodes (5): root, additionalProperties, required, type, source

### Community 142 - "Recommendation disposition"
Cohesion: 0.40
Nodes (5): Priority 0 — security and deployment, Priority 1 — ownership and structure, Priority 2 — performance and delivery, Priority 3 — design, testing, and operations, Recommendation disposition

### Community 143 - "Structural assessment"
Cohesion: 0.40
Nodes (5): Main structural problem: orchestration concentration, Recommended target structure, State and persistence, Structural assessment, What is working well

### Community 144 - "Prioritized hardening roadmap"
Cohesion: 0.40
Nodes (5): Prioritized hardening roadmap, Priority 0 — prevent avoidable security and deployment failures, Priority 1 — create stable ownership boundaries, Priority 2 — remove main-thread and delivery bottlenecks, Priority 3 — consistency and maintainability

### Community 145 - "Webster Import Preview"
Cohesion: 0.40
Nodes (4): Notes, Preview Entries, Summary, Webster Import Preview

### Community 147 - "progress.tsx"
Cohesion: 0.40
Nodes (4): Progress(), ProgressIndicator(), ProgressLabel(), ProgressTrack()

### Community 148 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 149 - "from"
Cohesion: 0.50
Nodes (4): enum, type, from, accuracy_claims

### Community 150 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 151 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 152 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 153 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 154 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 155 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 156 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 157 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 158 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 159 - "url_slug"
Cohesion: 0.67
Nodes (3): url_slug, pattern, type

### Community 160 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 161 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 162 - "meters_per_pixel"
Cohesion: 0.67
Nodes (3): enum, type, meters_per_pixel

### Community 163 - "thumbnails"
Cohesion: 0.67
Nodes (3): thumbnails, patternProperties, type

### Community 164 - "use-verse-search-index.ts"
Cohesion: 0.43
Nodes (5): EMPTY_STATE, useVerseSearchIndex(), VerseSearchIndexState, beginPerformanceMeasure(), measureSynchronous()

### Community 165 - "image_id"
Cohesion: 0.67
Nodes (3): image_id, pattern, type

### Community 166 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 167 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 168 - "friendly_id"
Cohesion: 0.67
Nodes (3): pattern, type, friendly_id

### Community 169 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

### Community 188 - "url_slug"
Cohesion: 0.67
Nodes (3): url_slug, pattern, type

## Knowledge Gaps
- **1324 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1319 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enum` connect `enum` to `enum`, `enum`, `properties`, `enum`, `enum`, `description`, `properties`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `color-picker.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `cn`, `sidebar.tsx`, `reader-panel-tree.tsx`, `dependencies`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1324 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055658627087198514 - nodes in this community are weakly interconnected._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06241234221598878 - nodes in this community are weakly interconnected._