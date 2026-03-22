import { Fragment, type ReactNode } from "react";
import { NetworkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import type { GenealogyPerson } from "@/types/reader";

type GenealogyPersonDetailsProps = {
  person: GenealogyPerson;
  genealogyById: Map<string, GenealogyPerson>;
  onSelectPerson: (personId: string) => void;
  onOpenTree: (personId: string) => void;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function GenealogyPersonDetails({
  person,
  genealogyById,
  onSelectPerson,
  onOpenTree,
  renderReferencePreview,
  onOpenReference,
  onCloseSidebar,
}: GenealogyPersonDetailsProps) {
  const labelWithCount = (label: string, count: number) =>
    count > 1 ? `${label} (${count})` : label;
  const primaryName = person.names[0] ?? person.id;
  const byName = person.verses?.byName ?? [];
  const spouses = Array.isArray(person.spouses) ? person.spouses : [];
  const siblings = Array.isArray(person.siblings) ? person.siblings : [];
  const children = Array.isArray(person.children) ? person.children : [];
  const fatherName =
    person.father?.name ||
    (person.father?.id ? (genealogyById.get(person.father.id)?.names[0] ?? "") : "");
  const motherName =
    person.mother?.name ||
    (person.mother?.id ? (genealogyById.get(person.mother.id)?.names[0] ?? "") : "");

  return (
    <div className="workspace-panel-elevated flex flex-col gap-3 rounded-2xl border p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-semibold">{primaryName}</span>
          {person.names.length > 1 ? (
            <span className="text-muted-foreground">
              ({person.names.slice(1).join(", ")})
            </span>
          ) : null}
          {person.gender ? (
            <span className="text-xs text-muted-foreground">{person.gender}</span>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => onOpenTree(person.id)}
        >
          <NetworkIcon data-icon="inline-start" />
          View Tree
        </Button>
      </div>
      {byName.length > 0 ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            References
          </p>
          <Accordion
            className="w-full rounded-xl border border-subtle-divider/80 px-2 [&_[data-slot=accordion-content]]:pb-1 [&_[data-slot=accordion-trigger]]:py-1"
            multiple
          >
            {byName.map((entry) => (
              <AccordionItem
                key={`${person.id}-${entry.name}`}
                value={`${person.id}-${entry.name}`}
              >
                <AccordionTrigger className="min-w-0">
                  <span className="flex min-w-0 flex-1 items-start gap-2">
                    <span className="min-w-0 flex-1 break-words text-left">
                      {entry.name}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {entry.numVerses ?? entry.verses.length}
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {entry.verses.map((reference, index) => (
                      <Fragment key={`${person.id}-${entry.name}-${reference}-${index}`}>
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
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lineage
        </p>
        {fatherName ? (
          <p>
            <span className="font-semibold">Father:</span>{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              onClick={() => onSelectPerson(person.father?.id ?? "")}
            >
              {fatherName}
            </Button>
          </p>
        ) : null}
        {motherName ? (
          <p>
            <span className="font-semibold">Mother:</span>{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto px-0"
              onClick={() => onSelectPerson(person.mother?.id ?? "")}
            >
              {motherName}
            </Button>
          </p>
        ) : null}
        {spouses.length > 0 ? (
          <p>
            <span className="font-semibold">
              {labelWithCount("Spouses", spouses.length)}:
            </span>{" "}
            {spouses.map((relation, index) => (
              <Fragment key={`${person.id}-spouse-${relation.id}-${index}`}>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => onSelectPerson(relation.id)}
                >
                  {relation.name || relation.id}
                </Button>
                {index < spouses.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
        {siblings.length > 0 ? (
          <p>
            <span className="font-semibold">
              {labelWithCount("Siblings", siblings.length)}:
            </span>{" "}
            {siblings.map((relation, index) => (
              <Fragment key={`${person.id}-sibling-${relation.id}-${index}`}>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => onSelectPerson(relation.id)}
                >
                  {relation.name || relation.id}
                </Button>
                {index < siblings.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
        {children.length > 0 ? (
          <p>
            <span className="font-semibold">
              {labelWithCount("Children", children.length)}:
            </span>{" "}
            {children.map((relation, index) => (
              <Fragment key={`${person.id}-child-${relation.id}-${index}`}>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0"
                  onClick={() => onSelectPerson(relation.id)}
                >
                  {relation.name || relation.id}
                </Button>
                {index < children.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
      </div>
    </div>
  );
}
