import { BOOK_ICON_CODES, normalizeConcordanceWord, resolveTokenStrongsCodes } from '../../src/lib/references.ts';
import { genealogyNamesAtToken } from '../../src/lib/genealogy-names.ts';
import { findGenealogyMatches, findMapMatches } from '../../src/lib/word-study-selection.ts';
import { resolvePersonPlaceContext } from '../../src/lib/person-place-context.ts';
import type { ContextTimelineRecord } from '../../src/data/contextual-timeline.ts';
import type { TimelineRecord } from '../../src/lib/bible-timeline.ts';
import type { Book, VerseToken } from '../../src/types/bible.ts';
import type { GenealogyPayload } from '../../src/types/reader.ts';
import type { AncientMapPayload } from '../../src/lib/maps.ts';

export type PassageConnection = [kind: 'maps' | 'genealogy', id: string, label: string, reference: string];
const namesAt = (tokens: VerseToken[], index: number) => {
  const names = genealogyNamesAtToken(tokens[index].text, tokens, index);
  return names.size ? names : new Set([normalizeConcordanceWord(tokens[index].text).toLowerCase()]);
};
export function collectTimelineReferences(record: TimelineRecord & { narrative?: ContextTimelineRecord['narrative'] }, books: Book[]) {
  const refs = new Set(record.references);
  const bookEntry = /^(?:writing|context)-([a-z0-9]+)$/.exec(record.id);
  if (bookEntry) {
    const code = bookEntry[1].toUpperCase();
    const book = books[BOOK_ICON_CODES.indexOf(code)];
    if (!book) throw Error(`Invalid book entry ${record.id}`);
    for (const chapter of book.chapters) for (const verse of chapter.verses) refs.add(`${code}.${chapter.chapter}.${verse.verse}`);
  }
  const chapterEntry = /^passage-([a-z0-9]+)-(\d+)$/.exec(record.id);
  if (chapterEntry) {
    const code = chapterEntry[1].toUpperCase();
    const chapter = Number(chapterEntry[2]);
    const verses = books[BOOK_ICON_CODES.indexOf(code)]?.chapters[chapter - 1]?.verses;
    if (!verses) throw Error(`Invalid chapter entry ${record.id}`);
    for (const verse of verses) refs.add(`${code}.${chapter}.${verse.verse}`);
  }
  for (const p of record.narrative?.passages ?? []) {
    const bi = books.findIndex(book => book.name === p.book);
    if (bi < 0) throw Error(`Unknown narrative book ${p.book}`);
    for (let chapter = p.startChapter; chapter <= p.endChapter; chapter++) {
      const first = chapter === p.startChapter ? p.startVerse : 1;
      const last = chapter === p.endChapter ? p.endVerse : books[bi].chapters[chapter - 1].verses.length;
      for (let verse = first; verse <= last; verse++) refs.add(`${BOOK_ICON_CODES[bi]}.${chapter}.${verse}`);
    }
  }
  return [...refs];
}

/** Uses the same occurrence/verse-aware identities as study mode, never name-only fallbacks. */
export function buildPassageConnections(records: TimelineRecord[], books: Book[], people: GenealogyPayload, maps: AncientMapPayload, aliases: Map<string, string>) {
  const tokensFor = (reference: string) => {
    const [code, chapter, verse] = reference.split('.');
    return books[BOOK_ICON_CODES.indexOf(code)]?.chapters[+chapter - 1]?.verses[+verse - 1]?.tokens;
  };
  // A missing verse-index entry can be recovered only through an attested name
  // AND the same Strong's identity, with a single matching person.
  const peopleByIdentity = new Map<string, Set<GenealogyPayload[number]>>();
  for (const person of people) for (const entry of person.verses?.byName ?? []) {
    if (!/^[A-Z]/.test(entry.name) || /^(God|Holy Ghost|Holy Spirit|Sargon)$/i.test(entry.name) ||
      /^(the |son |daughter |father |mother |wife |husband |brother |sister |servant )/i.test(person.names[0])) continue;
    const name = normalizeConcordanceWord(entry.name).toLowerCase();
    for (const ref of entry.verses) {
      const tokens = tokensFor(ref);
      tokens?.forEach((token, index) => {
        if (!namesAt(tokens, index).has(name)) return;
        const context = resolvePersonPlaceContext(token.text, ref, resolveTokenStrongsCodes(token), tokens, index);
        if (context.ambiguous || context.sense === 'place' || context.sense === 'people') return;
        for (const strong of resolveTokenStrongsCodes(token)) {
          const key = `${name}:${strong}`;
          const matches = peopleByIdentity.get(key) ?? new Set();
          matches.add(person); peopleByIdentity.set(key, matches);
        }
      });
    }
  }
  const cache = new Map<string, { links: PassageConnection[]; unresolved: string[] }>();
  const resolve = (reference: string) => {
    const cached = cache.get(reference);
    if (cached) return cached;
    const tokens = tokensFor(reference);
    if (!tokens) throw Error(`Invalid KJV citation: ${reference}`);
    const links: PassageConnection[] = [];
    const unresolved: string[] = [];
    tokens.forEach((token, tokenIndex) => {
      const context = resolvePersonPlaceContext(token.text, reference, resolveTokenStrongsCodes(token), tokens, tokenIndex);
      if (/^sargon$/i.test(token.text)) {
        unresolved.push(`${reference} ${tokenIndex}: Sargon (local profile conflates Sargon with Sennacherib)`); return;
      }
      let persons = findGenealogyMatches(people, token.text, reference, context, { verseTokens: tokens, tokenIndex })
        .filter(person => !person.names.every(name => /^(God|Holy Ghost|Holy Spirit)$/i.test(name)));
      if (!persons.length && /^[A-Z]/.test(token.text) && !context.ambiguous && context.sense !== 'place' && context.sense !== 'people') {
        const names = namesAt(tokens, tokenIndex);
        persons = [...new Set([...names].flatMap(name => resolveTokenStrongsCodes(token).flatMap(strong => [...(peopleByIdentity.get(`${name}:${strong}`) ?? [])])))];
      }
      const places = findMapMatches(maps, token.text, context, persons).filter(entry => !entry.selectionNote);
      if (!persons.length && !places.length) return;
      if (context.ambiguous || context.sense === 'people' || (!context.sense && persons.length && places.length)) {
        unresolved.push(`${reference} ${tokenIndex}: ${token.text} (person/place sense)`); return;
      }
      const identities = new Set(persons.map(person => aliases.get(person.id) ?? person.id));
      if (identities.size === 1) {
        const person = persons.find(p => p.id === aliases.get(p.id)) ?? persons[0];
        links.push(['genealogy', person.id, person.names[0], reference]);
      } else if (identities.size > 1) unresolved.push(`${reference} ${tokenIndex}: ${token.text} (multiple people: ${persons.map(p => p.id).join(', ')})`);
      if (places.length === 1) {
        const place = places[0];
        links.push(['maps', place.geojson_file, place.translations[0], reference]);
      } else if (places.length > 1) unresolved.push(`${reference} ${tokenIndex}: ${token.text} (multiple places: ${places.map(p => p.geojson_file).join(', ')})`);
    });
    const result = { links, unresolved: [...new Set(unresolved)] };
    cache.set(reference, result);
    return result;
  };
  const connections: Record<string, PassageConnection[]> = {};
  const unresolved: Record<string, string[]> = {};
  for (const record of records) {
    const refs = collectTimelineReferences(record, books);
    const selected = new Map<string, PassageConnection>();
    for (const ref of refs) {
      const result = resolve(ref);
      for (const link of result.links) {
        const key = `${link[0]}:${aliases.get(link[1]) ?? link[1]}`;
        if (!selected.has(key)) selected.set(key, link);
      }
      if (result.unresolved.length) (unresolved[record.id] ??= []).push(...result.unresolved);
    }
    connections[record.id] = [...selected.values()];
  }
  return { connections, unresolved, references: cache.size };
}
