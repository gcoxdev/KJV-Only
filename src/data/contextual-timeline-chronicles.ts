import type { TimelineRecord } from "../lib/bible-timeline";
import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";
import { buildAnchoredContext, type AnchoredEpisode } from "./contextual-timeline-anchors";

// The shipped KJV supplies the additional episodes and relative intervals.
// Calendar positions reuse the reviewed chronology; lists are not dated lifespans.
const episodes: AnchoredEpisode[] = [];
function add(id: string, label: string, references: string[], note: string, at?: AnchoredEpisode["at"], until?: AnchoredEpisode["until"], kind?: TimelineRecord["kind"]) {
  episodes.push({ id, label, references, note, at, until, kind, era: "kingdom" });
}
add("chron-ancestors", "Adam, the patriarchs, and Edom's families", ["1CH.1.1", "1CH.1.27", "1CH.1.43"], "A retrospective genealogy across many generations, including Edom's kings before Israel had a king. It is not one contemporary gathering or an event at Adam's birth. No composition year or lifespan is inferred from list order; use Genealogy for individual ancestors.");
add("chron-judah", "Judah's families and settlements", ["1CH.2.3", "1CH.2.13", "1CH.2.50", "1CH.4.1", "1CH.4.9", "1CH.4.21"], "Family branches, settlements, and Jabez's prayer have no common dated occasion. The list is not confined to David's generation; Jabez is not assigned a guessed contemporary king.");
add("chron-royal-line", "David's sons and the later royal descendants", ["1CH.3.1", "1CH.3.4", "1CH.3.10", "1CH.3.17", "1CH.3.19", "1CH.3.24"], "Begins with David's sons at Hebron and Jerusalem, continues through the kings and Jeconiah's descendants, and extends beyond the exile. It is not a single reign or a date for every descendant. Pedaiah's relationship to Zerubbabel is retained as written; a genealogy is not a dated birth register.");
add("chron-simeon", "Simeon's families and the expedition to Seir", ["1CH.4.24", "1CH.4.38", "1CH.4.42", "1CH.4.43"], "The Simeonite list spans generations. The five hundred men's Seir expedition is related after the Gedor account, but no separate year is supplied; it is not automatically assigned the preceding expedition's date.");
add("simeon-gedor", "Simeonites seek pasture at Gedor", ["1CH.4.39", "1CH.4.41"], "Explicitly in Hezekiah's days. The shared sole-reign window is provisional context for a possible event date, not a campaign lasting his whole reign; a shared-reign alternative could widen this window.", ["royal-hezekiah"], ["royal-hezekiah", 0, "end"], "date-window");
add("chron-transjordan", "Transjordan's families, wars, and captivity", ["1CH.5.1", "1CH.5.10", "1CH.5.18", "1CH.5.22", "1CH.5.26"], "Reuben's birthright explanation, Saul-era warfare, later tribal lists, and Assyrian captivity span different generations. The captivity under Pul / Tilgath-pilneser is Assyrian, not Judah's later Babylonian exile. No single year dates the whole chapter.");
add("hagarites-saul", "Reubenites fight the Hagarites in Saul's days", ["1CH.5.10"], "The verse explicitly places this war in Saul's days. The reign provides an outer possible-date window, not the war's duration. The later combined-tribe campaign in verses 18–22 is not automatically the same battle.", ["royal-saul"], ["royal-saul", 0, "end"], "date-window");
add("chron-levi", "Levi's descendants, musicians, and cities", ["1CH.6.1", "1CH.6.15", "1CH.6.31", "1CH.6.32", "1CH.6.54"], "Priestly descent reaches Jehozadak's captivity; the musician account recalls service under David and Solomon, and the city lists recall tribal allotments. These sections do not share one date. A priestly succession is not evidence of each man's birth or death year.");
add("chron-northern-families", "Families of the northern tribes and Benjamin", ["1CH.7.1", "1CH.7.6", "1CH.7.14", "1CH.7.20", "1CH.7.30"], "Genealogies, population summaries, and family recollections concern multiple generations. The David-era count mentioned for Issachar does not date every tribe's list or Ephraim's family tragedy.");
add("chron-benjamin", "Benjamin's families and Saul's house", ["1CH.8.1", "1CH.8.29", "1CH.8.33", "1CH.8.40", "1CH.9.35", "1CH.9.39"], "Saul's ancestry and later descendants are part of a wider Benjaminite genealogy. The list is not a gathering of Saul's contemporaries; repeated names and generations do not independently supply calendar years.");
add("chron-residents", "Jerusalem's residents and inherited temple offices", ["1CH.9.1", "1CH.9.2", "1CH.9.3", "1CH.9.22", "1CH.9.35"], "The opening recalls captivity and residents in their possessions; the customary returned-community reading does not establish a precise arrival year for this list. Earlier appointments by David and Samuel and the closing Saul genealogy are retrospectives, not events all occurring after the return.");
add("david-supporters", "Supporters gather to David before and at accession", ["1CH.12.1", "1CH.12.8", "1CH.12.19", "1CH.12.23", "1CH.12.38"], "Ziklag and wilderness supporters precede the assembly at Hebron to turn Saul's kingdom to David. This collection revisits successive occasions; the whole list is not dated to a single accession or a single stay at Ziklag.");
add("david-house-battles", "David's house, children, and Philistine victories", ["1CH.14.1", "1CH.14.3", "1CH.14.8", "1CH.14.13", "2SA.5.11", "2SA.5.17", "2SA.5.22"], "The palace, children born in Jerusalem, and two Philistine encounters are successive notices. No common year is stated; their placement between the ark narratives does not date all of them to the three months at Obed-edom's house.");
add("david-ark-worship", "Thanksgiving and worship appointed before the ark", ["1CH.16.1", "1CH.16.7", "1CH.16.37", "1CH.16.39"], "The thanksgiving is delivered on the day described after the ark's arrival; ongoing service is appointed before the ark and at Gibeon. The psalm's recollections of the patriarchs are not contemporary events. The absolute year of the arrival remains unknown.");
add("david-temple-plans", "David prepares for Solomon's temple", ["1CH.22.2", "1CH.22.5", "1CH.22.9", "1CH.22.17", "1CH.28.9", "1CH.28.11", "1CH.29.3", "1CH.29.9"], "Materials, charges, plans, and gifts prepare a future building project under Solomon. These arrangements are not the temple's foundation or its construction duration, and no single calendar year is assigned to every preparation.");
add("david-levite-orders", "David orders the Levites' service", ["1CH.23.1", "1CH.23.3", "1CH.23.24", "1CH.23.27"], "The closing-reign setting accompanies Solomon being made king. The initial count from thirty and the service arrangements from twenty in David's last words are both retained; the change is not silently erased. These are service ages, not birth dates.");
add("david-priest-courses", "The priestly courses appointed by lot", ["1CH.24.1", "1CH.24.3", "1CH.24.19", "1CH.24.31"], "David, Zadok, and Ahimelech order priestly courses. The opening recollection of Aaron's sons is earlier history. Course numbers describe divisions of service, not years or chronological generations.");
add("david-musician-courses", "The musicians' twenty-four courses", ["1CH.25.1", "1CH.25.7", "1CH.25.8", "1CH.25.31"], "Asaph, Heman, and Jeduthun's service is organized by lot. Twenty-four courses do not represent twenty-four years; no calendar date is supplied for each appointment.");
add("david-porters", "Gatekeepers, treasuries, and officers", ["1CH.26.1", "1CH.26.20", "1CH.26.26", "1CH.26.29"], "Lists of gatekeepers, treasuries, and outside officers include dedicated spoils from earlier leaders. The fortieth-year notice specifically dates the search for Hebronite officers, not every item in the chapter.");
add("david-fortieth-officers", "Hebronite officers sought in David's fortieth year", ["1CH.26.31", "1CH.26.32", "2SA.5.4"], "Explicit fortieth regnal year. The annual window covers the last year of the shared forty-year reign; it is a possible date for the search and appointment, not a year-long operation.", ["royal-david-jerusalem", -1, "end"], ["royal-david-jerusalem", 0, "end"], "date-window");
add("david-administration", "David's monthly divisions and officials", ["1CH.27.1", "1CH.27.16", "1CH.27.23", "1CH.27.24", "1CH.27.25"], "Twelve monthly rotations are not twelve consecutive campaign years. The unfinished census is recalled without redating it to David's final year. Lists of tribal rulers, property officers, and counselors need not represent a single moment.");
add("rehoboam-consolidates", "Rehoboam fortifies Judah; priests and Levites come south", ["2CH.11.4", "2CH.11.5", "2CH.11.13", "2CH.11.17", "2CH.11.21"], "The chapter includes fortifications, migration, and family notices. The three years of walking in David and Solomon's way do not date all these notices to one year or make them the entire seventeen-year reign.");
add("abijah-judah-war", "Abijah of Judah and the battle with Jeroboam", ["2CH.13.1", "2CH.13.2", "2CH.13.3", "2CH.13.17", "1KI.15.1", "1KI.15.2"], "Judah's Abijah (Abijam in Kings) reigns three years and fights Jeroboam of Israel. He is not Jeroboam's son Abijah in 1 Kings 14. The battle's regnal year is unstated, and no independent absolute accession is imposed here.");
add("asa-rest-zerah", "Asa's reforms, rest, and victory over Zerah", ["2CH.14.1", "2CH.14.3", "2CH.14.6", "2CH.14.9", "2CH.14.12"], "Ten years of quiet precede the narrated threat from Zerah the Ethiopian. They are not a ten-year battle or Asa's whole forty-one-year reign. The KJV does not identify Zerah with a named Egyptian Pharaoh; no such identification supplies an event date here.");
add("asa-covenant", "Asa's covenant assembly in his fifteenth year", ["2CH.15.1", "2CH.15.8", "2CH.15.10", "2CH.15.12", "2CH.15.19"], "The assembly is in the third month of Asa's fifteenth year. The thirty-fifth-year peace notice is retained. The relative year is explicit, but this dataset has not resolved the royal synchronisms sufficiently to assign an absolute accession and calendar date.");
add("asa-ramah", "Asa, Baasha's Ramah blockade, and Hanani's rebuke", ["2CH.16.1", "2CH.16.2", "2CH.16.7", "1KI.15.33", "1KI.16.8"], "The KJV says Asa's thirty-sixth year. Kings places Baasha's successor Elah in Asa's twenty-sixth year, creating an unresolved synchronization question. Thirty-six is not silently changed to sixteen or asserted to mean years since the kingdom divided. The episode remains unplaced.");
add("asa-final-years", "Asa's illness and death", ["2CH.16.12", "2CH.16.13", "2CH.16.14"], "Illness begins in the thirty-ninth year and death is in the forty-first. These relative years are retained without deriving a birth year or forcing the unresolved Asa/Baasha synchronism into a calendar chain.");
add("jehoshaphat-teaching", "Jehoshaphat sends teachers through Judah", ["2CH.17.7", "2CH.17.9", "2CH.17.12"], "The teaching commission is explicitly in Jehoshaphat's third year. The chapter also summarizes defenses, wealth, and soldiers, not all necessarily from that year. No absolute accession has been selected for this additional regnal calculation.");
add("jehoshaphat-judges", "Jehoshaphat returns and appoints judges", ["2CH.19.1", "2CH.19.2", "2CH.19.5", "2CH.19.8"], "The return and rebuke follow the Ramoth-gilead campaign. The subsequent judicial appointments have no stated interval from it, so they are not all assigned the battle's year.");
add("jehoshaphat-deliverance", "Judah delivered from the eastern coalition", ["2CH.20.1", "2CH.20.12", "2CH.20.22", "2CH.20.25", "2CH.20.26"], "Moab, Ammon, and the people of mount Seir threaten Judah. The three days gathering spoil and fourth-day assembly are explicit; no year is stated. The later reign and fleet summary is not necessarily part of the same campaign.");
add("jehoram-judah-warning", "Jehoram of Judah and Elijah's written warning", ["2CH.21.1", "2CH.21.5", "2CH.21.12", "2CH.21.19", "2KI.8.16"], "This Jehoram is Jehoshaphat's son ruling Judah, distinct from Ahab's son ruling Israel. The eight-year reign and Elijah's writing are retained. The text does not date the writing's composition or settle its relation to Elijah being taken up; no different Elijah or invented delivery year is substituted.");
add("jehoiada-zechariah", "Jehoiada dies; his son Zechariah is killed", ["2CH.24.15", "2CH.24.17", "2CH.24.20", "2CH.24.21", "2CH.24.22"], "Jehoiada dies at 130; later Joash of Judah turns away and orders the death of Zechariah son of Jehoiada. This is not the later prophet Zechariah son of Berechiah. No death year is given for Jehoiada, so his age alone cannot supply a birth year.");
add("uzziah-judah", "Uzziah's rule, presumption, and leprosy", ["2CH.26.1", "2CH.26.3", "2CH.26.16", "2CH.26.21", "2KI.15.1", "2KI.15.5"], "Uzziah (Azariah in Kings) reigns fifty-two years, having become king at sixteen. Jotham governs the house and judges while his father is a leper. These overlapping roles are not stacked as consecutive reigns; the leprosy's onset year remains unstated.");
add("jotham-judah", "Jotham builds and receives Ammonite tribute", ["2CH.27.1", "2CH.27.3", "2CH.27.5", "2CH.27.8"], "The KJV gives a sixteen-year reign and Ammonite payments in three successive years. The tribute is not the duration of the reign. Jotham's earlier duties during Uzziah's leprosy leave a shared-reign question rather than a forced new absolute calendar.");
add("ahaz-captives", "Oded intervenes for captives taken from Judah", ["2CH.28.5", "2CH.28.9", "2CH.28.13", "2CH.28.15"], "During Ahaz's reign, Oded's warning leads Israel's leaders to clothe, feed, and return the captives to Jericho. The chapter supplies no exact year; the nearby Assyrian intervention does not automatically date this separate episode to 732 BC.");
add("hezekiah-temple-cleansed", "Hezekiah reopens and cleanses the temple", ["2CH.29.1", "2CH.29.3", "2CH.29.17", "2CH.29.20"], "First year, first month: cleansing starts on day one and finishes on day sixteen. The window uses the shared sole-reign proposal, c. 715 BC, allowing a regnal boundary. A different shared-reign reckoning could move the setting earlier; the window is not a year-long cleansing.", ["royal-hezekiah"], ["royal-hezekiah", 1], "date-window");
add("hezekiah-passover", "Hezekiah's second-month Passover", ["2CH.30.1", "2CH.30.2", "2CH.30.3", "2CH.30.15", "2CH.30.23"], "The Passover is held in the second month because priests and people were not ready, followed by an additional seven days of celebration. It follows the temple-cleansing narrative, but its regnal year is not explicitly repeated. It remains unplaced rather than turning that sequence into an exact BC date.");
add("hezekiah-provisions", "Hezekiah orders service and temple provisions", ["2CH.31.1", "2CH.31.2", "2CH.31.7", "2CH.31.11"], "Reforms follow the feast, and heaps of contributions accumulate from the third through seventh month. These are months, not years; no independent regnal year is given. The whole reign is background, not the duration of collecting provisions.");
add("manasseh-captivity", "Manasseh taken to Babylon and restored", ["2CH.33.11", "2CH.33.12", "2CH.33.13", "2CH.33.14", "2CH.33.15"], "Captains of the king of Assyria take Manasseh to Babylon; he humbles himself and returns to Jerusalem. This is not Judah's later deportation under Nebuchadnezzar. The Assyrian king and regnal year are unnamed, so no precise date or duration is invented.");
add("josiah-seeks", "Josiah begins to seek God in his eighth year", ["2CH.34.1", "2CH.34.3"], "Eighth regnal year, while still young; distinct from the twelfth-year purge and eighteenth-year repair and book discovery. The one-year window allows regnal reckoning against the shared accession, not a year-long single act.", ["royal-josiah", 7], ["royal-josiah", 8], "date-window");
add("josiah-purge", "Josiah begins purging idolatry in his twelfth year", ["2CH.34.3", "2CH.34.4", "2CH.34.6", "2CH.34.7"], "The twelfth year dates the beginning of the purge, not every later reform. It is six regnal years before the eighteenth-year temple repair. The window allows annual reckoning; it does not limit all reform to one year.", ["royal-josiah", 11], ["royal-josiah", 12], "date-window");
add("chron-seventy-years", "The desolation and Jeremiah's seventy years", ["2CH.36.20", "2CH.36.21", "JER.25.11", "JER.25.12", "JER.29.10"], "Chronicles relates desolation and the land's sabbaths to Jeremiah's seventy years. The KJV's seventy is retained. The c. 586 BC destruction and c. 538 BC decree are not seventy years apart; no bar between those two anchors is mislabeled seventy years. The precise endpoints and relation to Babylonian service remain a chronology question.");
add("jehoiakim-bound", "Jehoiakim bound by Nebuchadnezzar", ["2CH.36.5", "2CH.36.6", "2CH.36.7"], "Nebuchadnezzar binds Jehoiakim in fetters to carry him to Babylon and carries temple vessels there. The wording does not itself narrate a completed journey by the king. No regnal year for this binding is given; it is not conflated with Jehoiachin's later captivity.");

export function buildChroniclesContext(chronology: TimelineRecord[]): ContextTimelineRecord[] {
  return buildAnchoredContext(episodes, chronology);
}

// Clear parallels share one timeline entry. Citation enrichment works from either
// book, and is immutable so chapter selection cannot leak into later selections.
export const CHRONICLES_PARALLELS: Record<string, { references: string[]; note?: string }> = {
  "saul-final": { references: ["1CH.10.4", "1CH.10.6", "1CH.10.13"] },
  "david-jerusalem": { references: ["1CH.11.1", "1CH.11.4", "1CH.11.5"] },
  "david-warriors": { references: ["1CH.11.10", "1CH.20.4", "1CH.20.5"], note: "Chronicles explicitly names Lahmi as Goliath's brother. These battle and warrior collections are not one dated campaign." },
  "david-ark": { references: ["1CH.13.10", "1CH.13.14", "1CH.15.13", "1CH.15.25"], note: "Chronicles 13 narrates the first attempt; chapter 15 the successful transfer after the three-month stay. The shared entry groups those successive occasions without making them simultaneous." },
  "david-covenant": { references: ["1CH.17.1", "1CH.17.11", "1CH.17.14"] },
  "david-campaigns": { references: ["1CH.18.1", "1CH.18.6", "1CH.19.6", "1CH.19.19"] },
  "solomon-birth-rabbah": { references: ["1CH.20.1", "1CH.20.2"], note: "Chronicles supplies a parallel for Rabbah's capture, not for Solomon's birth in the grouped Samuel account." },
  "david-census": { references: ["1CH.21.1", "1CH.21.5", "1CH.21.12", "1CH.21.25", "2SA.24.13", "2SA.24.24"], note: "The KJV gives three years in Chronicles' offered famine and seven in Samuel; both readings are retained without inventing a reconciliation. The counts also differ. Samuel's fifty shekels of silver for the threshingfloor and oxen and Chronicles' six hundred shekels of gold for the place are not silently treated as identical prices." },
  "solomon-accession": { references: ["1CH.23.1", "1CH.29.22", "1CH.29.27", "1CH.29.28"], note: "Chronicles says Solomon was made king the second time. The assembly and anointing are distinguished from the first occasion, but no extra intervening years or long coregency are inferred." },
  "solomon-wisdom": { references: ["2CH.1.3", "2CH.1.7", "2CH.1.10"] },
  "solomon-preparations": { references: ["2CH.2.1", "2CH.2.3", "2CH.2.11"] },
  temple: { references: ["2CH.3.1", "2CH.3.2"], note: "Chronicles specifies the second day of the second month in the fourth year and connects the site with Ornan's threshingfloor; it does not date the earlier census to the foundation." },
  "temple-complete": { references: ["2CH.5.1"] },
  "solomon-furnishings": { references: ["2CH.4.1", "2CH.4.11", "2CH.4.19"] },
  "temple-dedication": { references: ["2CH.5.3", "2CH.6.12", "2CH.7.1", "2CH.7.9", "2CH.7.10", "2CH.7.11"], note: "Chronicles gives seven days of altar dedication and seven of the feast, with departure on the twenty-third day of month seven. The following two-house completion summary does not itself specify the dedication's regnal year." },
  "solomon-two-houses": { references: ["2CH.8.1"] },
  "solomon-trade": { references: ["2CH.8.17", "2CH.9.1", "2CH.9.21"] },
  "solomon-death": { references: ["2CH.9.30", "2CH.9.31"] },
  "kingdom-divides": { references: ["2CH.10.1", "2CH.10.16"] },
  "shishak-judah": { references: ["2CH.12.2", "2CH.12.9"] },
  "ahab-death": { references: ["2CH.18.28", "2CH.18.33", "2CH.18.34"] },
  "jehoshaphat-summary": { references: ["2CH.20.31", "2CH.20.35", "2CH.20.37"] },
  "judah-jehoram-ahaziah": { references: ["2CH.21.5", "2CH.22.2"], note: "Chronicles gives Ahaziah forty-two at accession, while 2 Kings 8:26 gives twenty-two. Both KJV readings remain visible; no birth year or corrected age is inferred to resolve that tension." },
  "jehu-coup": { references: ["2CH.22.7", "2CH.22.9"], note: "Chronicles and Kings describe Ahaziah's final movements differently; this shared transition does not claim to settle their detailed sequence." },
  athaliah: { references: ["2CH.22.10", "2CH.22.12"] },
  "joash-judah-crowned": { references: ["2CH.23.1", "2CH.23.11", "2CH.23.15", "2CH.24.1"] },
  "joash-repairs": { references: ["2CH.24.6", "2CH.24.12"], note: "Kings supplies the twenty-third-year intervention; Chronicles describes the collection and work without giving a separate completion year. The window is not the duration of all repairs." },
  "joash-judah-end": { references: ["2CH.24.23", "2CH.24.25"] },
  "amaziah-jeroboam": { references: ["2CH.25.1", "2CH.25.17", "2CH.25.25"], note: "Chronicles' opponent Joash is the northern king, not Amaziah's father Joash of Judah. The chapter does not narrate all the Jeroboam II material in the grouped Kings entry." },
  "ahaz-reign": { references: ["2CH.28.1", "2CH.28.16", "2CH.28.20"] },
  sennacherib: { references: ["2CH.32.1", "2CH.32.20", "2CH.32.21"] },
  "hezekiah-recovery": { references: ["2CH.32.24"] },
  "hezekiah-envoys": { references: ["2CH.32.31"] },
  "manasseh-amon": { references: ["2CH.33.1", "2CH.33.20", "2CH.33.21", "2CH.33.24"] },
  "josiah-law": { references: ["2CH.34.8", "2CH.34.14", "2CH.34.29", "2CH.35.1", "2CH.35.19"] },
  "josiah-death": { references: ["2CH.35.20", "2CH.35.24"] },
  "jehoahaz-jehoiakim": { references: ["2CH.36.1", "2CH.36.2", "2CH.36.4"] },
  "jerusalem-597": { references: ["2CH.36.9", "2CH.36.10", "2KI.24.8"], note: "Chronicles gives Jehoiachin eight at accession and three months and ten days; Kings gives eighteen and three months. Both KJV age readings are retained without deriving a corrected birth date." },
  "zedekiah-appointed": { references: ["2CH.36.10", "2CH.36.11"] },
  "temple-destroyed": { references: ["2CH.36.17", "2CH.36.19"] },
  "return-decree": { references: ["2CH.36.22", "2CH.36.23"] },
};
export function withChroniclesParallels(record: ContextTimelineRecord): ContextTimelineRecord {
  const parallel = CHRONICLES_PARALLELS[record.id];
  return parallel ? { ...record, references: [...new Set([...record.references, ...parallel.references])], note: record.note + (parallel.note ? ` ${parallel.note}` : "") } : record;
}

type Chapter = [topic: string, ids: string, verses: string, contextIds?: string, note?: string];
export const CHRONICLES_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {};
function chapters(book: string, code: string, rows: Chapter[]) {
  CHRONICLES_CHAPTER_TIMELINE_MAP[book] = Object.fromEntries(rows.map(([topic, ids, verses, contextIds = "", note], index) => [index + 1, {
    ids: ids.split(" "), contextIds: contextIds ? contextIds.split(" ") : [],
    references: verses.split(" ").map(verse => `${code}.${index + 1}.${verse}`),
    note: `${topic}. ${note ?? "Parallel accounts share entries; chapter lists and summaries can span different occasions. Each entry retains its own date or uncertainty."}`,
  }]));
}
chapters("1 Chronicles", "1CH", [
  ["Ancestors from Adam, patriarchal branches, and Edom", "chron-ancestors", "1 27 43"],
  ["Judah's families, including David's ancestry", "chron-judah", "3 13 50"],
  ["David's sons, the royal succession, and later descendants", "chron-royal-line", "1 4 10 17 19 24"],
  ["Judah, Jabez, and Simeon's settlements and expeditions", "chron-judah chron-simeon simeon-gedor", "9 24 39 41 42", "", "Only the Gedor expedition is explicitly placed in Hezekiah's days. The genealogies and Seir expedition are not all dated to that window."],
  ["Transjordan's tribes from ancestry to Assyrian captivity", "chron-transjordan hagarites-saul", "1 10 18 26", "tiglath-north", "The Saul-era battle and later Assyrian deportation are centuries apart; the 732 BC northern campaign supplies background for the captivity, not a date for every family or battle."],
  ["Levi's descent, musicians, and Levitical cities", "chron-levi", "1 15 31 32 54"],
  ["Northern tribal families, Benjamin, and population lists", "chron-northern-families", "1 2 6 14 20 30"],
  ["Benjamin and the house of Saul", "chron-benjamin", "1 29 33 40"],
  ["Jerusalem's residents and offices; Saul's family recalled", "chron-residents chron-benjamin", "1 2 22 35", "", "The returned-community setting and recalled earlier appointments do not supply one date for the whole chapter."],
  ["Saul's defeat and death at Gilboa", "saul-final", "4 6 13"],
  ["David recognized by all Israel, Jerusalem, and mighty men", "david-jerusalem david-warriors", "1 4 10"],
  ["David's supporters at Ziklag, in the wilderness, and at Hebron", "david-supporters", "1 8 19 23 38", "david-ziklag david-jerusalem"],
  ["The first ark transfer attempt and Obed-edom's three months", "david-ark", "10 14", "royal-david-jerusalem", "This chapter covers the unsuccessful attempt; the shared ark entry also explains the later successful procession in chapter 15."],
  ["David's house and victories over the Philistines", "david-house-battles", "1 3 8 13", "royal-david-jerusalem"],
  ["The ark brought successfully to Jerusalem", "david-ark", "13 25 29", "royal-david-jerusalem"],
  ["Thanksgiving before the ark and continuing worship", "david-ark-worship", "1 7 37 39", "royal-david-jerusalem"],
  ["The covenant promise concerning David's house", "david-covenant", "1 11 14", "royal-david-jerusalem"],
  ["Campaign summaries and David's officials", "david-campaigns", "1 6 14", "royal-david-jerusalem"],
  ["Hanun's insult and the Ammonite and Syrian war", "david-campaigns", "2 6 19", "royal-david-jerusalem"],
  ["Rabbah taken and later Philistine battles", "solomon-birth-rabbah david-warriors", "1 2 4 5", "royal-david-jerusalem", "The shared Samuel entry includes Solomon's birth; Chronicles here supplies only the Rabbah parallel. Later giant battles are separate notices."],
  ["The census, judgment, and Ornan's threshingfloor", "david-census", "1 5 12 25", "royal-david-hebron royal-david-jerusalem"],
  ["David prepares materials and charges Solomon", "david-temple-plans", "2 5 9 17", "royal-david-jerusalem"],
  ["Solomon made king and the Levites' service ordered", "david-levite-orders solomon-accession", "1 3 24 27"],
  ["Priestly and Levitical courses", "david-priest-courses", "1 3 19 31", "royal-david-jerusalem"],
  ["Musicians appointed in twenty-four courses", "david-musician-courses", "1 7 8 31", "royal-david-jerusalem"],
  ["Gatekeepers, treasuries, and David's fortieth-year officers", "david-porters david-fortieth-officers", "1 20 29 31 32"],
  ["Monthly divisions, tribal officers, and royal administration", "david-administration", "1 16 23 24 25", "royal-david-jerusalem"],
  ["David's public charge and temple plans", "david-temple-plans", "1 9 11", "royal-david-jerusalem"],
  ["Gifts, prayer, Solomon's second anointing, and David's death", "david-temple-plans solomon-accession", "3 9 22 27 28"],
]);
chapters("2 Chronicles", "2CH", [
  ["Solomon asks for wisdom at Gibeon", "solomon-wisdom solomon-trade", "3 7 10 16"],
  ["Solomon and Huram prepare for the temple", "solomon-preparations", "1 3 11"],
  ["Temple foundation and building description", "temple", "1 2 3", "", "The second day of month two in the fourth year dates the beginning, not the completion of every structure described."],
  ["Temple vessels and furnishings", "solomon-furnishings", "1 11 19", "temple temple-complete"],
  ["Completed work, the ark, and the assembly", "temple-complete temple-dedication", "1 3 7 13"],
  ["Solomon's prayer of dedication", "temple-dedication", "12 19 40", "temple-complete"],
  ["Fire, dedication, feast, and the LORD's response", "temple-dedication", "1 9 10 11 12", "temple-complete", "The dedication and later divine response are successive occasions. The seventh-month departure notice does not settle the dedication's regnal year."],
  ["The twenty-year building summary, cities, and trade", "solomon-two-houses solomon-trade", "1 2 17", "royal-solomon"],
  ["Sheba's queen, Solomon's wealth, and his death", "solomon-trade solomon-death", "1 21 30 31"],
  ["Rehoboam at Shechem and the divided kingdom", "kingdom-divides", "1 16 19"],
  ["Judah fortified and priests and Levites migrate", "rehoboam-consolidates", "4 5 13 17 21", "royal-rehoboam"],
  ["Shishak invades in Rehoboam's fifth year", "shishak-judah", "2 9 13 16", "royal-rehoboam", "The invasion is dated to the fifth year; the closing seventeen-year reign and death notice are later summary context."],
  ["Abijah of Judah fights Jeroboam of Israel", "abijah-judah-war", "1 2 3 17"],
  ["Asa's reforms and victory over Zerah", "asa-rest-zerah", "1 3 9 12"],
  ["Azariah's exhortation and Asa's covenant assembly", "asa-covenant", "1 8 10 12 19"],
  ["Baasha at Ramah, Hanani's warning, and Asa's final years", "asa-ramah asa-final-years", "1 7 12 13"],
  ["Jehoshaphat's third-year teaching commission and defenses", "jehoshaphat-teaching", "7 9 12"],
  ["Micaiah's warning and Ahab's death at Ramoth-gilead", "ahab-death", "7 28 33 34", "royal-ahab"],
  ["Jehoshaphat rebuked after returning and appoints judges", "jehoshaphat-judges", "1 2 5 8", "ahab-death"],
  ["Judah's deliverance and Jehoshaphat's later fleet", "jehoshaphat-deliverance jehoshaphat-summary", "1 22 25 26 31 35"],
  ["Jehoram of Judah and Elijah's writing", "jehoram-judah-warning", "5 12 19 20"],
  ["Ahaziah of Judah, Jehu's coup, and Athaliah", "judah-jehoram-ahaziah jehu-coup athaliah", "2 7 9 10 12"],
  ["Jehoiada crowns Joash and Athaliah is removed", "joash-judah-crowned", "1 11 15"],
  ["Joash repairs the temple, turns away, and is assassinated", "joash-repairs jehoiada-zechariah joash-judah-end", "1 6 12 15 20 23 25", "joash-judah-crowned", "The opening accession, later repairs, Jehoiada's death, and final attack are separate stages; the repair window does not date the whole chapter."],
  ["Amaziah of Judah, Edom, and war with northern Joash", "amaziah-jeroboam", "1 11 17 25 27"],
  ["Uzziah's achievements, leprosy, and Jotham's duties", "uzziah-judah", "1 3 16 21"],
  ["Jotham's buildings, Ammonite tribute, and reign", "jotham-judah", "1 3 5 8"],
  ["Ahaz, Oded's intervention, and Assyrian trouble", "ahaz-reign ahaz-captives", "1 9 15 16 20", "ahaz-damascus"],
  ["Hezekiah's first-year temple cleansing", "hezekiah-temple-cleansed", "1 3 17 20"],
  ["Hezekiah invites Israel to the second-month Passover", "hezekiah-passover", "1 2 3 15 23", "hezekiah-temple-cleansed royal-hezekiah"],
  ["Reform, service divisions, and contributions", "hezekiah-provisions", "1 2 7 11", "royal-hezekiah"],
  ["Sennacherib, Hezekiah's illness, and Babylonian envoys", "sennacherib hezekiah-recovery hezekiah-envoys", "1 20 21 24 31 33", "royal-hezekiah sennacherib-death", "The invasion, recovery, envoys, and later deaths are distinct; Sennacherib's assassination is not dated to his invasion."],
  ["Manasseh's captivity and restoration; Amon's reign", "manasseh-amon manasseh-captivity", "1 11 13 15 21 24"],
  ["Josiah's eighth, twelfth, and eighteenth-year reforms", "josiah-seeks josiah-purge josiah-law", "1 3 8 14 29", "royal-josiah", "Seeking begins in year eight, the purge in year twelve, and temple repair and the book discovery in year eighteen. These are distinct stages."],
  ["Josiah's eighteenth-year Passover and later death", "josiah-law josiah-death", "1 19 20 24", "royal-josiah"],
  ["Judah's final kings, destruction, seventy years, and Cyrus", "jehoahaz-jehoiakim jehoiakim-bound jerusalem-597 zedekiah-appointed temple-destroyed chron-seventy-years return-decree", "2 4 6 9 10 19 21 22 23", "", "This chapter spans successive kings and exile to the return decree. The seventy-year notice is retained without falsely calling the destruction-to-decree interval seventy years."],
]);
