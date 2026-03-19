import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

export type GuidedTourStep = {
  id: string;
  title: string;
  description: string;
  selector: string;
};

type GuidedTourProps = {
  open: boolean;
  stepIndex: number;
  steps: GuidedTourStep[];
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
};

type TourRect = {
  top: number;
  left: number;
  width: number;
  height: number;
} | null;

const POPOVER_WIDTH = 320;

export function GuidedTour({
  open,
  stepIndex,
  steps,
  onNext,
  onPrevious,
  onClose,
}: GuidedTourProps) {
  const [targetRect, setTargetRect] = useState<TourRect>(null);
  const currentStep = steps[stepIndex] ?? null;

  useEffect(() => {
    if (!open || !currentStep) {
      setTargetRect(null);
      return;
    }

    let frameId = 0;
    let timeoutId = 0;

    const updateRect = () => {
      const element = document.querySelector(currentStep.selector);
      if (!element) {
        setTargetRect(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      if ("scrollIntoView" in element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    };

    frameId = window.requestAnimationFrame(() => {
      updateRect();
      timeoutId = window.setTimeout(updateRect, 220);
    });

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, open]);

  const popoverStyle = useMemo(() => {
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      } as const;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const preferredTop = targetRect.top + targetRect.height + 16;
    const top =
      preferredTop + 220 < viewportHeight
        ? preferredTop
        : Math.max(16, targetRect.top - 236);
    const left = Math.min(
      Math.max(16, targetRect.left),
      Math.max(16, viewportWidth - POPOVER_WIDTH - 16),
    );

    return { top, left } as const;
  }, [targetRect]);

  if (!open || !currentStep) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55" />
      {targetRect ? (
        <div
          className="absolute rounded-xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      ) : null}
      <div
        className="pointer-events-auto absolute w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-background p-4 shadow-2xl"
        style={popoverStyle}
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tour Step {stepIndex + 1} of {steps.length}
          </p>
          <h3 className="text-base font-semibold text-foreground">
            {currentStep.title}
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            {currentStep.description}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={stepIndex === 0}
            onClick={onPrevious}
          >
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext}>
            {stepIndex === steps.length - 1 ? "Finish" : "Next"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Skip Tour
          </Button>
        </div>
      </div>
    </div>
  );
}
