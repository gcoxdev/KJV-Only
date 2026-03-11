import { Fragment, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ConcordanceReferencePopover } from "@/components/reader/concordance-reference-popover";
import type { GenealogyPerson } from "@/types/reader";

type GenealogyPersonDetailsProps = {
  person: GenealogyPerson;
  genealogyById: Map<string, GenealogyPerson>;
  onSelectPerson: (personId: string) => void;
  renderReferencePreview: (reference: string, highlightWord: string) => ReactNode;
  onOpenReference: (reference: string) => void;
  onCloseSidebar: () => void;
};

export function GenealogyPersonDetails({
  person,
  genealogyById,
  onSelectPerson,
  renderReferencePreview,
  onOpenReference,
  onCloseSidebar,
}: GenealogyPersonDetailsProps) {
  const primaryName = person.names[0] ?? person.id;
  const byName = person.verses?.byName ?? [];
  const spouses = person.spouses ?? [];
  const siblings = person.siblings ?? [];
  const children = person.children ?? [];
  const fatherName =
    person.father?.name ||
    (person.father?.id ? (genealogyById.get(person.father.id)?.names[0] ?? "") : "");
  const motherName =
    person.mother?.name ||
    (person.mother?.id ? (genealogyById.get(person.mother.id)?.names[0] ?? "") : "");

  return (
    <div className="space-y-2 rounded-md border p-2 text-sm">
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
      {byName.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            References
          </p>
          <Accordion className="w-full rounded-md border px-2" multiple>
            {byName.map((entry) => (
              <AccordionItem
                key={`${person.id}-${entry.name}`}
                value={`${person.id}-${entry.name}`}
              >
                <AccordionTrigger>
                  {`${entry.name} (${entry.numVerses ?? entry.verses.length})`}
                </AccordionTrigger>
                <AccordionContent className="leading-7">
                  {entry.verses.map((reference, index) => (
                    <Fragment key={`${person.id}-${entry.name}-${reference}-${index}`}>
                      <ConcordanceReferencePopover
                        reference={reference}
                        highlightWord={entry.name}
                        renderPreview={renderReferencePreview}
                        onOpenReference={onOpenReference}
                        onCloseSidebar={onCloseSidebar}
                      />
                      {index < entry.verses.length - 1 ? ", " : null}
                    </Fragment>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : null}
      <div className="space-y-1">
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
            <span className="font-semibold">Spouses:</span>{" "}
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
                {relation.verse ? (
                  <>
                    {" "}
                    (
                    <ConcordanceReferencePopover
                      reference={relation.verse}
                      highlightWord={relation.name || primaryName}
                      renderPreview={renderReferencePreview}
                      onOpenReference={onOpenReference}
                      onCloseSidebar={onCloseSidebar}
                    />
                    )
                  </>
                ) : null}
                {index < spouses.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
        {siblings.length > 0 ? (
          <p>
            <span className="font-semibold">Siblings:</span>{" "}
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
                {relation.verse ? (
                  <>
                    {" "}
                    (
                    <ConcordanceReferencePopover
                      reference={relation.verse}
                      highlightWord={relation.name || primaryName}
                      renderPreview={renderReferencePreview}
                      onOpenReference={onOpenReference}
                      onCloseSidebar={onCloseSidebar}
                    />
                    )
                  </>
                ) : null}
                {index < siblings.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
        {children.length > 0 ? (
          <p>
            <span className="font-semibold">Children:</span>{" "}
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
                {relation.verse ? (
                  <>
                    {" "}
                    (
                    <ConcordanceReferencePopover
                      reference={relation.verse}
                      highlightWord={relation.name || primaryName}
                      renderPreview={renderReferencePreview}
                      onOpenReference={onOpenReference}
                      onCloseSidebar={onCloseSidebar}
                    />
                    )
                  </>
                ) : null}
                {index < children.length - 1 ? ", " : null}
              </Fragment>
            ))}
          </p>
        ) : null}
      </div>
      {person.notes ? <p className="text-muted-foreground">{person.notes}</p> : null}
    </div>
  );
}
