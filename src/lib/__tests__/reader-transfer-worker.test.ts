import { describe, expect, it } from "vitest";

import { parseReaderImportInWorker } from "@/lib/reader-transfer-worker";

describe("parseReaderImportInWorker", () => {
  it("uses the validated parser when workers are unavailable", async () => {
    const result = await parseReaderImportInWorker(
      "bookmarks",
      JSON.stringify([
        {
          id: "bookmark-1",
          type: "verse",
          scope: {
            type: "verse",
            bookIndex: 0,
            chapterIndex: 0,
            verseNumber: 1,
          },
          label: "Genesis 1:1",
          note: "",
          createdAt: 1,
          updatedAt: 1,
        },
      ]),
    );

    expect(result.entries).toHaveLength(1);
  });

  it("honors cancellation before parsing", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      parseReaderImportInWorker("notes", "[]", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
