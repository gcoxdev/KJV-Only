---
type: "query"
date: "2026-08-25T00:43:27.335556+00:00"
question: "How is KJVReader render composition structured after Phase 6?"
contributor: "graphify"
source_nodes: ["KJVReader()", "ReaderWorkspacePanels", "areReaderViewModelsEqual()", "useStudyToolsViewModel()", "useSettingsViewModel()", "ReaderPanelTree"]
---

# Q: How is KJVReader render composition structured after Phase 6?

## Answer

KJVReader assembles domain view models and delegates tab mapping to ReaderWorkspacePanels. ReaderWorkspacePanels and ReaderStudySidebar use areReaderViewModelsEqual to skip renders only when plain prop records are semantically equal while arrays, maps, refs, and callbacks retain identity semantics. ReaderPanelTree lazy-loads study tools, topics, bookmarks, settings, and progress, reducing entry JavaScript to 553528 bytes. Graph degrees are KJVReader 55, ReaderWorkspacePanels 2, areReaderViewModelsEqual 5, useStudyToolsViewModel 4, and useSettingsViewModel 5.

## Source Nodes

- KJVReader()
- ReaderWorkspacePanels
- areReaderViewModelsEqual()
- useStudyToolsViewModel()
- useSettingsViewModel()
- ReaderPanelTree