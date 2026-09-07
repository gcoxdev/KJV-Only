// Reviewed against the shipped KJV text. Keep the original genealogy source intact.
// A complete review lists personal references; a partial review removes only the
// explicitly reviewed place/group references. See docs/person-place-matching.md.
export const PERSON_REFERENCE_REVIEWS: Record<string, {
  name: string;
  personalReferences?: string[];
  excludedReferences?: string[];
  evidence: string;
}> = {
  canaan_29: {
    name: "Canaan",
    personalReferences: ["GEN.9.18", "GEN.9.22", "GEN.9.25", "GEN.9.26", "GEN.9.27", "GEN.10.6", "GEN.10.15", "1CH.1.8", "1CH.1.13"],
    evidence: "Genesis 9–10 and 1 Chronicles 1 name Ham's son; the remaining source references concern the land or its inhabitants.",
  },
  moab_131: {
    name: "Moab", personalReferences: ["GEN.19.37"],
    evidence: "Genesis 19:37 names Lot's son. The remaining source references concern the country, its people, rulers, or prophecies concerning them.",
  },
  midian_157: {
    name: "Midian", personalReferences: ["GEN.25.2", "GEN.25.4", "1CH.1.32", "1CH.1.33"],
    evidence: "These genealogies name Abraham's son and his sons; the remaining source references concern the land or its people.",
  },
  dan_198: {
    name: "Dan",
    excludedReferences: ["DEU.34.1", "JDG.20.1", "1SA.3.20", "2SA.3.10", "2SA.17.11", "2SA.24.2", "2SA.24.15", "1KI.4.25", "1KI.12.29", "1KI.12.30", "1KI.15.20", "2KI.10.29", "1CH.21.2", "2CH.16.4", "2CH.30.5", "JER.4.15", "JER.8.16", "AMO.8.14"],
    evidence: "Geographic endpoints, towns, journeys, and the sanctuary at Dan. Joshua 19:47 and Judges 18:29 are retained: each also names the ancestor.",
  },
  judah_197: {
    name: "Judah", excludedReferences: ["1KI.14.21", "2SA.5.5", "2KI.18.22"],
    evidence: "Reigning over/in Judah and worship in Judah describe the kingdom and its inhabitants, not Jacob's son.",
  },
  jacob_183: {
    name: "Israel", excludedReferences: ["NUM.22.1", "JDG.20.1", "1KI.14.21"],
    evidence: "The travelling children, assembled congregation, and tribes of Israel are the people, not Jacob himself.",
  },
  esau_182: {
    name: "Edom", excludedReferences: ["NUM.20.14", "NUM.20.18", "NUM.20.20", "NUM.20.21"],
    evidence: "The king/country of Edom refuses passage and comes out with an army; these occurrences do not identify Esau.",
  },
  ephraim_298: {
    name: "Ephraim", excludedReferences: ["DEU.34.2", "JDG.17.1", "JDG.17.8", "JDG.19.1", "1SA.1.1", "JHN.11.54"],
    evidence: "The land, mount Ephraim, and the city named Ephraim are locations, not Joseph's son.",
  },
};

export type NameSense = "person" | "place" | "people";
export type ReviewedNameVerse = {
  name: string;
  reference: string;
  senses: NameSense[];
  mapIds?: string[];
};

// Senses are in word-occurrence order, not token offsets (punctuation is tokenized).
export const REVIEWED_NAME_VERSES: ReviewedNameVerse[] = [
  { name: "Haran", reference: "GEN.11.31", senses: ["person", "place"], mapIds: ["a6d9af3.geojson"] },
  { name: "Dan", reference: "JDG.18.29", senses: ["place", "person"], mapIds: ["a513646.geojson"] },
  { name: "Dan", reference: "JOS.19.47", senses: ["people", "people", "place", "person"], mapIds: ["a513646.geojson"] },
  { name: "Moab", reference: "NUM.22.1", senses: ["place"], mapIds: ["aa0b1d6.geojson"] },
  { name: "Canaan", reference: "GEN.12.5", senses: ["place", "place"], mapIds: ["a581f0c.geojson"] },
  { name: "Dan", reference: "JDG.20.1", senses: ["place"], mapIds: ["a513646.geojson"] },
  { name: "Judah", reference: "1KI.14.21", senses: ["place"], mapIds: ["ab86a69.geojson"] },
];
