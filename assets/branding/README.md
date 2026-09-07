# Main logo

`leather-classic.png` is the transparent version of the approved Leather Classic v2 artwork. It depicts a terracotta Bible with a gold cross, ivory KJV lettering, and a compact bottom page block. The background was removed with the built-in image generation tool; the final prompt is saved in `transparency-prompt.txt`.

The production PNG exports live in `public/icons/`. Regenerate them with `npm run build:icons` (requires ImageMagick 7 and its `magick` command). Normal app builds use the checked-in exports and do not require ImageMagick or the ignored `design/` folder.

The tightly cropped portrait `app-logo.png` is used inside the app, including its loading screen. The manifest uses `pwa-icon-192-transparent.png` and `pwa-icon-512-transparent.png` for installation and the PWA splash screen. These leave 20% transparent padding above and below the book so the complete artwork fits inside the maskable safe circle. The retained `app-icon-maskable.png` also has a transparent background and a safe inset. Android may supply its own background when applying an icon mask; no export includes a baked-in pearl background.

The original square `app-icon.png` and `app-icon-512.png`, the 180px Apple home-screen icon, and the 64px favicon retain their minimal transparent padding. `app-icon.svg` is a self-contained PNG wrapper retaining the established URL for older callers and the offline fallback.
