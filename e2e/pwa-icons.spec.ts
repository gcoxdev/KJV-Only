import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

for (const size of [192, 512]) {
  test(`desktop installation icon fills its canvas without an opaque background at ${size}px`, async ({ page, request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    const icon = manifest.icons.find((icon: { sizes: string; purpose: string }) => icon.sizes === `${size}x${size}` && icon.purpose === "any");
    expect(icon).toBeDefined();
    await page.goto("/icons/favicon.png");
    const measurements = await page.evaluate(async src => {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Missing desktop asset: ${src}`);
      const bitmap = await createImageBitmap(await response.blob());
      const measure = (size: number) => {
        const canvas = new OffscreenCanvas(size, size);
        const context = canvas.getContext("2d")!;
        context.drawImage(bitmap, 0, 0, size, size);
        const pixels = context.getImageData(0, 0, size, size).data;
        let minY = size;
        let maxY = -1;
        for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
          if (pixels[(y * size + x) * 4 + 3] > 32) {
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
        const corners = [0, size - 1, size * (size - 1), size * size - 1].map(index => pixels[index * 4 + 3]);
        return { minY, maxY, height: maxY - minY + 1, size, corners };
      };
      const result = { dimensions: [bitmap.width, bitmap.height], native: measure(bitmap.width), taskbar: [16, 24, 32, 48].map(measure) };
      bitmap.close();
      return result;
    }, icon.src);
    expect(measurements.dimensions).toEqual([size, size]);
    expect(measurements.native.height / size).toBeGreaterThan(0.95);
    expect(measurements.native.minY).toBeGreaterThan(0);
    expect(measurements.native.maxY).toBeLessThan(size - 1);
    for (const image of [measurements.native, ...measurements.taskbar]) {
      expect(image.corners).toEqual([0, 0, 0, 0]);
      expect(image.height / image.size).toBeGreaterThan(0.9);
    }
  });

  test(`launcher icon balances book size and Android/PWA safe areas at ${size}px`, async ({ page, request }) => {
    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBe(true);
    const manifest = await manifestResponse.json();
    const icons = manifest.icons as { src: string; sizes: string; purpose: string }[];
    expect(icons.every(icon => ["any", "maskable"].includes(icon.purpose))).toBe(true);
    const launcher = icons.find(icon => icon.sizes === `${size}x${size}` && icon.purpose === "maskable");
    const general = icons.find(icon => icon.sizes === `${size}x${size}` && icon.purpose === "any");
    expect(launcher).toBeDefined();
    expect(general).toBeDefined();
    expect(launcher!.src).not.toBe(general!.src);

    // An image document provides the actual preview origin without loading the reader.
    await page.goto("/icons/favicon.png");
    const measurements = await page.evaluate(async ({ src, expectedSize }) => {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Missing launcher asset: ${src}`);
      const bitmap = await createImageBitmap(await response.blob());
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext("2d")!;
      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
      let visible = 0;
      let androidClipped = 0;
      let pwaClipped = 0;
      let transparent = 0;
      let background = 0;
      let minY = expectedSize;
      let maxY = 0;
      for (let y = 0; y < bitmap.height; y++) {
        for (let x = 0; x < bitmap.width; x++) {
          const offset = (y * bitmap.width + x) * 4;
          const alpha = pixels[offset + 3];
          if (alpha !== 255) transparent++;
          if (pixels[offset] === 245 && pixels[offset + 1] === 245 && pixels[offset + 2] === 244) {
            background++;
            continue;
          }
          visible++;
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          // Separate native Android (66/108 diameter) and PWA (80% diameter)
          // checks. Include every foreground pixel, plus one pixel of clearance.
          // https://developer.android.com/develop/ui/compose/system/icon_design_adaptive
          const radius = Math.hypot(x + 0.5 - bitmap.width / 2, y + 0.5 - bitmap.height / 2) + 1;
          if (radius > expectedSize * 33 / 108) androidClipped++;
          if (radius > expectedSize * 0.4) pwaClipped++;
        }
      }
      const dimensions = [bitmap.width, bitmap.height];
      bitmap.close();
      return { dimensions, visible, androidClipped, pwaClipped, transparent, background, height: maxY - minY + 1 };
    }, { src: launcher!.src, expectedSize: size });
    expect(measurements.dimensions).toEqual([size, size]);
    expect(measurements.visible).toBeGreaterThan(size * size * 0.08);
    expect(measurements.transparent).toBe(0);
    expect(measurements.background).toBeGreaterThan(size * size * 0.8);
    // Guard against solving clipping by making the artwork unnecessarily small.
    expect(measurements.height / size).toBeGreaterThanOrEqual(0.47);
    expect(measurements.height / size).toBeLessThanOrEqual(0.5);
    expect(measurements.androidClipped).toBe(0);
    expect(measurements.pwaClipped).toBe(0);
  });
}
