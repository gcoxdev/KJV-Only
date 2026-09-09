import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Mechanical size exports of the transparent artwork; no regeneration or retouching.
const source = fileURLToPath(new URL("../assets/branding/leather-classic.png", import.meta.url));
const output = new URL("../public/icons/", import.meta.url);
await mkdir(output, { recursive: true });

const opaque = execFileSync("magick", ["identify", "-format", "%[opaque]", source], { encoding: "utf8" }).trim().toLowerCase();
if (opaque !== "false") {
  throw new Error("The logo source must have real transparency before exporting icons.");
}

const crop = [source, "-trim", "+repage"];
// A portrait export avoids adding a square canvas around the in-app book logo.
execFileSync("magick", [...crop, "-resize", "x190", "-bordercolor", "none", "-border", "1", "-strip", fileURLToPath(new URL("app-logo.png", output))]);

for (const [name, size] of [
  ["app-icon.png", 192],
  ["app-icon-512.png", 512],
  ["apple-touch-icon.png", 180],
  ["favicon.png", 64],
]) {
  const inset = Math.max(1, Math.round(size * 0.01));
  const artworkSize = size - inset * 2;
  execFileSync("magick", [...crop, "-resize", `${artworkSize}x${artworkSize}`, "-background", "none", "-gravity", "center", "-extent", `${size}x${size}`, "-strip", fileURLToPath(new URL(name, output))]);
}

// Keep the complete book inside the maskable icon's central safe area.
execFileSync("magick", [...crop, "-resize", "320x320", "-background", "none", "-gravity", "center", "-extent", "512x512", "-strip", fileURLToPath(new URL("app-icon-maskable.png", output))]);

// Legacy padded exports retained for older cached manifests. The current
// manifest uses app-icon.png/app-icon-512.png for desktop installation so the
// book fills the taskbar icon; Android keeps the separate maskable exports.
for (const size of [192, 512]) {
  const artworkSize = Math.round(size * 0.6);
  execFileSync("magick", [...crop, "-resize", `${artworkSize}x${artworkSize}`, "-background", "none", "-gravity", "center", "-extent", `${size}x${size}`, "-strip", fileURLToPath(new URL(`pwa-icon-${size}-transparent.png`, output))]);
}

// Separate adaptive launcher exports: 48% height leaves 26% padding per side.
// Keep the whole portrait book inside Android's 66/108 safe-circle diameter,
// as well as the PWA's 80% safe circle. Grid/app-size changes scale the icon;
// they do not require stacking another crop on top of both safe-area checks.
// An opaque light background prevents Android choosing a black mask background.
for (const size of [192, 512]) {
  const artworkSize = Math.round(size * 0.48);
  execFileSync("magick", [...crop, "-resize", `${artworkSize}x${artworkSize}`, "-background", "#f5f5f4", "-gravity", "center", "-extent", `${size}x${size}`, "-alpha", "remove", "-alpha", "off", "-strip", fileURLToPath(new URL(`pwa-icon-${size}-maskable-v2.png`, output))]);
}

// Preserve the established SVG URL for older callers and the offline fallback.
// This is a self-contained raster wrapper, not a vector tracing of the artwork.
const png = await readFile(new URL("app-icon.png", output));
await writeFile(new URL("app-icon.svg", output), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="KJV Only — Leather Classic Bible logo">\n  <image width="192" height="192" href="data:image/png;base64,${png.toString("base64")}" />\n</svg>\n`);
console.log("Exported Leather Classic app, browser, Apple, and padded PWA icons.");
