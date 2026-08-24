# Graph Report - kjv-only  (2026-08-24)

## Corpus Check
- 355 files · ~16,375,486 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3159 nodes · 6197 edges · 195 communities (168 shown, 27 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb46f045`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- plugins.tsx
- reader-data.ts
- color-picker.tsx
- enum
- kjv-reader.tsx
- sidebar.tsx
- cn
- dependencies
- bookmarks-tool.tsx
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
- use-strongs-search-tool.ts
- id
- required
- compilerOptions
- reader-persistence.ts
- properties
- Data, Offline Cache, and Deployment
- properties
- properties
- properties
- properties
- fetch-map-photos.mjs
- reader-view.tsx
- properties
- required
- properties
- definitions
- Codebase Improvement Plan
- download-page.tsx
- genealogy.ts
- compilerOptions
- static-page.tsx
- lib/bookmarks.ts
- search-page.tsx
- components.json
- scripts
- enum
- report-strongs-derivation-links.mjs
- reader-transfer.test.ts
- required
- build-genealogy-compact.mjs
- dialog.tsx
- enum
- required
- layout-hash.ts
- properties
- Assessment Follow-Up and Final Hardening Record
- definitions
- properties
- import_osis_to_sqlite.py
- devDependencies
- properties
- properties
- enum
- use-reader-corpus.ts
- properties
- use-reader-notes.ts
- notes-page.tsx
- What changed
- build-kjv-runtime-manifest.mjs
- definitions
- properties
- check-dist.mjs
- reader-study-sidebar.tsx
- reader-study-tools-content.tsx
- use-study-workspace-state.ts
- review
- build-map-json.mjs
- source
- properties
- enum
- definitions
- enum
- media_object_thumbnail
- id
- enum
- required
- KJV Only Hardening Remediation Report
- Webster Source Analysis
- genealogy-tree-dialog.tsx
- utils.ts
- source_id
- properties
- required
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- role
- ancient_id
- references.ts
- enum
- properties
- required
- enum
- suggested
- KJV Only Project Assessment
- build-topics-index.mjs
- concordance-reference-popover.tsx
- url_slug
- image_id
- kml_file
- geojson_geometry
- geometry.json
- enum
- Genealogy Note Reference Report
- lonlat
- media_parent
- items
- image.json
- source.json
- sw.js
- Genealogy Note Cleanup Preview
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- vite.config.ts
- lonlat_mixed_precision
- media_object_alternate
- globals
- welcome-home-page.tsx
- enum
- types
- votes
- ^a[0-9a-f]{6}$
- file
- Webster Coverage Report
- Webster Import-Ready Candidates
- Webster Proposed Add List
- placeholder
- best_commentaries_book_id
- olivetree_url
- publisher
- enum
- enum
- enum
- Security assessment
- Webster Coverage Refined Report
- Webster High-Value Candidates Report
- tsconfig.json
- package.json
- alternate_roots
- worldcat_url
- enum
- year
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- Webster Import Preview
- App.tsx
- service-worker-cache.ts
- alternate_urls
- contributors
- vote_count
- Testing, linting, and release engineering
- Performance assessment
- Strong's Derivation Link Audit
- geometry_id
- uri
- descriptions
- meters_per_pixel
- thumbnails
- abbreviation
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
- best_commentaries_url
- google_books_url
- logos_resource_id
- web_archive_url
- worldcat_id

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 68 edges
4. `Book` - 46 edges
5. `enum` - 40 edges
6. `Button()` - 40 edges
7. `useToolbarContext()` - 39 edges
8. `Largest Differences` - 31 edges
9. `react` - 30 edges
10. `normalizeConcordanceWord()` - 28 edges

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

## Communities (195 total, 27 thin omitted)

### Community 0 - "plugins.tsx"
Cohesion: 0.06
Nodes (66): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+58 more)

### Community 1 - "reader-data.ts"
Cohesion: 0.07
Nodes (45): isDedicatedLeafViewTab(), KJVReader(), panelNodeContainsView(), deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), useMapDialogState(), TOPIC_LETTERS, TopicsToolEntry (+37 more)

### Community 2 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 3 - "enum"
Cohesion: 0.02
Nodes (87): altar, article, body of water, campsite, chapter, cliff, field, ford (+79 more)

### Community 4 - "kjv-reader.tsx"
Cohesion: 0.06
Nodes (85): GenealogyPersonDetails(), GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, BeforeInstallPromptEvent, createGenesisReaderTab(), createWelcomeHomeTab() (+77 more)

### Community 5 - "sidebar.tsx"
Cohesion: 0.05
Nodes (44): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebar(), StudyToolsSidebarProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter() (+36 more)

### Community 6 - "cn"
Cohesion: 0.06
Nodes (54): Example(), ExampleWrapper(), OldEnglishTool(), PhrasesTool(), ButtonGroupSeparator(), ButtonGroupText(), ComboboxChip(), ComboboxChips() (+46 more)

### Community 7 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 8 - "bookmarks-tool.tsx"
Cohesion: 0.13
Nodes (25): BookPickerDialogProps, CompletionCelebration(), CompletionCelebrationProps, CONFETTI_COLORS, LazyMapGeoJsonView, MapAndPhotoDialogsProps, ProgressBook, ProgressByTestament (+17 more)

### Community 9 - "note-links.ts"
Cohesion: 0.12
Nodes (25): nodes, $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode, NoteLinkAutoLinkPlugin(), applyInternalLink(), bookCodeForIndex(), bookPattern() (+17 more)

### Community 10 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (41): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+33 more)

### Community 11 - "enum"
Cohesion: 0.04
Nodes (49): enum, type, enum, altar, ancient, body of water, campsite, cliff (+41 more)

### Community 12 - "component-example.tsx"
Cohesion: 0.12
Nodes (28): frameworks, roleItems, ReaderTopBar(), ReaderTopBarProps, collectLeafStates(), getTabIcon(), TabsStrip(), TabsStripProps (+20 more)

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
Cohesion: 0.09
Nodes (35): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+27 more)

### Community 17 - "settings-dialog.tsx"
Cohesion: 0.31
Nodes (7): SettingsDialogProps, SettingsPanelContentProps, Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 18 - "reader-panel-tree.tsx"
Cohesion: 0.10
Nodes (24): BookChapterPicker(), BookChapterPickerProps, ProgressPanelContent(), AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage, LeafLocationPatch (+16 more)

### Community 19 - "enum"
Cohesion: 0.08
Nodes (26): >, ancient, modern, near, nonunique_url, enum, type, modifier (+18 more)

### Community 20 - "use-strongs-search-tool.ts"
Cohesion: 0.19
Nodes (14): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), loadStrongsGreek(), loadStrongsHebrew() (+6 more)

### Community 21 - "id"
Cohesion: 0.09
Nodes (24): geojson_geometry, geojson_point, additionalProperties, properties, required, type, additionalProperties, properties (+16 more)

### Community 22 - "required"
Cohesion: 0.13
Nodes (15): required, class, credit, description, file, image_id, placeholder, required (+7 more)

### Community 23 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 24 - "reader-persistence.ts"
Cohesion: 0.10
Nodes (40): useReadChapters(), useReaderController(), UseReaderControllerOptions, useReaderPreferences(), UseReaderPreferencesOptions, useVerseSearchIndex(), channelToLinear(), contrastRatio() (+32 more)

### Community 25 - "properties"
Cohesion: 0.05
Nodes (41): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, type (+33 more)

### Community 26 - "Data, Offline Cache, and Deployment"
Cohesion: 0.07
Nodes (23): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Local Bible corpus contract (+15 more)

### Community 27 - "properties"
Cohesion: 0.09
Nodes (22): type, type, type, pattern, type, the, pattern, type (+14 more)

### Community 28 - "properties"
Cohesion: 0.08
Nodes (26): patternProperties, type, $ref, type, type, properties, pattern, type (+18 more)

### Community 29 - "properties"
Cohesion: 0.07
Nodes (31): pattern, type, items, additionalProperties, pattern, properties, required, type (+23 more)

### Community 30 - "properties"
Cohesion: 0.06
Nodes (31): $ref, $ref, pattern, type, type, $ref, $ref, land (+23 more)

### Community 31 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 32 - "reader-view.tsx"
Cohesion: 0.13
Nodes (21): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams (+13 more)

### Community 33 - "properties"
Cohesion: 0.08
Nodes (29): items, type, items, type, items, type, items, type (+21 more)

### Community 34 - "required"
Cohesion: 0.13
Nodes (14): additionalProperties, class, friendly_id, geojson_file, geometry, kml_file, preceding_article, required (+6 more)

### Community 35 - "properties"
Cohesion: 0.15
Nodes (17): type, $ref, type, $ref, properties, properties, properties, credit (+9 more)

### Community 36 - "definitions"
Cohesion: 0.12
Nodes (16): definitions, geojson_file, geometry_id, modern_id, uri, url_slug, pattern, type (+8 more)

### Community 37 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 38 - "download-page.tsx"
Cohesion: 0.08
Nodes (39): buildAudioUrls(), bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage() (+31 more)

### Community 39 - "genealogy.ts"
Cohesion: 0.18
Nodes (20): useGenealogySearchTool(), canonicalizeGenealogyPersonNames(), collapseGenealogyNameVariant(), collectGenealogyCorpusData(), decodeGenealogyPayload(), decodeParent(), decodeReferences(), decodeRelation() (+12 more)

### Community 40 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 41 - "static-page.tsx"
Cohesion: 0.06
Nodes (46): DonatePage(), DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), getVisibleHelpSections(), HELP_SECTIONS (+38 more)

### Community 42 - "lib/bookmarks.ts"
Cohesion: 0.21
Nodes (20): useReaderBookmarks(), UseReaderBookmarksArgs, BOOKMARK_TYPE_ORDER, bookmarkBookIndex(), bookmarkCanonicalKey(), bookmarkScopeLabel(), bookmarkScopeSummary(), compareBookmarkCanonical() (+12 more)

### Community 43 - "search-page.tsx"
Cohesion: 0.06
Nodes (71): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), BookGroup, clampGroupIndices() (+63 more)

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
Cohesion: 0.16
Nodes (16): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), createBookmarksExportPayload(), createNotesExportPayload(), downloadJsonFile() (+8 more)

### Community 49 - "required"
Cohesion: 0.10
Nodes (23): required, items, minItems, type, items, type, additionalProperties, required (+15 more)

### Community 50 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 51 - "dialog.tsx"
Cohesion: 0.23
Nodes (7): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 52 - "enum"
Cohesion: 0.18
Nodes (11): nonunique_url, enum, $ref, type, modifier, anchor, main, not (+3 more)

### Community 53 - "required"
Cohesion: 0.20
Nodes (9): additionalProperties, friendly_id, geojson_file, kml_file, preceding_article, types, required, $schema (+1 more)

### Community 54 - "layout-hash.ts"
Cohesion: 0.19
Nodes (17): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+9 more)

### Community 55 - "properties"
Cohesion: 0.10
Nodes (21): type, type, $ref, $ref, type, $ref, type, properties (+13 more)

### Community 56 - "Assessment Follow-Up and Final Hardening Record"
Cohesion: 0.20
Nodes (7): Assessment Follow-Up and Final Hardening Record, Executive result, Graphify architecture map, Release control, Residual and deferred work, Security assessment, Verification record

### Community 57 - "definitions"
Cohesion: 0.09
Nodes (23): definitions, geojson_file, geometry_id, json_file, lonlat, lonlat_mixed_precision, lonlats, uri (+15 more)

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
Cohesion: 0.04
Nodes (48): items, type, additionalProperties, properties, type, enum, $ref, type (+40 more)

### Community 63 - "enum"
Cohesion: 0.10
Nodes (21): vote_tag, enum, type, authority_old, authority_parallel, authority_preserved, authority_scholar, authority_traditional (+13 more)

### Community 64 - "use-reader-corpus.ts"
Cohesion: 0.30
Nodes (10): bootstrap, empty, full, applyBootstrapReaderCorpus(), applyFullReaderCorpus(), applyReaderCorpusError(), INITIAL_STATE, readerCorpusErrorMessage() (+2 more)

### Community 65 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 66 - "use-reader-notes.ts"
Cohesion: 0.39
Nodes (7): contextFromScope(), useReaderNotes(), UseReaderNotesArgs, migrateNoteBodyInternalLinks(), noteMatchesContext(), parseStoredNotesPayload(), parseStoredNotesPayloadDetailed()

### Community 67 - "notes-page.tsx"
Cohesion: 0.14
Nodes (25): Editor(), editorConfig, editorTheme, createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps (+17 more)

### Community 68 - "What changed"
Cohesion: 0.33
Nodes (6): Compatibility preserved, Corpus and release integrity, Offline/cache behavior, Reader ownership and structure, Startup and search performance, What changed

### Community 69 - "build-kjv-runtime-manifest.mjs"
Cohesion: 0.12
Nodes (12): BOOTSTRAP_PATH, bootstrapBooks, bootstrapBuffer, bootstrapHash, bootstrapSummary, DATA_DIRECTORY, FULL_PATH, fullHash (+4 more)

### Community 70 - "definitions"
Cohesion: 0.11
Nodes (18): pattern, type, definitions, ancient_or_modern_id, image_id, lonlat, modern_id, place_type (+10 more)

### Community 71 - "properties"
Cohesion: 0.09
Nodes (22): type, $ref, type, type, pattern, type, type, type (+14 more)

### Community 72 - "check-dist.mjs"
Cohesion: 0.14
Nodes (11): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, isCorpusAsset() (+3 more)

### Community 73 - "reader-study-sidebar.tsx"
Cohesion: 0.33
Nodes (4): ReaderStudySidebarProps, BookmarksTool(), TopicsPanel(), TopicsPanelProps

### Community 74 - "reader-study-tools-content.tsx"
Cohesion: 0.08
Nodes (24): ReaderStudyToolsContent(), ReaderStudyToolsContentProps, AIDictionaryResult, AIDictionaryTool(), AIDictionaryToolProps, extractSeeReference(), renderAIDictionaryDefinition(), BibleWordBookTool() (+16 more)

### Community 75 - "use-study-workspace-state.ts"
Cohesion: 0.20
Nodes (12): normalizeReaderMode(), normalizeTabsOrientation(), useReaderShellState(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS (+4 more)

### Community 76 - "review"
Cohesion: 0.40
Nodes (5): review, enum, type, automatic, uncertain

### Community 77 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 78 - "source"
Cohesion: 0.40
Nodes (5): ancient, modern, source, enum, type

### Community 79 - "properties"
Cohesion: 0.10
Nodes (20): type, $ref, media_object, pattern, type, $ref, satellite, additionalProperties (+12 more)

### Community 80 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 81 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 82 - "enum"
Cohesion: 0.13
Nodes (15): article, chapter, map, website, type, enum, type, book (+7 more)

### Community 83 - "media_object_thumbnail"
Cohesion: 0.67
Nodes (3): media_object_thumbnail, additionalProperties, type

### Community 84 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 85 - "enum"
Cohesion: 0.25
Nodes (8): satellite, role, enum, type, google_aerialview, google_place, google_siteview, google_streetview

### Community 86 - "required"
Cohesion: 0.18
Nodes (13): media_object_google, enum, credit, description, file, image_id, placeholder, required (+5 more)

### Community 87 - "KJV Only Hardening Remediation Report"
Cohesion: 0.20
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 88 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 89 - "genealogy-tree-dialog.tsx"
Cohesion: 0.21
Nodes (11): GenealogyNode(), GenealogyRelationGrid(), GenealogyTreeDialog(), GenealogyTreeDialogProps, ResolvedRelation, resolveParent(), resolvePersonName(), resolveRelation() (+3 more)

### Community 90 - "utils.ts"
Cohesion: 0.09
Nodes (46): ConcordanceReferencePopover, GenealogyPersonDetailsProps, resetStudySearchDraft(), shouldShowStudySearchResetButton(), StudySearchForm(), StudySearchFormProps, BibleWordBookResult, BibleWordBookToolProps (+38 more)

### Community 91 - "source_id"
Cohesion: 0.67
Nodes (3): source_id, pattern, type

### Community 92 - "properties"
Cohesion: 0.11
Nodes (19): items, type, additionalProperties, properties, type, properties, type, combined (+11 more)

### Community 93 - "required"
Cohesion: 0.17
Nodes (12): name, score, url_slug, additionalProperties, required, type, additionalProperties, patternProperties (+4 more)

### Community 94 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 95 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 96 - "role"
Cohesion: 0.50
Nodes (4): satellite, role, enum, type

### Community 97 - "ancient_id"
Cohesion: 0.67
Nodes (3): pattern, type, ancient_id

### Community 98 - "references.ts"
Cohesion: 0.08
Nodes (45): deriveStudySidebarState, STUDY_ACCORDION_ITEMS, useStudySidebarState(), UseStudySidebarStateArgs, OpenWordInStudyToolsArgs, Setter, useWordStudyCoordinator(), WordStudyCoordinatorParams (+37 more)

### Community 99 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 100 - "properties"
Cohesion: 0.20
Nodes (10): time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average, vote_count (+2 more)

### Community 101 - "required"
Cohesion: 0.15
Nodes (13): score, additionalProperties, required, type, time_best_fits, time_intercept, time_r_squared, time_slope (+5 more)

### Community 102 - "enum"
Cohesion: 0.17
Nodes (12): enum, type, path, point, polygon, probability, geometry, isobands (+4 more)

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
Cohesion: 0.31
Nodes (7): ConcordanceReferencePopoverProps, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger()

### Community 107 - "url_slug"
Cohesion: 0.67
Nodes (3): url_slug, pattern, type

### Community 108 - "image_id"
Cohesion: 0.67
Nodes (3): image_id, pattern, type

### Community 109 - "kml_file"
Cohesion: 0.67
Nodes (3): kml_file, pattern, type

### Community 110 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 111 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, geometry, id, required, $schema, type, format, land_or_water

### Community 112 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 113 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 114 - "lonlat"
Cohesion: 0.67
Nodes (3): lonlat, pattern, type

### Community 115 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 116 - "items"
Cohesion: 0.14
Nodes (14): additionalProperties, properties, required, type, osm_version, url, minimum, type (+6 more)

### Community 117 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 118 - "source.json"
Cohesion: 0.15
Nodes (12): additionalProperties, definitions, uri, friendly_id, id, type, required, $schema (+4 more)

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

### Community 124 - "lonlat_mixed_precision"
Cohesion: 0.67
Nodes (3): lonlat_mixed_precision, pattern, type

### Community 125 - "media_object_alternate"
Cohesion: 0.67
Nodes (3): media_object_alternate, additionalProperties, type

### Community 127 - "welcome-home-page.tsx"
Cohesion: 0.29
Nodes (8): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, Switch(), DailyScriptureTopicsPayload, loadDailyScriptureTopics()

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

### Community 132 - "file"
Cohesion: 0.67
Nodes (3): pattern, type, file

### Community 133 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 134 - "Webster Import-Ready Candidates"
Cohesion: 0.25
Nodes (7): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary, Webster Import-Ready Candidates

### Community 135 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 136 - "placeholder"
Cohesion: 0.67
Nodes (3): pattern, type, placeholder

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

### Community 144 - "Webster Coverage Refined Report"
Cohesion: 0.29
Nodes (6): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere, Webster Coverage Refined Report

### Community 145 - "Webster High-Value Candidates Report"
Cohesion: 0.29
Nodes (6): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary, Webster High-Value Candidates Report

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

### Community 171 - "uri"
Cohesion: 0.67
Nodes (3): uri, pattern, type

### Community 173 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 174 - "meters_per_pixel"
Cohesion: 0.67
Nodes (3): enum, type, meters_per_pixel

### Community 175 - "thumbnails"
Cohesion: 0.67
Nodes (3): thumbnails, patternProperties, type

### Community 179 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 181 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

## Knowledge Gaps
- **1375 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1370 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `sidebar.tsx`, `cn`, `dependencies`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `color-picker.tsx`, `package.json`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `plugins.tsx`, `color-picker.tsx`, `notes-page.tsx`, `sidebar.tsx`, `bookmarks-tool.tsx`, `static-page.tsx`, `concordance-reference-popover.tsx`, `search-page.tsx`, `reader-study-tools-content.tsx`, `component-example.tsx`, `reference-command.ts`, `settings-dialog.tsx`, `reader-panel-tree.tsx`, `dialog.tsx`, `genealogy-tree-dialog.tsx`, `utils.ts`, `welcome-home-page.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1375 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.055523199378761406 - nodes in this community are weakly interconnected._
- **Should `reader-data.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07138047138047138 - nodes in this community are weakly interconnected._