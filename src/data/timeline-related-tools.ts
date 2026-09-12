import type { TimelineRecord } from "@/lib/bible-timeline";
import type { VisualToolRequest } from "@/types/reader";
import { TIMELINE_PASSAGE_CONNECTIONS } from "./timeline-passage-connections";
import { TIMELINE_HEADING_CONNECTIONS } from "./timeline-heading-connections";

export type TimelineRelatedTool = { label: string; reference: string; request: VisualToolRequest; association?: "passage" | "context" | "historical"; referenceLabel?: string; evidence?: string };
const person = (personId: string, label: string, reference: string): TimelineRelatedTool => ({ label, reference, request: { kind: "genealogy", personId } });
const place = (geojsonFile: string, label: string, reference: string): TimelineRelatedTool => ({ label, reference, request: { kind: "maps", geojsonFile } });
const jesus = (reference: string) => person("jesus_christ_2683", "Jesus Christ", reference);
const jesusTeaching = (reference: string, context: string): TimelineRelatedTool => ({ ...jesus(reference), evidence: `${context} This identifies Jesus as the narrative speaker; it does not identify a character in his teaching as a historical person.` });
const paul = (reference: string) => person("saul_2959", "Paul", reference);
const jerusalem = (reference: string) => place("a15257a.geojson", "Jerusalem", reference);
const egypt = (reference: string) => place("af301ca.geojson", "Egypt", reference);
const historicalPlace = (id: string, label: string, reference: string, evidence: string): TimelineRelatedTool => ({ ...place(id, label, reference), association: "historical", referenceLabel: `Place reference: ${reference}`, evidence });

/** Explicit KJV-supported associations, never name matching or inferred travel stops. */
export const TIMELINE_RELATED_TOOLS: Record<string, TimelineRelatedTool[]> = {
  flood: [person("noah_25", "Noah", "GEN.7.6")],
  "abram-canaan": [person("abram_103", "Abraham", "GEN.12.4"), place("a581f0c.geojson", "Canaan", "GEN.12.5")],
  "joseph-sold": [person("joseph_205", "Joseph", "GEN.37.28"), egypt("GEN.37.28")],
  "joseph-appointed": [person("joseph_205", "Joseph", "GEN.41.46"), egypt("GEN.41.46")],
  "egypt-entry": [person("jacob_183", "Jacob / Israel", "GEN.47.9"), egypt("GEN.46.3")],
  exodus: [person("moses_356", "Moses", "EXO.12.31"), egypt("EXO.12.41")],
  jordan: [person("joshua_391", "Joshua", "JOS.4.1"), place("ae686c9.geojson", "Jordan River", "JOS.4.19")],
  "caleb-hebron": [person("caleb_435", "Caleb", "JOS.14.13"), place("a85151a.geojson", "Hebron in Judah", "JOS.14.13")],
  temple: [person("solomon_677", "Solomon", "1KI.6.1"), jerusalem("2CH.3.1")],
  "temple-complete": [person("solomon_677", "Solomon", "1KI.6.38"), jerusalem("2CH.3.1")],
  "jerusalem-597": [person("nebuchadnezzar_998", "Nebuchadnezzar", "2KI.24.11"), jerusalem("2KI.24.10")],
  "temple-destroyed": [jerusalem("2KI.25.8")],
  "return-decree": [person("cyrus_2034", "Cyrus", "EZR.1.1"), jerusalem("EZR.1.3")],
  "temple-foundation": [person("zerubbabel_1118", "Zerubbabel", "EZR.3.8"), jerusalem("EZR.3.8")],
  "temple-work-resumed": [person("zerubbabel_1118", "Zerubbabel", "EZR.5.2"), jerusalem("EZR.5.2")],
  "second-temple": [jerusalem("EZR.6.3")],
  wall: [jerusalem("NEH.2.17")],
  "gospel-genealogies": [jesus("MAT.1.1")],
  "jesus-birth": [jesus("MAT.2.1"), place("a112427.geojson", "Bethlehem in Judah", "MAT.2.1")],
  "jesus-age-twelve": [jesus("LUK.2.43"), jerusalem("LUK.2.41")],
  "gospel-presentation": [jesus("LUK.2.21"), jerusalem("LUK.2.22")],
  "jesus-baptism": [jesus("MAT.3.13"), place("ae686c9.geojson", "Jordan River", "MAT.3.13")],
  resurrection: [jesus("LUK.24.6"), jerusalem("LUK.24.18")],
  "paul-conversion": [paul("ACT.9.1"), place("a69c1d4.geojson", "Damascus", "ACT.9.2")],
  "paul-antioch": [paul("ACT.11.25"), place("ae41ab4.geojson", "Antioch in Syria", "ACT.11.26")],
  "paul-pisidia": [paul("ACT.13.13"), place("a6c704a.geojson", "Antioch in Pisidia", "ACT.13.14")],
  "paul-philippi": [paul("ACT.16.14"), place("a49e1d0.geojson", "Philippi", "ACT.16.12")],
  "paul-athens": [paul("ACT.17.16"), place("a1fe6e7.geojson", "Athens", "ACT.17.16")],
  "paul-corinth": [paul("ACT.18.1"), place("a6f437a.geojson", "Corinth", "ACT.18.1")],
  "paul-gallio": [paul("ACT.18.12"), person("gallio_2991", "Gallio", "ACT.18.12"), place("a6f437a.geojson", "Corinth", "ACT.18.1")],
  "paul-voyage": [paul("ACT.27.1"), place("a57835d.geojson", "Melita (Malta)", "ACT.28.1")],
  "paul-rome": [paul("ACT.28.16"), place("afc8e7a.geojson", "Rome", "ACT.28.16")],
  "gospel-storm": [jesus("MAT.8.22")],
  "gospel-lost-found": [jesus("LUK.14.3")],
  "gospel-offences": [{ ...jesus("MAT.18.2"), evidence: "Matthew 18:2 introduces Jesus as the speaker; the warnings continue that teaching. The link identifies the teacher, not an unnamed little one." }],
  "gospel-matthew-lost-sheep": [{ ...jesus("MAT.18.2"), evidence: "Jesus is the speaker introduced in Matthew 18:2. This links the teacher, not a historical identity for the shepherd in the illustration." }],
  "gospel-brother-trespass": [{ ...jesus("MAT.18.2"), evidence: "The instruction continues Jesus's discourse introduced in Matthew 18:2. No identity is assigned to the hypothetical brother." }],
  "gospel-vineyard-labourers": [{ ...jesus("MAT.19.28"), evidence: "Jesus's answer to the disciples in Matthew 19:28 continues into the vineyard parable. This links the teacher, not a historical employer or labourer." }],
  "gospel-watchfulness": [jesusTeaching("LUK.12.1", "Luke introduces the continuing address to the disciples before the crowd.")],
  "gospel-rich-fool": [jesusTeaching("LUK.12.16", "The inheritance question leads to Jesus telling the parable.")],
  "gospel-ready-servants": [jesusTeaching("LUK.12.42", "The Lord answers Peter's question with the steward teaching.")],
  "gospel-division-discernment": [jesusTeaching("LUK.12.54", "Jesus's discourse turns from the disciples to the people.")],
  "gospel-luke-mustard-leaven": [jesusTeaching("LUK.13.18", "The kingdom comparisons continue Jesus's teaching after the Sabbath healing.")],
  "gospel-lowest-room": [jesusTeaching("LUK.14.3", "Jesus is named at the start of this meal; the instructions to guests and host follow.")],
  "gospel-great-supper": [jesusTeaching("LUK.14.3", "Jesus is named in the meal scene that introduces the guest's remark and this parable.")],
  "gospel-cost-discipleship": [jesusTeaching("LUK.14.25", "Jesus turns to the multitudes travelling with him.")],
  "gospel-lost-coin": [jesusTeaching("LUK.15.3", "The introduction to Jesus's parable sequence establishes the speaker for the following illustration.")],
  "gospel-lost-son": [jesusTeaching("LUK.15.3", "Jesus's parable sequence continues with the father and two sons.")],
  "gospel-forgiveness-faith": [jesusTeaching("LUK.17.1", "Luke introduces Jesus addressing the disciples; the apostles' request follows.")],
  "gospel-persistent-widow": [jesusTeaching("LUK.18.1", "Luke introduces Jesus telling a parable about praying without fainting.")],
  "gospel-pharisee-publican": [jesusTeaching("LUK.18.9", "Luke introduces another parable to those trusting in their own righteousness.")],
  "gospel-supper-greatness": [jesusTeaching("LUK.22.15", "Jesus's supper address continues with a response to the dispute about greatness.")],
  "gospel-guard-report": [jesus("MAT.28.9"), jerusalem("MAT.27.53")],
  "ot-eden": [person("adam_2", "Adam", "GEN.3.17"), person("eve_3", "Eve", "GEN.3.20"), place("af3daeb.geojson", "Garden of Eden", "GEN.2.8")],
  "context-sng": [person("solomon_677", "Solomon", "SNG.1.1")],
  "nebuchadnezzar-reign": [person("nebuchadnezzar_998", "Nebuchadnezzar", "2KI.24.11")],
  "cyrus-reign": [person("cyrus_2034", "Cyrus", "EZR.1.1")],
  "darius-reign": [person("darius_2125", "Darius I", "EZR.6.1")],
  "augustus-reign": [person("augustus_2875", "Augustus", "LUK.2.1")],
  "tiberius-reign": [person("tiberius_2880", "Tiberius", "LUK.3.1")],
  "shalmaneser-reign": [person("shalmaneser_945", "Shalmaneser", "2KI.17.3")],
  "sennacherib-reign": [person("sennacherib_951", "Sennacherib", "2KI.18.13")],
  "tiglath-reign": [person("pul_931", "Tiglath-pileser", "2KI.15.29")],
  "artaxerxes-reign": [person("artaxerxes_2139", "Artaxerxes", "EZR.7.1")],
  "claudius-reign": [person("claudius_2969", "Claudius", "ACT.11.28")],
  "agrippa-i-reign": [person("herod_2970", "Herod Agrippa I", "ACT.12.1")],
  "jer-restoration": [person("jeremiah_2033", "Jeremiah", "JER.30.1")],
  "ezekiel-land-warning": [{ ...person("ezekiel_2766", "Ezekiel", "EZK.1.3"), association: "context" }],
  "passage-psa-120": [place("a5f9092.geojson", "Mesech", "PSA.120.5")],
  "passage-psa-128": [jerusalem("PSA.128.5")],
  "sargon-reign": [place("a30c937.geojson", "Ashdod", "ISA.20.1")],
  "xerxes-reign": [{ ...person("ahasuerus_2126", "Ahasuerus (proposed identification)", "EST.1.1"), association: "context", evidence: "The existing chronology proposes Xerxes as Esther's Ahasuerus; that identification remains provisional." }, place("a033b84.geojson", "Shushan", "EST.1.2")],
  socrates: [historicalPlace("a1fe6e7.geojson", "Athens", "ACT.17.16", "Socrates' Athenian setting comes from the historical article listed on Credits. Acts identifies the mapped city, not Socrates or his dates.")],
  plato: [historicalPlace("a1fe6e7.geojson", "Athens", "ACT.17.16", "Plato's Academy in Athens is described in the Aristotle article on Credits. Acts identifies the mapped city, not Plato or his dates.")],
  aristotle: [historicalPlace("a1fe6e7.geojson", "Athens", "ACT.17.16", "Aristotle studied and later taught in Athens; see the historical article on Credits. Acts identifies the mapped city, not Aristotle or his dates.")],
  alexander: [historicalPlace("ab9696f.geojson", "Persia", "EZR.1.1", "Alexander's conquest of Persia is described by the linked historical source. Ezra identifies the mapped region; it does not date Alexander's campaigns.")],
  antiochus: [historicalPlace("a15257a.geojson", "Jerusalem", "2CH.3.1", "The linked historical source describes Antiochus IV's intervention in Jerusalem. Chronicles identifies the mapped city, not the later Maccabean events.")],
  "nero-reign": [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "Rome provides geographic context for Nero's reign and Paul's custody. This does not imply that Paul met Nero.")],
  "domitian-reign": [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "Rome provides geographic context for Domitian's imperial reign. Acts identifies the city in an earlier period; it does not mention Domitian.")],
  "pilate-prefecture": [person("pontius_pilate_2860", "Pontius Pilate", "LUK.3.1")],
  seneca: [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "Seneca's Roman setting comes from the Stanford source on Credits. Acts identifies the city, not Seneca or a meeting with Paul.")],
  "rome-fire": [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "Tacitus supplies the fire and persecution account. Acts identifies Rome in an earlier episode, not the AD 64 fire.")],
  "vespasian-reign": [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "Rome is geographic context for the emperor. Acts identifies the city, not Vespasian or his reign dates.")],
  "jerusalem-70": [historicalPlace("a15257a.geojson", "Jerusalem", "2CH.3.1", "Chronicles identifies the mapped city. The AD 70 event is externally sourced and distinct from the Babylonian destruction.")],
  "josephus-antiquities": [historicalPlace("a15257a.geojson", "Jerusalem (historical subject)", "2CH.3.1", "Jerusalem is a subject of Josephus's history. This link does not identify the place or date of publication; Chronicles supplies the mapped city's reference.")],
  "pliny-elder": [historicalPlace("afc8e7a.geojson", "Rome", "ACT.28.16", "The historical source places Pliny's education in Rome. Acts identifies the city, not Pliny or a meeting with Paul.")],
  "nabonidus-reign": [historicalPlace("a217d18.geojson", "Babylonia", "2KI.24.15", "The chronicle supplies Nabonidus's royal setting. Kings identifies the mapped region in an earlier deportation; it does not name Nabonidus or date his reign.")],
  "cambyses-reign": [historicalPlace("ab9696f.geojson", "Persia", "EZR.1.1", "The historical source supplies Cambyses's reign. Ezra identifies Persia under Cyrus; this does not identify Cambyses with a king in Ezra's correspondence.")],
  "cambyses-egypt": [historicalPlace("af301ca.geojson", "Egypt", "GEN.46.3", "Genesis identifies the mapped country in a much earlier episode. The Persian campaign and its date come from the historical source, not this passage.")],
};

export function timelineToolKey(link: TimelineRelatedTool) {
  return link.request.kind === "genealogy" ? `genealogy:${link.request.personId}` : link.request.kind === "maps" ? `maps:${link.request.geojsonFile}` : "timeline";
}

/** A named book setting is not an assertion that this person speaks every verse. */
const BOOK_CONNECTIONS: Record<string, TimelineRelatedTool> = {
  job: person("job_2665", "Job", "JOB.1.1"),
  pro: person("solomon_677", "Solomon", "PRO.1.1"),
  ecc: person("david_593", "David", "ECC.1.1"),
  sng: person("solomon_677", "Solomon", "SNG.1.1"),
  lam: jerusalem("LAM.1.7"),
  isa: person("isaiah_961", "Isaiah", "ISA.1.1"),
  jer: person("jeremiah_2033", "Jeremiah", "JER.1.1"),
  ezk: person("ezekiel_2766", "Ezekiel", "EZK.1.3"),
  hos: person("hosea_2790", "Hosea", "HOS.1.1"),
  amo: person("amos_2799", "Amos", "AMO.1.1"),
  oba: person("obadiah_2801", "Obadiah", "OBA.1.1"),
  jon: person("jonah_922", "Jonah", "JON.1.1"),
  mic: person("micah_2696", "Micah", "MIC.1.1"),
  nam: person("nahum_2802", "Nahum", "NAM.1.1"),
  hab: person("habakkuk_2803", "Habakkuk", "HAB.1.1"),
  zep: person("zephaniah_2804", "Zephaniah", "ZEP.1.1"),
  zec: person("zechariah_2135", "Zechariah", "ZEC.1.1"),
  mal: person("malachi_2817", "Malachi", "MAL.1.1"),
};

export function timelineRelatedTools(record: TimelineRecord, includePeople = true): TimelineRelatedTool[] {
  const direct = TIMELINE_RELATED_TOOLS[record.id] ?? (record.personIds?.length ? [person(record.personIds[0], record.label, record.references[0] ?? "")] : []);
  const contextual: TimelineRelatedTool[] = [];
  const code = /^passage-([a-z0-9]+)-/.exec(record.id)?.[1];
  if (code && BOOK_CONNECTIONS[code]) contextual.push({ ...BOOK_CONNECTIONS[code], association: "context", evidence: code === "ecc" ? "The opening describes the Preacher as a son of David. This link does not settle the Preacher's identity." : "Named in the book's setting; this does not identify the speaker or date of every passage." });
  if (record.id === "context-lam") contextual.push({ ...jerusalem("LAM.1.7"), association: "context" });
  const heading = TIMELINE_HEADING_CONNECTIONS[record.id];
  if (heading) for (const [id, label] of heading.people) contextual.push({ ...person(id, label, heading.reference), association: "context", referenceLabel: heading.label, evidence: heading.text });
  const passage = (TIMELINE_PASSAGE_CONNECTIONS[record.id] ?? []).map(([kind, id, label, reference]): TimelineRelatedTool => ({ ...(kind === "maps" ? place(id, label, reference) : person(id, label, reference)), association: "passage" }));
  const links = [...new Map([...direct, ...contextual, ...passage].reverse().map(link => [timelineToolKey(link), link])).values()].reverse();
  return includePeople ? links : links.filter(link => link.request.kind !== "genealogy");
}
