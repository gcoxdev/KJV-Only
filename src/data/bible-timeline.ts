import type { TimelineEra, TimelineRecord } from "../lib/bible-timeline";
import { CHRONOLOGY_REVIEWS } from "./timeline-chronology-review";

export const TIMELINE_REVISION = "2026-09-12.5";
export const TIMELINE_SOURCES: Record<string, { title: string; url: string; use: string }> = {
  crucifixionStudy: { title: "Humphreys & Waddington: Dating the Crucifixion (1983)", url: "https://www.nature.com/articles/306743a0", use: "Published AD 33 proposal using reconstructed calendars and a proposed lunar-eclipse association. Its interpretation is not a KJV statement or an adopted exact date; the chart retains the provisional AD 30 framework." },
  ot: { title: "Encyclopedia of the Bible: Old Testament chronology", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Chronology-Old-Testament", use: "Comparison of calendar anchors and chronological interpretations. Its alternative textual readings are not substituted for the KJV." },
  nt: { title: "Encyclopedia of the Bible: New Testament chronology", url: "https://www.biblegateway.com/resources/encyclopedia-of-the-bible/Chronology-New-Testament", use: "Historical dating proposals for Jesus and Roman rulers; not a replacement for Gospel testimony." },
  jerusalem: { title: "British Museum: Babylonian Chronicle, BM 21946", url: "https://www.britishmuseum.org/collection/object/W_1896-0409-51", use: "Independent evidence for Nebuchadnezzar's capture of Jerusalem in 597 BC." },
  cyrus: { title: "Livius: Cyrus the Great", url: "https://www.livius.org/articles/person/cyrus-the-great/", use: "Historical calendar context for the Persian conquest of Babylon in 539 BC." },
  alexander: { title: "Livius: Alexander the Great", url: "https://www.livius.org/articles/person/alexander-the-great/", use: "Historical context between the Testaments: Alexander's reign and conquest of Persia." },
  antiochus: { title: "Livius: Antiochus IV Epiphanes", url: "https://www.livius.org/articles/person/antiochus-iv-epiphanes/", use: "Historical context for persecution and the Maccabean revolt, not a date assigned to a prophecy." },
  herod: { title: "Livius: Herod the Great", url: "https://www.livius.org/articles/person/herod-the-great/", use: "Historical proposals for Herod's reign and death; the birth of Jesus remains approximate." },
};

export const TIMELINE_METHOD = [
  { title: "KJV first", references: ["GEN.5.3", "GEN.11.10", "LUK.3.23"], text: "Ages, family relationships and stated intervals come from the shipped KJV. External sources supply proposed calendar anchors and historical context. A disagreement is recorded here rather than resolved by changing a KJV number. This is a working chronology, not a claim that every chronological question has been settled." },
  { title: "Genesis and Abraham", references: ["GEN.5.3", "GEN.7.6", "GEN.11.10", "GEN.11.32", "GEN.12.4", "ACT.7.4"], text: "Read Genesis 5 and 11 as continuous father-to-son age sequences. Adam begins at relative year 0; the Flood is at 1656. Shem is born at 1558 from his age 100 two years after the Flood. Terah is 130 at Abram's birth by 205 minus 75, combining Genesis 11:32, 12:4 and Acts 7:4. Abram is consequently born at 2008. Being named first among three sons does not by itself establish birth order." },
  { title: "The 430-year sojourn", references: ["EXO.12.40", "EXO.12.41", "GAL.3.16", "GAL.3.17", "GEN.46.3", "GEN.46.4", "EXO.6.18", "EXO.6.20"], text: "The default takes Exodus 12:40–41 as 430 years in Egypt. A comparison option counts 430 years from Abram's entry into Canaan, leaving 215 in Egypt, in light of Galatians 3:17. The long reading relates covenant confirmation to Jacob; that identification is an inference, not an explicit date in Galatians. It also raises questions about the Levi–Kohath–Amram generations. Neither tension is concealed or declared solved. Changing the option shifts the earlier calendar placement by 215 years without changing any Genesis age." },
  { title: "Exodus, Judges and the calendar anchor", references: ["1KI.6.1", "ACT.13.18", "ACT.13.19", "ACT.13.20", "ACT.13.21", "JDG.11.26"], text: "The plotted working anchor is the conventional early Exodus proposal, c. 1446 BC, with Solomon's temple c. 966 BC. 1 Kings 6:1 says the 480th year; these year-level labels have an inclusive-year/calendar allowance, not an assertion of exactly 480 elapsed anniversaries. The KJV's about 450 years of judges in Acts 13:20 is a substantial unresolved synchronism. We retain that wording and do not relocate it using another translation. Individual judges are left undated rather than forced into a fitted sequence. This unresolved issue limits confidence in all early BC projections." },
  { title: "Kings, exile and return", references: ["2KI.18.1", "2KI.24.12", "2KI.25.8", "EZR.1.1", "EZR.6.15", "NEH.2.1"], text: "Royal synchronisms must allow for accession reckoning, calendar boundaries and shared reigns. The historical capture of Jerusalem in 597 BC is an anchor; the final destruction is commonly placed in 587 or 586 BC (586 used for display). Persian dates are conventional identifications of the rulers named in Ezra and Nehemiah. Selected reign/activity periods are approximate and are not treated as full lifespans." },
  { title: "Jesus and the Gospel genealogies", references: ["MAT.1.8", "1CH.3.11", "1CH.3.12", "MAT.2.1", "LUK.2.2", "LUK.3.1", "LUK.3.23", "LUK.24.6"], text: "Matthew's genealogy compresses some generations; neither genealogy supplies a birth year for every ancestor. Jesus' birth is provisionally shown c. 6–4 BC, using 5 BC as the display anchor, with ministry c. AD 27–30. AD 30 is one proposed crucifixion/resurrection year; AD 33 is another. Herod/Cyrenius and Tiberius synchronisms remain debated. No speculative second governorship or exact birthday is asserted. Resurrection ends the earthly-ministry span; it is not depicted as the end of Jesus' life." },
  { title: "Unknown dates and evidence", references: ["GEN.5.24", "HEB.11.5"], text: "Broken ends mean unknown birth/death; striped ranges are possible dates for one event, not its duration or probabilities. Solid bars show spans of time; diamonds mark single events. Hollow circles mark conjectural placements, with calculations in the selected entry. Calendar dates marked c. remain approximate. An activity span does not claim a lifespan. A stated age alone cannot locate someone on a calendar. Enoch's endpoint is being taken by God. Apparent overlap does not prove that two people met. BC/AD labels omit year zero; internal arithmetic includes astronomical year zero." },
  { title: "Filling the lineage chart", references: ["GEN.46.12", "NUM.1.1", "NUM.1.7", "RUT.4.18", "RUT.4.22", "2SA.5.13", "2SA.5.14", "MAT.1.8", "1CH.3.11", "1CH.3.12"], text: "Jesus' lineage includes every saved ancestor in ancestry order. Dated lives and attested activity anchor the chart; undated ancestors receive evenly spaced positions between the nearest anchors, rounded to five calendar years. A 20-year interval is only a fallback when one anchor is available. Neither spacing nor a circle gives a known birth year, death year or lifespan. Large gaps can reflect compressed genealogies or unresolved chronology; their spacing is not a measured parenthood age. Nathan's contextual estimate uses the midpoint of David's Jerusalem reign. Selecting an estimate shows its anchors, arithmetic and supporting passages. Switching the sojourn model recalculates affected positions; searching or filtering does not." },
  { title: "Cainan in Luke's ancestry", references: ["GEN.11.12", "GEN.11.13", "LUK.3.35", "LUK.3.36"], text: "The KJV of Luke names Cainan between Arphaxad and Sala; Genesis gives Arphaxad's age of 35 when he begat Salah without naming that intervening person. The calculation uses the numerical interval in Genesis. It does not delete Luke's Cainan or invent extra years for him. Reconciling the genealogical wording remains an explicit open question; family links and a calculated age sequence must not be mistaken for an independently dated, complete pedigree." },
  { title: "Jotham, Pekah and Manasseh", references: [] as string[], text: "Regnal totals and overlapping authority need separate treatment from elapsed calendar years." },
  { title: "Exile and the seventy years", references: [] as string[], text: "Stated biblical intervals control the review; calendar differences alone do not determine their intended endpoints." },
  { title: "Paul, Festus and the journey to Rome", references: [] as string[], text: "Narrated durations and proposed calendar anchors are separate kinds of evidence." },
  { title: "Samuel, Eli and the ark", references: [] as string[], text: "Overlapping ministries and separate ark intervals do not supply a continuous calendar chain." },
  { title: "Divided-kingdom year counting", references: [] as string[], text: "A reign total, a succession synchronism, and a proposed BC year are separate evidence." },
  { title: "Gospel calendar assumptions", references: [] as string[], text: "The calendar proposal must fit the ministry sequence as well as the Passion passages." },
].map(method => {
  const review = CHRONOLOGY_REVIEWS.find(review => review.methodTitle === method.title);
  return review ? { ...method, text: `${method.text} ${review.text}`, references: [...new Set([...method.references, ...review.references])] } : method;
});

export type SojournModel = "egypt430" | "promise430";

export function buildBibleTimeline(model: SojournModel = "egypt430"): TimelineRecord[] {
  const records: TimelineRecord[] = [];
  const exodus = -1445; // c. 1446 BC; an explicitly disclosed working anchor.
  const egyptYears = model === "egypt430" ? 430 : 215;
  const egyptEntryAM = 2008 + 100 + 60 + 130;
  const adam = exodus - egyptYears - egyptEntryAM;
  const add = (record: TimelineRecord) => records.push(record);
  const lifeAM = (id: string, label: string, birth: number, age: number, references: string[], era: TimelineEra = "beginnings", note = "", endLabel?: string) => add({
    id, label, personIds: [id], kind: "life", era, start: adam + birth, end: adam + birth + age,
    startStatus: "derived", endStatus: "derived", age, adamYear: birth, endLabel,
    references, sources: ["ot"], note: `Birth at year ${birth} from Adam; ${age} years from the cited KJV passage(s). Calendar placement follows the selected sojourn and early-Exodus model. ${note}`.trim(),
  });
  const event = (id: string, label: string, era: TimelineEra, start: number, references: string[], note: string, sources: string[] = ["ot"], end?: number, dateWindow = false) => add({ id, label, era, kind: dateWindow ? "date-window" : end === undefined ? "event" : "period", start, end, startStatus: "approximate", endStatus: "approximate", references, note, sources });
  const activity = (id: string, label: string, era: TimelineEra, start: number, end: number | undefined, references: string[], note: string, sources = ["ot"]) => add({ id, label, era, kind: "activity", personIds: [id], start, end, references, sources, note, startStatus: "unknown", endStatus: "unknown" });
  const unknown = (id: string, label: string, era: TimelineEra, references: string[], note: string, age?: number) => add({ id, label, personIds: [id], era, kind: "life", references, sources: [], note, age, startStatus: "unknown", endStatus: "unknown" });

  // Each interval below is the KJV father's age at the next named son's birth.
  const primeval = [
    ["adam_2", "Adam", 130, 930, 3, 5], ["seth_17", "Seth", 105, 912, 6, 8],
    ["enos_18", "Enos", 90, 905, 9, 11], ["cainan_19", "Cainan", 70, 910, 12, 14],
    ["mahalaleel_20", "Mahalaleel", 65, 895, 15, 17], ["jared_21", "Jared", 162, 962, 18, 20],
    ["enoch_22", "Enoch", 65, 365, 21, 23], ["methuselah_23", "Methuselah", 187, 969, 25, 27],
    ["lamech_24", "Lamech", 182, 777, 28, 31],
  ] as const;
  let birth = 0;
  for (const [id, name, nextAge, age, fatherVerse, deathVerse] of primeval) {
    lifeAM(id, name, birth, age, [`GEN.5.${fatherVerse}`, `GEN.5.${deathVerse}`, ...(id === "enoch_22" ? ["GEN.5.24", "HEB.11.5"] : [])], "beginnings", "", id === "enoch_22" ? "Taken by God" : undefined);
    birth += nextAge;
  }
  lifeAM("noah_25", "Noah", birth, 950, ["GEN.5.28", "GEN.5.29", "GEN.7.6", "GEN.9.29"]);
  event("flood", "The Flood", "beginnings", adam + 1656, ["GEN.7.6", "GEN.7.11", "GEN.8.13", "GEN.8.14"], "Noah is 600 at the Flood; cumulative Genesis 5 intervals place it at year 1656 from Adam. The waters recede into his 601st year.", ["ot"], adam + 1657);
  birth = 1558;
  const postFlood = [
    ["shem_26", "Shem", 100, 600, 10, 11], ["arphaxad_76", "Arphaxad", 35, 438, 12, 13],
    ["salah_83", "Salah", 30, 433, 14, 15], ["eber_74", "Eber", 34, 464, 16, 17],
    ["peleg_84", "Peleg", 30, 239, 18, 19], ["reu_99", "Reu", 32, 239, 20, 21],
    ["serug_100", "Serug", 30, 230, 22, 23], ["nahor_101", "Nahor (Terah's father)", 29, 148, 24, 25],
  ] as const;
  for (const [id, name, nextAge, age, fatherVerse, afterVerse] of postFlood) {
    lifeAM(id, name, birth, age, [`GEN.11.${fatherVerse}`, `GEN.11.${afterVerse}`]);
    birth += nextAge;
  }
  lifeAM("terah_102", "Terah", birth, 205, ["GEN.11.24", "GEN.11.32", "GEN.12.4", "ACT.7.4"], "patriarchs", "Abram's birth is calculated at Terah's age 130, not inferred from first place in the list of sons.");
  lifeAM("abram_103", "Abraham", 2008, 175, ["GEN.11.32", "GEN.12.4", "ACT.7.4", "GEN.25.7"], "patriarchs");
  lifeAM("sarai_107", "Sarah", 2018, 127, ["GEN.17.17", "GEN.23.1"], "patriarchs", "Genesis 17:17 supplies the ten-year age difference from Abraham.");
  lifeAM("isaac_128", "Isaac", 2108, 180, ["GEN.21.5", "GEN.35.28"], "patriarchs");
  lifeAM("jacob_183", "Jacob / Israel", 2168, 147, ["GEN.25.26", "GEN.47.9", "GEN.47.28"], "patriarchs");
  lifeAM("joseph_205", "Joseph", 2259, 110, ["GEN.41.46", "GEN.41.53", "GEN.45.6", "GEN.47.9", "GEN.50.26"], "patriarchs", "Joseph is 30 at appointment, then seven plentiful years and two famine years precede Jacob's arrival at 130: Jacob is about 91 at Joseph's birth. Year-only arithmetic allows calendar rounding.");
  event("abram-canaan", "Abram enters Canaan", "patriarchs", adam + 2083, ["GEN.12.4", "GEN.12.5"], "Abram is 75. The promise-to-law option counts its 430 years from this point.");
  event("joseph-sold", "Joseph sold into Egypt", "patriarchs", adam + 2276, ["GEN.37.2", "GEN.37.28"], "Joseph is 17 in the chapter's opening; applying that age to the sale is a narrative inference.");
  event("joseph-appointed", "Joseph appointed by Pharaoh", "patriarchs", adam + 2289, ["GEN.41.46"], "Joseph is 30 when he stands before Pharaoh.");
  event("egypt-entry", "Jacob's household enters Egypt", "patriarchs", adam + egyptEntryAM, ["GEN.46.3", "GEN.46.4", "GEN.47.9"], "Jacob is 130. The BC date shifts with the selected interpretation of the 430-year sojourn.");
  for (const [id, label] of [["judah_197", "Judah"], ["pharez_293", "Pharez"], ["hezron_313", "Hezron"]]) {
    activity(id, label, "patriarchs", adam + egyptEntryAM, undefined, ["GEN.46.12", "GEN.46.26", "GEN.47.9"], "Named in Jacob's household entering Egypt. This marks presence at the migration, not birth; the three generations were already alive together. Calendar placement follows the selected sojourn model.");
  }
  event("egypt-sojourn", "Israel's sojourn in Egypt", "exodus", adam + egyptEntryAM, ["EXO.12.40", "EXO.12.41", "GAL.3.17"], `${egyptYears} years in Egypt in the selected model. See Sources & method for the unresolved interpretive questions.`, ["ot"], exodus);
  unknown("eve_3", "Eve", "beginnings", ["GEN.2.22", "GEN.4.25"], "Creation and motherhood are recorded; no numerical lifespan is supplied.");
  unknown("rebekah_144", "Rebekah", "patriarchs", ["GEN.24.67", "GEN.25.20", "GEN.25.26", "GEN.49.31"], "Isaac's age at marriage is known; Rebekah's own age and death year are not.");
  unknown("rachel_190", "Rachel", "patriarchs", ["GEN.30.24", "GEN.35.16", "GEN.35.19"], "Death at Benjamin's birth is recorded, but no exact year or lifespan is supplied.");
  unknown("levi_196", "Levi", "patriarchs", ["EXO.6.16", "GEN.29.34"], "Lifespan is 137 years; the birth year is not securely fixed by the cited passages.", 137);
  unknown("job_2665", "Job", "patriarchs", ["JOB.1.1", "JOB.42.16"], "The 140 years are after his restoration, not his total lifespan. Placement in the patriarchal browsing section is thematic; no calendar bar is assigned.");

  add({ id: "moses_356", label: "Moses", personIds: ["moses_356"], era: "exodus", kind: "life", start: exodus - 80, end: exodus + 40, age: 120, startStatus: "derived", endStatus: "derived", references: ["EXO.7.7", "DEU.34.7", "DEU.1.3"], sources: ["ot"], note: "80 before Pharaoh and 120 at death; birth and death are calculated from the working Exodus anchor and forty wilderness years." });
  add({ id: "aaron_361", label: "Aaron", personIds: ["aaron_361"], era: "exodus", kind: "life", start: exodus - 83, end: exodus + 40, age: 123, startStatus: "derived", endStatus: "derived", references: ["EXO.7.7", "NUM.33.38", "NUM.33.39"], sources: ["ot"], note: "83 before Pharaoh; death at 123 in the fortieth year. Annual labels round within the Exodus/wilderness calendar." });
  add({ id: "miriam_390", label: "Miriam", personIds: ["miriam_390"], era: "exodus", kind: "life", end: exodus + 40, endStatus: "approximate", references: ["NUM.20.1", "NUM.33.38"], sources: ["ot"], note: "Death is placed in the final wilderness year from its narrative context. Birth year and age are not supplied; the left end remains unknown." });
  add({ id: "caleb_435", label: "Caleb", personIds: ["caleb_435"], era: "exodus", kind: "life", start: exodus + 1 - 40, startStatus: "derived", references: ["NUM.10.11", "NUM.13.6", "JOS.14.7", "JOS.14.10"], sources: ["ot"], note: "40 at the spying mission in the second wilderness year; 85 when requesting Hebron 45 years later. Death year is unknown." });
  unknown("joshua_391", "Joshua", "exodus", ["EXO.17.9", "JOS.24.29"], "Joshua died at 110, but Scripture does not give his age at the Exodus or an exact death year. His lifespan is not positioned by a guessed generation length.", 110);
  unknown("samuel_606", "Samuel", "exodus", ["1SA.1.20", "1SA.25.1"], "Birth and death are narrated without a numerical lifespan; no full life bar is fabricated.");
  event("exodus", "The Exodus", "exodus", exodus, ["EXO.12.40", "EXO.12.41", "1KI.6.1"], "c. 1446 BC is the conventional early-date working proposal. See the unresolved Acts 13:20 synchronism and inclusive-year allowance in Sources & method.");
  activity("nahshon_379", "Nahshon", "exodus", exodus + 1, undefined, ["NUM.1.1", "NUM.1.7", "RUT.4.20"], "Named as Judah's leader at the census in the second year after leaving Egypt. This dates an attested activity, not his birth. It anchors the otherwise sparsely dated Judah-to-David ancestry to the working Exodus chronology.");
  event("sinai-law", "The law at Sinai", "exodus", exodus, ["EXO.19.1", "EXO.20.1", "GAL.3.17"], "The third month after departure; the chart has year-level resolution.");
  event("wilderness", "Wilderness journey", "exodus", exodus, ["NUM.14.33", "DEU.2.14", "DEU.1.3"], "Forty-year wilderness period, including the 38 years from Kadesh-barnea to Zered.", ["ot"], exodus + 40);
  event("jordan", "Israel crosses Jordan", "exodus", exodus + 40, ["JOS.4.19", "JOS.5.6"], "After the forty wilderness years; the passage gives the tenth day of the first month, not a BC date.");
  event("caleb-hebron", "Caleb requests Hebron", "exodus", exodus + 46, ["JOS.14.7", "JOS.14.10", "JOS.14.13"], "45 years after the spying mission, when Caleb is 85; about six years after crossing Jordan.");
  for (const [id, label, refs] of [
    ["othniel", "Othniel", ["JDG.3.8", "JDG.3.11"]], ["ehud", "Ehud", ["JDG.3.14", "JDG.3.30"]],
    ["deborah", "Deborah and Barak", ["JDG.4.3", "JDG.5.31"]], ["gideon", "Gideon", ["JDG.6.1", "JDG.8.28"]],
    ["jephthah", "Jephthah", ["JDG.11.26", "JDG.12.7"]], ["samson", "Samson", ["JDG.13.1", "JDG.15.20"]],
  ] as const) add({ id: `judge-${id}`, label, era: "exodus", kind: "activity", references: [...refs, "ACT.13.20", "1KI.6.1"], sources: [], note: "Judges supplies periods of oppression, rest or judging, not a full lifespan. Regional overlap and the Acts 13:20 / 1 Kings 6:1 synchronism require further resolution; no exact BC placement is asserted." });

  add({ id: "david_593", label: "David", personIds: ["david_593"], era: "kingdom", kind: "life", start: -1039, end: -969, age: 70, startStatus: "derived", endStatus: "derived", references: ["2SA.5.4", "2SA.5.5", "1KI.2.11"], sources: ["ot"], note: "30 at accession and 40 years of reign give about 70 years. Calendar dates follow the conventional c. 1010–970 BC reign; the seven years and six months at Hebron caution against day-level precision." });
  add({ id: "nathan_676", label: "Nathan", personIds: ["nathan_676"], era: "kingdom", kind: "life", references: ["2SA.5.5", "2SA.5.13", "2SA.5.14", "LUK.3.31"], sources: ["ot"],
    note: "David's son Nathan is listed among the children born in Jerusalem. His birth year and lifespan are not stated.",
    placement: { year: -984, method: "context", anchorIds: ["david_593"], explanation: "David's Jerusalem reign begins after seven years and six months at Hebron: approximately 1003–970 BC in the existing royal chronology. Nathan's birth is narrated among his Jerusalem-born children. The midpoint, rounded to five years (c. 985 BC), provides a conjectural position within that period, not a known birth year. The full period remains possible." } });
  activity("solomon_677", "Solomon", "kingdom", -969, -929, ["1KI.6.1", "1KI.11.42", "1KI.11.43"], "Forty-year reign, conventionally c. 970–930 BC. The fourth-year temple date is c. 966 BC with accession-calendar allowance. No birth year or total lifespan is supplied.");
  activity("saul_618", "Saul (king)", "kingdom", -1049, -1009, ["ACT.13.21", "1SA.31.6"], "Acts 13:21 supplies forty years; plotted approximately before David's reign. This is a reign interval, not age at death.");
  event("temple", "Solomon begins the temple", "kingdom", -965, ["1KI.6.1"], "Fourth regnal year and 480th year after the Exodus. c. 966 BC is a conventional calendar projection; see Sources & method for counting and the unresolved Judges synchronism.");
  event("temple-complete", "Solomon completes the temple", "kingdom", -958, ["1KI.6.37", "1KI.6.38"], "Seventh-year construction interval; completed in Solomon's eleventh year, eighth month.");
  event("kingdom-divides", "The kingdom divides", "kingdom", -929, ["1KI.11.42", "1KI.12.16", "1KI.12.20"], "After Solomon's death; c. 930 BC conventional royal chronology.");
  activity("rehoboam_847", "Rehoboam", "kingdom", -929, -912, ["1KI.14.21"], "41 at accession and 17 years of reign. The displayed span is his reign; an exact death age is not separately stated.");
  activity("hezekiah_944", "Hezekiah", "kingdom", -714, -685, ["2KI.18.1", "2KI.18.2", "2KI.18.13", "2KI.20.6"], "Conventional sole-reign proposal c. 715–686 BC; 25 at accession and 29 years given in the KJV. The Hoshea synchronism requires considering a shared reign, so no synthesized birth year is assigned.");
  activity("josiah_849", "Josiah", "kingdom", -639, -608, ["2KI.22.1", "2KI.23.29"], "Eight at accession; 31-year reign, conventionally c. 640–609 BC. Reign shown separately from lifespan.");
  event("samaria", "Samaria falls", "kingdom", -721, ["2KI.17.5", "2KI.17.6"], "Conventional c. 722 BC anchor for the northern kingdom's fall; the siege lasts three years.");
  event("sennacherib", "Sennacherib invades Judah", "kingdom", -700, ["2KI.18.13", "ISA.36.1"], "Conventional 701 BC synchronism with Assyrian history; Hezekiah's reign-counting questions remain visible in his entry.");
  event("jerusalem-597", "Jerusalem captured; Jehoiachin taken", "exile", -596, ["2KI.24.10", "2KI.24.12", "2KI.24.15"], "597 BC independently attested in the Babylonian Chronicle. Distinct from the later destruction of the temple.", ["jerusalem"]);
  activity("jehoiachin_999", "Jehoiachin", "exile", -596, undefined, ["2KI.24.8", "2KI.24.12", "2KI.24.15", "1CH.3.16", "1CH.3.17"], "Reigned three months before the capture and deportation in 597 BC. This marker dates the deportation, not birth or death. Jeconiah in the genealogy is the same king.", ["jerusalem"]);
  event("temple-destroyed", "Jerusalem and the temple burned", "exile", -585, ["2KI.25.8", "2KI.25.9", "JER.52.12"], "586 BC is used for display; 587 BC is another major reconstruction because of regnal-year conventions. The KJV month/day references are retained, not replaced by an invented exact modern date.");
  activity("daniel_2774", "Daniel", "exile", -604, -535, ["DAN.1.1", "DAN.1.6", "DAN.10.1"], "Attested from Jehoiakim's third year through Cyrus's third year, conventionally c. 605–536 BC. This records activity, not a claimed birth/death interval.");
  event("babylon-falls", "Babylon falls to Persia", "exile", -538, ["DAN.5.30", "DAN.5.31"], "Persian conquest in 539 BC provides calendar context. The identity of Darius the Mede is not resolved by this chart.", ["cyrus"]);
  event("return-decree", "Cyrus permits the return", "exile", -537, ["EZR.1.1", "EZR.1.2", "EZR.1.3"], "Conventionally c. 538 BC in Cyrus's first year over Babylon. The decree's content comes from Ezra; historical chronology supplies the calendar placement.", ["ot", "cyrus"]);
  activity("zerubbabel_1118", "Zerubbabel", "exile", -537, -515, ["EZR.2.2", "EZR.3.8", "ZEC.4.9", "EZR.6.15"], "Return and temple rebuilding, c. 538–516 BC. Parentage is represented differently in Chronicles and Ezra; links retain the app's existing identity records without resolving that question.");
  event("second-temple", "Second temple completed", "exile", -515, ["EZR.6.15"], "Darius's sixth year, Adar 3; conventionally 516 BC, with 515 BC also used depending on calendar treatment.");
  activity("ezra_2140", "Ezra", "exile", -457, -444, ["EZR.7.7", "EZR.7.8", "NEH.8.2"], "Conventional c. 458 BC arrival, with later public reading in Nehemiah. Identifying Artaxerxes as Artaxerxes I is a historical interpretation; these are activity dates.");
  activity("nehemiah_2321", "Nehemiah", "exile", -444, -431, ["NEH.2.1", "NEH.5.14", "NEH.13.6"], "Artaxerxes's twentieth through thirty-second years, conventionally c. 445–432 BC. His later return follows an unspecified interval; this span does not mark his death.");
  event("wall", "Jerusalem's wall rebuilt", "exile", -444, ["NEH.2.1", "NEH.6.15"], "Completed in 52 days on Elul 25; c. 445 BC under the Artaxerxes I identification.");
  event("alexander", "Alexander's conquests", "gospels", -333, [], "Historical context: campaigns beginning 334 BC and the conquest of the Persian empire. No prophetic identification is imposed.", ["alexander"], -322);
  event("antiochus", "Antiochus IV and the Maccabean revolt", "gospels", -166, [], "Historical context around 167 BC. This point is not presented as an event explicitly dated by the KJV or as an automatic interpretation of Daniel.", ["antiochus"]);
  event("herod", "Herod rules in Jerusalem", "gospels", -36, ["MAT.2.1"], "Historical reign proposal c. 37–4 BC. Matthew places Jesus' birth under Herod. Calendar reconstruction and Herod's death date remain matters for comparison.", ["herod"], -3);
  add({ id: "jesus-earthly", label: "Jesus — earthly life and ministry", personIds: ["jesus_christ_2683", "jesus_christ_2684"], era: "gospels", kind: "period", startLabel: "Birth", start: -4, end: 30, startStatus: "approximate", endStatus: "approximate", endLabel: "Resurrection", references: ["MAT.2.1", "LUK.2.2", "LUK.3.1", "LUK.3.23", "LUK.24.6"], sources: ["nt", "herod"], note: "Birth c. 6–4 BC (5 BC display anchor); about thirty at the start of ministry. AD 30 is a provisional crucifixion/resurrection placement; AD 33 is another proposal. The bar describes earthly life through resurrection, not an endpoint to Jesus' continuing life. See the unresolved census and regnal synchronisms in Sources & method." });
  event("jesus-birth", "Birth of Jesus", "gospels", -5, ["MAT.2.1", "LUK.2.1", "LUK.2.2", "LUK.2.7"], "Approximate proposed birth window c. 6–4 BC, not a two-year-long birth event. Shading denotes dating uncertainty. No specific month/day is supplied.", ["nt", "herod"], -3, true);
  event("john-ministry", "John the Baptist's ministry begins", "gospels", 27, ["LUK.3.1", "LUK.3.2", "LUK.3.3"], "Tiberius's fifteenth year; c. AD 27–29 is shown as a dating window reflecting regnal-counting proposals, not a stated ministry duration. The displayed AD 30 Passion framework requires an earlier regnal reading; an August AD 28-or-later start followed by three named Passovers cannot fit it unchanged. See Gospel calendar assumptions in Sources & method.", ["nt"], 29, true);
  event("jesus-ministry", "Jesus' public ministry", "gospels", 27, ["LUK.3.23", "JHN.2.13", "JHN.6.4", "JHN.11.55"], "Provisional c. AD 27–30 placement; John's Passover notices give sequence. Duration and absolute years depend on the selected New Testament chronology.", ["nt"], 30);
  event("resurrection", "Crucifixion and resurrection", "gospels", 30, ["LUK.23.33", "LUK.24.6", "1CO.15.3", "1CO.15.4"], "AD 30 is a working proposal, with AD 33 another major candidate. The KJV supplies the events and resurrection testimony; it does not supply either AD number. The AD 30 framework depends on an earlier ministry-start reckoning. No exact weekday or Nisan date is asserted; see Gospel calendar assumptions in Sources & method.", ["nt"]);
  activity("mary_2828", "Mary (mother of Jesus)", "gospels", -4, 30, ["LUK.1.27", "LUK.2.7", "JHN.19.25", "ACT.1.14"], "Present in the birth narratives and after the resurrection. Neither her birth year nor her death year is supplied. The span is recorded activity only.", ["nt"]);
  activity("joseph_2827", "Joseph (Mary's husband)", "gospels", -4, 8, ["MAT.1.20", "LUK.2.7", "LUK.2.42", "LUK.2.48"], "Present at Jesus' birth and when Jesus is twelve. Later absence does not establish Joseph's death date. Calendar placement follows the provisional birth anchor.", ["nt"]);
  for (const [id, alias] of [["mary_2828", "mary_2829"], ["joseph_2827", "joseph_2828"], ["zerubbabel_1118", "zerubbabel_1119"]]) {
    records.find(record => record.id === id)?.personIds?.push(alias);
  }
  return records.map(record => /AD 33/.test(record.note) ? { ...record, sources: [...new Set([...record.sources, "crucifixionStudy"])] } : record);
}
