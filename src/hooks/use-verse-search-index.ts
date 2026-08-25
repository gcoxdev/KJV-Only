import { useCallback, useEffect, useRef, useState } from "react"

import { beginPerformanceMeasure } from "@/lib/performance"
import type {
  RunSmartVerseSearch,
  SmartVerseSearchCallbacks,
  VerseSearchWorkerRequest,
  VerseSearchWorkerResponse,
} from "@/lib/smart-search-worker"
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
  const workerRef = useRef<Worker | null>(null)
  const nextRequestIdRef = useRef(0)
  const searchCallbacksRef = useRef(
    new Map<number, SmartVerseSearchCallbacks>(),
  )

  const runSmartSearch = useCallback<RunSmartVerseSearch>(
    (request, callbacks) => {
      const worker = workerRef.current
      if (!worker) return null

      const requestId = nextRequestIdRef.current + 1
      nextRequestIdRef.current = requestId
      searchCallbacksRef.current.set(requestId, callbacks)
      try {
        worker.postMessage({
          type: "smart-search",
          requestId,
          ...request,
        } satisfies VerseSearchWorkerRequest)
      } catch {
        searchCallbacksRef.current.delete(requestId)
        return null
      }

      return () => {
        if (!searchCallbacksRef.current.delete(requestId)) return
        if (workerRef.current === worker) {
          worker.postMessage({
            type: "cancel-smart-search",
            requestId,
          } satisfies VerseSearchWorkerRequest)
        }
      }
    },
    [],
  )

  useEffect(() => {
    const searchCallbacks = searchCallbacksRef.current
    if (!enabled || books.length === 0) {
      workerRef.current = null
      searchCallbacks.clear()
      setState(EMPTY_STATE)
      return
    }

    let cancelled = false
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null
    let worker: Worker | null = null
    let isWorkerReady = false
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
      worker?.terminate()
      worker = null
      workerRef.current = null
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
      workerRef.current = worker
      worker.addEventListener(
        "message",
        (event: MessageEvent<VerseSearchWorkerResponse>) => {
          const response = event.data
          if (response.type === "index-ready") {
            isWorkerReady = true
            complete(response.index)
            return
          }
          if (response.type === "index-error") {
            buildOnMainThread()
            return
          }

          const callbacks = searchCallbacks.get(response.requestId)
          if (!callbacks) return
          if (response.type === "smart-search-error") {
            searchCallbacks.delete(response.requestId)
            callbacks.onError(response.message)
            return
          }
          if (response.isComplete) {
            searchCallbacks.delete(response.requestId)
          }
          callbacks.onUpdate(response)
        },
      )
      worker.addEventListener(
        "error",
        () => {
          worker?.terminate()
          worker = null
          workerRef.current = null
          if (!isWorkerReady) {
            buildOnMainThread()
            return
          }
          for (const callbacks of searchCallbacks.values()) {
            callbacks.onError("The Smart Search worker failed.")
          }
          searchCallbacks.clear()
        },
        { once: true },
      )
      worker.postMessage({
        type: "build-index",
        books,
      } satisfies VerseSearchWorkerRequest)
    }

    return () => {
      cancelled = true
      worker?.terminate()
      if (workerRef.current === worker) {
        workerRef.current = null
      }
      searchCallbacks.clear()
      if (fallbackTimer !== null) clearTimeout(fallbackTimer)
      finishOnce()
    }
  }, [books, enabled])

  return { ...state, runSmartSearch }
}
