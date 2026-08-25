import type { PanelDirection, PanelNode } from "@/types/reader";
import { collectLeafIds } from "@/lib/reader-layout";

export type LeafRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LeafNeighbors = Partial<Record<PanelDirection, string>>;

export function leafIdsAtGroupEdge(
  leafIds: string[],
  rects: ReadonlyMap<string, LeafRect>,
  direction: PanelDirection,
  epsilon = 0.5,
) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const leafId of leafIds) {
    const rect = rects.get(leafId);
    if (!rect) {
      continue;
    }
    minX = Math.min(minX, rect.x);
    maxX = Math.max(maxX, rect.x + rect.width);
    minY = Math.min(minY, rect.y);
    maxY = Math.max(maxY, rect.y + rect.height);
  }

  if (!Number.isFinite(minX)) {
    return [];
  }

  return leafIds.filter((leafId) => {
    const rect = rects.get(leafId);
    if (!rect) {
      return false;
    }
    if (direction === "left") {
      return Math.abs(rect.x - minX) <= epsilon;
    }
    if (direction === "right") {
      return Math.abs(rect.x + rect.width - maxX) <= epsilon;
    }
    if (direction === "up") {
      return Math.abs(rect.y - minY) <= epsilon;
    }
    return Math.abs(rect.y + rect.height - maxY) <= epsilon;
  });
}

function collectLeafRects(
  node: PanelNode,
  x: number,
  y: number,
  width: number,
  height: number,
  rects: Map<string, LeafRect>,
) {
  if (node.type === "leaf") {
    rects.set(node.id, { x, y, width, height });
    return;
  }

  const ratio = Math.min(90, Math.max(10, node.ratio)) / 100;
  if (node.orientation === "horizontal") {
    const firstWidth = width * ratio;
    collectLeafRects(node.first, x, y, firstWidth, height, rects);
    collectLeafRects(
      node.second,
      x + firstWidth,
      y,
      width - firstWidth,
      height,
      rects,
    );
    return;
  }

  const firstHeight = height * ratio;
  collectLeafRects(node.first, x, y, width, firstHeight, rects);
  collectLeafRects(
    node.second,
    x,
    y + firstHeight,
    width,
    height - firstHeight,
    rects,
  );
}

function overlapSize(startA: number, endA: number, startB: number, endB: number) {
  return Math.max(0, Math.min(endA, endB) - Math.max(startA, startB));
}

function neighborForDirection(
  sourceId: string,
  direction: PanelDirection,
  rects: Map<string, LeafRect>,
) {
  const source = rects.get(sourceId);
  if (!source) {
    return null;
  }

  const epsilon = 0.001;
  let bestId: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestOverlap = -1;

  for (const [candidateId, rect] of rects.entries()) {
    if (candidateId === sourceId) {
      continue;
    }

    let distance: number;
    let overlap: number;

    if (direction === "left") {
      if (rect.x + rect.width > source.x + epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.y,
        source.y + source.height,
        rect.y,
        rect.y + rect.height,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = source.x - (rect.x + rect.width);
    } else if (direction === "right") {
      if (rect.x < source.x + source.width - epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.y,
        source.y + source.height,
        rect.y,
        rect.y + rect.height,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = rect.x - (source.x + source.width);
    } else if (direction === "up") {
      if (rect.y + rect.height > source.y + epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.x,
        source.x + source.width,
        rect.x,
        rect.x + rect.width,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = source.y - (rect.y + rect.height);
    } else {
      if (rect.y < source.y + source.height - epsilon) {
        continue;
      }
      overlap = overlapSize(
        source.x,
        source.x + source.width,
        rect.x,
        rect.x + rect.width,
      );
      if (overlap <= 0) {
        continue;
      }
      distance = rect.y - (source.y + source.height);
    }

    if (
      distance < bestDistance - epsilon ||
      (Math.abs(distance - bestDistance) <= epsilon && overlap > bestOverlap)
    ) {
      bestDistance = distance;
      bestOverlap = overlap;
      bestId = candidateId;
    }
  }

  return bestId;
}

export function buildLeafNeighborMap(root: PanelNode) {
  const rects = new Map<string, LeafRect>();
  collectLeafRects(root, 0, 0, 1, 1, rects);

  const map = new Map<string, LeafNeighbors>();
  for (const leafId of rects.keys()) {
    map.set(leafId, {
      left: neighborForDirection(leafId, "left", rects) ?? undefined,
      right: neighborForDirection(leafId, "right", rects) ?? undefined,
      up: neighborForDirection(leafId, "up", rects) ?? undefined,
      down: neighborForDirection(leafId, "down", rects) ?? undefined,
    });
  }

  return map;
}

export function buildLeafNeighborMapFromDom(
  root: PanelNode,
  panelElements: Record<string, HTMLDivElement | null>,
) {
  const rects = new Map<string, LeafRect>();
  const leafIds = collectLeafIds(root);

  for (const leafId of leafIds) {
    const element = panelElements[leafId];
    if (!element) {
      continue;
    }
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      continue;
    }
    rects.set(leafId, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  const map = new Map<string, LeafNeighbors>();
  for (const leafId of rects.keys()) {
    map.set(leafId, {
      left: neighborForDirection(leafId, "left", rects) ?? undefined,
      right: neighborForDirection(leafId, "right", rects) ?? undefined,
      up: neighborForDirection(leafId, "up", rects) ?? undefined,
      down: neighborForDirection(leafId, "down", rects) ?? undefined,
    });
  }

  return map;
}
