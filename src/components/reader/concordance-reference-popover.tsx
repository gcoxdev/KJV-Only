import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";

type ConcordanceReferencePopoverProps = {
  reference: string;
  highlightWord: string;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export const ConcordanceReferencePopover = memo(function ConcordanceReferencePopover({
  reference,
  highlightWord,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: ConcordanceReferencePopoverProps) {
  const { setOpenMobile } = useSidebar();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setSupportsHover(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => {
      mediaQuery.removeEventListener("change", update);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  const scheduleClose = () => {
    if (!supportsHover) {
      return;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setIsPopoverOpen(false);
      closeTimerRef.current = null;
    }, 150);
  };

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            onMouseEnter={() => {
              if (supportsHover) {
                cancelScheduledClose();
                setIsPopoverOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (supportsHover && isPopoverOpen) {
                scheduleClose();
              }
            }}
            onClick={() => {
              if (supportsHover) {
                onOpenReference(reference);
              }
            }}
          />
        }
      >
        {reference}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] space-y-2"
        onMouseEnter={() => {
          if (supportsHover) {
            cancelScheduledClose();
            setIsPopoverOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (supportsHover && isPopoverOpen) {
            scheduleClose();
          }
        }}
      >
        <div className="max-h-[min(24rem,60vh)] overflow-y-auto pr-1 text-xs leading-relaxed">
          {renderPreview(reference, highlightWord)}
        </div>
        {!supportsHover ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              onClick={() => {
                onOpenReference(reference);
                setOpenMobile(false);
                onCloseSidebar();
                setIsPopoverOpen(false);
              }}
            >
              <ExternalLinkIcon className="size-3.5" />
              Open
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
});
