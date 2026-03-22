import { Fragment, type ReactNode } from "react";
import { LoaderCircleIcon, UserSearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { GenealogyPerson } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { StudySearchForm } from "@/components/reader/study-search-form";

type GenealogyToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: GenealogyPerson[];
  onSearch: (term: string) => void;
  renderPersonDetails: (person: GenealogyPerson) => ReactNode;
};

export function GenealogyTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  onSearch,
  renderPersonDetails,
}: GenealogyToolProps) {
  const referenceCountForPerson = (person: GenealogyPerson) =>
    (person.verses?.byName ?? []).reduce(
      (count, entry) => count + (entry.numVerses ?? entry.verses.length),
      0,
    );

  return (
    <AccordionItem value="genealogy">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <UserSearchIcon />
        Genealogy
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="genealogy-search"
              placeholder="Search genealogy..."
              ariaLabel="Search genealogy"
              loading={isLoading || isSearching}
              value={searchTerm}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading genealogy..." : "Searching genealogy..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching people found."
                  : "Click a name in the text or search genealogy."}
              </p>
            ) : searchTerm.trim() && results.length > 1 ? (
              <Accordion
                className="w-full rounded-xl border border-subtle-divider/80 px-2 [&_[data-slot=accordion-content]]:pb-1 [&_[data-slot=accordion-trigger]]:py-1"
                multiple
              >
                {results.map((person) => (
                  <AccordionItem
                    key={`${person.id}-${person.names[0] ?? "person"}`}
                    value={`genealogy-${person.id}`}
                  >
                    <AccordionTrigger className="min-w-0">
                      <span className="flex min-w-0 flex-1 items-start gap-2">
                        <span className="min-w-0 flex-1 break-words text-left">
                          {person.names[0] ?? person.id}
                        </span>
                        <Badge variant="outline" className="shrink-0">
                          {referenceCountForPerson(person)}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>{renderPersonDetails(person)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map((person) => (
                  <Fragment key={person.id}>{renderPersonDetails(person)}</Fragment>
                ))}
              </div>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
