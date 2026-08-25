import { memo } from "react";

import {
  ReaderPanelTree,
  type ReaderPanelTreeProps,
} from "@/components/reader/reader-panel-tree";
import type { LeafNeighbors } from "@/lib/reader-neighbors";
import { areReaderViewModelsEqual } from "@/lib/reader-view-model";
import type { ReaderTab } from "@/types/reader";

const EMPTY_LEAF_NEIGHBORS = new Map<string, LeafNeighbors>();

type ReaderWorkspacePanelsProps = {
  tabs: ReaderTab[];
  activeTabId: string | null;
  modelLeafNeighbors: Map<string, LeafNeighbors>;
  panelTreeProps: Omit<
    ReaderPanelTreeProps,
    "root" | "activeRoot" | "modelLeafNeighbors"
  >;
};

export const ReaderWorkspacePanels = memo(
  function ReaderWorkspacePanels({
    tabs,
    activeTabId,
    modelLeafNeighbors,
    panelTreeProps,
  }: ReaderWorkspacePanelsProps) {
    return tabs.map((tab) => {
      const isActive = tab.id === activeTabId;
      return (
        <div
          key={tab.id}
          className={isActive ? "absolute inset-0 min-h-0 min-w-0" : "hidden"}
          inert={!isActive}
        >
          <ReaderPanelTree
            {...panelTreeProps}
            root={tab.root}
            activeRoot={tab.root}
            modelLeafNeighbors={
              isActive ? modelLeafNeighbors : EMPTY_LEAF_NEIGHBORS
            }
          />
        </div>
      );
    });
  },
  areReaderViewModelsEqual,
);
