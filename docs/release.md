# Release and Recovery Runbook

## Required verification

Use Node 22 and a clean lockfile install. A release candidate must pass:

```bash
npm ci
npm audit --audit-level=high
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm run test:e2e:release
```

CI repeats the development-server sequence, runs dependency review on pull requests, emits a CycloneDX SBOM, and retains coverage/browser artifacts. Before release, the production-preview suite additionally covers the real corpus startup, chapter navigation, lazy search-index construction, worker-backed note import and persistence, keyboard focus return, malformed persistence recovery, application-owned service-worker cache isolation/upgrades, and serious/critical axe findings.

## Manual smoke test

Verify a fresh load and an upgrade from the previous deployed version. Open Genesis, navigate chapters, switch study/read modes, open search, create and edit a note, add a bookmark, export/import both, share and reopen a multi-panel layout, open each study-tool family, download/clear an offline package, reload offline, and confirm keyboard focus returns after dialogs and menus. Repeat at a narrow viewport and 200% zoom.

## Data and asset review

Inspect the `npm run build` budget report. Confirm `dist/delete`, SQLite, and OSIS are absent; the core JSON and cache config are present; and asset/chunk sizes remain under the checked budgets. For generated-data changes, record the generator command, input revision/hash, output counts/hash, and any intentional URL change in the release notes.

## Rollback and recovery

Keep the preceding deploy and cache version available until smoke tests pass. Roll back application and cache configuration together. Never resolve a bad release by deleting all origin caches or all service-worker registrations; cleanup is application-prefix and scope specific.

Malformed local records are filtered by the storage validators. If a user reports persistence trouble, preserve an export before clearing data, identify the failing record without collecting unrelated personal content, and test the recovery against the same schema version. Import replacement is atomic, so a rejected file must leave current notes/bookmarks intact.
