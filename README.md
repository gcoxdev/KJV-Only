# KJV Only

React + Vite + shadcn-based KJV Bible reader scaffold with:
- offline-capable PWA shell
- red-letter rendering for words of Jesus
- Strong's token support
- SQLite data model for advanced search work

## Data Pipeline (SWORD/OSIS -> SQLite + JSON)

1. Put your OSIS XML source at:
   - `data-source/kjv.osis.xml`
2. Build data artifacts:
   - `npm run build:data`
3. Generated outputs:
   - `public/data/kjv.sqlite`
   - `public/data/kjv.json`

The reader loads `/data/kjv.json` when present. If not found, it falls back to the sample dataset in `src/data/kjv-sample.ts`.

## App Commands

- `npm run dev`: start local dev server
- `npm run build:data`: generate SQLite + reader JSON from OSIS
- `npm run build`: compile frontend
- `npm run build:all`: generate data then compile frontend

## SQLite Schema

Generated DB tables:
- `books`
- `chapters`
- `verses`
- `tokens`
- `verse_fts` (FTS5 full-text index)

This prepares the project for advanced verse/token/Strong's search features.

## Offline Support

PWA files:
- `public/manifest.webmanifest`
- `public/sw.js`
- service worker registration in `src/lib/register-sw.ts`

The service worker caches app shell assets and runtime same-origin requests.
