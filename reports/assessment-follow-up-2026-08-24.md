# Assessment Follow-Up and Final Hardening Record

**Date:** 2026-08-24
**Baseline:** `dd1a893`
**Compatibility objective:** Harden and improve the existing application without changing its user-facing features, data URLs, saved-data contracts, or reader behavior.

## Executive result

The remaining repository-local work selected from the prior assessment is implemented and verified. The change set improves startup behavior, data integrity, reader-state ownership, search responsiveness, cache/release correctness, and workflow coverage while retaining the existing product and deployment model.

Two items are intentionally outside this change set:

1. AWS Amplify-side controls were deferred at the owner's request. Repository documentation records the required operator checks, but no host setting was assumed or changed.
2. The corpus, audio, and map assets remain local. No S3, CDN, LFS, URL migration, or external asset manifest was introduced.

No commit or push was made. Both actions require explicit owner approval, and a push triggers an AWS Amplify rebuild.

## What changed

### Reader ownership and structure

- `useReaderController` is the reader-wide composition boundary for preferences, progress, corpus state, per-panel search state, and verse-index state.
- `useReaderCorpus` owns the progressive bootstrap/full-corpus lifecycle and cancellation-safe state transitions.
- `useReaderSearchPages` owns search-page initialization, update, pruning, and swap semantics keyed by leaf ID.
- `useVerseSearchIndex` owns lazy index construction, readiness/error state, cancellation, worker termination, and the compatibility fallback.
- `KJVReader` no longer directly owns those lifecycle effects. It remains the integration façade, but its responsibilities are narrower and documented.
- Search controls now expose building, ready, and error states and cannot run before the canonical index is ready.

`KJVReader` is now 4,601 lines, down from the 4,633-line post-remediation state. This is an incremental boundary extraction rather than a high-risk rewrite of the reader workspace.

### Startup and search performance

- A deterministic `/data/kjv-manifest.json` describes the fixed local bootstrap and full-corpus assets.
- A 53,644-byte `/data/kjv-bootstrap.json` contains Genesis 1, allowing the default reader to become usable while the full corpus hydrates in the background.
- The full 73,576,521-byte `/data/kjv.json` remains canonical and retains its existing URL.
- Shared-layout restoration and search indexing wait for the complete 66-book corpus, preventing partial-corpus state from being treated as authoritative.
- Full-corpus parsing remains in a dedicated worker during normal operation, with the existing main-thread path retained only as a compatibility fallback.
- Verse-index construction is lazy and runs in a dedicated worker only while a Search view exists. The normal reader startup does not build it.
- Performance measures now cover bootstrap load, first-reader readiness, full-corpus load, and search-index construction.

The browser regression ceilings are:

- bootstrap and first-reader readiness: under 5 seconds;
- full-corpus readiness: under 30 seconds;
- lazy search-index readiness: under 15 seconds.

These are local release gates, not universal end-user latency claims.

### Corpus and release integrity

- `scripts/build-kjv-runtime-manifest.mjs` deterministically derives the bootstrap and manifest from the existing corpus.
- Generation verifies Genesis 1 and the canonical 66-book, 1,189-chapter, 31,102-verse counts.
- Derived files use temporary-file plus rename replacement so interrupted generation cannot leave a partially written file.
- Runtime parsing accepts only the two fixed same-origin corpus URLs and exact canonical counts.
- The production distribution check verifies manifest schema/version, URLs, byte sizes, SHA-256 values, corpus counts, and the version-to-full-hash relationship.
- Runtime asset serving rejects traversal segments, encoded separators, backslashes, repeated encoding tricks, malformed encoding, and non-allowlisted paths. Copying still rejects symlinks.
- Adversarial path-policy tests cover the accepted and rejected request boundary.

### Offline/cache behavior

- The application cache contract advanced to `kjv-only-cache-v6`.
- The manifest and bootstrap are part of the core offline package.
- The production service-worker test reads the cache name from the shared cache configuration instead of duplicating the version in the test.
- The browser suite verifies that upgrade cleanup removes obsolete application caches while retaining unrelated same-origin caches, and that fetches do not read poisoned entries from an unrelated cache.

### Compatibility preserved

The implementation retains:

- all reader, workspace, search, notes, bookmarks, study-tool, maps, audio, download, and shared-layout features;
- existing localStorage keys and validated saved-data shapes;
- existing note/bookmark transfer formats and compatibility adapters;
- existing `/data`, `/references`, `/topics`, `/maps`, `/audio`, and `/icons` public URL families;
- the canonical `Book[]` shape and book/chapter/verse indices;
- current service-worker scope and optional offline package groups;
- the existing main-thread fallbacks when a browser cannot create a worker.

The progressive bootstrap is never persisted or shared as though it were the full corpus. Once full hydration completes, it replaces the bootstrap atomically.

## Security assessment

Codex Security reviewed the final uncommitted diff under scan ID `6547a6a3-c650-4f68-8c81-246cf71676b4`.

- Review receipts: 28/28
- Coverage: complete
- Candidate findings: 0
- Reportable findings: 0
- Critical/high/medium/low findings: 0

Reviewed surfaces included the corpus manifest/bootstrap, worker parsing and search indexing, controller/search lifecycle, runtime request/copy allowlist, cache v6/service-worker behavior, build integrity checks, generated Graphify artifacts, and associated tests.

The Trusted Access for Cyber status was advisory `not_granted`; no gated capability was used and the complete local diff review proceeded normally.

## Graphify architecture map

Graphify's persistent artifacts were refreshed in code-only structural mode:

- `graphify-out/graph.html`
- `graphify-out/GRAPH_REPORT.md`
- `graphify-out/graph.json`

Final graph:

- 3,091 nodes
- 6,133 edges
- 213 communities
- `KJVReader()` remains the most central application coordinator at 67 edges

The extracted ownership paths now include:

```text
KJVReader()
  -> useReaderController()
      -> useReaderCorpus()
      -> useReaderSearchPages()
      -> useVerseSearchIndex()
```

The corpus and verse-index hooks connect to dedicated worker entry points in source. Graphify does not currently emit those `new Worker(new URL(...))` references as directed call edges, so the worker boundary is documented explicitly in `docs/architecture.md` as well as visible in the source nodes.

Graphify 0.9.36 reports that the installed skill text targets 0.8.32. Extraction and clustering completed successfully; the warning is a tooling-version caveat, not a project failure.

## Verification record

The final source and generated runtime assets passed:

- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage` — 37 files, 205 tests
- coverage — 43.36% statements, 48.37% branches, 40.04% functions, 43.20% lines
- `npm run build:data-manifest` — deterministic version `sha256-f005a068b799ac20`
- `npm run build` — compile, allowlisted copy, manifest integrity, and distribution budgets
- `npm run test:e2e` — 7 passed; the production-only service-worker journey was correctly skipped
- `npm run test:e2e:release` — 8/8 passed against the production preview
- `npm audit --audit-level=high` — 0 vulnerabilities
- `git diff --check`
- final Codex Security diff scan — complete, 0 findings
- final Graphify update, clustering, controller paths, and centrality review

Production output:

| Measure | Final result | Enforced budget |
|---|---:|---:|
| Files | 6,741 | 7,000 |
| Total bytes | 1,145,647,008 | 1,150,000,000 |
| Entry JavaScript | 592,330 bytes | 600,000 bytes |
| Entry CSS | 165,470 bytes | 180,000 bytes |

The budgets are intentionally close to the current compatible release and will fail on material regression.

## Residual and deferred work

No known repository-local security or correctness recommendation from this follow-up remains open. The remaining items are deliberate constraints or future incremental opportunities:

- Configure and verify the deferred AWS Amplify headers, build settings, and required repository checks before a formal release.
- Keep the current local asset deployment. A future S3/CDN migration would require separate authorization, integrity/rollback design, and URL-compatibility planning.
- The full corpus is still a large network and object-memory payload. Lazy worker work prevents the normal UI-thread bottlenecks, but the retained single-file contract remains the main performance ceiling.
- Continue reducing `KJVReader` and `ReaderPanelTree` one invariant-owning slice at a time, protected by the expanded workflow suite. A wholesale rewrite is not recommended under the no-functionality-change constraint.
- Run the manual mobile, zoom, high-contrast, reduced-motion, offline-package, and broad study-tool smoke matrix as part of a formal release candidate.

## Release control

This work remains uncommitted. Before any commit, review the complete working-tree diff and generated artifact size. Ask the owner for explicit commit approval. Ask separately before any push so the resulting AWS Amplify rebuild is intentional and consolidated.
