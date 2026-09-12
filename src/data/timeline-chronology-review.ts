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
    methodTitle: "Jesus and the Gospel genealogies",
    references: ["LUK.3.1", "LUK.3.23", "JHN.2.13", "JHN.5.1", "JHN.6.4", "JHN.11.55", "MRK.14.12", "JHN.18.28", "JHN.19.14", "JHN.19.31", "MAT.12.40", "LUK.24.21"],
    text: "Gospel review: three named Passovers in John 2, 6 and 11 imply at least two annual intervals on a sequential reading; John 5's unnamed feast cannot supply an additional year by itself. Counting Tiberius's fifteenth year from his AD 14 accession points approximately to AD 28–29; earlier starts require another reckoning. About thirty is not an exact birthday. The Passover-meal, preparation, high-sabbath and three-day passages remain explicit constraints. AD 30 and AD 33 depend on calendar and interpretive assumptions. The encyclopedia favors earlier proposals; Humphreys and Waddington argue for AD 33. Their astronomical reconstruction is a comparison, not a KJV assertion of an eclipse or an established calendar day.",
  },
];
