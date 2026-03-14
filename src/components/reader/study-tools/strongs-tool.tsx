import { Fragment, type ReactNode, type Ref } from "react";
import { BookKeyIcon, LoaderCircleIcon } from "lucide-react";

import { tokenizeStrongsDerivation } from "@/lib/references";
import { cn } from "@/lib/utils";
import type { StrongsEntry } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { StudySearchForm } from "@/components/reader/study-search-form";
import { Badge } from "@/components/ui/badge";

type StrongsResult = {
  code: string;
  testament: "greek" | "hebrew";
  entry: StrongsEntry;
};

type StrongsToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: StrongsResult[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
  onOpenLinkedStrongsEntry: (code: string) => void;
  inputRef: Ref<HTMLInputElement>;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function StrongsTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  wordAccordionValue,
  onWordAccordionValueChange,
  onSearch,
  onOpenLinkedStrongsEntry,
  inputRef,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: StrongsToolProps) {
  return (
    <AccordionItem value="strongs">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookKeyIcon />
        Strong&apos;s Dictionary
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              inputRef={inputRef}
              name="strongs-search"
              placeholder="Search Strong's..."
              ariaLabel="Search Strong's dictionary"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading Strong's..." : "Searching Strong's..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching entries found."
                  : "Click a Strong's-tagged word or search Strong's dictionary."}
              </p>
            ) : (
              <Accordion
                className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-content]]:pb-1 [&_[data-slot=accordion-trigger]]:py-1 [&_[data-slot=accordion-trigger]>svg]:transition-none"
                multiple
                value={wordAccordionValue}
                onValueChange={(value) =>
                  onWordAccordionValueChange(value.filter(Boolean) as string[])
                }
              >
                {results.map(({ code, testament, entry }) => (
                  <AccordionItem key={code} value={code}>
                    <AccordionTrigger>{`${code} (${testament})`}</AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm">
                      {entry.kjv_def ? (
                        <p>
                          <span className="text-muted-foreground">KJV Definition:</span>{" "}
                          {entry.kjv_def}
                        </p>
                      ) : null}
                      {entry.kjv_refs && Object.keys(entry.kjv_refs).length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">KJV References</p>
                          <Accordion
                            className="w-full rounded-md border px-2 [&_[data-slot=accordion-content]]:pb-1 [&_[data-slot=accordion-trigger]]:py-1"
                            multiple
                          >
                            {Object.entries(entry.kjv_refs).map(([word, references]) => (
                              <AccordionItem key={`${code}-${word}`} value={`${code}-${word}`}>
                                <AccordionTrigger>
                                  <span className="flex items-center gap-2">
                                    <span>{word}</span>
                                    <Badge variant="outline">{references.length}</Badge>
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-wrap gap-2">
                                    {references.map((reference, index) => (
                                      <Fragment key={`${code}-${word}-${reference}-${index}`}>
                                        <ConcordanceReferencePopover
                                          reference={reference}
                                          highlightWord={word}
                                          renderPreview={renderPreview}
                                          onOpenReference={onOpenReference}
                                          onCloseSidebar={onCloseSidebar}
                                        />
                                      </Fragment>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      ) : null}
                      {entry.strongs_def ? (
                        <p>
                          <span className="text-muted-foreground">Strong&apos;s Definition:</span>{" "}
                          {entry.strongs_def}
                        </p>
                      ) : null}
                      {entry.lemma ? (
                        <p>
                          <span className="text-muted-foreground">Lemma:</span>{" "}
                          <span className="font-mono">{entry.lemma}</span>
                        </p>
                      ) : null}
                      {entry.translit ? (
                        <p>
                          <span className="text-muted-foreground">Transliteration:</span>{" "}
                          <span className="font-mono">{entry.translit}</span>
                        </p>
                      ) : null}
                      {entry.pron ? (
                        <p>
                          <span className="text-muted-foreground">Pronunciation:</span>{" "}
                          {entry.pron}
                        </p>
                      ) : null}
                      {entry.derivation ? (
                        <p>
                          <span className="text-muted-foreground">Derivation:</span>{" "}
                          {tokenizeStrongsDerivation(entry.derivation).map((token, index) =>
                            token.type === "strongs" ? (
                              <button
                                key={`${code}-derivation-${token.value}-${index}`}
                                type="button"
                                className="font-mono text-primary underline-offset-4 hover:underline"
                                onClick={() => onOpenLinkedStrongsEntry(token.value)}
                              >
                                {token.value}
                              </button>
                            ) : (
                              <Fragment key={`${code}-derivation-text-${index}`}>
                                {token.value}
                              </Fragment>
                            ),
                          )}
                        </p>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
