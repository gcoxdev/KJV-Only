# KJV Only

`KJV Only` is a React + Vite Bible reader focused on the King James Bible, study workflow, and offline use.

## Current App State

The application currently includes:

- Multi-tab, multi-panel Bible reading and study workspace
- Quick Open command palette for opening books, chapters, verses, and ranges from one input
- Full search page with multiple search modes
- Strong's, concordance, cross references, dictionaries, genealogy, maps, topics, and related study data
- Bible audio support
- Local-first notes and bookmarks with import/export support
- Reading progress tracker and related reading workflow features
- Settings for theme, layout, reading display, and other application behavior
- Desktop-friendly and mobile-friendly interface
- Installable PWA behavior and offline download bundles

In Topics, everyday phrases such as `feeling afraid`, `need direction`, and `how to forgive` link to curated existing topics. Related matches are labeled with the phrase that found them; **Clear letter filters** removes letter restrictions while keeping your search. Genealogy search results show recorded family relationships and a name reference; references are name matches and can include different people with the same name.

Map dialogs offer **Search this area** in both renderers. Results use the local geometry bounds and can open a place or linked passage. Filter the results by place name (including alternate names) and recorded place type; **Clear filters** restores all results in the searched area. Hide the results to explore the full map, then search again after moving or zooming. Bounds are approximate and can include areas whose outline extends beyond the view; entries without usable geometry are excluded. Run `npm run build:maps` after updating the map sources or geometry to regenerate the bounds index.

## Tech Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Base UI
- Lexical
- Leaflet / React Leaflet

## Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

Refresh the local runtime corpus manifest/bootstrap from an existing canonical corpus:

```bash
npm run build:data-manifest
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

Run the complete local verification gates:

```bash
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

Maintainer documentation lives in [`docs/architecture.md`](docs/architecture.md), [`docs/data-and-deployment.md`](docs/data-and-deployment.md), and [`docs/release.md`](docs/release.md). Security reports should follow [`SECURITY.md`](SECURITY.md).
