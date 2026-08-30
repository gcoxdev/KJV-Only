import { type ReactNode } from "react";
import { BookAIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ToolReferenceList } from "@/components/reader/tool-reference-list";
import { StudySearchForm } from "@/components/reader/study-search-form";

type ConcordanceEntry = { key: string; references: string[] };

type ConcordanceToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: ConcordanceEntry[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function ConcordanceTool({
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
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: ConcordanceToolProps) {
  return (
    <AccordionItem value="concordance">
      <AccordionTrigger
        className={cn(hasInfo && "text-success")}
      >
        <BookAIcon />
        Concordance
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="concordance-search"
              placeholder="Search concordance..."
              ariaLabel="Search concordance"
              loading={isLoading || isSearching}
              value={searchTerm}
              allowReset
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading concordance..." : "Searching concordance..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching words found."
                  : "Click a word in the text or search concordance."}
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
                  {results.map((entry) => (
                    <AccordionItem key={entry.key} value={entry.key}>
                      <AccordionTrigger className="min-w-0">
                        <span className="flex min-w-0 flex-1 items-start gap-2">
                          <span className="min-w-0 flex-1 break-words text-left">
                            {entry.key}
                          </span>
                          <Badge variant="outline" className="shrink-0">
                            {entry.references.length}
                          </Badge>
                        </span>
                      </AccordionTrigger>
                    <AccordionContent>
                      {entry.references.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No references found.</p>
                      ) : (
                        <ToolReferenceList
                          references={entry.references}
                          highlightWord={entry.key}
                          renderPreview={renderPreview}
                          onOpenReference={onOpenReference}
                          onCloseSidebar={onCloseSidebar}
                        />
                      )}
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
