import { describe, expect, it, vi } from "vitest";

import { areReaderViewModelsEqual } from "@/lib/reader-view-model";

describe("reader view-model equality", () => {
  it("accepts separately assembled records with the same stable leaves", () => {
    const results = [{ id: "result" }];
    const onOpen = vi.fn();

    expect(
      areReaderViewModelsEqual(
        { tools: { loading: false, results, onOpen } },
        { tools: { loading: false, results, onOpen } },
      ),
    ).toBe(true);
  });

  it("treats changed state collections and callbacks as meaningful", () => {
    const results = [{ id: "result" }];
    const onOpen = vi.fn();

    expect(
      areReaderViewModelsEqual(
        { tools: { results, onOpen } },
        { tools: { results: [...results], onOpen } },
      ),
    ).toBe(false);
    expect(
      areReaderViewModelsEqual(
        { tools: { results, onOpen } },
        { tools: { results, onOpen: vi.fn() } },
      ),
    ).toBe(false);
  });

  it("rejects records with changed keys or primitive values", () => {
    expect(areReaderViewModelsEqual({ open: false }, { open: true })).toBe(
      false,
    );
    expect(areReaderViewModelsEqual({ open: false }, { open: false, id: 1 })).toBe(
      false,
    );
  });
});
