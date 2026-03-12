import { memo, type ReactNode, useEffect, useRef, useState } from "react";
import { ExternalLinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOptionalSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
  const sidebar = useOptionalSidebar();
  const [isTouchPopoverOpen, setIsTouchPopoverOpen] = useState(false);
  const [isHoverPopoverOpen, setIsHoverPopoverOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [supportsHover, setSupportsHover] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const closeTimerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

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
      }
    };
  }, []);

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const isPopoverOpen = supportsHover
    ? isHoverPopoverOpen || isKeyboardOpen
    : isTouchPopoverOpen;

  const isWithinPopover = (target: EventTarget | null) => {
    if (!(target instanceof Node)) {
      return false;
    }
    return (
      triggerRef.current?.contains(target) === true ||
      contentRef.current?.contains(target) === true
    );
  };

  const scheduleClose = (nextTarget?: EventTarget | null) => {
    if (!supportsHover) {
      return;
    }
    if (isWithinPopover(nextTarget ?? null)) {
      cancelScheduledClose();
      return;
    }
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      setIsHoverPopoverOpen(false);
      setIsKeyboardOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  const openReference = () => {
    onOpenReference(reference);
    if (!supportsHover) {
      sidebar?.setOpenMobile(false);
      onCloseSidebar();
    }
    setIsTouchPopoverOpen(false);
    setIsHoverPopoverOpen(false);
    setIsKeyboardOpen(false);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={(nextOpen) => {
        if (supportsHover) {
          if (!nextOpen) {
            setIsHoverPopoverOpen(false);
            setIsKeyboardOpen(false);
          }
          return;
        }
        setIsTouchPopoverOpen(nextOpen);
      }}
    >
      <PopoverTrigger
        render={
          <button
            ref={triggerRef}
            type="button"
            className={cn(
              "inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium text-foreground transition-colors",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
            )}
            onMouseEnter={() => {
              if (!supportsHover) {
                return;
              }
              cancelScheduledClose();
              setIsHoverPopoverOpen(true);
            }}
            onMouseLeave={(event) => {
              scheduleClose(event.relatedTarget);
            }}
            onFocus={(event) => {
              cancelScheduledClose();
              if (!supportsHover || event.currentTarget.matches(":focus-visible")) {
                setIsKeyboardOpen(true);
              }
            }}
            onBlur={(event) => {
              if (!isWithinPopover(event.relatedTarget)) {
                setIsKeyboardOpen(false);
              }
            }}
            onClick={() => {
              if (supportsHover) {
                openReference();
                return;
              }
              setIsTouchPopoverOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={isPopoverOpen}
          />
        }
      >
        {reference}
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        side="top"
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)] space-y-2"
        onMouseEnter={() => {
          cancelScheduledClose();
          if (supportsHover) {
            setIsHoverPopoverOpen(true);
          }
        }}
        onMouseLeave={(event) => {
          scheduleClose(event.relatedTarget);
        }}
      >
        <div className="max-h-[min(24rem,60vh)] overflow-y-auto pr-1 text-xs leading-relaxed">
          {renderPreview(reference, highlightWord)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={openReference}
          >
            <ExternalLinkIcon />
            Open
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
