import { useCallback, useMemo, useState } from "react";

type UseDictionarySearchToolArgs<TPayload extends Record<string, TValue>, TValue, TResult> = {
  load: () => Promise<TPayload>;
  errorMessage: string;
  mapResult: (key: string, value: TValue) => TResult;
  getSearchStrings?: (key: string, value: TValue) => string[];
};

export function useDictionarySearchTool<
  TPayload extends Record<string, TValue>,
  TValue,
  TResult,
>({
  load,
  errorMessage,
  mapResult,
  getSearchStrings,
}: UseDictionarySearchToolArgs<TPayload, TValue, TResult>) {
  const [payload, setPayload] = useState<TPayload | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TResult | null>(null);

  const indexedEntries = useMemo(
    () =>
      payload
        ? Object.keys(payload)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => ({
              key,
              keyLower: key.toLowerCase(),
              searchStrings: (
                getSearchStrings ? getSearchStrings(key, payload[key] as TValue) : [key]
              ).map((value) => value.toLowerCase()),
              value: payload[key] as TValue,
            }))
        : [],
    [getSearchStrings, payload],
  );

  const ensureLoaded = useCallback(async () => {
    if (payload) {
      return payload;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await load();
      setPayload(data);
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage;
      setError(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [errorMessage, load, payload]);

  const results = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return selectedResult ? [selectedResult] : [];
    }
    if (indexedEntries.length === 0) {
      return [] as TResult[];
    }
    return indexedEntries
      .filter(
        (item) =>
          item.keyLower.includes(term) ||
          item.searchStrings.some((value) => value.includes(term)),
      )
      .map((item) => mapResult(item.key, item.value));
  }, [indexedEntries, mapResult, searchTerm, selectedResult]);

  const applySearch = useCallback(
    (rawValue?: string) => {
      const nextTerm = (rawValue ?? "").trim();
      setSearchTerm(nextTerm);
      if (!nextTerm) {
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      void ensureLoaded()
        .catch(() => {
          // Error state is set by ensureLoaded.
        })
        .finally(() => {
          window.requestAnimationFrame(() => {
            setIsSearching(false);
          });
        });
    },
    [ensureLoaded],
  );

  return {
    payload,
    searchTerm,
    isSearching,
    isLoading,
    error,
    selectedResult,
    results,
    setSearchTerm,
    setIsSearching,
    setIsLoading,
    setError,
    setSelectedResult,
    ensureLoaded,
    applySearch,
  };
}
