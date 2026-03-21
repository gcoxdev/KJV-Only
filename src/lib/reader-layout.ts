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
    pageId: null,
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

function createdLeafIdFromWrappedNode(
  wrapped: SplitNode,
  direction: PanelDirection,
) {
  return direction === "left" || direction === "up"
    ? wrapped.first.id
    : wrapped.second.id;
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
    return { next: split, createdLeafId: createdLeafIdFromWrappedNode(split, direction) };
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

export function insertLeafIntoParentGroup(
  node: PanelNode,
  targetLeafId: string,
  direction: PanelDirection,
): { next: PanelNode; changed: boolean; createdLeafId: string | null } {
  const desiredOrientation = directionOrientation(direction);
  const path = pathToLeaf(node, targetLeafId);
  if (!path) {
    return { next: node, changed: false, createdLeafId: null };
  }

  let groupRoot: SplitNode | null = null;
  for (let index = path.length - 2; index >= 0; index -= 1) {
    const current = path[index];
    if (current.type !== "split" || current.orientation !== desiredOrientation) {
      break;
    }
    groupRoot = current;
  }

  if (!groupRoot) {
    return { next: node, changed: false, createdLeafId: null };
  }

  const children = flattenSameOrientationGroup(groupRoot, desiredOrientation);
  const targetIndex = children.findIndex((child) => Boolean(findLeafNode(child, targetLeafId)));
  if (targetIndex === -1) {
    return { next: node, changed: false, createdLeafId: null };
  }

  const createdLeaf = createLeaf();
  const insertIndex =
    direction === "left" || direction === "up" ? targetIndex : targetIndex + 1;
  const nextChildren = [
    ...children.slice(0, insertIndex),
    createdLeaf,
    ...children.slice(insertIndex),
  ];

  const rebuiltGroup = rebuildSameOrientationGroup(
    groupRoot.id,
    desiredOrientation,
    nextChildren,
  );

  return {
    next: replaceNodeById(node, groupRoot.id, rebuiltGroup),
    changed: true,
    createdLeafId: createdLeaf.id,
  };
}

function flattenSameOrientationGroup(
  node: PanelNode,
  orientation: SplitOrientation,
): PanelNode[] {
  if (node.type === "split" && node.orientation === orientation) {
    return [
      ...flattenSameOrientationGroup(node.first, orientation),
      ...flattenSameOrientationGroup(node.second, orientation),
    ];
  }

  return [node];
}

function rebuildSameOrientationGroup(
  rootId: string,
  orientation: SplitOrientation,
  children: PanelNode[],
): PanelNode {
  if (children.length === 1) {
    return children[0];
  }

  let current = children[0];
  let currentItemCount = 1;

  for (let index = 1; index < children.length; index += 1) {
    const nextChild = children[index];
    const nextItemCount = currentItemCount + 1;
    current = {
      id: index === children.length - 1 ? rootId : createId(),
      type: "split",
      orientation,
      ratio: Math.round((currentItemCount / nextItemCount) * 100),
      first: current,
      second: nextChild,
    };
    currentItemCount = nextItemCount;
  }

  return current;
}

function collectSameOrientationSplitIds(
  node: PanelNode,
  orientation: SplitOrientation,
  ids: string[] = [],
) {
  if (node.type !== "split" || node.orientation !== orientation) {
    return ids;
  }

  collectSameOrientationSplitIds(node.first, orientation, ids);
  collectSameOrientationSplitIds(node.second, orientation, ids);
  ids.push(node.id);
  return ids;
}

function rebuildSameOrientationGroupWithLayout(
  orientation: SplitOrientation,
  children: PanelNode[],
  splitIds: string[],
  sizes: number[],
): PanelNode {
  if (children.length === 1) {
    return children[0];
  }

  let current = children[0];
  let currentSize = sizes[0] ?? 100;

  for (let index = 1; index < children.length; index += 1) {
    const nextChild = children[index];
    const nextSize = sizes[index] ?? 100;
    const total = currentSize + nextSize;
    current = {
      id: splitIds[index - 1] ?? createId(),
      type: "split",
      orientation,
      ratio: total <= 0 ? 50 : Math.round((currentSize / total) * 100),
      first: current,
      second: nextChild,
    };
    currentSize = total;
  }

  return current;
}

function replaceNodeById(
  node: PanelNode,
  targetNodeId: string,
  replacement: PanelNode,
): PanelNode {
  if (node.id === targetNodeId) {
    return replacement;
  }

  if (node.type === "leaf") {
    return node;
  }

  const nextFirst = replaceNodeById(node.first, targetNodeId, replacement);
  if (nextFirst !== node.first) {
    return { ...node, first: nextFirst };
  }

  const nextSecond = replaceNodeById(node.second, targetNodeId, replacement);
  if (nextSecond !== node.second) {
    return { ...node, second: nextSecond };
  }

  return node;
}

export function updateSameOrientationGroupLayout(
  node: PanelNode,
  groupRootId: string,
  orientation: SplitOrientation,
  sizes: number[],
): PanelNode {
  const groupRoot = findNodeById(node, groupRootId);
  if (!groupRoot || groupRoot.type !== "split" || groupRoot.orientation !== orientation) {
    return node;
  }

  const children = flattenSameOrientationGroup(groupRoot, orientation);
  if (children.length !== sizes.length) {
    return node;
  }

  const splitIds = collectSameOrientationSplitIds(groupRoot, orientation);
  const rebuilt = rebuildSameOrientationGroupWithLayout(
    orientation,
    children,
    splitIds,
    sizes,
  );

  return replaceNodeById(node, groupRootId, rebuilt);
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

export function closeLeafInTab(tab: ReaderTab, leafId: string): ReaderTab {
  if (countLeaves(tab.root) <= 1) {
    return {
      ...tab,
      root: updateLeafNode(tab.root, leafId, {
        view: "picker",
        pickerTestament: null,
        pickerBookIndex: null,
      }),
    };
  }

  const result = removeLeafNode(tab.root, leafId);
  return result.next ? { ...tab, root: result.next } : tab;
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
      | "pageId"
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
    pageId: sourceLeaf.pageId,
  };
  const targetContent = {
    view: targetLeaf.view,
    bookIndex: targetLeaf.bookIndex,
    chapterIndex: targetLeaf.chapterIndex,
    pickerTestament: targetLeaf.pickerTestament,
    pickerBookIndex: targetLeaf.pickerBookIndex,
    pageId: targetLeaf.pageId,
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
    if (node.type === "split" && node.orientation === desiredOrientation) {
      return node.id;
    }
  }

  return null;
}

export function findContiguousGroupRootId(
  root: PanelNode,
  leafId: string,
  orientation: SplitOrientation,
) {
  const path = pathToLeaf(root, leafId);
  if (!path) {
    return null;
  }

  let groupRootId: string | null = null;
  for (let index = path.length - 2; index >= 0; index -= 1) {
    const node = path[index];
    if (node.type !== "split" || node.orientation !== orientation) {
      break;
    }
    groupRootId = node.id;
  }

  return groupRootId;
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
