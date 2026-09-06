import { PANEL_HOME_DESTINATIONS } from "@/lib/panel-home";
import { Button } from "@/components/ui/button";
import { ReadingContinuationCard } from "@/components/reader/reading-continuation-card";
import { preloadSearchPage } from "@/lib/search-page-loader";
import type { ComponentProps } from "react";
import type { PanelHomeDestination } from "@/types/reader";
type PanelHomeProps = Omit<ComponentProps<typeof ReadingContinuationCard>, "onOpenProgress"> & {
  onOpen: (destination: PanelHomeDestination) => void;
};

export function PanelHome({ onOpen, ...progressProps }: PanelHomeProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ReadingContinuationCard {...progressProps} onOpenProgress={() => onOpen("progress")} />
      <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,8.5rem),1fr))]">
        {(Object.keys(PANEL_HOME_DESTINATIONS) as PanelHomeDestination[]).filter((key) => key !== "progress").map((key) => {
          const { title, icon: Icon } = PANEL_HOME_DESTINATIONS[key];
          return (
            <Button key={key} type="button" variant="outline" size="sm"
              onMouseEnter={key === "search" ? preloadSearchPage : undefined}
              onFocus={key === "search" ? preloadSearchPage : undefined}
              onClick={() => onOpen(key)}>
              <Icon data-icon="inline-start" />
              {title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
