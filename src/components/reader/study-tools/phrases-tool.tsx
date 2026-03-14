import { Fragment, type ReactNode } from "react";
import { BookTypeIcon, LoaderCircleIcon, BadgeInfoIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { StudySearchForm } from "@/components/reader/study-search-form";
import type { PhraseEntry } from "@/types/reader";

type PhrasesResult = { key: string; entry: PhraseEntry };

type PhrasesToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: PhrasesResult[];
  onSearch: (term: string) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function PhrasesTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  onSearch,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: PhrasesToolProps) {
  return (
    <AccordionItem value="phrases">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookTypeIcon />
        KJV Phrases
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="phrases-search"
              placeholder="Search phrases..."
              ariaLabel="Search KJV phrases"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading phrases..." : "Searching phrases..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching phrase found."
                  : "Click a phrase in the text or search KJV phrases."}
              </p>
            ) : (
              <div className="flex flex-col gap-2 text-sm">
                {results.map(({ key, entry }) => (
                  <div
                    key={key}
                    className="rounded-xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{key}</span>
                      <Badge variant="outline">Phrase</Badge>
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
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
