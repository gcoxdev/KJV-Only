import { Fragment, type ReactNode } from "react";
import { BookSearchIcon, LoaderCircleIcon } from "lucide-react";

import type { Book } from "@/types/bible";
import { cn } from "@/lib/utils";
import { parseBibleReference } from "@/lib/references";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { Badge } from "@/components/ui/badge";

type CrossRefsToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  selected: { key: string; references: string[] } | null;
  books: Book[];
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

function selectedLabel(selectedKey: string, books: Book[]) {
  const parsed = parseBibleReference(selectedKey);
  if (!parsed) {
    return selectedKey;
  }
  const book = books[parsed.bookIndex];
  return `${book?.name ?? parsed.bookCode} ${parsed.startChapterIndex + 1}:${parsed.startVerse}`;
}

export function CrossRefsTool({
  hasInfo,
  isOpen,
  isLoading,
  error,
  selected,
  books,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: CrossRefsToolProps) {
  return (
    <AccordionItem value="cross-refs">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BookSearchIcon />
        Cross References
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            {isLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                Loading cross references...
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : !selected ? (
              <p className="text-sm text-muted-foreground">
                Click a word or verse to load cross references.
              </p>
            ) : selected.references.length === 0 ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedLabel(selected.key, books)}</p>
                <p className="text-sm text-muted-foreground">No cross references found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{selectedLabel(selected.key, books)}</p>
                <Accordion className="w-full rounded-md border px-2" multiple>
                  <AccordionItem value="cross-refs-references">
                    <AccordionTrigger>
                      <span className="flex items-center gap-2">
                        <span>References</span>
                        <Badge variant="outline">{selected.references.length}</Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-2">
                        {selected.references.map((reference, index) => (
                          <Fragment key={`${selected.key}-${reference}-${index}`}>
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
                </Accordion>
              </div>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
