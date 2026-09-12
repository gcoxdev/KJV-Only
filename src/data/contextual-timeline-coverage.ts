import type { TimelineRecord } from "../lib/bible-timeline";
import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";
import { buildAnchoredContext, type AnchoredEpisode } from "./contextual-timeline-anchors";
import { BROAD_BOOK_TOPICS } from "./contextual-timeline-topics";

export const BROAD_TIMELINE_SOURCES = {
  isaiahContext: { title: "Encyclopedia of the Bible: Isaiah", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Isaiah", use: "Calendar comparison for Uzziah's death around 740/739 BC and Isaiah's named royal setting. The shared Hezekiah chronology is retained; the source's other chronological or textual proposals are not substituted for the KJV." },
  estherContext: { title: "Encyclopedia of the Bible: Book of Esther", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Book-Esther", use: "The proposed identification of Ahasuerus as Xerxes I, 486–465 BC, and the third-, seventh-, and twelfth-year sequence. Alternative king identifications would change the BC dates." },
};
const episodes: AnchoredEpisode[] = [];
function add(id: string, label: string, references: string[], note: string, at?: AnchoredEpisode["at"], until?: AnchoredEpisode["until"], kind?: TimelineRecord["kind"], sources?: string[]) {
  episodes.push({ id, label, references, note, at, until, kind: kind ?? (until !== undefined ? "period" : "event"), sources, era: "history" });
}
const PROPHETIC = "This is the setting of the message, not a date for its predicted fulfillment. Individual oracles need not follow chronological order.";
const POETRY = "The chapter topic describes the poem or teaching; imagery, remembered history, and future hopes are not assigned a common event date.";

add("context-neh", "Nehemiah · the restored community", ["NEH.7.1", "NEH.7.5", "NEH.11.1", "NEH.12.1", "NEH.12.27"], "Appointments, resident lists, priestly generations, and dedication follow rebuilding in the literary account. The old returnee register and earlier priests are retrospective. The dedication's exact year is not stated, and not all listed people are contemporaries.");
add("neh-covenant-assembly", "Confession and covenant after the law reading", ["NEH.8.2", "NEH.9.1", "NEH.9.38", "NEH.10.1", "NEH.10.29"], "The twenty-fourth-day fast follows the seventh-month reading and feast in the account. The shared c. 445 BC setting is a narrative alignment, not an independent date for every signatory or promise. The prayer recalls creation, Abraham, the Exodus, and later history without redating them.", ["law-read-return"]);
add("neh-later-return", "Nehemiah's later return and reforms", ["NEH.13.6", "NEH.13.7", "NEH.13.10", "NEH.13.15", "NEH.13.23"], "Nehemiah returns to the king in the thirty-second year and obtains leave after certain days. The interval until he returns to Jerusalem is unstated. Temple, sabbath, and marriage reforms are not all dated to the earlier wall-building year.");

const ESTHER = "The calendar assumes Ahasuerus is Xerxes I. A different identification shifts the BC dates while leaving the KJV's relative years intact.";
add("context-est", "Esther · Ahasuerus's court at Shushan", ["EST.1.1", "EST.1.3", "EST.2.16", "EST.3.7", "EST.9.1", "EST.10.3"], `${ESTHER} The closing tribute and Mordecai notice has no separate year or endpoint for his service.`, undefined, undefined, undefined, ["estherContext"]);
add("esther-third-year", "Ahasuerus's third-year feasts", ["EST.1.3", "EST.1.4", "EST.1.5", "EST.1.12"], `Conventional c. 483 BC setting. The 180-day display and seven-day feast are successive notices, not a year-long feast. ${ESTHER}`, -482, undefined, undefined, ["estherContext"]);
add("esther-seventh-year", "Esther becomes queen in the seventh year", ["EST.2.12", "EST.2.16", "EST.2.17", "EST.2.21"], `Conventional c. 479 BC setting for the tenth-month presentation. Earlier preparation takes twelve months; the later gate conspiracy is not separately dated. ${ESTHER}`, -478, undefined, undefined, ["estherContext"]);
add("esther-deliverance", "Haman's decree, Esther's appeal, and deliverance", ["EST.3.7", "EST.3.12", "EST.4.16", "EST.8.9", "EST.9.1", "EST.9.17", "EST.9.21"], `Working c. 474–473 BC sequence, from Nisan in the twelfth year through the Adar deliverance. Esther's intervening petitions, the counter-decree, and later Purim letters retain their order; future annual observances are not all within this span. ${ESTHER}`, -473, -472, "period", ["estherContext"]);
add("context-job", "Job · suffering and dialogue in Uz", ["JOB.1.1", "JOB.2.11", "JOB.2.13", "JOB.38.1", "JOB.42.7", "JOB.42.16"], "The KJV names Uz but no king, regnal year, or connection fixing Job beside a particular patriarch. The friends sit seven days and nights; Job later lives 140 years after restoration. That is not his total age and supplies no absolute birth or death date. The speeches' sequence is available without inventing a calendar; the friends' claims must be read alongside the LORD's correction in chapter 42.");
add("context-psa", "Psalms · prayers and songs across generations", ["PSA.18.1", "PSA.78.12", "PSA.90.1", "PSA.137.1", "PSA.150.6"], "The collection includes praise, lament, instruction, royal songs, and remembered history across different settings. No single composition year or reign dates every psalm. Babylon in Psalm 137 is not David's contemporary setting; a recollection does not alone date the poem's composition. " + POETRY);
add("context-pro", "Proverbs · wisdom collections", ["PRO.1.1", "PRO.1.7", "PRO.10.1", "PRO.22.17", "PRO.24.23"], "The opening names Solomon; other sections introduce words of the wise. Attribution and collection are not necessarily one occasion. Chapter order organizes instruction, not a year-by-year narrative, and no composition year is supplied for each saying. " + POETRY);
add("proverbs-hezekiah-copy", "Solomon's proverbs copied by Hezekiah's men", ["PRO.25.1", "2KI.18.2"], "Proverbs 25 introduces sayings of Solomon copied by Hezekiah's men. The shared Hezekiah reign bounds a proposed copying date, not the date Solomon first spoke them or the duration of copying. Shared-reign questions could extend this setting earlier.", ["royal-hezekiah"], ["royal-hezekiah", 0, "end"], "date-window");
add("proverbs-agur", "Agur's sayings", ["PRO.30.1", "PRO.30.5"], "Agur son of Jakeh is named, but no king or year dates this collection. He is not silently identified as Solomon. " + POETRY);
add("proverbs-lemuel", "Lemuel's instruction and the virtuous woman", ["PRO.31.1", "PRO.31.10"], "The opening names king Lemuel and his mother's teaching; the later poem describes the virtuous woman. No calendar year or identification of Lemuel with another king is imposed. " + POETRY);
add("context-ecc", "Ecclesiastes · the Preacher's reflections", ["ECC.1.1", "ECC.1.12", "ECC.2.4", "ECC.12.9", "ECC.12.13"], "The speaker is the Preacher, son of David, king in Jerusalem. The familiar Solomonic identification explains royal background but does not give a year for every reflection or the book's compilation. The times in chapter 3 are teaching, not an event schedule. " + POETRY);
add("context-sng", "Song of Solomon · love poetry", ["SNG.1.1", "SNG.3.7", "SNG.6.13", "SNG.8.6"], "The title associates the song with Solomon. Voices, searches, and marriage imagery do not supply an absolute date or establish that every scene is a single dated royal wedding. No birth years, literal identities for every speaker, or dated allegorical fulfillment are assigned. " + POETRY);
add("context-isa", "Isaiah · the Assyrian-era ministry setting", ["ISA.1.1", "ISA.6.1", "ISA.36.1", "ISA.38.1", "ISA.39.6"], "A representative c. 740–686 BC context runs from the proposed Uzziah death year to the shared Hezekiah endpoint. It is not a proven first-to-last ministry span or Isaiah's lifespan; the heading allows earlier service under Uzziah and later activity is not ruled out. The KJV's attribution to Isaiah is retained across the book. " + PROPHETIC, -739, ["royal-hezekiah", 0, "end"], "period", ["isaiahContext"]);
add("context-jer", "Jeremiah · ministry before Jerusalem's fall", ["JER.1.1", "JER.1.2", "JER.1.3", "JER.25.3"], "Jeremiah begins in Josiah's thirteenth year and continues through Jerusalem's fall. The shared accession gives a c. 627 BC working start with a one-year regnal allowance (628 BC under inclusive counting); the endpoint follows the existing c. 586 BC destruction. This is a ministry setting, not his lifespan or a claim that all later material precedes the fall. " + PROPHETIC, ["royal-josiah", 13], ["temple-destroyed"], "period");
add("jer-after-fall", "Jeremiah · the remnant after Jerusalem's fall", ["JER.40.1", "JER.41.1", "JER.42.7", "JER.43.7", "JER.44.1"], "The remnant's movements, the ten-day wait for an answer, flight to Egypt, and later messages follow Jerusalem's fall. No absolute endpoint is supplied. Earlier predictions are not the date of every later journey, and the Egyptian messages need not be simultaneous.");
add("jer-jehoiakim-fourth", "Jeremiah and Baruch in Jehoiakim's fourth year", ["JER.25.1", "JER.36.1", "JER.36.9", "JER.45.1", "JER.46.2"], "Jehoiakim's fourth year is synchronized with Nebuchadrezzar's first in Jeremiah 25:1. The working c. 605–604 BC window allows accession-year conventions. The scroll is prepared in the fourth year and read in the fifth; this window is not a date for every subsequent action or the fulfillment of the seventy years.", ["nebuchadnezzar-reign"], ["nebuchadnezzar-reign", 1], "date-window");
add("jer-yokes", "Jeremiah's yoke messages and the named royal years", ["JER.27.1", "JER.27.3", "JER.27.12", "JER.28.1", "JER.28.17"], "The KJV opens Jeremiah 27 with Jehoiakim but later addresses Zedekiah; chapter 28 names Zedekiah's fourth year. Both names remain intact. The relationship between these notices is unresolved here; Jehoiakim is not silently changed to Zedekiah to force one date for the whole collection.");
add("context-lam", "Lamentations · grief over Jerusalem's devastation", ["LAM.1.1", "LAM.2.7", "LAM.4.10", "LAM.5.1"], "The ruined city and sanctuary provide the setting. The shared Babylonian destruction is background, not proof that all five poems were composed in its exact year. The text does not name a writer in its opening; the traditional Jeremiah attribution supplies no independent composition date. " + POETRY);
add("context-ezk", "Ezekiel · prophetic ministry among the captives", ["EZK.1.1", "EZK.1.2", "EZK.1.3", "EZK.29.17"], "The fifth through twenty-seventh captivity-year notices supply a broad c. 593–571 BC ministry context from the existing 597 BC deportation anchor, allowing annual reckoning. This is not Ezekiel's lifespan. The opening thirtieth year is not assumed to be his age. Later chapters can contain earlier dates, and the 390/40-day signs are not silently turned into a new BC chronology. " + PROPHETIC, ["jerusalem-597", 4], ["jerusalem-597", 26], "period");
add("ezekiel-opening", "Ezekiel's opening vision and commission", ["EZK.1.2", "EZK.2.3", "EZK.3.16"], "The fifth captivity year gives c. 593–592 BC with annual reckoning. The vision and succeeding commission include a seven-day interval in chapter 3. The vision's creatures and throne are not dated future fulfillments.", ["jerusalem-597", 4], ["jerusalem-597", 5], "date-window");
add("ezekiel-sixth-year", "Ezekiel's sixth-year Jerusalem vision", ["EZK.8.1", "EZK.8.3", "EZK.11.24"], "The sixth-year vision begins among the elders in exile and carries Ezekiel to Jerusalem in visions of God. Chapters 8–11 continue this vision; no physical relocation or separate fulfillment date is asserted.", ["jerusalem-597", 5], ["jerusalem-597", 6], "date-window");
add("ezekiel-temple-vision", "Ezekiel's twenty-fifth-year temple vision", ["EZK.40.1", "EZK.40.2", "EZK.43.1", "EZK.47.1", "EZK.48.35"], "The twenty-fifth captivity year and fourteenth year after the city was smitten yield a c. 573–572 BC reception window allowing annual reckoning and the 587/586 destruction alternatives. Chapters 40–48 describe this vision. These dates do not assert that the temple was built then or choose a future fulfillment scheme.", ["jerusalem-597", 24], ["jerusalem-597", 25], "date-window");
add("context-dan", "Daniel · service and revelations in Babylon", ["DAN.1.1", "DAN.1.21", "DAN.3.1", "DAN.4.1"], "The narrative names successive Babylonian and Persian rulers. The furnace and Nebuchadnezzar's humbling have no stated regnal year; chapter order does not date every episode. The seven times in chapter 4 are retained without inventing an absolute start or death year.");
add("daniel-second-year", "Nebuchadnezzar's second-year dream", ["DAN.2.1", "DAN.2.19", "DAN.2.44"], "The second year gives a working c. 604–603 BC window relative to the existing reign. Accession-year reckoning and the relation to the three-year training require care. This dates the dream's reception, not all the kingdoms or the final kingdom it reveals.", ["nebuchadnezzar-reign", 1], ["nebuchadnezzar-reign", 2], "date-window");
add("daniel-belshazzar-first", "Daniel's vision in Belshazzar's first year", ["DAN.7.1", "DAN.7.17"], "The KJV dates the vision to Belshazzar's first year, before the final feast in chapter 5. His first-year calendar anchor is not selected here. The beasts and judgment do not receive calendar fulfillment dates.");
add("daniel-belshazzar-third", "Daniel's vision in Belshazzar's third year", ["DAN.8.1", "DAN.8.2", "DAN.8.20", "DAN.8.21"], "The third year follows the first-year vision and precedes Babylon's fall despite chapter order. Media and Persia and Grecia are named in the interpretation; their identification does not itself fix every predicted event's date or a physical trip to Shushan.");
add("context-hos", "Hosea · Israel and Judah in the divided kingdom", ["HOS.1.1", "HOS.1.2", "HOS.11.1"], "The heading names Uzziah, Jotham, Ahaz, and Hezekiah of Judah and Jeroboam son of Joash of Israel. These are a broad royal setting, not one reign or a precise date for every family sign and oracle. The Exodus and Jacob recollections are earlier history. " + PROPHETIC);
add("context-jol", "Joel · devastation and the call to return", ["JOL.1.1", "JOL.1.4", "JOL.1.14", "JOL.2.28", "JOL.3.1"], "The opening names Joel son of Pethuel but no king or year. The devastation, temple worship, and restoration language allow competing date proposals; no single pre-exilic or post-exilic calendar is imposed. " + PROPHETIC);
add("context-amo", "Amos · Israel under Jeroboam II", ["AMO.1.1", "AMO.7.10", "AMO.7.14"], "The heading places Amos under Uzziah and Jeroboam son of Joash, two years before an earthquake. The earthquake's absolute year is not supplied here. Amaziah in chapter 7 is the priest of Bethel, not the earlier king of Judah. " + PROPHETIC);
add("context-oba", "Obadiah · the message concerning Edom", ["OBA.1.1", "OBA.1.11", "OBA.1.12", "OBA.1.21"], "Edom's conduct toward Jacob and Jerusalem is central, but the book names no king or year. Identifying the described disaster with one particular sack of Jerusalem requires an additional argument; it is not automatically dated to 586 BC. " + PROPHETIC);
add("context-jon", "Jonah · the mission to Nineveh", ["JON.1.1", "JON.1.17", "JON.3.1", "JON.3.4", "JON.4.11", "2KI.14.25"], "Jonah son of Amittai is also named in Kings, where his territorial-restoration prophecy is recalled under Jeroboam II. That notice does not supply the year of the Nineveh mission. Three days and nights in the fish and the forty-day warning are explicit intervals, not absolute dates. The repentant king of Nineveh is unnamed.");
add("context-mic", "Micah · Samaria and Jerusalem under Judah's kings", ["MIC.1.1", "MIC.3.12", "JER.26.18"], "The heading names Jotham, Ahaz, and Hezekiah; Jeremiah later recalls Micah's warning in Hezekiah's days. No exact year for every oracle follows, and later Bethlehem and restoration promises are not events dated to Hezekiah's reign. " + PROPHETIC);
add("context-nam", "Nahum · the message concerning Nineveh", ["NAM.1.1", "NAM.3.8", "NAM.3.10"], "The message concerns Nineveh and recalls No-amon's captivity as an earlier warning. The opening names no king or regnal year. A precise reception date is not imposed by equating the remembered city's fall with Nineveh's predicted fall. " + PROPHETIC);
add("context-hab", "Habakkuk · questions concerning the Chaldean threat", ["HAB.1.1", "HAB.1.6", "HAB.2.3", "HAB.3.16"], "The raising up of the Chaldeans supplies political context, but no king or year dates the dialogue or prayer. It is not assigned the exact year of Jerusalem's fall or of a particular Babylonian accession. " + PROPHETIC);
add("context-zep", "Zephaniah · messages in Josiah's reign", ["ZEP.1.1", "ZEP.2.3", "ZEP.3.20"], "Josiah is explicitly named. His shared reign provides an outer possible-date window for the messages, not their duration, Zephaniah's lifespan, or a calendar fulfillment of the day of the LORD. The text does not settle whether every oracle preceded Josiah's reforms.", ["royal-josiah"], ["royal-josiah", 0, "end"], "date-window");
add("context-zec", "Zechariah · restoration and prophetic promises", ["ZEC.1.1", "ZEC.7.1", "ZEC.9.1", "ZEC.12.1", "EZR.5.1"], "Zechariah son of Berechiah ministers during the return-era temple work. Chapters 9–14 introduce further burdens without repeating a regnal year. They are not automatically dated to Darius's fourth year or to the future events they describe. He is not Jehoiada's son Zechariah killed under Joash. " + PROPHETIC);
add("zechariah-early", "Zechariah's second-year call and night visions", ["ZEC.1.1", "ZEC.1.7", "ZEC.6.9"], "The eighth-month call and eleventh-month visions fall in Darius's second year, c. 520–519 BC in the existing return chronology. These are successive revelations and symbolic instructions, not the duration of the predicted restoration. Joshua the high priest is not Joshua son of Nun.", ["haggai-messages"], ["haggai-messages", 1], "date-window");
add("zechariah-fasting", "Zechariah's fourth-year answer concerning fasting", ["ZEC.7.1", "ZEC.7.3", "ZEC.8.1", "ZEC.8.19"], "Darius's fourth year, ninth month, is conventionally c. 518 BC, two regnal years after the opening messages. Chapter 8 continues the response and promises. Earlier fasting and future joyful feasts are not all dated to this one occasion.", ["haggai-messages", 2]);
add("context-mal", "Malachi · priestly worship and covenant faithfulness", ["MAL.1.1", "MAL.1.7", "MAL.1.8", "MAL.2.1", "MAL.3.1", "MAL.4.5"], "Priests, offerings, and a governor are mentioned, without a named king or year. A post-return setting is a contextual inference, not an explicit date or proof that Malachi coincided with a particular Nehemiah visit. The promised messenger and Elijah are not dated fulfillments in that setting. " + PROPHETIC);

export function buildBroadContext(anchors: TimelineRecord[]): ContextTimelineRecord[] {
  return buildAnchoredContext(episodes, anchors);
}
export const BROAD_HISTORICAL_RECORDS: ContextTimelineRecord[] = [{
  id: "xerxes-reign", label: "Xerxes I · reign", era: "history", track: "historical", kind: "period", start: -485, end: -464,
  startStatus: "approximate", endStatus: "approximate", references: [], sources: ["estherContext"],
  note: "Conventional 486–465 BC Persian reign. This is the proposed historical identification of Esther's Ahasuerus, not his lifespan or proof that every similarly named biblical ruler is this king.",
}];

// This map supplies only missing chapters when merged into the main registry.
// Existing detailed mappings take precedence and cannot be diluted by defaults.
const backgrounds: Record<string, string[]> = {
  NEH: ["wall"], PRO: ["royal-solomon"], ECC: ["royal-solomon"], SNG: ["royal-solomon"],
  LAM: ["temple-destroyed"], HOS: ["amaziah-jeroboam", "royal-hezekiah"], AMO: ["amaziah-jeroboam", "uzziah-judah"],
  JON: ["amaziah-jeroboam"], MIC: ["royal-hezekiah"], ZEC: ["temple-work-resumed", "second-temple"],
};
export const BROAD_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = Object.fromEntries(BROAD_BOOK_TOPICS.map(book => [book.book,
  Object.fromEntries(book.topics.map((topic, index) => [index + 1, {
    ids: [`context-${book.code.toLowerCase()}`], contextIds: backgrounds[book.code] ?? [], references: [`${book.code}.${index + 1}.1`],
    note: `${book.book} ${index + 1}: ${topic}. Broad chapter context; the entry explains the setting and dating limits.`,
  } satisfies ChapterMapping])),
]));
function mapChapters(book: string, first: number, last: number, ids: string[], contextIds: string[] = [], detail = "") {
  for (let chapter = first; chapter <= last; chapter++) {
    const mapping = BROAD_CHAPTER_TIMELINE_MAP[book][chapter];
    mapping.ids = [...ids];
    mapping.contextIds = [...contextIds];
    if (detail) mapping.note += ` ${detail}`;
  }
}
mapChapters("Nehemiah", 9, 10, ["neh-covenant-assembly"], ["law-read-return"]);
mapChapters("Nehemiah", 13, 13, ["neh-later-return"], ["nehemiah-governor"]);
mapChapters("Esther", 1, 1, ["esther-third-year"]);
mapChapters("Esther", 2, 2, ["esther-seventh-year"]);
mapChapters("Esther", 3, 9, ["esther-deliverance"]);
mapChapters("Psalms", 18, 18, ["context-psa"], ["david-song"], "Compare the parallel song in 2 Samuel 22; no exact composition year is assigned.");
mapChapters("Psalms", 74, 74, ["context-psa"], [], "A devastated sanctuary is described; a specific destruction and composition year are not assumed.");
mapChapters("Psalms", 137, 137, ["context-psa"], ["temple-destroyed"], "Babylon and Jerusalem supply exile context, not a proven composition year.");
mapChapters("Proverbs", 25, 29, ["proverbs-hezekiah-copy"], ["royal-solomon"], "The chart concerns later copying, not the original delivery of Solomon's sayings.");
mapChapters("Proverbs", 30, 30, ["proverbs-agur"]);
mapChapters("Proverbs", 31, 31, ["proverbs-lemuel"]);
mapChapters("Isaiah", 38, 38, ["hezekiah-recovery"], ["royal-hezekiah"]);
mapChapters("Isaiah", 39, 39, ["hezekiah-envoys"], ["royal-hezekiah"], "The embassy and warning are not themselves the later captivity.");
mapChapters("Jeremiah", 24, 24, ["context-jer"], ["jerusalem-597"], "Jeconiah's deportation precedes this vision; the figs' interpretation is not all fulfilled then.");
mapChapters("Jeremiah", 25, 25, ["jer-jehoiakim-fourth"], [], "The stated seventy years are prophecy, not a span beginning at every event in this chapter.");
mapChapters("Jeremiah", 27, 28, ["jer-yokes"]);
mapChapters("Jeremiah", 29, 29, ["context-jer"], ["jerusalem-597"], "The letter addresses the deported community; its promises are distinct from the sending occasion.");
mapChapters("Jeremiah", 32, 34, ["context-jer"], ["jerusalem-final-siege"], "The siege supplies surrounding context; the promises of restoration are not contemporary fulfillment.");
mapChapters("Jeremiah", 36, 36, ["jer-jehoiakim-fourth"], [], "The scroll's preparation in year four precedes its reading and burning in year five.");
mapChapters("Jeremiah", 37, 38, ["context-jer"], ["jerusalem-final-siege"]);
mapChapters("Jeremiah", 39, 39, ["jerusalem-final-siege", "temple-destroyed"], [], "The siege, capture, and preservation of survivors are successive notices, not one day.");
mapChapters("Jeremiah", 40, 41, ["gedaliah"], ["temple-destroyed"], "Gedaliah's administration and assassination follow the fall; the seventh-month notice does not settle every year's alignment.");
mapChapters("Jeremiah", 42, 44, ["jer-after-fall"], ["temple-destroyed"]);
mapChapters("Jeremiah", 45, 45, ["jer-jehoiakim-fourth"], [], "This returns to an earlier fourth-year message; it does not follow the Egyptian chapters chronologically.");
mapChapters("Jeremiah", 46, 46, ["context-jer"], ["jer-jehoiakim-fourth"], "Carchemish is placed in Jehoiakim's fourth year in verse 2; the later Egypt message is a separate notice.");
mapChapters("Jeremiah", 52, 52, ["temple-destroyed", "jehoiachin-released"], ["jerusalem-final-siege"], "The closing release is decades after the destruction. Reign summaries, deportations, and release do not share one year.");
mapChapters("Ezekiel", 1, 3, ["ezekiel-opening"], ["jerusalem-597"]);
mapChapters("Ezekiel", 8, 11, ["ezekiel-sixth-year"], ["jerusalem-597"]);
mapChapters("Ezekiel", 29, 29, ["context-ezk"], [], "The tenth-year oracle and the twenty-seventh-year message are separate occasions; the twenty-seventh-year message is later than many messages appearing after it in the book.");
mapChapters("Ezekiel", 40, 48, ["ezekiel-temple-vision"], ["temple-destroyed"], "The chart dates reception of the vision, not the building or future fulfillment of the temple it describes.");
mapChapters("Daniel", 2, 2, ["daniel-second-year"]);
mapChapters("Daniel", 3, 4, ["context-dan"], ["nebuchadnezzar-reign"]);
mapChapters("Daniel", 7, 7, ["daniel-belshazzar-first"], [], "The first-year vision precedes the feast and fall narrated earlier in the book.");
mapChapters("Daniel", 8, 8, ["daniel-belshazzar-third"], [], "The third-year vision precedes Babylon's fall, without dated fulfillment imposed on its interpretation.");
mapChapters("Daniel", 11, 12, ["daniel-cyrus-third"], ["cyrus-reign"], "This continues the revelation introduced in chapter 10. The speaker recalls Darius's first year in 11:1; that recollection does not reset the reception date. Predicted events remain without assigned fulfillment dates.");
mapChapters("Zechariah", 1, 6, ["zechariah-early"], ["temple-work-resumed"]);
mapChapters("Zechariah", 7, 8, ["zechariah-fasting"], ["temple-work-resumed"]);
