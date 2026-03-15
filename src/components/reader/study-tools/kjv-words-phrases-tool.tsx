import { Fragment, type ReactNode } from "react";
import {
  BadgeInfoIcon,
  BookCheckIcon,
  BookTypeIcon,
  LoaderCircleIcon,
  RulerIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { StudySearchForm } from "@/components/reader/study-search-form";
import type { PhraseEntry, UnitsEntry } from "@/types/reader";

type OldEnglishResult = { key: string; definitions: string[] };
type PhrasesResult = { key: string; entry: PhraseEntry };
type UnitsResult = { key: string; entry: UnitsEntry };

type KJVWordsPhrasesToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  oldEnglish: {
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    searchTerm: string;
    results: OldEnglishResult[];
  };
  phrases: {
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    searchTerm: string;
    results: PhrasesResult[];
  };
  units: {
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    searchTerm: string;
    results: UnitsResult[];
  };
  onSearch: (term: string) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

const CATEGORY_LABELS: Record<UnitsEntry["category"], string> = {
  length: "Length",
  weight: "Weight",
  volume: "Volume",
  currency: "Money",
  time: "Time",
};

export function KJVWordsPhrasesTool({
  hasInfo,
  isOpen,
  oldEnglish,
  phrases,
  units,
  onSearch,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: KJVWordsPhrasesToolProps) {
  const searchTerm =
    oldEnglish.searchTerm || phrases.searchTerm || units.searchTerm || "";
  const isLoading =
    oldEnglish.isLoading || phrases.isLoading || units.isLoading;
  const isSearching =
    oldEnglish.isSearching || phrases.isSearching || units.isSearching;
  const error = oldEnglish.error || phrases.error || units.error;
  const hasResults =
    oldEnglish.results.length > 0 ||
    phrases.results.length > 0 ||
    units.results.length > 0;

  return (
    <AccordionItem value="kjv-words-phrases">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookCheckIcon />
        KJV Words &amp; Phrases
      </AccordionTrigger>
      <AccordionContent className="space-y-3 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="kjv-words-phrases-search"
              placeholder="Search words, phrases, or units..."
              ariaLabel="Search KJV words and phrases"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading
                  ? "Loading KJV words and phrases..."
                  : "Searching KJV words and phrases..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : !hasResults ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching word, phrase, or unit found."
                  : "Click a word or phrase in the text, or search KJV words and phrases."}
              </p>
            ) : (
              <div className="space-y-3">
                {phrases.results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Phrases
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                      {phrases.results.map(({ key, entry }) => (
                        <div
                          key={`phrase-${key}`}
                          className="rounded-xl border border-border/70 bg-background/70 p-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{key}</span>
                            <Badge variant="outline">
                              <BookTypeIcon className="size-3" />
                              Phrase
                            </Badge>
                          </div>
                          <p className="mt-2 text-muted-foreground">{entry.meaning}</p>
                          {entry.aliases?.length ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Also: {entry.aliases.join(", ")}
                            </p>
                          ) : null}
                          {entry.references?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.references.map((reference) => (
                                <Fragment key={reference}>
                                  <ConcordanceReferencePopover
                                    reference={reference}
                                    highlightWord={key}
                                    renderPreview={renderPreview}
                                    onOpenReference={onOpenReference}
                                    onCloseSidebar={onCloseSidebar}
                                  />
                                </Fragment>
                              ))}
                            </div>
                          ) : null}
                          {entry.note ? (
                            <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                              <BadgeInfoIcon className="mt-0.5 size-3 shrink-0" />
                              <span>{entry.note}</span>
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {oldEnglish.results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Word Meanings
                    </p>
                    <div className="space-y-2 text-sm leading-relaxed">
                      {oldEnglish.results.map(({ key, definitions }) => (
                        <div
                          key={`old-english-${key}`}
                          className="rounded-xl border border-border/70 bg-background/70 p-3"
                        >
                          <p>
                            <span className="font-semibold">{key}</span>
                            {": "}
                            {definitions.join("; ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {units.results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Units and Measures
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                      {units.results.map(({ key, entry }) => (
                        <div
                          key={`unit-${key}`}
                          className="rounded-xl border border-border/70 bg-background/70 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{key}</span>
                            <Badge variant="outline">
                              <RulerIcon className="size-3" />
                              {CATEGORY_LABELS[entry.category]}
                            </Badge>
                          </div>
                          <p className="mt-2 text-muted-foreground">{entry.summary}</p>
                          <p className="mt-2 font-medium">{entry.approximate}</p>
                          {entry.aliases?.length ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Also: {entry.aliases.join(", ")}
                            </p>
                          ) : null}
                          {entry.references?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.references.map((reference) => (
                                <Fragment key={reference}>
                                  <ConcordanceReferencePopover
                                    reference={reference}
                                    highlightWord={key}
                                    renderPreview={renderPreview}
                                    onOpenReference={onOpenReference}
                                    onCloseSidebar={onCloseSidebar}
                                  />
                                </Fragment>
                              ))}
                            </div>
                          ) : null}
                          {entry.note ? (
                            <p className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                              <BadgeInfoIcon className="mt-0.5 size-3 shrink-0" />
                              <span>{entry.note}</span>
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
