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
execFileSync("magick", [...crop, "-resize", "320x320", "-background", "#F5F2EC", "-gravity", "center", "-extent", "512x512", "-alpha", "remove", "-alpha", "off", "-strip", fileURLToPath(new URL("app-icon-maskable.png", output))]);

// Preserve the established SVG URL for older callers and the offline fallback.
// This is a self-contained raster wrapper, not a vector tracing of the artwork.
const png = await readFile(new URL("app-icon.png", output));
await writeFile(new URL("app-icon.svg", output), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" role="img" aria-label="KJV Only — Leather Classic Bible logo">\n  <image width="192" height="192" href="data:image/png;base64,${png.toString("base64")}" />\n</svg>\n`);
console.log("Exported Leather Classic app, browser, Apple, and maskable icons.");
