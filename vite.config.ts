import path from "path"
import { constants } from "node:fs"
import fs from "node:fs/promises"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import sirv from "sirv"
import { defineConfig, type Connect, type Plugin } from "vite"

const RUNTIME_PUBLIC_ENTRIES = [
  "_headers",
  "app-cache-config.js",
  "audio",
  "data",
  "icons",
  "manifest.webmanifest",
  "maps",
  "other",
  "references",
  "sw.js",
  "topics",
] as const

const EXACT_RUNTIME_ASSETS = new Set([
  "_headers",
  "app-cache-config.js",
  "data/kjv.json",
  "icons/app-icon.svg",
  "manifest.webmanifest",
  "maps/data/map.json",
  "other/paypal-donate-qr.svg",
  "references/ai-dictionary.json",
  "references/bible-word-book.json",
  "references/concordance.compact.delta.min.json",
  "references/cross-refs.json",
  "references/genealogy.compact.min.json",
  "references/hitchcocks.json",
  "references/old-english.json",
  "references/phrases.json",
  "references/strongs-greek.compact.min.json",
  "references/strongs-hebrew.compact.min.json",
  "references/units.json",
  "references/websters.json",
  "sw.js",
  "topics/daily-scripture-topics.json",
  "topics/topics-index.json",
])

function isAllowedRuntimeFile(relative: string) {
  return (
    EXACT_RUNTIME_ASSETS.has(relative) ||
    /^audio\/[A-Z0-9]{2,4}\.\d{1,3}\.mp3$/.test(relative) ||
    /^icons\/(?:bw|color)\/[A-Za-z0-9][A-Za-z0-9._-]{0,99}\.png$/.test(
      relative,
    ) ||
    /^maps\/geometry\/[A-Za-z0-9][A-Za-z0-9._-]{0,199}\.geojson$/.test(
      relative,
    ) ||
    /^maps\/thumbnails\/[A-Za-z0-9][A-Za-z0-9._-]{0,199}\.(?:jpe?g|png|webp)$/i.test(
      relative,
    )
  )
}

function runtimePublicAssets(): Plugin {
  let outputDirectory = path.resolve(__dirname, "dist")
  const publicDirectory = path.resolve(__dirname, "public")
  const serveRuntimeAssets = sirv(publicDirectory, {
    dev: true,
    etag: true,
    single: false,
  })

  function isRuntimeAssetRequest(requestUrl: string | undefined) {
    if (!requestUrl) return false

    try {
      const pathname = decodeURIComponent(
        new URL(requestUrl, "http://runtime-assets.local").pathname,
      )
      const relative = pathname.replace(/^\/+/, "")
      return isAllowedRuntimeFile(relative)
    } catch {
      return false
    }
  }

  function installRuntimeAssetMiddleware(middlewares: Connect.Server) {
    middlewares.use((request, response, next) => {
      if (!isRuntimeAssetRequest(request.url)) {
        next()
        return
      }
      serveRuntimeAssets(request, response, next)
    })
  }

  async function collectCopyTasks(
    source: string,
    destination: string,
    tasks: Array<{ source: string; destination: string }>,
  ) {
    const relative = path
      .relative(publicDirectory, source)
      .split(path.sep)
      .join("/")
    const stats = await fs.lstat(source)
    if (stats.isSymbolicLink()) {
      throw new Error(`Runtime public assets may not contain symlinks: ${relative}`)
    }
    if (stats.isDirectory()) {
      const entries = await fs.readdir(source)
      await Promise.all(
        entries.map((entry) =>
          collectCopyTasks(
            path.join(source, entry),
            path.join(destination, entry),
            tasks,
          ),
        ),
      )
      return
    }
    if (stats.isFile() && isAllowedRuntimeFile(relative)) {
      tasks.push({ source, destination })
    }
  }

  async function copyRuntimeEntries() {
    const tasks: Array<{ source: string; destination: string }> = []
    await Promise.all(
      RUNTIME_PUBLIC_ENTRIES.map((entry) =>
        collectCopyTasks(
          path.join(publicDirectory, entry),
          path.join(outputDirectory, entry),
          tasks,
        ),
      ),
    )

    const pending = [...tasks]
    const concurrency = Math.min(32, pending.length)
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        for (;;) {
          const task = pending.pop()
          if (!task) return
          await fs.mkdir(path.dirname(task.destination), { recursive: true })
          await fs.copyFile(
            task.source,
            task.destination,
            constants.COPYFILE_FICLONE,
          )
        }
      }),
    )
  }

  return {
    name: "runtime-public-assets",
    configureServer(server) {
      installRuntimeAssetMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      installRuntimeAssetMiddleware(server.middlewares)
    },
    configResolved(config) {
      outputDirectory = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyRuntimeEntries()
    },
  }
}

export default defineConfig({
  publicDir: false,
  plugins: [react(), tailwindcss(), runtimePublicAssets()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(moduleId) {
          const id = moduleId.split(path.sep).join("/")
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react-vendor"
          }
          if (
            id.includes("/node_modules/@base-ui/") ||
            id.includes("/node_modules/lucide-react/") ||
            id.includes("/node_modules/cmdk/") ||
            id.includes("/node_modules/sonner/")
          ) {
            return "ui-vendor"
          }
          if (id.includes("/node_modules/@lexical/") || id.includes("/node_modules/lexical/")) {
            return "editor-vendor"
          }
          if (
            id.includes("/node_modules/leaflet/") ||
            id.includes("/node_modules/react-leaflet/")
          ) {
            return "maps-vendor"
          }
          return undefined
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
