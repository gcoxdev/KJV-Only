/** Stated intervals, not consecutive calendar placements or lifespans. */
export const JUDGES_INTERVALS = [
  ["Mesopotamian oppression", 8, "JDG.3.8"], ["Rest after Othniel", 40, "JDG.3.11"],
  ["Moabite oppression", 18, "JDG.3.14"], ["Rest after Ehud", 80, "JDG.3.30"],
  ["Jabin's oppression", 20, "JDG.4.3"], ["Rest after Deborah and Barak", 40, "JDG.5.31"],
  ["Midianite oppression", 7, "JDG.6.1"], ["Quietness under Gideon", 40, "JDG.8.28"],
  ["Abimelech's rule", 3, "JDG.9.22"], ["Tola", 23, "JDG.10.2"], ["Jair", 22, "JDG.10.3"],
  ["Ammonite oppression", 18, "JDG.10.8"], ["Jephthah", 6, "JDG.12.7"],
  ["Ibzan", 7, "JDG.12.9"], ["Elon", 10, "JDG.12.11"], ["Abdon", 8, "JDG.12.14"],
  ["Philistine oppression", 40, "JDG.13.1"], ["Samson", 20, "JDG.15.20"],
] as const;
const judgesTotal = JUDGES_INTERVALS.reduce((sum, [, years]) => sum + years, 0);

export const CHRONOLOGY_REVIEWS = [
  {
    methodTitle: "Exodus, Judges and the calendar anchor",
    references: [...JUDGES_INTERVALS.map(([, , ref]) => ref), "1SA.4.18", "JDG.11.26"],
    text: `Interval review: the listed oppression, rest and rule notices in Judges add to ${judgesTotal} years. Adding Eli's forty produces ${judgesTotal + 40}, but that is not a reconciliation with Acts 13:20: Judges 15:20 explicitly places Samson's twenty within the Philistine period. Simply adding every interval double-counts overlap. Jephthah's three hundred years in Judges 11:26 is a further constraint, not a new interval to append. Relative order and regional overlap need more evidence before assigning individual BC dates.`,
  },
  {
    methodTitle: "Kings, exile and return",
    references: ["2KI.18.1", "2KI.18.9", "2KI.18.10", "2KI.18.13", "2KI.15.5", "2KI.8.16"],
    text: "Hezekiah review: Samaria falls in his sixth year; Sennacherib attacks in his fourteenth. One continuous reckoning implies eight regnal-year steps, whereas the working 722 and 701 BC anchors are twenty-one years apart. Accession-year or new-year conventions alone do not explain that gap. Shared reigns are possible, with direct examples involving Jotham's administration and Jehoram/Jehoshaphat, but Hezekiah's exact shared-reign start is not stated. The displayed 715–686 BC sole-reign proposal remains provisional; no new birth year or coregency endpoint is inferred.",
  },
  {
    methodTitle: "Jotham, Pekah and Manasseh",
    references: ["2KI.15.5", "2KI.15.27", "2KI.15.30", "2KI.15.32", "2KI.15.33", "2KI.17.1", "2KI.18.2", "2KI.21.1", "2KI.21.19", "2KI.22.1", "2CH.33.11", "2CH.33.12", "2CH.33.13"],
    text: "Jotham's sixteen-year reign and the twentieth-year Jotham reference both remain in the KJV record. His earlier administration during Uzziah's illness offers a possible distinction between reckonings, but no exact offset is supplied. Pekah's twenty years and Hoshea's accession synchronisms likewise do not specify the proposed rival-rule arrangement. Manasseh's fifty-five years plus Amon's two total fifty-seven. Counting backward by those fifty-seven years from the working 640 BC accession of Josiah suggests an approximately 697 BC Manasseh accession before inclusive/calendar allowances, around eleven years before Hezekiah's working 686 BC endpoint. That exposes a need for overlap or anchor revision; it is not independent proof of an eleven-year coregency. Manasseh's captivity and return in Chronicles remain unplaced within his reign.",
  },
  {
    methodTitle: "Exile and the seventy years",
    references: ["JER.25.1", "JER.25.11", "JER.25.12", "JER.29.10", "2CH.36.20", "2CH.36.21", "2CH.36.22", "DAN.9.2", "ZEC.1.7", "ZEC.1.12", "ZEC.7.1", "ZEC.7.5", "EZR.1.1", "EZR.6.15"],
    text: "Jeremiah speaks of the nations serving Babylon, punishment of Babylon, and return after seventy years at Babylon. Chronicles relates the land's sabbaths and desolation to Jeremiah and the rise of Persia. Zechariah recalls seventy years of indignation in Darius's second year and fasting in his fourth. These notices cannot be silently collapsed into one chosen pair of calendar endpoints. In the displayed model, 605 to 539 BC is 66 years, 605 to 538 is 67, 597 to 538 is 59, and 586 to 538 is 48. None supplies seventy elapsed years. The displayed temple destruction-to-completion pair, 586 to 516 BC, does total seventy, but numerical agreement does not establish it as the endpoint pair for every passage; alternative 587/586 and 516/515 anchors change that total. Exact dates and accession conventions need separate treatment. The seventy-year entry remains undated instead of drawing a misleading bar. Darius the Mede in Daniel is not equated with Darius I in Ezra and Zechariah.",
  },
  {
    methodTitle: "Jesus and the Gospel genealogies",
    references: ["LUK.3.1", "LUK.3.23", "JHN.2.13", "JHN.5.1", "JHN.6.4", "JHN.11.55", "MRK.14.12", "JHN.18.28", "JHN.19.14", "JHN.19.31", "MAT.12.40", "LUK.24.21"],
    text: "Gospel review: three named Passovers in John 2, 6 and 11 imply at least two annual intervals on a sequential reading; John 5's unnamed feast cannot supply an additional year by itself. Counting Tiberius's fifteenth year from his AD 14 accession points approximately to AD 28–29; earlier starts require another reckoning. About thirty is not an exact birthday. The Passover-meal, preparation, high-sabbath and three-day passages remain explicit constraints. AD 30 and AD 33 depend on calendar and interpretive assumptions. The encyclopedia favors earlier proposals; Humphreys and Waddington argue for AD 33. Their astronomical reconstruction is a comparison, not a KJV assertion of an eclipse or an established calendar day.",
  },
  {
    methodTitle: "Paul, Festus and the journey to Rome",
    references: ["ACT.18.11", "ACT.18.12", "ACT.19.8", "ACT.19.10", "ACT.20.31", "ACT.24.27", "ACT.25.1", "ACT.25.6", "ACT.27.9", "ACT.27.27", "ACT.28.11", "ACT.28.30", "ACT.28.31"],
    text: "Acts supplies two years before Felix is succeeded, Festus's arrival and visits, dangerous sailing after the fast, the fourteenth night of the storm, three months on Melita, and two whole years in Rome. None supplies an AD year. Acts 25:6 says more than ten days; that KJV interval is retained. External proposals place Festus's appointment in AD 57–60, but nomination, travel, and arrival need not share one date. The displayed reconstruction assumes arrival and sailing in AD 60: custody begins about 58, arrival at Rome follows about 61, and the narrated residence extends to about 63. If arrival and sailing were instead in 59, the same simplified arithmetic would give about 57, 60, and 62. This is a conditional comparison, not a second established chronology or an automatic shift of every Pauline event. Corinth's eighteen months, the Gallio setting, and Ephesus's three-month/two-year notices and three-year retrospective constrain earlier travel separately. The end of Acts does not state a release, a Spanish mission, or Paul's death date.",
  },
];
