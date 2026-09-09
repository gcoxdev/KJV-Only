import { normalizeConcordanceWord } from "./references.ts";
import type { VerseToken } from "../types/bible.ts";

// Reviewed personal names, not descriptions such as "Daughter of Herodias":
// clicking Herodias must not select her daughter or another named relative.
export const GENEALOGY_COMPOUND_NAMES = [
  "Jesus Christ", "Judas Iscariot", "Mary Magdalene", "Pontius Pilate",
  "Claudius Lysias", "Porcius Festus", "Sergius Paulus",
] as const;

export const GENEALOGY_COMPOUND_WORDS = new Set(
  GENEALOGY_COMPOUND_NAMES.flatMap(name => name.toLowerCase().split(" ")),
);

export function genealogyNamesAtToken(rawWord: string, tokens?: VerseToken[] | null, tokenIndex?: number | null) {
  const word = normalizeConcordanceWord(rawWord).toLowerCase();
  const matches = new Set<string>();
  if (!tokens || tokenIndex == null || !GENEALOGY_COMPOUND_WORDS.has(word)) return matches;
  const words = tokens.map((token, index) => ({ word: normalizeConcordanceWord(token.text).toLowerCase(), index })).filter(token => token.word);
  const selected = words.findIndex(token => token.index === tokenIndex && token.word === word);
  if (selected < 0) return matches;
  for (const name of GENEALOGY_COMPOUND_NAMES) {
    const parts = name.toLowerCase().split(" ");
    const offset = parts.indexOf(word);
    const start = selected - offset;
    if (offset < 0 || start < 0 || !parts.every((part, index) => words[start + index]?.word === part)) continue;
    const first = words[start].index;
    const last = words[start + parts.length - 1].index;
    if (tokens.slice(first, last).some(token => /[.!?;:]/.test(token.text))) continue;
    matches.add(name.toLowerCase());
  }
  return matches;
}
