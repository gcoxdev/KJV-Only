import { BookCheckIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StudySearchForm } from "@/components/reader/study-search-form";

type OldEnglishResult = { key: string; definitions: string[] };

type OldEnglishToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: OldEnglishResult[];
  onSearch: (term: string) => void;
};

export function OldEnglishTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  onSearch,
}: OldEnglishToolProps) {
  return (
    <AccordionItem value="old-english">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookCheckIcon />
        Old English Dictionary
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="old-english-search"
              placeholder="Search Old English..."
              ariaLabel="Search Old English dictionary"
              loading={isLoading || isSearching}
              value={searchTerm}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading Old English..." : "Searching Old English..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching words found."
                  : "Click a word in the text or search Old English dictionary."}
              </p>
            ) : (
              <div className="space-y-2 text-sm leading-relaxed">
                {results.map(({ key, definitions }) => (
                  <p key={key}>
                    <span className="font-semibold">{key}</span>
                    {": "}
                    {definitions.join("; ")}
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
