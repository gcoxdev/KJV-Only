import { describe, expect, it } from "vitest";

import {
  normalizeStudyWorkspaceTab,
  normalizeStudyWorkspaceTool,
} from "@/hooks/use-study-workspace-state";
import {
  normalizeReaderMode,
  normalizeTabsOrientation,
} from "@/hooks/use-reader-shell-state";

describe("study workspace normalization", () => {
  it("normalizes standalone values", () => {
    expect(normalizeStudyWorkspaceTab("home")).toBe("home");
    expect(normalizeStudyWorkspaceTab("search")).toBe("search");
    expect(normalizeStudyWorkspaceTab("progress")).toBe("progress");
    expect(normalizeStudyWorkspaceTab("notes")).toBe("notes");
    expect(normalizeStudyWorkspaceTab("bad")).toBe("home");
    expect(normalizeStudyWorkspaceTool("maps")).toBe("maps");
    expect(normalizeStudyWorkspaceTool("bad")).toBe("concordance");
  });
});

describe("reader shell normalization", () => {
  it("normalizes reader shell primitives", () => {
    expect(normalizeReaderMode("read")).toBe("read");
    expect(normalizeReaderMode("study")).toBe("study");
    expect(normalizeReaderMode("other")).toBe("study");
    expect(normalizeTabsOrientation("vertical")).toBe("vertical");
    expect(normalizeTabsOrientation("other")).toBe("horizontal");
  });
});
