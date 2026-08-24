import { useRef, type RefObject } from "react";

import { STUDY_ACCORDION_ITEMS } from "@/hooks/use-study-sidebar-state";
import type { AncientMapEntry, AncientMapPayload } from "@/lib/maps";
import { beginPerformanceMeasure } from "@/lib/performance";
import { mayHaveGenealogyMatch } from "@/lib/reader-data";
import {
  chapterVerseKey,
  decodeConcordanceReferences,
  resolveAIDictionaryKey,
  resolveBibleWordBookKey,
  resolveConcordanceKey,
  resolveHitchcocksKey,
  resolveOldEnglishKey,
  resolveUnitsKey,
  resolveWebstersKey,
} from "@/lib/references";
import {
  findGenealogyMatches,
  findMapMatches,
  resolveAIDictionarySelectionAtLocation,
  resolvePhraseSelectionAtLocation,
} from "@/lib/word-study-selection";
import type { Book } from "@/types/bible";
import type { NotesContext } from "@/types/notes";
import type {
  AIDictionaryEntry,
  AIDictionaryPayload,
  BibleWordBookEntry,
  BibleWordBookPayload,
  ConcordancePayload,
  GenealogyPayload,
  HitchcocksPayload,
  OldEnglishPayload,
  PhraseEntry,
  PhrasesPayload,
  StrongsPayload,
  StudyWorkspaceTool,
  UnitsEntry,
  UnitsPayload,
  WebstersEntry,
  WebstersPayload,
} from "@/types/reader";
import type { StrongsSearchResult } from "@/hooks/use-strongs-search-tool";

type Setter<T> = (value: T) => void;

type WordStudyCoordinatorParams = {
  books: Book[];
  concordance: ConcordancePayload | null;
  websters: WebstersPayload | null;
  aiDictionary: AIDictionaryPayload | null;
  bibleWordBook: BibleWordBookPayload | null;
  hitchcocks: HitchcocksPayload | null;
  oldEnglish: OldEnglishPayload | null;
  phrases: PhrasesPayload | null;
  units: UnitsPayload | null;
  genealogy: GenealogyPayload | null;
  ancientMaps: AncientMapPayload | null;
  strongsGreek: StrongsPayload | null;
  strongsHebrew: StrongsPayload | null;
  ensureConcordanceLoaded: () => Promise<ConcordancePayload>;
  ensureWebstersLoaded: () => Promise<WebstersPayload>;
  ensureAIDictionaryLoaded: () => Promise<AIDictionaryPayload>;
  ensureBibleWordBookLoaded: () => Promise<BibleWordBookPayload>;
  ensureHitchcocksLoaded: () => Promise<HitchcocksPayload>;
  ensureOldEnglishLoaded: () => Promise<OldEnglishPayload>;
  ensurePhrasesLoaded: () => Promise<PhrasesPayload>;
  ensureUnitsLoaded: () => Promise<UnitsPayload>;
  ensureGenealogyLoaded: () => Promise<GenealogyPayload>;
  ensureAncientMapsLoaded: () => Promise<AncientMapPayload>;
  ensureStrongsLoaded: () => Promise<{
    greek: StrongsPayload;
    hebrew: StrongsPayload;
  }>;
  openStudyTool: (tool: StudyWorkspaceTool) => void;
  setNotesContext: Setter<NotesContext | null>;
  setConcordanceAccordionValue: Setter<string[]>;
  setConcordanceError: Setter<string | null>;
  setIsConcordanceLoading: Setter<boolean>;
  setConcordanceSearchTerm: Setter<string>;
  setConcordanceWordAccordionValue: Setter<string[]>;
  setSelectedConcordanceWord: Setter<{
    key: string;
    references: string[];
  } | null>;
  setWebstersSearchTerm: Setter<string>;
  setWebstersWordAccordionValue: Setter<string[]>;
  setSelectedWebstersEntry: Setter<{
    key: string;
    entry: WebstersEntry;
  } | null>;
  setAIDictionarySearchTerm: Setter<string>;
  setAIDictionaryWordAccordionValue: Setter<string[]>;
  setSelectedAIDictionaryEntry: Setter<{
    key: string;
    entry: AIDictionaryEntry;
  } | null>;
  setBibleWordBookSearchTerm: Setter<string>;
  setBibleWordBookWordAccordionValue: Setter<string[]>;
  setSelectedBibleWordBookEntry: Setter<{
    key: string;
    entry: BibleWordBookEntry;
  } | null>;
  setHitchcocksSearchTerm: Setter<string>;
  setSelectedHitchcocksEntry: Setter<{
    key: string;
    definition: string;
  } | null>;
  setOldEnglishSearchTerm: Setter<string>;
  setSelectedOldEnglishEntry: Setter<{
    key: string;
    definitions: string[];
  } | null>;
  setPhrasesSearchTerm: Setter<string>;
  setSelectedPhrasesEntry: Setter<{
    key: string;
    entry: PhraseEntry;
  } | null>;
  setUnitsSearchTerm: Setter<string>;
  setSelectedUnitsEntry: Setter<{
    key: string;
    entry: UnitsEntry;
  } | null>;
  setGenealogySearchTerm: Setter<string>;
  setSelectedGenealogyIds: Setter<string[]>;
  setMapsSearchTerm: Setter<string>;
  setSelectedMapsEntries: Setter<AncientMapEntry[]>;
  setStrongsError: Setter<string | null>;
  setIsStrongsLoading: Setter<boolean>;
  setStrongsSearchTerm: Setter<string>;
  setIsStrongsSearching: Setter<boolean>;
  setStrongsWordAccordionValue: Setter<string[]>;
  setSelectedStrongsEntry: Setter<StrongsSearchResult | null>;
  strongsSearchInputRef: RefObject<HTMLInputElement | null>;
};

export type OpenWordInStudyToolsArgs = {
  rawWord: string;
  bookIndex: number;
  chapterIndex: number;
  verseNumber: number | null;
  tokenIndex: number | null;
  strongCode: string | null;
};

export function useWordStudyCoordinator({
  books,
  concordance,
  websters,
  aiDictionary,
  bibleWordBook,
  hitchcocks,
  oldEnglish,
  phrases,
  units,
  genealogy,
  ancientMaps,
  strongsGreek,
  strongsHebrew,
  ensureConcordanceLoaded,
  ensureWebstersLoaded,
  ensureAIDictionaryLoaded,
  ensureBibleWordBookLoaded,
  ensureHitchcocksLoaded,
  ensureOldEnglishLoaded,
  ensurePhrasesLoaded,
  ensureUnitsLoaded,
  ensureGenealogyLoaded,
  ensureAncientMapsLoaded,
  ensureStrongsLoaded,
  openStudyTool,
  setNotesContext,
  setConcordanceAccordionValue,
  setConcordanceError,
  setIsConcordanceLoading,
  setConcordanceSearchTerm,
  setConcordanceWordAccordionValue,
  setSelectedConcordanceWord,
  setWebstersSearchTerm,
  setWebstersWordAccordionValue,
  setSelectedWebstersEntry,
  setAIDictionarySearchTerm,
  setAIDictionaryWordAccordionValue,
  setSelectedAIDictionaryEntry,
  setBibleWordBookSearchTerm,
  setBibleWordBookWordAccordionValue,
  setSelectedBibleWordBookEntry,
  setHitchcocksSearchTerm,
  setSelectedHitchcocksEntry,
  setOldEnglishSearchTerm,
  setSelectedOldEnglishEntry,
  setPhrasesSearchTerm,
  setSelectedPhrasesEntry,
  setUnitsSearchTerm,
  setSelectedUnitsEntry,
  setGenealogySearchTerm,
  setSelectedGenealogyIds,
  setMapsSearchTerm,
  setSelectedMapsEntries,
  setStrongsError,
  setIsStrongsLoading,
  setStrongsSearchTerm,
  setIsStrongsSearching,
  setStrongsWordAccordionValue,
  setSelectedStrongsEntry,
  strongsSearchInputRef,
}: WordStudyCoordinatorParams) {
  const requestIdRef = useRef(0);

  function openWordInStudyTools({
    rawWord,
    bookIndex,
    chapterIndex,
    verseNumber,
    tokenIndex,
    strongCode,
  }: OpenWordInStudyToolsArgs) {
    const requestId = ++requestIdRef.current;
    const isCurrentRequest = () => requestIdRef.current === requestId;
    const finishConcordanceMeasure = beginPerformanceMeasure(
      "kjv:study-word-concordance-selection",
    );
    const finishFirstToolsMeasure = beginPerformanceMeasure(
      "kjv:study-word-first-tools",
    );
    const finishAllToolsMeasure = beginPerformanceMeasure(
      "kjv:study-word-all-tools",
    );
    const matchingAccordionItems = new Set<string>(
      verseNumber !== null
        ? ["cross-refs", "concordance"]
        : ["concordance"],
    );
    const updateAccordionMatch = (
      item: (typeof STUDY_ACCORDION_ITEMS)[number],
      matches: boolean,
    ) => {
      if (!isCurrentRequest()) {
        return;
      }
      if (matches) {
        matchingAccordionItems.add(item);
      } else {
        matchingAccordionItems.delete(item);
      }
      setConcordanceAccordionValue(
        STUDY_ACCORDION_ITEMS.filter((candidate) =>
          matchingAccordionItems.has(candidate),
        ),
      );
    };

    setNotesContext(
      verseNumber !== null
        ? { bookIndex, chapterIndex, verseNumber, word: rawWord }
        : { bookIndex, chapterIndex, word: rawWord },
    );

    openStudyTool("concordance");
    setConcordanceError(null);
    setIsConcordanceLoading(true);
    setConcordanceSearchTerm("");
    setWebstersSearchTerm("");
    setAIDictionarySearchTerm("");
    setBibleWordBookSearchTerm("");
    setHitchcocksSearchTerm("");
    setOldEnglishSearchTerm("");
    setPhrasesSearchTerm("");
    setUnitsSearchTerm("");
    setGenealogySearchTerm("");
    setMapsSearchTerm("");
    setWebstersWordAccordionValue([]);
    setAIDictionaryWordAccordionValue([]);
    setBibleWordBookWordAccordionValue([]);
    setSelectedWebstersEntry(null);
    setSelectedAIDictionaryEntry(null);
    setSelectedBibleWordBookEntry(null);
    setSelectedHitchcocksEntry(null);
    setSelectedOldEnglishEntry(null);
    setSelectedPhrasesEntry(null);
    setSelectedUnitsEntry(null);
    setSelectedGenealogyIds([]);
    setSelectedMapsEntries([]);
    setStrongsWordAccordionValue([]);
    if (!strongCode) {
      setSelectedStrongsEntry(null);
    }

    const applyConcordanceSelection = (data: ConcordancePayload) => {
      if (!isCurrentRequest()) {
        return data;
      }
      const matchedKey = resolveConcordanceKey(data, rawWord) ?? rawWord;
      const references = decodeConcordanceReferences(data, matchedKey);
      setConcordanceWordAccordionValue([]);
      setSelectedConcordanceWord({ key: matchedKey, references });
      updateAccordionMatch("concordance", references.length > 0);
      setIsConcordanceLoading(false);
      finishConcordanceMeasure();
      return data;
    };

    const concordancePromise = concordance
      ? Promise.resolve(concordance)
      : ensureConcordanceLoaded().catch(() => null);

    if (concordance) {
      applyConcordanceSelection(concordance);
    } else {
      void concordancePromise
        .then((data) => {
          if (data && isCurrentRequest()) {
            applyConcordanceSelection(data);
          }
        })
        .catch(() => {
          if (!isCurrentRequest()) {
            return;
          }
          setSelectedConcordanceWord(null);
          setConcordanceWordAccordionValue([]);
          setIsConcordanceLoading(false);
          finishConcordanceMeasure();
        });
    }

    let strongsPromise:
      | Promise<{ greek: StrongsPayload; hebrew: StrongsPayload } | null>
      | null = null;
    if (strongCode) {
      setStrongsError(null);
      setIsStrongsLoading(true);
      setStrongsSearchTerm("");
      setIsStrongsSearching(false);
      if (strongsSearchInputRef.current) {
        strongsSearchInputRef.current.value = "";
      }
      strongsPromise =
        strongsGreek && strongsHebrew
          ? Promise.resolve({ greek: strongsGreek, hebrew: strongsHebrew })
          : ensureStrongsLoaded().catch((error) => {
              setStrongsError(
                error instanceof Error
                  ? error.message
                  : "Failed to load Strong's data",
              );
              return null;
            });
    }

    const webstersPromise = websters
      ? Promise.resolve(websters)
      : ensureWebstersLoaded().catch(() => null);
    const aiDictionaryPromise = aiDictionary
      ? Promise.resolve(aiDictionary)
      : ensureAIDictionaryLoaded().catch(() => null);
    const bibleWordBookPromise = bibleWordBook
      ? Promise.resolve(bibleWordBook)
      : ensureBibleWordBookLoaded().catch(() => null);
    const hitchcocksPromise = hitchcocks
      ? Promise.resolve(hitchcocks)
      : ensureHitchcocksLoaded().catch(() => null);
    const oldEnglishPromise = oldEnglish
      ? Promise.resolve(oldEnglish)
      : ensureOldEnglishLoaded().catch(() => null);
    const phrasesPromise = phrases
      ? Promise.resolve(phrases)
      : ensurePhrasesLoaded().catch(() => null);
    const unitsPromise = units
      ? Promise.resolve(units)
      : ensureUnitsLoaded().catch(() => null);
    const ancientMapsPromise = ancientMaps
      ? Promise.resolve(ancientMaps)
      : ensureAncientMapsLoaded().catch(() => null);
    const primaryToolDataPromise = Promise.all([
      webstersPromise,
      aiDictionaryPromise,
      bibleWordBookPromise,
      hitchcocksPromise,
      oldEnglishPromise,
      phrasesPromise,
      unitsPromise,
      ancientMapsPromise,
      strongsPromise ?? Promise.resolve(null),
    ]);
    const genealogyPromise = genealogy
      ? Promise.resolve(genealogy)
      : primaryToolDataPromise
          .then(
            () =>
              new Promise<void>((resolve) => {
                window.requestAnimationFrame(() => resolve());
              }),
          )
          .then(async () => {
            if (!isCurrentRequest()) {
              return null;
            }
            return (await mayHaveGenealogyMatch(rawWord))
              ? ensureGenealogyLoaded()
              : null;
          })
          .catch(() => null);

    void webstersPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matchedKey = resolveWebstersKey(data, rawWord);
      setSelectedWebstersEntry(
        matchedKey ? { key: matchedKey, entry: data[matchedKey] } : null,
      );
      updateAccordionMatch("websters", Boolean(matchedKey));
      if (matchedKey) finishFirstToolsMeasure();
    });

    void aiDictionaryPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const phraseSelection =
        tokenIndex !== null && verseNumber !== null
          ? resolveAIDictionarySelectionAtLocation(
              books,
              data,
              bookIndex,
              chapterIndex,
              verseNumber,
              tokenIndex,
            )
          : null;
      const matchedKey = resolveAIDictionaryKey(data, rawWord);
      const selection =
        phraseSelection ??
        (matchedKey ? { key: matchedKey, entry: data[matchedKey] } : null);
      setSelectedAIDictionaryEntry(selection);
      updateAccordionMatch("ai-dictionary", Boolean(selection));
      if (selection) finishFirstToolsMeasure();
    });

    void bibleWordBookPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matchedKey = resolveBibleWordBookKey(data, rawWord);
      setSelectedBibleWordBookEntry(
        matchedKey ? { key: matchedKey, entry: data[matchedKey] } : null,
      );
      updateAccordionMatch("bible-word-book", Boolean(matchedKey));
      if (matchedKey) finishFirstToolsMeasure();
    });

    void hitchcocksPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matchedKey = resolveHitchcocksKey(data, rawWord);
      setSelectedHitchcocksEntry(
        matchedKey ? { key: matchedKey, definition: data[matchedKey] } : null,
      );
      updateAccordionMatch("hitchcocks", Boolean(matchedKey));
      if (matchedKey) finishFirstToolsMeasure();
    });

    void oldEnglishPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matchedKey = resolveOldEnglishKey(data, rawWord);
      setSelectedOldEnglishEntry(
        matchedKey
          ? { key: matchedKey, definitions: data[matchedKey] ?? [] }
          : null,
      );
      if (matchedKey) {
        updateAccordionMatch("kjv-words-phrases", true);
        finishFirstToolsMeasure();
      }
    });

    void phrasesPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const selection =
        tokenIndex !== null && verseNumber !== null
          ? resolvePhraseSelectionAtLocation(
              books,
              data,
              bookIndex,
              chapterIndex,
              verseNumber,
              tokenIndex,
            )
          : null;
      setSelectedPhrasesEntry(selection);
      if (selection) {
        updateAccordionMatch("kjv-words-phrases", true);
        finishFirstToolsMeasure();
      }
    });

    void unitsPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matchedKey = resolveUnitsKey(data, rawWord);
      setSelectedUnitsEntry(
        matchedKey ? { key: matchedKey, entry: data[matchedKey] } : null,
      );
      if (matchedKey) {
        updateAccordionMatch("kjv-words-phrases", true);
        finishFirstToolsMeasure();
      }
    });

    void genealogyPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const referenceKey =
        verseNumber !== null
          ? chapterVerseKey(bookIndex, chapterIndex, verseNumber)
          : null;
      const matches = findGenealogyMatches(data, rawWord, referenceKey);
      setSelectedGenealogyIds(matches.map((person) => person.id));
      updateAccordionMatch("genealogy", matches.length > 0);
      if (matches.length > 0) finishFirstToolsMeasure();
    });

    void ancientMapsPromise.then((data) => {
      if (!data || !isCurrentRequest()) return;
      const matches = findMapMatches(data, rawWord);
      setSelectedMapsEntries(matches);
      updateAccordionMatch("maps", matches.length > 0);
      if (matches.length > 0) finishFirstToolsMeasure();
    });

    if (strongCode && strongsPromise) {
      void strongsPromise.then((data) => {
        if (!data || !isCurrentRequest()) return;
        const source = strongCode.startsWith("G") ? data.greek : data.hebrew;
        const entry = source[strongCode];
        setSelectedStrongsEntry(
          entry
            ? {
                code: strongCode,
                testament: strongCode.startsWith("G") ? "greek" : "hebrew",
                entry,
              }
            : null,
        );
        updateAccordionMatch("strongs", Boolean(entry));
        if (entry) finishFirstToolsMeasure();
      });
    }

    void Promise.all([
      concordancePromise,
      primaryToolDataPromise,
      genealogyPromise,
    ]).finally(() => {
      finishConcordanceMeasure();
      finishFirstToolsMeasure();
      finishAllToolsMeasure();
      if (strongCode && isCurrentRequest()) {
        setIsStrongsLoading(false);
      }
    });
  }

  return { openWordInStudyTools };
}
