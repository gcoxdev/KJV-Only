import { Fragment, type ReactNode } from "react";
import { LoaderCircleIcon } from "lucide-react";

import { type AncientMapEntry, cleanMapMarkup, deriveMapPhotoDialogItems } from "@/lib/maps";
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

type MapPhotoEntry = {
  id: string;
  credit?: string;
  descriptions?: Record<string, string>;
  thumbnails?: Record<string, { file?: string; description?: string }>;
};

type MapsDisplayEntry = {
  entry: AncientMapEntry;
  itemKey: string;
  title: string;
  modernIds: string[];
  photoEntries: MapPhotoEntry[];
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
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  onSearch: (term: string) => void;
  onOpenMapDialog: (entry: AncientMapEntry) => void;
  isMapImagesLoading: boolean;
  mapImagesError: string | null;
  onOpenPhotoDialog: (items: Array<{ id: string; src: string; alt: string; caption: string }>, startIndex: number) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function MapsTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  resultsLength,
  displayEntries,
  wordAccordionValue,
  onWordAccordionValueChange,
  onSearch,
  onOpenMapDialog,
  isMapImagesLoading,
  mapImagesError,
  onOpenPhotoDialog,
  renderPreview,
  onOpenReference,
  onCloseSidebar,
}: MapsToolProps) {
  return (
    <AccordionItem value="maps">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        Maps &amp; Photos
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="maps-search"
              placeholder="Search maps and photos..."
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
              <Accordion
                className="w-full rounded-md border px-2"
                multiple
                value={wordAccordionValue}
                onValueChange={(value) =>
                  onWordAccordionValueChange(value.filter(Boolean) as string[])
                }
              >
                {displayEntries.map(
                  ({ entry, itemKey, title, modernIds, photoEntries, linkedPlaces }) => (
                    <AccordionItem key={itemKey} value={itemKey}>
                      <AccordionTrigger>{title}</AccordionTrigger>
                      <AccordionContent className="space-y-2 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenMapDialog(entry)}
                          >
                            Open Map
                          </Button>
                          {entry.types.length > 0 ? (
                            <span className="text-xs text-muted-foreground">
                              {entry.types.join(", ")}
                            </span>
                          ) : null}
                        </div>
                        {entry.translations.length > 1 ? (
                          <p className="text-muted-foreground">
                            Also: {entry.translations.slice(1).join(", ")}
                          </p>
                        ) : null}
                        {linkedPlaces.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Linked Places ({linkedPlaces.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {linkedPlaces.map((place) => (
                                <span
                                  key={`${itemKey}-${place.roleKey}`}
                                  className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  {place.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                        <Accordion className="w-full rounded-md border px-2" multiple>
                          <AccordionItem value={`${itemKey}-references`}>
                            <AccordionTrigger>
                              {`References (${entry.verses.length})`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <p className="leading-7">
                                {entry.verses.map((reference, verseIndex) => (
                                  <Fragment key={`${itemKey}-${reference}`}>
                                    <ConcordanceReferencePopover
                                      reference={reference}
                                      highlightWord={title}
                                      renderPreview={renderPreview}
                                      onOpenReference={onOpenReference}
                                      onCloseSidebar={onCloseSidebar}
                                    />
                                    {verseIndex < entry.verses.length - 1 ? ", " : null}
                                  </Fragment>
                                ))}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        {isMapImagesLoading ? (
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <LoaderCircleIcon className="size-3.5 animate-spin" />
                            Loading photos...
                          </p>
                        ) : mapImagesError ? (
                          <p className="text-xs text-destructive">{mapImagesError}</p>
                        ) : photoEntries.length > 0 ? (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Photos ({photoEntries.length})
                            </p>
                            {(() => {
                              const dialogPhotos = deriveMapPhotoDialogItems(
                                photoEntries.slice(0, 9),
                                modernIds,
                                title,
                              );

                              return (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {photoEntries.slice(0, 9).map((image) => {
                                    const imageLocationKey = modernIds.find((id) =>
                                      Boolean(
                                        image.thumbnails?.[id]?.file ??
                                          image.descriptions?.[id],
                                      ),
                                    );
                                    const thumbFile = imageLocationKey
                                      ? image.thumbnails?.[imageLocationKey]?.file
                                      : undefined;
                                    const thumbDescription = imageLocationKey
                                      ? (image.thumbnails?.[imageLocationKey]?.description ??
                                        image.descriptions?.[imageLocationKey])
                                      : undefined;

                                    const clickedIndex = dialogPhotos.findIndex(
                                      (item) => item.id === image.id,
                                    );

                                    return (
                                      <button
                                        key={`${itemKey}-${image.id}`}
                                        type="button"
                                        className="group block overflow-hidden rounded border bg-muted/30 text-left"
                                        onClick={() =>
                                          onOpenPhotoDialog(
                                            dialogPhotos,
                                            Math.max(0, clickedIndex),
                                          )
                                        }
                                        disabled={!thumbFile}
                                      >
                                        {thumbFile ? (
                                          <img
                                            src={`/maps/thumbnails/${thumbFile}`}
                                            alt={cleanMapMarkup(thumbDescription ?? title)}
                                            className="aspect-4/3 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                            loading="lazy"
                                          />
                                        ) : (
                                          <div className="flex aspect-4/3 items-center justify-center text-[11px] text-muted-foreground">
                                            No local thumbnail
                                          </div>
                                        )}
                                        <div className="px-1.5 py-1 text-[11px] text-muted-foreground">
                                          {cleanMapMarkup(
                                            thumbDescription ?? image.credit ?? title,
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        ) : null}
                      </AccordionContent>
                    </AccordionItem>
                  ),
                )}
              </Accordion>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
