#!/usr/bin/env node

import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const DATA_DIRECTORY = path.resolve("public/data")
const FULL_PATH = path.join(DATA_DIRECTORY, "kjv.json")
const BOOTSTRAP_PATH = path.join(DATA_DIRECTORY, "kjv-bootstrap.json")
const MANIFEST_PATH = path.join(DATA_DIRECTORY, "kjv-manifest.json")

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex")
}

function summarize(books) {
  return books.reduce(
    (summary, book) => {
      summary.bookCount += 1
      summary.chapterCount += book.chapters.length
      summary.verseCount += book.chapters.reduce(
        (total, chapter) => total + chapter.verses.length,
        0,
      )
      return summary
    },
    { bookCount: 0, chapterCount: 0, verseCount: 0 },
  )
}

async function writeAtomically(filePath, contents) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`
  try {
    await fs.writeFile(temporaryPath, contents)
    await fs.rename(temporaryPath, filePath)
  } catch (error) {
    await fs.rm(temporaryPath, { force: true })
    throw error
  }
}

const fullBuffer = await fs.readFile(FULL_PATH)
const fullPayload = JSON.parse(fullBuffer.toString("utf8"))
const books = Array.isArray(fullPayload) ? fullPayload : fullPayload?.books
if (!Array.isArray(books) || books.length !== 66) {
  throw new Error("public/data/kjv.json must contain the canonical 66 books")
}
const genesis = books[0]
if (
  !genesis ||
  genesis.name !== "Genesis" ||
  !Array.isArray(genesis.chapters) ||
  genesis.chapters[0]?.chapter !== 1 ||
  !Array.isArray(genesis.chapters[0]?.verses) ||
  genesis.chapters[0].verses.length !== 31
) {
  throw new Error("public/data/kjv.json must begin with canonical Genesis 1")
}

const fullSummary = summarize(books)
if (
  fullSummary.bookCount !== 66 ||
  fullSummary.chapterCount !== 1189 ||
  fullSummary.verseCount !== 31102
) {
  throw new Error("public/data/kjv.json must contain the complete KJV corpus")
}

const bootstrapBooks = [
  {
    ...genesis,
    chapters: [genesis.chapters[0]],
  },
]
const bootstrapSummary = summarize(bootstrapBooks)
const bootstrapBuffer = Buffer.from(
  JSON.stringify({
    metadata: {
      source: "KJV runtime bootstrap",
      ...bootstrapSummary,
    },
    books: bootstrapBooks,
  }),
)
const fullHash = sha256(fullBuffer)
const bootstrapHash = sha256(bootstrapBuffer)
const manifest = {
  schemaVersion: 1,
  corpusVersion: `sha256-${fullHash.slice(0, 16)}`,
  bootstrap: {
    url: "/data/kjv-bootstrap.json",
    sha256: bootstrapHash,
    bytes: bootstrapBuffer.byteLength,
    ...bootstrapSummary,
  },
  full: {
    url: "/data/kjv.json",
    sha256: fullHash,
    bytes: fullBuffer.byteLength,
    ...fullSummary,
  },
}

await writeAtomically(BOOTSTRAP_PATH, bootstrapBuffer)
await writeAtomically(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`)

console.log(
  JSON.stringify(
    {
      corpusVersion: manifest.corpusVersion,
      bootstrapBytes: manifest.bootstrap.bytes,
      fullBytes: manifest.full.bytes,
    },
    null,
    2,
  ),
)
