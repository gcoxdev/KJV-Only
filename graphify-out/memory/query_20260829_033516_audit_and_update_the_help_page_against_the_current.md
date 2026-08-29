---
type: "query"
date: "2026-08-29T03:35:16.727377+00:00"
question: "Audit and update the Help page against the current user-facing application"
contributor: "graphify"
source_nodes: ["help-page.tsx", "search-page.tsx", "download-page.tsx", "settings-dialog.tsx", "reader-panel-tree.tsx"]
---

# Q: Audit and update the Help page against the current user-facing application

## Answer

The Help page was audited against current reader navigation, search, PWA recovery, settings, notes, bookmarks, audio, and static pages. It was stale in startup ordering, Panel Home destinations, Topics and Other tabs, and omitted Quick Open, tab and panel reordering, audio controls, saved and recent searches, exact phrase and case options, result tools, URL search definitions, controlled PWA updates, production offline testing, and cache recovery. The Help content and search accessibility labels were updated, and a render regression test was added.

## Source Nodes

- help-page.tsx
- search-page.tsx
- download-page.tsx
- settings-dialog.tsx
- reader-panel-tree.tsx