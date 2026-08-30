import { useMemo } from "react";
import { ListFilterIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { BOOK_ICON_CODES } from "@/lib/references";
import type { OrderedToolReference } from "@/lib/tool-references";
import type { Book } from "@/types/bible";

type ReferenceBookFacet = {
  bookIndex: number;
  bookName: string;
  count: number;
};

type TestamentFacet = {
  id: "old" | "new";
  label: "Old Testament" | "New Testament";
  books: ReferenceBookFacet[];
  count: number;
};

type ToolReferenceFilterProps = {
  orderedReferences: OrderedToolReference[];
  books: Book[];
  excludedBookIndexes: Set<number>;
  visibleCount: number;
  onBooksChange: (bookIndexes: number[], checked: boolean) => void;
  onShowAll: () => void;
};

const FILTERABLE_REFERENCE_COUNT = 7;

function buildBookFacets(
  orderedReferences: OrderedToolReference[],
  books: Book[],
) {
  const counts = new Map<number, number>();
  for (const entry of orderedReferences) {
    if (entry.location) {
      counts.set(
        entry.location.bookIndex,
        (counts.get(entry.location.bookIndex) ?? 0) + 1,
      );
    }
  }

  return Array.from(counts, ([bookIndex, count]) => ({
    bookIndex,
    bookName:
      books[bookIndex]?.name ??
      BOOK_ICON_CODES[bookIndex] ??
      `Book ${bookIndex + 1}`,
    count,
  })).sort((left, right) => left.bookIndex - right.bookIndex);
}

export function ToolReferenceFilter({
  orderedReferences,
  books,
  excludedBookIndexes,
  visibleCount,
  onBooksChange,
  onShowAll,
}: ToolReferenceFilterProps) {
  const facets = useMemo(
    () => buildBookFacets(orderedReferences, books),
    [books, orderedReferences],
  );
  const testamentFacets = useMemo<TestamentFacet[]>(() => {
    const buildTestament = (
      id: TestamentFacet["id"],
      label: TestamentFacet["label"],
      predicate: (bookIndex: number) => boolean,
    ) => {
      const testamentBooks = facets.filter((facet) =>
        predicate(facet.bookIndex),
      );
      return {
        id,
        label,
        books: testamentBooks,
        count: testamentBooks.reduce((total, book) => total + book.count, 0),
      };
    };

    return [
      buildTestament("old", "Old Testament", (bookIndex) => bookIndex < 39),
      buildTestament("new", "New Testament", (bookIndex) => bookIndex >= 39),
    ].filter((testament) => testament.books.length > 0);
  }, [facets]);
  const activeFilterCount = facets.reduce(
    (count, facet) =>
      count + (excludedBookIndexes.has(facet.bookIndex) ? 1 : 0),
    0,
  );
  const totalCount = orderedReferences.length;

  if (totalCount < FILTERABLE_REFERENCE_COUNT || facets.length === 0) {
    return null;
  }

  return (
    <div
      data-tool-reference-filter
      className="flex min-w-0 flex-wrap items-center justify-between gap-2"
    >
      <p className="text-xs text-muted-foreground">
        {activeFilterCount > 0
          ? `Showing ${visibleCount} of ${totalCount} references`
          : `${totalCount} references in Bible order`}
      </p>
      <Popover>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="xs">
              <ListFilterIcon data-icon="inline-start" />
              Filters
              {activeFilterCount > 0 ? (
                <Badge variant="secondary">{`${visibleCount}/${totalCount}`}</Badge>
              ) : null}
            </Button>
          }
        />
        <PopoverContent
          align="end"
          className="w-[min(20rem,calc(100vw-2rem))] p-3"
        >
          <PopoverHeader>
            <PopoverTitle>Filter References</PopoverTitle>
            <PopoverDescription>
              Uncheck a testament or individual book to narrow this list.
            </PopoverDescription>
          </PopoverHeader>
          <div className="max-h-[min(24rem,60vh)] overflow-y-auto pr-1">
            <FieldSet>
              <FieldLegend variant="label">Testaments and books</FieldLegend>
              <FieldGroup className="gap-3">
                {testamentFacets.map((testament) => {
                  const bookIndexes = testament.books.map(
                    (book) => book.bookIndex,
                  );
                  const selectedBookCount = bookIndexes.reduce(
                    (count, bookIndex) =>
                      count +
                      (excludedBookIndexes.has(bookIndex) ? 0 : 1),
                    0,
                  );
                  return (
                    <div
                      key={testament.id}
                      className="flex flex-col gap-1.5"
                    >
                      <Field orientation="horizontal">
                        <FieldLabel className="min-w-0 font-medium">
                          <Checkbox
                            aria-label={testament.label}
                            checked={selectedBookCount === bookIndexes.length}
                            indeterminate={
                              selectedBookCount > 0 &&
                              selectedBookCount < bookIndexes.length
                            }
                            onCheckedChange={(checked) =>
                              onBooksChange(bookIndexes, checked === true)
                            }
                          />
                          <span className="min-w-0">{testament.label}</span>
                        </FieldLabel>
                        <Badge variant="secondary">{testament.count}</Badge>
                      </Field>
                      <FieldGroup className="ml-6 w-auto gap-1 border-l pl-3">
                        {testament.books.map((book) => (
                          <Field key={book.bookIndex} orientation="horizontal">
                            <FieldLabel className="min-w-0 font-normal">
                              <Checkbox
                                aria-label={book.bookName}
                                checked={
                                  !excludedBookIndexes.has(book.bookIndex)
                                }
                                onCheckedChange={(checked) =>
                                  onBooksChange(
                                    [book.bookIndex],
                                    checked === true,
                                  )
                                }
                              />
                              <span className="min-w-0">{book.bookName}</span>
                            </FieldLabel>
                            <Badge variant="outline">{book.count}</Badge>
                          </Field>
                        ))}
                      </FieldGroup>
                    </div>
                  );
                })}
              </FieldGroup>
            </FieldSet>
          </div>
          {activeFilterCount > 0 ? (
            <>
              <Separator />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={onShowAll}
                >
                  Show all references
                </Button>
              </div>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
