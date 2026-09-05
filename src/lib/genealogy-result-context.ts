import type { GenealogyPerson, GenealogyRelation } from "@/types/reader";

function relationNames(relations: GenealogyRelation[] = []) {
  return relations.map(relation => relation.name).filter(Boolean).slice(0, 2).join(", ");
}

export function genealogyPersonContext(person: GenealogyPerson) {
  const parts: string[] = [];
  if (person.father?.name) parts.push(`Father: ${person.father.name}`);
  if (person.mother?.name) parts.push(`Mother: ${person.mother.name}`);
  if (parts.length < 2) {
    const spouses = relationNames(person.spouses);
    const children = relationNames(person.children);
    if (spouses) parts.push(`Spouse: ${spouses}`);
    else if (children) parts.push(`Children: ${children}`);
  }
  const firstReference = person.verses?.first ?? person.verses?.byName?.[0]?.verses[0];
  if (firstReference) {
    parts.push(`Name reference: ${firstReference.replace(/^([^.]+)\.(\d+)\.(\d+)$/, "$1 $2:$3")}`);
  }
  return parts.join(" · ") || "No family or reference details recorded";
}

// Preserve different recorded families when deduplicating name/reference matches.
// Some source copies use shifted IDs for the same named family, so compare names.
export function genealogyFamilyKey(person: GenealogyPerson) {
  const relationKey = (relations: GenealogyRelation[] = []) =>
    relations.map(({ name }) => name).sort();
  return JSON.stringify([
    person.gender, person.father?.name, person.mother?.name,
    relationKey(person.spouses), relationKey(person.siblings), relationKey(person.children),
  ]);
}
