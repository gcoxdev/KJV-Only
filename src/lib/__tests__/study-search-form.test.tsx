import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  StudySearchForm,
  resetStudySearchDraft,
  shouldShowStudySearchResetButton,
} from "@/components/reader/study-search-form";

describe("study search form helpers", () => {
  it("does not show reset affordance when reset is not allowed", () => {
    expect(shouldShowStudySearchResetButton(false, "grace")).toBe(false);
  });

  it("shows reset affordance when reset is allowed and the draft has content", () => {
    expect(shouldShowStudySearchResetButton(true, "grace")).toBe(true);
  });

  it("does not show reset affordance for whitespace-only drafts", () => {
    expect(shouldShowStudySearchResetButton(true, "   ")).toBe(false);
  });

  it("reset clears the draft and triggers an empty search", () => {
    const setDraftValue = vi.fn();
    const onSearch = vi.fn();

    resetStudySearchDraft(setDraftValue, onSearch);

    expect(setDraftValue).toHaveBeenCalledWith("");
    expect(onSearch).toHaveBeenCalledWith("");
  });
});

describe("StudySearchForm", () => {
  it("renders no reset button when allowReset is false", () => {
    const markup = renderToStaticMarkup(
      <StudySearchForm
        name="concordance-search"
        placeholder="Search concordance..."
        ariaLabel="Search concordance"
        loading={false}
        value="grace"
        onSearch={() => {}}
      />,
    );

    expect(markup).not.toContain("aria-label=\"Reset search\"");
  });

  it("renders reset button before search button when allowReset is true", () => {
    const markup = renderToStaticMarkup(
      <StudySearchForm
        name="concordance-search"
        placeholder="Search concordance..."
        ariaLabel="Search concordance"
        loading={false}
        value="grace"
        allowReset
        onSearch={() => {}}
      />,
    );

    const resetIndex = markup.indexOf("aria-label=\"Reset search\"");
    const searchIndex = markup.indexOf("aria-label=\"Search concordance\"");

    expect(resetIndex).toBeGreaterThanOrEqual(0);
    expect(searchIndex).toBeGreaterThan(resetIndex);
  });
});
