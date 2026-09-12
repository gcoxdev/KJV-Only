import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadAncientMap, loadGenealogy, loadMapGeoJson } from "@/lib/reader-data";
import type { AncientMapEntry, MapGeoJsonPayload } from "@/lib/maps";
import type { VisualToolRequest } from "@/types/reader";
import type { StudyToolsPanelProps } from "./study-tools-panel";

const Genealogy = lazy(() => import("./genealogy-tree-dialog").then(module => ({ default: module.GenealogyTreeDialog })));
const Maps = lazy(() => import("./map-and-photo-dialogs").then(module => ({ default: module.MapAndPhotoDialogs })));
const Timeline = lazy(() => import("./contextual-timeline-dialog"));
const noop = () => {};

type Props = {
  request: VisualToolRequest;
  tools: StudyToolsPanelProps;
  onChange: (request: VisualToolRequest) => void;
};

function useToolData<T,>(loader: () => Promise<T>) {
  const [state, setState] = useState<{ data?: T; error?: string }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setState({});
    void loader().then(data => {
      if (!cancelled) setState({ data });
    }, error => {
      if (!cancelled) setState({ error: error instanceof Error ? error.message : "Could not load tool data." });
    });
    return () => { cancelled = true; };
  }, [loader, attempt]);
  return { ...state, retry: () => setAttempt(value => value + 1) };
}

function LoadingState({ error, retry }: { error?: string; retry: () => void }) {
  return <div className="flex flex-col gap-2 p-3">
    <p role={error ? "alert" : "status"}>{error ?? "Loading tool…"}</p>
    {error ? <Button variant="outline" size="sm" className="self-start" onClick={retry}>Retry</Button> : null}
  </div>;
}

function GenealogyPanel({ request, tools, onChange }: Props & { request: Extract<VisualToolRequest, { kind: "genealogy" }> }) {
  const { data, error, retry } = useToolData(loadGenealogy);
  const genealogyById = useMemo(() => new Map(data?.map(person => [person.id, person])), [data]);
  if (!data) return <LoadingState error={error} retry={retry} />;
  const person = genealogyById.get(request.personId);
  if (!person) return <p role="status" className="p-3">This person is no longer available. Open another person from the genealogy tool.</p>;
  return <Genealogy embedded open person={person} genealogyById={genealogyById} onOpenChange={noop}
    onSelectPerson={personId => onChange({ ...request, personId })}
    renderReferencePreview={tools.renderPreview} onOpenReference={tools.onOpenReference} onCloseSidebar={noop} />;
}

function MapPanel({ request, tools, onChange }: Props & { request: Extract<VisualToolRequest, { kind: "maps" }> }) {
  const { data, error, retry } = useToolData(loadAncientMap);
  const entry = data?.find(item => item.geojson_file === request.geojsonFile);
  if (!data) return <LoadingState error={error} retry={retry} />;
  if (!entry) return <p role="status" className="p-3">This location is no longer available. Open another location from Maps.</p>;
  return <LoadedMapPanel entry={entry} tools={tools} onOpenMap={next => onChange({ ...request, geojsonFile: next.geojson_file })} />;
}

function LoadedMapPanel({ entry, tools, onOpenMap }: { entry: AncientMapEntry; tools: StudyToolsPanelProps; onOpenMap: (entry: AncientMapEntry) => void }) {
  const [geometry, setGeometry] = useState<{ file: string; data?: MapGeoJsonPayload; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setGeometry(null);
    void loadMapGeoJson(entry.geojson_file).then(data => {
      if (!cancelled) setGeometry({ file: entry.geojson_file, data });
    }, error => {
      if (!cancelled) setGeometry({ file: entry.geojson_file, error: error instanceof Error ? error.message : "Could not load map geometry." });
    });
    return () => { cancelled = true; };
  }, [entry.geojson_file, attempt]);
  const current = geometry?.file === entry.geojson_file ? geometry : null;
  if (current?.error) return <LoadingState error={current.error} retry={() => setAttempt(value => value + 1)} />;
  return <Maps embedded isMapDialogOpen activeMapDialogEntry={entry} isMapDialogLoading={!current}
    mapDialogError={null} mapDialogGeoJson={current?.data ?? null}
    onMapDialogOpenChange={noop} onCloseMapDialog={noop} onOpenMap={onOpenMap}
    onOpenReference={tools.onOpenReference} renderReferencePreview={tools.renderPreview} />;
}

export default function VisualToolPanel(props: Props) {
  const { request, tools } = props;
  return <Suspense fallback={<p role="status" className="p-3">Loading tool…</p>}>
    {request.kind === "genealogy" ? <GenealogyPanel {...props} request={request} /> :
      request.kind === "maps" ? <MapPanel {...props} request={request} /> :
        <Timeline embedded open onOpenChange={noop} context={tools.timelineContext ?? request.context} books={tools.books}
          renderPreview={tools.renderPreview} onOpenReference={tools.onOpenReference} onCloseSidebar={noop} />}
  </Suspense>;
}
