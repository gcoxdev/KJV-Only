import { BrainCircuitIcon, LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AIDictionaryEntry } from "@/types/reader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudySearchForm } from "@/components/reader/study-search-form";

type AIDictionaryResult = { key: string; entry: AIDictionaryEntry };

type AIDictionaryToolProps = {
  hasInfo: boolean;
  isOpen: boolean;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchTerm: string;
  results: AIDictionaryResult[];
  wordAccordionValue: string[];
  onWordAccordionValueChange: (value: string[]) => void;
  resolveEntryTarget: (term: string) => string | null;
  onOpenEntry: (term: string) => void;
  onSearch: (term: string) => void;
};

function renderAIDictionaryDefinition(
  entryKey: string,
  definition: string,
  index: number,
  resolveEntryTarget: (term: string) => string | null,
  onOpenEntry: (term: string) => void,
) {
  const match = definition.match(/^(.*)\. See '([^']+)'\.$/);
  if (!match) {
    return <p key={`${entryKey}-definition-${index}`}>{definition}</p>;
  }

  const [, prefix, targetLabel] = match;
  const targetKey = resolveEntryTarget(targetLabel);
  if (!targetKey || targetKey === entryKey) {
    return <p key={`${entryKey}-definition-${index}`}>{definition}</p>;
  }

  return (
    <p key={`${entryKey}-definition-${index}`}>
      {prefix}.{" "}
      <Button
        type="button"
        variant="link"
        size="xs"
        className="h-auto px-0 py-0 text-sm align-baseline"
        onClick={() => onOpenEntry(targetLabel)}
      >
        See "{targetLabel}".
      </Button>
    </p>
  );
}

function extractSeeReference(definition: string) {
  const match = definition.match(/(?:^| )See '([^']+)'\.$/);
  return match?.[1] ?? null;
}

export function AIDictionaryTool({
  hasInfo,
  isOpen,
  isLoading,
  isSearching,
  error,
  searchTerm,
  results,
  wordAccordionValue,
  onWordAccordionValueChange,
  resolveEntryTarget,
  onOpenEntry,
  onSearch,
}: AIDictionaryToolProps) {
  return (
    <AccordionItem value="ai-dictionary">
      <AccordionTrigger
        className={cn(hasInfo && "text-emerald-600 dark:text-emerald-400")}
      >
        <BrainCircuitIcon />
        AI Dictionary
      </AccordionTrigger>
      <AccordionContent className="space-y-2 overflow-visible">
        {isOpen ? (
          <>
            <StudySearchForm
              name="ai-dictionary-search"
              placeholder="Search AI Dictionary..."
              ariaLabel="Search AI Dictionary"
              loading={isLoading || isSearching}
              value={searchTerm}
              allowReset
              onSearch={onSearch}
            />
            {isLoading || isSearching ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <LoaderCircleIcon className="size-4 animate-spin" />
                {isLoading ? "Loading AI Dictionary..." : "Searching AI Dictionary..."}
              </p>
            ) : error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? "No matching AI Dictionary entry found."
                  : "Search the AI Dictionary or click a harder KJV word in the text."}
              </p>
            ) : (
              <Accordion
                className="w-full rounded-md border px-2 **:data-[slot=accordion-content]:pb-1 **:data-[slot=accordion-trigger]:py-1 **:data-[slot=accordion-trigger]:transition-none [&_[data-slot=accordion-trigger]>svg]:transition-none"
                multiple
                value={wordAccordionValue}
                onValueChange={(value) =>
                  onWordAccordionValueChange(value.filter(Boolean) as string[])
                }
              >
                {results.map(({ key, entry }) => (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger>{key}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      {(() => {
                        const aliasTargets =
                          entry.aliases?.map((alias) => ({
                            label: alias,
                            target: resolveEntryTarget(alias),
                          })) ?? [];
                        const clickableAliases = aliasTargets.filter(
                          ({ target }) => Boolean(target) && target !== key,
                        );
                        const plainAliases = aliasTargets.filter(
                          ({ target }) => !target || target === key,
                        );
                        const explicitRelatedTargets =
                          entry.relatedEntries?.map((related) => ({
                            label: related,
                            target: resolveEntryTarget(related),
                          })) ?? [];
                        const derivedRelatedTargets = entry.definitions
                          .map((definition) => extractSeeReference(definition))
                          .filter((value): value is string => Boolean(value))
                          .map((related) => ({
                            label: related,
                            target: resolveEntryTarget(related),
                          }));
                        const relatedTargets = [
                          ...explicitRelatedTargets,
                          ...derivedRelatedTargets,
                        ].filter(
                          (item, index, items) =>
                            items.findIndex(
                              (candidate) =>
                                candidate.label === item.label &&
                                candidate.target === item.target,
                            ) === index,
                        );
                        const clickableRelated = relatedTargets.filter(
                          ({ target }) => Boolean(target) && target !== key,
                        );

                        return (
                          <>
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.classification ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.classification}
                          </Badge>
                        ) : null}
                        {entry.partOfSpeech ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.partOfSpeech}
                          </Badge>
                        ) : null}
                        {entry.confidence ? (
                          <Badge variant="outline" className="capitalize">
                            {entry.confidence} confidence
                          </Badge>
                        ) : null}
                      </div>
                      <div className="space-y-2 text-sm leading-relaxed">
                        {entry.definitions.map((definition, index) =>
                          renderAIDictionaryDefinition(
                            key,
                            definition,
                            index,
                            resolveEntryTarget,
                            onOpenEntry,
                          ),
                        )}
                      </div>
                      {clickableAliases.length > 0 || plainAliases.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Also:</p>
                          {clickableAliases.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {clickableAliases.map(({ label }) => (
                                <Button
                                  key={`${key}-alias-${label}`}
                                  type="button"
                                  variant="outline"
                                  size="xs"
                                  className="h-auto px-2 py-1 text-xs"
                                  onClick={() => onOpenEntry(label)}
                                >
                                  {label}
                                </Button>
                              ))}
                            </div>
                          ) : null}
                          {plainAliases.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              {plainAliases.map(({ label }) => label).join(", ")}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                      {clickableRelated.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Related:</p>
                          <div className="flex flex-wrap gap-1">
                            {clickableRelated.map(({ label }) => (
                              <Button
                                key={`${key}-related-${label}`}
                                type="button"
                                variant="outline"
                                size="xs"
                                className="h-auto px-2 py-1 text-xs"
                                onClick={() => onOpenEntry(label)}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {entry.note ? (
                        <p
                          className={cn(
                            "text-xs text-muted-foreground",
                            entry.note.startsWith("Location:") &&
                              "rounded-sm border border-border/60 bg-muted/40 px-2 py-1",
                          )}
                        >
                          {entry.note}
                        </p>
                      ) : null}
                          </>
                        );
                      })()}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </>
        ) : null}
      </AccordionContent>
    </AccordionItem>
  );
}
