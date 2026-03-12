import type {
  GenealogyCompactPayload,
  GenealogyParentRef,
  GenealogyPayload,
  GenealogyPerson,
  GenealogyRelation,
  GenealogyVerseByName,
} from "@/types/reader";

function expandDelta(values: number[]) {
  let runningTotal = 0;
  return values.map((value, index) => {
    if (index === 0) {
      runningTotal = value;
      return value;
    }
    runningTotal += value;
    return runningTotal;
  });
}

function decodeReferences(
  compact: GenealogyCompactPayload,
  values: number[] | undefined,
) {
  if (!values || values.length === 0) {
    return [] as string[];
  }
  return expandDelta(values)
    .map((index) => compact.v[index])
    .filter((value): value is string => Boolean(value));
}

function decodeRelation(
  compact: GenealogyCompactPayload,
  peopleById: Map<string, GenealogyPerson>,
  relationValue: [string, number?],
): GenealogyRelation {
  const [id, verseIndex] = relationValue;
  return {
    id,
    name: peopleById.get(id)?.names[0] ?? id,
    verse:
      typeof verseIndex === "number" && verseIndex >= 0 ? compact.v[verseIndex] : undefined,
  };
}

function decodeParent(
  peopleById: Map<string, GenealogyPerson>,
  parentId: string | undefined,
): GenealogyParentRef | undefined {
  if (!parentId) {
    return undefined;
  }
  return {
    id: parentId,
    name: peopleById.get(parentId)?.names[0] ?? parentId,
  };
}

export function decodeGenealogyPayload(compact: GenealogyCompactPayload): GenealogyPayload {
  const people = compact.p.map((personValue): GenealogyPerson => {
    const [
      id,
      nameIndexes,
      gender = "",
      versesValue = 0,
      fatherId = "",
      motherId = "",
      spouses = [],
      siblings = [],
      children = [],
    ] = personValue;

    const names = (nameIndexes ?? [])
      .map((index) => compact.w[index])
      .filter((value): value is string => Boolean(value));

    const person: GenealogyPerson = {
      id,
      names,
    };

    if (gender) {
      person.gender = gender;
    }
    if (versesValue && Array.isArray(versesValue)) {
      const [byNameValues = [], totalOccurrences = 0, totalVerses = 0, firstVerse = -1] =
        versesValue;
      const byName = byNameValues
        .map((entry): GenealogyVerseByName | null => {
          const [nameIndex, encodedVerses = [], numOccurrences = 0, numVerses = 0] = entry;
          const name = compact.w[nameIndex];
          if (!name) {
            return null;
          }
          const decodedVerses = decodeReferences(compact, encodedVerses);
          return {
            name,
            verses: decodedVerses,
            numOccurrences: numOccurrences || undefined,
            numVerses: numVerses || undefined,
          };
        })
        .filter((entry): entry is GenealogyVerseByName => Boolean(entry));

      person.verses = {
        byName,
        totalOccurrences: totalOccurrences || undefined,
        totalVerses: totalVerses || undefined,
        first: firstVerse >= 0 ? compact.v[firstVerse] : undefined,
      };
    }

    if (fatherId) {
      person.father = { id: fatherId, name: fatherId };
    }
    if (motherId) {
      person.mother = { id: motherId, name: motherId };
    }

    if (Array.isArray(spouses) && spouses.length > 0) {
      person.spouses = spouses.map(([relationId, verseIndex]) => ({
        id: relationId,
        name: relationId,
        verse:
          typeof verseIndex === "number" && verseIndex >= 0 ? compact.v[verseIndex] : undefined,
      }));
    }
    if (Array.isArray(siblings) && siblings.length > 0) {
      person.siblings = siblings.map(([relationId, verseIndex]) => ({
        id: relationId,
        name: relationId,
        verse:
          typeof verseIndex === "number" && verseIndex >= 0 ? compact.v[verseIndex] : undefined,
      }));
    }
    if (Array.isArray(children) && children.length > 0) {
      person.children = children.map(([relationId, verseIndex]) => ({
        id: relationId,
        name: relationId,
        verse:
          typeof verseIndex === "number" && verseIndex >= 0 ? compact.v[verseIndex] : undefined,
      }));
    }

    return person;
  });

  const peopleById = new Map(people.map((person) => [person.id, person]));

  for (const [index, person] of people.entries()) {
    const compactPerson = compact.p[index];
    const spouses = compactPerson[6] ?? [];
    const siblings = compactPerson[7] ?? [];
    const children = compactPerson[8] ?? [];

    person.father = decodeParent(peopleById, person.father?.id);
    person.mother = decodeParent(peopleById, person.mother?.id);
    if (Array.isArray(spouses) && spouses.length > 0) {
      person.spouses = spouses.map((relation) =>
        decodeRelation(compact, peopleById, relation),
      );
    }
    if (Array.isArray(siblings) && siblings.length > 0) {
      person.siblings = siblings.map((relation) =>
        decodeRelation(compact, peopleById, relation),
      );
    }
    if (Array.isArray(children) && children.length > 0) {
      person.children = children.map((relation) =>
        decodeRelation(compact, peopleById, relation),
      );
    }
  }

  return people;
}
