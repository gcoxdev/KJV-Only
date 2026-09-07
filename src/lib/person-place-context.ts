import { PERSON_REFERENCE_REVIEWS, REVIEWED_NAME_VERSES, type NameSense } from "./person-place-corrections.ts";
import { normalizeConcordanceWord, normalizeStrongsCodes } from "./references.ts";
import type { VerseToken } from "../types/bible.ts";

export type PersonPlaceContext = {
  referenceKey: string | null;
  sense?: NameSense;
  mapIds?: string[];
  ambiguous?: boolean;
};

const reviewedVerses = new Map(REVIEWED_NAME_VERSES.map(review => [`${review.name.toLowerCase()}:${review.reference}`, review]));
const reviewsByName = new Map(Object.values(PERSON_REFERENCE_REVIEWS).map(review => [review.name.toLowerCase(), review]));

export function resolvePersonPlaceContext(
  rawWord: string,
  referenceKey: string | null,
  strongCodes: string[] = [],
  tokens?: VerseToken[] | null,
  tokenIndex?: number | null,
): PersonPlaceContext {
  const context: PersonPlaceContext = { referenceKey };
  if (!referenceKey) return context;
  const name = normalizeConcordanceWord(rawWord).toLowerCase();
  const reviewed = reviewedVerses.get(`${name}:${referenceKey}`);
  if (reviewed) {
    const indices = tokens?.flatMap((token, index) => normalizeConcordanceWord(token.text).toLowerCase() === name ? [index] : []) ?? [];
    const occurrence = tokenIndex == null ? -1 : indices.indexOf(tokenIndex);
    // Do not guess an occurrence if the text/tokenization has changed.
    const sense = occurrence >= 0 && indices.length === reviewed.senses.length
      ? reviewed.senses[occurrence]
      : new Set(reviewed.senses).size === 1 ? reviewed.senses[0] : undefined;
    if (sense) return { ...context, sense, mapIds: sense === "place" ? reviewed.mapIds : undefined };
  }

  // Even Adam and another Haran share place codes. Only use the reviewed
  // code distinction within this specific verse, never across all namesakes.
  if (name === "haran" && referenceKey === "GEN.11.31") {
    const codes = new Set(normalizeStrongsCodes(strongCodes));
    const person = codes.has("H2039");
    const place = codes.has("H2771");
    if (person !== place) return { ...context, sense: person ? "person" : "place" };
  }

  const review = reviewsByName.get(name);
  if (review?.personalReferences?.includes(referenceKey)) return { ...context, sense: "person" };
  if (review?.excludedReferences?.includes(referenceKey)) return { ...context, sense: "people" };
  return { ...context, ambiguous: Boolean(review || reviewed) };
}

export const AMBIGUOUS_PERSON_PLACE_NOTICE = "This name can refer to a person, a people, or a place. The selected occurrence is not yet distinguished; these are possible matches.";
