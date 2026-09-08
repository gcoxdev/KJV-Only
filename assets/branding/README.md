# Main logo

`leather-classic.png` is the transparent version of the approved Leather Classic v2 artwork. It depicts a terracotta Bible with a gold cross, ivory KJV lettering, and a compact bottom page block. The background was removed with the built-in image generation tool; the final prompt is saved in `transparency-prompt.txt`.

The production PNG exports live in `public/icons/`. Regenerate them with `npm run build:icons` (requires ImageMagick 7 and its `magick` command). Normal app builds use the checked-in exports and do not require ImageMagick or the ignored `design/` folder.

The tightly cropped portrait `app-logo.png` is used inside the app, including its loading screen. The manifest's general-purpose (`any`) icons remain `pwa-icon-192-transparent.png` and `pwa-icon-512-transparent.png`, with the existing 60% book height for installation and splash screens.

The separate `maskable` entries use `pwa-icon-192-maskable-v2.png` and `pwa-icon-512-maskable-v2.png`. The book occupies 48% of the canvas height, leaving 26% space above and below. Every foreground pixel fits inside both the PWA's 80%-diameter safe circle and [Android's 66/108-diameter safe circle](https://developer.android.com/develop/ui/compose/system/icon_design_adaptive), checked separately with one pixel of clearance. New filenames distinguish them from cached launcher assets. Never combine `any maskable` on the same manifest entry again.

One UI's 4×6 grid does not specify an exact icon pixel size: Samsung also provides an [App size slider](https://www.samsung.com/ie/support/mobile-devices/changes-to-the-home-screen-on-the-samsung-galaxy-devices/). Padding is proportional to the icon, not calculated from screen width divided by four. Native adaptive previews use the central 72/108 viewport; this makes the 48%-height book about 72% of that visible icon height. That is a simulation of native adaptive geometry, not a confirmed description of Brave's conversion or a measurement on the user's Galaxy. Check the actual device after deployment.

Only the new maskable launcher exports have an opaque, light neutral background (`#f5f5f4`), as requested for the phone's icon. Android otherwise supplies its own solid fill for transparent maskable images, which can appear black. See the [manifest mask specification](https://w3c.github.io/manifest/#icon-masks). In-app, general-purpose/splash, browser, and Apple exports retain their existing transparency. The retained `app-icon-maskable.png` is a legacy export, not a current manifest icon.

After deployment, reload the app online to receive the updated manifest. An existing browser-created home-screen shortcut may retain its saved bitmap; remove that shortcut and add it again from the updated app to test. Do not clear site storage, which holds notes and bookmarks.

The original square `app-icon.png` and `app-icon-512.png`, the 180px Apple home-screen icon, and the 64px favicon retain their minimal transparent padding. `app-icon.svg` is a self-contained PNG wrapper retaining the established URL for older callers and the offline fallback.
