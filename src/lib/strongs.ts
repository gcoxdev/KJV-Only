import type {
  StrongsCompactPayload,
  StrongsEntry,
  StrongsPayload,
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

function resolveString(compact: StrongsCompactPayload, index: number | undefined) {
  if (typeof index !== "number" || index < 0) {
    return undefined;
  }
  return compact.s[index];
}

export function decodeStrongsPayload(compact: StrongsCompactPayload): StrongsPayload {
  const decoded = {} as StrongsPayload;

  for (const [code, entry] of Object.entries(compact.e)) {
    const [
      kjvDefIndex = -1,
      strongsDefIndex = -1,
      lemmaIndex = -1,
      translitIndex = -1,
      pronIndex = -1,
      derivationIndex = -1,
      kjvRefsValue = 0,
    ] = entry;

    const decodedEntry: StrongsEntry = {
      kjv_def: resolveString(compact, kjvDefIndex),
      strongs_def: resolveString(compact, strongsDefIndex),
      lemma: resolveString(compact, lemmaIndex),
      translit: resolveString(compact, translitIndex),
      pron: resolveString(compact, pronIndex),
      derivation: resolveString(compact, derivationIndex),
    };

    if (Array.isArray(kjvRefsValue) && kjvRefsValue.length > 0) {
      const kjvRefs = {} as Record<string, string[]>;
      for (const [wordIndex, encodedReferences] of kjvRefsValue) {
        const word = compact.w[wordIndex];
        if (!word) {
          continue;
        }
        kjvRefs[word] = expandDelta(encodedReferences)
          .map((index) => compact.v[index])
          .filter((value): value is string => Boolean(value));
      }
      if (Object.keys(kjvRefs).length > 0) {
        decodedEntry.kjv_refs = kjvRefs;
      }
    }

    decoded[code] = decodedEntry;
  }

  return decoded;
}
