import { useEffect, useState } from "react"

import {
  READER_STORAGE_KEYS,
  readLocalStorageJson,
  reportLocalStorageIssue,
  writeLocalStorageJson,
} from "@/lib/local-storage"
import {
  isReadChaptersPayload,
  parseReadChapters,
} from "@/lib/reader-persistence"

export function useReadChapters() {
  const [readChapters, setReadChapters] = useState(() => {
    const stored = readLocalStorageJson<unknown>(READER_STORAGE_KEYS.readChapters)
    if (stored !== null && !isReadChaptersPayload(stored)) {
      reportLocalStorageIssue(READER_STORAGE_KEYS.readChapters)
    }
    return parseReadChapters(stored)
  })

  useEffect(() => {
    writeLocalStorageJson(
      READER_STORAGE_KEYS.readChapters,
      Array.from(readChapters),
    )
  }, [readChapters])

  return { readChapters, setReadChapters }
}
