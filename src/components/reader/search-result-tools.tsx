import { useId } from "react";
import {
  BarChart3Icon,
  CopyIcon,
  DownloadIcon,
  ListTreeIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchFacets, SearchResultSort } from "@/types/reader";

type SearchResultToolsProps = {
  facets: SearchFacets | null;
  resultSort: SearchResultSort;
  showContext: boolean;
  onSortChange: (sort: SearchResultSort) => void;
  onShowContextChange: (show: boolean) => void;
  onCopy: () => void;
  onExport: () => void;
};

export function SearchResultTools({
  facets,
  resultSort,
  showContext,
  onSortChange,
  onShowContextChange,
  onCopy,
  onExport,
}: SearchResultToolsProps) {
  const contextInputId = useId();

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm">
              <BarChart3Icon data-icon="inline-start" />
              Facets
            </Button>
          }
        />
        <PopoverContent align="end" className="w-72 p-3">
          <div className="flex flex-col gap-3">
            <PopoverHeader>
              <PopoverTitle>Loaded Result Counts</PopoverTitle>
              <PopoverDescription className="text-xs">
                Counts reflect the currently loaded result set.
              </PopoverDescription>
            </PopoverHeader>
            {facets ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Old Testament {facets.oldTestament}</Badge>
                  <Badge variant="secondary">New Testament {facets.newTestament}</Badge>
                </div>
                <div
                  className="max-h-64 overflow-y-auto rounded-lg border p-1"
                  role="region"
                  aria-label="Book result counts"
                  tabIndex={0}
                >
                  {facets.books.map((book) => (
                    <div
                      key={book.bookIndex}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm"
                    >
                      <span className="truncate">{book.bookName}</span>
                      <Badge variant="outline">{book.count}</Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Counting results…</p>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Select
        value={resultSort}
        onValueChange={(value) => {
          if (value === "relevance" || value === "canonical") {
            onSortChange(value);
          }
        }}
      >
        <SelectTrigger size="sm" aria-label="Sort search results">
          <SelectValue placeholder="Relevance">
            {resultSort === "canonical" ? "Bible order" : "Relevance"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="canonical">Bible order</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Field
        orientation="horizontal"
        className="h-7 w-auto gap-2 rounded-lg border px-2.5"
      >
        <Checkbox
          id={contextInputId}
          checked={showContext}
          onCheckedChange={(value) => onShowContextChange(value === true)}
        />
        <FieldLabel
          htmlFor={contextInputId}
          className="inline-flex items-center gap-1.5 font-normal"
        >
          <ListTreeIcon className="size-3.5" />
          Context
        </FieldLabel>
      </Field>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm">
              <WrenchIcon data-icon="inline-start" />
              Result Tools
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel>All loaded results</DropdownMenuLabel>
            <DropdownMenuItem onClick={onCopy}>
              <CopyIcon />
              Copy as Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <DownloadIcon />
              Export .txt
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
