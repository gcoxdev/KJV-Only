import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { swapSingleLeafReference } from "@/lib/leaf-state";
import {
  closeLeafInTab,
  collectLeafIds,
  directionOrientation,
  findContiguousGroupRootId,
  findLeafNode,
  findNodeById,
  findParentSplitForLeaf,
  insertLeafIntoParentGroup,
  splitNodeById,
  splitPanelNode,
  swapLeafContent,
  updateSplitOrientation,
} from "@/lib/reader-layout";
import {
  buildLeafNeighborMapFromDom,
  leafIdsAtGroupEdge,
  type LeafNeighbors,
  type LeafRect,
} from "@/lib/reader-neighbors";
import { swapPendingReaderScrollTargets } from "@/lib/reader-scroll-targets";
import type {
  PanelDirection,
  PanelNode,
  PendingReaderScrollTarget,
  ReaderTab,
  SplitOrientation,
} from "@/types/reader";

type ReaderWordHighlight = {
  leafId: string;
  verseNumber: number;
  word: string;
};

type UpdateActiveTab = (updater: (tab: ReaderTab) => ReaderTab) => void;
type SwapLeafState = (sourceLeafId: string, targetLeafId: string) => void;

type UsePanelInteractionControllerParams = {
  activeRoot: PanelNode | null;
  modelLeafNeighbors: ReadonlyMap<string, LeafNeighbors>;
  panelElementRefs: RefObject<Record<string, HTMLDivElement | null>>;
  panelMenuOpenLeafId: string | null;
  setPanelMenuOpenLeafId: Dispatch<SetStateAction<string | null>>;
  fullscreenLeafId: string | null;
  setFullscreenLeafId: Dispatch<SetStateAction<string | null>>;
  fullscreenRequestedLeafIdRef: RefObject<string | null>;
  updateActiveTab: UpdateActiveTab;
  swapNotesTabState: SwapLeafState;
  swapSearchPageState: SwapLeafState;
  swapLeafHistoryState: SwapLeafState;
  swapHighlightModeForLeaves: SwapLeafState;
  swapLeafHighlights: SwapLeafState;
  setActiveReaderWordHighlight: Dispatch<
    SetStateAction<ReaderWordHighlight | null>
  >;
  setPendingReaderScrollTargets: Dispatch<
    SetStateAction<PendingReaderScrollTarget[]>
  >;
  setTargetedPanelLeafId: (
    value: SetStateAction<string | null>,
  ) => void;
};

export function usePanelInteractionController({
  activeRoot,
  modelLeafNeighbors,
  panelElementRefs,
  panelMenuOpenLeafId,
  setPanelMenuOpenLeafId,
  fullscreenLeafId,
  setFullscreenLeafId,
  fullscreenRequestedLeafIdRef,
  updateActiveTab,
  swapNotesTabState,
  swapSearchPageState,
  swapLeafHistoryState,
  swapHighlightModeForLeaves,
  swapLeafHighlights,
  setActiveReaderWordHighlight,
  setPendingReaderScrollTargets,
  setTargetedPanelLeafId,
}: UsePanelInteractionControllerParams) {
  const movePreviewLeafIdRef = useRef<string | null>(null);
  const addPreviewLeafIdsRef = useRef<string[]>([]);
  const addPreviewDirectionRef = useRef<PanelDirection | null>(null);
  const addPreviewIsGroupRef = useRef(false);
  const orientationPreviewLeafIdsRef = useRef<string[]>([]);
  const domNeighborCacheRef = useRef<{
    root: PanelNode | null;
    neighbors: Map<string, LeafNeighbors>;
  }>({ root: null, neighbors: new Map() });

  useEffect(() => {
    domNeighborCacheRef.current = { root: null, neighbors: new Map() };
  }, [activeRoot]);

  const panelCardElement = useCallback(
    (leafId: string) => {
      const panelElement = panelElementRefs.current[leafId];
      return (
        panelElement?.querySelector<HTMLElement>(
          ':scope > [data-slot="card"]',
        ) ?? null
      );
    },
    [panelElementRefs],
  );

  const clearMovePreview = useCallback(() => {
    const previewId = movePreviewLeafIdRef.current;
    if (!previewId) {
      return;
    }

    panelCardElement(previewId)?.classList.remove(
      "panel-move-preview-surface",
    );
    movePreviewLeafIdRef.current = null;
  }, [panelCardElement]);

  const applyMovePreview = useCallback(
    (targetLeafId: string | null) => {
      clearMovePreview();
      if (!targetLeafId) {
        return;
      }

      const previewSurface = panelCardElement(targetLeafId);
      if (!previewSurface) {
        return;
      }

      previewSurface.classList.add("panel-move-preview-surface");
      movePreviewLeafIdRef.current = targetLeafId;
    },
    [clearMovePreview, panelCardElement],
  );

  const clearAddPreview = useCallback(() => {
    const leafIds = addPreviewLeafIdsRef.current;
    const direction = addPreviewDirectionRef.current;
    const isGroup = addPreviewIsGroupRef.current;

    if (leafIds.length === 0 || !direction) {
      return;
    }

    for (const leafId of leafIds) {
      const previewSurface = panelCardElement(leafId);
      if (!previewSurface) {
        continue;
      }
      previewSurface.classList.remove("panel-add-preview-target");
      previewSurface.classList.remove(`panel-add-preview-${direction}`);
      if (isGroup) {
        previewSurface.classList.remove("panel-add-preview-group");
      }
    }

    addPreviewLeafIdsRef.current = [];
    addPreviewDirectionRef.current = null;
    addPreviewIsGroupRef.current = false;
  }, [panelCardElement]);

  const applyAddPreview = useCallback(
    (leafIds: string[], direction: PanelDirection, isGroup: boolean) => {
      clearAddPreview();
      if (leafIds.length === 0) {
        return;
      }

      const appliedLeafIds: string[] = [];
      for (const leafId of leafIds) {
        const previewSurface = panelCardElement(leafId);
        if (!previewSurface) {
          continue;
        }
        previewSurface.classList.add("panel-add-preview-target");
        previewSurface.classList.add(`panel-add-preview-${direction}`);
        if (isGroup) {
          previewSurface.classList.add("panel-add-preview-group");
        }
        appliedLeafIds.push(leafId);
      }

      addPreviewLeafIdsRef.current = appliedLeafIds;
      addPreviewDirectionRef.current = direction;
      addPreviewIsGroupRef.current = isGroup;
    },
    [clearAddPreview, panelCardElement],
  );

  const clearOrientationPreview = useCallback(() => {
    const leafIds = orientationPreviewLeafIdsRef.current;
    if (leafIds.length === 0) {
      return;
    }

    for (const leafId of leafIds) {
      panelCardElement(leafId)?.classList.remove(
        "panel-orientation-preview",
      );
    }
    orientationPreviewLeafIdsRef.current = [];
  }, [panelCardElement]);

  const clearAllPanelPreviews = useCallback(() => {
    clearMovePreview();
    clearAddPreview();
    clearOrientationPreview();
  }, [clearAddPreview, clearMovePreview, clearOrientationPreview]);

  useEffect(() => {
    function onFullscreenChange() {
      const element = document.fullscreenElement as HTMLElement | null;
      const leafId = element
        ? (fullscreenRequestedLeafIdRef.current ?? null)
        : null;
      setFullscreenLeafId(leafId);
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
      if (!element) {
        fullscreenRequestedLeafIdRef.current = null;
      }
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [
    clearAllPanelPreviews,
    fullscreenRequestedLeafIdRef,
    setFullscreenLeafId,
    setPanelMenuOpenLeafId,
  ]);

  useEffect(() => {
    if (!panelMenuOpenLeafId || !activeRoot) {
      return;
    }
    if (!findLeafNode(activeRoot, panelMenuOpenLeafId)) {
      setPanelMenuOpenLeafId(null);
      clearAllPanelPreviews();
    }
  }, [
    activeRoot,
    clearAllPanelPreviews,
    panelMenuOpenLeafId,
    setPanelMenuOpenLeafId,
  ]);

  const neighborsForLeaf = useCallback(
    (leafId: string): LeafNeighbors => modelLeafNeighbors.get(leafId) ?? {},
    [modelLeafNeighbors],
  );

  const neighborForDirection = useCallback(
    (leafId: string, direction: PanelDirection) => {
      const modelNeighbor = modelLeafNeighbors.get(leafId)?.[direction];
      if (modelNeighbor) {
        return modelNeighbor;
      }
      if (!activeRoot) {
        return null;
      }

      if (domNeighborCacheRef.current.root !== activeRoot) {
        domNeighborCacheRef.current = {
          root: activeRoot,
          neighbors: buildLeafNeighborMapFromDom(
            activeRoot,
            panelElementRefs.current,
          ),
        };
      }
      return (
        domNeighborCacheRef.current.neighbors.get(leafId)?.[direction] ?? null
      );
    },
    [activeRoot, modelLeafNeighbors, panelElementRefs],
  );

  const splitLeaf = useCallback(
    (leafId: string, direction: PanelDirection) => {
      updateActiveTab((tab) => {
        const result = splitPanelNode(tab.root, leafId, direction);
        return { ...tab, root: result.next };
      });
    },
    [updateActiveTab],
  );

  const setMovePreviewTarget = useCallback(
    (leafId: string, direction: PanelDirection) => {
      clearAddPreview();
      clearOrientationPreview();
      applyMovePreview(neighborForDirection(leafId, direction));
    },
    [
      applyMovePreview,
      clearAddPreview,
      clearOrientationPreview,
      neighborForDirection,
    ],
  );

  const setAddPreviewTarget = useCallback(
    (leafId: string, direction: PanelDirection) => {
      clearMovePreview();
      clearOrientationPreview();
      applyAddPreview([leafId], direction, false);
    },
    [applyAddPreview, clearMovePreview, clearOrientationPreview],
  );

  const setGroupInsertPreviewTarget = useCallback(
    (leafId: string, direction: PanelDirection) => {
      clearMovePreview();
      clearOrientationPreview();
      if (!activeRoot) {
        return;
      }

      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (
        !parentSplit ||
        parentSplit.orientation !== directionOrientation(direction)
      ) {
        return;
      }
      applyAddPreview([leafId], direction, true);
    },
    [
      activeRoot,
      applyAddPreview,
      clearMovePreview,
      clearOrientationPreview,
    ],
  );

  const setAroundGroupPreviewTarget = useCallback(
    (leafId: string, direction: PanelDirection) => {
      clearMovePreview();
      clearOrientationPreview();
      if (!activeRoot) {
        return;
      }

      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (!parentSplit) {
        return;
      }
      const targetOrientation = parentSplit.orientation;
      if (targetOrientation === directionOrientation(direction)) {
        return;
      }

      const targetNodeId = findContiguousGroupRootId(
        activeRoot,
        leafId,
        targetOrientation,
      );
      if (!targetNodeId) {
        return;
      }
      const targetNode = findNodeById(activeRoot, targetNodeId);
      if (!targetNode) {
        return;
      }

      const targetLeafIds = collectLeafIds(targetNode);
      const rects = new Map<string, LeafRect>();
      for (const targetLeafId of targetLeafIds) {
        const rect =
          panelElementRefs.current[targetLeafId]?.getBoundingClientRect();
        if (rect) {
          rects.set(targetLeafId, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          });
        }
      }
      applyAddPreview(
        leafIdsAtGroupEdge(targetLeafIds, rects, direction),
        direction,
        true,
      );
    },
    [
      activeRoot,
      applyAddPreview,
      clearMovePreview,
      clearOrientationPreview,
      panelElementRefs,
    ],
  );

  const setOrientationPreviewTarget = useCallback(
    (leafId: string) => {
      clearMovePreview();
      clearAddPreview();
      clearOrientationPreview();
      if (!activeRoot) {
        return;
      }

      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (!parentSplit) {
        return;
      }

      const leafIds = collectLeafIds(parentSplit);
      for (const id of leafIds) {
        panelCardElement(id)?.classList.add("panel-orientation-preview");
      }
      orientationPreviewLeafIdsRef.current = leafIds;
    },
    [
      activeRoot,
      clearAddPreview,
      clearMovePreview,
      clearOrientationPreview,
      panelCardElement,
    ],
  );

  const insertPanelInGroup = useCallback(
    (leafId: string, direction: PanelDirection) => {
      if (!activeRoot) {
        return;
      }
      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (
        !parentSplit ||
        parentSplit.orientation !== directionOrientation(direction)
      ) {
        return;
      }

      updateActiveTab((tab) => {
        const result = insertLeafIntoParentGroup(
          tab.root,
          leafId,
          direction,
        );
        return result.changed ? { ...tab, root: result.next } : tab;
      });
    },
    [activeRoot, updateActiveTab],
  );

  const addAroundGroup = useCallback(
    (leafId: string, direction: PanelDirection) => {
      if (!activeRoot) {
        return;
      }
      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (!parentSplit) {
        return;
      }
      const targetOrientation = parentSplit.orientation;
      if (targetOrientation === directionOrientation(direction)) {
        return;
      }

      const targetNodeId = findContiguousGroupRootId(
        activeRoot,
        leafId,
        targetOrientation,
      );
      if (!targetNodeId) {
        return;
      }

      updateActiveTab((tab) => {
        const result = splitNodeById(tab.root, targetNodeId, direction);
        return result.changed ? { ...tab, root: result.next } : tab;
      });
    },
    [activeRoot, updateActiveTab],
  );

  const toggleParentGroupOrientation = useCallback(
    (leafId: string) => {
      if (!activeRoot) {
        return;
      }
      const parentSplit = findParentSplitForLeaf(activeRoot, leafId);
      if (!parentSplit) {
        return;
      }
      const nextOrientation: SplitOrientation =
        parentSplit.orientation === "horizontal" ? "vertical" : "horizontal";

      updateActiveTab((tab) => ({
        ...tab,
        root: updateSplitOrientation(
          tab.root,
          parentSplit.id,
          nextOrientation,
        ),
      }));
    },
    [activeRoot, updateActiveTab],
  );

  const moveLeaf = useCallback(
    (leafId: string, direction: PanelDirection) => {
      if (!activeRoot) {
        return;
      }
      const targetLeafId = neighborForDirection(leafId, direction);
      if (!targetLeafId) {
        return;
      }

      swapNotesTabState(leafId, targetLeafId);
      swapSearchPageState(leafId, targetLeafId);
      swapLeafHistoryState(leafId, targetLeafId);
      swapHighlightModeForLeaves(leafId, targetLeafId);
      swapLeafHighlights(leafId, targetLeafId);
      setActiveReaderWordHighlight((current) =>
        swapSingleLeafReference(current, leafId, targetLeafId),
      );
      setPendingReaderScrollTargets((current) =>
        swapPendingReaderScrollTargets(current, leafId, targetLeafId),
      );
      setTargetedPanelLeafId((current) => {
        if (current === leafId) {
          return targetLeafId;
        }
        if (current === targetLeafId) {
          return leafId;
        }
        return current;
      });

      updateActiveTab((tab) => ({
        ...tab,
        root: swapLeafContent(tab.root, leafId, targetLeafId),
      }));
      clearAllPanelPreviews();
    },
    [
      activeRoot,
      clearAllPanelPreviews,
      neighborForDirection,
      setActiveReaderWordHighlight,
      setPendingReaderScrollTargets,
      setTargetedPanelLeafId,
      swapHighlightModeForLeaves,
      swapLeafHighlights,
      swapLeafHistoryState,
      swapNotesTabState,
      swapSearchPageState,
      updateActiveTab,
    ],
  );

  const closeLeaf = useCallback(
    (leafId: string) => {
      updateActiveTab((tab) => closeLeafInTab(tab, leafId));
      if (fullscreenLeafId === leafId && document.fullscreenElement) {
        void document.exitFullscreen();
      }
    },
    [fullscreenLeafId, updateActiveTab],
  );

  return {
    neighborsForLeaf,
    clearAllPanelPreviews,
    clearMovePreview,
    clearAddPreview,
    clearOrientationPreview,
    splitLeaf,
    setMovePreviewTarget,
    setAddPreviewTarget,
    setGroupInsertPreviewTarget,
    setAroundGroupPreviewTarget,
    setOrientationPreviewTarget,
    insertPanelInGroup,
    addAroundGroup,
    toggleParentGroupOrientation,
    moveLeaf,
    closeLeaf,
  };
}
