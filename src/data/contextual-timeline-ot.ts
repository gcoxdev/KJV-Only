import { buildAnchoredContext, type AnchoredEpisode, type TimelineAnchor } from "./contextual-timeline-anchors";
import type { TimelineEra, TimelineRecord } from "../lib/bible-timeline";
import type { ChapterMapping, ContextTimelineRecord } from "./contextual-timeline";

// Offsets use astronomical years from the existing KJV chronology. They are
// independent of filters and never borrow schematic genealogy placements.
type Anchor = TimelineAnchor;
type Episode = AnchoredEpisode;
const episodes: Episode[] = [];
function add(id: string, label: string, era: TimelineEra, references: string[], note: string, at?: Anchor, until?: Anchor, kind?: TimelineRecord["kind"]) {
  episodes.push({ id, label, era, references, note, at, until, kind });
}
const early = (id: string, label: string, references: string[], note: string, at?: Anchor, until?: Anchor, kind?: TimelineRecord["kind"]) => add(id, label, "beginnings", references, note, at, until, kind);
const patriarch = (id: string, label: string, references: string[], note: string, at?: Anchor, until?: Anchor, kind?: TimelineRecord["kind"]) => add(id, label, "patriarchs", references, note, at, until, kind);
const journey = (id: string, label: string, references: string[], note: string, at?: Anchor, until?: Anchor, kind?: TimelineRecord["kind"]) => add(id, label, "exodus", references, note, at, until, kind);

early("ot-creation", "The creation-week narrative", ["GEN.1.1", "GEN.1.26", "GEN.2.1", "GEN.2.7"], "Uses Adam's relative year zero for the creation-week narrative at year resolution. The BC label is a projection of the selected Genesis age-sequence and sojourn model, not an independently measured creation date.", ["adam_2"]);
early("ot-eden", "Eden, the transgression, and expulsion", ["GEN.2.8", "GEN.3.1", "GEN.3.23"], "The KJV does not give the interval from creation to the transgression. Adam's creation is surrounding context; no separate year is invented for these events.");
early("ot-cain", "Cain, Abel, and Cain's descendants", ["GEN.4.1", "GEN.4.8", "GEN.4.17"], "Births, the killing of Abel, and several later generations are narrated without calendar intervals. They are not all dated to Seth's birth at the chapter's close.");
early("ot-seth-birth", "The birth of Seth", ["GEN.4.25", "GEN.5.3"], "Adam's stated age of 130 supplies the relative year. This does not date the earlier Cain narrative or the later descendants to the same moment.", ["adam_2", 130]);
early("ot-genesis5", "The generations from Adam to Noah", ["GEN.5.1", "GEN.5.3", "GEN.5.27", "GEN.5.32"], "The listed births and lifespans cover many generations. The plotted envelope runs from Adam to Methuselah's calculated death, not to Noah's death. Use Genealogy for the individual lives; a list is not one event or a date for the book's composition.", ["adam_2"], ["methuselah_23", 0, "end"], "period");
early("ot-ark-preparation", "The command to build the ark", ["GEN.6.3", "GEN.6.13", "GEN.6.14", "GEN.6.22"], "The command precedes the Flood, but no construction starting year is stated. Genesis 6:3's 120 years are not automatically treated as the time spent building the ark.");
early("ot-noah-covenant", "Noah leaves the ark; the covenant and rainbow", ["GEN.8.14", "GEN.8.18", "GEN.8.20", "GEN.9.8", "GEN.9.13"], "Placed with the Flood's closing year in Noah's 601st year. The offering and covenant follow departure from the ark; the later vineyard episode is not thereby dated.", ["flood", 0, "end"]);
early("ot-noah-vineyard", "Noah's vineyard and words concerning his sons", ["GEN.9.20", "GEN.9.24", "GEN.9.25"], "This is after the Flood, but the text does not state how long afterward. Noah's age at death later in the chapter does not date this incident.");
early("ot-noah-death", "The death of Noah", ["GEN.9.28", "GEN.9.29"], "Noah lives 350 years after the Flood and dies at 950. The point comes from the shared KJV lifespan calculation, separately from the covenant and vineyard episodes.", ["noah_25", 0, "end"]);
early("ot-nations", "The families and nations after the Flood", ["GEN.10.1", "GEN.10.5", "GEN.10.25", "GEN.10.32"], "This table covers descendants and territories across generations. Peleg's name and the earth being divided do not establish an exact year for Babel or a modern geographical event.");
early("ot-babel", "Babel and the scattering of languages", ["GEN.11.1", "GEN.11.4", "GEN.11.8", "GEN.11.9"], "No numerical date is supplied for Babel. Its narrative position and the name Peleg are not used to force an exact placement within the post-Flood genealogy.");
early("ot-genesis11", "The generations from Shem to Terah's household", ["GEN.11.10", "GEN.11.26", "GEN.11.31", "GEN.11.32", "ACT.7.4"], "The envelope covers the genealogy and its closing Terah notice. The shared model uses Abram's departure at 75 after Terah's death to infer Terah's age at Abram's birth. This does not date Babel to Terah's death.", ["shem_26"], ["terah_102", 0, "end"], "period");

patriarch("ot-abram-egypt", "Abram's famine journey to Egypt and return", ["GEN.12.10", "GEN.12.20", "GEN.13.1", "GEN.16.3"], "The possible-date window follows entry at 75 and precedes the ten-years-in-Canaan notice. It is not a ten-year stay in Egypt. No Pharaoh is identified from an external king list.", ["abram-canaan"], ["abram-canaan", 10], "date-window");
patriarch("ot-lot-separation", "Abram and Lot separate", ["GEN.13.5", "GEN.13.11", "GEN.13.18", "GEN.16.3"], "Placed within the early Canaan narrative before the Hagar episode. The window is a narrative bound, not an independently dated year.", ["abram-canaan"], ["abram-canaan", 10], "date-window");
patriarch("ot-lot-rescue", "Abram rescues Lot and meets Melchizedek", ["GEN.14.1", "GEN.14.14", "GEN.14.18", "GEN.16.3"], "The early-Canaan window is approximate. The named kings are not equated with uncertain historical candidates to manufacture a campaign date; Melchizedek's own lifespan is not supplied.", ["abram-canaan"], ["abram-canaan", 10], "date-window");
patriarch("ot-abraham-covenant", "The promise and covenant with Abram", ["GEN.15.1", "GEN.15.6", "GEN.15.13", "GEN.15.18", "GEN.16.3"], "The revelation precedes the Hagar account in the narrative. Its 400-year statement concerns the promised future experience, not the duration of this covenant-making episode. The precise year remains uncertain within the early-Canaan window.", ["abram-canaan"], ["abram-canaan", 10], "date-window");
patriarch("ot-ishmael-birth", "The birth of Ishmael", ["GEN.16.3", "GEN.16.15", "GEN.16.16"], "Abram is 86 at Ishmael's birth. The ten-year Canaan notice earlier in the chapter concerns Sarai giving Hagar to Abram, not a conflicting birth age.", ["abram_103", 86]);
patriarch("ot-circumcision", "Covenant names and circumcision", ["GEN.17.1", "GEN.17.5", "GEN.17.15", "GEN.17.24", "GEN.17.25"], "Abraham is 99 and Ishmael 13. These explicit ages align in the shared Genesis calculation; the promised birth of Isaac is still future.", ["abram_103", 99]);
patriarch("ot-visitors-sodom", "The visitors, promised son, and destruction of Sodom", ["GEN.18.1", "GEN.18.10", "GEN.19.1", "GEN.19.24", "GEN.21.5"], "This groups successive narrated episodes between the late promise and Isaac's birth. The possible-year window is not the length of the destruction; later descendants mentioned in Genesis 19 are not all born within it.", ["abram_103", 99], ["abram_103", 100], "date-window");
patriarch("ot-abraham-gerar", "Abraham and Sarah at Gerar", ["GEN.20.1", "GEN.20.2", "GEN.20.17", "GEN.21.1"], "The proposed window follows the narrative before Isaac's birth. Abimelech's name does not establish a separate historical calendar anchor.", ["abram_103", 99], ["abram_103", 100], "date-window");
patriarch("ot-isaac-birth", "The birth of Isaac", ["GEN.21.1", "GEN.21.5", "GEN.17.17"], "Abraham is 100; the ten-year age difference makes Sarah about 90. These are KJV relative ages projected through the selected sojourn model.", ["isaac_128"]);
patriarch("ot-isaac-weaning", "Isaac's weaning, Hagar's departure, and the well covenant", ["GEN.21.8", "GEN.21.14", "GEN.21.22", "GEN.21.32"], "These are later episodes in Genesis 21. Isaac's weaning age is not stated, so they are not all assigned his birth year.");
patriarch("ot-isaac-offering", "Abraham offers Isaac", ["GEN.22.1", "GEN.22.2", "GEN.22.9", "GEN.22.19"], "The text gives a three-day journey but no age for Isaac or calendar year for the trial. No traditional age is substituted as a dated fact.");
patriarch("ot-sarah-death", "Sarah dies; Machpelah is purchased", ["GEN.23.1", "GEN.23.2", "GEN.23.19"], "Sarah dies at 127. Her death is calculated from the shared lifespan; the purchase and burial belong to that episode at year-level resolution.", ["sarai_107", 0, "end"]);
patriarch("ot-isaac-marriage", "Isaac marries Rebekah", ["GEN.24.67", "GEN.25.20"], "Isaac is 40 at marriage. Rebekah's age and the journey's exact calendar days are not supplied.", ["isaac_128", 40]);
patriarch("ot-abraham-death", "The death of Abraham", ["GEN.25.7", "GEN.25.8", "GEN.25.9"], "Abraham dies at 175. The genealogy and later deaths in Genesis 25 are not all assigned this year.", ["abram_103", 0, "end"]);
patriarch("ot-ishmael-death", "The death of Ishmael", ["GEN.25.12", "GEN.25.17", "GEN.16.16"], "Ishmael dies at 137, calculated from his birth when Abraham was 86. This closing notice is later than Abraham's death and the birth of Jacob and Esau, despite its position in Genesis 25.", ["ot-ishmael-birth", 137]);
patriarch("ot-twins-birth", "The births of Esau and Jacob", ["GEN.25.21", "GEN.25.24", "GEN.25.26"], "Isaac is 60 when the twins are born. The later birthright episode has no stated year and is not dated to their birth.", ["jacob_183"]);
patriarch("ot-birthright", "Esau sells his birthright", ["GEN.25.27", "GEN.25.29", "GEN.25.33"], "The twins have grown, but their ages in this incident are not given.");
patriarch("ot-isaac-gerar", "Isaac's famine, wells, and covenant at Gerar", ["GEN.26.1", "GEN.26.6", "GEN.26.18", "GEN.26.28"], "This famine is explicitly distinct from Abraham's earlier famine. The well disputes and covenant have no securely stated calendar year.");
patriarch("ot-esau-wives", "Esau marries at forty", ["GEN.26.34", "GEN.26.35", "GEN.25.26"], "Esau's stated age supplies the relative date through the twins' shared birth year. It does not date every earlier episode of Genesis 26.", ["jacob_183", 40]);
patriarch("ot-jacob-haran", "Jacob receives the blessing and travels to Haran", ["GEN.27.1", "GEN.28.10", "GEN.30.25", "GEN.31.41"], "Working inference: Joseph's birth is aligned with the completion of fourteen years of service for the wives, leaving six years for the flocks. Counting back fourteen years gives Jacob about 77 at arrival. That alignment is an inference, not an age explicitly stated in Genesis 27–28.", ["joseph_205", -14]);
patriarch("ot-jacob-marriages", "Jacob marries Leah and Rachel", ["GEN.29.20", "GEN.29.21", "GEN.29.27", "GEN.29.28", "GEN.31.41"], "The marriages follow seven years of service. Rachel is given after Leah's week, before the further seven years are served; the text does not put the weddings seven years apart. The year uses the disclosed Joseph/service alignment.", ["ot-jacob-haran", 7]);
patriarch("ot-laban-service", "Jacob's twenty years with Laban", ["GEN.29.20", "GEN.30.25", "GEN.31.38", "GEN.31.41"], "The KJV gives twenty years: fourteen for the daughters and six for the cattle. The working calendar aligns Joseph's birth with the transition. It does not assign a birth year to each child from their list order.", ["ot-jacob-haran"], ["ot-jacob-haran", 20], "period");
patriarch("ot-joseph-birth", "The birth of Joseph", ["GEN.30.22", "GEN.30.24", "GEN.41.46", "GEN.41.53", "GEN.45.6", "GEN.47.9"], "The shared calculation works backward from Jacob at 130, Joseph at 30 before seven plentiful years and two famine years. Jacob is about 91 at Joseph's birth; annual boundaries remain approximate.", ["joseph_205"]);
patriarch("ot-jacob-return", "Jacob leaves Laban, wrestles, and meets Esau", ["GEN.31.17", "GEN.31.41", "GEN.32.24", "GEN.32.28", "GEN.33.1"], "Successive return-journey episodes after twenty years with Laban. The working year follows the disclosed Joseph/service alignment, not a claim that every stop occurred on one day.", ["ot-laban-service", 0, "end"]);
patriarch("ot-dinah", "Dinah and the violence at Shechem", ["GEN.34.1", "GEN.34.25", "GEN.34.30"], "No age for Dinah or interval after the return is supplied. The episode is not automatically assigned the arrival year.");
patriarch("ot-bethel-rachel", "Return to Bethel; Rachel dies at Benjamin's birth", ["GEN.35.1", "GEN.35.8", "GEN.35.16", "GEN.35.19"], "The deaths and movements in this section are narrated without an exact year. The later closing notice of Isaac's death does not date Rachel's death or Benjamin's birth.");
patriarch("ot-isaac-death", "The death of Isaac", ["GEN.35.28", "GEN.35.29", "GEN.25.26"], "Isaac dies at 180, when Jacob is about 120 and Joseph about 29. This closing notice is later than Joseph's sale at 17, which is narrated in Genesis 37. Chapter order is not used to reverse those explicit ages.", ["isaac_128", 0, "end"]);
patriarch("ot-edom", "Esau's descendants and Edom's rulers", ["GEN.36.1", "GEN.36.9", "GEN.36.31"], "The chapter surveys families, chiefs, and kings across generations. It does not give a complete set of reign dates or place every ruler in Jacob's lifetime.");
patriarch("ot-judah-tamar", "Judah and Tamar; Pharez and Zarah", ["GEN.38.1", "GEN.38.6", "GEN.38.27", "GEN.46.12"], "The family narrative spans years but does not give birth ages or a complete calendar sequence. The presence of later generations in Genesis 46 is retained without inventing child-parenthood dates to fit them.");
patriarch("ot-joseph-service", "Joseph in Potiphar's house and prison", ["GEN.37.2", "GEN.39.1", "GEN.39.20", "GEN.41.46"], "The possible-date envelope runs from Joseph's sale at 17 to appointment at 30. It is not thirteen years spent entirely in prison; the lengths of the individual stages are not supplied.", ["joseph-sold"], ["joseph-appointed"], "date-window");
patriarch("ot-prison-dreams", "The butler's and baker's dreams", ["GEN.40.1", "GEN.40.20", "GEN.41.1"], "Pharaoh's dream follows two full years later. Counting back from Joseph's appointment supplies a working year for the prison dreams, not his imprisonment's starting date.", ["joseph-appointed", -2]);
patriarch("ot-plenty", "Seven plentiful years in Egypt", ["GEN.41.29", "GEN.41.46", "GEN.41.47", "GEN.41.53"], "Seven plentiful years follow Joseph's appointment in the shared age calculation. Calendar labels allow annual rounding; no Egyptian ruler is identified merely by this fit.", ["joseph-appointed"], ["joseph-appointed", 7], "period");
patriarch("ot-famine", "Seven famine years and Joseph's administration", ["GEN.41.54", "GEN.45.6", "GEN.47.13", "GEN.47.23"], "Seven famine years follow the plenty. Jacob's family arrives after two famine years; later administrative episodes are not all assigned the arrival year. The bar represents the stated famine, not a date for every transaction.", ["ot-plenty", 0, "end"], ["ot-plenty", 7, "end"], "period");
patriarch("ot-brothers-egypt", "Joseph's brothers travel to Egypt", ["GEN.42.1", "GEN.43.1", "GEN.44.1", "GEN.45.6"], "The first and second visits fall within the early famine narrative before Joseph's disclosure in its second year. The precise months between journeys are not supplied.", ["ot-famine"], ["ot-famine", 2], "date-window");
patriarch("ot-joseph-revealed", "Joseph makes himself known", ["GEN.45.1", "GEN.45.6", "GEN.45.11"], "Joseph names two famine years past and five remaining. The working year follows seven plentiful years and those two famine years after appointment at 30.", ["joseph-appointed", 9]);
patriarch("ot-jacob-last", "Jacob's final blessings and death", ["GEN.47.28", "GEN.48.1", "GEN.49.1", "GEN.49.33"], "Jacob lives seventeen years in Egypt and dies at 147. The closing blessings belong to this final period; their words about the tribes' future are not dated as fulfillment in this year.", ["jacob_183", 0, "end"]);
patriarch("ot-jacob-burial", "Jacob is buried at Machpelah", ["GEN.50.2", "GEN.50.3", "GEN.50.13"], "The burial follows Jacob's death. Forty days of embalming and seventy days of mourning are preserved without assuming they must be added together. The year-level window allows a calendar boundary.", ["jacob_183", 0, "end"], ["jacob_183", 1, "end"], "date-window");
patriarch("ot-joseph-death", "The death of Joseph", ["GEN.50.24", "GEN.50.25", "GEN.50.26"], "Joseph dies at 110. His request concerning his bones anticipates the Exodus and later burial; those events are not dated to his death.", ["joseph_205", 0, "end"]);

journey("ot-oppression", "Israel enslaved in Egypt", ["EXO.1.6", "EXO.1.8", "EXO.1.11"], "The oppression follows a change of king, but its starting year is not stated. The entire sojourn is not treated as slavery, and no Pharaoh is identified by a speculative name match.");
journey("ot-moses-birth", "The birth and rescue of Moses", ["EXO.2.1", "EXO.2.10", "EXO.7.7"], "Moses is eighty when he speaks to Pharaoh. His birth is placed about eighty years before the Exodus; the rescue follows in infancy.", ["exodus", -80]);
journey("ot-moses-midian", "Moses flees to Midian", ["EXO.2.11", "EXO.2.15", "ACT.7.23", "ACT.7.30"], "Stephen places the visit to his brethren at forty and the burning bush forty years later. These KJV intervals supply the working year; the marriage and children's births are not individually dated.", ["exodus", -40]);
journey("ot-burning-bush", "Moses called at the burning bush and sent to Egypt", ["EXO.3.1", "EXO.3.10", "EXO.4.20", "ACT.7.30", "EXO.7.7"], "The call and return are placed around the Exodus year using Moses's age and Stephen's forty-year interval. The individual journeys have no exact calendar dates.", ["exodus"]);
journey("ot-plagues", "Pharaoh confronted; the plagues in Egypt", ["EXO.5.1", "EXO.6.1", "EXO.7.7", "EXO.7.20", "EXO.11.1", "EXO.12.29"], "The confrontations and successive plagues precede departure. This working year groups the sequence at annual resolution, not on one day; neither its full duration nor individual plague months are supplied.", ["exodus"]);
journey("ot-passover", "The first Passover", ["EXO.12.2", "EXO.12.6", "EXO.12.11", "EXO.12.29", "EXO.12.51"], "The first month and fourteenth-day instructions belong to the departure narrative. The annual observances commanded for later generations are not all events in this year.", ["exodus"]);
journey("ot-sea", "The sea crossing and song of deliverance", ["EXO.13.17", "EXO.14.21", "EXO.14.22", "EXO.15.1", "EXO.15.23"], "The crossing follows departure, before arrival at Sinai. The song and journey to Marah belong to the same early journey, without an asserted exact interval.", ["exodus"]);
journey("ot-manna", "Manna, water, and the battle with Amalek", ["EXO.16.1", "EXO.16.14", "EXO.17.6", "EXO.17.8"], "Exodus 16 dates arrival in the wilderness of Sin to the second month, fifteenth day after departure. Rephidim follows before Sinai; the later forty-year manna summary does not make this episode forty years long.", ["exodus"]);
journey("ot-jethro", "Jethro visits; judges are appointed", ["EXO.18.5", "EXO.18.17", "EXO.18.25", "DEU.1.6", "DEU.1.9"], "The visit is at the mount of God. The relation of this account to the Sinai legislation is not settled by its chapter position; it remains undated within the wilderness setting.");
journey("ot-tabernacle-instructions", "Instructions for the tabernacle and priesthood", ["EXO.24.18", "EXO.25.8", "EXO.31.18"], "The instructions follow the Sinai covenant narrative during Moses's forty days on the mount. These are instructions for making and using the sanctuary, not a claim that it was already erected.", ["exodus"]);
journey("ot-calf", "The golden calf and covenant renewal", ["EXO.32.1", "EXO.32.19", "EXO.34.1", "EXO.34.28"], "These successive Sinai episodes follow the first tablets. Forty-day intervals are days within the narrative, not years or independently dated calendar spans.", ["exodus"]);
journey("ot-tabernacle-building", "The tabernacle is made", ["EXO.35.4", "EXO.36.1", "EXO.39.32", "EXO.40.17"], "Construction precedes erection in the second year. The possible-year window allows that boundary; it is not a measured one-year building duration.", ["exodus"], ["exodus", 1], "date-window");
journey("ot-tabernacle-raised", "The tabernacle is erected", ["EXO.40.2", "EXO.40.17", "EXO.40.34"], "Explicitly the second year, first month, first day. This is earlier in the second year than the census opening Numbers, even though Numbers later recalls its dedication.", ["exodus", 1]);
journey("ot-leviticus-law", "Instruction at the sanctuary and Sinai", ["LEV.1.1", "LEV.27.34", "EXO.40.17", "NUM.10.11"], "Leviticus presents laws at the tabernacle and Mount Sinai. The window gives the Sinai setting across the first two calendar years, not separate dates for every command. Future feasts, jubilees, and penalties are prescriptions, not all events observed then.", ["exodus"], ["exodus", 1], "date-window");
journey("ot-priests-consecrated", "Aaron and his sons consecrated; service begins", ["LEV.8.33", "LEV.9.1", "LEV.9.23", "EXO.40.17"], "The narrative gives seven days of consecration followed by service on the eighth day. Placed in the tabernacle's second-year setting without assigning an unstated starting day of the month.", ["exodus", 1]);
journey("ot-nadab-abihu", "The deaths of Nadab and Abihu", ["LEV.10.1", "LEV.10.2", "LEV.16.1"], "The deaths follow the inauguration narrative. The second-year setting is approximate; no separate calendar day is supplied. The later Day of Atonement instructions are not thereby an observance on this day.", ["exodus", 1]);
journey("ot-first-census", "The first wilderness census and camp order", ["NUM.1.1", "NUM.1.2", "NUM.2.2", "NUM.3.14", "NUM.4.46"], "The opening census is explicitly in the second year, second month, first day. The adjacent tribal and Levitical arrangements belong to this camp setting; earlier deaths recalled in Numbers 3 are not new occurrences.", ["exodus", 1]);
journey("ot-camp-law", "Camp purity, blessing, and Levitical service", ["NUM.5.1", "NUM.6.22", "NUM.8.5", "NUM.10.11"], "These instructions and preparations are presented with the Sinai camp before departure in the second year. Chapter order does not establish an exact day for each command.", ["exodus", 1]);
journey("ot-dedication", "Offerings at the tabernacle's dedication", ["NUM.7.1", "NUM.7.10", "NUM.7.12", "NUM.7.78", "EXO.40.17"], "Numbers 7 returns to the tabernacle's erection and dedication, earlier than the second-month census opening Numbers. Twelve successive offering days are described; the chart does not convert them into years or assert an unstated starting date.", ["exodus", 1]);
journey("ot-second-passover", "Passover in the second year", ["NUM.9.1", "NUM.9.5", "NUM.9.11"], "The first-month Passover precedes the second-month census of Numbers 1. The second-month provision concerns those unable to keep it at the appointed time; it is distinguished from the first-month observance.", ["exodus", 1]);
journey("ot-sinai-departure", "Departure from Sinai", ["NUM.10.11", "NUM.10.12", "NUM.10.33"], "Second year, second month, twentieth day. The three-day journey begins this movement; the working calendar year follows the explicit second-year marker.", ["exodus", 1]);
journey("ot-complaints", "Complaints, quails, and Miriam's exclusion", ["NUM.11.1", "NUM.11.31", "NUM.12.10", "NUM.12.15", "NUM.12.16"], "Placed in the departure-to-Kadesh sequence of the second year. Miriam is shut out seven days; no month or exact date is invented for these successive incidents.", ["exodus", 1]);
journey("ot-spies", "The spies and refusal to enter Canaan", ["NUM.13.25", "NUM.14.33", "NUM.14.34", "DEU.2.14", "JOS.14.7", "JOS.14.10"], "Forty days of searching precede the judgment. The second-year placement agrees with the thirty-eight years from Kadesh to Zered and Caleb's later recollection. The forty-year wilderness total is not forty additional years after this point.", ["exodus", 1]);
journey("ot-wilderness-law", "Laws and episodes during the wilderness years", ["NUM.15.1", "NUM.15.32", "NUM.18.1", "NUM.19.1"], "These chapters do not each supply a year. Instructions for future life in the land and the Sabbath-breaker episode are not all forced into the year of the spies.");
journey("ot-korah", "Korah's rebellion and Aaron's rod", ["NUM.16.1", "NUM.16.31", "NUM.17.8"], "The rebellion and confirming sign have no explicit year. Their position after the spies does not establish a second-year date.");
journey("ot-final-wilderness", "The final wilderness journeys", ["NUM.20.1", "NUM.20.12", "NUM.20.22", "NUM.33.38", "DEU.2.14"], "The final-year setting is inferred through Aaron's death in year forty and the thirty-eight-year Kadesh-to-Zered interval. Numbers 20 gives a first month without naming its year. The window allows inclusive-year counting against the shared forty-year Exodus-to-Jordan model.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-aaron-death", "The death of Aaron", ["NUM.20.28", "NUM.20.29", "NUM.33.38", "NUM.33.39"], "Aaron dies at 123 in the fortieth year, fifth month, first day. Uses the shared lifespan's rounded final-wilderness year; inclusive regnal/calendar counting can shift the BC label by a year.", ["aaron_361", 0, "end"]);
journey("ot-transjordan", "The brasen serpent and victories east of Jordan", ["NUM.21.9", "NUM.21.12", "NUM.21.24", "NUM.21.35", "DEU.2.14"], "These are successive final-wilderness episodes, including Sihon and Og. The possible-year envelope accommodates the final-year calendar boundary, not a measured duration of each battle.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-balaam", "Balak and Balaam in Moab", ["NUM.22.1", "NUM.22.5", "NUM.23.7", "NUM.24.17"], "Placed in Moab before entry into Canaan. The oracles' future star and other predictions are not shown as fulfilled in the year they are spoken.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-peor", "The apostasy at Peor", ["NUM.25.1", "NUM.25.9", "NUM.25.11", "1CO.10.8"], "The episode belongs to the closing Moab narrative before the second census. Numbers gives twenty-four thousand in the plague; the recalled warning in 1 Corinthians 10:8 specifies twenty-three thousand in one day. Both KJV statements are retained. The final-wilderness window does not supply an exact day.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-moab-preparations", "The second census and preparations in Moab", ["NUM.26.1", "NUM.26.63", "NUM.27.18", "NUM.36.13"], "The census, inheritance cases, appointment of Joshua, and later instructions belong to the final Moab setting. Feast and boundary instructions describe future arrangements, not all their later observance or occupation.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-midian-east", "Midian campaign and the eastern tribal settlement", ["NUM.31.1", "NUM.31.2", "NUM.32.1", "NUM.32.33"], "Before Moses's death, these closing episodes concern Midian and land east of Jordan. The eastern tribes' promise to help across Jordan anticipates later action.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-deuteronomy", "Moses's final addresses in Moab", ["DEU.1.3", "DEU.1.5", "DEU.31.2", "DEU.31.24"], "The addresses begin in the fortieth year, eleventh month, first day. The possible-year window allows inclusive counting against the shared forty-year model. Recalled journeys, laws, blessings, and prophecies are not all events fulfilled at the time of the speech.", ["exodus", 39], ["exodus", 40], "date-window");
journey("ot-moses-death", "The death of Moses", ["DEU.34.5", "DEU.34.7", "DEU.34.8", "JOS.4.19"], "Moses dies at 120, before the Jordan crossing. Thirty days of mourning follow. The shared chronology rounds these final episodes to the entry year; it does not claim they occurred on the same day.", ["moses_356", 0, "end"]);
journey("ot-joshua-commission", "Joshua commissioned; spies sent to Jericho", ["JOS.1.1", "JOS.1.2", "JOS.2.1", "JOS.3.1"], "These preparations follow Moses's death and immediately precede the Jordan crossing. Joshua's earlier designation in Numbers 27 is a separate episode.", ["jordan"]);
journey("ot-gilgal", "Circumcision and Passover at Gilgal", ["JOS.4.19", "JOS.5.2", "JOS.5.10", "JOS.5.12"], "After crossing on the first month's tenth day, Israel keeps Passover on the fourteenth. Manna ceases; this is the entry year, not the first Passover in Egypt.", ["jordan"]);
journey("ot-jericho", "The fall of Jericho", ["JOS.6.1", "JOS.6.4", "JOS.6.15", "JOS.6.20"], "Placed after the entry-year Passover in the narrative. The seven-day march is explicit; an exact BC day and Joshua's age here are not supplied.", ["jordan"]);
journey("ot-conquest", "The conquest campaigns and early allotment", ["JOS.7.1", "JOS.8.1", "JOS.10.1", "JOS.11.18", "JOS.14.7", "JOS.14.10"], "The envelope links entry to Caleb's claim forty-five years after the spies. It gives about six years in the shared annual model, with rounding allowance. Joshua fought a long time; individual campaigns are not each assigned this full duration.", ["jordan"], ["caleb-hebron"], "period");
journey("ot-allotments", "The land allotments, Shiloh, and refuge cities", ["JOS.13.1", "JOS.18.1", "JOS.20.1", "JOS.21.43"], "These chapters describe tribal boundaries, remaining land, and cities. Caleb's dated claim is background; it does not prove every allotment or the Shiloh assembly occurred in precisely that year.");
journey("ot-eastern-altar", "The eastern tribes return; the altar dispute", ["JOS.22.1", "JOS.22.9", "JOS.22.10", "JOS.22.34"], "The tribes are dismissed after assisting their brethren. No interval from the entry or a calendar year for the altar is stated.");
journey("ot-joshua-farewell", "Joshua's farewell and the covenant at Shechem", ["JOS.23.1", "JOS.23.2", "JOS.24.1", "JOS.24.25"], "Joshua 23 says a long time has passed. The speech and Shechem covenant are not dated by assuming Joshua's unstated age at the crossing.");
journey("ot-joshua-death", "Joshua dies; closing burial notices", ["JOS.24.29", "JOS.24.32", "JOS.24.33"], "Joshua dies at 110, but a BC birth or death year is not supplied. Joseph's bones and Eleazar's burial are closing notices, not evidence that all three men died together.");

const judgesNote = " The KJV's periods are retained without adding all regional oppression, rest, and judgeship intervals into a single BC chain. Their reconciliation with 1 Kings 6:1 and Acts 13:20 remains unresolved.";
const judge = (id: string, label: string, references: string[], note: string) => journey(id, label, [...references, "1KI.6.1", "ACT.13.20"], note + judgesNote, undefined, undefined, "period");
journey("ot-judges-opening", "Tribal conquests and the transition after Joshua", ["JDG.1.1", "JDG.1.12", "JDG.2.6", "JDG.2.8", "JOS.15.16"], "The opening survey includes episodes parallel to Joshua and recalls his death. Chapter order is not a second death or proof that every recounted conquest happened after it.");
judge("ot-othniel", "Othniel and deliverance from Chushanrishathaim", ["JDG.3.8", "JDG.3.11"], "Eight years of oppression and forty years of rest are stated.");
judge("ot-ehud", "Ehud and deliverance from Moab", ["JDG.3.14", "JDG.3.30"], "Eighteen years of servitude and eighty years of rest are stated.");
journey("ot-shamgar", "Shamgar delivers Israel", ["JDG.3.31", "JDG.5.6"], "No judgeship duration or absolute date is supplied for Shamgar; the song later recalls his days.");
judge("ot-deborah", "Deborah and Barak; the defeat of Sisera", ["JDG.4.3", "JDG.4.14", "JDG.5.31"], "Twenty years of oppression and forty years of rest are stated. The battle and its song are distinct from that whole interval.");
judge("ot-gideon", "Gideon and deliverance from Midian", ["JDG.6.1", "JDG.7.22", "JDG.8.28"], "Seven years under Midian and forty years of quiet in Gideon's days are stated.");
judge("ot-abimelech", "Abimelech's rule and fall", ["JDG.9.22", "JDG.9.53"], "Abimelech reigns three years; these are not supplied as BC endpoints.");
judge("ot-tola-jair", "Tola and Jair", ["JDG.10.2", "JDG.10.3"], "Tola judges twenty-three years and Jair twenty-two. They remain separately described durations within this chapter context.");
judge("ot-jephthah", "Ammonite oppression and Jephthah", ["JDG.10.8", "JDG.11.26", "JDG.12.7"], "Eighteen years of oppression and six years of Jephthah's judging are stated. His speech's three hundred years of Israelite occupation at Heshbon is preserved as an additional constraint, not silently fitted to a fabricated date.");
judge("ot-later-judges", "Ibzan, Elon, and Abdon", ["JDG.12.9", "JDG.12.11", "JDG.12.14"], "The stated judgeships are seven, ten, and eight years respectively; no birth dates or absolute reign endpoints are supplied.");
judge("ot-samson", "Samson during Philistine domination", ["JDG.13.1", "JDG.15.20", "JDG.16.31"], "Samson judges twenty years in the days of the Philistines. Those twenty years fall within Philistine domination, not automatically after the forty years in Judges 13:1.");
journey("ot-dan-migration", "Micah's images and Dan's migration", ["JDG.17.1", "JDG.18.1", "JDG.18.29", "JDG.18.30"], "No absolute date is given. The placement after Samson does not establish that sequence historically. The KJV names Manasseh in Judges 18:30; it is not silently replaced with another reading.");
journey("ot-benjamin-war", "Gibeah, the civil war, and Benjamin's survival", ["JDG.19.1", "JDG.20.28", "JDG.21.23", "JDG.21.25"], "Phinehas son of Eleazar son of Aaron is named, pointing to an earlier generation within Judges. These closing chapters are not automatically events after Samson; no BC year is asserted.");
journey("ot-ruth-return", "Naomi and Ruth return to Bethlehem", ["RUT.1.1", "RUT.1.4", "RUT.1.22"], "In the days of the judges, after about ten years in Moab, the women return at barley harvest. No particular judge or BC year is identified; the ten years are not Ruth's lifespan.");
journey("ot-ruth-gleaning", "Ruth gleans in Boaz's fields", ["RUT.2.1", "RUT.2.23"], "The gleaning continues through barley and wheat harvest in the return narrative. The season is known but the calendar year is not.");
journey("ot-ruth-threshing", "Ruth and Boaz at the threshing floor", ["RUT.3.2", "RUT.3.9", "RUT.3.18"], "The threshing-floor encounter follows the harvest narrative. It has no independently supplied BC date.");
journey("ot-ruth-redemption", "Boaz redeems; Obed is born", ["RUT.4.9", "RUT.4.13", "RUT.4.17", "RUT.4.22"], "The marriage and Obed's birth lead into the genealogy to David. The list does not give all generation lengths, and no uniform twenty-year rule is treated as measured history.");

export function buildOldTestamentContext(chronology: TimelineRecord[]): ContextTimelineRecord[] {
  return buildAnchoredContext(episodes, chronology);
}

// Explicit chapter topics and citations: supporting references on an anchor do
// not silently make that anchor the subject of every chapter that cites it.
type Chapter = [topic: string, ids: string, verses?: string, contextIds?: string, note?: string];
export const OT_CHAPTER_TIMELINE_MAP: Record<string, Record<number, ChapterMapping>> = {};
function chapters(book: string, code: string, rows: Chapter[]) {
  OT_CHAPTER_TIMELINE_MAP[book] = Object.fromEntries(rows.map(([topic, ids, verses = "1", contextIds = "", note = ""], index) => [index + 1, {
    ids: ids.split(" "), contextIds: contextIds ? contextIds.split(" ") : [],
    references: verses.split(" ").map(verse => `${code}.${index + 1}.${verse}`),
    note: `${topic}. ${note || "The entries describe selected chapter context; dates for individual episodes are distinguished from surrounding periods and unknown dates."}`,
  }]));
}
chapters("Genesis", "GEN", [
  ["Creation", "ot-creation", "1 26"],
  ["The seventh day and the garden", "ot-creation ot-eden", "2 8 22"],
  ["The transgression and expulsion", "ot-eden", "6 23", "ot-creation"],
  ["Cain, Abel, their descendants, and Seth", "ot-cain ot-seth-birth", "8 17 25"],
  ["The generations from Adam to Noah", "ot-genesis5", "3 27 32"],
  ["Violence on earth and the ark command", "ot-ark-preparation", "3 13 14", "flood"],
  ["The Flood begins", "flood", "6 11 24"],
  ["The waters abate and Noah leaves the ark", "flood ot-noah-covenant", "4 14 18"],
  ["The covenant, vineyard, and Noah's death", "ot-noah-covenant ot-noah-vineyard ot-noah-death", "13 20 29"],
  ["The table of nations", "ot-nations", "1 25 32"],
  ["Babel and the line to Abram", "ot-babel ot-genesis11", "9 10 32"],
  ["Abram enters Canaan and journeys to Egypt", "abram-canaan ot-abram-egypt", "4 10"],
  ["Return from Egypt and separation from Lot", "ot-abram-egypt ot-lot-separation", "1 11"],
  ["Lot rescued and Melchizedek encountered", "ot-lot-rescue", "14 18"],
  ["The promise and covenant", "ot-abraham-covenant", "6 13 18"],
  ["Hagar and Ishmael", "ot-ishmael-birth", "3 16"],
  ["The covenant sign and promised Isaac", "ot-circumcision", "1 19 24"],
  ["The visitors and Abraham's intercession", "ot-visitors-sodom", "10 23"],
  ["Sodom destroyed and Lot's family", "ot-visitors-sodom", "24 30 37", "", "The destruction's window does not date every later descendant mentioned at the chapter's close."],
  ["Abraham and Sarah at Gerar", "ot-abraham-gerar", "1 17"],
  ["Isaac's birth and later household episodes", "ot-isaac-birth ot-isaac-weaning", "5 8 14 32"],
  ["The offering of Isaac", "ot-isaac-offering", "2 9 19"],
  ["Sarah's death and Machpelah", "ot-sarah-death", "1 19"],
  ["Rebekah brought to Isaac", "ot-isaac-marriage", "4 67"],
  ["Closing patriarchal notices, the twins, and the birthright", "ot-abraham-death ot-ishmael-death ot-twins-birth ot-birthright", "7 17 26 33"],
  ["Isaac at Gerar and Esau's marriages", "ot-isaac-gerar ot-esau-wives", "1 28 34"],
  ["Isaac blesses Jacob; Esau's anger", "ot-jacob-haran", "27 41", "", "The Haran-year reconstruction is conditional; Jacob's age is not stated here."],
  ["Jacob departs and dreams at Bethel", "ot-jacob-haran", "10 12"],
  ["Jacob's marriages and the first sons", "ot-jacob-marriages ot-laban-service", "20 27 28 32", "", "Leah's week precedes Rachel's marriage; the second seven years are subsequent service, not a seven-year delay before marrying Rachel. Individual children's birth years are not supplied."],
  ["Jacob's household grows; Joseph is born; the flocks", "ot-joseph-birth ot-laban-service", "24 25 32"],
  ["Jacob leaves Laban", "ot-jacob-return ot-laban-service", "17 41"],
  ["Preparation to meet Esau and wrestling at Peniel", "ot-jacob-return", "3 24 28"],
  ["Jacob meets Esau and settles near Shechem", "ot-jacob-return", "4 17 18", "", "The return-year anchor concerns the reunion; later settlement stages need not all fall in that year."],
  ["Dinah and Shechem", "ot-dinah", "1 25"],
  ["Bethel, Rachel's death, and Isaac's closing notice", "ot-bethel-rachel ot-isaac-death", "1 19 28", "", "Isaac's death at 180 is later than Joseph's sale in Genesis 37 despite being narrated here. It does not date Rachel's death."],
  ["The generations and rulers of Edom", "ot-edom", "1 31"],
  ["Joseph's dreams and sale", "joseph-sold", "2 28"],
  ["Judah and Tamar", "ot-judah-tamar", "1 27"],
  ["Joseph in Potiphar's house and prison", "ot-joseph-service", "1 20"],
  ["The butler's and baker's dreams", "ot-prison-dreams", "5 20"],
  ["Joseph appointed; plenty and famine", "joseph-appointed ot-plenty ot-famine", "46 47 54"],
  ["The brothers' first visit to Egypt", "ot-brothers-egypt", "1 3"],
  ["Benjamin accompanies the second visit", "ot-brothers-egypt", "1 15"],
  ["The cup and Judah's plea", "ot-brothers-egypt", "2 18"],
  ["Joseph reveals himself", "ot-joseph-revealed", "1 6"],
  ["Jacob's household moves to Egypt", "egypt-entry", "6 27"],
  ["Settlement, famine administration, and Jacob's last years", "egypt-entry ot-famine ot-jacob-last", "9 13 28"],
  ["Jacob blesses Ephraim and Manasseh", "ot-jacob-last", "1 14"],
  ["Jacob's final blessings and death", "ot-jacob-last", "1 33"],
  ["Jacob's burial and Joseph's later death", "ot-jacob-burial ot-joseph-death", "3 13 26"],
]);
chapters("Exodus", "EXO", [
  ["Israel's growth and oppression", "ot-oppression", "6 8 11", "egypt-sojourn"],
  ["Moses's infancy and flight to Midian", "ot-moses-birth ot-moses-midian", "2 10 15"],
  ["The burning bush and commission", "ot-burning-bush", "2 10"],
  ["Signs, Aaron, and the return to Egypt", "ot-burning-bush", "20 27"],
  ["Pharaoh refuses and increases the burden", "ot-plagues", "1 7"],
  ["The renewed promise and Moses's family", "ot-plagues", "1 6 20", "", "The promise belongs to the deliverance narrative; the genealogy is earlier family background, not births all in the Exodus year."],
  ["The confrontation and water turned to blood", "ot-plagues", "7 20"],
  ["Frogs, lice, and flies", "ot-plagues", "6 17 24"],
  ["Murrain, boils, and hail", "ot-plagues", "6 10 23"],
  ["Locusts and darkness", "ot-plagues", "14 22"],
  ["The final plague announced", "ot-plagues", "1 4"],
  ["The Passover and departure", "ot-passover exodus", "6 29 41"],
  ["The firstborn instructions and departure route", "exodus ot-sea", "2 17 19"],
  ["The crossing of the sea", "ot-sea", "21 22"],
  ["The song and waters at Marah", "ot-sea", "1 23"],
  ["Manna in the wilderness of Sin", "ot-manna", "1 14 35"],
  ["Water at Rephidim and Amalek", "ot-manna", "6 8"],
  ["Jethro's visit and delegated judgment", "ot-jethro", "5 25", "sinai-law"],
  ["Arrival at Sinai and covenant preparation", "sinai-law", "1 5"],
  ["The ten commandments", "sinai-law", "1 3 18"],
  ["Judgments concerning servants and injury", "sinai-law", "1 2 12"],
  ["Restitution and responsibilities to neighbours", "sinai-law", "1 21"],
  ["Justice, sacred seasons, and the promised way", "sinai-law", "1 14 20"],
  ["The covenant confirmed and Moses on the mount", "sinai-law ot-tabernacle-instructions", "8 18"],
  ["The ark, table, and candlestick instructions", "ot-tabernacle-instructions", "8 10 23 31"],
  ["The tabernacle curtains and boards", "ot-tabernacle-instructions", "1 15"],
  ["The altar, court, and lamp oil", "ot-tabernacle-instructions", "1 9 20"],
  ["The priestly garments", "ot-tabernacle-instructions", "2 6"],
  ["Instructions for consecrating priests", "ot-tabernacle-instructions", "1 35", "", "These are consecration instructions; the performed ceremony is narrated in Leviticus 8."],
  ["Incense, ransom, laver, and anointing oil", "ot-tabernacle-instructions", "1 12 18 23"],
  ["Craftsmen, Sabbath, and tablets", "ot-tabernacle-instructions", "2 13 18"],
  ["The golden calf", "ot-calf", "4 19"],
  ["Intercession and the promised presence", "ot-calf", "12 14"],
  ["New tablets and covenant renewal", "ot-calf", "1 28"],
  ["Offerings and workers for the sanctuary", "ot-tabernacle-building", "4 30"],
  ["Construction begins", "ot-tabernacle-building", "1 8"],
  ["The sanctuary furnishings made", "ot-tabernacle-building", "1 10 17"],
  ["The altar, laver, court, and accounts", "ot-tabernacle-building", "1 8 21"],
  ["Garments completed and work inspected", "ot-tabernacle-building", "1 32 43"],
  ["The tabernacle erected and filled with glory", "ot-tabernacle-raised", "17 34"],
]);
chapters("Leviticus", "LEV", [
  ["Burnt offering instructions", "ot-leviticus-law", "1 3"],
  ["Meat offering instructions", "ot-leviticus-law", "1"],
  ["Peace offering instructions", "ot-leviticus-law", "1"],
  ["Sin offering instructions", "ot-leviticus-law", "2 3"],
  ["Trespass and atonement instructions", "ot-leviticus-law", "5 15"],
  ["Restitution and the priests' offering duties", "ot-leviticus-law", "4 9"],
  ["Trespass and peace offering duties", "ot-leviticus-law", "1 11"],
  ["Aaron and his sons consecrated", "ot-priests-consecrated", "6 33"],
  ["The eighth-day priestly service", "ot-priests-consecrated", "1 23"],
  ["Nadab and Abihu; priestly responsibilities", "ot-nadab-abihu", "1 2 10"],
  ["Clean and unclean creatures", "ot-leviticus-law", "2"],
  ["Purification after childbirth", "ot-leviticus-law", "2"],
  ["Examination of leprosy and affected garments", "ot-leviticus-law", "2 47"],
  ["Cleansing and affected houses", "ot-leviticus-law", "2 34"],
  ["Bodily discharges and cleansing", "ot-leviticus-law", "2 31"],
  ["The annual Day of Atonement instructions", "ot-leviticus-law", "1 29 34", "ot-nadab-abihu", "The command follows the sons' deaths and specifies the seventh month, tenth day. It does not narrate an immediate observance at the inauguration of the tabernacle."],
  ["Sacrifice and the prohibition of blood", "ot-leviticus-law", "3 11"],
  ["Forbidden relationships", "ot-leviticus-law", "3 6"],
  ["Holiness and love of neighbour", "ot-leviticus-law", "2 18"],
  ["Penalties and separation from surrounding practices", "ot-leviticus-law", "2 26"],
  ["Priestly holiness", "ot-leviticus-law", "1 6"],
  ["Holy gifts and acceptable offerings", "ot-leviticus-law", "2 19"],
  ["The appointed feasts", "ot-leviticus-law", "2 5 24 34", "", "This is the calendar prescribed for future recurring observance, not a year-long event already completed at Sinai."],
  ["Lamps, shewbread, and the blasphemer's case", "ot-leviticus-law", "2 5 11 23", "", "The case is narrated in the camp but has no exact day; the broad Sinai setting is not a separate date for each law or incident."],
  ["Sabbatical years and jubilees", "ot-leviticus-law", "1 4 10", "", "The future land-rest and jubilee cycles are commanded here; no first jubilee observance is dated from this chapter."],
  ["Covenant blessings and warnings", "ot-leviticus-law", "3 14 46"],
  ["Vows, valuations, and devoted things", "ot-leviticus-law", "2 34"],
]);
chapters("Numbers", "NUM", [
  ["The second-year census", "ot-first-census", "1 2"],
  ["The tribal camp arrangement", "ot-first-census", "2"],
  ["The Levites and firstborn", "ot-first-census", "4 12 40"],
  ["Levitical service assignments", "ot-first-census", "3 46"],
  ["Camp purity, restitution, and jealousy", "ot-camp-law", "2 6 12"],
  ["The Nazarite vow and priestly blessing", "ot-camp-law", "2 23"],
  ["The dedication offerings", "ot-dedication", "1 12 78", "ot-tabernacle-raised", "This returns to the dedication earlier than the census of Numbers 1; the book is not everywhere in chronological chapter order."],
  ["The lamps and Levites' consecration", "ot-camp-law", "2 6"],
  ["Second-year Passover and the guiding cloud", "ot-second-passover", "1 5 11 17", "", "The first-month observance is earlier than the second-month census in Numbers 1; the cloud instructions describe an ongoing pattern."],
  ["Trumpets and departure from Sinai", "ot-sinai-departure", "2 11 33"],
  ["Complaints, the elders, and quails", "ot-complaints", "1 16 31"],
  ["Miriam and Aaron challenge Moses", "ot-complaints", "1 15"],
  ["The twelve spies", "ot-spies", "2 25"],
  ["Refusal to enter and the wilderness judgment", "ot-spies", "22 33 34", "wilderness"],
  ["Offerings, the Sabbath breaker, and fringes", "ot-wilderness-law", "2 32 38", "wilderness"],
  ["Korah's rebellion", "ot-korah", "1 31", "wilderness"],
  ["Aaron's rod buds", "ot-korah", "8", "wilderness"],
  ["Priests, Levites, and their provision", "ot-wilderness-law", "1 21", "wilderness"],
  ["The red heifer and purification", "ot-wilderness-law", "2 9", "wilderness"],
  ["Miriam, Meribah, Edom, and Aaron's death", "ot-final-wilderness ot-aaron-death", "1 12 21 28"],
  ["The brasen serpent and Transjordan victories", "ot-transjordan", "9 24 35"],
  ["Balak summons Balaam", "ot-balaam", "1 5"],
  ["Balaam's first blessings", "ot-balaam", "7 18"],
  ["Balaam's later oracles", "ot-balaam", "3 17"],
  ["Peor and Phinehas", "ot-peor", "1 9 11"],
  ["The census on the plains of Moab", "ot-moab-preparations", "2 63"],
  ["Inheritance and Joshua's appointment", "ot-moab-preparations", "7 18"],
  ["Daily, Sabbath, monthly, and feast offerings", "ot-moab-preparations", "2 9 16"],
  ["Seventh-month offerings", "ot-moab-preparations", "1 7 12"],
  ["Vows and household responsibilities", "ot-moab-preparations", "2"],
  ["The campaign against Midian", "ot-midian-east", "2 7"],
  ["The eastern tribes' settlement agreement", "ot-midian-east", "5 20 33"],
  ["The itinerary from Egypt and instructions for the land", "wilderness ot-aaron-death ot-moab-preparations", "3 38 50", "", "The itinerary recalls the whole journey. Aaron's fortieth-year death and the current Moab instructions are distinguished from the earlier stops."],
  ["The land's borders and allotment leaders", "ot-moab-preparations", "2 17"],
  ["Levitical and refuge cities commanded", "ot-moab-preparations", "2 11"],
  ["Inheritance within the tribes", "ot-moab-preparations", "6 13"],
]);
chapters("Deuteronomy", "DEU", [
  ["Moses recalls Horeb, judges, and the spies", "ot-deuteronomy", "3 6 22", "sinai-law ot-spies"],
  ["The journey past Edom and Moab; Sihon", "ot-deuteronomy", "1 14 24", "ot-transjordan"],
  ["Og, eastern allotments, and Moses's plea", "ot-deuteronomy", "1 12 23", "ot-transjordan ot-midian-east"],
  ["Remember the covenant and avoid idolatry", "ot-deuteronomy", "1 9 15"],
  ["The ten commandments recalled", "ot-deuteronomy", "2 6", "sinai-law"],
  ["Love the LORD and teach his words", "ot-deuteronomy", "4 5 7"],
  ["Life among the nations in the promised land", "ot-deuteronomy", "1 6"],
  ["Remember the wilderness and beware prosperity", "ot-deuteronomy", "2 11", "wilderness"],
  ["Remember the golden calf and intercession", "ot-deuteronomy", "7 16 25", "ot-calf"],
  ["The tablets renewed and the call to obedience", "ot-deuteronomy", "1 12", "ot-calf", "The speech recalls earlier tablets and journeys; the parenthetical Aaron notice is not dated to the renewal of the tablets."],
  ["Blessing, curse, and the coming land", "ot-deuteronomy", "8 26"],
  ["The chosen place of worship", "ot-deuteronomy", "5 11"],
  ["False prophets and idolatry", "ot-deuteronomy", "1 6"],
  ["Clean food and tithes", "ot-deuteronomy", "3 22"],
  ["Release, generosity, and firstlings", "ot-deuteronomy", "1 7 19"],
  ["Feasts and judges", "ot-deuteronomy", "1 9 13 18"],
  ["Judgment and the law for a king", "ot-deuteronomy", "8 14", "", "The kingship instructions anticipate a future circumstance; they are not an accession dated to Moses's address."],
  ["Priests and the promised prophet", "ot-deuteronomy", "1 15"],
  ["Refuge cities, landmarks, and witnesses", "ot-deuteronomy", "2 14 15"],
  ["Conduct in war", "ot-deuteronomy", "1 10"],
  ["Unsolved murder and household judgments", "ot-deuteronomy", "1 15"],
  ["Neighbourly duties and marriage cases", "ot-deuteronomy", "1 13"],
  ["Assembly, camp, and community obligations", "ot-deuteronomy", "1 9 19"],
  ["Family, justice, and provision for the vulnerable", "ot-deuteronomy", "1 14 19"],
  ["Justice, family duties, weights, and Amalek", "ot-deuteronomy", "1 5 13 17", "ot-manna"],
  ["Firstfruits and the covenant declaration", "ot-deuteronomy", "2 5 17", "", "The prescribed firstfruits confession retells the ancestors' story; its performance in the land is future."],
  ["The altar, law stones, and covenant curses commanded", "ot-deuteronomy", "2 4 12", "", "The command anticipates the ceremony narrated in Joshua 8, rather than placing that later ceremony in Moab."],
  ["Blessings and curses", "ot-deuteronomy", "1 15 64"],
  ["Covenant renewal in Moab", "ot-deuteronomy", "1 10"],
  ["Restoration and the choice of life", "ot-deuteronomy", "1 19"],
  ["Joshua charged and the law entrusted", "ot-deuteronomy", "2 7 24"],
  ["The song of Moses and command to ascend", "ot-deuteronomy", "1 48 49"],
  ["Moses blesses the tribes", "ot-deuteronomy", "1"],
  ["Moses's death and mourning", "ot-moses-death", "5 7 8"],
]);
chapters("Joshua", "JOS", [
  ["Joshua's commission after Moses", "ot-joshua-commission", "1 2"],
  ["The spies and Rahab", "ot-joshua-commission", "1 9"],
  ["Israel crosses the Jordan", "jordan", "14 17"],
  ["Memorial stones and arrival at Gilgal", "jordan", "9 19"],
  ["Circumcision and Passover at Gilgal", "ot-gilgal", "2 10 12"],
  ["Jericho falls", "ot-jericho", "4 20"],
  ["Defeat at Ai and Achan's sin", "ot-conquest", "1 5 20", "", "The campaign envelope supplies context, not a six-year duration for this incident."],
  ["Ai taken and the law read at Ebal", "ot-conquest", "1 30 34"],
  ["The Gibeonite agreement", "ot-conquest", "3 15"],
  ["Gibeon and the southern campaign", "ot-conquest", "6 12 40"],
  ["The northern campaign and the long war", "ot-conquest", "5 18"],
  ["The defeated kings surveyed", "ot-conquest", "1 7", "ot-transjordan", "The list looks back both east and west of Jordan; it does not supply individual kings' reign dates."],
  ["Remaining land and eastern inheritances", "ot-allotments", "1 8", "ot-midian-east"],
  ["Caleb's claim at eighty-five", "caleb-hebron", "7 10 12", "ot-spies"],
  ["Judah's allotment and Caleb's household", "ot-allotments", "1 13 16", "caleb-hebron"],
  ["Ephraim's allotment", "ot-allotments", "1 5"],
  ["Manasseh's allotment", "ot-allotments", "1 3"],
  ["Shiloh, the survey, and Benjamin's allotment", "ot-allotments", "1 8 11"],
  ["The remaining tribal allotments", "ot-allotments", "1 10 49"],
  ["The cities of refuge appointed", "ot-allotments", "2 7"],
  ["Levitical cities and the promise of rest", "ot-allotments", "3 43 44"],
  ["The eastern tribes' return and altar", "ot-eastern-altar", "9 10 34"],
  ["Joshua's farewell after a long time", "ot-joshua-farewell", "1 2"],
  ["The Shechem covenant and closing burial notices", "ot-joshua-farewell ot-joshua-death", "1 25 29 32 33"],
]);
chapters("Judges", "JDG", [
  ["Tribal conquests and incomplete occupation", "ot-judges-opening", "1 12 21"],
  ["The transition from Joshua and recurring decline", "ot-judges-opening", "6 8 16"],
  ["Othniel, Ehud, and Shamgar", "ot-othniel ot-ehud ot-shamgar", "8 11 14 30 31"],
  ["Deborah, Barak, and Sisera", "ot-deborah", "3 14"],
  ["The song of Deborah and Barak", "ot-deborah", "1 31", "ot-shamgar"],
  ["Midianite oppression and Gideon's call", "ot-gideon", "1 14"],
  ["Gideon's reduced army and victory", "ot-gideon", "7 22"],
  ["Gideon's later actions and Israel's rest", "ot-gideon", "21 28"],
  ["Abimelech's rule and fall", "ot-abimelech", "22 53"],
  ["Tola, Jair, and oppression", "ot-tola-jair ot-jephthah", "2 3 8"],
  ["Jephthah's negotiations, vow, and victory", "ot-jephthah", "26 30 32"],
  ["Jephthah's closing years and later judges", "ot-jephthah ot-later-judges", "7 9 11 14"],
  ["Philistine domination and Samson's birth announced", "ot-samson", "1 5 24", "", "The forty years describe Philistine domination; Samson's birth is not assigned an unstated year within it."],
  ["Samson's marriage and riddle", "ot-samson", "1 12"],
  ["Samson's conflicts and twenty years of judging", "ot-samson", "15 20"],
  ["Delilah and Samson's death", "ot-samson", "4 30 31"],
  ["Micah's household shrine", "ot-dan-migration", "1 5"],
  ["Dan's migration and the city of Dan", "ot-dan-migration", "1 29 30"],
  ["The outrage at Gibeah", "ot-benjamin-war", "1 25"],
  ["War with Benjamin", "ot-benjamin-war", "1 28 48"],
  ["Benjamin's survival after the war", "ot-benjamin-war", "1 23 25"],
]);
chapters("Ruth", "RUT", [
  ["Naomi and Ruth return", "ot-ruth-return", "1 4 22"],
  ["Gleaning through the harvests", "ot-ruth-gleaning", "3 23"],
  ["At the threshing floor", "ot-ruth-threshing", "2 9"],
  ["Redemption, Obed, and the line to David", "ot-ruth-redemption", "9 13 22"],
]);

// Recalled episodes are background, not the writing date or the focus window
// used to select contemporary historical people.
OT_CHAPTER_TIMELINE_MAP["1 Corinthians"] = {
  10: { ids: [], contextIds: ["ot-sea", "wilderness", "ot-calf", "ot-peor"], references: ["1CO.10.1", "1CO.10.7", "1CO.10.8", "1CO.10.11"], note: "The earlier Exodus, wilderness, calf, and Peor accounts are background examples recalled by Paul. They retain their own chronology and do not move the letter's writing setting." },
};
OT_CHAPTER_TIMELINE_MAP.Hebrews = {
  11: { ids: [], contextIds: ["flood", "abram-canaan", "ot-isaac-offering", "ot-passover", "ot-jericho"], references: ["HEB.11.7", "HEB.11.8", "HEB.11.17", "HEB.11.28", "HEB.11.30"], note: "Selected earlier examples appear as background at their original dates, or remain undated. This does not assign a composition date to Hebrews or claim that all its witnesses lived together." },
};
