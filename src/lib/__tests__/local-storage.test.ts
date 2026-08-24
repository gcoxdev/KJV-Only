import { describe, expect, it } from "vitest";

import {
  consumeLocalStorageIssueKeys,
  readLocalStorageJson,
  readLocalStorageValue,
  removeLocalStorageValue,
  reportLocalStorageIssue,
  writeLocalStorageJson,
  writeLocalStorageValue,
} from "@/lib/local-storage";

function createStorage(options?: { throwOnWrite?: boolean }) {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options?.throwOnWrite) {
        throw new Error("quota exceeded");
      }
      values.set(key, value);
    },
    removeItem: (key: string) => values.delete(key),
  };
}

describe("local storage boundary", () => {
  it("round-trips text and versioned JSON values", () => {
    const storage = createStorage();
    expect(writeLocalStorageValue("theme:v1", "dark", storage)).toBe(true);
    expect(readLocalStorageValue("theme:v1", storage)).toBe("dark");
    expect(writeLocalStorageJson("settings:v1", { size: 18 }, storage)).toBe(true);
    expect(readLocalStorageJson("settings:v1", storage)).toEqual({ size: 18 });
    expect(removeLocalStorageValue("theme:v1", storage)).toBe(true);
    expect(readLocalStorageValue("theme:v1", storage)).toBeNull();
  });

  it("fails closed for malformed JSON and storage errors", () => {
    const storage = createStorage();
    storage.setItem("broken:v1", "{");
    expect(readLocalStorageJson("broken:v1", storage)).toBeNull();
    expect(
      writeLocalStorageJson("settings:v1", { size: 18 }, createStorage({ throwOnWrite: true })),
    ).toBe(false);
    expect(consumeLocalStorageIssueKeys()).toEqual(
      expect.arrayContaining(["broken:v1", "settings:v1"]),
    );
  });

  it("allows schema validators to report recoverable storage issues", () => {
    reportLocalStorageIssue("settings:invalid-schema");
    expect(consumeLocalStorageIssueKeys()).toContain("settings:invalid-schema");
  });
});
