# Main logo

`leather-classic.png` is the transparent version of the approved Leather Classic v2 artwork. It depicts a terracotta Bible with a gold cross, ivory KJV lettering, and a compact bottom page block. The background was removed with the built-in image generation tool; the final prompt is saved in `transparency-prompt.txt`.

The production PNG exports live in `public/icons/`. Regenerate them with `npm run build:icons` (requires ImageMagick 7 and its `magick` command). Normal app builds use the checked-in exports and do not require ImageMagick or the ignored `design/` folder.

The tightly cropped portrait `app-logo.png` is used inside the app. Square 192px and 512px exports serve installation, 180px serves Apple home screens, and 64px serves browser tabs. All have actual transparency and minimal padding around the book. The separate Android maskable icon intentionally has an opaque background and a safe inset for platform cropping. `app-icon.svg` is a self-contained PNG wrapper retaining the established URL for older callers and the offline fallback.
