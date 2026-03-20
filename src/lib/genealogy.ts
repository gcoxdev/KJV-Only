import type { Book } from "@/types/bible";
import { chapterVerseKey, normalizeConcordanceWord } from "@/lib/references";
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

function resolveReferencedPersonId(
  peopleById: Map<string, GenealogyPerson>,
  rawId: string | undefined,
) {
  if (!rawId) {
    return undefined;
  }
  if (peopleById.has(rawId)) {
    return rawId;
  }

  const match = rawId.match(/^(.*)_(\d+)$/);
  if (!match) {
    return rawId;
  }

  const [, baseId, numericSuffix] = match;
  const fallbackId = `${baseId}_${Number.parseInt(numericSuffix, 10) + 1}`;
  return peopleById.has(fallbackId) ? fallbackId : rawId;
}

function decodeRelation(
  compact: GenealogyCompactPayload,
  peopleById: Map<string, GenealogyPerson>,
  relationValue: [string, number?],
): GenealogyRelation {
  const [rawId, verseIndex] = relationValue;
  const id = resolveReferencedPersonId(peopleById, rawId) ?? rawId;
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
  const id = resolveReferencedPersonId(peopleById, parentId);
  if (!id) {
    return undefined;
  }
  return {
    id,
    name: peopleById.get(id)?.names[0] ?? id,
  };
}

function dedupeReferences(references: string[]) {
  return [...new Set(references)];
}

function upsertByNameEntry(
  entries: GenealogyVerseByName[],
  nextEntry: GenealogyVerseByName,
) {
  const existingIndex = entries.findIndex((entry) => entry.name === nextEntry.name);
  if (existingIndex < 0) {
    entries.push(nextEntry);
    return;
  }
  entries[existingIndex] = nextEntry;
}

function collectTokenReferenceData(books: Book[], rawWord: string) {
  const normalizedWord = normalizeConcordanceWord(rawWord).toLowerCase();
  const verses: string[] = [];
  let occurrences = 0;

  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const book = books[bookIndex];
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      for (const verse of chapter.verses) {
        let verseOccurrences = 0;
        for (const token of verse.tokens) {
          if (normalizeConcordanceWord(token.text).toLowerCase() === normalizedWord) {
            verseOccurrences += 1;
          }
        }
        if (verseOccurrences > 0) {
          occurrences += verseOccurrences;
          verses.push(chapterVerseKey(bookIndex, chapterIndex, verse.verse));
        }
      }
    }
  }

  return {
    verses: dedupeReferences(verses),
    occurrences,
  };
}

function collectPhraseReferenceData(books: Book[], rawWords: string[]) {
  const normalizedWords = rawWords.map((word) =>
    normalizeConcordanceWord(word).toLowerCase(),
  );
  const verses: string[] = [];
  let occurrences = 0;

  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const book = books[bookIndex];
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      for (const verse of chapter.verses) {
        const normalizedTokens = verse.tokens
          .map((token) => normalizeConcordanceWord(token.text).toLowerCase())
          .filter(Boolean);
        let verseOccurrences = 0;

        for (let index = 0; index <= normalizedTokens.length - normalizedWords.length; index += 1) {
          const matches = normalizedWords.every(
            (word, wordIndex) => normalizedTokens[index + wordIndex] === word,
          );
          if (matches) {
            verseOccurrences += 1;
          }
        }

        if (verseOccurrences > 0) {
          occurrences += verseOccurrences;
          verses.push(chapterVerseKey(bookIndex, chapterIndex, verse.verse));
        }
      }
    }
  }

  return {
    verses: dedupeReferences(verses),
    occurrences,
  };
}

function collectJesusOnlyReferenceData(books: Book[]) {
  const verses: string[] = [];
  let occurrences = 0;

  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const book = books[bookIndex];
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      for (const verse of chapter.verses) {
        const normalizedTokens = verse.tokens
          .map((token) => normalizeConcordanceWord(token.text).toLowerCase())
          .filter(Boolean);
        let verseOccurrences = 0;

        for (let index = 0; index < normalizedTokens.length; index += 1) {
          if (
            normalizedTokens[index] === "jesus" &&
            normalizedTokens[index + 1] !== "christ"
          ) {
            verseOccurrences += 1;
          }
        }

        if (verseOccurrences > 0) {
          occurrences += verseOccurrences;
          verses.push(chapterVerseKey(bookIndex, chapterIndex, verse.verse));
        }
      }
    }
  }

  return {
    verses: dedupeReferences(verses),
    occurrences,
  };
}

function collectChristOnlyReferenceData(books: Book[]) {
  const verses: string[] = [];
  let occurrences = 0;

  for (let bookIndex = 0; bookIndex < books.length; bookIndex += 1) {
    const book = books[bookIndex];
    for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
      const chapter = book.chapters[chapterIndex];
      for (const verse of chapter.verses) {
        const normalizedTokens = verse.tokens
          .map((token) => normalizeConcordanceWord(token.text).toLowerCase())
          .filter(Boolean);
        let verseOccurrences = 0;

        for (let index = 0; index < normalizedTokens.length; index += 1) {
          if (
            normalizedTokens[index] === "christ" &&
            normalizedTokens[index - 1] !== "jesus"
          ) {
            verseOccurrences += 1;
          }
        }

        if (verseOccurrences > 0) {
          occurrences += verseOccurrences;
          verses.push(chapterVerseKey(bookIndex, chapterIndex, verse.verse));
        }
      }
    }
  }

  return {
    verses: dedupeReferences(verses),
    occurrences,
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

      const allVerses = dedupeReferences(byName.flatMap((entry) => entry.verses));
      const primaryName = names[0] ?? "";
      if (
        primaryName &&
        !byName.some((entry) => entry.name === primaryName && entry.verses.length > 0) &&
        allVerses.length > 0
      ) {
        upsertByNameEntry(byName, {
          name: primaryName,
          verses: allVerses,
          numOccurrences: totalOccurrences || undefined,
          numVerses: totalVerses || undefined,
        });
      }

      if (names.includes("Jesus Christ") && allVerses.length > 0) {
        upsertByNameEntry(byName, {
          name: "Jesus Christ",
          verses: allVerses,
          numOccurrences: totalOccurrences || undefined,
          numVerses: totalVerses || undefined,
        });
        upsertByNameEntry(byName, {
          name: "Christ",
          verses: allVerses,
          numOccurrences: totalOccurrences || undefined,
          numVerses: totalVerses || undefined,
        });
      }

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

export function enrichGenealogyPayload(
  people: GenealogyPayload,
  books: Book[],
): GenealogyPayload {
  const jesusData = collectJesusOnlyReferenceData(books);
  const christData = collectChristOnlyReferenceData(books);
  const jesusChristData = collectPhraseReferenceData(books, ["Jesus", "Christ"]);
  const immanuelData = collectTokenReferenceData(books, "Immanuel");
  const emmanuelData = collectTokenReferenceData(books, "Emmanuel");

  return people.map((person) => {
    if (!person.names.includes("Jesus Christ")) {
      return person;
    }

    const byName = [...(person.verses?.byName ?? [])].filter(
      (entry) => !["Jesus", "Christ", "Jesus Christ"].includes(entry.name),
    );
    const existingByName = new Map(byName.map((entry) => [entry.name, entry]));
    const combinedVerses = dedupeReferences([
      ...(person.verses?.byName ?? [])
        .filter((entry) => !["Jesus", "Christ", "Jesus Christ"].includes(entry.name))
        .flatMap((entry) => entry.verses),
      ...jesusChristData.verses,
      ...immanuelData.verses,
      ...emmanuelData.verses,
    ]);

    if (jesusData.verses.length > 0) {
      upsertByNameEntry(byName, {
        name: "Jesus",
        verses: jesusData.verses,
        numOccurrences: jesusData.occurrences || undefined,
        numVerses: jesusData.verses.length,
      });
    }

    if (christData.verses.length > 0) {
      upsertByNameEntry(byName, {
        name: "Christ",
        verses: christData.verses,
        numOccurrences: christData.occurrences || undefined,
        numVerses: christData.verses.length,
      });
    }

    if (immanuelData.verses.length > 0) {
      const existingImmanuelEntry = existingByName.get("Immanuel");
      const verses = dedupeReferences([
        ...(existingImmanuelEntry?.verses ?? []),
        ...immanuelData.verses,
      ]);
      upsertByNameEntry(byName, {
        name: "Immanuel",
        verses,
        numOccurrences:
          (existingImmanuelEntry?.numOccurrences ?? 0) + immanuelData.occurrences ||
          undefined,
        numVerses: verses.length,
      });
    }

    if (emmanuelData.verses.length > 0) {
      const existingEmmanuelEntry = existingByName.get("Emmanuel");
      const verses = dedupeReferences([
        ...(existingEmmanuelEntry?.verses ?? []),
        ...emmanuelData.verses,
      ]);
      upsertByNameEntry(byName, {
        name: "Emmanuel",
        verses,
        numOccurrences:
          (existingEmmanuelEntry?.numOccurrences ?? 0) + emmanuelData.occurrences ||
          undefined,
        numVerses: verses.length,
      });
    }

    if (combinedVerses.length > 0) {
      const combinedOccurrences =
        jesusChristData.occurrences + immanuelData.occurrences + emmanuelData.occurrences;
      upsertByNameEntry(byName, {
        name: "Jesus Christ",
        verses: combinedVerses,
        numOccurrences: combinedOccurrences || undefined,
        numVerses: combinedVerses.length,
      });
    }

    const nextJesusChristEntry = byName.find((entry) => entry.name === "Jesus Christ");

    return {
      ...person,
      verses: {
        byName,
        totalOccurrences:
          nextJesusChristEntry?.numOccurrences || person.verses?.totalOccurrences || undefined,
        totalVerses: combinedVerses.length || person.verses?.totalVerses || undefined,
        first: combinedVerses[0] ?? person.verses?.first,
      },
    };
  });
}
