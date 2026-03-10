import { BookUserIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StudySearchForm } from "@/components/reader/study-search-form";

type HitchcocksResult = { key: string; definition: string };

type HitchcocksToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: HitchcocksResult[];
  onSearch: (term: string) => void;
};

export function HitchcocksTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  onSearch,
}: HitchcocksToolProps) {
  return (
    <AccordionItem value="hitchcocks">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookUserIcon />
        Hitchcock&apos;s Bible Names
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="hitchcocks-search"
              placeholder="Search Hitchcock's..."
              ariaLabel="Search Hitchcock's Bible Names"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading Hitchcock's..." : "Searching Hitchcock's..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching names found."
                  : "Click a word in the text or search Hitchcock's Bible Names."}
              </p>
            ) : (
              <div className="space-y-2 text-sm leading-relaxed">
                {results.map(({ key, definition }) => (
                  <p key={key}>
                    <span className="font-semibold">{key}</span>
                    {": "}
                    {definition}
                  </p>
                ))}
              </div>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
