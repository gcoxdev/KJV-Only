import { useId, useState } from "react";
import {
  BookMarkedIcon,
  Clock3Icon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  searchDefinitionKey,
  searchDefinitionLabel,
} from "@/lib/search-features";
import type {
  RecentSearch,
  SavedSearch,
} from "@/lib/search-library";
import type { SearchDefinition, SearchMode } from "@/types/reader";

const MODE_LABELS: Record<SearchMode, string> = {
  smart: "Smart",
  "contains-any": "Contains any",
  "contains-all": "Contains all",
  regex: "Regular expression",
};

type SearchLibraryControlsProps = {
  currentDefinition: SearchDefinition | null;
  saved: SavedSearch[];
  recent: RecentSearch[];
  onLoad: (definition: SearchDefinition) => void;
  onSave: (name: string, definition: SearchDefinition) => boolean;
  onRemoveSaved: (id: string) => void;
  onClearRecent: () => void;
};

function definitionSummary(definition: SearchDefinition) {
  const details = [
    MODE_LABELS[definition.searchMode],
    `${definition.selectedBookIndexes.length} book${definition.selectedBookIndexes.length === 1 ? "" : "s"}`,
  ];
  if (definition.caseSensitive) {
    details.push("case-sensitive");
  }
  if (definition.resultSort === "canonical") {
    details.push("Bible order");
  }
  if (definition.showResultContext) {
    details.push("context");
  }
  return details.join(" • ");
}

function SearchDefinitionText({ definition }: { definition: SearchDefinition }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">
        {searchDefinitionLabel(definition)}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {definitionSummary(definition)}
      </p>
    </div>
  );
}

export function SearchLibraryControls({
  currentDefinition,
  saved,
  recent,
  onLoad,
  onSave,
  onRemoveSaved,
  onClearRecent,
}: SearchLibraryControlsProps) {
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [name, setName] = useState("");
  const nameInputId = useId();

  const openSaveDialog = () => {
    if (!currentDefinition) {
      return;
    }
    setName(searchDefinitionLabel(currentDefinition).slice(0, 120));
    setIsSaveOpen(true);
  };

  const load = (definition: SearchDefinition) => {
    onLoad(definition);
    setIsLibraryOpen(false);
  };

  const save = () => {
    const cleanName = name.trim();
    if (!currentDefinition || !cleanName) {
      return;
    }
    const persisted = onSave(cleanName, currentDefinition);
    setIsSaveOpen(false);
    if (persisted) {
      toast.success("Search saved locally.");
    } else {
      toast.error("The search is available for this session but could not be stored.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!currentDefinition}
        onClick={openSaveDialog}
      >
        <SaveIcon data-icon="inline-start" />
        Save Search
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsLibraryOpen(true)}
      >
        <BookMarkedIcon data-icon="inline-start" />
        Saved &amp; Recent
      </Button>

      <Dialog open={isSaveOpen} onOpenChange={setIsSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save this query and book scope on this device.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={nameInputId}>Name</FieldLabel>
              <Input
                id={nameInputId}
                value={name}
                maxLength={120}
                autoFocus
                onChange={(event) => setName(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    save();
                  }
                }}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsSaveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!name.trim()} onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saved Searches &amp; History</DialogTitle>
            <DialogDescription>
              These entries stay in this browser. Loading one restores its query,
              mode, scope, sorting, and context settings.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh] pr-3">
            <div className="flex flex-col gap-4">
              <section aria-labelledby="saved-searches-heading">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 id="saved-searches-heading" className="text-sm font-medium">
                    Saved Searches
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {saved.length}/50
                  </span>
                </div>
                {saved.length === 0 ? (
                  <p className="rounded-xl border p-3 text-sm text-muted-foreground">
                    No saved searches yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {saved.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 rounded-xl border p-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {entry.name}
                          </p>
                          <SearchDefinitionText definition={entry.definition} />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => load(entry.definition)}
                        >
                          Load
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete saved search ${entry.name}`}
                          onClick={() => onRemoveSaved(entry.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <Separator />

              <section aria-labelledby="recent-searches-heading">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3
                    id="recent-searches-heading"
                    className="inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    <Clock3Icon className="size-4" />
                    Recent Searches
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={recent.length === 0}
                    onClick={onClearRecent}
                  >
                    Clear History
                  </Button>
                </div>
                {recent.length === 0 ? (
                  <p className="rounded-xl border p-3 text-sm text-muted-foreground">
                    Completed searches will appear here.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recent.map((entry) => (
                      <button
                        key={`${entry.usedAt}-${searchDefinitionKey(entry.definition)}`}
                        type="button"
                        className="flex w-full items-center gap-2 rounded-xl border p-2 text-left hover:bg-muted/50"
                        onClick={() => load(entry.definition)}
                      >
                        <SearchDefinitionText definition={entry.definition} />
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Load
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
