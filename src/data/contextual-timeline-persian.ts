import type { ContextTimelineRecord } from "./contextual-timeline";

export const PERSIAN_CONTEXT_SOURCES = {
  nabonidusChronicle: { title: "Nabonidus Chronicle (ABC 7), translated by A. K. Grayson", url: "https://www.livius.org/sources/content/mesopotamian-chronicles-content/abc-7-nabonidus-chronicle/", use: "External regnal framework, c. 556–539 BC, and the conquest of Babylon. The damaged chronicle does not identify Darius the Mede or replace Daniel's account." },
  cambyses: { title: "Livius: Cambyses II", url: "https://www.livius.org/articles/person/cambyses-ii/", use: "Reign 530–522 BC and conquest of Egypt in 525 BC. Supplies Persian political context without identifying the kings in Ezra's later correspondence." },
};

export const PERSIAN_CONTEXT_RECORDS: ContextTimelineRecord[] = [
  { id: "nabonidus-reign", label: "Nabonidus · reign", start: -555, end: -538, kind: "period", sources: ["nabonidusChronicle"], note: "The external Babylonian regnal framework places Nabonidus in 556–539 BC; the accession year precedes the first numbered year. This is a reign, not a lifespan. It supplies context for Daniel's era without renaming Belshazzar, changing Daniel's family wording, or resolving Darius the Mede's identity." },
  { id: "cambyses-reign", label: "Cambyses II · reign", start: -529, end: -521, kind: "period", sources: ["cambyses"], note: "Cyrus's successor rules the Persian empire in 530–522 BC, between Cyrus and Darius I in the wider temple-rebuilding setting. He is not automatically identified with Ahasuerus or Artaxerxes in Ezra 4. His reign and Egyptian campaign do not supply a new date for the opposition letters." },
  { id: "cambyses-egypt", label: "Cambyses conquers Egypt", start: -524, kind: "event", sources: ["cambyses"], note: "The Persian conquest is conventionally placed in 525 BC. The year marker summarizes the campaign, not a single day's duration. This is contemporary political history, not a newly assigned fulfillment of an oracle concerning Egypt or an event narrated in Ezra." },
].map(record => ({ ...record, track: "historical", era: "history", references: [], startStatus: "approximate", endStatus: record.end === undefined ? "unknown" : "approximate" } as ContextTimelineRecord));
