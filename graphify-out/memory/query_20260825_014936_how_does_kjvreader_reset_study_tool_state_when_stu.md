---
type: "query"
date: "2026-08-25T01:49:36.399886+00:00"
question: "How does KJVReader reset study tool state when study mode closes, and which hooks own those setters?"
contributor: "graphify"
source_nodes: ["KJVReader()", "useConcordanceCrossRefsTool()", "useDictionarySearchTool()", "useStrongsSearchTool()", "useGenealogySearchTool()", "useMapsSearchTool()", "study-tool-reset.test.ts"]
---

# Q: How does KJVReader reset study tool state when study mode closes, and which hooks own those setters?

## Answer

The graph shows KJVReader as the reset orchestration hub across useConcordanceCrossRefsTool, useDictionarySearchTool, useStrongsSearchTool, useGenealogySearchTool, useMapsSearchTool, useMapDialogState, and reader shell state. The tool hooks own the individual loading, searching, error, and selection setters, while KJVReader currently aggregates those setters into one teardown effect. The safest structural boundary is to give each hook a stable transient-reset callback and let a small study-mode lifecycle hook invoke those existing reset contracts without changing search terms, loaded payloads, or the current subset of accordion resets.

## Source Nodes

- KJVReader()
- useConcordanceCrossRefsTool()
- useDictionarySearchTool()
- useStrongsSearchTool()
- useGenealogySearchTool()
- useMapsSearchTool()
- study-tool-reset.test.ts