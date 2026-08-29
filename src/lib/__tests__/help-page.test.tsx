import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { HelpPage } from "@/components/reader/help-page";

describe("HelpPage", () => {
  it("documents the current search and PWA recovery features", () => {
    const markup = renderToStaticMarkup(<HelpPage />);

    expect(markup).toContain("How to save or reopen a search");
    expect(markup).toContain("How Search panels are represented in a shared URL");
    expect(markup).toContain("How app updates work");
    expect(markup).toContain("Repair App Cache");
    expect(markup).toContain("npm run dev server intentionally disables the service worker");
  });

  it("describes the current startup, sidebar, and settings structure", () => {
    const markup = renderToStaticMarkup(<HelpPage />);

    expect(markup).toContain("an active Welcome Home tab");
    expect(markup).toContain("Tools, Topics, Notes, and Bookmarks");
    expect(markup).toContain("Visual, Targeting, and Other tabs");
    expect(markup).not.toContain("Welcome Home in the first tab and Genesis 1 in the second tab");
  });
});
