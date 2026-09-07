import { PERSON_REFERENCE_REVIEWS } from "./person-place-corrections.ts";
import { chapterVerseKey, normalizeConcordanceWord } from "./references.ts";
import type { Book } from "../types/bible.ts";
import type { GenealogyPayload } from "../types/reader.ts";

export function applyGenealogyReferenceCorrections(people: GenealogyPayload, books: Book[]): GenealogyPayload {
  // Count actual retained name tokens so deleted place references cannot inflate
  // occurrence totals. This index is only built during data generation.
  const reviewedNames = new Set(Object.values(PERSON_REFERENCE_REVIEWS).map(review => review.name.toLowerCase()));
  const counts = new Map<string, number>();
  books.forEach((book, bi) => book.chapters.forEach((chapter, ci) => chapter.verses.forEach(verse => {
    const reference = chapterVerseKey(bi, ci, verse.verse);
    for (const token of verse.tokens) {
      const name = normalizeConcordanceWord(token.text).toLowerCase();
      if (!reviewedNames.has(name)) continue;
      const key = `${name}:${reference}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  })));

  return people.map(person => {
    const review = PERSON_REFERENCE_REVIEWS[person.id];
    if (!review || !person.verses) return person;
    const allowed = review.personalReferences ? new Set(review.personalReferences) : null;
    const excluded = new Set(review.excludedReferences);
    const byName = (person.verses.byName ?? []).map(entry => {
      if (entry.name !== review.name) return entry;
      const verses = entry.verses.filter(ref => allowed ? allowed.has(ref) : !excluded.has(ref));
      return { ...entry, verses, numVerses: verses.length,
        numOccurrences: verses.reduce((n, ref) => n + (counts.get(`${review.name.toLowerCase()}:${ref}`) ?? 1), 0) };
    });
    const references = new Set(byName.flatMap(entry => entry.verses));
    return { ...person, verses: { ...person.verses, byName,
      totalVerses: references.size,
      totalOccurrences: byName.reduce((n, entry) => n + (entry.numOccurrences ?? entry.verses.length), 0),
      first: person.verses.first && references.has(person.verses.first) ? person.verses.first : byName.find(entry => entry.verses.length)?.verses[0],
    } };
  });
}
