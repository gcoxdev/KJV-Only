const DEFAULT_HIGHLIGHT_COLOR = "#fafac5";

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  if (!/^[\da-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function channelToLinear(value: number) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }) {
  return (
    0.2126 * channelToLinear(rgb.r) +
    0.7152 * channelToLinear(rgb.g) +
    0.0722 * channelToLinear(rgb.b)
  );
}

function contrastRatio(a: number, b: number) {
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function defaultHighlightColor() {
  return DEFAULT_HIGHLIGHT_COLOR;
}

export function normalizeHighlightColor(value: string | null | undefined) {
  if (!value) {
    return DEFAULT_HIGHLIGHT_COLOR;
  }

  const normalized = value.trim();
  return /^#[\da-fA-F]{6}$/.test(normalized)
    ? normalized.toLowerCase()
    : DEFAULT_HIGHLIGHT_COLOR;
}

export function readableHighlightTextColor(highlightColor: string) {
  const rgb = hexToRgb(highlightColor);
  if (!rgb) {
    return "#111111";
  }

  const luminance = relativeLuminance(rgb);
  const blackContrast = contrastRatio(luminance, 0);
  const whiteContrast = contrastRatio(luminance, 1);
  return blackContrast >= whiteContrast ? "#111111" : "#ffffff";
}
