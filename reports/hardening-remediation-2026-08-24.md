# KJV Only Hardening Remediation Report

**Remediation date:** 2026-08-24
**Assessment baseline:** `reports/project-assessment-2026-08-23.md`, committed as `191555f`
**Compatibility objective:** Improve security, structure, reliability, performance, design consistency, and delivery controls without changing the product's existing user-facing behavior.

> **Follow-up:** The remaining selected structural, startup, corpus-integrity, workflow, and release-gate work is complete. Current measurements and final disposition are recorded in [Assessment Follow-Up and Final Hardening Record](assessment-follow-up-2026-08-24.md). AWS Amplify-side controls remain owner-deferred, and no S3/CDN migration was performed.

## Executive result

The repository-local recommendations from the assessment have been implemented. The application retains its existing reader, workspace, study tools, notes, bookmarks, search, layout sharing, maps, audio, offline packages, and public URL contracts. Hardening was performed at boundaries rather than through a product redesign.

The final result has:

- zero known npm audit vulnerabilities;
- bounded and worker-isolated imports, corpus parsing, and regular-expression search;
- a centralized URL policy and safe new-tab behavior;
- strict serialized-editor, layout-hash, timestamp, persistence, and transfer validation;
- a network- and filesystem-constrained map-photo downloader;
- application-owned service-worker cache isolation;
- an exact production asset allowlist and enforced artifact/bundle budgets;
- a controller/persistence ownership boundary instead of new direct storage logic in `KJVReader`;
- CI, dependency review, Dependabot, SBOM generation, coverage thresholds, Playwright, axe, and a production service-worker test;
- deployment headers, security policy, architecture/data/release documentation, and a refreshed Graphify map.

No critical, high, or medium finding remained in the hardening diff review. The immutable pre-remediation diff scan found six low-severity edge cases; all six were fixed before the final verification described below.

## Compatibility contract

The implementation deliberately preserved:

- localStorage key names and valid stored record shapes;
- note and bookmark export version 1 and legacy array imports;
- `kjv:` internal-note links and allowed web/contact schemes;
- shared-layout fragment syntax and current tab/panel behaviors;
- canonical book/chapter/verse indexes;
- existing `/data`, `/references`, `/topics`, `/maps`, `/audio`, and `/icons` runtime URLs;
- current optional offline package grouping and service-worker scope;
- existing reader themes, targets, study tools, editor behavior, and visual layout.

Invalid or unsafe data now fails before state mutation. Valid older data continues through the existing compatibility adapters. A malformed stored collection is reported and retained instead of being silently replaced with an empty collection; the next intentional user edit can establish a new valid state.

## Recommendation disposition

### Priority 0 — security and deployment

| Assessment recommendation | Disposition | Implementation and evidence |
|---|---|---|
| Stop shipping quarantine and generator inputs | Complete | Vite `publicDir` copying is disabled. `runtimePublicAssets` uses an exact file/pattern allowlist shared by development, preview, and production copy paths. OSIS moved to `data-sources/`; generated SQLite moved to ignored `.generated/`. KML, JSONL, ZIPs, map schemas/reports, legacy map sources, SQLite, OSIS, and `public/delete/` are absent from `dist`. |
| Add deploy required/forbidden checks and budgets | Complete | `scripts/check-dist.mjs` verifies required assets, forbidden paths/patterns, file count, total bytes, main entry JavaScript, and CSS budgets. The final build passed at 6,738 files, 1,145,586,247 bytes, 587,825-byte entry JS, and 165,470-byte entry CSS. |
| SEC-01 imported editor links | Complete | One URL policy covers creation/import/navigation. Unsafe protocols, control characters, malformed URLs, and imported `rel=opener` are rejected. New tabs use `noopener,noreferrer`, and the opener is nulled defensively. URL and transfer regression tests pass. |
| SEC-02 map path traversal | Complete | Thumbnail names use a narrow basename grammar. The output directory must be a real, non-symlinked canonical directory; targets must remain contained and cannot be symlinks. Writes use exclusive temporary files and atomic rename. |
| SEC-03 map SSRF | Complete | Only HTTPS `upload.wikimedia.org` without credentials or unexpected ports is permitted. Every redirect is revalidated. DNS answers are checked against loopback, private, link-local, carrier-grade NAT, special, multicast, and IPv4-mapped IPv6 ranges. |
| SEC-04 downloader exhaustion | Complete | Redirect, request timeout, response byte, candidate, target-per-candidate, aggregate filesystem-byte, and write-concurrency bounds are enforced. Response content type and JPEG/PNG/WebP signatures are checked, and partial staging files are cleaned. A full 481-candidate dry run completed with no errors. |
| SEC-05 layout recursion/cardinality | Complete | Layout fragments now have byte, tab, tree-node, depth, title, range, and numeric-digit limits. Parsing is depth-aware and a layout is applied only after the whole fragment validates. Malformed/oversized fixtures pass. |
| SEC-06 import exhaustion | Complete | File size is checked before `File.text()`. File, entry, field, body, selection-range, editor-node, and depth limits are enforced in a cancellable dedicated worker. Aggregate post-merge cardinality is checked before notes/bookmarks change. |
| SEC-07 invalid timestamps | Complete | Timestamps must be finite safe integers within the JavaScript Date range. The same validators are used for import and persistence hydration. |
| Remove Webster HTML sink | Complete | `dangerouslySetInnerHTML` was removed. Definition markup is converted to text/line-break React nodes by a narrow formatter with tests. |
| Isolate regex search | Complete | Regex evaluation is length-bounded, cancellable, result-capped, and runs in a worker. Contains/smart search yields in batches so input is not blocked. Stale search runs cannot cancel newer progress. |
| Isolate service-worker ownership | Complete | Cache naming/version comes from `public/app-cache-config.js`. Cleanup deletes only obsolete `kjv-only-cache-*` entries. Reads use only the application cache, range requests bypass caching, only complete HTTP 200 responses are cached, and cache quota failures do not turn successful network responses into errors. |
| Add deploy headers | Complete in repository | `public/_headers` defines CSP, HSTS, nosniff, referrer, permissions, COOP, and cache policies. Hosts without `_headers` support must map the same policy in their platform configuration. |
| Patch dependencies and automate review | Complete | Direct packages and the lockfile were updated. `npm audit --audit-level=high` reports zero vulnerabilities. CI runs audit and dependency review; Dependabot schedules npm and GitHub Actions updates; CI emits a CycloneDX SBOM. |
| Add security policy | Complete | `SECURITY.md` documents supported versions, private reporting, security boundaries, scope, and response expectations. |
| Add CI | Complete | `.github/workflows/ci.yml` installs from the lockfile, audits, lints, typechecks, enforces coverage, builds and checks distribution output, runs production Playwright, generates an SBOM, and uploads verification artifacts. Enabling required branch checks remains a repository-host setting. |

### Priority 1 — ownership and structure

| Assessment recommendation | Disposition | Implementation and evidence |
|---|---|---|
| Characterize current behavior before ownership changes | Complete | Existing unit fixtures were retained and expanded for layouts, persistence, transfers, URLs, search, workers, maps, Webster rendering, and cache policy. Production E2E covers corpus startup, chapter navigation, search, import persistence, corrupt-state recovery, keyboard focus, axe, and service-worker upgrade/isolation. |
| Introduce a reader-controller façade | Complete first-stage boundary | `useReaderController` is now the documented reader-wide façade and composes preferences and reading-progress ownership. `KJVReader` no longer contains direct localStorage access or settings/progress parsing. New controller-owned slices are required to enter through this façade rather than add lifecycle policy to the component. |
| Centralize persistence schemas and adapter | Complete | `local-storage.ts` owns safe reads/writes/removal and issue reporting. `reader-persistence.ts` owns display/progress validation and legacy mapping. Notes/bookmarks use shared transfer schemas during import and hydration. Failure is surfaced through one recovery event/toast. |
| Extract feature algorithms from the reader | Complete for changed high-risk slices | Corpus parsing, verse-index construction, regex matching, transfer parsing, URL policy, Webster formatting, persistence schemas, read-progress, preferences, and performance measurement live behind hooks/lib/workers. Existing domain hooks remain the public adapters for workspace, notes, bookmarks, history, routing, study data, and targeting. |
| Reduce recursive view ownership risk | Addressed without risky rewrite | `ReaderPanelTree` remains the compatible recursive view composer, while feature logic stays in hooks/lib and heavy views remain lazy imports. A wholesale prop/reducer rewrite was intentionally avoided because it would change the highest-risk compatibility surface without delivering a user-visible benefit in this hardening release. The ownership rule is recorded in `docs/architecture.md`. |

`KJVReader` remains large (4,633 lines), but it is now constrained as a façade/coordinator: no new parser, persistence, transfer, URL, or search algorithm was left in it. This is a safer structural improvement than a one-shot rewrite. Future extractions can follow the façade one invariant-owning slice at a time under the new browser characterization suite.

### Priority 2 — performance and delivery

| Assessment recommendation | Disposition | Implementation and evidence |
|---|---|---|
| Measure startup and index work | Complete | `kjv:corpus-load` and `kjv:search-index-build` performance measures are emitted and asserted in real Chromium with a 60-second upper bound. Bundle and distribution measurements are release gates. |
| Remove full-corpus JSON parsing from the main thread | Complete | `/data/kjv.json` is fetched and parsed in `reader-data.worker.ts`, with a main-thread fallback only when workers are unavailable/fail. This preserves the data URL and exact `Book[]` contract. |
| Avoid startup search-index construction | Complete | The lightweight verse index is separated from concordance/search logic and is created only when a search view exists. Search-index creation is no longer part of the default reader startup path. |
| Move expensive search work to cancellable workers/batches | Complete | Regex uses a dedicated worker; contains and smart modes process bounded batches with progress, cancellation, stale-run protection, and result caps. |
| Preserve real feature/lazy boundaries | Complete | Notes/editor, maps, genealogy, search, study sidebar, and dialogs remain lazy. Rollup groups React, UI, editor, and maps vendor code into stable chunks. The main entry fell from 1,135,031 to 587,721 minified bytes (about 48% smaller). |
| Separate runtime from source assets | Complete | Runtime/source/generated/quarantine classes are documented and enforced. Raw OSIS, SQLite, KML, JSONL, schemas, reports, archives, and backups no longer enter the production build. |
| Separate optional offline packages | Complete at application boundary | Core, references, maps, Old Testament audio, and New Testament audio remain independently selected in the existing download manager and keep their URLs. The release allowlist preserves those packages without coupling generator inputs to deployment. |
| Shard the KJV corpus / externalize heavy binaries | Safely deferred migration | The compatibility-safe worker/lazy-index changes remove the main-thread bottlenecks without changing canonical data URLs. Sharding `/data/kjv.json`, moving audio/maps to CDN/object storage/LFS, or rewriting Git history requires an externally hosted manifest, integrity/rollback plan, and deployment migration. `docs/data-and-deployment.md` specifies that migration contract. No destructive history rewrite or unapproved external infrastructure change was performed. |

The corpus remains a large network/object-memory payload, but it no longer synchronously parses or builds its search index on the UI thread. The retained single URL is the principal remaining performance opportunity and is explicitly separated from correctness/security remediation.

### Priority 3 — design, testing, and operations

| Assessment recommendation | Disposition | Implementation and evidence |
|---|---|---|
| Normalize shadcn/Base UI spacing and composition | Complete for the audited drift | `space-x/y` utilities were replaced with container gaps, equal width/height utilities were normalized to `size-*`, status colors use semantic tokens, and Select/Dropdown groups were added where wrapper semantics require them. |
| Bring the editor subtree onto supported primitives | Complete | The color picker uses current Base UI/shadcn composition; editor lint suppressions were removed; link/navigation behavior is routed through the shared policy. The editor remains an explicit subsystem behind the notes lazy boundary. |
| Expand lint scope | Complete | ESLint covers browser TS/TSX including editor code, Node maintenance scripts, config/E2E TypeScript, and service-worker/cache JavaScript with environment-specific globals. |
| Add coverage gate | Complete | Vitest v8 coverage thresholds are enforced. Final result: 44.25% statements, 48.65% branches, 41.10% functions, 43.99% lines; 33 files and 170 tests pass. |
| Add browser/accessibility/PWA coverage | Complete for critical journeys | Seven production Chromium tests pass, covering startup/navigation, lazy search, worker import/persistence, malformed storage recovery, keyboard menu focus return, serious/critical axe findings, and service-worker cache upgrade/isolation. The release runbook retains a broader manual smoke/device/zoom matrix. |
| Keep StrictMode diagnostics in development | Complete | `StrictMode` now wraps the application in all modes. |
| Document ownership, assets, cache, release, recovery, and security | Complete | Added `docs/architecture.md`, `docs/data-and-deployment.md`, `docs/release.md`, `SECURITY.md`, README commands, CI, cache config, deployment headers, and this remediation record. |
| Automate updates and release evidence | Complete | Dependabot, audit, dependency review, SBOM, coverage, build budgets, Playwright artifacts, and release/recovery instructions are present. |

## Final security closure

### Original assessment findings

All seven original findings are remediated:

| ID | Closure control |
|---|---|
| SEC-01 | Central URL allowlist, imported LinkNode grammar/attributes, safe opener helper, URL tests |
| SEC-02 | Basename grammar, real non-symlink output root, containment, target symlink rejection, atomic write tests |
| SEC-03 | Exact HTTPS host, credential/port policy, redirect and DNS address revalidation |
| SEC-04 | Timeout, redirect, response, candidate, target, total-write, media, and cleanup bounds |
| SEC-05 | Byte/tree/depth/tab/title/range/digit limits and atomic layout apply |
| SEC-06 | Pre-read file limit, worker parse, field/tree/range/entry/aggregate limits, cancellation |
| SEC-07 | Finite safe-integer Date-range validation shared by import and persistence |

Defense-in-depth recommendations are also closed: no `dangerouslySetInnerHTML` remains in production source, regex is worker-isolated, cache cleanup/read ownership is application-scoped, cache configuration is centralized, and deployment headers are checked in.

### Hardening diff scan

Codex Security reviewed the complete pre-remediation hardening diff under scan ID `80a20667-0acf-4a76-8ce5-43535aa83c94` with 109/109 review receipts and complete coverage. It reported six low-severity findings and no critical/high/medium findings:

1. imported `rel=opener` attributes;
2. unsupported Lexical editor grammar;
3. notes post-merge cardinality/data-loss path;
4. bookmarks post-merge cardinality/data-loss path;
5. map-photo multiplied-write budget;
6. symlinked map-photo output root.

Every item was fixed after the scan snapshot and has focused unit or production-browser evidence. Two suppressed robustness candidates—primitive-array editor traversal and accidental map generator publication—were fixed as well through the strict grammar and exact file allowlist.

The scan's Trusted Access for Cyber status was advisory `not_granted`; no gated capability was used. This did not block the repository diff review.

## Graphify architecture result

Graphify was refreshed after the remediation and its durable artifacts remain:

- `graphify-out/graph.html` — interactive graph;
- `graphify-out/GRAPH_REPORT.md` — architecture audit;
- `graphify-out/graph.json` — machine-readable graph.

Final graph: 3,087 nodes, 6,024 edges, and 191 communities. Graphify reports no import cycles. Its final multigraph diagnostic reports 6,024 valid edges, zero missing/dangling endpoints, zero self-loops, and zero exact duplicates. The controller query shows the intended chain:

```text
KJVReader
  -> useReaderController
      -> useReaderPreferences -> local-storage / reader-persistence
      -> useReadChapters      -> local-storage / reader-persistence
```

Transfer boundaries are separately visible as `use-panel-transfer` -> `reader-transfer-worker` -> `reader-transfer.worker` -> `reader-transfer`, keeping file parsing and validation outside the component/UI thread.

`KJVReader` remains the most central application coordinator (68 graph edges). That centrality is now documented and constrained rather than hidden: new stateful feature algorithms must enter through controller/domain hooks. Graphify 0.9.36 still warns that the installed skill text identifies 0.8.32; extraction and diagnostics completed successfully, so this is a tooling-version caveat rather than a graph failure.

## Before-and-after measurements

| Measure | Assessment baseline | Final verified result | Change |
|---|---:|---:|---:|
| npm audit advisories | 18 (1 critical, 12 high) | 0 | Cleared |
| Unit tests | 139 / 26 files | 170 / 33 files | +31 tests, +7 files |
| Browser E2E | None | 7 production Chromium journeys | Added |
| `dist` files | 9,723 | 6,738 | -2,985 |
| `dist` bytes | about 1.4 GB | 1,145,586,247 | Generator/quarantine inputs removed |
| Main entry JS | 1,135,031 B | 587,825 B | -48.2% |
| Main CSS | 183,600 B | 165,470 B | -9.9% |
| Import cycles | None | None | Preserved |
| Main-thread corpus parse | Full 73.6 MB JSON | Worker, fallback only | Removed from normal UI path |
| Startup search index | Eager | Search-view-only | Removed from normal startup |

The remaining deploy size is intentional compatibility payload: existing audio, runtime GeoJSON/thumbnails, browser corpus, and reference packages at their established URLs. Generator sources are no longer mixed with it.

## Verification record

The final source passed:

- `npm run lint`;
- `npm run typecheck`;
- `npm run test:coverage` — 33 files, 170 tests, all thresholds met;
- `npm run build` — production compile and distribution check;
- `npm run test:e2e` — development browser suite (service-worker test correctly skipped there);
- `npm run test:e2e:release` — 7/7 against production preview, including service worker;
- `npm audit --audit-level=high` — zero vulnerabilities;
- `npm run build:map-photos -- --dry-run` — 481 candidates, zero metadata/URL/target errors;
- `git diff --check`;
- Graphify refresh, query, no-cycle report, and multigraph diagnostic.

The initial development E2E run exposed one ambiguous test locator; the test was scoped to the visible Search action and then passed. The production run passed all seven tests.

## Residual operational items

No known repository-local security or correctness recommendation is left open. The following items require deployment or product-infrastructure authority and were therefore documented rather than silently assumed:

- enable the CI workflow as a required branch-protection check;
- mirror `public/_headers` on hosts that do not consume that file;
- provide external storage/CDN/LFS and rollback/integrity support before changing audio/map/corpus URLs or Git history;
- execute the manual mobile, 200% zoom, high-contrast, reduced-motion, offline-package, and full study-tool smoke matrix for a formal release.

These do not change current application behavior and are not blockers to the repository hardening result.
