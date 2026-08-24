# Graph Report - kjv-only  (2026-08-24)

## Corpus Check
- 342 files · ~16,370,406 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3087 nodes · 6024 edges · 191 communities (163 shown, 28 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `191555f72`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- kjv-reader.tsx
- plugins.tsx
- search.ts
- genealogy-tree-dialog.tsx
- color-picker.tsx
- KJVReader
- sidebar.tsx
- component-example.tsx
- reference-command.ts
- reader-layout.ts
- KjvInternalLinkNode
- notes-page.tsx
- ^s[0-9a-f]{6}$
- enum
- reader-transfer.ts
- properties
- cn
- maps.ts
- utils.ts
- card.tsx
- download-page.tsx
- dependencies
- Modern locations (modern.jsonl)
- note-links.ts
- properties
- reader-persistence.ts
- enum
- use-study-workspace-state.ts
- reader.ts
- properties
- reader-view.tsx
- layout-hash.ts
- Largest Differences
- KJV Only Project Assessment
- genealogy.ts
- properties
- properties
- definitions
- properties
- compilerOptions
- Data, Offline Cache, and Deployment
- chapter-text-content.tsx
- properties
- App.tsx
- Codebase Improvement Plan
- fetch-map-photos.mjs
- service-worker-cache.ts
- leaflet-shim.d.ts
- properties
- description
- compilerOptions
- components.json
- definitions
- enum
- required
- report-strongs-derivation-links.mjs
- scripts
- properties
- properties
- build-genealogy-compact.mjs
- definitions
- id
- enum
- required
- properties
- properties
- import_osis_to_sqlite.py
- properties
- properties
- properties
- enum
- devDependencies
- properties
- properties
- required
- enum
- items
- build-map-json.mjs
- enum
- properties
- definitions
- source.json
- enum
- Webster Source Analysis
- enum
- build-concordance-variants.mjs
- build-topic-scriptures.mjs
- check-dist.mjs
- required
- enum
- required
- suggested
- build-topics-index.mjs
- ^a[0-9a-f]{6}$
- geometry.json
- enum
- Genealogy Note Reference Report
- media_parent
- image.json
- sw.js
- Genealogy Note Cleanup Preview
- Webster Import-Ready Candidates
- build-strongs-compact.mjs
- normalize-strongs-derivation-links.mjs
- enum
- types
- votes
- reader-panel-tree.tsx
- modifier
- Webster Coverage Refined Report
- Webster Coverage Report
- Webster High-Value Candidates Report
- Webster Proposed Add List
- enum
- reader-study-tools-content.tsx
- enum
- enum
- enum
- tsconfig.json
- Skills
- package.json
- alternate_roots
- topics-tool.tsx
- source
- enum
- Webster Import Preview
- vite.config.ts
- progress-dialog.tsx
- role
- alternate_urls
- contributors
- vote_count
- Strong's Derivation Link Audit
- required
- geometry_id
- welcome-home-page.tsx
- descriptions
- meters_per_pixel
- use-leaf-history.ts
- abbreviation
- id
- AI Dictionary Current High-Value Gaps
- cache-config.d.ts
- @eslint/js
- eslint-plugin-react-hooks
- globals
- shadcn
- tailwindcss
- @tailwindcss/vite
- @types/node
- typescript-eslint
- vite
- @vitejs/plugin-react
- vitest
- @vitest/coverage-v8
- playwright.config.ts
- best_commentaries_book_id
- best_commentaries_url
- google_books_url
- logos_resource_id
- olivetree_url
- publisher
- web_archive_url
- worldcat_id
- worldcat_url
- year
- required
- KJV Only Hardening Remediation Report
- geojson_geometry
- help-page.tsx
- search-page.tsx
- how-to-get-saved-page.tsx
- static-page.tsx
- button.tsx
- concordance-reference-popover.tsx
- why-kjv-only-page.tsx
- ancient_id
- Security assessment
- Recommendation disposition
- Structural assessment
- Prioritized hardening roadmap
- alternate_verses
- ancient_or_modern_id
- Testing, linting, and release engineering
- Performance assessment
- thumbnails

## God Nodes (most connected - your core abstractions)
1. `cn()` - 230 edges
2. `enum` - 92 edges
3. `KJVReader()` - 68 edges
4. `enum` - 40 edges
5. `Button()` - 40 edges
6. `useToolbarContext()` - 39 edges
7. `Book` - 39 edges
8. `Largest Differences` - 31 edges
9. `react` - 30 edges
10. `normalizeConcordanceWord()` - 29 edges

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

## Communities (191 total, 28 thin omitted)

### Community 0 - "kjv-reader.tsx"
Cohesion: 0.10
Nodes (26): GuidedTour(), GuidedTourProps, GuidedTourStep, TourRect, BeforeInstallPromptEvent, LazyGenealogyTreeDialog, LazyMapAndPhotoDialogs, LazyReaderStudySidebar (+18 more)

### Community 1 - "plugins.tsx"
Cohesion: 0.06
Nodes (61): noteLinkTargetFromContext(), noteLinkTargetFromHighlightScope(), Plugins(), Context, ToolbarContext(), useToolbarContext(), useEditorModal(), useUpdateToolbarHandler() (+53 more)

### Community 2 - "search.ts"
Cohesion: 0.09
Nodes (47): clampGroupIndices(), isChecked(), normalizeSearchMode(), sameSet(), SearchPage(), RegexSearchOptions, runRegexSearch(), bestOrderedSpanScore() (+39 more)

### Community 3 - "genealogy-tree-dialog.tsx"
Cohesion: 0.15
Nodes (23): BookPickerDialogProps, CompletionCelebration(), CompletionCelebrationProps, CONFETTI_COLORS, GenealogyTreeDialog(), GenealogyTreeDialogProps, ResolvedRelation, resolveParent() (+15 more)

### Community 4 - "color-picker.tsx"
Cohesion: 0.06
Nodes (70): react, react, FormExample(), ColorFormat, colorFormats, ColorPickerAlphaSlider(), ColorPickerAlphaSliderProps, ColorPickerArea() (+62 more)

### Community 5 - "KJVReader"
Cohesion: 0.07
Nodes (52): isDedicatedLeafViewTab(), KJVReader(), panelNodeContainsView(), deriveConcordanceSearchResults(), useConcordanceCrossRefsTool(), TOPIC_LETTERS, TopicsToolEntry, useTopicsTool() (+44 more)

### Community 6 - "sidebar.tsx"
Cohesion: 0.05
Nodes (43): SidebarCloseRequestSync(), SidebarOpenRequestSync(), StudyToolsSidebarProps, Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+35 more)

### Community 7 - "component-example.tsx"
Cohesion: 0.12
Nodes (27): frameworks, roleItems, applyInternalLink(), NoteLinkToolbarPlugin(), ReaderTopBar(), ReaderTopBarProps, collectLeafStates(), getTabIcon() (+19 more)

### Community 8 - "reference-command.ts"
Cohesion: 0.07
Nodes (41): actionIcon(), ReferenceCommandDialog(), ReferenceCommandDialogProps, Command(), CommandDialog(), CommandEmpty(), CommandGroup(), CommandInput() (+33 more)

### Community 9 - "reader-layout.ts"
Cohesion: 0.10
Nodes (41): createGenesisReaderTab(), createWelcomeHomeTab(), buildTargetedReaderPanelInTabState(), ReaderOpenDestination, ReaderWordHighlight, resolveTargetedReaderPanelAction(), usePanelRouting(), UsePanelRoutingParams (+33 more)

### Community 10 - "KjvInternalLinkNode"
Cohesion: 0.24
Nodes (4): nodes, $createKjvInternalLinkNode(), isKjvInternalUrl(), KjvInternalLinkNode

### Community 11 - "notes-page.tsx"
Cohesion: 0.13
Nodes (26): Editor(), editorConfig, editorTheme, createPlainTextSerializedState(), formatNoteDateTime(), isNewNote(), NotesPage(), NotesPageProps (+18 more)

### Community 12 - "^s[0-9a-f]{6}$"
Cohesion: 0.14
Nodes (14): additionalProperties, patternProperties, propertyNames, type, additionalProperties, patternProperties, type, ^s[0-9a-f]{6}$ (+6 more)

### Community 13 - "enum"
Cohesion: 0.02
Nodes (87): altar, article, body of water, campsite, chapter, cliff, field, ford (+79 more)

### Community 14 - "reader-transfer.ts"
Cohesion: 0.08
Nodes (54): ImportSummaryState, usePanelTransfer(), UsePanelTransferParams, assertReaderEntryMergeLimit(), assertReaderImportFileSize(), BookmarksExportPayload, createBookmarksExportPayload(), createNotesExportPayload() (+46 more)

### Community 15 - "properties"
Cohesion: 0.06
Nodes (35): type, $ref, media_object_alternate, media_object_google, pattern, type, $ref, satellite (+27 more)

### Community 16 - "cn"
Cohesion: 0.05
Nodes (59): Example(), ExampleWrapper(), GenealogyNode(), GenealogyRelationGrid(), PhrasesTool(), AlertDialogOverlay(), ButtonGroup(), ButtonGroupSeparator() (+51 more)

### Community 17 - "maps.ts"
Cohesion: 0.18
Nodes (16): MapAndPhotoDialogs(), MapBoundsSync, useMapsSearchTool(), AncientMapEntry, AncientMapPayload, boundsForGeoJson(), cleanMapMarkup(), extractCoordinateBounds() (+8 more)

### Community 18 - "utils.ts"
Cohesion: 0.08
Nodes (50): ConcordanceReferencePopover, GenealogyPersonDetails(), GenealogyPersonDetailsProps, resetStudySearchDraft(), shouldShowStudySearchResetButton(), StudySearchForm(), StudySearchFormProps, AIDictionaryResult (+42 more)

### Community 19 - "card.tsx"
Cohesion: 0.14
Nodes (17): DonatePageProps, DonateReference, GIVING_REFERENCES, ReferenceList(), renderReferenceText(), ReaderStatusScreen(), ReaderStatusScreenProps, RESOURCE_SECTIONS (+9 more)

### Community 20 - "download-page.tsx"
Cohesion: 0.15
Nodes (23): buildAudioUrls(), bundleCachedPercent(), BundleDefinition, bundleDownloadPercent(), BundleId, BundleStatus, bundleStatusLabel(), DownloadPage() (+15 more)

### Community 21 - "dependencies"
Cohesion: 0.04
Nodes (49): @base-ui/react, bible-passage-reference-parser, class-variance-authority, clsx, cmdk, @fontsource-variable/inter, leaflet, lexical (+41 more)

### Community 22 - "Modern locations (modern.jsonl)"
Cohesion: 0.05
Nodes (41): About these files, Accuracy claims (`accuracy_claims`) and precision claims (`precision_claims`), Ancient associations (`ancient_associations`), Ancient places (ancient.jsonl), Coordinates, Coordinates sources (`coordinates_source`), Definitions, GeoJSON (+33 more)

### Community 23 - "note-links.ts"
Cohesion: 0.07
Nodes (65): NoteLinkAutoLinkPlugin(), useReadChapters(), useReaderBookmarks(), UseReaderBookmarksArgs, useReaderController(), UseReaderControllerOptions, contextFromScope(), useReaderNotes() (+57 more)

### Community 24 - "properties"
Cohesion: 0.08
Nodes (25): type, items, type, type, items, type, map, maps (+17 more)

### Community 25 - "reader-persistence.ts"
Cohesion: 0.12
Nodes (25): usePanelTargeting(), UsePanelTargetingParams, channelToLinear(), contrastRatio(), defaultHighlightColor(), hexToRgb(), normalizeHighlightColor(), readableHighlightTextColor() (+17 more)

### Community 26 - "enum"
Cohesion: 0.05
Nodes (39): altar, body of water, campsite, cliff, field, ford, forest, garden (+31 more)

### Community 27 - "use-study-workspace-state.ts"
Cohesion: 0.20
Nodes (12): normalizeReaderMode(), normalizeTabsOrientation(), useReaderShellState(), UseReaderShellStateArgs, normalizeStudyWorkspaceTab(), normalizeStudyWorkspaceTool(), STUDY_WORKSPACE_TABS, STUDY_WORKSPACE_TOOLS (+4 more)

### Community 28 - "reader.ts"
Cohesion: 0.10
Nodes (25): deriveDictionarySearchResults(), useDictionarySearchTool(), UseDictionarySearchToolArgs, deriveStrongsSearchResults(), StrongsSearchResult, useStrongsSearchTool(), parseBooks(), loadStrongsGreek() (+17 more)

### Community 29 - "properties"
Cohesion: 0.05
Nodes (37): type, $ref, enum, type, properties, type, $ref, type (+29 more)

### Community 30 - "reader-view.tsx"
Cohesion: 0.16
Nodes (16): useReaderDerivedState(), UseReaderDerivedStateArgs, collectLeafIds(), buildLeafNeighborMap(), buildLeafNeighborMapFromDom(), collectLeafRects(), LeafNeighbors, LeafRect (+8 more)

### Community 31 - "layout-hash.ts"
Cohesion: 0.18
Nodes (18): useLayoutHashSync(), UseLayoutHashSyncParams, BOOK_INDEX_BY_CODE, createReaderLeaf(), LAYOUT_HASH_LIMITS, normalizeVerseRanges(), ParseBudget, ParsedLayoutHash (+10 more)

### Community 32 - "Largest Differences"
Cohesion: 0.05
Nodes (36): 1PE.3.1, 1TH.4.15, 2CO.5.14, 2PE.1.6, 2SA.21.1, ACT.13.48, ACT.8.39, Conclusion (+28 more)

### Community 33 - "KJV Only Project Assessment"
Cohesion: 0.20
Nodes (10): Architecture map, Design-system and UX implementation assessment, Documentation and operational ownership, Executive assessment, Final judgment, Graphify results, KJV Only Project Assessment, Overall posture (+2 more)

### Community 34 - "genealogy.ts"
Cohesion: 0.14
Nodes (31): useGenealogySearchTool(), contextFromNoteLinkTarget(), OpenReaderTarget, ReaderWordHighlight, useWordStudyNavigation(), UseWordStudyNavigationParams, WordTokenMatch, buildGenealogyTokenVariantIndex() (+23 more)

### Community 35 - "properties"
Cohesion: 0.07
Nodes (31): pattern, type, items, additionalProperties, pattern, properties, required, type (+23 more)

### Community 36 - "properties"
Cohesion: 0.06
Nodes (31): $ref, $ref, pattern, type, type, $ref, $ref, land (+23 more)

### Community 37 - "definitions"
Cohesion: 0.06
Nodes (31): definitions, geojson_file, geometry_id, image_id, kml_file, lonlat, lonlat_mixed_precision, modern_id (+23 more)

### Community 38 - "properties"
Cohesion: 0.07
Nodes (29): additionalProperties, properties, type, enum, $ref, type, $ref, path (+21 more)

### Community 39 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM.Iterable, ES2022, src, vite/client, compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly (+20 more)

### Community 40 - "Data, Offline Cache, and Deployment"
Cohesion: 0.08
Nodes (21): Architecture and State Ownership, Compatibility contract, Ownership rules, Asset classes, Data, Offline Cache, and Deployment, Deployment controls, Generation, Offline lifecycle (+13 more)

### Community 41 - "chapter-text-content.tsx"
Cohesion: 0.16
Nodes (15): ChapterTextContent, ChapterTextContentProps, formatDisplayTokenText(), isPunctuationToken(), renderToken(), renderVerseTokens(), TokenPopupCard(), TokenPopupCardProps (+7 more)

### Community 42 - "properties"
Cohesion: 0.09
Nodes (25): $ref, type, items, additionalProperties, properties, pattern, type, geometry_id (+17 more)

### Community 44 - "Codebase Improvement Plan"
Cohesion: 0.08
Nodes (24): 10. Welcome page could do more as a product entry point, 11. Download page can be clearer visually, 1. `KJVReader` is still too large and too state-dense, 2. Panel lifecycle reliability still needs stronger invariants, 3. There are still too many reader-side effects coupled together, 4. UI wrapper contracts are not always explicit enough, 5. Test coverage is decent at the library level but still thin at the workflow level, 6. Offline/download UX is useful but still not fully self-explanatory (+16 more)

### Community 45 - "fetch-map-photos.mjs"
Cohesion: 0.18
Nodes (22): deriveExtension(), ensureThumbnailEntries(), fileExists(), main(), parseArgs(), parseJsonl(), printUsage(), resolveDownloadUrl() (+14 more)

### Community 46 - "service-worker-cache.ts"
Cohesion: 0.70
Nodes (3): findObsoleteAppCaches(), isRangedRequest(), shouldCacheServiceWorkerResponse()

### Community 48 - "properties"
Cohesion: 0.08
Nodes (24): type, type, type, pattern, type, type, the, pattern (+16 more)

### Community 49 - "description"
Cohesion: 0.09
Nodes (26): geojson_geometry, geojson_point, type, additionalProperties, properties, required, type, additionalProperties (+18 more)

### Community 50 - "compilerOptions"
Cohesion: 0.08
Nodes (23): *.config.ts, e2e/**/*.ts, ES2023, node, compilerOptions, allowImportingTsExtensions, lib, module (+15 more)

### Community 51 - "components.json"
Cohesion: 0.09
Nodes (22): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+14 more)

### Community 52 - "definitions"
Cohesion: 0.09
Nodes (23): definitions, geojson_file, geometry_id, json_file, lonlat, lonlat_mixed_precision, lonlats, uri (+15 more)

### Community 53 - "enum"
Cohesion: 0.09
Nodes (23): enum, attribution, CC-BY-2.0, CC-BY-2.5, CC-BY-3.0, CC-BY-4.0, CC-BY-SA-1.0, CC-BY-SA-2.0 (+15 more)

### Community 54 - "required"
Cohesion: 0.10
Nodes (23): required, items, minItems, type, items, type, additionalProperties, required (+15 more)

### Community 55 - "report-strongs-derivation-links.mjs"
Cohesion: 0.09
Nodes (21): allKeys, crossPrefix, findings, greek, greekFindings, greekKeys, greekPath, hebrew (+13 more)

### Community 56 - "scripts"
Cohesion: 0.09
Nodes (22): scripts, audit, build, build:all, build:concordance, build:data, build:genealogy, build:map-photos (+14 more)

### Community 57 - "properties"
Cohesion: 0.09
Nodes (24): items, type, items, type, items, type, items, type (+16 more)

### Community 58 - "properties"
Cohesion: 0.09
Nodes (22): type, $ref, type, type, pattern, type, type, type (+14 more)

### Community 59 - "build-genealogy-compact.mjs"
Cohesion: 0.10
Nodes (14): BOOK_ORDER, BOOK_ORDER_INDEX, compact, compareReferences(), input, inputPath, nameIndexes, names (+6 more)

### Community 60 - "definitions"
Cohesion: 0.09
Nodes (23): definitions, image_id, lonlat, modern_id, place_modifier, place_type, source_id, uri (+15 more)

### Community 61 - "id"
Cohesion: 0.20
Nodes (12): type, properties, properties, enum, type, pattern, $ref, type (+4 more)

### Community 62 - "enum"
Cohesion: 0.08
Nodes (26): vote_tag, review, enum, type, enum, type, authority_old, authority_parallel (+18 more)

### Community 63 - "required"
Cohesion: 0.17
Nodes (12): name, score, url_slug, additionalProperties, required, type, additionalProperties, patternProperties (+4 more)

### Community 64 - "properties"
Cohesion: 0.10
Nodes (21): type, type, $ref, $ref, type, $ref, type, properties (+13 more)

### Community 65 - "properties"
Cohesion: 0.10
Nodes (20): geo_source, additionalProperties, required, type, type, type, additionalProperties, properties (+12 more)

### Community 66 - "import_osis_to_sqlite.py"
Cohesion: 0.23
Nodes (17): Any, Element, Path, collect_chapter_tokens(), flatten_text(), is_red_quote(), local_tag(), main() (+9 more)

### Community 67 - "properties"
Cohesion: 0.11
Nodes (19): items, type, additionalProperties, properties, type, properties, type, combined (+11 more)

### Community 68 - "properties"
Cohesion: 0.11
Nodes (19): properties, type, properties, type, minimum, type, comment, name (+11 more)

### Community 69 - "properties"
Cohesion: 0.12
Nodes (19): items, type, items, type, $ref, additionalProperties, properties, type (+11 more)

### Community 70 - "enum"
Cohesion: 0.11
Nodes (19): >, ancient, near, nonunique_url, enum, actual, another part of same historical site, artifact (+11 more)

### Community 71 - "devDependencies"
Cohesion: 0.12
Nodes (17): @axe-core/playwright, eslint, eslint-plugin-react-refresh, devDependencies, @axe-core/playwright, eslint, eslint-plugin-react-refresh, @playwright/test (+9 more)

### Community 72 - "properties"
Cohesion: 0.08
Nodes (26): type, $ref, media_object, pattern, type, $ref, credit, description (+18 more)

### Community 73 - "properties"
Cohesion: 0.12
Nodes (17): $ref, $ref, $ref, $ref, type, $ref, properties, geojson_file (+9 more)

### Community 74 - "required"
Cohesion: 0.13
Nodes (14): additionalProperties, class, friendly_id, geojson_file, geometry, kml_file, preceding_article, required (+6 more)

### Community 75 - "enum"
Cohesion: 0.13
Nodes (15): article, chapter, map, website, type, enum, type, book (+7 more)

### Community 76 - "items"
Cohesion: 0.14
Nodes (14): additionalProperties, properties, required, type, osm_version, url, minimum, type (+6 more)

### Community 77 - "build-map-json.mjs"
Cohesion: 0.30
Nodes (13): buildModernNames(), buildTranslations(), cleanMarkup(), dedupeStrings(), main(), modernIdsForAncient(), modernNamesForId(), normalizeBookCode() (+5 more)

### Community 78 - "enum"
Cohesion: 0.15
Nodes (13): translation_id, enum, type, csb, esv, kjv, leb, nasb (+5 more)

### Community 79 - "properties"
Cohesion: 0.20
Nodes (10): time_best_fits, time_intercept, time_r_squared, time_slope, time_total, time_values, vote_average, vote_count (+2 more)

### Community 80 - "definitions"
Cohesion: 0.15
Nodes (13): pattern, type, definitions, ancient_or_modern_id, file, image_id, uri, pattern (+5 more)

### Community 81 - "source.json"
Cohesion: 0.15
Nodes (12): additionalProperties, definitions, uri, friendly_id, id, type, required, $schema (+4 more)

### Community 82 - "enum"
Cohesion: 0.17
Nodes (12): enum, type, path, point, polygon, probability, geometry, isobands (+4 more)

### Community 83 - "Webster Source Analysis"
Cohesion: 0.17
Nodes (11): Evidence, Implication, Important caveat, Practical conclusion, Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?, Question 2: Can we use `lest` from the user-provided Webster page?, Question 3: What is the SWORD Webster module?, Question 4: What do we know about the SWORD Webster data structure? (+3 more)

### Community 84 - "enum"
Cohesion: 0.18
Nodes (11): nonunique_url, enum, $ref, type, modifier, anchor, main, not (+3 more)

### Community 85 - "build-concordance-variants.mjs"
Cohesion: 0.35
Nodes (10): buildCompactDeltaPayload(), buildCompactPayload(), buildNestedPayload(), computeNestedStats(), deltaEncode(), ensureDir(), main(), parseArgs() (+2 more)

### Community 86 - "build-topic-scriptures.mjs"
Cohesion: 0.27
Nodes (9): BOOK_CODE_MAP, buildCuratedTopics(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), TOPIC_ALLOWLIST (+1 more)

### Community 87 - "check-dist.mjs"
Cohesion: 0.17
Nodes (9): BUDGETS, DIST_DIR, entryCss, entryJavaScript, failures, FORBIDDEN_FILE_PATTERNS, FORBIDDEN_PATHS, REQUIRED_PATHS (+1 more)

### Community 88 - "required"
Cohesion: 0.20
Nodes (9): additionalProperties, friendly_id, geojson_file, kml_file, preceding_article, types, required, $schema (+1 more)

### Community 89 - "enum"
Cohesion: 0.22
Nodes (10): special, special, enum, type, multiple_locations, nonspecific_place, not_a_place, not_a_proper_name (+2 more)

### Community 90 - "required"
Cohesion: 0.15
Nodes (13): score, additionalProperties, required, type, time_best_fits, time_intercept, time_r_squared, time_slope (+5 more)

### Community 91 - "suggested"
Cohesion: 0.20
Nodes (10): $ref, $ref, label_line, label_line_horizontal, rough_boundary, suggested, $ref, additionalProperties (+2 more)

### Community 92 - "build-topics-index.mjs"
Cohesion: 0.29
Nodes (8): BOOK_CODE_MAP, compareTopic(), convertOsisToStandardReference(), INPUT_PATH, main(), OUTPUT_PATH, parseOsisEndpoint(), toTitleCase()

### Community 93 - "^a[0-9a-f]{6}$"
Cohesion: 0.29
Nodes (7): additionalProperties, type, additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, ancient_associations

### Community 94 - "geometry.json"
Cohesion: 0.22
Nodes (8): additionalProperties, geometry, id, required, $schema, type, format, land_or_water

### Community 95 - "enum"
Cohesion: 0.22
Nodes (9): enum, type, enum, type, osm, format, geometry_credit, kml (+1 more)

### Community 96 - "Genealogy Note Reference Report"
Cohesion: 0.22
Nodes (8): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Findings, Genealogy Note Reference Report, Sample Findings, Seth / Sheth (seth_17), Summary, Top Repeated Missing Refs

### Community 97 - "media_parent"
Cohesion: 0.25
Nodes (8): media_parent, additionalProperties, properties, required, type, thumbnail, $ref, thumbnail

### Community 98 - "image.json"
Cohesion: 0.25
Nodes (7): additionalProperties, id, required, $schema, type, descriptions, license

### Community 99 - "sw.js"
Cohesion: 0.36
Nodes (6): APP_SHELL, cacheFirst(), LIVE_DATA_PREFIXES, networkFirst(), shouldCacheResponse(), shouldUseNetworkFirst()

### Community 100 - "Genealogy Note Cleanup Preview"
Cohesion: 0.25
Nodes (7): Abiasaph / Ebiasaph / Asaph (abiasaph_386), Ahaz / Achaz (ahaz_942), Full Preview, Genealogy Note Cleanup Preview, Sample Previews, Seth / Sheth (seth_17), Summary

### Community 101 - "Webster Import-Ready Candidates"
Cohesion: 0.25
Nodes (7): Categories, Derived candidates, Direct candidates, Pending candidates, Recommendation, Summary, Webster Import-Ready Candidates

### Community 103 - "normalize-strongs-derivation-links.mjs"
Cohesion: 0.29
Nodes (6): allKeys, files, normalizeStrongsRef(), replaceDerivationRefs(), repoRoot, summary

### Community 104 - "enum"
Cohesion: 0.40
Nodes (5): <, near, enum, along, on

### Community 105 - "types"
Cohesion: 0.29
Nodes (7): $ref, translations, types, items, type, items, type

### Community 106 - "votes"
Cohesion: 0.29
Nodes (7): tags, votes, additionalProperties, properties, required, type, tags

### Community 107 - "reader-panel-tree.tsx"
Cohesion: 0.10
Nodes (21): AUDIO_PLAYBACK_RATE_OPTIONS, ExistingTabTarget, LazyNotesPage, LazySearchPage, LeafLocationPatch, ReaderLeafPanel, ReaderLeafPanelProps, ReaderPanelTree (+13 more)

### Community 108 - "modifier"
Cohesion: 0.29
Nodes (7): modern, type, modifier, source, properties, enum, type

### Community 109 - "Webster Coverage Refined Report"
Cohesion: 0.29
Nodes (6): Likely Proper Names Still Uncovered, Notes On Heuristics, Summary, Top Candidate Adds, Top Missing But Covered Elsewhere, Webster Coverage Refined Report

### Community 110 - "Webster Coverage Report"
Cohesion: 0.29
Nodes (6): Notes, Recommended Add Candidates, Summary, Top Missing Covered Elsewhere, Top Missing Uncovered, Webster Coverage Report

### Community 111 - "Webster High-Value Candidates Report"
Cohesion: 0.29
Nodes (6): Archaic / KJV-Style Candidates, Biblical / Theological Candidates, Notes, Strongest Candidates, Summary, Webster High-Value Candidates Report

### Community 112 - "Webster Proposed Add List"
Cohesion: 0.29
Nodes (6): Add Now, Notes, Review Later, Skip / Already Covered Elsewhere, Summary, Webster Proposed Add List

### Community 113 - "enum"
Cohesion: 0.17
Nodes (12): enum, type, enum, type, ancient, human, modern, natural (+4 more)

### Community 114 - "reader-study-tools-content.tsx"
Cohesion: 0.11
Nodes (18): ReaderStudyToolsContent(), ReaderStudyToolsContentProps, BibleWordBookTool(), ConcordanceTool(), CrossRefsTool(), selectedLabel(), GenealogyTool(), HitchcocksResult (+10 more)

### Community 115 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, modifier, center n-s, center radial, west linear increasing

### Community 116 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, color, black_and_white, color, colorized

### Community 117 - "enum"
Cohesion: 0.33
Nodes (6): enum, type, human, natural, probability, class

### Community 118 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, baseUrl, paths, files, references

### Community 119 - "Skills"
Cohesion: 0.40
Nodes (4): Available skills, Command Approval, How to use skills, Skills

### Community 120 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 121 - "alternate_roots"
Cohesion: 0.40
Nodes (5): additionalProperties, patternProperties, type, ^a[0-9a-f]{6}$, alternate_roots

### Community 122 - "topics-tool.tsx"
Cohesion: 0.18
Nodes (9): ReaderStudySidebarProps, BookmarksTool(), StudyToolsSidebar(), TopicEntry, TopicsContentProps, TopicsPanel(), TopicsPanelProps, TopicsTool() (+1 more)

### Community 123 - "source"
Cohesion: 0.40
Nodes (5): ancient, modern, source, enum, type

### Community 124 - "enum"
Cohesion: 0.40
Nodes (5): land, water, enum, type, land_or_water

### Community 125 - "Webster Import Preview"
Cohesion: 0.40
Nodes (4): Notes, Preview Entries, Summary, Webster Import Preview

### Community 126 - "vite.config.ts"
Cohesion: 0.40
Nodes (3): EXACT_RUNTIME_ASSETS, isAllowedRuntimeFile(), RUNTIME_PUBLIC_ENTRIES

### Community 127 - "progress-dialog.tsx"
Cohesion: 0.22
Nodes (9): ProgressBook, ProgressByTestament, ProgressChapter, ProgressDialogProps, ProgressPanelContent(), ProgressPanelContentProps, ProgressTestament, bookCodeForIndex() (+1 more)

### Community 128 - "role"
Cohesion: 0.50
Nodes (4): satellite, role, enum, type

### Community 129 - "alternate_urls"
Cohesion: 0.50
Nodes (4): items, type, $ref, alternate_urls

### Community 130 - "contributors"
Cohesion: 0.50
Nodes (4): items, type, type, contributors

### Community 131 - "vote_count"
Cohesion: 0.50
Nodes (4): vote_count, maximum, minimum, type

### Community 132 - "Strong's Derivation Link Audit"
Cohesion: 0.50
Nodes (3): Findings, Strong's Derivation Link Audit, Summary

### Community 133 - "required"
Cohesion: 0.22
Nodes (9): required, class, best_path_score, id_source, instance_types, osis, readable, sort (+1 more)

### Community 134 - "geometry_id"
Cohesion: 0.67
Nodes (3): geometry_id, pattern, type

### Community 135 - "welcome-home-page.tsx"
Cohesion: 0.36
Nodes (7): DailyScriptureEntry, dayOfYear(), renderVerseText(), WelcomeHomePage(), WelcomeHomePageProps, DailyScriptureTopicsPayload, loadDailyScriptureTopics()

### Community 136 - "descriptions"
Cohesion: 0.67
Nodes (3): patternProperties, type, descriptions

### Community 137 - "meters_per_pixel"
Cohesion: 0.67
Nodes (3): enum, type, meters_per_pixel

### Community 138 - "use-leaf-history.ts"
Cohesion: 0.16
Nodes (18): buildLeafHistoryEntry(), canNavigateLeafHistory(), LeafHistoryEntry, leafHistoryEntryEquals(), LeafHistoryState, reconcileLeafHistoryState(), useLeafHistory(), UseLeafHistoryParams (+10 more)

### Community 139 - "abbreviation"
Cohesion: 0.67
Nodes (3): pattern, type, abbreviation

### Community 140 - "id"
Cohesion: 0.67
Nodes (3): pattern, type, id

### Community 171 - "required"
Cohesion: 0.18
Nodes (13): media_object_thumbnail, enum, credit, description, file, image_id, placeholder, required (+5 more)

### Community 172 - "KJV Only Hardening Remediation Report"
Cohesion: 0.17
Nodes (10): Before-and-after measurements, Compatibility contract, Executive result, Final security closure, Graphify architecture result, Hardening diff scan, KJV Only Hardening Remediation Report, Original assessment findings (+2 more)

### Community 173 - "geojson_geometry"
Cohesion: 0.22
Nodes (9): geojson_geometry, geojson_point, additionalProperties, required, type, additionalProperties, required, type (+1 more)

### Community 174 - "help-page.tsx"
Cohesion: 0.31
Nodes (8): getVisibleHelpSections(), HELP_SECTIONS, HelpItem, HelpPage(), HelpSection, scoreHelpItem(), scoreText(), CardContent()

### Community 175 - "search-page.tsx"
Cohesion: 0.19
Nodes (9): BookGroup, SEARCH_HELP_ITEMS, SEARCH_MODE_LABELS, SearchPageProps, Input(), Label(), ScrollArea, ScrollBar() (+1 more)

### Community 176 - "how-to-get-saved-page.tsx"
Cohesion: 0.29
Nodes (7): GospelStep, HowToGetSavedPage(), HowToGetSavedPageProps, ReferenceList(), renderReferenceText(), ROMANS_ROAD_STEPS, ScriptureReference

### Community 177 - "static-page.tsx"
Cohesion: 0.25
Nodes (9): DonatePage(), StaticPage(), StaticPageProps, WhyKJVOnlyPage(), getStaticPage(), STATIC_PAGE_MAP, STATIC_PAGES, StaticPageDefinition (+1 more)

### Community 178 - "button.tsx"
Cohesion: 0.31
Nodes (6): FloatingLinkEditor(), setFloatingElemPositionForLinkEditor(), BookChapterPicker(), BookChapterPickerProps, Button(), buttonVariants

### Community 179 - "concordance-reference-popover.tsx"
Cohesion: 0.31
Nodes (7): ConcordanceReferencePopoverProps, Popover(), PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle(), PopoverTrigger()

### Community 180 - "why-kjv-only-page.tsx"
Cohesion: 0.22
Nodes (7): CASE_AT_A_GLANCE, EXTERNAL_SOURCES, ExternalSource, KJV_ONLY_SECTIONS, KJVOnlySection, ScriptureReference, WhyKJVOnlyPageProps

### Community 181 - "ancient_id"
Cohesion: 0.67
Nodes (3): pattern, type, ancient_id

### Community 182 - "Security assessment"
Cohesion: 0.33
Nodes (6): Defense-in-depth items not validated as current vulnerabilities, Dependency and supply-chain posture, Required remediations, Security assessment, Threat model, Validated findings

### Community 183 - "Recommendation disposition"
Cohesion: 0.40
Nodes (5): Priority 0 — security and deployment, Priority 1 — ownership and structure, Priority 2 — performance and delivery, Priority 3 — design, testing, and operations, Recommendation disposition

### Community 184 - "Structural assessment"
Cohesion: 0.40
Nodes (5): Main structural problem: orchestration concentration, Recommended target structure, State and persistence, Structural assessment, What is working well

### Community 185 - "Prioritized hardening roadmap"
Cohesion: 0.40
Nodes (5): Prioritized hardening roadmap, Priority 0 — prevent avoidable security and deployment failures, Priority 1 — create stable ownership boundaries, Priority 2 — remove main-thread and delivery bottlenecks, Priority 3 — consistency and maintainability

### Community 186 - "alternate_verses"
Cohesion: 0.50
Nodes (4): patternProperties, type, ^[0-9a-z]{1,8}$, alternate_verses

### Community 187 - "ancient_or_modern_id"
Cohesion: 0.67
Nodes (3): pattern, type, ancient_or_modern_id

### Community 188 - "Testing, linting, and release engineering"
Cohesion: 0.50
Nodes (4): Current strengths, Gaps, Recommended verification pyramid, Testing, linting, and release engineering

### Community 189 - "Performance assessment"
Cohesion: 0.50
Nodes (4): Deployment and asset pipeline, Measured baseline, Performance assessment, Startup and search path

### Community 190 - "thumbnails"
Cohesion: 0.67
Nodes (3): thumbnails, patternProperties, type

## Knowledge Gaps
- **1341 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+1336 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `color-picker.tsx` to `plugins.tsx`, `sidebar.tsx`, `reader-panel-tree.tsx`, `cn`, `dependencies`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `color-picker.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `plugins.tsx`, `genealogy-tree-dialog.tsx`, `color-picker.tsx`, `sidebar.tsx`, `component-example.tsx`, `reference-command.ts`, `chapter-text-content.tsx`, `notes-page.tsx`, `reader-panel-tree.tsx`, `help-page.tsx`, `search-page.tsx`, `utils.ts`, `concordance-reference-popover.tsx`, `reader-study-tools-content.tsx`, `button.tsx`, `card.tsx`, `topics-tool.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `KJVReader()` (e.g. with `loadAIDictionary()` and `loadBibleWordBook()`) actually correct?**
  _`KJVReader()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _1341 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `kjv-reader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10037878787878787 - nodes in this community are weakly interconnected._
- **Should `plugins.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.059574468085106386 - nodes in this community are weakly interconnected._
