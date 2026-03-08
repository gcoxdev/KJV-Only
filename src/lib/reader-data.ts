import type { Book } from "@/types/bible";
import {
  parseJsonl,
  type AncientMapPayload,
  type MapGeoJsonPayload,
  type MapImageEntry,
} from "@/lib/maps";
import type {
  ConcordancePayload,
  CrossRefsPayload,
  GenealogyPayload,
  HitchcocksPayload,
  OldEnglishPayload,
  ReaderPayload,
  StrongsPayload,
  WebstersPayload,
} from "@/types/reader";

let kjvBooksPromise: Promise<Book[]> | null = null;
let concordancePromise: Promise<ConcordancePayload> | null = null;
let crossRefsPromise: Promise<CrossRefsPayload> | null = null;
let hitchcocksPromise: Promise<HitchcocksPayload> | null = null;
let oldEnglishPromise: Promise<OldEnglishPayload> | null = null;
let genealogyPromise: Promise<GenealogyPayload> | null = null;
let webstersPromise: Promise<WebstersPayload> | null = null;
let strongsGreekPromise: Promise<StrongsPayload> | null = null;
let strongsHebrewPromise: Promise<StrongsPayload> | null = null;
let ancientMapPromise: Promise<AncientMapPayload> | null = null;
const mapGeoJsonPromiseCache = new Map<string, Promise<MapGeoJsonPayload>>();
let mapImagesPromise: Promise<MapImageEntry[]> | null = null;

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
    kjvBooksPromise = fetch("/data/kjv.json", { cache: "force-cache" })
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
    concordancePromise = fetch("/references/concordance.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/concordance.json");
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
      cache: "force-cache",
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
    webstersPromise = fetch("/references/websters.json", { cache: "force-cache" })
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

export function loadHitchcocks() {
  if (!hitchcocksPromise) {
    hitchcocksPromise = fetch("/references/hitchcocks.json", {
      cache: "force-cache",
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

export function loadOldEnglish() {
  if (!oldEnglishPromise) {
    oldEnglishPromise = fetch("/references/old-english.json", {
      cache: "force-cache",
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

export function loadGenealogy() {
  if (!genealogyPromise) {
    genealogyPromise = fetch("/references/genealogy.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/genealogy.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as GenealogyPayload)
      .catch((error) => {
        genealogyPromise = null;
        throw error;
      });
  }

  return genealogyPromise;
}

export function loadStrongsGreek() {
  if (!strongsGreekPromise) {
    strongsGreekPromise = fetch("/references/strongs-greek.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-greek.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as StrongsPayload)
      .catch((error) => {
        strongsGreekPromise = null;
        throw error;
      });
  }

  return strongsGreekPromise;
}

export function loadStrongsHebrew() {
  if (!strongsHebrewPromise) {
    strongsHebrewPromise = fetch("/references/strongs-hebrew.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/strongs-hebrew.json");
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => payload as StrongsPayload)
      .catch((error) => {
        strongsHebrewPromise = null;
        throw error;
      });
  }

  return strongsHebrewPromise;
}

export function loadAncientMap() {
  if (!ancientMapPromise) {
    ancientMapPromise = fetch("/references/ancient_map.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /references/ancient_map.json");
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
    cache: "force-cache",
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

export function loadMapImages() {
  if (!mapImagesPromise) {
    mapImagesPromise = fetch("/maps/data/image.jsonl", { cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load /maps/data/image.jsonl");
        }
        return response.text();
      })
      .then((text) => parseJsonl<MapImageEntry>(text))
      .catch((error) => {
        mapImagesPromise = null;
        throw error;
      });
  }
  return mapImagesPromise;
}
