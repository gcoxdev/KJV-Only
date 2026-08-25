# Release-candidate pass — 2026-08-24

## Outcome

**Local release candidate: PASS.**

The application builds and passes its complete production Chromium matrix on Node 22. The reader, study tools, notes/bookmarks, layouts, accessibility modes, service-worker upgrade path, full offline package, true offline reload, and cache clearing all retained their expected user-visible behavior.

This pass did not commit, push, or deploy anything. AWS Amplify therefore did not rebuild.

## Candidate scope

The pass covered the current working tree relative to `4e06bc51ddfc4b7e0402c4d04459b1dd89528698`, including:

- the completed reader refactor and study-tool performance work;
- application startup and common reader journeys;
- note and bookmark persistence, export, and import;
- constrained mobile study-tool loading;
- keyboard and automated accessibility behavior;
- forced colors, reduced motion, the Contrast reader theme, and effective 200% zoom;
- generated production assets and distribution budgets;
- service-worker installation, upgrade isolation, offline startup, bundle download, and bundle clearing;
- dependency and changed-code security review.

## Issues found and repaired during the pass

### Production offline startup omitted generated assets

The core offline package could report `Fully cached` while an actual offline reload produced a blank application. The package contained the static corpus but did not know the hashed JavaScript, CSS, font, worker, and lazy-chunk names created by each production build.

The build now creates `app-shell-assets.json` from the exact contents of `dist/assets`. The service worker installs the startup subset, while the explicit core download includes every generated asset. Both consumers validate the manifest's schema, size, URL grammar, uniqueness, and startup-subset relationship. The distribution audit rejects a missing, unsafe, stale, or incomplete manifest.

### Production preview could serve the development placeholder

The initial manifest implementation allowed a public placeholder to shadow the generated production manifest in preview. The placeholder was removed from public runtime assets. Development now supplies its empty manifest only through development middleware; production preview serves the generated file from `dist`.

### Service-worker startup depended on a separate network import

The worker previously used `importScripts` to obtain cache configuration. A restarted worker could therefore depend on a network request before it was able to serve the offline application. Registration now passes the cache name and prefix in the worker URL. The worker strictly validates both tokens and requires the cache name to begin with the application prefix before installing.

### `Vary: Origin` prevented reliable CacheStorage matching

Production cache entries can carry `Vary: Origin`. Default Cache API matching caused two failures:

- offline startup could miss an entry that was present;
- `Clear Bundle` could leave entries behind.

Application-owned same-origin cache reads and explicit bundle deletions now use `ignoreVary`. Service-worker interception remains restricted to same-origin `GET` requests, and deletion receives only application-constructed same-origin bundle URLs. The production offline journey now verifies a fully populated cache, real offline fetches, an offline document reload, reader readiness, and complete clearing.

### Coverage gate no longer reflected extracted reader orchestration

The refactor moved reader coordination into hooks faster than characterization tests were added, causing the existing global coverage thresholds to fail. New tests now pin derived chapter/progress state, study-panel wiring, settings transformations, notes behavior, and tab/panel actions. Thresholds were not lowered and production code was not excluded.

## Verification evidence

All commands used Node `22.22.1`.

| Gate | Result |
| --- | --- |
| Clean dependency install | Passed |
| `npm audit --audit-level=high` | Passed — 0 vulnerabilities |
| ESLint | Passed |
| TypeScript project build | Passed |
| Vitest with coverage | Passed — 45 files, 259 tests |
| Statement coverage | 44.81% — threshold 43% |
| Branch coverage | 48.05% — threshold 48% |
| Function coverage | 43.07% — threshold 40% |
| Line coverage | 44.97% — threshold 43% |
| Production build and distribution audit | Passed |
| Development E2E | 15 passed, 5 production-only checks skipped |
| Final production E2E | 20 passed in 2.2 minutes |
| Security diff review | Complete — 13/13 changed source/test files, 0 reportable findings |

Final production distribution:

| Measure | Result | Budget |
| --- | ---: | ---: |
| Files | 6,751 | 7,000 |
| Total bytes | 1,146,116,746 | 1,150,000,000 |
| Entry JavaScript | 553,124 bytes | 600,000 bytes |
| Entry CSS | 165,545 bytes | 180,000 bytes |

Representative final production journey times:

| Journey | Time |
| --- | ---: |
| Note/bookmark create, edit, export, and import | 10.7 s |
| Pixel 5 / throttled 4G / 4× CPU study matrix | 36.4 s |
| Forced colors, reduced motion, contrast, zoom, and Axe matrix | 22.1 s |
| Service-worker upgrade and cache isolation | 7.4 s |
| Full core download, offline reload, and clear | 23.0 s |

The constrained study journey loaded a selected word across concordance, Strong's, KJV words and phrases, maps, and genealogy under throttled conditions. Its recorded all-tools completion remained under the 60-second RC ceiling, and the page did not overflow the mobile viewport.

## Security result

The final working-tree security diff review found no reportable vulnerability. It specifically reviewed:

- service-worker registration and cache namespace ownership;
- same-origin request interception and ranged-response handling;
- generated manifest validation and runtime asset selection;
- offline download, lookup, deletion, and failure behavior;
- runtime asset allowlisting, traversal rejection, symlink rejection, and distribution checks;
- production browser evidence for cache isolation and offline lifecycle behavior.

The review found that `ignoreVary` does not widen the network boundary: worker use occurs only after same-origin `GET` enforcement, and UI deletion operates on explicit same-origin bundle URLs.

## Remaining release-owner checks

These checks require an environment or authority that was intentionally outside this local pass:

- inspect the deployed AWS Amplify response headers and routing after the eventual approved push;
- smoke-test the deployed URL after Amplify reports a successful build;
- install and exercise the PWA on at least one representative physical mobile device if physical-device signoff is required;
- decide whether this working tree should be committed; no commit approval has been inferred from the RC request.

The local candidate is ready for review and commit approval. A push should remain a separate explicit decision because it triggers the Amplify rebuild.
