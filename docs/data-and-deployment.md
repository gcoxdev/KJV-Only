# Data, Offline Cache, and Deployment

## Asset classes

Vite's default public-directory copying is disabled. The `runtimePublicAssets` plugin in `vite.config.ts` exposes and builds only exact browser data files plus narrowly matched audio, book-icon, GeoJSON, and map-thumbnail files. The same file-level allowlist is used by the loopback development and preview servers. The tracked OSIS input lives in `data-sources/`; the generated SQLite database lives in ignored `.generated/`; only browser-ready JSON lives under `public/data/`.

`public/delete/` is quarantine, never a runtime source. Raw OSIS, SQLite, JSONL/KML, backups, and other generator inputs must remain outside the deploy allowlist. Adding a new public runtime path requires updating the allowlist and the build-artifact check deliberately.

## Local Bible corpus contract

The corpus remains local to this project; no S3, CDN, or other external asset host is required. The runtime contract has three allowlisted files:

- `/data/kjv-manifest.json` — deterministic schema/version, byte counts, record counts, and SHA-256 integrity values;
- `/data/kjv-bootstrap.json` — Genesis 1 only (about 53 KB), used to make the default reading screen available while hydration continues;
- `/data/kjv.json` — the unchanged canonical 66-book payload and compatibility URL.

The manifest accepts only those fixed same-origin paths. The bootstrap never becomes the authoritative corpus: shared layouts wait for full hydration, search indexing waits for all 66 books, and the full `Book[]` replaces the bootstrap atomically. The full payload continues to be fetched and parsed in a worker with the existing main-thread compatibility fallback.

## Generation

The `build:*` scripts in `package.json` produce Bible and reference artifacts. `npm run build:data` regenerates the canonical corpus and then its runtime bootstrap/manifest; `npm run build:data-manifest` refreshes only the two derived runtime files when `public/data/kjv.json` is already current. Run the narrow generator for the data being changed, review record counts and diff size, then run the full verification sequence in `docs/release.md`. Generators must use bounded inputs, deterministic ordering, and atomic output replacement. Networked generators must validate allowed origins, redirects, response types/sizes, and output containment.

## Offline lifecycle

`public/app-cache-config.js` is the single cache-name/version source shared by the application and service worker. The current cache is `kjv-only-cache-v8`, which includes the local corpus manifest, bootstrap, and generated production asset manifest in the core offline package. The build writes `app-shell-assets.json` from the exact hashed files in `dist/assets`; the service worker caches the startup subset, while an explicit Core Bible Data download caches the complete generated shell so lazy tools remain available after an offline reload. Increment the cache version whenever the application shell or cache contract becomes incompatible. Old caches are deleted only when their name starts with `kjv-only-cache-`; caches and service workers owned by other same-origin applications are untouched.

An updated worker precaches its complete shell and then waits while an existing worker controls an open page. The application shows an update-ready notice and activates the waiting worker only after the user chooses to update; activation then reloads every open KJV Only window once so no tab remains paired with the obsolete shell. A first installation still activates normally when no preceding worker exists. This prevents an open session from silently losing the cache that matches its loaded JavaScript.

The Download page reports the configured, active, and waiting cache versions, connection/control state, update state, and app-owned cache count. Its repair action requires a network connection, unregisters only the same-origin `/sw.js` registration, deletes only caches beginning with `kjv-only-cache-`, and then reloads. Notes and bookmarks are not repair targets, and their export actions are surfaced before repair as an additional safeguard. Because the optional offline bundles share the app cache, a repair also removes downloaded Bible data, maps, and audio; the confirmation states that those bundles must be downloaded again.

Core references, maps, and Old/New Testament audio remain separate user-selected packages. Cache only complete HTTP 200 responses; range responses stay network-only. A release changing cache behavior must test install, refresh, offline navigation, partial failure, clear, and upgrade from the preceding cache version.

## Deployment controls

`npm run build` performs type checking, builds only allowlisted assets, and runs `scripts/check-dist.mjs`. The check also verifies the bootstrap/full byte counts and SHA-256 values against the manifest, and fails on missing core assets, forbidden intermediates, excessive file/byte counts, or entry JS/CSS regressions. `public/_headers` supplies a restrictive CSP, HSTS, MIME sniffing protection, referrer and permissions policies, COOP, and cache rules for hosts that support this file format. Equivalent headers must be configured explicitly on other hosts; Amplify-side header/deploy configuration remains an explicit operator task.

Audio and maps dominate repository/deploy size. They intentionally remain local for now. Any future move to release artifacts, object storage, a CDN, or Git LFS is a separately approved operational migration: retain current URLs through a mapping layer, record integrity hashes, test offline-package parity, and establish rollback before removing local copies or rewriting Git history.
