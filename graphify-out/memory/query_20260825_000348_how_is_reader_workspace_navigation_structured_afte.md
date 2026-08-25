---
type: "query"
date: "2026-08-25T00:03:48.255780+00:00"
question: "How is reader workspace navigation structured after Phase 5?"
contributor: "graphify"
source_nodes: ["KJVReader()", "useWorkspaceNavigation()", "usePanelRouting()", "usePendingReaderScroll()"]
---

# Q: How is reader workspace navigation structured after Phase 5?

## Answer

KJVReader composes useWorkspaceNavigation for tab and tool orchestration, usePanelRouting for destination policy and targeted routing, and usePendingReaderScroll for DOM scroll retries. Graph degrees are 53, 11, 11, and 8 respectively, showing three focused boundaries around the remaining composition root.

## Source Nodes

- KJVReader()
- useWorkspaceNavigation()
- usePanelRouting()
- usePendingReaderScroll()