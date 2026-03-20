import type { Book } from "@/types/bible";
import {
  type AncientMapPayload,
  type MapGeoJsonPayload,
} from "@/lib/maps";
import type {
  AIDictionaryPayload,
  ConcordancePayload,
  CrossRefsPayload,
  GenealogyCompactPayload,
  GenealogyPayload,
  HitchcocksPayload,
  BibleWordBookPayload,
  OldEnglishPayload,
  PhrasesPayload,
  ReaderPayload,
  StrongsCompactPayload,
  StrongsPayload,
  UnitsPayload,
  WebstersPayload,
} from "@/types/reader";
import { decodeGenealogyPayload, enrichGenealogyPayload } from "@/lib/genealogy";
import { decodeStrongsPayload } from "@/lib/strongs";

let kjvBooksPromise: Promise<Book[]> | null = null;
let concordancePromise: Promise<ConcordancePayload> | null = null;
let crossRefsPromise: Promise<CrossRefsPayload> | null = null;
let hitchcocksPromise: Promise<HitchcocksPayload> | null = null;
let bibleWordBookPromise: Promise<BibleWordBookPayload> | null = null;
let oldEnglishPromise: Promise<OldEnglishPayload> | null = null;
let phrasesPromise: Promise<PhrasesPayload> | null = null;
let unitsPromise: Promise<UnitsPayload> | null = null;
let genealogyPromise: Promise<GenealogyPayload> | null = null;
let webstersPromise: Promise<WebstersPayload> | null = null;
let aiDictionaryPromise: Promise<AIDictionaryPayload> | null = null;
let strongsGreekPromise: Promise<StrongsPayload> | null = null;
let strongsHebrewPromise: Promise<StrongsPayload> | null = null;
let ancientMapPromise: Promise<AncientMapPayload> | null = null;
const mapGeoJsonPromiseCache = new Map<string, Promise<MapGeoJsonPayload>>();
export const GENEALOGY_ASSET_VERSION = "20260312-philip-fix-1";
export const STRONGS_ASSET_VERSION = "20260313-derivation-links-2";

function parseBooks(input: unknown): Book[] | null {
  if (Array.isArray(input)) {
    return input as Book[];
  }

  if (typeof input === "object" && input !== null) {
    const payload = input as ReaderPayload;
    if (Array.isArray(payload.books)) {
      return payload.books;
    }
  }

  return null;
}

export function loadKjvBooks() {
  if (!kjvBooksPromise) {
    kjvBooksPromise = fetch("/data/kjv.json", { cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /data/kjv.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        const parsedBooks = parseBooks(payload);
        if (!parsedBooks || parsedBooks.length === 0) {
          throw new Error("Invalid reader data format in /data/kjv.json");
        }
        return parsedBooks;
      })
      .catch((error) => {
        kjvBooksPromise = null;
        throw error;
      });
  }

  return kjvBooksPromise;
}

export function loadConcordance() {
  if (!concordancePromise) {
    concordancePromise = fetch("/references/concordance.compact.delta.min.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Could not load /references/concordance.compact.delta.min.json",
          );
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as ConcordancePayload)
      .catch((error) => {
        concordancePromise = null;
        throw error;
      });
  }

  return concordancePromise;
}

export function loadCrossRefs() {
  if (!crossRefsPromise) {
    crossRefsPromise = fetch("/references/cross-refs.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/cross-refs.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as CrossRefsPayload)
      .catch((error) => {
        crossRefsPromise = null;
        throw error;
      });
  }

  return crossRefsPromise;
}

export function loadWebsters() {
  if (!webstersPromise) {
    webstersPromise = fetch("/references/websters.json", { cache: "no-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/websters.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as WebstersPayload)
      .catch((error) => {
        webstersPromise = null;
        throw error;
      });
  }

  return webstersPromise;
}

export function loadAIDictionary() {
  if (!aiDictionaryPromise) {
    aiDictionaryPromise = fetch("/references/ai-dictionary.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/ai-dictionary.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as AIDictionaryPayload)
      .catch((error) => {
        aiDictionaryPromise = null;
        throw error;
      });
  }

  return aiDictionaryPromise;
}

export function loadHitchcocks() {
  if (!hitchcocksPromise) {
    hitchcocksPromise = fetch("/references/hitchcocks.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/hitchcocks.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as HitchcocksPayload)
      .catch((error) => {
        hitchcocksPromise = null;
        throw error;
      });
  }

  return hitchcocksPromise;
}

export function loadBibleWordBook() {
  if (!bibleWordBookPromise) {
    bibleWordBookPromise = fetch("/references/bible-word-book.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/bible-word-book.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as BibleWordBookPayload)
      .catch((error) => {
        bibleWordBookPromise = null;
        throw error;
      });
  }

  return bibleWordBookPromise;
}

export function loadOldEnglish() {
  if (!oldEnglishPromise) {
    oldEnglishPromise = fetch("/references/old-english.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/old-english.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as OldEnglishPayload)
      .catch((error) => {
        oldEnglishPromise = null;
        throw error;
      });
  }

  return oldEnglishPromise;
}

export function loadPhrases() {
  if (!phrasesPromise) {
    phrasesPromise = fetch("/references/phrases.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/phrases.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as PhrasesPayload)
      .catch((error) => {
        phrasesPromise = null;
        throw error;
      });
  }

  return phrasesPromise;
}

export function loadUnits() {
  if (!unitsPromise) {
    unitsPromise = fetch("/references/units.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/units.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as UnitsPayload)
      .catch((error) => {
        unitsPromise = null;
        throw error;
      });
  }

  return unitsPromise;
}

export function loadGenealogy() {
  if (!genealogyPromise) {
    genealogyPromise = Promise.all([
      fetch(`/references/genealogy.compact.min.json?v=${GENEALOGY_ASSET_VERSION}`, {
        cache: "no-cache",
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/genealogy.compact.min.json");
        }
        return response.json() as Promise<unknown>;
      }),
      loadKjvBooks(),
    ])
      .then(([payload, books]) =>
        enrichGenealogyPayload(
          decodeGenealogyPayload(payload as GenealogyCompactPayload),
          books,
        ),
      )
      .catch((error) => {
        genealogyPromise = null;
        throw error;
      });
  }

  return genealogyPromise;
}

export function loadStrongsGreek() {
  if (!strongsGreekPromise) {
    strongsGreekPromise = fetch(
      `/references/strongs-greek.compact.min.json?v=${STRONGS_ASSET_VERSION}`,
      { cache: "no-cache" },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-greek.compact.min.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => decodeStrongsPayload(payload as StrongsCompactPayload))
      .catch((error) => {
        strongsGreekPromise = null;
        throw error;
      });
  }

  return strongsGreekPromise;
}

export function loadStrongsHebrew() {
  if (!strongsHebrewPromise) {
    strongsHebrewPromise = fetch(
      `/references/strongs-hebrew.compact.min.json?v=${STRONGS_ASSET_VERSION}`,
      { cache: "no-cache" },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-hebrew.compact.min.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => decodeStrongsPayload(payload as StrongsCompactPayload))
      .catch((error) => {
        strongsHebrewPromise = null;
        throw error;
      });
  }

  return strongsHebrewPromise;
}

export function loadAncientMap() {
  if (!ancientMapPromise) {
    ancientMapPromise = fetch("/maps/data/map.json", {
      cache: "no-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /maps/data/map.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as AncientMapPayload)
      .catch((error) => {
        ancientMapPromise = null;
        throw error;
      });
  }

  return ancientMapPromise;
}

export function loadMapGeoJson(geojsonFile: string) {
  const cached = mapGeoJsonPromiseCache.get(geojsonFile);
  if (cached) {
    return cached;
  }

  const promise = fetch(`/maps/geometry/${geojsonFile}`, {
    cache: "no-cache",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Could not load /maps/geometry/${geojsonFile}`);
      }
      return response.json() as Promise<unknown>;
    })
    .then((payload) => payload as MapGeoJsonPayload)
    .catch((error) => {
      mapGeoJsonPromiseCache.delete(geojsonFile);
      throw error;
    });
  mapGeoJsonPromiseCache.set(geojsonFile, promise);
  return promise;
}
