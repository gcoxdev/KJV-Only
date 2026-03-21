import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookTextIcon, LoaderCircleIcon } from "lucide-react";

import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { StudySearchForm } from "@/components/reader/study-search-form";
import { cn } from "@/lib/utils";
import { TOPIC_LETTERS } from "@/hooks/use-topics-tool";

type TopicEntry = {
  topic: string;
  references: string[];
};

type TopicsContentProps = {
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  selectedLetters: string[];
  availableLetters: string[];
  results: TopicEntry[];
  topicAccordionValue: string[];
  onTopicAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
  onSelectLetter: (letter: string) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function TopicsContent({
  isLoading,
  isSearching,
  error,
  searchTerm,
  selectedLetters,
  availableLetters,
  results,
  topicAccordionValue,
  onTopicAccordionValueChange,
  onSearch,
  onSelectLetter,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: TopicsContentProps) {
  const availableLetterSet = new Set(availableLetters);
  const selectedLetterSet = new Set(selectedLetters);
  const isFiltering = searchTerm.trim().length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-x-hidden px-1 py-1">
      <StudySearchForm
        name="topics-search"
        placeholder="Filter topics..."
        ariaLabel="Filter topics"
        loading={isLoading || isSearching}
        value={searchTerm}
        liveSearch
        onSearch={onSearch}
      />
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
        {TOPIC_LETTERS.map((letter) => {
          const disabled = !availableLetterSet.has(letter);
          return (
            <Button
              key={letter}
              type="button"
              size="sm"
              variant={selectedLetterSet.has(letter) ? "default" : "outline"}
              className="h-8 px-0"
              disabled={disabled}
              onClick={() => onSelectLetter(letter)}
            >
              {letter}
            </Button>
          );
        })}
      </div>
      {isFiltering ? (
        <p className="text-sm text-muted-foreground">
          Showing topics similar to <span className="font-medium text-foreground">{searchTerm.trim()}</span>.
        </p>
      ) : selectedLetters.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Showing topics that begin with <span className="font-medium text-foreground">{selectedLetters.join(", ")}</span>.
        </p>
      ) : null}
      {isLoading || isSearching ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircleIcon className="size-4 animate-spin" />
          {isLoading ? "Loading topics..." : "Filtering topics..."}
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !isFiltering && selectedLetters.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Choose one or more letters to browse topics, or start typing to filter them.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No topics match the current filter.
        </p>
      ) : (
        <Accordion
          className="min-w-0 w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-content]]:pb-1 [&_[data-slot=accordion-trigger]]:py-1 [&_[data-slot=accordion-trigger]>svg]:transition-none"
          multiple
          value={topicAccordionValue}
          onValueChange={(value) =>
            onTopicAccordionValueChange(value.filter(Boolean) as string[])
          }
        >
          {results.map((entry) => (
            <AccordionItem key={entry.topic} value={entry.topic} className="min-w-0">
              <AccordionTrigger className="min-w-0">
                <span className="flex min-w-0 flex-1 items-start gap-2">
                  <span className="min-w-0 flex-1 break-words text-left">
                    {entry.topic}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {entry.references.length}
                  </Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {entry.references.map((reference, index) => (
                    <Fragment key={`${entry.topic}-${reference}-${index}`}>
                      <ConcordanceReferencePopover
                        reference={reference}
                        highlightWord=""
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
      )}
    </div>
  );
}

type TopicsToolProps = TopicsContentProps & {
  hasInfo: boolean;
  isOpen: boolean;
};

export function TopicsTool({ hasInfo, isOpen, ...props }: TopicsToolProps) {
  return (
    <AccordionItem value="topics">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookTextIcon />
        Topics
      </AccordionTrigger>
      <AccordionContent className="overflow-visible">
        {isOpen ? <TopicsContent {...props} /> : null}
      </AccordionContent>
    </AccordionItem>
  );
}

export type TopicsPanelProps = TopicsContentProps;

export function TopicsPanel(props: TopicsPanelProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-auto [contain:inline-size]">
      <TopicsContent {...props} />
    </div>
  );
}
