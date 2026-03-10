import { Fragment, type ReactNode, useMemo } from "react";
import { EarthIcon, LoaderCircleIcon } from "lucide-react";

import { type AncientMapEntry } from "@/lib/maps";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { StudySearchForm } from "@/components/reader/study-search-form";

type MapsDisplayEntry = {
  entry: AncientMapEntry;
  itemKey: string;
  title: string;
  linkedPlaces: Array<{ roleKey: string; text: string }>;
};

type MapsToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  resultsLength: number;
  displayEntries: MapsDisplayEntry[];
  onSearch: (term: string) => void;
  onOpenMapDialog: (entry: AncientMapEntry) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

type DedupedLinkedPlace = {
  key: string;
  text: string;
};

function buildLinkedPlaces(entries: MapsDisplayEntry[]) {
  const index = new Map<string, DedupedLinkedPlace>();

  for (const entry of entries) {
    for (const place of entry.linkedPlaces) {
      const normalized = place.text.toLowerCase();
      if (index.has(normalized)) {
        continue;
      }

      index.set(normalized, {
        key: normalized,
        text: place.text,
      });
    }
  }

  return [...index.values()].sort((left, right) =>
    left.text.localeCompare(right.text),
  );
}

function buildReferences(entries: MapsDisplayEntry[]) {
  const seen = new Set<string>();
  const references: string[] = [];

  for (const entry of entries) {
    for (const reference of entry.entry.verses) {
      if (seen.has(reference)) {
        continue;
      }
      seen.add(reference);
      references.push(reference);
    }
  }

  return references;
}

export function MapsTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  resultsLength,
  displayEntries,
  onSearch,
  onOpenMapDialog,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: MapsToolProps) {
  const linkedPlaces = useMemo(
    () => buildLinkedPlaces(displayEntries),
    [displayEntries],
  );
  const references = useMemo(
    () => buildReferences(displayEntries),
    [displayEntries],
  );
  const previewWord = displayEntries[0]?.title || searchTerm.trim() || "Maps";

  return (
    <AccordionItem value="maps">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <EarthIcon />
        Maps
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="maps-search"
              placeholder="Search maps..."
              ariaLabel="Search maps"
              loading={isLoading || isSearching}
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading maps..." : "Searching maps..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : resultsLength === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching places found."
                  : "Click a word in the text or search maps."}
              </p>
            ) : (
              <div className="space-y-3 rounded-md border p-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Map Entries ({displayEntries.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {displayEntries.map(({ entry, itemKey, title }) => (
                      <div
                        key={itemKey}
                        className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/20 p-2"
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenMapDialog(entry)}
                        >
                          Open Map
                        </Button>
                        <span className="font-medium">{title}</span>
                        {entry.types.length > 0 ? (
                          <span className="text-xs text-muted-foreground">
                            {entry.types.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {linkedPlaces.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Linked Places ({linkedPlaces.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {linkedPlaces.map((place) => (
                        <span
                          key={place.key}
                          className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {place.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {references.length > 0 ? (
                  <Accordion className="w-full rounded-md border px-2" multiple>
                    <AccordionItem value="maps-references">
                      <AccordionTrigger>
                        {`References (${references.length})`}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="leading-7">
                          {references.map((reference, verseIndex) => (
                            <Fragment key={reference}>
                              <ConcordanceReferencePopover
                                reference={reference}
                                highlightWord={previewWord}
                                renderPreview={renderPreview}
                                onOpenReference={onOpenReference}
                                onCloseSidebar={onCloseSidebar}
                              />
                              {verseIndex < references.length - 1 ? ", " : null}
                            </Fragment>
                          ))}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : null}
              </div>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
