import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";

export const EXPANDED_TIMELINE_SOURCES = {
  assyria: { title: "Livius: Sennacherib's prism (translated inscription)", url: "https://www.livius.org/sources/content/anet/287-the-sennacherib-prism/", use: "Assyrian royal chronology and the 701 BC campaign. The king's account is partial; it does not override the KJV account of Jerusalem's deliverance." },
  artaxerxes: { title: "Encyclopaedia Iranica: Artaxerxes I", url: "https://www.iranicaonline.org/articles/artaxerxes-i/", use: "Reign c. 465/464–424/423 BC. Ezra and Nehemiah placements use the conventional identification with Artaxerxes I and allow calendar boundaries." },
  claudius: { title: "Livius: Claudius", url: "https://www.livius.org/articles/person/claudius/", use: "Roman imperial reign, AD 41–54; background to Acts 11 and 18." },
  agrippa: { title: "Livius: Herod Agrippa I", url: "https://www.livius.org/articles/person/herod-agrippa-i/", use: "Reign AD 37–44 and death in AD 44, with Josephus, Antiquities 19.343–350. Distinct from Agrippa II in Acts 25–26." },
  gallio: { title: "Encyclopedia of the Bible: Gallio", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Gallio", use: "Delphi inscription and the proposed AD 51–52 or 52–53 proconsulship, anchoring Paul's Corinth episode." },
  festus: { title: "Encyclopedia of the Bible: Porcius Festus", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Porcius-Festus", use: "Discusses disputed accession proposals from AD 57 to 60. The displayed later-Paul sequence uses AD 60 provisionally; this is not a settled date." },
  nero: { title: "Livius: Nero", url: "https://www.livius.org/articles/person/nero/", use: "Imperial reign AD 54–68; political context for Paul's appeal and Roman custody, not evidence that he met Nero." },
};

const event = (id: string, label: string, start: number | undefined, end: number | undefined, kind: ContextTimelineRecord["kind"], references: string[], sources: string[], note: string): ContextTimelineRecord => ({
  id, label, start, end, kind, references, sources, note, track: "biblical", era: start !== undefined && start > 0 ? "history" : "exile", startStatus: "approximate", endStatus: "approximate",
});
const reign = (id: string, label: string, start: number, end: number, source: string, note: string): ContextTimelineRecord => ({
  ...event(id, label, start, end, "period", [], [source], note), track: "historical", era: "history",
});

export const EXPANDED_TIMELINE_RECORDS: ContextTimelineRecord[] = [
  reign("shalmaneser-reign", "Shalmaneser V · reign", -725, -721, "assyria", "Approximate 726–722 BC reign following the source's regnal convention; 727 BC is also used for accession. The KJV names Shalmaneser in the siege narrative."),
  reign("sargon-reign", "Sargon II · reign", -720, -704, "assyria", "Approximate 721–705 BC reign following the source's convention; 722 BC is also used for accession. Assyrian claims concerning Samaria must not replace the KJV account."),
  reign("sennacherib-reign", "Sennacherib · reign", -704, -680, "assyria", "Assyrian king, c. 705–681 BC. His 701 BC campaign belongs within this reign; the entire reign is not the duration of the siege."),
  reign("artaxerxes-reign", "Artaxerxes I · reign", -464, -423, "artaxerxes", "Displays c. 465–424 BC. Accession/death may be labeled 464/423 under other calendar conventions. This identification supplies the working calendar for Ezra 7 and Nehemiah 2."),
  reign("claudius-reign", "Claudius · reign", 41, 54, "claudius", "The emperor named in Acts 11:28 and 18:2. The famine and expulsion notices do not establish one date for all events in those chapters."),
  reign("agrippa-i-reign", "Herod Agrippa I · reign", 37, 44, "agrippa", "His territories expanded during this reign, including Judea in AD 41. The Herod of Acts 12 is conventionally identified as Agrippa I, not Agrippa II who later hears Paul."),
  reign("nero-reign", "Nero · reign", 54, 68, "nero", "Emperor during the working chronology of Paul's appeal and Roman custody. Acts ends without narrating Paul's appearance before Nero or his death."),
  event("sennacherib-death", "Sennacherib killed by his sons", -680, undefined, "event", ["2KI.19.37", "ISA.37.38"], ["assyria"], "Conventionally 681 BC, at the end of Sennacherib's reign. The biblical narrative reports this after the invasion but does not say it happened immediately after the 701 BC campaign."),
  event("daniel-babylon", "Daniel taken to Babylon", -604, undefined, "event", ["DAN.1.1", "DAN.1.3", "DAN.1.6", "JER.25.1"], ["ot", "nebuchadnezzar"], "Working placement c. 605 BC. Daniel gives Jehoiakim's third year; Jeremiah gives his fourth with Nebuchadnezzar's first. Different accession reckoning is a proposed reconciliation, not an altered KJV number. Daniel's training and later service extend beyond this arrival."),
  event("daniel-lions", "Daniel in the lions' den", undefined, undefined, "event", ["DAN.6.1", "DAN.6.16", "DAN.6.23", "DAN.6.28"], ["ot", "cyrus"], "The narrative places this under Darius after Babylon's fall. His identity and the precise date remain unresolved. Cyrus's reign is background only; no date is assigned to the rescue."),
  event("daniel-prayer", "Daniel prays in Darius's first year", -538, -537, "date-window", ["DAN.9.1", "DAN.9.2", "DAN.9.3", "DAN.9.21"], ["ot", "cyrus"], "Provisional c. 539–538 BC setting after Babylon's fall. Darius the Mede's identity remains unresolved. This dates the prayer and revelation's setting, not the fulfillment of the seventy weeks."),
  event("daniel-seventy-weeks", "Daniel's seventy-weeks prophecy", undefined, undefined, "period", ["DAN.9.24", "DAN.9.25", "DAN.9.26", "DAN.9.27"], ["ot"], "The prophecy is retained without assigning a fulfillment span or selecting a starting decree. Those interpretive choices are not established by dating Daniel's prayer."),
  event("daniel-cyrus-third", "Daniel's vision in Cyrus's third year", -535, undefined, "event", ["DAN.10.1", "DAN.10.4"], ["ot", "cyrus"], "Conventionally c. 536 BC when reckoned from Cyrus's rule over Babylon. This dates the reception of the vision, not every future event described in it."),
  event("ezra-journey", "Ezra travels to Jerusalem", -457, undefined, "event", ["EZR.7.7", "EZR.7.8", "EZR.7.9", "EZR.8.31", "EZR.8.32"], ["ot", "artaxerxes"], "First-to-fifth-month journey in Artaxerxes's seventh year, conventionally c. 458 BC with Artaxerxes I. Other identifications/calendars yield different placements. The chapter gives months; the chart resolves years only."),
  event("ezra-reform", "Ezra's assembly and marriage inquiry", -457, -456, "period", ["EZR.9.1", "EZR.10.9", "EZR.10.16", "EZR.10.17"], ["ot", "artaxerxes"], "Working c. 458–457 BC span following Ezra's arrival. The ninth-month assembly leads to an inquiry from the tenth month to the first month. The dates of every marriage or personal decision are not supplied."),
  event("nehemiah-request", "Nehemiah hears the news and petitions the king", -445, -444, "period", ["NEH.1.1", "NEH.1.3", "NEH.2.1", "NEH.2.5", "NEH.2.8"], ["ot", "artaxerxes"], "Working c. 446–445 BC sequence from Chisleu to Nisan. Both are called the twentieth year in the KJV; calendar/new-year reckoning is needed to align the sequence. This follows the shared c. 445 BC rebuilding model; 444 BC is another proposal."),
  event("nehemiah-governor", "Nehemiah's first governorship", -444, -432, "period", ["NEH.5.14", "NEH.5.15", "NEH.5.16", "NEH.13.6"], ["ot", "artaxerxes"], "Twelve years, from Artaxerxes's twentieth to thirty-second year. The shared c. 445 BC anchor yields c. 445–433 BC. Nehemiah 5 looks back over the governorship; this is not a twelve-year wall-building project."),
  event("law-read-return", "Ezra reads the law to the assembly", -444, undefined, "event", ["NEH.7.73", "NEH.8.1", "NEH.8.2", "NEH.8.14", "NEH.8.18"], ["ot", "artaxerxes"], "Placed in the seventh month following the wall's completion, c. 445 BC in this model. The law's content recalls earlier history; it does not date the Exodus to this assembly."),
  event("haggai-messages", "Haggai's later messages", -519, undefined, "event", ["HAG.2.1", "HAG.2.10", "HAG.2.20"], ["ot", "darius"], "Seventh- and ninth-month messages in Darius's second year, conventionally 520 BC. One year-level marker groups these messages. Predictions about future glory are not assigned fulfillment dates here."),
  event("ascension", "Ascension of Jesus", 30, undefined, "event", ["ACT.1.3", "ACT.1.9", "ACT.1.11"], ["nt"], "After the KJV forty days of appearances. Uses the shared AD 30 resurrection proposal; choosing AD 33 instead would move this event with it. No date is assigned to the promised return."),
  event("pentecost", "Pentecost and the Jerusalem church", 30, undefined, "event", ["ACT.2.1", "ACT.2.4", "ACT.2.41", "ACT.2.42"], ["nt"], "Pentecost following the resurrection and ascension, AD 30 in the shared working model, or AD 33 under that alternative. Peter's references to Joel and David recall/interpret Scripture, not their lifetimes as contemporary events."),
  event("claudian-famine", "Famine foretold; relief sent to Judea", 41, 54, "date-window", ["ACT.11.27", "ACT.11.28", "ACT.11.29", "ACT.11.30"], ["claudius", "nt"], "Acts places the famine under Claudius. This broad AD 41–54 window is an outer bound from his reign, not a claim of a thirteen-year famine; proposals often narrow it to the mid-40s. The prediction and relief are successive actions, not assigned the same exact day."),
  event("agrippa-death", "Death of Herod Agrippa I", 44, undefined, "event", ["ACT.12.20", "ACT.12.21", "ACT.12.23"], ["agrippa"], "Conventionally AD 44, using the Agrippa I identification and Josephus's account at Caesarea. James's death and Peter's release occur earlier in the chapter; this endpoint does not supply their exact dates."),
  event("paul-gallio", "Paul before Gallio at Corinth", 51, 53, "date-window", ["ACT.18.11", "ACT.18.12", "ACT.18.16", "ACT.18.18"], ["gallio"], "A possible AD 51–53 hearing window preserves the source's competing 51–52 and 52–53 terms. This is not a two-year trial. Paul's eighteen months in Corinth and subsequent travel are separate intervals."),
  event("paul-caesarea", "Paul held at Caesarea", 58, 60, "period", ["ACT.24.24", "ACT.24.26", "ACT.24.27"], ["festus"], "The KJV supplies two years before Felix is succeeded. Working backward from a provisional AD 60 arrival of Festus gives AD 58–60. Earlier Festus proposals shift this interval earlier; the two years remain unchanged."),
  event("paul-appeal", "Paul appeals to Caesar; hearing before Agrippa II", 60, undefined, "event", ["ACT.25.1", "ACT.25.10", "ACT.25.11", "ACT.25.13", "ACT.26.1", "ACT.26.32"], ["festus", "nero"], "Working AD 60 setting following Festus's arrival, whose year is disputed. The appeal and the later hearing are separate proceedings grouped at year resolution. Agrippa II is not the Agrippa I who died in Acts 12."),
  event("paul-voyage", "Paul's voyage and shipwreck", 60, 61, "period", ["ACT.27.1", "ACT.27.9", "ACT.27.27", "ACT.27.44", "ACT.28.1", "ACT.28.11"], ["festus", "nero"], "Working autumn AD 60 to spring AD 61 sequence after the appeal. Acts supplies seasonal clues and three months on the island; the years depend on Festus's disputed accession. The route runs from Caesarea to Sidon, under Cyprus to Myra, then past Cnidus under Crete to Salmone and Fair havens near Lasea. Phenice is an intended winter harbour, not a reached stop. Driven past Clauda, the ship is wrecked at Melita (Malta); after winter they sail via Syracuse, Rhegium, and Puteoli, then travel past Appii forum and The three taverns toward Rome."),
  event("paul-rome", "Paul teaches during custody in Rome", 61, 63, "period", ["ACT.28.16", "ACT.28.30", "ACT.28.31"], ["festus", "nero"], "Two whole years from a provisional spring AD 61 arrival yield c. AD 61–63. Earlier voyage reconstructions yield earlier dates. Acts ends with Paul's teaching; it does not state his release, trial outcome, or death here."),
];

export const EXPANDED_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {
  "2 Kings": {
    17: { ids: ["samaria"], contextIds: ["shalmaneser-reign", "sargon-reign"], note: "The capture of Samaria anchors the chapter. The following account explains earlier wrongdoing and later resettlement; those events do not all occur in 722 BC." },
    18: { ids: ["samaria", "sennacherib"], contextIds: ["sennacherib-reign"], note: "Samaria's fall and Sennacherib's later invasion are distinct episodes. The Hezekiah/Hoshea regnal synchronisms remain a calendar question, not a reason to change the KJV numbers." },
    19: { ids: ["sennacherib", "sennacherib-death"], contextIds: ["sennacherib-reign"], note: "Jerusalem's deliverance belongs to the invasion account. Sennacherib's assassination is a later closing notice, conventionally about twenty years afterward." },
  },
  Isaiah: {
    36: { ids: ["sennacherib"], contextIds: ["sennacherib-reign"], note: "The Assyrian challenge to Jerusalem is the historical narrative setting, conventionally 701 BC; compare 2 Kings 18." },
    37: { ids: ["sennacherib", "sennacherib-death"], contextIds: ["sennacherib-reign"], note: "The response and deliverance follow the invasion; the final assassination notice is later. This mapping dates narrated episodes, not every prophetic statement's fulfillment." },
  },
  Daniel: {
    1: { ids: ["daniel-babylon"], contextIds: ["nebuchadnezzar-reign", "cyrus-reign"], note: "Arrival in Babylon is the opening anchor. Training lasts three years, while verse 21 looks ahead to Cyrus; the whole chapter is not confined to the arrival year." },
    5: { ids: ["babylon-falls"], contextIds: ["cyrus-reign"], note: "Belshazzar's final feast and death lead into Babylon's change of rule. The recollection of Nebuchadnezzar is earlier history." },
    6: { ids: ["daniel-lions"], contextIds: ["babylon-falls", "cyrus-reign"], note: "The rescue remains undated. The plotted fall of Babylon and reign of Cyrus are surrounding context, not an asserted date or identification for Darius the Mede." },
    9: { ids: ["daniel-prayer", "daniel-seventy-weeks"], contextIds: ["babylon-falls", "cyrus-reign"], note: "Distinguishes the first-year setting of Daniel's prayer from the prophecy's fulfillment, which has no assigned calendar span here." },
    10: { ids: ["daniel-cyrus-third"], contextIds: ["cyrus-reign"], note: "Cyrus's third year dates Daniel receiving the vision. It does not date all the events subsequently revealed." },
  },
  Ezra: {
    7: { ids: ["ezra-journey"], contextIds: ["artaxerxes-reign"], note: "Artaxerxes's seventh year dates Ezra's journey. The opening ancestry lists earlier generations, not people all living in that year." },
    8: { ids: ["ezra-journey"], contextIds: ["artaxerxes-reign"], note: "The travel preparations, journey, and arrival extend the episode dated in Ezra 7; the named travelers are not assigned birth dates." },
    9: { ids: ["ezra-reform"], contextIds: ["ezra-journey", "artaxerxes-reign"], note: "The report and prayer follow Ezra's arrival. The inquiry's later month notices supply context; no separate day/year is asserted for the prayer." },
    10: { ids: ["ezra-reform"], contextIds: ["artaxerxes-reign"], note: "The ninth-month assembly and tenth-to-first-month inquiry are a sequence spanning months, not a single instant." },
  },
  Nehemiah: {
    1: { ids: ["nehemiah-request"], contextIds: ["artaxerxes-reign"], note: "Chisleu's report begins the sequence leading to Nehemiah's Nisan request in chapter 2. Jerusalem's earlier destruction is recalled in the report." },
    2: { ids: ["nehemiah-request"], contextIds: ["wall", "artaxerxes-reign"], note: "The Nisan petition, journey, and inspection precede completion of the wall. The displayed completion is later context, not the date of each action here." },
    3: { ids: ["wall"], contextIds: ["artaxerxes-reign"], note: "The builders' list belongs to the rebuilding episode. Completion in chapter 6 is a contextual endpoint, not an exact work date for every named builder." },
    4: { ids: ["wall"], contextIds: ["artaxerxes-reign"], note: "Opposition occurs during rebuilding before the completion anchor. The chapter does not give separate calendar dates for each threat." },
    5: { ids: ["wall", "nehemiah-governor"], contextIds: ["artaxerxes-reign"], note: "The economic dispute occurs in the rebuilding narrative, while verses 14–19 look back over twelve years as governor. Those are distinct timescales." },
    6: { ids: ["wall"], contextIds: ["artaxerxes-reign"], note: "The KJV dates completion to Elul 25 after 52 days. The BC placement follows the shared twentieth-year model." },
    8: { ids: ["law-read-return"], contextIds: ["wall", "artaxerxes-reign"], note: "The seventh-month reading and feast follow rebuilding. References to earlier Scripture do not make its events contemporary with the assembly." },
  },
  Haggai: {
    1: { ids: ["temple-work-resumed"], contextIds: ["darius-reign"], note: "Darius's second year and the sixth-month notices place the call and renewed work in the temple-rebuilding episode." },
    2: { ids: ["haggai-messages"], contextIds: ["temple-work-resumed", "darius-reign"], note: "The messages are dated within Darius's second year. Their future promises do not receive an assumed fulfillment date." },
  },
  Acts: {
    1: { ids: ["ascension"], contextIds: ["resurrection", "tiberius-reign"], note: "The forty days and ascension follow the resurrection. Jesus's promised return is not assigned a date." },
    2: { ids: ["pentecost"], contextIds: ["ascension", "tiberius-reign"], note: "Pentecost belongs to the post-resurrection sequence. Peter's references to Joel and David are distinguished from the present gathering." },
    11: { ids: ["claudian-famine"], contextIds: ["claudius-reign"], note: "The dated focus is the famine notice under Claudius. Peter's earlier recollection and the Antioch church's growth are not given this entire date window." },
    12: { ids: ["agrippa-death"], contextIds: ["agrippa-i-reign", "claudius-reign"], note: "The king's death is the chapter's historical anchor. James's martyrdom and Peter's release precede it; no exact dates are invented for those episodes." },
    18: { ids: ["paul-gallio"], contextIds: ["claudius-reign"], note: "Gallio anchors Paul's Corinth hearing. The expulsion from Rome precedes Aquila and Priscilla's arrival; the chapter's later travels and Apollos episode are not all confined to the hearing window." },
    24: { ids: ["paul-caesarea"], contextIds: ["nero-reign"], note: "The two-year delay supplies a duration. Absolute placement depends on the disputed year Festus succeeded Felix." },
    25: { ids: ["paul-appeal"], contextIds: ["paul-caesarea", "nero-reign"], note: "Festus's arrival, the appeal, and preparations for Agrippa II's hearing are successive events in the working AD 60 setting." },
    26: { ids: ["paul-appeal"], contextIds: ["nero-reign"], note: "Dates the hearing before Agrippa II. Paul's testimony recalls his earlier conversion and ministry; those events are not dated to this hearing." },
    27: { ids: ["paul-voyage"], contextIds: ["nero-reign"], note: "Seasonal clues and the following winter stay support the voyage sequence. The proposed calendar years depend on Festus's accession." },
    28: { ids: ["paul-voyage", "paul-rome"], contextIds: ["nero-reign"], note: "The island stay, arrival, and two whole years in Rome are successive intervals. The ending does not supply Paul's death date or a trial outcome." },
  },
};
