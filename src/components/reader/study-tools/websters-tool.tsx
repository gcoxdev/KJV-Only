import { LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WebstersEntry } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StudySearchForm } from "@/components/reader/study-search-form";

type WebstersResult = { key: string; entry: WebstersEntry };

type WebstersToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: WebstersResult[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
};

export function WebstersTool({
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
}: WebstersToolProps) {
  return (
    <AccordionItem value="websters">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        Webster&apos;s 1828 Dictionary
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="websters-search"
              placeholder="Search Webster's..."
              ariaLabel="Search Webster's dictionary"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading Webster's..." : "Searching Webster's..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching words found."
                  : "Search Webster's 1828 dictionary."}
              </p>
            ) : (
              <Accordion
                className="w-full rounded-md border px-2 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
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
                      {entry.pronunciation ? (
                        <p className="text-sm text-muted-foreground">{entry.pronunciation}</p>
                      ) : null}
                      {entry.definitions.length > 0 ? (
                        <div className="space-y-2 text-sm">
                          {entry.definitions.map((definition, index) => (
                            <div key={`${key}-definition-${index}`} className="space-y-1">
                              <p className="font-medium capitalize">{definition.type}</p>
                              <p
                                className="leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: definition.text }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No definitions found.</p>
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
