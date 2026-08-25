---
type: "query"
date: "2026-08-25T01:22:07.422731+00:00"
question: "How is KJVReader shell lifecycle ownership structured after the Phase 7 refactor?"
contributor: "graphify"
source_nodes: ["KJVReader()", "usePwaInstallation()", "useReaderStartup()", "useGuidedTourController()", "useCompletionCelebration()", "usePanelTransfer()", "reader-shell-lifecycle.test.ts"]
---

# Q: How is KJVReader shell lifecycle ownership structured after the Phase 7 refactor?

## Answer

KJVReader now coordinates shell composition while focused modules own lifecycle policy. usePwaInstallation owns browser installation state and global PWA listeners; useReaderStartup owns initial-layout and Welcome Home startup transitions; useGuidedTourController owns tour steps and navigation; useCompletionCelebration owns completion-edge detection, verse selection, dialog state, and the confetti timer; usePanelTransfer owns import/export work while ReaderImportControls owns the hidden file inputs and summary dialog. The graph keeps these controllers in KJVReader's community because KJVReader composes them, but exposes each as a distinct source node with independently testable helpers.

## Source Nodes

- KJVReader()
- usePwaInstallation()
- useReaderStartup()
- useGuidedTourController()
- useCompletionCelebration()
- usePanelTransfer()
- reader-shell-lifecycle.test.ts