# Codebase Improvement Plan

Date: 2026-03-21

## Overall Assessment

The app is strong in feature depth and product direction, but the main risks are still architectural concentration, lifecycle/state fragility, and uneven polish between core reader workflows and supporting product pages.

The codebase is moving in the right direction. Recent extractions around routing, history, targeting, layout hash sync, and transfer handling are good. The next step is to continue turning those seams into explicit subsystems instead of letting `KJVReader` remain the de facto integration layer for everything.

## Highest-Priority Findings

### 1. `KJVReader` is still too large and too state-dense

Files:
- [src/components/reader/kjv-reader.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/kjv-reader.tsx)
- [src/components/reader/reader-panel-tree.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/reader-panel-tree.tsx)

Why it matters:
- `kjv-reader.tsx` is still about `4800` lines.
- `reader-panel-tree.tsx` is still about `1950` lines.
- This is the main source of temporal-dead-zone bugs, lifecycle regressions, and “fix one flow, break another” behavior.

Improve:
- Continue extracting cross-cutting workflows from `kjv-reader.tsx`.
- Prioritize:
  - notes context / word-selection sync
  - study-tool orchestration
  - panel move/close/split lifecycle semantics
  - dialog and static-page orchestration
- Split `reader-panel-tree.tsx` by leaf type or panel responsibility:
  - reader leaf renderer
  - page leaf renderer
  - notes/search/bookmarks leaf renderers
  - panel menu actions

### 2. Panel lifecycle reliability still needs stronger invariants

Files:
- [src/lib/reader-layout.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/lib/reader-layout.ts)
- [src/lib/leaf-state.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/lib/leaf-state.ts)
- [src/hooks/use-leaf-history.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/hooks/use-leaf-history.ts)
- [src/hooks/use-panel-targeting.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/hooks/use-panel-targeting.ts)

Why it matters:
- Recent fixes prove this area is still the highest bug-density zone.
- Leaf tree state and sidecar leaf-id state are still split across multiple stores.

Improve:
- Define one explicit “full leaf state” contract.
- Ensure every move/close/split operation accounts for:
  - history
  - search page state
  - notes tab state
  - highlight mode
  - verse highlights
  - pending scroll targets
  - targeted leaf state
- Add tests for:
  - close after move
  - split then move
  - move page/search/notes/picker leaves
  - target leaf deletion

### 3. There are still too many reader-side effects coupled together

Files:
- [src/components/reader/kjv-reader.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/kjv-reader.tsx)
- [src/hooks/use-panel-routing.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/hooks/use-panel-routing.ts)

Why it matters:
- Word clicks, note links, cross references, notes context, reader highlight state, and study tool state are still tightly coupled.
- This is exactly why recent regressions happened around:
  - selected word enablement
  - Strong’s opening from note links
  - cross references not populating

Improve:
- Extract a dedicated `use-word-study-sync` or similar hook.
- One coordinator should own:
  - word context selection
  - cross-ref verse opening
  - concordance selection
  - Strong’s selection
  - reader word highlight
  - notes context update
- Make manual token click and note-word-link use the same path with no branching drift.

### 4. UI wrapper contracts are not always explicit enough

Files:
- [src/components/ui/alert-dialog.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/ui/alert-dialog.tsx)
- [src/components/reader/kjv-reader.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/kjv-reader.tsx)

Why it matters:
- Recent import-dialog warnings happened because wrapper behavior was assumed instead of enforced.
- `AlertDialogDescription` does not support `asChild`, but that was easy to assume from typical shadcn patterns.

Improve:
- Standardize wrapper component capabilities.
- Either:
  - add `asChild` support intentionally where appropriate, or
  - document the supported contract and keep wrappers intentionally narrow
- Add a short internal convention note for UI wrapper usage.

### 5. Test coverage is decent at the library level but still thin at the workflow level

Files:
- [src/lib/__tests__](/home/drpepper/Desktop/CodexProjects/kjv-only/src/lib/__tests__)

Why it matters:
- The codebase has solid unit-style coverage for parsing and layout helpers.
- Most regressions have been interaction-level, not pure helper-level.

Improve:
- Add more workflow-oriented tests around:
  - panel history behavior
  - targeted-panel fallback creation
  - importing notes with context scope
  - note link opening behavior
  - panel move lifecycle with sidecar state
- If full component testing is too heavy, test extracted orchestration hooks directly.

## Medium-Priority Findings

### 6. Offline/download UX is useful but still not fully self-explanatory

Files:
- [src/components/reader/download-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/download-page.tsx)
- [src/lib/offline-downloads.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/lib/offline-downloads.ts)
- [public/sw.js](/home/drpepper/Desktop/CodexProjects/kjv-only/public/sw.js)

Why it matters:
- The feature exists, which is good.
- But version freshness, bundle metadata, and update semantics are still partly implicit.

Improve:
- Add explicit bundle version metadata.
- Show last refreshed timestamp.
- Distinguish “downloaded”, “partially cached”, and “out of date”.
- Keep service worker behavior aligned with what the UI promises.

### 7. Local persistence works, but schema/version strategy should be more formal

Files:
- [src/hooks/use-reader-notes.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/hooks/use-reader-notes.ts)
- [src/hooks/use-reader-bookmarks.ts](/home/drpepper/Desktop/CodexProjects/kjv-only/src/hooks/use-reader-bookmarks.ts)
- [src/components/reader/kjv-reader.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/kjv-reader.tsx)

Why it matters:
- Notes, bookmarks, settings, and reader state rely heavily on local storage.
- The code already handles some migration, but it is still distributed and ad hoc.

Improve:
- Centralize local-storage key/version definitions.
- Add explicit versioning for persisted app settings, not just transfer payloads.
- Follow the Vercel best-practice direction of minimizing and versioning local storage payloads.

### 8. Static pages are improving, but the quality level is still uneven

Files:
- [src/components/reader/welcome-home-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/welcome-home-page.tsx)
- [src/components/reader/download-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/download-page.tsx)
- [src/components/reader/how-to-get-saved-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/how-to-get-saved-page.tsx)
- [src/components/reader/why-kjv-only-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/why-kjv-only-page.tsx)

Why it matters:
- These pages are part of the product identity now, not just filler.
- Some are already solid, but the overall content system still feels handcrafted case-by-case.

Improve:
- Define a shared content-page pattern:
  - title
  - intro
  - section cadence
  - internal reference button usage
  - source-note section rules
- Tighten `Welcome Home` first because it is the first-run experience.

### 9. Some bundle and render costs could be trimmed further

Files:
- [src/components/reader/kjv-reader.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/kjv-reader.tsx)
- [src/components/reader/download-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/download-page.tsx)
- [src/components/reader/search-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/search-page.tsx)

Why it matters:
- You already use some lazy loading, which is good.
- There are still large client components doing a lot of work at once.

Improve:
- Continue bundle splitting large optional UI areas.
- Watch for repeated expensive calculations in large render paths.
- Prefer extracting stateful sections into narrower components or hooks before adding more memoization.

## Lower-Priority Findings

### 10. Welcome page could do more as a product entry point

File:
- [src/components/reader/welcome-home-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/welcome-home-page.tsx)

Improve:
- Add clearer quick actions:
  - Open Bible
  - Open Search
  - Download for Offline Use
- Make the first-use path more action-oriented than descriptive.

### 11. Download page can be clearer visually

File:
- [src/components/reader/download-page.tsx](/home/drpepper/Desktop/CodexProjects/kjv-only/src/components/reader/download-page.tsx)

Improve:
- Better grouping between:
  - install app
  - download offline data
  - manage/update bundles
- Better status hierarchy for storage, cached count, and active operations

## Optimization Notes

Based on a quick review and the Vercel React guidance:

- Good:
  - independent concerns are starting to move into hooks
  - lazy loading is already in use for some large reader/sidebar/dialog sections
  - parsing and serialization helpers are fairly testable

- Worth improving:
  - keep reducing mega-components instead of relying on memoization as a band-aid
  - prefer explicit subsystem hooks over more cross-component callbacks
  - continue minimizing broad effect dependencies where orchestration logic can move into event paths

## Recommended Order

1. Continue reader architecture cleanup
2. Strengthen panel lifecycle and workflow tests
3. Extract word-study / note-link interaction orchestration
4. Formalize persistence and offline metadata
5. Run a dedicated content-quality pass on static pages
6. Refine onboarding and download UX

## Suggested Next Concrete Tasks

### Task 1
Extract a dedicated word-study synchronization hook from `kjv-reader.tsx`.

### Task 2
Add workflow regression tests for:
- targeted panel fallback
- note-word-link behavior
- panel move lifecycle
- panel history back/forward semantics

### Task 3
Run a focused `Welcome Home` polish pass:
- stronger purpose statement
- better quick actions
- cleaner first-use flow

### Task 4
Add offline bundle metadata:
- version
- last refreshed
- stale detection

## Summary

The codebase is in a better state than it was earlier because the right extractions have started. The biggest remaining gains are not new features. They are:

- reducing orchestration concentration
- hardening interaction workflows
- formalizing state/lifecycle contracts
- polishing product-facing pages and offline UX

That is the path from “feature-rich” to “boringly reliable and polished.”
