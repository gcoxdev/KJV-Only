# Graph Report - .  (2026-08-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 3146 nodes · 6296 edges · 213 communities (182 shown, 31 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8879054a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- plugins.tsx
- utils.ts
- search-page.tsx
- settings-dialog.tsx
- color-picker.tsx
- enum
- reader-panel-tree.tsx
- cn
- reader-transfer.ts
- sidebar.tsx
- dependencies
- kjv-reader.tsx
- Modern locations (modern.jsonl)
- reference-command.ts
- enum
- Largest Differences
- reader.ts
- reader-data.ts
- properties
- notes-page.tsx
- reader-layout.ts
- use-reader-bookmarks.ts
- references.ts
- properties
- compilerOptions
- note-links.ts
- Data, Offline Cache, and Deployment
- properties
- properties
- properties
- fetch-map-photos.mjs
- properties
- required
- properties
- properties
- enum
- Codebase Improvement Plan
- download-page.tsx
- compilerOptions
- bible.ts
- components.json
- scripts
- report-strongs-derivation-links.mjs
- build-genealogy-compact.mjs
- use-panel-routing.ts
- maps.ts
- layout-hash.ts
- enum
- lib/bookmarks.ts
- reader-persistence.ts
- required
- definitions
- card.tsx
- import_osis_to_sqlite.py
- devDependencies
- properties
- properties
- properties
- id
- genealogy.ts
- use-strongs-search-tool.ts
- enum
- properties
- properties
- enum
- swapRecordEntries
- properties
- items
- definitions
- build-kjv-runtime-manifest.mjs
- definitions
- required
- properties
- check-dist.mjs
- ^s[0-9a-f]{6}$
- build-map-json.mjs
- progress-dialog.tsx
- enum
- properties
- definitions
- required
- enum
- editor.tsx
- id
- enum
- Webster Source Analysis
- reader-neighbors.ts
- use-study-workspace-state.ts
- properties
- properties
- root
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- use-leaf-history.ts
- use-word-study-navigation.ts
- enum
- required
- enum
- suggested
- Assessment Follow-Up and Final Hardening Record
- KJV Only Hardening Remediation Report
- KJV Only Project Assessment
- build-topics-index.mjs
- why-kjv-only-page.tsx
- geojson_geometry
- geometry.json
- enum
- geo_source
- Genealogy Note Reference Report
- help-page.tsx
- static-page.tsx
- media_parent
- items
- image.json
- media_object_alternate
- description
- source.json
- sw.js
- Genealogy Note Cleanup Preview
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- vite.config.ts
- how-to-get-saved-page.tsx
- welcome-home-page.tsx
- enum
- types
- votes
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
- use-topics-tool.ts
- tsconfig.json
- package.json
- alternate_roots
- enum
- enum
- enum
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- Webster Import Preview
- App.tsx
- use-concordance-crossrefs-tool.ts
- service-worker-cache.ts
- alternate_verses
- from
- quality
- alternate_urls
- contributors
- vote_count
- Testing, linting, and release engineering
- Performance assessment
- Strong's Derivation Link Audit
- image_id
- lonlat
- modern_id
- source_id
- uri
- geojson_file
- descriptions
- geometry_id
- kml_file
- lonlat
- lonlat_mixed_precision
- modern_id
- geojson_roles
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
- simplified_precise
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
3. `KJVReader()` - 57 edges
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

## Communities (213 total, 31 thin omitted)

### Community 0 - "plugins.tsx"
Cohesion: 0.05
Nodes (67): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+59 more)

### Community 1 - "utils.ts"
Cohesion: 0.06
Nodes (68): ConcordanceReferencePopover, ConcordanceReferencePopoverProps, GenealogyPersonDetailsProps, ReaderStudySidebarProps, ReaderStudyToolsContent(), ReaderStudyToolsContentProps, resetStudySearchDraft(), shouldShowStudySearchResetButton() (+60 more)

### Community 2 - "search-page.tsx"
Cohesion: 0.06
Nodes (70): ChapterTextContent, ChapterTextContentProps, isPunctuationToken(), renderToken(), renderVerseTokens(), ProgressPanelContent(), BookGroup, clampGroupIndices() (+62 more)

### Community 3 - "settings-dialog.tsx"
Cohesion: 0.06
Nodes (51): BookChapterPicker(), BookChapterPickerProps, BookPickerDialogProps, CompletionCelebration(), CompletionCelebrationProps, CONFETTI_COLORS, GenealogyNode(), GenealogyRelationGrid() (+43 more)

### Community 4 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 5 - "enum"
Cohesion: 0.03
Nodes (71): altar, cliff, field, ford, gate, hill, map, mine (+63 more)

### Community 6 - "reader-panel-tree.tsx"
Cohesion: 0.06
Nodes (50): frameworks, roleItems, Example(), ExampleWrapper(), AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage (+42 more)

### Community 7 - "cn"
Cohesion: 0.06
Nodes (51): OldEnglishTool(), PhrasesTool(), TopicsTool(), UnitsTool(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+43 more)

### Community 8 - "reader-transfer.ts"
Cohesion: 0.08
Nodes (50): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), BookmarksExportPayload, createBookmarksExportPayload(), createNotesExportPayload() (+42 more)

### Community 9 - "sidebar.tsx"
Cohesion: 0.05
Nodes (44): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebar(), StudyToolsSidebarProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter() (+36 more)

### Community 10 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 11 - "kjv-reader.tsx"
Cohesion: 0.08
Nodes (43): GenealogyPersonDetails(), GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, BeforeInstallPromptEvent, isDedicatedLeafViewTab(), KJVReader() (+35 more)

### Community 12 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (39): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+31 more)

### Community 13 - "reference-command.ts"
Cohesion: 0.09
Nodes (35): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+27 more)

### Community 14 - "enum"
Cohesion: 0.05
Nodes (39): altar, cliff, field, ford, gate, hill, mine, pool (+31 more)

### Community 15 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 16 - "reader.ts"
Cohesion: 0.12
Nodes (34): OpenWordInStudyToolsArgs, Setter, WordStudyCoordinatorParams, AncientMapPayload, books, AIDictionarySelection, findGenealogyMatches(), findMapMatches() (+26 more)

### Community 17 - "reader-data.ts"
Cohesion: 0.12
Nodes (27): isPositiveSafeInteger(), KJV_CORPUS_MANIFEST_URL, KjvCorpusAsset, KjvCorpusManifest, matchesKjvCorpusAsset(), parseAsset(), parseKjvCorpusManifest(), beginPerformanceMeasure() (+19 more)

### Community 18 - "properties"
Cohesion: 0.06
Nodes (33): type, $ref, properties, type, $ref, type, type, type (+25 more)

### Community 19 - "notes-page.tsx"
Cohesion: 0.14
Nodes (28): createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps, parseSerializedState(), scopeFromContext(), scopeSummary() (+20 more)

### Community 20 - "reader-layout.ts"
Cohesion: 0.13
Nodes (29): closeLeafInTab(), collectSameOrientationSplitIds(), countLeaves(), createdLeafIdFromWrappedNode(), directionOrientation(), findContiguousGroupRootId(), findGroupTargetNodeId(), findLeafNode() (+21 more)

### Community 21 - "use-reader-bookmarks.ts"
Cohesion: 0.18
Nodes (23): useReadChapters(), useReaderBookmarks(), UseReaderBookmarksArgs, useReaderController(), UseReaderControllerOptions, useReaderPreferences(), UseReaderPreferencesOptions, useVerseSearchIndex() (+15 more)

### Community 22 - "references.ts"
Cohesion: 0.17
Nodes (29): AIDictionaryIndex, aiDictionaryIndexCache, bibleWordBookAliasCache, earliestOrderedKey(), firstKeyIndex(), getAIDictionaryIndex(), getBibleWordBookAliasIndex(), getUnitsCandidateIndex() (+21 more)

### Community 23 - "properties"
Cohesion: 0.07
Nodes (29): items, type, items, type, items, type, items, type (+21 more)

### Community 24 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 25 - "note-links.ts"
Cohesion: 0.17
Nodes (24): $createKjvInternalLinkNode(), NoteLinkAutoLinkPlugin(), applyInternalLink(), NoteLinkToolbarPlugin(), bookCodeForIndex(), bookPattern(), buildNoteLinkHref(), buildTypedReferenceRegex() (+16 more)

### Community 26 - "Data, Offline Cache, and Deployment"
Cohesion: 0.07
Nodes (23): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Local Bible corpus contract (+15 more)

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

### Community 31 - "properties"
Cohesion: 0.09
Nodes (25): $ref, type, items, additionalProperties, properties, pattern, type, geometry_id (+17 more)

### Community 32 - "required"
Cohesion: 0.09
Nodes (24): types, required, required, geojson_file, types, additionalProperties, class, friendly_id (+16 more)

### Community 33 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 34 - "properties"
Cohesion: 0.08
Nodes (25): type, type, $ref, $ref, type, $ref, enum, type (+17 more)

### Community 35 - "enum"
Cohesion: 0.08
Nodes (25): enum, type, license, attribution, CC-BY-2.0, CC-BY-2.5, CC-BY-3.0, CC-BY-4.0 (+17 more)

### Community 36 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 37 - "download-page.tsx"
Cohesion: 0.15
Nodes (23): buildAudioUrls(), bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage() (+15 more)

### Community 38 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 39 - "bible.ts"
Cohesion: 0.14
Nodes (17): bootstrap, empty, full, applyBootstrapReaderCorpus(), applyFullReaderCorpus(), applyReaderCorpusError(), INITIAL_STATE, readerCorpusErrorMessage() (+9 more)

### Community 40 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 41 - "scripts"
Cohesion: 0.09
Nodes (23): scripts, audit, build, build:all, build:concordance, build:data, build:data-manifest, build:genealogy (+15 more)

### Community 42 - "report-strongs-derivation-links.mjs"
Cohesion: 0.09
Nodes (21): allKeys, crossPrefix, findings, greek, greekFindings, greekKeys, greekPath, hebrew (+13 more)

### Community 43 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 44 - "use-panel-routing.ts"
Cohesion: 0.19
Nodes (18): createGenesisReaderTab(), createWelcomeHomeTab(), buildTargetedReaderPanelInTabState(), ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), usePanelRouting(), UsePanelRoutingParams (+10 more)

### Community 45 - "maps.ts"
Cohesion: 0.17
Nodes (16): MapAndPhotoDialogs(), MapBoundsSync, UseMapDialogStateArgs, useMapsSearchTool(), AncientMapEntry, boundsForGeoJson(), cleanMapMarkup(), extractCoordinateBounds() (+8 more)

### Community 46 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 47 - "enum"
Cohesion: 0.10
Nodes (21): vote_tag, enum, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar (+13 more)

### Community 48 - "lib/bookmarks.ts"
Cohesion: 0.22
Nodes (18): BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical(), comparePoint(), normalizeBookmarkRanges() (+10 more)

### Community 49 - "reader-persistence.ts"
Cohesion: 0.17
Nodes (18): channelToLinear(), contrastRatio(), defaultHighlightColor(), hexToRgb(), normalizeHighlightColor(), readableHighlightTextColor(), relativeLuminance(), defaultReaderDisplaySettings() (+10 more)

### Community 50 - "required"
Cohesion: 0.10
Nodes (20): required, class, name, score, additionalProperties, required, type, additionalProperties (+12 more)

### Community 51 - "definitions"
Cohesion: 0.10
Nodes (20): definitions, geometry_id, json_file, lonlat, lonlat_mixed_precision, lonlats, uri, pattern (+12 more)

### Community 52 - "card.tsx"
Cohesion: 0.15
Nodes (14): formatDisplayTokenText(), ReaderStatusScreen(), ReaderStatusScreenProps, RESOURCE_SECTIONS, ResourceItem, ResourceSection, ResourcesPage(), TokenPopupCard() (+6 more)

### Community 53 - "import_osis_to_sqlite.py"
Cohesion: 0.23
Nodes (17): Any, Element, Path, collect_chapter_tokens(), flatten_text(), is_red_quote(), local_tag(), main() (+9 more)

### Community 54 - "devDependencies"
Cohesion: 0.11
Nodes (19): @axe-core/playwright, eslint, @eslint/js, eslint-plugin-react-refresh, devDependencies, @axe-core/playwright, eslint, @eslint/js (+11 more)

### Community 55 - "properties"
Cohesion: 0.15
Nodes (13): score, time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average (+5 more)

### Community 56 - "properties"
Cohesion: 0.11
Nodes (19): properties, type, properties, type, minimum, type, comment, name (+11 more)

### Community 57 - "properties"
Cohesion: 0.12
Nodes (19): items, type, items, type, $ref, additionalProperties, properties, type (+11 more)

### Community 58 - "id"
Cohesion: 0.12
Nodes (19): geojson_geometry, geojson_point, additionalProperties, properties, required, type, additionalProperties, properties (+11 more)

### Community 59 - "genealogy.ts"
Cohesion: 0.22
Nodes (17): canonicalizeGenealogyPersonNames(), collapseGenealogyNameVariant(), collectGenealogyCorpusData(), decodeGenealogyPayload(), decodeParent(), decodeReferences(), decodeRelation(), dedupeReferences() (+9 more)

### Community 60 - "use-strongs-search-tool.ts"
Cohesion: 0.20
Nodes (13): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), loadStrongsGreek(), loadStrongsHebrew() (+5 more)

### Community 61 - "enum"
Cohesion: 0.12
Nodes (17): enum, type, enum, id_source, source, enum, type, ancient (+9 more)

### Community 62 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 63 - "properties"
Cohesion: 0.12
Nodes (17): properties, $ref, $ref, $ref, $ref, $ref, isobands, local (+9 more)

### Community 64 - "enum"
Cohesion: 0.12
Nodes (17): >, near, enum, actual, another part of same historical site, artifact, bay, correct location, wrong site (+9 more)

### Community 65 - "swapRecordEntries"
Cohesion: 0.24
Nodes (12): createDefaultSearchPageState(), useReaderSearchPages(), normalizeRanges(), useVerseHighlights(), UseVerseHighlightsArgs, VerseHighlightRange, clearSingleLeafReferenceIfMissing(), filterRecordEntries() (+4 more)

### Community 66 - "properties"
Cohesion: 0.12
Nodes (16): type, $ref, media_object, pattern, type, $ref, additionalProperties, properties (+8 more)

### Community 67 - "items"
Cohesion: 0.13
Nodes (16): items, minItems, type, items, type, additionalProperties, type, items (+8 more)

### Community 68 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, geojson_file, image_id, source_id, uri, url_slug, pattern, type (+8 more)

### Community 69 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 70 - "definitions"
Cohesion: 0.13
Nodes (15): pattern, type, pattern, type, definitions, ancient_id, ancient_or_modern_id, geometry_id (+7 more)

### Community 71 - "required"
Cohesion: 0.18
Nodes (15): file, required, media_object_thumbnail, enum, credit, description, file, image_id (+7 more)

### Community 72 - "properties"
Cohesion: 0.13
Nodes (15): type, type, $ref, properties, best_commentaries_book_id, display_name, olivetree_url, publisher (+7 more)

### Community 73 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 74 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 75 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 76 - "progress-dialog.tsx"
Cohesion: 0.18
Nodes (11): ProgressBook, ProgressByTestament, ProgressChapter, ProgressDialogProps, ProgressPanelContentProps, ProgressTestament, Progress(), ProgressIndicator() (+3 more)

### Community 77 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 78 - "properties"
Cohesion: 0.11
Nodes (19): items, type, additionalProperties, properties, type, properties, type, combined (+11 more)

### Community 79 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 80 - "required"
Cohesion: 0.17
Nodes (13): additionalProperties, required, type, additionalProperties, patternProperties, type, required, name (+5 more)

### Community 81 - "enum"
Cohesion: 0.15
Nodes (13): article, chapter, website, map, enum, book, book set, coordinates (+5 more)

### Community 82 - "editor.tsx"
Cohesion: 0.18
Nodes (6): Editor(), editorConfig, nodes, isKjvInternalUrl(), KjvInternalLinkNode, editorTheme

### Community 83 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 84 - "enum"
Cohesion: 0.17
Nodes (12): role, enum, type, satellite, role, enum, type, enum (+4 more)

### Community 85 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 86 - "reader-neighbors.ts"
Cohesion: 0.27
Nodes (10): UseReaderDerivedStateArgs, collectLeafIds(), buildLeafNeighborMap(), buildLeafNeighborMapFromDom(), collectLeafRects(), LeafNeighbors, LeafRect, neighborForDirection() (+2 more)

### Community 87 - "use-study-workspace-state.ts"
Cohesion: 0.26
Nodes (9): normalizeReaderMode(), normalizeTabsOrientation(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS, UseStudyWorkspaceStateArgs (+1 more)

### Community 88 - "properties"
Cohesion: 0.18
Nodes (11): type, $ref, pattern, type, properties, pattern, type, credit (+3 more)

### Community 89 - "properties"
Cohesion: 0.18
Nodes (11): type, properties, meters, radius_geometry_id, same_as, type, $ref, enum (+3 more)

### Community 90 - "root"
Cohesion: 0.18
Nodes (11): type, modifier, root, source, additionalProperties, properties, required, type (+3 more)

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
Cohesion: 0.23
Nodes (10): contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, useWordStudyNavigation(), UseWordStudyNavigationParams, chapterVerseKey(), normalizeStrongsCode(), OrderedKey (+2 more)

### Community 95 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 96 - "required"
Cohesion: 0.20
Nodes (10): required, time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average (+2 more)

### Community 97 - "enum"
Cohesion: 0.20
Nodes (10): enum, type, path, point, geometry, isobands, points, polygon_with_center (+2 more)

### Community 98 - "suggested"
Cohesion: 0.20
Nodes (10): $ref, $ref, label_line, label_line_horizontal, rough_boundary, suggested, $ref, additionalProperties (+2 more)

### Community 99 - "Assessment Follow-Up and Final Hardening Record"
Cohesion: 0.20
Nodes (7): Assessment Follow-Up and Final Hardening Record, Executive result, Graphify architecture map, Release control, Residual and deferred work, Security assessment, Verification record

### Community 100 - "KJV Only Hardening Remediation Report"
Cohesion: 0.20
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 101 - "KJV Only Project Assessment"
Cohesion: 0.20
Nodes (10): Architecture map, Design-system and UX implementation assessment, Documentation and operational ownership, Executive assessment, Final judgment, Graphify results, KJV Only Project Assessment, Overall posture (+2 more)

### Community 102 - "build-topics-index.mjs"
Cohesion: 0.29
Nodes (8): BOOK_CODE_MAP, compareTopic(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), toTitleCase()

### Community 103 - "why-kjv-only-page.tsx"
Cohesion: 0.20
Nodes (8): CASE_AT_A_GLANCE, EXTERNAL_SOURCES, ExternalSource, KJV_ONLY_SECTIONS, KJVOnlySection, ScriptureReference, WhyKJVOnlyPage(), WhyKJVOnlyPageProps

### Community 104 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 105 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, id, required, $schema, type, geometry, format, land_or_water

### Community 106 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 107 - "geo_source"
Cohesion: 0.22
Nodes (9): geo_source, additionalProperties, required, type, type, additionalProperties, required, type (+1 more)

### Community 108 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 109 - "help-page.tsx"
Cohesion: 0.31
Nodes (8): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), CardHeader()

### Community 110 - "static-page.tsx"
Cohesion: 0.33
Nodes (7): StaticPage(), StaticPageProps, getStaticPage(), STATIC_PAGE_MAP, STATIC_PAGES, StaticPageDefinition, StaticPageId

### Community 111 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 112 - "items"
Cohesion: 0.25
Nodes (8): additionalProperties, required, type, url, source_urls, items, type, osm_version

### Community 113 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 114 - "media_object_alternate"
Cohesion: 0.25
Nodes (8): media_object_alternate, $ref, additionalProperties, properties, type, image_id, proximity_meters, type

### Community 115 - "description"
Cohesion: 0.25
Nodes (8): media_object_google, type, additionalProperties, properties, type, description, role, type

### Community 116 - "source.json"
Cohesion: 0.25
Nodes (7): additionalProperties, definitions, uri, $schema, type, pattern, type

### Community 117 - "sw.js"
Cohesion: 0.36
Nodes (6): APP_SHELL, cacheFirst(), LIVE_DATA_PREFIXES, networkFirst(), shouldCacheResponse(), shouldUseNetworkFirst()

### Community 118 - "Genealogy Note Cleanup Preview"
Cohesion: 0.25
Nodes (7): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Preview, Genealogy Note Cleanup Preview, Sample Previews, Seth / Sheth (seth_17), Summary

### Community 120 - "normalize-strongs-derivation-links.mjs"
Cohesion: 0.29
Nodes (6): allKeys, files, normalizeStrongsRef(), replaceDerivationRefs(), repoRoot, summary

### Community 121 - "vite.config.ts"
Cohesion: 0.39
Nodes (4): EXACT_RUNTIME_ASSETS, isAllowedRuntimeFile(), RUNTIME_PUBLIC_ENTRIES, runtimeAssetRequestPath()

### Community 122 - "how-to-get-saved-page.tsx"
Cohesion: 0.29
Nodes (7): GospelStep, HowToGetSavedPage(), HowToGetSavedPageProps, ReferenceList(), renderReferenceText(), ROMANS_ROAD_STEPS, ScriptureReference

### Community 123 - "welcome-home-page.tsx"
Cohesion: 0.36
Nodes (7): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, DailyScriptureTopicsPayload, loadDailyScriptureTopics()

### Community 124 - "enum"
Cohesion: 0.29
Nodes (7): place_modifier, <, near, enum, type, along, on

### Community 125 - "types"
Cohesion: 0.29
Nodes (7): $ref, translations, types, items, type, items, type

### Community 126 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

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
Cohesion: 0.29
Nodes (7): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), CardDescription()

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

### Community 140 - "use-topics-tool.ts"
Cohesion: 0.40
Nodes (5): TOPIC_LETTERS, TopicsToolEntry, useTopicsTool(), loadTopicsIndex(), TopicsIndexPayload

### Community 141 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 142 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 143 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 144 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 145 - "enum"
Cohesion: 0.40
Nodes (5): enum, type, human, probability, class

### Community 146 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

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

### Community 152 - "use-concordance-crossrefs-tool.ts"
Cohesion: 0.70
Nodes (4): deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), loadCrossRefs(), decodeConcordanceReferences()

### Community 153 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 154 - "alternate_verses"
Cohesion: 0.50
Nodes (4): patternProperties, type, ^[0-9a-z]{1,8}$, alternate_verses

### Community 155 - "from"
Cohesion: 0.50
Nodes (4): enum, type, from, accuracy_claims

### Community 156 - "quality"
Cohesion: 0.50
Nodes (4): quality, enum, type, low

### Community 157 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 158 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 159 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 160 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 161 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 162 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 163 - "image_id"
Cohesion: 0.67
Nodes (3): image_id, pattern, type

### Community 164 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 165 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 166 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 167 - "uri"
Cohesion: 0.67
Nodes (3): uri, pattern, type

### Community 168 - "geojson_file"
Cohesion: 0.67
Nodes (3): geojson_file, pattern, type

### Community 169 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 170 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 171 - "kml_file"
Cohesion: 0.67
Nodes (3): kml_file, pattern, type

### Community 172 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 173 - "lonlat_mixed_precision"
Cohesion: 0.67
Nodes (3): lonlat_mixed_precision, pattern, type

### Community 174 - "modern_id"
Cohesion: 0.67
Nodes (3): modern_id, pattern, type

### Community 175 - "geojson_roles"
Cohesion: 0.67
Nodes (3): additionalProperties, type, geojson_roles

### Community 176 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 177 - "friendly_id"
Cohesion: 0.67
Nodes (3): pattern, type, friendly_id

### Community 178 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

## Knowledge Gaps
- **1315 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1310 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `enum` connect `enum` to `enum`, `enum`, `enum`, `properties`, `id`, `enum`, `geometry`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `color-picker.tsx`, `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `reader-panel-tree.tsx`, `cn`, `sidebar.tsx`, `dependencies`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1315 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054254711593375214 - nodes in this community are weakly interconnected._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060087719298245613 - nodes in this community are weakly interconnected._