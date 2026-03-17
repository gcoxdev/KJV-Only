import { BrainCircuitIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AIDictionaryEntry } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StudySearchForm } from "@/components/reader/study-search-form";

type AIDictionaryResult = { key: string; entry: AIDictionaryEntry };

type AIDictionaryToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: AIDictionaryResult[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
};

export function AIDictionaryTool({
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
}: AIDictionaryToolProps) {
  return (
    <AccordionItem value="ai-dictionary">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BrainCircuitIcon />
        AI Dictionary
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="ai-dictionary-search"
              placeholder="Search AI Dictionary..."
              ariaLabel="Search AI Dictionary"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading AI Dictionary..." : "Searching AI Dictionary..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching AI Dictionary entry found."
                  : "Search the AI Dictionary or click a harder KJV word in the text."}
              </p>
            ) : (
              <Accordion
                className="w-full rounded-md border px-2 **:data-[slot=accordion-content]:pb-1 **:data-[slot=accordion-trigger]:py-1 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                multiple
                value={wordAccordionValue}
                onValueChange={(value) =>
                  onWordAccordionValueChange(value.filter(Boolean) as string[])
                }
              >
                {results.map(({ key, entry }) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger>{key}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.classification ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.classification}
                          </Badge>
                        ) : null}
                        {entry.partOfSpeech ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.partOfSpeech}
                          </Badge>
                        ) : null}
                        {entry.confidence ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.confidence} confidence
                          </Badge>
                        ) : null}
                      </div>
                      <div className="space-y-2 text-sm leading-relaxed">
                        {entry.definitions.map((definition, index) => (
                          <p key={`${key}-definition-${index}`}>{definition}</p>
                        ))}
                      </div>
                      {entry.aliases?.length ? (
                        <p className="text-xs text-muted-foreground">
                          Also: {entry.aliases.join(", ")}
                        </p>
                      ) : null}
                      {entry.note ? (
                        <p
                          className={cn(
                            "text-xs text-muted-foreground",
                            entry.note.startsWith("Location:") &&
                              "rounded-sm border border-border/60 bg-muted/40 px-2 py-1",
                          )}
                        >
                          {entry.note}
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
