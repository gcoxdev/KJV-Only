import { useId, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ToolReferenceList } from "@/components/reader/tool-reference-list";
import { mapEntryLabel, type AncientMapEntry } from "@/lib/maps";

export function MapAreaResults({ entries, viewChanged, onHide, onOpenMap, onOpenReference, renderPreview }: {
  entries: AncientMapEntry[];
  viewChanged: boolean;
  onHide: () => void;
  onOpenMap: (entry: AncientMapEntry) => void;
  onOpenReference: (reference: string) => void;
  renderPreview: (reference: string, highlightWord: string) => ReactNode;
}) {
  const [visibleCount, setVisibleCount] = useState(20);
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const filterId = useId();
  const typeOptions = useMemo(() => [
    { value: "", label: "All types" },
    ...[...new Set(entries.flatMap(entry => entry.types))].sort().map(type => ({
      value: type, label: type.charAt(0).toUpperCase() + type.slice(1),
    })),
  ], [entries]);
  const normalizedName = nameFilter.trim().toLowerCase();
  const filteredEntries = entries.filter(entry =>
    (!typeFilter || entry.types.includes(typeFilter)) &&
    (!normalizedName || [...entry.translations, ...entry.modern_names].some(name => name.toLowerCase().includes(normalizedName))),
  );
  const hasFilters = nameFilter.length > 0 || typeFilter.length > 0;
  const clearFilters = () => {
    setNameFilter("");
    setTypeFilter("");
    setVisibleCount(20);
  };
  return (
    <section aria-label="Places in searched area" className="absolute top-2 right-2 z-10 flex max-h-[80%] w-80 max-w-[calc(100%-1rem)] flex-col rounded-lg border bg-background shadow-lg">
      <div className="flex items-start justify-between gap-2 border-b p-3">
        <div>
          <h3 className="text-sm font-semibold">Places in searched area ({entries.length})</h3>
          <p className="mt-1 text-xs text-muted-foreground">Locations are approximate; areas may overlap this view.</p>
          {viewChanged ? <p role="status" className="mt-1 text-xs">Map view changed. Search this area to refresh.</p> : null}
        </div>
        <Button size="xs" variant="ghost" onClick={onHide}>Hide</Button>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3">
        {entries.length > 0 ? (
          <div className="flex flex-col gap-2 py-3">
            <FieldGroup className="gap-2">
              <Field>
                <FieldLabel htmlFor={`${filterId}-name`}>Place name</FieldLabel>
                <Input id={`${filterId}-name`} placeholder="Name or alternate name" value={nameFilter} onChange={event => {
                  setNameFilter(event.target.value);
                  setVisibleCount(20);
                }} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`${filterId}-type`}>Place type</FieldLabel>
                <Select items={typeOptions} value={typeFilter} onValueChange={value => {
                  setTypeFilter(value ?? "");
                  setVisibleCount(20);
                }}>
                  <SelectTrigger id={`${filterId}-type`} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>
                    {typeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectGroup></SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <p role="status" className="text-xs text-muted-foreground">Showing {filteredEntries.length} of {entries.length} places in the searched area.</p>
            {hasFilters ? <Button size="xs" variant="outline" className="self-start" onClick={clearFilters}>Clear filters</Button> : null}
          </div>
        ) : null}
        {entries.length === 0 ? <p className="pt-3 text-sm">No indexed places found. Try zooming out or moving the map.</p> : (
          <Accordion multiple key={`${nameFilter}:${typeFilter}`}>
            {filteredEntries.slice(0, visibleCount).map(entry => (
              <AccordionItem key={entry.geojson_file} value={entry.geojson_file}>
                <AccordionTrigger className="text-left">{mapEntryLabel(entry)}</AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2">
                  {entry.types.length ? <p className="text-xs text-muted-foreground">{entry.types.join(", ")}</p> : null}
                  <Button size="sm" variant="outline" onClick={() => onOpenMap(entry)}>Open map</Button>
                  {entry.verses.length ? (
                    <ToolReferenceList references={entry.verses} highlightWord={mapEntryLabel(entry)} renderPreview={renderPreview} onOpenReference={onOpenReference} onCloseSidebar={onHide} />
                  ) : <p className="text-xs text-muted-foreground">No linked passages.</p>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        {entries.length > 0 && filteredEntries.length === 0 ? <p className="text-sm">No places match these filters. Clear the filters or try another name or type.</p> : null}
        {filteredEntries.length > visibleCount ? <Button className="mt-2" size="sm" variant="outline" onClick={() => setVisibleCount(count => count + 20)}>Show more ({filteredEntries.length - visibleCount} remaining)</Button> : null}
      </div>
    </section>
  );
}
