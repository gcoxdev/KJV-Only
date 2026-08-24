import { useEffect, useState } from "react"

import { beginPerformanceMeasure } from "@/lib/performance"
import {
  buildVerseSearchIndex,
  type VerseSearchIndexEntry,
} from "@/lib/verse-search-index"
import type { Book } from "@/types/bible"

type VerseSearchIndexState = {
  index: VerseSearchIndexEntry[]
  isBuilding: boolean
  isReady: boolean
  error: string | null
}

const EMPTY_STATE: VerseSearchIndexState = {
  index: [],
  isBuilding: false,
  isReady: false,
  error: null,
}

export function useVerseSearchIndex(books: Book[], enabled: boolean) {
  const [state, setState] = useState<VerseSearchIndexState>(EMPTY_STATE)

  useEffect(() => {
    if (!enabled || books.length === 0) {
      setState(EMPTY_STATE)
      return
    }

    let cancelled = false
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null
    let worker: Worker | null = null
    const finishMeasure = beginPerformanceMeasure("kjv:search-index-build")
    let didFinishMeasure = false
    const finishOnce = () => {
      if (didFinishMeasure) return
      didFinishMeasure = true
      finishMeasure()
    }

    setState({ index: [], isBuilding: true, isReady: false, error: null })

    const complete = (index: VerseSearchIndexEntry[]) => {
      finishOnce()
      if (!cancelled) {
        setState({ index, isBuilding: false, isReady: true, error: null })
      }
    }

    const fail = (error: unknown) => {
      finishOnce()
      if (!cancelled) {
        setState({
          index: [],
          isBuilding: false,
          isReady: false,
          error:
            error instanceof Error
              ? error.message
              : "Could not prepare Bible search.",
        })
      }
    }

    const buildOnMainThread = () => {
      if (cancelled) return
      fallbackTimer = setTimeout(() => {
        try {
          complete(buildVerseSearchIndex(books))
        } catch (error) {
          fail(error)
        }
      }, 0)
    }

    if (typeof Worker !== "function") {
      buildOnMainThread()
    } else {
      worker = new Worker(
        new URL("../workers/verse-search-index.worker.ts", import.meta.url),
        { type: "module" },
      )
      worker.addEventListener(
        "message",
        (
          event: MessageEvent<{
            index?: VerseSearchIndexEntry[]
            error?: string
          }>,
        ) => {
          worker?.terminate()
          worker = null
          if (event.data.index) {
            complete(event.data.index)
            return
          }
          buildOnMainThread()
        },
        { once: true },
      )
      worker.addEventListener(
        "error",
        () => {
          worker?.terminate()
          worker = null
          buildOnMainThread()
        },
        { once: true },
      )
      worker.postMessage({ books })
    }

    return () => {
      cancelled = true
      worker?.terminate()
      if (fallbackTimer !== null) clearTimeout(fallbackTimer)
      finishOnce()
    }
  }, [books, enabled])

  return state
}
