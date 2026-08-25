import { describe, expect, it } from "vitest";

import { getReadingCompletionTransition } from "@/hooks/use-completion-celebration";
import { clampGuidedTourStepIndex } from "@/hooks/use-guided-tour-controller";
import { computePwaInstalled } from "@/hooks/use-pwa-installation";

describe("reader shell lifecycle helpers", () => {
  it("recognizes browser and display-mode PWA installation", () => {
    expect(computePwaInstalled(true, false)).toBe(true);
    expect(computePwaInstalled(false, true)).toBe(true);
    expect(computePwaInstalled(false, undefined)).toBe(false);
  });

  it("clamps guided-tour navigation to the available steps", () => {
    expect(clampGuidedTourStepIndex(-1)).toBe(0);
    expect(clampGuidedTourStepIndex(4)).toBe(4);
    expect(clampGuidedTourStepIndex(Number.MAX_SAFE_INTEGER)).toBe(10);
  });

  it("celebrates only a transition into a non-empty completed plan", () => {
    expect(getReadingCompletionTransition(false, 0, 0)).toEqual({
      isComplete: false,
      shouldCelebrate: false,
    });
    expect(getReadingCompletionTransition(false, 1_189, 1_189)).toEqual({
      isComplete: true,
      shouldCelebrate: true,
    });
    expect(getReadingCompletionTransition(true, 1_189, 1_189)).toEqual({
      isComplete: true,
      shouldCelebrate: false,
    });
    expect(getReadingCompletionTransition(true, 1_189, 1_188)).toEqual({
      isComplete: false,
      shouldCelebrate: false,
    });
  });
});
