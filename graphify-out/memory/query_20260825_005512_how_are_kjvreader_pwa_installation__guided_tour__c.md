---
type: "query"
date: "2026-08-25T00:55:12.906382+00:00"
question: "How are KJVReader PWA installation, guided tour, completion celebration, imports, and startup lifecycle effects structured?"
contributor: "graphify"
source_nodes: ["KJVReader()", "CompletionCelebration()", "guided-tour.tsx", "Offline lifecycle", "Startup and search path"]
---

# Q: How are KJVReader PWA installation, guided tour, completion celebration, imports, and startup lifecycle effects structured?

## Answer

The graph identifies KJVReader as the lifecycle ownership hub. CompletionCelebration and guided-tour are already separate presentation modules imported directly by KJVReader, but their state and orchestration remain coupled to the root reader. The safest next boundary is to extract focused controller hooks for PWA listeners, import input handling, guided-tour navigation, and completion celebration while leaving the existing presentation components and triggers intact.

## Source Nodes

- KJVReader()
- CompletionCelebration()
- guided-tour.tsx
- Offline lifecycle
- Startup and search path