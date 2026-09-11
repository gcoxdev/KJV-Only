import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";

export type TimelineCollection = "gospels" | "paul";
export type NarrativePassage = {
  book: string;
  startChapter: number;
  endChapter: number;
  startVerse: number;
  endVerse: number;
  reference: string;
  label: string;
};
export type NarrativeDetails = {
  collection?: TimelineCollection;
  phase: string;
  order: number;
  passages: NarrativePassage[];
};
export const TIMELINE_COLLECTIONS = {
  chapter: "Chapter", book: "Book", gospels: "Gospel harmony", paul: "Paul’s missions", world: "Wider history",
};
export const TIMELINE_PHASES: Record<TimelineCollection, string[]> = {
  gospels: ["Origins and childhood", "Beginning of ministry", "Galilean ministry", "Toward Jerusalem", "Final week", "Resurrection appearances"],
  paul: ["Conversion and early ministry", "First mission", "Jerusalem council", "Second mission", "Third mission", "Custody and Rome", "Later letters and plans"],
};
const BOOKS: Record<string, string> = { MAT: "Matthew", MRK: "Mark", LUK: "Luke", JHN: "John", ACT: "Acts", GAL: "Galatians", ROM: "Romans", "1TI": "1 Timothy", "2TI": "2 Timothy", TIT: "Titus" };
// These are curated narrative ranges, not a rule that every supporting citation
// dates its chapter. For instance, Acts 26 recalls conversion during a later hearing.
function passages(ranges: string[]): NarrativePassage[] {
  return ranges.map(range => {
    const match = /^(\w+)\.(\d+)\.(\d+)-(\d+)\.(\d+)$/.exec(range);
    if (!match || !BOOKS[match[1]]) throw new Error(`Invalid narrative range: ${range}`);
    const [, code, sc, sv, ec, ev] = match;
    return { book: BOOKS[code], startChapter: +sc, startVerse: +sv, endChapter: +ec, endVerse: +ev,
      reference: `${code}.${sc}.${sv}`, label: `${BOOKS[code]} ${sc}:${sv}–${sc === ec ? ev : `${ec}:${ev}`}` };
  });
}
const records: ContextTimelineRecord[] = [];
export const NT_NARRATIVE_DETAILS: Record<string, NarrativeDetails> = {};
function details(id: string, collection: TimelineCollection | undefined, phase: string, ranges: string[]) {
  const value = { collection, phase, order: Object.keys(NT_NARRATIVE_DETAILS).length, passages: passages(ranges) };
  NT_NARRATIVE_DETAILS[id] = value;
  return value;
}
function add(id: string, label: string, collection: TimelineCollection | undefined, phase: string, ranges: string[], dates: [number, number] | number | null, note: string, references: string[] = []) {
  const narrative = details(id, collection, phase, ranges);
  const start = Array.isArray(dates) ? dates[0] : dates ?? undefined;
  const end = Array.isArray(dates) ? dates[1] : undefined;
  records.push({ id, label, track: "biblical", era: "gospels", kind: Array.isArray(dates) ? "date-window" : dates === null ? "period" : "event",
    start, end, startStatus: start === undefined ? "unknown" : "approximate", endStatus: end === undefined ? "unknown" : "approximate",
    references: [...new Set([...narrative.passages.map(p => p.reference), ...references])], sources: ["nt"], note, narrative });
}
const MINISTRY = " The AD 27–30 window is the shared working ministry framework, not a duration or a separately established year for this episode. An AD 33 resurrection chronology moves its later boundary. The reading order does not settle every cross-Gospel sequence.";
const PASSION = " Uses the shared provisional AD 30 resurrection year; AD 33 remains a major alternative. This is a year marker, not a claim that the exact calendar day is settled.";
function gospel(id: string, label: string, phase: number, ranges: string[], note: string, dates: [number, number] | number | null = [27, 30]) {
  add(id, label, "gospels", TIMELINE_PHASES.gospels[phase], ranges, dates, note + (Array.isArray(dates) && dates[0] === 27 && dates[1] === 30 ? MINISTRY : dates === 30 ? PASSION : ""));
}
function reuseGospel(id: string, phase: number, ranges: string[]) { details(id, "gospels", TIMELINE_PHASES.gospels[phase], ranges); }

gospel("gospel-prologue", "The Word and the Gospel introductions", 0, ["JHN.1.1-1.18", "LUK.1.1-1.4"], "John's opening reaches before creation; Luke explains his account. Neither introduction is assigned a birth year or a composition date here.", null);
gospel("gospel-genealogies", "The genealogies of Jesus", 0, ["MAT.1.1-1.17", "LUK.3.23-3.38"], "These accounts recall many generations, not one ministry event. Their differing lines and interpretations can be explored in Genealogy; this comparison does not assign all ancestors a shared date.", null);
gospel("gospel-annunciations", "Announcements to Zacharias, Mary, and Joseph", 0, ["LUK.1.5-1.56", "MAT.1.18-1.25"], "The announcements precede the births in the KJV narrative. The conception intervals are relative evidence; no separate calendar year is assigned.", null);
gospel("gospel-john-birth", "Birth of John the Baptist", 0, ["LUK.1.57-1.80"], "Luke links the pregnancies through Elisabeth's sixth month (1:26,36). John's birth precedes Jesus's, but its separate calendar date remains unassigned.", null);
reuseGospel("jesus-birth", 0, ["MAT.1.18-1.25", "LUK.2.1-2.20"]);
gospel("gospel-presentation", "Circumcision and presentation at the temple", 0, ["LUK.2.21-2.38"], "Luke gives circumcision on the eighth day and then the purification observance. The broad birth-era window allows the following weeks; it does not make these one ceremony.", [-5, -2]);
gospel("gospel-magi-egypt", "Wise men, flight to Egypt, and return to Nazareth", 0, ["MAT.2.1-2.23"], "Matthew orders the visit, flight, Herod's death, and return. The sequence falls within the provisional birth/Herod framework; the window is not a measured duration in Egypt. Luke 2:39 is not used to force the visits into a different order.", [-5, -3]);
reuseGospel("jesus-age-twelve", 0, ["LUK.2.39-2.52"]);
reuseGospel("john-ministry", 1, ["MAT.3.1-3.12", "MRK.1.1-1.8", "LUK.3.1-3.20", "JHN.1.19-1.28"]);
reuseGospel("jesus-baptism", 1, ["MAT.3.13-3.17", "MRK.1.9-1.11", "LUK.3.21-3.22"]);
gospel("gospel-temptation", "Temptation in the wilderness", 1, ["MAT.4.1-4.11", "MRK.1.12-1.13", "LUK.4.1-4.13"], "The accounts place the temptation after baptism. Matthew and Luke present the temptations in differing order; the forty days are retained without claiming a precise starting day.");
gospel("gospel-first-disciples", "John's witness and the first disciples", 1, ["JHN.1.29-1.51"], "John describes testimony about the Lamb of God and disciples meeting Jesus. John 1:32–34 recalls the Spirit's descent; it is not treated as a second baptism.");
gospel("gospel-cana", "Water made wine at Cana", 1, ["JHN.2.1-2.12"], "John identifies this as the beginning of miracles and then mentions a stay at Capernaum.");
gospel("gospel-early-temple", "Temple cleansing in John's opening ministry", 1, ["JHN.2.13-2.25"], "John places this at an early Passover. The Synoptics describe a cleansing near the Passion. They remain separate entries: whether there were two cleansings or a different narrative arrangement is not silently decided.");
gospel("gospel-nicodemus", "Nicodemus and ministry in Judaea", 1, ["JHN.3.1-3.36"], "John records the night conversation and ministry alongside John the Baptist before John's imprisonment (3:24).");
gospel("gospel-samaria", "Jesus and the woman of Samaria", 1, ["JHN.4.1-4.42"], "John describes the journey through Samaria, the conversation at the well, and two days with the Samaritans. The subsequent Galilean healing is a separate entry.");
gospel("gospel-nobleman-son", "The nobleman's son healed from Cana", 1, ["JHN.4.43-4.54"], "John places Jesus at Cana while the sick child is at Capernaum. This is not equated with the centurion's servant in Matthew 8 and Luke 7.");
gospel("gospel-galilee-opening", "Opening Galilean preaching and calling fishermen", 2, ["MAT.4.12-4.25", "MRK.1.14-1.20", "LUK.4.14-4.15", "LUK.5.1-5.11"], "These passages introduce Galilean ministry and the fishermen. Luke's miraculous catch supplies additional material; the correspondence between individual calls is not a fixed day-by-day reconstruction.");
gospel("gospel-nazareth", "Jesus rejected at Nazareth", 2, ["LUK.4.16-4.30"], "Luke presents the synagogue reading early. Matthew 13:53–58 and Mark 6:1–6 describe rejection later in their accounts; these are kept separately rather than assuming one visit.");
gospel("gospel-capernaum", "Healings at Capernaum and preaching in Galilee", 2, ["MRK.1.21-1.45", "LUK.4.31-4.44", "LUK.5.12-5.16", "MAT.8.1-8.4", "MAT.8.14-8.17"], "A related group of healings and preaching reports, including Peter's mother-in-law and the leper. The Gospel arrangements do not establish one shared date for every healing.");
gospel("gospel-paralytic-levi", "The paralytic, Matthew's call, and questions about fasting", 2, ["MAT.9.1-9.17", "MRK.2.1-2.22", "LUK.5.17-5.39"], "The accounts connect these episodes; Matthew and Levi are conventionally identified from the parallel calling narratives. Each healing and conversation remains part of a sequence.");
gospel("gospel-bethesda", "Healing at Bethesda and testimony about the Son", 2, ["JHN.5.1-5.47"], "John names a feast but does not identify it as Passover. No extra ministry year is added on that assumption.");
gospel("gospel-sabbath-twelve", "Sabbath disputes and choosing the twelve", 2, ["MAT.12.1-12.21", "MRK.2.23-3.19", "LUK.6.1-6.16"], "Parallel Sabbath disputes and the appointment of the twelve are grouped for context, without treating every account as the same day's events.");
gospel("gospel-sermon-mount", "Sermon on the mount", 2, ["MAT.5.1-7.29"], "Matthew's sustained teaching is kept as its own discourse. Similar sayings in Luke do not by themselves prove the same occasion.");
gospel("gospel-sermon-plain", "Teaching on the plain", 2, ["LUK.6.17-6.49"], "Luke describes a plain and records related teachings. This remains distinct from Matthew 5–7 because the identity and setting of the sermons are debated.");
gospel("gospel-centurion-servant", "The centurion's servant healed", 2, ["MAT.8.5-8.13", "LUK.7.1-7.10"], "Matthew presents the centurion's appeal directly; Luke describes elders and friends sent on his behalf. The linked accounts preserve those details rather than inventing a second healing or silently removing the messengers.");
gospel("gospel-nain", "The widow's son raised at Nain", 2, ["LUK.7.11-7.17"], "Luke places this after the centurion episode and names Nain. The widow's son is distinct from Jairus's daughter and Lazarus of Bethany.");
gospel("gospel-john-question", "John's question and Jesus's testimony about John", 2, ["MAT.11.1-11.30", "LUK.7.18-7.35"], "John sends messengers from prison. Matthew includes further sayings; the shared question does not prove every attached saying was delivered simultaneously.");
gospel("gospel-anointing-galilee", "The woman who anoints Jesus at the Pharisee's house", 2, ["LUK.7.36-7.50"], "Luke's unnamed woman is not identified here as Mary of Bethany or Mary Magdalene. This is kept distinct from the Bethany anointing near the Passion.");
gospel("gospel-family-opposition", "Growing opposition and Jesus's family", 2, ["MAT.12.22-12.50", "MRK.3.20-3.35"], "Related accounts of accusations and Jesus's response concerning his family. The broader ministry window does not date every saying precisely.");
gospel("gospel-parables", "Parables of the kingdom and hearing the word", 2, ["MAT.13.1-13.52", "MRK.4.1-4.34", "LUK.8.1-8.21"], "The sower provides a clear parallel; these chapters also contain different parables and introductory material. This is a teaching collection, not an assertion that all sayings occurred on one occasion.");
gospel("gospel-following-cost", "Following Jesus: departure and discipleship", 2, ["MAT.8.18-8.22"], "Matthew places these sayings before the crossing. Similar sayings in Luke 9:57–62 appear in a later travel section; their similarity does not settle whether they were spoken on one occasion.");
gospel("gospel-storm", "Jesus stills the storm", 2, ["MAT.8.23-8.27", "MRK.4.35-4.41", "LUK.8.22-8.25"], "The accounts connect the crossing and storm before the deliverance across the sea. The storm is a separate episode from the later walking on the water.");
gospel("gospel-demons", "Deliverance in the country across the sea", 2, ["MAT.8.28-8.34", "MRK.5.1-5.20", "LUK.8.26-8.39"], "Matthew mentions two men while Mark and Luke focus on one. The linked accounts retain the KJV's geographical wording and differing details; no extra event is invented merely to remove those differences.");
gospel("gospel-jairus", "Jairus's daughter and the woman with an issue of blood", 2, ["MAT.9.18-9.26", "MRK.5.21-5.43", "LUK.8.40-8.56"], "The intertwined healings form a clear narrative parallel. Matthew presents the ruler's appeal compactly; Mark and Luke describe the later message about his daughter's death. The accounts remain available for comparison without an invented clock schedule.");
gospel("gospel-blind-mute-harvest", "Two blind men, a dumb man, and the harvest", 2, ["MAT.9.27-9.38"], "Matthew continues with distinct healings and a summary of Jesus's teaching and compassion. These are separated from Jairus's household and are not equated with the later blind men near Jericho.");
gospel("gospel-nazareth-later", "Rejection at Nazareth in Matthew and Mark", 2, ["MAT.13.53-13.58", "MRK.6.1-6.6"], "Kept distinct from Luke 4's earlier-positioned Nazareth account; a repeated visit or differing arrangement remains possible.");
gospel("gospel-twelve-sent", "The twelve sent out", 2, ["MAT.10.1-10.42", "MRK.6.7-6.13", "LUK.9.1-9.6"], "The mission of the twelve is distinct from Luke's later mission of the seventy. Matthew's extended instructions are not used to date every saying separately.");
gospel("gospel-john-death", "Death of John the Baptist, recalled by Herod", 2, ["MAT.14.1-14.12", "MRK.6.14-6.29", "LUK.9.7-9.9"], "Matthew and Mark recount an earlier execution while describing Herod's response to Jesus. Its recalled position does not make the death simultaneous with the feeding that follows.");
gospel("gospel-feeding-5000", "Feeding the five thousand", 2, ["MAT.14.13-14.21", "MRK.6.30-6.44", "LUK.9.10-9.17", "JHN.6.1-6.15"], "All four Gospels record this feeding. John places it near Passover; the exact year is not stated. It is distinct from the feeding of four thousand.");
gospel("gospel-walking-water", "Jesus walks on the sea", 2, ["MAT.14.22-14.33", "MRK.6.45-6.52", "JHN.6.16-6.21"], "All three accounts place this crossing after the feeding of five thousand. Matthew additionally narrates Peter walking toward Jesus; it is not attributed to the other accounts.");
gospel("gospel-gennesaret", "Healings in Gennesaret", 2, ["MAT.14.34-14.36", "MRK.6.53-6.56"], "The healings follow the landing after the crossing. This is a regional ministry summary, not a single dated healing.");
gospel("gospel-bread-life", "The bread of life discourse", 2, ["JHN.6.22-6.71"], "John places the crowd's search on the following day and identifies teaching in the Capernaum synagogue (6:59). The teaching is separate from the feeding and sea crossing that precede it.");
gospel("gospel-traditions", "Traditions, the Syrophenician woman, and healings", 2, ["MAT.15.1-15.31", "MRK.7.1-7.37"], "A sequence of teaching and travel toward Tyre and Sidon, followed by healings. Related sections contain different details and are not a single event.");
gospel("gospel-feeding-4000", "Feeding the four thousand", 2, ["MAT.15.32-15.39", "MRK.8.1-8.10"], "Kept distinct from the five thousand; Jesus later recalls both feedings (Matthew 16:9–10; Mark 8:19–20).");
gospel("gospel-peter-confession", "Peter's confession and the coming Passion", 2, ["MAT.16.1-16.28", "MRK.8.11-9.1", "LUK.9.18-9.27"], "The shared confession and Passion prediction anchor this section. Matthew and Mark also include earlier disputes and travel; they are not all placed on the day of the confession.");
gospel("gospel-transfiguration", "Transfiguration and return from the mountain", 2, ["MAT.17.1-17.27", "MRK.9.2-9.32", "LUK.9.28-9.45"], "Matthew and Mark say after six days; Luke says about eight days after the sayings. These relative descriptions are preserved, with no invented calendar date.");
gospel("gospel-humility", "Humility, forgiveness, and care for little ones", 2, ["MAT.18.1-18.35", "MRK.9.33-9.50", "LUK.9.46-9.50"], "Related teaching sections, including material unique to Matthew. Similar subjects do not establish one occasion for every saying.");
gospel("gospel-tabernacles", "Feast of tabernacles and disputes in Jerusalem", 3, ["JHN.7.1-8.59"], "John explicitly names tabernacles. The KJV sequence is retained, including John 7:53–8:11. The feast's year is not independently fixed here.");
gospel("gospel-blind-shepherd", "The man born blind and the good shepherd", 3, ["JHN.9.1-10.21"], "John connects the healing, investigation, and teaching. This remains distinct from the later feast of dedication in 10:22.");
gospel("gospel-dedication", "Feast of dedication and withdrawal beyond Jordan", 3, ["JHN.10.22-10.42"], "John specifies winter at the feast of dedication, then a withdrawal beyond Jordan. No exact year is supplied.");
gospel("gospel-seventy", "Toward Jerusalem: the seventy, the Samaritan, Martha and Mary", 3, ["LUK.9.51-10.42"], "Luke begins the journey toward Jerusalem and records the seventy's mission. The good Samaritan is a parable, not a dated historical incident; the visit to Martha and Mary is a separate episode.");
gospel("gospel-luke-prayer", "Teaching on prayer and responses to opposition", 3, ["LUK.11.1-11.54"], "This dates the setting of Jesus's teaching only broadly. Repeated sayings are not forced into the same occasion as similar material in Matthew.");
gospel("gospel-watchfulness", "Teaching on trust, readiness, and repentance", 3, ["LUK.12.1-13.35"], "A sequence of discourses and a Sabbath healing. The rich fool and barren fig tree are parables; their story events are not plotted as historical occurrences.");
gospel("gospel-table-discipleship", "A Sabbath meal and the cost of discipleship", 3, ["LUK.14.1-14.35"], "Luke records a healing and teaching at a meal, then teaching to the multitudes. The great supper is a parable, not a separate dated banquet.");
gospel("gospel-lost-found", "Parables of the lost sheep, coin, and son", 3, ["LUK.15.1-15.32"], "The approximate window concerns Jesus teaching these parables; the characters' lives are not historical timeline records.");
gospel("gospel-steward-lazarus", "Teaching on stewardship and the rich man and Lazarus", 3, ["LUK.16.1-16.31"], "This records Jesus's teaching, not a calendar placement for the people within it. The Lazarus in this account is not identified with Lazarus of Bethany in John 11.");
gospel("gospel-ten-lepers", "Forgiveness, ten lepers, and the coming kingdom", 3, ["LUK.17.1-18.14"], "Luke gives teaching and the healing while travelling toward Jerusalem. Prophetic sayings and parables are not assigned fulfillment dates within the ministry window.");
gospel("gospel-judaea-rich-ruler", "Beyond Jordan: marriage, children, and the rich ruler", 3, ["MAT.19.1-20.16", "MRK.10.1-10.31", "LUK.18.15-18.30"], "Related narrative and teaching sections; Matthew's labourers in the vineyard is a parable, not a dated event. Cross-Gospel order is approximate.");
gospel("gospel-lazarus-raised", "Lazarus raised at Bethany; withdrawal to Ephraim", 3, ["JHN.11.1-11.57"], "John distinguishes Lazarus's raising, the council's response, and withdrawal before the final Passover.");
gospel("gospel-jericho", "Approaching Jerusalem through Jericho", 3, ["MAT.20.17-20.34", "MRK.10.32-10.52", "LUK.18.31-19.27"], "The Passion prediction, blind men's healing, and Zacchaeus belong to the final approach. Luke and the other accounts differ in their approach/departure descriptions at Jericho; no invented second city or forced sequence resolves that here. The pounds are a parable.");
gospel("gospel-bethany-anointing", "Anointing at Bethany before the Passion", 4, ["MAT.26.6-26.13", "MRK.14.3-14.9", "JHN.12.1-12.11"], "John supplies the six-days-before-Passover setting; Matthew and Mark recount an anointing in their Passion introductions. Their accounts are compared without treating narrative position as the precise day. Luke 7 remains separate.", 30);
gospel("gospel-entry", "Triumphal entry into Jerusalem", 4, ["MAT.21.1-21.11", "MRK.11.1-11.11", "LUK.19.28-19.44", "JHN.12.12-12.19"], "The four accounts describe the entry. Their different details are retained through parallel passage links.", 30);
gospel("gospel-final-temple", "Temple cleansing and the fig tree near the Passion", 4, ["MAT.21.12-21.22", "MRK.11.12-11.26", "LUK.19.45-19.48"], "Mark distinguishes successive days; Matthew arranges the fig-tree material more compactly. John's early cleansing stays a separate entry, without assuming it must be the same visit.", 30);
gospel("gospel-authority", "Jesus questioned about his authority", 4, ["MAT.21.23-21.27", "MRK.11.27-11.33", "LUK.20.1-20.8"], "The chief priests and elders question Jesus, who responds with a question about John's baptism. The passages compare the same central exchange.", 30);
gospel("gospel-two-sons", "Parable of the two sons", 4, ["MAT.21.28-21.32"], "Matthew places this teaching in the temple disputes. The year concerns Jesus's teaching, not a historical date for the two sons in the parable.", 30);
gospel("gospel-wicked-husbandmen", "Parable of the wicked husbandmen", 4, ["MAT.21.33-21.46", "MRK.12.1-12.12", "LUK.20.9-20.19"], "The vineyard parable is shared by the Synoptics. Its servants, son, and judgment are not individually dated by this teaching marker.", 30);
gospel("gospel-marriage-feast", "Parable of the marriage feast", 4, ["MAT.22.1-22.14"], "Matthew's marriage feast remains separate from Luke 14's great supper. Related images do not establish the same teaching occasion or a historical banquet date.", 30);
gospel("gospel-caesar-tax", "The question about tribute to Caesar", 4, ["MAT.22.15-22.22", "MRK.12.13-12.17", "LUK.20.20-20.26"], "The accounts describe the challenge concerning tribute and the coin. This is not a meeting between Jesus and the emperor.", 30);
gospel("gospel-sadducees", "The Sadducees question the resurrection", 4, ["MAT.22.23-22.33", "MRK.12.18-12.27", "LUK.20.27-20.40"], "The hypothetical seven brothers belong to the question, not seven newly dated historical people. The marker locates Jesus's response.", 30);
gospel("gospel-great-commandment", "The greatest commandment", 4, ["MAT.22.34-22.40", "MRK.12.28-12.34"], "Matthew and Mark place this exchange in the Jerusalem disputes. Luke 10:25–28 has a related exchange in another setting and is not merged into it.", 30);
gospel("gospel-davids-lord", "David's son and David's Lord", 4, ["MAT.22.41-22.46", "MRK.12.35-12.37", "LUK.20.41-20.44"], "Jesus's question quotes Psalm 110. The marker dates the teaching, not David's life or the psalm's composition.", 30);
gospel("gospel-woes", "Warnings concerning scribes and Pharisees", 4, ["MAT.23.1-23.39", "MRK.12.38-12.40", "LUK.20.45-20.47"], "Matthew gives an extended discourse; Mark and Luke record shorter warnings. The grouping compares related teaching without claiming that every saying has a counterpart in all three.", 30);
gospel("gospel-widow-offering", "The widow's two mites", 4, ["MRK.12.41-12.44", "LUK.21.1-21.4"], "Both accounts describe Jesus observing gifts at the treasury. This is distinct from the widow at Nain and the widow in Luke 18's parable.", 30);
gospel("gospel-greeks", "Greeks seek Jesus and his final public appeal", 4, ["JHN.12.20-12.50"], "John includes the request from Greeks and teaching about Jesus's coming death. This does not identify any of these visitors with the philosophers shown in wider history.", 30);
gospel("gospel-olivet", "Olivet discourse: watchfulness and coming judgment", 4, ["MAT.24.1-25.46", "MRK.13.1-13.37", "LUK.21.5-21.38"], "The marker dates the giving of the discourse only. Predicted events, the ten virgins, talents, and judgment are not assigned AD 30 fulfillment dates.", 30);
gospel("gospel-betrayal-preparation", "The plot, Judas's agreement, and Passover preparation", 4, ["MAT.26.1-26.5", "MAT.26.14-26.19", "MRK.14.1-14.2", "MRK.14.10-14.16", "LUK.22.1-22.13"], "Successive preparations before the final supper, not one instantaneous event.", 30);
gospel("gospel-last-supper", "The last supper and washing the disciples' feet", 4, ["MAT.26.20-26.35", "MRK.14.17-14.31", "LUK.22.14-22.38", "JHN.13.1-13.38"], "Parallel accounts of the final meal and associated sayings; the foot washing is in John. The relation between Synoptic Passover wording and John's calendar expressions is debated. This harmony does not impose an exact weekday or erase that question.", 30);
gospel("gospel-farewell", "Farewell teaching and Jesus's prayer", 4, ["JHN.14.1-17.26"], "John's connected farewell discourse and prayer before the arrest. The words concern future events also; the marker dates the teaching rather than every prediction.", 30);
gospel("gospel-arrest", "Gethsemane and the arrest of Jesus", 4, ["MAT.26.36-26.56", "MRK.14.32-14.52", "LUK.22.39-22.53", "JHN.18.1-18.12"], "The prayer and arrest are linked episodes. John supplies different details rather than the full prayer account.", 30);
gospel("gospel-hearings", "Hearings before the priests; Peter's denials", 4, ["MAT.26.57-27.10", "MRK.14.53-15.1", "LUK.22.54-22.71", "JHN.18.13-18.27"], "The accounts describe hearings and denials with differing narrative arrangements. Matthew adds Judas's death; its inclusion here does not establish the exact hour in relation to each hearing.", 30);
gospel("gospel-pilate", "Jesus before Pilate and Herod", 4, ["MAT.27.11-27.31", "MRK.15.2-15.20", "LUK.23.1-23.25", "JHN.18.28-19.16"], "The Roman hearing is shared; Luke alone describes the referral to Herod. The accounts' time expressions are not forced into an exact modern clock reconstruction.", 30);
gospel("gospel-crucifixion", "Crucifixion and death of Jesus", 4, ["MAT.27.32-27.56", "MRK.15.21-15.41", "LUK.23.26-23.49", "JHN.19.17-19.37"], "All four accounts narrate the crucifixion. This entry separates the death from the burial and resurrection while retaining the shared chronology's alternative year.", 30);
gospel("gospel-burial", "Burial of Jesus and the guarded tomb", 4, ["MAT.27.57-27.66", "MRK.15.42-15.47", "LUK.23.50-23.56", "JHN.19.38-19.42"], "Joseph of Arimathaea's burial is shared; Matthew continues with the request for a guard on the following day. Those actions are not made simultaneous.", 30);
gospel("gospel-empty-tomb", "The empty tomb and resurrection announcement", 5, ["MAT.28.1-28.8", "MRK.16.1-16.8", "LUK.24.1-24.12", "JHN.20.1-20.10"], "These accounts concern discovery of the empty tomb and the witnesses' responses. They include differing visits, witnesses, and messages; the grouping does not claim a settled minute-by-minute sequence.", 30);
gospel("gospel-mary-appearance", "The risen Jesus appears to Mary Magdalene", 5, ["MRK.16.9-16.11", "JHN.20.11-20.18"], "Mark identifies Mary Magdalene as the first appearance; John describes her encounter in the garden. Their testimony remains distinct from the preceding tomb inspection.", 30);
gospel("gospel-women-appearance", "Jesus meets the women returning from the tomb", 5, ["MAT.28.9-28.10"], "Matthew describes the women meeting Jesus as they go to tell the disciples. This remains a separate account from John's encounter with Mary; the exact relationship between the visits is not imposed.", 30);
gospel("gospel-guard-report", "The guards' report and the circulated explanation", 5, ["MAT.28.11-28.15"], "Matthew reports the guards going to the chief priests and the response they are instructed to give. This is a distinct narrated aftermath of the empty tomb.", 30);
gospel("gospel-emmaus", "The road to Emmaus and return to Jerusalem", 5, ["MRK.16.12-16.13", "LUK.24.13-24.35"], "Luke describes two disciples travelling to Emmaus and returning that same hour after recognizing Jesus. Mark's brief two-disciple account is compared here without adding details it does not state.", 30);
gospel("gospel-first-evening", "Jesus appears to the gathered disciples", 5, ["MRK.16.14-16.14", "LUK.24.36-24.43", "JHN.20.19-20.23"], "Luke and John describe an appearance to the gathered disciples; John specifies the first day's evening. Mark's brief appearance to the eleven is a related account without an independently stated day. John says Thomas was absent, so the conventional group title is not used as a headcount.", 30);
gospel("gospel-thomas", "Jesus appears with Thomas present", 5, ["JHN.20.24-20.29"], "John distinguishes this from the earlier appearance and says after eight days. That relative interval is preserved rather than collapsed into the first evening.", 30);
gospel("gospel-commission-jerusalem", "Commission, opened understanding, and the promise", 5, ["MRK.16.15-16.18", "LUK.24.44-24.49"], "These commission and promise passages are compared as related teaching. Luke's narrative is compact; Acts 1:3 supplies forty days of appearances. The comparison does not force all these sayings onto the first evening.", 30);
gospel("gospel-john-purpose", "John's stated purpose for his written signs", 5, ["JHN.20.30-20.31"], "This is the author's explanation of his selection of signs, not another resurrection appearance. No composition year is assigned from its position in the narrative.", null);
gospel("gospel-galilee-commission", "The great commission on the Galilean mountain", 5, ["MAT.28.16-28.20"], "Matthew identifies the mountain meeting in Galilee. Its order relative to John's lakeside appearance is not fixed by the two accounts.", 30);
gospel("gospel-lakeside-appearance", "The lakeside appearance and Jesus's charge to Peter", 5, ["JHN.21.1-21.23"], "John identifies the sea of Tiberias and calls this the third showing to the disciples. The count is retained on John's terms, not imposed as a count of every appearance to every witness. Peter's future death is foretold, not dated here.", 30);
gospel("gospel-john-witness", "The witness behind John's account", 5, ["JHN.21.24-21.25"], "The closing testimony concerns the account and its witness. It is kept unplaced rather than assigning the book's writing to the year of the lakeside appearance.", null);
reuseGospel("ascension", 5, ["MRK.16.19-16.20", "LUK.24.50-24.53", "ACT.1.1-1.14"]);

const MISSION_WINDOWS: Record<number, [number, number]> = { 0: [33, 46], 1: [47, 49], 2: [48, 50], 3: [49, 53], 4: [53, 58], 5: [58, 63] };
function paul(id: string, label: string, phase: number, ranges: string[], note: string, dates: [number, number] | number | null = MISSION_WINDOWS[phase], references: string[] = []) {
  add(id, label, "paul", TIMELINE_PHASES.paul[phase], ranges, dates, note + (Array.isArray(dates) ? " This window bounds a possible date within the reconstructed journey, not the time spent at each stop. Route order follows the cited text; calendar placement is provisional." : ""), references);
  if (phase === 4 || phase === 5) records[records.length - 1].sources.push("festus");
}
function reusePaul(id: string, phase: number, ranges: string[]) { details(id, "paul", TIMELINE_PHASES.paul[phase], ranges); }

paul("paul-conversion", "Saul's conversion on the Damascus road", 0, ["ACT.9.1-9.22"], "Acts narrates the encounter, Ananias's visit, baptism, and preaching. The AD 33–36 proposal is an approximate early-Paul framework, not a year supplied by the KJV. Acts 22 and 26 later recount this event.", [33, 36], ["ACT.22.6", "ACT.26.12", "GAL.1.15"]);
paul("paul-arabia", "Arabia and return to Damascus", 0, ["GAL.1.15-1.18"], "Paul says he went to Arabia, returned to Damascus, then went to Jerusalem after three years. Acts 9 does not narrate the Arabian visit. How to count the three years and fit Acts's many days is not fully specified; no separate calendar bounds are fabricated.", null);
paul("paul-first-jerusalem", "Escape from Damascus; Jerusalem, Caesarea, and Tarsus", 0, ["ACT.9.23-9.31", "GAL.1.18-1.24"], "Acts gives the escape and Barnabas's introduction, followed by Caesarea and Tarsus. Galatians supplies fifteen days with Peter and travel to Syria and Cilicia. Their identification here is a conventional reconstruction; the exact travel year remains uncertain.", [35, 40]);
paul("paul-antioch", "Barnabas brings Saul from Tarsus to Antioch", 0, ["ACT.11.19-11.26"], "Acts says they assembled and taught for a whole year at Antioch. The broad possible-date window does not replace that one-year duration.", [40, 44]);
paul("paul-relief", "Relief sent with Barnabas and Saul; return to Antioch", 0, ["ACT.11.27-11.30", "ACT.12.25-12.25"], "Acts names Barnabas and Saul as the relief bearers and later records their return. The relationship of this visit to Galatians 2's visit is disputed; the famine window does not independently date every leg.", [41, 47]);
paul("paul-cyprus", "Antioch → Seleucia → Salamis → Paphos", 1, ["ACT.13.1-13.12"], "The church sends Barnabas and Saul; they sail to Cyprus, preach at Salamis, and cross to Paphos, where Sergius Paulus hears them.");
paul("paul-pisidia", "Paphos → Perga → Antioch in Pisidia", 1, ["ACT.13.13-13.52"], "John returns to Jerusalem at Perga. Paul and Barnabas continue to Pisidian Antioch and preach in its synagogue; this Antioch is distinct from their Syrian sending church.");
paul("paul-iconium-derbe", "Iconium → Lystra → Derbe", 1, ["ACT.14.1-14.21"], "Opposition at Iconium leads to Lystra and Derbe. The healing and Paul's stoning occur at Lystra before they preach at Derbe.");
paul("paul-first-return", "Return through Lystra, Iconium, Pisidian Antioch, and Perga", 1, ["ACT.14.21-14.25"], "They retrace the route, strengthen the disciples, appoint elders, and pass through Pisidia to Pamphylia and Perga.");
paul("paul-attalia-antioch", "Attalia → Antioch: report to the sending church", 1, ["ACT.14.25-14.28"], "They sail from Attalia back to Antioch and report what God has done. The KJV says they remain a long time, without specifying its length.");
paul("paul-council", "Jerusalem council and the letter to Antioch", 2, ["ACT.15.1-15.35"], "Paul and Barnabas travel through Phenice and Samaria to Jerusalem; the council sends its letter with Judas and Silas. A working date around AD 49 is common. The identification with Galatians 2 is not treated as settled.");
paul("paul-silas-timothy", "Antioch → Syria and Cilicia → Derbe and Lystra", 3, ["ACT.15.36-16.5"], "Barnabas and Mark sail to Cyprus while Paul chooses Silas. Paul strengthens churches through Syria and Cilicia, then Timothy joins at Lystra. These are separate teams, not one route.");
paul("paul-troas-vision", "Phrygia and Galatia → Mysia → Troas", 3, ["ACT.16.6-16.10"], "The text records routes prevented as well as travel completed. They do not enter Bithynia; at Troas the Macedonian vision directs the next crossing.");
paul("paul-philippi", "Samothracia → Neapolis → Philippi", 3, ["ACT.16.11-16.40"], "The Macedonian crossing leads to Lydia's reception and the imprisonment and release at Philippi. This is distinct from the return visit on the third journey.");
paul("paul-thessalonica-berea", "Amphipolis → Apollonia → Thessalonica → Berea", 3, ["ACT.17.1-17.15"], "Paul reasons on three sabbath days at Thessalonica, then travels by night to Berea. The three sabbaths do not necessarily measure his entire stay.");
paul("paul-athens", "Athens: synagogue, marketplace, and Mars' hill", 3, ["ACT.17.16-17.34"], "Paul speaks with Epicurean and Stoic philosophers and addresses the Athenians. Socrates, Plato, and Aristotle lived centuries earlier; they are not Paul's contemporaries or people he meets.");
paul("paul-corinth", "Corinth: Aquila, Priscilla, and eighteen months of teaching", 3, ["ACT.18.1-18.11"], "Acts supplies a year and six months of teaching, followed by the Gallio hearing. Gallio is a calendar anchor; the broad window does not turn this into a four-year stay.", [50, 53], ["ACT.18.12"]);
reusePaul("paul-gallio", 3, ["ACT.18.12-18.17"]);
paul("paul-second-return", "Cenchrea → Ephesus → Caesarea → Antioch", 3, ["ACT.18.18-18.22"], "Paul leaves Corinth after a further stay and visits Ephesus. The ascent to salute the church after Caesarea is commonly read as Jerusalem, but Acts 18:22 does not name the city. He then goes down to Antioch.", [52, 53]);
paul("paul-third-departure", "Antioch → Galatia and Phrygia; Apollos at Ephesus", 4, ["ACT.18.23-18.28"], "Paul revisits the Galatian and Phrygian disciples. Luke then introduces Apollos at Ephesus; Apollos's subsequent journey to Achaia is not attributed to Paul.");
paul("paul-ephesus", "Ephesus: disciples, synagogue, and school of Tyrannus", 4, ["ACT.19.1-19.22"], "Acts gives three months in the synagogue and two years of daily discussion; Paul later recalls three years of warning (20:31). These descriptions are preserved rather than replaced by an exact arrival day. The third journey's AD 53–58 envelope follows the later AD 60 Festus working anchor; other chronologies finish it earlier.", [53, 57], ["ACT.20.31"]);
paul("paul-ephesus-riot", "The Ephesian uproar and departure for Macedonia", 4, ["ACT.19.23-20.1"], "Demetrius's opposition and the theatre assembly precede Paul's departure. Acts describes Paul's intention to visit Jerusalem and Rome without making that intention a completed trip.", [55, 57]);
paul("paul-greece", "Macedonia → Greece → back through Macedonia", 4, ["ACT.20.1-20.5"], "Acts gives three months in Greece. A plot changes the proposed sailing route to Syria; Paul returns through Macedonia instead. Corinth is a conventional setting for the Greek stay but is not named in this verse.", [56, 58]);
paul("paul-troas-eutychus", "Philippi → Troas: seven days and Eutychus", 4, ["ACT.20.6-20.12"], "The group sails after the days of unleavened bread, reaches Troas in five days, and stays seven days. The meeting and restoration of Eutychus occur before departure.", [57, 58]);
paul("paul-miletus", "Assos → Mitylene → Chios → Samos → Miletus", 4, ["ACT.20.13-20.38"], "Paul walks to Assos while the others sail. The KJV also names the stay at Trogyllium. At Miletus he calls the Ephesian elders; he does not revisit Ephesus on this leg.", [57, 58]);
paul("paul-jerusalem-return", "Coos → Rhodes → Patara → Tyre → Ptolemais → Caesarea → Jerusalem", 4, ["ACT.21.1-21.17"], "Acts names the coastal stops, seven days at Tyre, a day at Ptolemais, and time with Philip in Caesarea before Jerusalem. Passing Cyprus on the left is not a stop there. The AD 58 endpoint follows the chosen Festus/custody reconstruction.", [57, 58]);
paul("paul-arrest", "Jerusalem: arrest, testimony, and the council", 5, ["ACT.21.18-23.11"], "The narrative setting is Paul's later Jerusalem visit, not his conversion year. Acts 22 recounts the Damascus encounter; that earlier event has its own entry. The AD 58 placement works backward from two years in custody and the provisional AD 60 Festus anchor.", 58, ["ACT.24.27"]);
paul("paul-transfer", "Jerusalem → Antipatris → Caesarea under guard", 5, ["ACT.23.12-23.35"], "After the plot is reported, the escort carries Paul through Antipatris to Felix in Caesarea. This transfer belongs to the later custody sequence, not an additional missionary tour.", 58, ["ACT.24.27"]);
reusePaul("paul-caesarea", 5, ["ACT.24.1-24.27"]);
reusePaul("paul-appeal", 5, ["ACT.25.1-26.32"]);
reusePaul("paul-voyage", 5, ["ACT.27.1-27.44", "ACT.28.1-28.15"]);
reusePaul("paul-rome", 5, ["ACT.28.16-28.31"]);
paul("paul-crete", "Crete and directions to Titus", 6, ["TIT.1.1-1.5"], "Titus 1:5 says Paul left Titus in Crete to set things in order. Identifying this work with a post-Acts release is a reconstruction; the letter gives no calendar year. It is not equated with the storm-bound stop of Acts 27.", null);
paul("paul-macedonia-letter", "Macedonia and Timothy's charge at Ephesus", 6, ["1TI.1.1-1.4"], "Paul recalls going into Macedonia and asking Timothy to remain at Ephesus. Whether this belongs within Acts or later travel depends on the letters' chronology; no new dated mission is asserted.", null);
paul("paul-nicopolis-plan", "A planned winter at Nicopolis", 6, ["TIT.3.12-3.15"], "Paul intends to winter at Nicopolis and asks Titus to join him. The intention is explicit; fulfillment and a calendar year are not supplied here.", null);
paul("paul-spain-plan", "Paul's intention to visit Spain", 6, ["ROM.15.22-15.29"], "Romans records an intention to travel to Spain through Rome, following delivery of relief to Jerusalem. Acts does not narrate its fulfillment. This is not a completed fourth mission and is not automatically dated after Acts.", null);
paul("paul-final-recollections", "Troas, Miletus, and Paul's final imprisonment testimony", 6, ["2TI.1.16-1.18", "2TI.4.6-4.22"], "Second Timothy mentions Rome, a cloak left at Troas, Trophimus left sick at Miletum, and Paul's expectation of departure. These recollections do not establish a complete route or a death year. A post-Acts imprisonment is a traditional reconstruction, kept unplaced here.", null);

// Non-Paul episodes fill the earlier Acts chapters on their own narrative terms.
add("acts-matthias", "Matthias chosen before Pentecost", undefined, "Early church", ["ACT.1.15-1.26"], 30, "Acts places the choice after the ascension and before Pentecost. The AD 30 year follows the working resurrection anchor; AD 33 is an alternative.");
details("pentecost", undefined, "Early church", ["ACT.2.1-2.47"]);
add("acts-temple-witness", "The lame man healed and the apostles before the council", undefined, "Early church", ["ACT.3.1-4.37"], [30, 36], "A connected Jerusalem sequence after Pentecost, before the persecution involving Saul. This broad early-church window is provisional; the speech's recollections of Moses and the prophets are not dated to it.");
add("acts-ananais-council", "Ananias and Sapphira; renewed opposition to the apostles", undefined, "Early church", ["ACT.5.1-5.42"], [30, 36], "Acts records successive episodes in the Jerusalem church, not a single event lasting six years. No exact calendar year is supplied.");
add("acts-seven-stephen", "The seven chosen and Stephen's testimony", undefined, "Early church", ["ACT.6.1-7.60"], [30, 36], "Stephen's speech recounts earlier biblical history; this window concerns his ministry and death before Saul's conversion. It does not redate Abraham, Joseph, or Moses.");
add("acts-philip", "Persecution, Philip in Samaria, and the Ethiopian eunuch", undefined, "Early church", ["ACT.8.1-8.40"], [30, 36], "Following Stephen's death, Philip preaches in Samaria and meets the Ethiopian on the Gaza road, then continues through Azotus to Caesarea. The account gives route and sequence, not an exact year.");
add("acts-peter-coast", "Peter at Lydda and Joppa", undefined, "Early church", ["ACT.9.32-9.43"], [33, 44], "The healings of Aeneas and Tabitha precede the Cornelius episode in Luke's account. The broad window expresses uncertain placement; it is not the length of Peter's visit.");
add("acts-cornelius", "Cornelius at Caesarea; Peter's report in Jerusalem", undefined, "Early church", ["ACT.10.1-11.18"], [33, 44], "Acts 10 narrates the encounter; Acts 11 retells it in Peter's report. These are linked without treating the report as a second conversion of Cornelius. The date remains approximate.");
add("acts-peter-prison", "James killed and Peter delivered from prison", undefined, "Early church", ["ACT.12.1-12.19"], [41, 44], "Acts places these events under Herod Agrippa I before his death. The proposed window uses his rule over Judaea; it does not assert Peter spent years in prison.");
details("agrippa-death", undefined, "Early church", ["ACT.12.20-12.24"]);

export const NT_TIMELINE_RECORDS = records;
export const NT_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {};
for (const [id, narrative] of Object.entries(NT_NARRATIVE_DETAILS)) {
  for (const passage of narrative.passages) {
    // Letter excerpts support Paul's collection, not blanket chapter coverage.
    if (!["Matthew", "Mark", "Luke", "John", "Acts"].includes(passage.book)) continue;
    const chapters = NT_CHAPTER_TIMELINE_MAP[passage.book] ??= {};
    for (let chapter = passage.startChapter; chapter <= passage.endChapter; chapter++) {
      const mapping = chapters[chapter] ??= { ids: [], note: passage.book === "Acts"
        ? "Reviewed narrative context for this chapter. Speeches can recall earlier events; a hearing or sermon date does not date everything mentioned in it. Journey windows indicate uncertain calendar placement, not time spent at every stop."
        : "Reviewed Gospel episodes and teaching in this chapter. Parallel links compare accounts; grouped sections do not imply one occasion. Dates concern the narrative setting, not ancestors, parable characters, or prophetic fulfillment." };
      if (!mapping.ids.includes(id)) mapping.ids.push(id);
    }
  }
}

// Luke explicitly locates the opening announcement under Herod (Luke 1:5).
// This is political background, not an invented calendar date for the births.
NT_CHAPTER_TIMELINE_MAP.Luke[1].contextIds = ["herod"];
