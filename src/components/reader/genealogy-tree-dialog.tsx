import { Fragment, type ReactNode, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  LocateFixedIcon,
  NetworkIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { GenealogyPerson, GenealogyRelation } from "@/types/reader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type GenealogyTreeDialogProps = {
  open: boolean;
  person: GenealogyPerson | null;
  genealogyById: Map<string, GenealogyPerson>;
  onOpenChange: (open: boolean) => void;
  onSelectPerson: (personId: string) => void;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

type ResolvedRelation = {
  id: string;
  name: string;
  subtitle?: string;
  person: GenealogyPerson | null;
  verse?: string;
};

function resolvePersonName(
  relation: { id?: string; name?: string } | undefined,
  genealogyById: Map<string, GenealogyPerson>,
) {
  if (!relation?.id) {
    return relation?.name ?? "";
  }

  return relation.name || genealogyById.get(relation.id)?.names[0] || relation.id;
}

function resolveRelation(
  relation: GenealogyRelation,
  genealogyById: Map<string, GenealogyPerson>,
): ResolvedRelation {
  const person = genealogyById.get(relation.id) ?? null;
  return {
    id: relation.id,
    name: relation.name || person?.names[0] || relation.id,
    subtitle: relation.verse,
    person,
    verse: relation.verse,
  };
}

function resolveParent(
  relation: { id: string; name: string } | undefined,
  genealogyById: Map<string, GenealogyPerson>,
): ResolvedRelation | null {
  if (!relation?.id) {
    return null;
  }

  const person = genealogyById.get(relation.id) ?? null;
  return {
    id: relation.id,
    name: resolvePersonName(relation, genealogyById),
    person,
  };
}

function GenealogyNode({
  label,
  title,
  subtitle,
  aliases = [],
  person,
  onSelectPerson,
  icon,
  emphasized = false,
  renderReferencePreview,
  onOpenReference,
  onCloseSidebar,
}: {
  label?: string;
  title: string;
  subtitle?: string;
  aliases?: string[];
  person: GenealogyPerson | null;
  onSelectPerson?: (personId: string) => void;
  icon?: ReactNode;
  emphasized?: boolean;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
}) {
  const firstReference = person?.verses?.first;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const byNameReferences = person?.verses?.byName ?? [];

  return (
    <Card
      size="sm"
      className={cn(
        "min-h-20 border bg-card text-left transition-colors",
        emphasized && "bg-muted/60 ring-2 ring-primary/20",
        (onSelectPerson || person) && "hover:bg-muted/60",
      )}
    >
      <CardHeader className="gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="grid min-w-0 w-full grid-cols-[max-content_max-content_max-content] items-start justify-between gap-2">
            {label ? (
              <CardDescription className="col-span-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wide">
                {icon}
                {label}
              </CardDescription>
            ) : (
              <div className="col-span-3" />
            )}
            {onSelectPerson && person ? (
              <Button
                type="button"
                variant={emphasized ? "secondary" : "outline"}
                size="sm"
                className="h-auto justify-start self-start px-2 py-1"
                onClick={() => onSelectPerson(person.id)}
              >
                <LocateFixedIcon data-icon="inline-start" />
                <span className="text-left text-sm leading-snug">{title}</span>
              </Button>
            ) : (
              <div className="flex h-auto items-center rounded-md border bg-muted/30 px-2 py-1 text-sm font-medium leading-snug">
                {title}
              </div>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 justify-self-center px-2"
              onClick={() => setDetailsOpen((current) => !current)}
            >
              {detailsOpen ? (
                <ChevronUpIcon data-icon="inline-start" />
              ) : (
                <ChevronDownIcon data-icon="inline-start" />
              )}
              {detailsOpen ? "Hide" : "Details"}
            </Button>
            {person?.gender ? (
              <Badge
                variant="outline"
                className="mr-1 mt-1 shrink-0 justify-self-end self-start"
              >
                {person.gender}
              </Badge>
            ) : (
              <div />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0 text-xs text-muted-foreground">
        {aliases.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {aliases.map((alias) => (
              <Badge key={alias} variant="outline">
                {alias}
              </Badge>
            ))}
          </div>
        ) : null}
        {detailsOpen ? (
          <div className="space-y-2 rounded-md border bg-muted/30 p-2">
            {subtitle ? <p>{subtitle}</p> : null}
            {byNameReferences.length > 0 ? (
              <div className="space-y-1 leading-6">
                <span className="font-medium text-foreground/80">Refs:</span>
                {byNameReferences.map((entry) => (
                  <div key={`${person?.id ?? title}-${entry.name}`} className="text-xs">
                    <div className="mb-1 font-medium text-foreground/80">{entry.name}:</div>
                    <div className="flex flex-wrap gap-2">
                      {entry.verses.map((reference, index) => (
                        <Fragment key={`${entry.name}-${reference}-${index}`}>
                          <ConcordanceReferencePopover
                            reference={reference}
                            highlightWord={entry.name}
                            renderPreview={renderReferencePreview}
                            onOpenReference={onOpenReference}
                            onCloseSidebar={onCloseSidebar}
                          />
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : firstReference ? (
              <div className="leading-6">
                <span className="font-medium text-foreground/80">Refs:</span>{" "}
                <ConcordanceReferencePopover
                  reference={firstReference}
                  highlightWord={title}
                  renderPreview={renderReferencePreview}
                  onOpenReference={onOpenReference}
                  onCloseSidebar={onCloseSidebar}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function GenealogyRelationGrid({
  title,
  icon,
  relations,
  onSelectPerson,
  gridClassName,
  renderReferencePreview,
  onOpenReference,
  onCloseSidebar,
}: {
  title: string;
  icon: ReactNode;
  relations: ResolvedRelation[];
  onSelectPerson: (personId: string) => void;
  gridClassName?: string;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
}) {
  if (relations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {icon}
        <span>{title}</span>
      </div>
      <div className={cn("grid gap-3", gridClassName)}>
        {relations.map((relation) => (
          <GenealogyNode
            key={`${title}-${relation.id}`}
            title={relation.name}
            person={relation.person}
            onSelectPerson={onSelectPerson}
            renderReferencePreview={renderReferencePreview}
            onOpenReference={onOpenReference}
            onCloseSidebar={onCloseSidebar}
          />
        ))}
      </div>
    </div>
  );
}

export function GenealogyTreeDialog({
  open,
  person,
  genealogyById,
  onOpenChange,
  onSelectPerson,
  renderReferencePreview,
  onOpenReference,
  onCloseSidebar,
}: GenealogyTreeDialogProps) {
  const primaryName = person?.names[0] ?? "";
  const aliases = person?.names.slice(1) ?? [];
  const father = resolveParent(person?.father, genealogyById);
  const mother = resolveParent(person?.mother, genealogyById);
  const spouses = (Array.isArray(person?.spouses) ? person.spouses : []).map((relation) =>
    resolveRelation(relation, genealogyById),
  );
  const siblings = (Array.isArray(person?.siblings) ? person.siblings : []).map((relation) =>
    resolveRelation(relation, genealogyById),
  );
  const children = (Array.isArray(person?.children) ? person.children : []).map((relation) =>
    resolveRelation(relation, genealogyById),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(94vh,900px)] max-h-[calc(100vh-1rem)] w-[min(96vw,1120px)]! max-w-none! flex-col overflow-hidden p-0"
      >
        <DialogHeader className="gap-1 px-4 pt-4">
          <DialogTitle>Genealogy Tree</DialogTitle>
          <DialogDescription>
            {person
              ? `Focused on ${primaryName}. Click any person in the tree to recenter the graph.`
              : "No genealogy person selected."}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-5 px-3 py-3 sm:px-4 sm:py-4">
              {person ? (
                <>
                  {(father || mother) ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <NetworkIcon className="size-4" />
                        <span>Parents</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {father ? (
                          <GenealogyNode
                            label="Father"
                            title={father.name}
                            person={father.person}
                            onSelectPerson={onSelectPerson}
                            icon={<UserIcon className="size-3.5" />}
                            renderReferencePreview={renderReferencePreview}
                            onOpenReference={onOpenReference}
                            onCloseSidebar={onCloseSidebar}
                          />
                        ) : (
                          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                            Father unknown
                          </div>
                        )}
                        {mother ? (
                          <GenealogyNode
                            label="Mother"
                            title={mother.name}
                            person={mother.person}
                            onSelectPerson={onSelectPerson}
                            icon={<UserIcon className="size-3.5" />}
                            renderReferencePreview={renderReferencePreview}
                            onOpenReference={onOpenReference}
                            onCloseSidebar={onCloseSidebar}
                          />
                        ) : (
                          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                            Mother unknown
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {(father || mother) ? (
                    <div className="mx-auto h-8 w-px bg-border" aria-hidden="true" />
                  ) : null}

                  <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,300px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)_minmax(0,1fr)]">
                    <div className="space-y-3">
                      {siblings.length > 0 ? (
                        <GenealogyRelationGrid
                          title="Siblings"
                          icon={<UsersIcon className="size-4" />}
                          relations={siblings}
                          onSelectPerson={onSelectPerson}
                          gridClassName="grid-cols-1"
                          renderReferencePreview={renderReferencePreview}
                          onOpenReference={onOpenReference}
                          onCloseSidebar={onCloseSidebar}
                        />
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      <GenealogyNode
                        label="Focus"
                        title={primaryName}
                        aliases={aliases}
                        person={person}
                        icon={<UserIcon className="size-3.5" />}
                        emphasized
                        renderReferencePreview={renderReferencePreview}
                        onOpenReference={onOpenReference}
                        onCloseSidebar={onCloseSidebar}
                      />
                    </div>

                    <div className="space-y-3">
                      {spouses.length > 0 ? (
                        <GenealogyRelationGrid
                          title="Spouses"
                          icon={<HeartIcon className="size-4" />}
                          relations={spouses}
                          onSelectPerson={onSelectPerson}
                          gridClassName="grid-cols-1"
                          renderReferencePreview={renderReferencePreview}
                          onOpenReference={onOpenReference}
                          onCloseSidebar={onCloseSidebar}
                        />
                      ) : null}
                    </div>
                  </div>

                  {children.length > 0 ? (
                    <>
                      <div className="mx-auto h-8 w-px bg-border" aria-hidden="true" />
                      <GenealogyRelationGrid
                        title="Children"
                        icon={<NetworkIcon className="size-4" />}
                        relations={children}
                        onSelectPerson={onSelectPerson}
                        gridClassName="sm:grid-cols-2 2xl:grid-cols-3"
                        renderReferencePreview={renderReferencePreview}
                        onOpenReference={onOpenReference}
                        onCloseSidebar={onCloseSidebar}
                      />
                    </>
                  ) : null}
                </>
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                  Select a person in the genealogy tool to view a tree graph.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="shrink-0 border-t bg-muted/50 px-4 py-4">
          <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
