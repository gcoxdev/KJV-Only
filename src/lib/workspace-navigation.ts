import type { LeafNode, PanelNode, ReaderTab } from "@/types/reader";

export function panelNodeContainsView(
  node: PanelNode,
  view: LeafNode["view"],
): boolean {
  if (node.type === "leaf") {
    return node.view === view;
  }

  return (
    panelNodeContainsView(node.first, view) ||
    panelNodeContainsView(node.second, view)
  );
}

export function isDedicatedLeafViewTab(
  tab: ReaderTab,
  view: LeafNode["view"],
) {
  return tab.root.type === "leaf" && tab.root.view === view;
}

export function nextSearchTabTitle(tabs: ReaderTab[]) {
  const nextSearchNumber =
    tabs.filter((tab) => tab.title.toLowerCase().startsWith("search")).length +
    1;
  return nextSearchNumber === 1 ? "Search" : `Search ${nextSearchNumber}`;
}
