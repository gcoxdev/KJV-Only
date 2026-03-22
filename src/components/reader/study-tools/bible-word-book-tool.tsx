import {
  BadgeInfoIcon,
  BookMarkedIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { BibleWordBookEntry } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StudySearchForm } from "@/components/reader/study-search-form";

type BibleWordBookResult = { key: string; entry: BibleWordBookEntry };

type BibleWordBookToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: BibleWordBookResult[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
};

export function BibleWordBookTool({
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
}: BibleWordBookToolProps) {
  return (
    <AccordionItem value="bible-word-book">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookMarkedIcon />
        Bible Word-Book
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="bible-word-book-search"
              placeholder="Search Bible Word-Book..."
              ariaLabel="Search Bible Word-Book"
              loading={isLoading || isSearching}
              value={searchTerm}
              allowReset
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading Bible Word-Book..." : "Searching Bible Word-Book..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching entry found."
                  : "Click a word in the text or search the Bible Word-Book."}
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
                {results.map(({ key, entry }) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger>
                      <span className="truncate">{key}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 text-sm leading-relaxed">
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.partOfSpeechLabel ? (
                          <Badge variant="outline">{entry.partOfSpeechLabel}</Badge>
                        ) : null}
                        {entry.partOfSpeech ? (
                          <Badge variant="outline">{entry.partOfSpeech}</Badge>
                        ) : null}
                        {entry.aliases?.length ? (
                          <Badge variant="outline">
                            {entry.aliases.length} alias
                            {entry.aliases.length === 1 ? "" : "es"}
                          </Badge>
                        ) : null}
                        {entry.sourceReferences?.length ? (
                          <Badge variant="outline">
                            {entry.sourceReferences.length} source refs
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground">{entry.meaning}</p>
                      {entry.aliases?.length ? (
                        <p className="text-xs text-muted-foreground">
                          Also: {entry.aliases.join(", ")}
                        </p>
                      ) : null}
                      {entry.sourceReferences?.length ? (
                        <p className="text-xs text-muted-foreground">
                          Source refs: {entry.sourceReferences.join("; ")}
                        </p>
                      ) : null}
                      {entry.body ? (
                        <details className="rounded-md border px-2">
                          <summary className="cursor-pointer py-2 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                            Literary References
                          </summary>
                          <div className="pb-2">
                            <p className="whitespace-pre-line text-sm leading-relaxed">
                              {entry.body}
                            </p>
                          </div>
                        </details>
                      ) : null}
                      <p className="flex items-start gap-2 text-xs text-muted-foreground">
                        <BadgeInfoIcon className="mt-0.5 size-3 shrink-0" />
                        <span>
                          First-pass OCR extraction from William Aldis Wright&apos;s
                          <em> The Bible Word-Book</em>.
                        </span>
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <a
              href="https://archive.org/details/biblewordbookglo00wrig/mode/2up"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ExternalLinkIcon className="size-3.5" />
              Open scanned book
            </a>
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
