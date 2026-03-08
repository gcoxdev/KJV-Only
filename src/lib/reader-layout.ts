import type {
  LeafNode,
  PanelDirection,
  PanelNode,
  ReaderTab,
  SplitNode,
  SplitOrientation,
} from "@/types/reader";

export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createLeaf(
  bookIndex = 0,
  chapterIndex = 0,
  view: LeafNode["view"] = "picker",
): LeafNode {
  return {
    id: createId(),
    type: "leaf",
    view,
    bookIndex,
    chapterIndex,
    pickerTestament: null,
    pickerBookIndex: null,
  };
}

export function createInitialTab(
  index: number,
  view: LeafNode["view"] = "reader",
): ReaderTab {
  return {
    id: createId(),
    title: `Tab ${index}`,
    root: createLeaf(0, 0, view),
  };
}

export function directionOrientation(direction: PanelDirection): SplitOrientation {
  return direction === "left" || direction === "right"
    ? "horizontal"
    : "vertical";
}

function wrapNodeWithNewPanel(node: PanelNode, direction: PanelDirection): SplitNode {
  const newLeaf = createLeaf();
  const orientation = directionOrientation(direction);
  const placeNewFirst = direction === "left" || direction === "up";

  return {
    id: createId(),
    type: "split",
    orientation,
    ratio: 50,
    first: placeNewFirst ? newLeaf : node,
    second: placeNewFirst ? node : newLeaf,
  };
}

export function splitPanelNode(
  node: PanelNode,
  targetLeafId: string,
  direction: PanelDirection,
): { next: PanelNode; createdLeafId: string | null } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, createdLeafId: null };
    }
    const split = wrapNodeWithNewPanel(node, direction);
    const createdLeaf = split.first.type === "leaf" ? split.first : split.second;
    return { next: split, createdLeafId: createdLeaf.id };
  }

  const firstResult = splitPanelNode(node.first, targetLeafId, direction);
  if (firstResult.createdLeafId) {
    return {
      next: { ...node, first: firstResult.next },
      createdLeafId: firstResult.createdLeafId,
    };
  }

  const secondResult = splitPanelNode(node.second, targetLeafId, direction);
  if (secondResult.createdLeafId) {
    return {
      next: { ...node, second: secondResult.next },
      createdLeafId: secondResult.createdLeafId,
    };
  }

  return { next: node, createdLeafId: null };
}

export function splitNodeById(
  node: PanelNode,
  targetNodeId: string,
  direction: PanelDirection,
): { next: PanelNode; changed: boolean } {
  if (node.id === targetNodeId) {
    return { next: wrapNodeWithNewPanel(node, direction), changed: true };
  }

  if (node.type === "leaf") {
    return { next: node, changed: false };
  }

  const first = splitNodeById(node.first, targetNodeId, direction);
  if (first.changed) {
    return { next: { ...node, first: first.next }, changed: true };
  }

  const second = splitNodeById(node.second, targetNodeId, direction);
  if (second.changed) {
    return { next: { ...node, second: second.next }, changed: true };
  }

  return { next: node, changed: false };
}

export function removeLeafNode(
  node: PanelNode,
  targetLeafId: string,
): { next: PanelNode | null; removed: boolean } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, removed: false };
    }
    return { next: null, removed: true };
  }

  const first = removeLeafNode(node.first, targetLeafId);
  if (first.removed) {
    if (!first.next) {
      return { next: node.second, removed: true };
    }
    return { next: { ...node, first: first.next }, removed: true };
  }

  const second = removeLeafNode(node.second, targetLeafId);
  if (second.removed) {
    if (!second.next) {
      return { next: node.first, removed: true };
    }
    return { next: { ...node, second: second.next }, removed: true };
  }

  return { next: node, removed: false };
}

export function updateLeafNode(
  node: PanelNode,
  targetLeafId: string,
  patch: Partial<
    Pick<
      LeafNode,
      | "bookIndex"
      | "chapterIndex"
      | "view"
      | "pickerTestament"
      | "pickerBookIndex"
    >
  >,
): PanelNode {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return node;
    }
    return { ...node, ...patch };
  }

  const nextFirst = updateLeafNode(node.first, targetLeafId, patch);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateLeafNode(node.second, targetLeafId, patch);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

export function updateSplitRatio(
  node: PanelNode,
  splitId: string,
  ratio: number,
): PanelNode {
  if (node.type === "leaf") {
    return node;
  }

  if (node.id === splitId) {
    return { ...node, ratio };
  }

  const nextFirst = updateSplitRatio(node.first, splitId, ratio);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateSplitRatio(node.second, splitId, ratio);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

export function updateSplitOrientation(
  node: PanelNode,
  splitId: string,
  orientation: SplitOrientation,
): PanelNode {
  if (node.type === "leaf") {
    return node;
  }

  if (node.id === splitId) {
    return { ...node, orientation };
  }

  const nextFirst = updateSplitOrientation(node.first, splitId, orientation);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = updateSplitOrientation(node.second, splitId, orientation);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

export function countLeaves(node: PanelNode): number {
  if (node.type === "leaf") {
    return 1;
  }
  return countLeaves(node.first) + countLeaves(node.second);
}

export function collectLeafIds(node: PanelNode, ids: string[] = []) {
  if (node.type === "leaf") {
    ids.push(node.id);
    return ids;
  }

  collectLeafIds(node.first, ids);
  collectLeafIds(node.second, ids);
  return ids;
}

export function findNodeById(node: PanelNode, nodeId: string): PanelNode | null {
  if (node.id === nodeId) {
    return node;
  }

  if (node.type === "leaf") {
    return null;
  }

  return findNodeById(node.first, nodeId) ?? findNodeById(node.second, nodeId);
}

export function findLeafNode(node: PanelNode, leafId: string): LeafNode | null {
  if (node.type === "leaf") {
    return node.id === leafId ? node : null;
  }

  return findLeafNode(node.first, leafId) ?? findLeafNode(node.second, leafId);
}

export function extractLeafNode(
  node: PanelNode,
  targetLeafId: string,
): { next: PanelNode | null; extracted: LeafNode | null } {
  if (node.type === "leaf") {
    if (node.id !== targetLeafId) {
      return { next: node, extracted: null };
    }
    return { next: null, extracted: node };
  }

  const first = extractLeafNode(node.first, targetLeafId);
  if (first.extracted) {
    if (!first.next) {
      return { next: node.second, extracted: first.extracted };
    }
    return {
      next: { ...node, first: first.next },
      extracted: first.extracted,
    };
  }

  const second = extractLeafNode(node.second, targetLeafId);
  if (second.extracted) {
    if (!second.next) {
      return { next: node.first, extracted: second.extracted };
    }
    return {
      next: { ...node, second: second.next },
      extracted: second.extracted,
    };
  }

  return { next: node, extracted: null };
}

export function swapLeafContent(
  node: PanelNode,
  sourceLeafId: string,
  targetLeafId: string,
): PanelNode {
  const sourceLeaf = findLeafNode(node, sourceLeafId);
  const targetLeaf = findLeafNode(node, targetLeafId);
  if (!sourceLeaf || !targetLeaf) {
    return node;
  }

  const sourceContent = {
    view: sourceLeaf.view,
    bookIndex: sourceLeaf.bookIndex,
    chapterIndex: sourceLeaf.chapterIndex,
    pickerTestament: sourceLeaf.pickerTestament,
    pickerBookIndex: sourceLeaf.pickerBookIndex,
  };
  const targetContent = {
    view: targetLeaf.view,
    bookIndex: targetLeaf.bookIndex,
    chapterIndex: targetLeaf.chapterIndex,
    pickerTestament: targetLeaf.pickerTestament,
    pickerBookIndex: targetLeaf.pickerBookIndex,
  };

  return updateLeafNode(
    updateLeafNode(node, sourceLeafId, targetContent),
    targetLeafId,
    sourceContent,
  );
}

function pathToLeaf(
  node: PanelNode,
  leafId: string,
  path: PanelNode[] = [],
): PanelNode[] | null {
  const nextPath = [...path, node];
  if (node.type === "leaf") {
    return node.id === leafId ? nextPath : null;
  }

  return (
    pathToLeaf(node.first, leafId, nextPath) ??
    pathToLeaf(node.second, leafId, nextPath)
  );
}

export function findGroupTargetNodeId(
  root: PanelNode,
  leafId: string,
  direction: PanelDirection,
) {
  const desiredOrientation = directionOrientation(direction);
  const path = pathToLeaf(root, leafId);
  if (!path) {
    return null;
  }

  for (let index = path.length - 2; index >= 0; index -= 1) {
    const node = path[index];
    if (node.type === "split" && node.orientation !== desiredOrientation) {
      return node.id;
    }
  }

  return null;
}

export function findParentSplitForLeaf(
  root: PanelNode,
  leafId: string,
): SplitNode | null {
  const path = pathToLeaf(root, leafId);
  if (!path || path.length < 2) {
    return null;
  }

  const parent = path[path.length - 2];
  return parent.type === "split" ? parent : null;
}
