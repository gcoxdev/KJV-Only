import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { searchMapPlaces, type MapSearchResult } from "@/lib/map-search";

export function MapPlaceSearch({ onSelect }: { onSelect: (result: MapSearchResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapSearchResult[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => {
    const active = request.current;
    request.current = null;
    active?.abort();
  }, []);

  async function submit() {
    if (query.trim().length < 2 || busy) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError(null);
    setResults(null);
    setShowResults(true);
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const matches = await searchMapPlaces(query, controller.signal);
      if (request.current === controller && !controller.signal.aborted) setResults(matches);
    } catch (cause) {
      if (request.current === controller) setError(controller.signal.aborted
        ? "Place search timed out. Check your connection and try again."
        : cause instanceof Error ? cause.message : "Place search could not connect. Try again.");
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) setBusy(false);
    }
  }

  return (
    <div className="relative min-w-0 flex-1 basis-48">
      <form onSubmit={event => { event.preventDefault(); void submit(); }}>
        <Field>
          <FieldLabel htmlFor="map-place-search" className="sr-only">Search places or addresses</FieldLabel>
          <InputGroup className="has-disabled:opacity-100">
            <InputGroupInput id="map-place-search" placeholder="Search places or addresses…" value={query} maxLength={200}
              onChange={event => {
                request.current?.abort();
                request.current = null;
                setBusy(false);
                setShowResults(false);
                setQuery(event.target.value);
              }} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit" aria-label="Search places" disabled={busy || query.trim().length < 2}>
                <SearchIcon /> Search
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </form>
      {showResults ? (
        <section aria-label="Place search results" className="absolute top-full left-0 z-10 mt-1 flex max-h-64 w-full min-w-56 flex-col overflow-y-auto rounded-md border bg-background p-2 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Place search</span>
            <Button variant="ghost" size="xs" onClick={() => setShowResults(false)}>Hide</Button>
          </div>
          {busy ? <p role="status" className="p-2 text-sm">Searching places…</p> : error ?
            <p role="alert" className="p-2 text-sm text-destructive">{error}</p> : results?.length === 0 ?
              <p role="status" className="p-2 text-sm">No places found. Try another name or address.</p> :
              results?.map(result => <Button key={result.id} variant="ghost" className="h-auto justify-start py-2 text-left whitespace-normal"
                onClick={() => { onSelect(result); setShowResults(false); }}>{result.label}</Button>)}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="p-2 text-xs text-muted-foreground underline">
            Search: Photon / © OpenStreetMap contributors
          </a>
        </section>
      ) : null}
    </div>
  );
}
