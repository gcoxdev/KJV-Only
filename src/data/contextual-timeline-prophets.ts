import type { TimelineRecord } from "../lib/bible-timeline";
import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";
import { buildAnchoredContext, type AnchoredEpisode } from "./contextual-timeline-anchors";
import { BROAD_BOOK_TOPICS } from "./contextual-timeline-topics";

export const PROPHET_REFINEMENT_SOURCES = {
  ashdod: {
    title: "ORACC · Sargon II and the annexation of Ashdod",
    url: "https://oracc.museum.upenn.edu/saao/aebp/essentials/kings/sargonii/",
    use: "Assyrian evidence places Ashdod's annexation in 711 BC. Isaiah 20 names Sargon and the campaign; the three-year sign is retained without invented endpoints.",
  },
  zechariahCalendar: {
    title: "Zechariah 1:7 · calendar comparison",
    url: "https://www.biblegateway.com/verse/en/Zechariah%201%3A7",
    use: "Calendar annotations place Darius's second-year, eleventh-month vision in 519 BC. The KJV's year, month, and day remain primary; only an approximate year is plotted.",
  },
};

const episodes: AnchoredEpisode[] = [];
export const PROPHET_REFINEMENT_MAP: Record<string, Record<number, ChapterMapping>> = {};
type Details = Partial<Pick<AnchoredEpisode, "at" | "until" | "kind" | "sources">> & {
  existing?: string; extra?: string[];
};
type Row = [chapter: number, verses: string, note: string, details?: Details];
function review(book: string, background: string, rows: Row[]) {
  const topics = BROAD_BOOK_TOPICS.find(item => item.book === book)!;
  const target = PROPHET_REFINEMENT_MAP[book] ??= {};
  for (const [chapter, verses, note, details = {}] of rows) {
    if (target[chapter] || !topics.topics[chapter - 1]) throw new Error(`Invalid prophet refinement ${book} ${chapter}`);
    const id = `passage-${topics.code.toLowerCase()}-${chapter}`;
    const references = verses.split(" ").map(verse => `${topics.code}.${chapter}.${verse}`);
    const label = topics.topics[chapter - 1];
    if (!details.existing) episodes.push({
      id, label, references: [...references, ...(details.extra ?? [])], note,
      era: ["Zechariah", "Malachi"].includes(book) ? "exile" : "kingdom",
      at: details.at, until: details.until, kind: details.kind, sources: details.sources,
    });
    target[chapter] = {
      ids: details.existing?.split(" ") ?? [id],
      contextIds: background ? background.split(" ") : [],
      references: [...references, ...(details.extra ?? [])],
      note: `${book} ${chapter}: ${label}. ${note}`,
    };
  }
}

review("Isaiah", "context-isa", [
  [1, "1 7 16 26", "The heading names Uzziah, Jotham, Ahaz, and Hezekiah. The accusations and call to repentance have no separate year; a desolate-country description alone does not identify one particular invasion."],
  [2, "1 2 4 12", "The word concerns Judah and Jerusalem. The latter-days mountain and judgment on pride are prophetic content, not a dated account of nations already gathered in Isaiah's own day."],
  [3, "1 8 16 25", "Warnings move from failed leadership to the daughters of Zion and coming loss in war. No king or reception year identifies this address or dates the whole threatened sequence."],
  [4, "1 2 4 5", "The cleansing and shelter promised for Zion follow the judgment imagery. In that day connects the themes; it does not supply an absolute calendar date for the promised restoration."],
  [5, "1 7 8 26", "The vineyard is explicitly the house of Israel and Judah. The woes and approaching distant nation are warnings; vineyard planting and harvest imagery are not a literal dated agricultural history."],
  [6, "1 5 8 11 13", "The vision is in the year Uzziah died. The inherited Isaiah source proposes 740/739 BC, shown as a possible-date window, not a two-year vision. The commission and promised remnant do not establish Isaiah's birth or death years.", { at: ["context-isa"], until: ["context-isa", 1], kind: "date-window" }],
  [7, "1 3 8 14 16", "Ahaz faces Rezin and Pekah; Isaiah meets him with Shearjashub. The sixty-five-year Ephraim warning and the child's development are distinct signs, without chosen fulfillment endpoints here. This encounter is not automatically the later capture of Damascus.", { extra: ["2KI.16.5", "2KI.16.9"] }],
  [8, "1 3 4 6 18", "Mahershalalhashbaz is named and born before the warning about Damascus and Samaria. Before the child can call father or mother gives a relative limit, not an exact age or BC birth year."],
  [9, "1 2 6 7 12", "The great light and promised child's rule stand beside warnings against Israel. The chapter gives no reception year and does not date every promise and judgment to a single occasion."],
  [10, "5 12 20 28 33", "Assyria is both an instrument of chastisement and subject to judgment. The imagined advance toward Zion does not by itself identify each place as a separately dated conquest."],
  [11, "1 6 10 11 16", "The rod from Jesse, righteous rule, and gathering of the remnant are promises. Jesse's name is a lineage reference, not evidence that he is living at the time Isaiah delivers this message."],
  [12, "1 2 3 6", "The two in-that-day introductions frame thanksgiving for promised deliverance. This song is not given an independent performance year or automatically dated to Hezekiah's deliverance."],
  [13, "1 6 17 19", "The burden names Babylon and the Medes. It announces judgment rather than reporting a completed conquest; no reception year is supplied or inferred from the later fall of Babylon."],
  [14, "4 24 28 29 32", "The Babylon taunt, Assyrian purpose, and Philistine burden are separate sections. Only the last is expressly headed by the year Ahaz died; that year is not imposed on the whole chapter, and no resolved Ahaz death date is selected."],
  [15, "1 4 5 9", "Moab's cities and refugees appear in a prophetic lament. The nocturnal destruction imagery and successive places do not establish dated conquests or prove that the lament was written after every loss."],
  [16, "1 5 13 14", "An earlier word concerning Moab is followed by a new three-year limit, counted as a hireling's years. The relative interval is explicit; without a reception-year anchor its BC endpoints remain unknown."],
  [17, "1 3 6 12 14", "Damascus and Ephraim are linked in judgment and a remnant is promised. The evening-to-morning reversal is imagery in the burden, not an independently dated military report."],
  [18, "1 2 3 7", "The land beyond Ethiopia's rivers, messengers, and a future gift to Zion are described without a named ruler or year. No particular Ethiopian embassy is selected as a proven historical match."],
  [19, "1 4 18 23 25", "Egypt's turmoil is followed by promises involving Egypt, Assyria, and Israel. The cruel lord is unnamed; neither a particular conqueror nor an absolute fulfillment date is imposed."],
  [20, "1 2 3 4 6", "Tartan's Ashdod campaign is sent by Sargon. Assyrian evidence supports c. 711 BC for the capture. The three-year barefoot sign concerning Egypt and Ethiopia is retained, but its start and end are not inferred from this marker; the predicted captivity is not dated to Ashdod's fall.", { at: -710, sources: ["ashdod"] }],
  [21, "1 9 11 13 16 17", "The wilderness-of-the-sea, Dumah, and Arabia burdens are distinct. Kedar's one-year limit belongs to the Arabia message; it does not date the Babylon vision or provide a BC endpoint without a starting year."],
  [22, "1 8 15 20 25", "Jerusalem's preparations and misplaced confidence precede the Shebna and Eliakim message. Their royal-house roles do not establish a precise date for this oracle or turn the nail imagery into a dated death notice."],
  [23, "1 8 15 17 18", "Tyre's seventy years are stated in the burden. No starting conquest or ending restoration is selected, so the interval remains relative rather than an asserted seventy-year BC bar."],
  [24, "1 5 19 21 23", "Judgment upon the earth culminates in the LORD's reign in Zion. Many days in the prison imagery is not converted to a numbered interval or an absolute fulfillment date."],
  [25, "1 6 8 9 10", "Praise, the feast, death swallowed up, and Moab's abasement belong to the prophetic portrayal. The text supplies no calendar for this song's first use or all the things it celebrates."],
  [26, "1 3 9 19 20", "Judah's in-that-day song includes trust, judgment, and the dead living. The brief hiding instruction does not state a measurable historical duration or date the resurrection promise."],
  [27, "1 2 6 12 13", "The vineyard song and Israel's gathering develop the restoration vision. The great trumpet supplies no regnal year; no modern fulfillment calendar is chosen."],
  [28, "1 7 14 16 23", "Ephraim's pride, Judah's erring leaders, and Zion's foundation are addressed together. The farmer's changing work illustrates measured judgment; it does not date successive political eras."],
  [29, "1 2 9 13 17", "Ariel is identified with David's city. The siege imagery, blindness, and reversal have no explicit year; a little while is retained without conversion to a BC interval."],
  [30, "1 2 8 15 18 31", "Reliance on Egypt is rebuked and the warning is committed to a written witness. Future restoration and Assyria's defeat are promises, without assigning every part to the same diplomatic mission or year."],
  [31, "1 3 5 8 9", "Trust in Egypt's horses is contrasted with the LORD's defense of Jerusalem. Assyria's fall is announced; the address itself is not given the date of a later fulfillment."],
  [32, "1 9 10 15 18", "The righteous king, complacent women, approaching harvest failure, and later peace are distinct elements. The KJV's many days and years warning is preserved rather than silently replaced with a precise alternative interval."],
  [33, "1 7 10 17 20", "Distress, failed peace efforts, and the vision of Zion's king have no named reception year. A possible Assyrian crisis setting does not independently identify every embassy or date every promised outcome."],
  [34, "1 5 8 16 17", "The judgment names Idumea and uses enduring desolation imagery. The year of recompences is not given an absolute starting year or treated as a dated travel description."],
  [35, "1 4 5 8 10", "The healed people and returning ransomed are a restoration promise. The way of holiness is not a measured, dated migration route, and no fulfillment year is imposed."],
  [38, "1 5 8 9 21", "The fifteen additional years and the sign accompany Hezekiah's recovery. The thanksgiving looks back on the sickness; the existing provisional illness date is retained rather than moved after Sennacherib's later death.", { existing: "hezekiah-recovery" }],
  [39, "1 2 5 6 7", "The Babylonian visitors follow news of Hezekiah's illness and recovery. The warning concerning treasures and descendants is future captivity, not an accomplished deportation during the visit.", { existing: "hezekiah-envoys" }],
  [40, "1 3 6 9 28", "Comfort, the prepared way, and God's enduring power introduce the promises. The KJV's attribution to Isaiah is retained; no new author or exile-era composition date is inferred solely from the audience addressed."],
  [41, "1 2 8 21 25", "The challenge to the nations and idols invokes a raised conqueror without naming him here. No date for receiving this message is inferred from a proposed identification; Israel's ancestry is recalled, not contemporary biography."],
  [42, "1 6 9 18 24", "The servant's commission and Israel's blindness occur in distinct portions of the message. New things announced before they spring forth are predictions, not evidence of completed events on a selected date."],
  [43, "1 10 16 19 28", "The earlier way through the sea is recalled before the promise of a new thing. Neither the Exodus nor the promised deliverance is redated to the undated reception of this message."],
  [44, "1 9 24 26 28", "The idol-making satire precedes the naming of Cyrus and the rebuilding promise. Naming a future agent does not make the oracle a report written in his reign; its reception year is not stated."],
  [45, "1 4 13 22 23", "Cyrus is addressed as an appointed agent who has not known the LORD. The commission and worldwide invitation do not date Isaiah's message to Cyrus's conquest or Ezra's later return decree."],
  [46, "1 3 9 10 11", "Bel and Nebo are contrasted with the God who carries Israel. The bird from the east is unnamed in this chapter; a proposed identification does not establish the oracle's reception date."],
  [47, "1 5 8 9 13", "Babylon is addressed in a warning of humiliation. The loss in one day is prophetic wording, not a supplied BC date or proof that the narrator is reporting an already completed fall."],
  [48, "1 3 8 16 20", "Former announcements, present rebuke, and the call to depart Babylon have different temporal roles. The departure command alone does not establish a composition year or identify every hearer with Ezra's returning company."],
  [49, "1 5 6 14 22", "The servant's commission and Zion's answering complaint lead to promised restoration. The womb language does not name a birth year, and the gathering is not assigned the date of receiving the message."],
  [50, "1 4 6 10 11", "The obedient speaker's suffering and the call to trust in darkness have no supplied reception year. The first-person speech is not turned into a dated incident in Isaiah's personal biography."],
  [51, "1 2 9 10 17", "Abraham, Sarah, and the sea deliverance are recalled as grounds for comfort. These recollections and Zion's awakening are not events all taking place in the prophet's own generation."],
  [52, "1 7 11 13 15", "Zion's awakening, departure, and the exalted servant form successive sections. Verse 13 begins the servant passage continued in chapter 53; a chapter boundary does not mark a new reception date."],
  [53, "3 5 8 9 10 12", "The servant's suffering, death, and vindication have no stated reception year here. The ministry setting is not a date for its predicted fulfillment. Acts explicitly connects the cited passage with Jesus; that later explanation does not date the original oracle.", { extra: ["ACT.8.32", "ACT.8.33", "ACT.8.35"] }],
  [54, "1 5 7 9 10", "Restoration is pictured as renewed marriage and an enlarged household. The small moment and everlasting kindness are contrasting descriptions, not known endpoints for a literal marriage or exile."],
  [55, "1 3 6 10 12", "The invitation, Davidic covenant, and fruitful word express promised grace and return. No reception date or separate dated departure is supplied by the song-like closing imagery."],
  [56, "1 3 6 7 10", "Justice and sabbath keeping accompany promises for strangers and eunuchs; negligent watchmen are then rebuked. The promised house of prayer does not supply a construction or dedication date."],
  [57, "1 3 13 15 18", "The righteous person's removal, accusations of idolatry, and comfort for the contrite are presented without named individuals or years. No particular martyr's death is inferred from the opening."],
  [58, "1 3 6 7 13", "The rebuke distinguishes outward fasting from justice, care for the needy, and sabbath delight. This is instruction, not a dated report of one national fast or of every promised result already occurring."],
  [59, "1 9 16 20 21", "Confession of failed justice leads to the LORD's intervention and the promised Redeemer. The covenant's from-henceforth wording supplies no absolute date for the reception or fulfillment."],
  [60, "1 3 8 15 22", "Zion's light and the nations' gifts portray promised restoration. The closing in-his-time assurance leaves the fulfillment date unstated rather than fixing it to a later ruler's reign."],
  [61, "1 2 4 8 10", "The anointed proclamation leads into rebuilding and covenant promises. Luke records Jesus reading the opening and applying it; that later scene is distinct from the undated original message, and does not date every promise in this chapter.", { extra: ["LUK.4.17", "LUK.4.18", "LUK.4.21"] }],
  [62, "1 2 6 10 12", "Zion's new name, the watchmen, and the highway summons express promised restoration and continuing prayer. No literal renaming ceremony or departure date is supplied."],
  [63, "1 4 7 11 16", "The Edom judgment scene gives way to remembered mercies and communal prayer. The days of Moses are recalled past history, not a date for the judgment scene or the prayer's composition."],
  [64, "1 4 8 10 11", "The plea speaks of desolate cities and a burned holy house. This is retained as the prayer's wording, without using it alone to override Isaiah's KJV attribution or assert an independently proven post-destruction writing date."],
  [65, "1 8 17 20 25", "Rebuke, a preserved remnant, and new-heavens-and-earth promises are distinct parts. The hundred-year wording remains in its prophetic setting; it is not a recorded lifespan assigned to a known person."],
  [66, "1 3 7 18 22 24", "True worship, Zion's birth imagery, judgment, and the nations' gathering close the book. The one-day nation question and continuing worship are not supplied calendar dates for fulfillment."],
]);

export function buildProphetRefinements(anchors: TimelineRecord[]): ContextTimelineRecord[] {
  return buildAnchoredContext(episodes, anchors);
}

review("Hosea", "context-hos", [
  [1, "1 3 4 6 9 10", "The named Judean kings and Jeroboam son of Joash locate Hosea's ministry broadly. Gomer and the children are named as family signs, but no birth years or interval between the children is supplied."],
  [2, "2 6 14 19 23", "The marriage imagery moves from accusation and deprivation to renewed betrothal. In that day marks promised restoration, not a dated wedding or the completion of every promise in Hosea's household."],
  [3, "1 2 3 4 5", "The woman is not named again in this chapter. The purchase and many days of restraint form a further sign; many days without king or sacrifice and the afterward return have no numbered BC endpoints."],
  [4, "1 6 10 15 19", "The controversy concerns Israel's conduct and priestly failure, with a warning to Judah. No regnal year dates the charges or identifies a single gathering at which every part was delivered."],
  [5, "1 5 8 13 15", "Priests and rulers are warned, and Ephraim's appeal to Assyria fails to heal the wound. The KJV's king Jareb is retained without forcing an identification or a dated diplomatic mission."],
  [6, "1 2 4 6 11", "After two days and in the third day belong to the call to return and be revived. No absolute resurrection date is imposed on that wording; the rebuke of fleeting goodness follows in the same chapter."],
  [7, "1 4 8 11 16", "The oven, unturned cake, and silly dove describe corruption and unstable dependence on Egypt and Assyria. These comparisons do not independently date a named king's overthrow or embassy."],
  [8, "1 4 6 9 13", "The covenant charge includes unauthorized kings, the calf, and foreign alliances. The return-to-Egypt warning is prophetic content; no specific deportation year is assigned from it alone."],
  [9, "1 3 9 10 15", "Harvest loss and exile warnings recall Gibeah, Baalpeor, and Gilgal. These earlier examples are not placed in Hosea's own generation, and the chapter supplies no exact reception year."],
  [10, "1 5 8 9 12 14", "The vine and calf warnings lead to the call to seek the LORD. Shalman's destruction of Betharbel is recalled, but its ruler and absolute date are not assumed from the abbreviated name."],
  [11, "1 3 5 8 11", "Israel's childhood and deliverance from Egypt are recalled before judgment and return are announced. Matthew later applies the out-of-Egypt saying to Jesus; the recalled Exodus is not dated to that later scene.", { extra: ["MAT.2.14", "MAT.2.15"] }],
  [12, "1 3 4 9 12 13", "Jacob's birth, encounter, and service for a wife are recalled, as is Israel's deliverance by a prophet. These ancestral episodes illustrate the present controversy; they are not contemporary events beside Hosea."],
  [13, "1 4 10 11 14 16", "Egyptian deliverance and the giving and removal of a king are recalled amid warnings. The ransom promise and coming judgment do not establish one calendar year for all parts of the address."],
  [14, "1 2 3 4 9", "Israel is called to return with words rather than trust Assyria or idols. Healing and renewed fruitfulness are promises; the closing wisdom appeal supplies no dated national restoration."],
]);
review("Joel", "context-jol", [
  [1, "1 4 9 13 14 19", "Locust devastation, failed offerings, drought, and fire prompt lament and fasting. The heading names no king or year; the sequence of insect terms is not converted into four dated invading empires."],
  [2, "1 12 20 25 28 31", "The alarm and repentance appeal lead to restoration and the afterward outpouring. Peter cites the Spirit promise at Pentecost, but that later citation does not supply Joel's reception date or date every judgment in the chapter.", { extra: ["ACT.2.16", "ACT.2.17", "ACT.2.20"] }],
  [3, "1 2 9 14 18 20", "Judah's restored captivity and the nations' judgment are announced. The named valley and day of decision do not give an absolute fulfillment date; the return and final dwelling are promises, not a dated travel report."],
]);
review("Amos", "context-amo", [
  [1, "1 3 6 9 11 13", "Uzziah and Jeroboam son of Joash are named, and the words are two years before the earthquake. Without an independently selected earthquake year, the interval remains relative; the neighbouring nations' judgments are predictions."],
  [2, "1 4 6 9 10 12", "Moab, Judah, and Israel are separately accused. The Amorites' removal and forty wilderness years are recalled earlier history; they do not date Amos's message or extend his lifetime into the Exodus."],
  [3, "1 2 7 9 12 14", "Israel's chosen status grounds greater accountability. The witnesses summoned against Samaria and the shepherd's rescued fragments are rhetorical pictures, not a dated international hearing or battle report."],
  [4, "1 4 6 9 10 12", "Past shortages, pestilence, and overthrow are recalled as ignored warnings. The repeated failure to return culminates in a summons to meet God, without dates for each earlier calamity."],
  [5, "1 4 10 18 21 24 27", "The lament and calls to seek the LORD contrast justice with rejected feasts. The day of the LORD and captivity beyond Damascus are warnings, not accomplished events dated to the address."],
  [6, "1 3 4 7 12 14", "Complacency in Zion and Samaria is rebuked. The threatened first place among captives does not identify a particular deportation year or date the entire message to Samaria's later fall."],
  [7, "1 3 4 6 7 10 14 17", "Locusts, fire, and the plumbline are successive visions. Amaziah is the priest of Bethel, not Judah's king of that name; the confrontation names Jeroboam but no exact year."],
  [8, "1 2 4 9 11 14", "The summer-fruit vision introduces the announced end and a famine of hearing the word. The sun-darkening image alone is not identified with a particular eclipse or used to fix the message's date."],
  [9, "1 7 8 11 14 15", "Judgment is followed by promises for David's fallen tabernacle and Israel's planting. James cites this restoration passage in Acts, but that later use does not date Amos's original vision or every promised outcome.", { extra: ["ACT.15.15", "ACT.15.16", "ACT.15.17"] }],
]);
review("Obadiah", "context-oba", [
  [1, "1 3 10 11 12 15 21", "Edom's violence is linked to strangers entering Jerusalem and casting lots. The text supplies no king or absolute year for that attack; 586 BC is not forced onto it. The day of the LORD and kingdom are announced beyond the recalled offense."],
]);
review("Jonah", "context-jon", [
  [1, "1 3 4 12 15 17", "The flight toward Tarshish precedes the storm and the fish. Three days and three nights are explicit; the Kings notice of Jonah son of Amittai supplies identity and royal context, not the year of this Nineveh mission.", { extra: ["2KI.14.25"] }],
  [2, "1 2 6 9 10", "Jonah prays from the fish and is delivered onto dry land. The prayer recalls his descent and rescue; it does not narrate a second drowning or give an additional numbered interval inside the fish."],
  [3, "1 3 4 5 6 10", "The second commission leads to a forty-day warning and Nineveh's repentance. The three days' journey describes the city, not the warning's duration. The king is unnamed, and the threatened overthrow does not occur in the account."],
  [4, "1 5 6 7 8 10 11", "The gourd, next-morning worm, and east wind teach Jonah about mercy. The overnight plant and the city's people are part of the lesson; no absolute year or identity for Nineveh's unnamed king is supplied."],
]);
review("Micah", "context-mic", [
  [1, "1 5 6 9 16", "Jotham, Ahaz, and Hezekiah define the named royal setting. Samaria and Jerusalem are addressed, but no individual year dates the warning or every town's announced loss."],
  [2, "1 2 6 10 12 13", "The rebuke of planned seizure and rejected prophecy leads to the remnant's gathering. The promise has no absolute fulfillment year; the oppressors' daily routine is not a chronological era."],
  [3, "1 5 8 9 12", "The leaders and prophets are rebuked and Zion's ploughing is foretold. Jeremiah later explicitly recalls this warning under Hezekiah; that is evidence for the setting, not a dated destruction in Micah's lifetime.", { extra: ["JER.26.18", "JER.26.19"] }],
  [4, "1 3 6 9 10 13", "The latter-days mountain promise is followed by travail and deliverance from Babylon. The Babylon reference is a prediction here; it does not independently date the message after Judah's deportation."],
  [5, "1 2 3 5 7", "The Bethlehem ruler and remnant's deliverance are promised amid distress. Matthew records the Bethlehem passage being cited concerning Christ's birthplace; that later inquiry is distinct from Micah's undated message.", { extra: ["MAT.2.4", "MAT.2.5", "MAT.2.6"] }],
  [6, "1 4 5 8 16", "Moses, Aaron, Miriam, Balak, and Balaam are recalled in the controversy before the demand for just conduct. Omri's statutes and Ahab's works are precedents, not proof that all these people live together."],
  [7, "1 5 7 14 15 18 20", "Lament over present corruption gives way to confidence and prayer. Egypt's deliverance and the promises to Jacob and Abraham are recalled, while mercy and gathering remain hopes without an assigned fulfillment year."],
]);
review("Nahum", "context-nam", [
  [1, "1 2 7 12 15", "The burden names Nineveh, while refuge and deliverance are promised to those trusting the LORD. No king or regnal year fixes the message; the announced city's end is not already narrated history."],
  [2, "1 3 6 8 13", "Nineveh's attack, breached defenses, flight, and plunder are vividly portrayed. The prophetic scene has no reception date; describing the coming action vividly does not turn it into an eyewitness report written after the fall."],
  [3, "1 8 9 10 11 19", "The KJV's populous No (commonly called No-amon) has already gone into captivity and is cited as a warning to Nineveh. No's past defeat and Nineveh's announced fate are distinct events; no absolute year for the oracle is forced from either one."],
]);
review("Habakkuk", "context-hab", [
  [1, "1 2 5 6 12 13", "The complaint about violence receives an answer concerning the Chaldeans, followed by a further question about their conduct. The unnamed ruler and lack of regnal year leave the exchange undated."],
  [2, "1 2 3 4 6 20", "The watchman's answer leads to woes against wrongdoing. The vision has an appointed time, but no absolute year is given; tarrying and waiting are not converted to a numbered BC interval."],
  [3, "1 2 3 8 16 17 19", "The prayer evokes divine deliverance and anticipates trouble, ending in trust despite failed crops. Its musical instructions do not supply a performance date, and the earlier deliverance imagery is not all contemporary action."],
]);
review("Zephaniah", "context-zep", [
  [1, "1 4 7 12 14", "Josiah's reign supplies an outer possible-date window, not a proven duration of the message. The named family line does not explicitly identify Hizkiah as King Hezekiah. The coming day is not dated to Josiah's reforms.", { at: ["royal-josiah"], until: ["royal-josiah", 0, "end"], kind: "date-window" }],
  [2, "1 3 4 8 12 13", "The call to seek the LORD precedes messages against neighbouring peoples and Nineveh. The book's Josiah heading supplies an outer possible-date window for reception, not the dates of all predicted conquests.", { at: ["royal-josiah"], until: ["royal-josiah", 0, "end"], kind: "date-window" }],
  [3, "1 5 8 9 12 20", "Jerusalem's corruption is contrasted with a purified people and promised gathering. Josiah's reign is only an outer possible-date window for the message; it neither dates the gathering nor proves delivery before his reforms.", { at: ["royal-josiah"], until: ["royal-josiah", 0, "end"], kind: "date-window" }],
]);

const nightVision: Details = { at: ["haggai-messages", 1], sources: ["zechariahCalendar"], extra: ["ZEC.1.7"] };
const nightNote = " The night-vision sequence is placed at c. 519 BC from the second-year, eleventh-month heading; this dates reception, not fulfillment of its symbols.";
episodes.push(
  { id: "zechariah-eighth-month", label: "Zechariah's eighth-month call to return", era: "exile", at: ["haggai-messages"], references: ["ZEC.1.1", "ZEC.1.3", "ZEC.1.6"], note: "Darius's second year, eighth month, precedes the night visions in month eleven. The c. 520 BC marker follows the existing Haggai calendar. The fathers and earlier prophets are recalled, not contemporaries at this call." },
  { id: "zechariah-opening-visions", label: "Zechariah's riders, horns, and carpenters", era: "exile", ...nightVision, references: ["ZEC.1.7", "ZEC.1.8", "ZEC.1.12", "ZEC.1.18", "ZEC.1.20"], note: "The twenty-fourth day of month eleven begins the night visions, after the earlier call in month eight. The seventy years mentioned in the angel's question are distinct from the duration of the vision." + nightNote },
  { id: "zechariah-chariots", label: "Zechariah's vision of the four chariots", era: "exile", ...nightVision, references: ["ZEC.1.7", "ZEC.6.1", "ZEC.6.5", "ZEC.6.8"], note: "The chariots conclude the continuing night-vision sequence. Their movement to the north is part of the vision, not a separately dated campaign." + nightNote },
  { id: "zechariah-crowns", label: "Joshua's crowns and the promised Branch", era: "exile", references: ["ZEC.6.9", "ZEC.6.10", "ZEC.6.11", "ZEC.6.12", "ZEC.6.14"], note: "A fresh word introduces the instruction to make crowns for Joshua son of Josedech, the high priest, with a memorial in the temple. No date is repeated, so this action is not automatically the same night as the chariot vision. The Branch promise is distinguished from the sign action." },
);
review("Zechariah", "context-zec", [
  [1, "1 3 7 8 12 18 20", "The eighth-month call and the eleventh-month night visions are separate occasions in Darius's second year, conventionally 520 and 519 BC. The seventy years recalled in the vision are not its duration.", { existing: "zechariah-eighth-month zechariah-opening-visions" }],
  [2, "1 4 5 10 12", "The measuring line and unwalled-city promise describe Jerusalem's future security, without dating completion of new walls." + nightNote, nightVision],
  [3, "1 3 4 8 9", "Joshua is the high priest, not Joshua son of Nun. His cleansing and the Branch promise are distinct elements; removing iniquity in one day does not give an absolute fulfillment date." + nightNote, nightVision],
  [4, "1 2 6 9 14", "Zerubbabel's earlier foundation and future completion are distinguished. The candlestick and olive trees belong to the vision; the foundation and completion are not both dated to its reception." + nightNote, nightVision],
  [5, "1 3 5 6 8 11", "The flying roll is followed by the ephah and its removal to Shinar. These are successive symbols, not a dated migration or the measured duration of a judgment." + nightNote, nightVision],
  [6, "1 5 8 9 11 12 14", "The chariots finish the night visions. A fresh word then introduces Joshua's crowns, without repeating a date; the sign action is not automatically placed on that same night.", { existing: "zechariah-chariots zechariah-crowns" }],
  [7, "1 3 5 9 12 14", "The fourth year, ninth month, fourth day dates the fasting inquiry, c. 518 BC in the existing calendar. The earlier seventy years of fasting and past refusal to hear are recollections, not a seventy-year conversation.", { existing: "zechariah-fasting" }],
  [8, "1 3 9 16 19 23", "The renewed words continue the response and restoration promises after the chapter 7 inquiry. Their c. 518 BC placement is narrative continuity, not a repeated independent date; the future feasts and nations' gathering are not completed then.", { at: ["haggai-messages", 2], extra: ["ZEC.7.1"] }],
  [9, "1 4 9 10 13 16", "The burden and coming king have no new date heading. Matthew and John connect the king's entry with Jesus; those later scenes do not date this oracle to Darius's fourth year or make all its predictions one day's events.", { extra: ["MAT.21.4", "MAT.21.5", "JHN.12.14", "JHN.12.15"] }],
  [10, "1 2 6 8 10 12", "The prayer for rain, rebuke of false shepherds, and gathering promises are undated. Assyria and Egypt in the restoration language do not independently date the reception or supply fulfillment endpoints."],
  [11, "4 7 8 12 13 14 17", "The shepherd signs include three shepherds cut off in one month, thirty pieces of silver, and broken staves. Unnamed shepherds are not assigned speculative identities or BC dates; the sign sequence has no new reception heading."],
  [12, "1 3 9 10 12 14", "A new burden introduces Jerusalem's deliverance and mourning. John quotes the pierced-one wording concerning Jesus; the later citation does not supply the date of the original burden or every event it announces.", { extra: ["JHN.19.34", "JHN.19.37"] }],
  [13, "1 2 4 7 8 9", "Cleansing and the smitten shepherd are followed by a remnant tested in fire. Jesus applies the shepherd saying to the disciples' scattering; the Gospel scene remains distinct from the original message and other promises.", { extra: ["MAT.26.31", "MRK.14.27"] }],
  [14, "1 4 7 9 16 20", "The day of the LORD, altered landscape, and nations' worship are prophetic content without an absolute fulfillment year. The day known to the LORD does not provide a calendar date to plot, nor is this chapter dated to Darius's fourth year."],
]);
review("Malachi", "context-mal", [
  [1, "1 2 6 7 8 11", "Priests, offerings, and a governor imply an operating temple and civil administration. A post-return setting is a contextual inference; the unnamed governor is not automatically Nehemiah and no royal year is supplied."],
  [2, "1 4 7 10 14 16", "Priestly covenant failure and marital unfaithfulness are rebuked. Similar concerns in Ezra and Nehemiah do not establish that this message was delivered during one particular reform visit."],
  [3, "1 3 6 8 10 16", "The coming messenger and purification precede the call to return and the remembrance of those fearing the LORD. The messenger saying is quoted in the Gospels, but that later application does not date Malachi's original reception.", { extra: ["MAT.11.10", "LUK.7.27"] }],
  [4, "1 2 4 5 6", "Moses' law is recalled and Elijah's coming is promised before the great and dreadful day. The Gospels connect John with Elijah's role; neither that connection nor the burning imagery provides the original message's date.", { extra: ["MAT.11.14", "LUK.1.16", "LUK.1.17"] }],
]);
