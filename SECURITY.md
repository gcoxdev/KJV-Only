# Security Policy

## Supported version

Security fixes are applied to the current `main` branch. This project does not currently maintain older release branches.

## Reporting a vulnerability

Do not publish suspected vulnerabilities, malicious import files, or exploit details in a public issue. Use the repository host's private vulnerability-reporting channel when available, or contact the maintainer privately through the account associated with this repository.

Include the affected revision, reproduction steps, expected impact, browser/operating system, and the smallest safe proof of concept. Remove personal notes, bookmarks, browsing data, and other sensitive content before attaching exports or screenshots.

The maintainer should acknowledge a report within seven days, validate it without exposing user data, and coordinate a fix and disclosure timeline with the reporter.

## Security boundaries

KJV Only is a client-only application: it has no application server, user accounts, or authorization roles in this repository. Security review should still cover:

- imported and persisted notes/bookmarks, including Lexical editor state;
- shared layout URL fragments and all recursive/cardinality limits;
- localStorage and CacheStorage recovery behavior;
- service-worker scope, cache ownership, and offline upgrades;
- same-origin Bible/reference/map/audio data consumed by the browser;
- developer-side data and asset scripts, especially network and filesystem access;
- deployment headers and the explicit runtime-asset allowlist.

Out of scope are vulnerabilities that require changing the bundled KJV/reference corpus in a trusted release without also showing a broken repository boundary. Dependency advisories remain in scope when the vulnerable path is reachable in development, build, or shipped browser code.
