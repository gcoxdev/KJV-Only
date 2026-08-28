---
type: "query"
date: "2026-08-28T04:31:49.027207+00:00"
question: "Trace Smart Search for a single word from prepareSmartSearch through candidate lookup, phonetic/prefix matching, isSmartSearchCandidate, and scorePreparedSmartSearch. Explain why predestinate can match protest, protection, protested, and pouredst, and identify a minimal seam to tighten single-word queries without changing multi-word ranking or exact inflection matches."
contributor: "graphify"
outcome: "corrected"
source_nodes: ["prepareSmartSearch()", "phoneticCode()", "isSmartSearchCandidate()", "scorePreparedSmartSearch()"]
---

# Q: Trace Smart Search for a single word from prepareSmartSearch through candidate lookup, phonetic/prefix matching, isSmartSearchCandidate, and scorePreparedSmartSearch. Explain why predestinate can match protest, protection, protested, and pouredst, and identify a minimal seam to tighten single-word queries without changing multi-word ranking or exact inflection matches.

## Answer

Smart Search assigned every equal phonetic code a fixed 0.76 similarity. Predestinate and the reported false positives share P6323, so they passed both candidate selection and the 2.75 single-word scoring cutoff despite weak spelling overlap. The fix adds a single-word-only normalized edit-similarity floor of 0.60 at indexed candidate selection, entry candidate filtering, and scoring, while preserving exact and prefix matches such as predestinated. Multi-word queries keep the existing fuzzy behavior.

## Outcome

- Signal: corrected

## Source Nodes

- prepareSmartSearch()
- phoneticCode()
- isSmartSearchCandidate()
- scorePreparedSmartSearch()