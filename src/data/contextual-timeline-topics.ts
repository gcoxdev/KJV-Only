/** Concise chapter subjects, reviewed against the KJV. One row per chapter;
 * these are navigation/context summaries, not exhaustive event inventories. */
export type BroadBookTopics = { book: string; code: string; topics: string[] };
const books: BroadBookTopics[] = [];
function book(name: string, code: string, rows: string) {
  const topics = rows.trim().split("\n").map((row, index) => {
    const match = /^(\d+) (.+)$/.exec(row.trim());
    if (!match || Number(match[1]) !== index + 1) throw new Error(`Nonconsecutive topic in ${name}: ${row}`);
    return match[2];
  });
  books.push({ book: name, code, topics });
}
book("Nehemiah", "NEH", `
1 News from Jerusalem and Nehemiah's prayer
2 The king's permission and inspection of Jerusalem
3 The wall's builders and their sections
4 Opposition, prayer, and guards during rebuilding
5 Debt relief and Nehemiah's conduct as governor
6 Conspiracies resisted and the wall completed
7 City appointments and the earlier returnee register
8 The law read and the feast of tabernacles kept
9 Fasting, confession, and Israel's history recalled
10 The sealed covenant and commitments for worship
11 Residents chosen for Jerusalem and the surrounding towns
12 Priestly generations, the wall dedication, and temple service
13 Nehemiah's later return and renewed reforms
`);
book("Esther", "EST", `
1 Ahasuerus's feasts and Vashti's removal
2 Esther made queen and Mordecai reports a plot
3 Haman's advancement and the decree against the Jews
4 Mordecai's appeal and Esther's decision to intercede
5 Esther approaches the king and invites him and Haman
6 The king's sleepless night and Mordecai honoured
7 Esther's petition and Haman's downfall
8 Mordecai's advancement and the counter-decree
9 Deliverance and the establishment of Purim
10 Tribute and Mordecai's standing in the kingdom
`);
book("Job", "JOB", `
1 Job in Uz, the heavenly challenge, and his losses
2 Job afflicted and his friends arrive
3 Job laments the day of his birth
4 Eliphaz's first answer and his account of a vision
5 Eliphaz urges Job to seek God and accept correction
6 Job describes his grief and appeals to his friends
7 Job's weariness and questions about his suffering
8 Bildad appeals to justice and earlier generations
9 Job considers God's power and the need for a daysman
10 Job pleads concerning his creation and affliction
11 Zophar accuses Job and urges repentance
12 Job answers concerning wisdom and God's sovereignty
13 Job challenges his friends and seeks an answer from God
14 Human frailty, death, and hope of renewal
15 Eliphaz's second answer and the wicked man's trouble
16 Job describes his friends as miserable comforters
17 Job's isolation and the approach of the grave
18 Bildad describes the wicked man's downfall
19 Job's abandonment and confidence in his living redeemer
20 Zophar speaks of the wicked man's short-lived triumph
21 Job observes that wicked people can prosper
22 Eliphaz accuses Job and calls him to return to God
23 Job longs to find God and present his case
24 Job describes oppression and apparently delayed judgment
25 Bildad contrasts God's dominion with human frailty
26 Job answers concerning God's power over creation
27 Job maintains his integrity and describes judgment
28 The search for wisdom and the fear of the LORD
29 Job recalls former honour and care for the needy
30 Job contrasts his present suffering with former respect
31 Job's final declaration of integrity
32 Elihu explains why he now speaks
33 Elihu addresses Job about suffering and God's instruction
34 Elihu defends God's justice
35 Elihu questions Job's reasoning about righteousness
36 Elihu speaks of divine instruction and greatness
37 Elihu considers God's power in the weather
38 The LORD answers Job from the whirlwind about creation
39 The LORD questions Job concerning the creatures
40 Job answers humbly; the LORD speaks of behemoth
41 The LORD describes leviathan
42 Job's response, the friends corrected, and restoration
`);
book("Psalms", "PSA", `
1 The righteous way and the wicked way
2 The nations' rebellion and the LORD's anointed
3 Trust and deliverance amid many enemies
4 An evening appeal and rest in safety
5 Morning prayer for guidance and protection
6 An appeal for mercy in weakness and sorrow
7 A plea for just judgment against persecutors
8 God's glory and humanity's place in creation
9 Praise for righteous judgment and refuge for the oppressed
10 An appeal against the wicked who oppress the poor
11 Trust in the LORD amid threatened foundations
12 Faithful words amid deceit and oppression
13 Lament, petition, and renewed trust
14 Corruption among mankind and hope for Israel's salvation
15 The character of those who dwell with the LORD
16 Refuge, inheritance, and hope beyond corruption
17 An appeal for protection and vindication
18 Thanksgiving for deliverance and victory
19 Creation's witness and the perfection of God's law
20 Prayer for the king in the day of trouble
21 Thanksgiving for the king's strength and deliverance
22 Suffering, an appeal for rescue, and worldwide praise
23 The LORD as shepherd and host
24 The earth, the holy hill, and the King of glory
25 Prayer for guidance, pardon, and deliverance
26 Integrity, examination, and love for God's house
27 Confidence in the LORD and seeking his presence
28 Petition for help and thanksgiving for answered prayer
29 The voice of the LORD in the storm
30 Thanksgiving for healing and restored joy
31 Refuge amid distress and trust in God's keeping
32 The blessing of forgiveness and instruction
33 Praise for creation, providence, and faithful hope
34 Praise for deliverance and an invitation to trust
35 An appeal for defense against hostile accusers
36 Human wickedness and God's lovingkindness
37 Patience when the wicked prosper
38 Confession and petition amid affliction
39 Life's brevity and hope in the LORD
40 Deliverance, willing obedience, and renewed need
41 Care for the poor and distress over betrayal
42 Thirst for God amid separation and discouragement
43 Prayer for light and return to God's altar
44 Earlier deliverance recalled amid present defeat
45 A royal wedding song
46 God as refuge amid upheaval
47 Praise to God as king over all the earth
48 Zion's beauty and God's protection
49 Wealth cannot ransom a person from death
50 God's judgment and the call to sincere worship
51 Confession and a plea for cleansing
52 Judgment on destructive speech and trust in mercy
53 Human corruption and the hope of restoration
54 A plea for rescue from strangers and oppressors
55 Betrayal, distress, and casting burdens upon the LORD
56 Trust in God amid fear and pursuit
57 Refuge beneath God's wings and steadfast praise
58 An appeal for justice against wicked judges
59 Protection from enemies and praise for God's strength
60 Defeat, appeal for restoration, and dependence on God
61 A cry from afar for refuge and preservation
62 Quiet trust in God rather than power or riches
63 Thirst for God and confidence in his help
64 A plea against secret plots and malicious speech
65 Praise for answered prayer and the fruitful earth
66 Remembered deliverance and testimony to answered prayer
67 A prayer for blessing and praise among all nations
68 God's triumph and care for his people
69 Distress, reproach, and a plea for rescue
70 An urgent appeal for help
71 Lifelong trust and prayer in old age
72 Prayer for righteous kingship and blessing to the nations
73 The prosperity of the wicked reconsidered in God's sanctuary
74 Lament over a devastated sanctuary
75 Thanksgiving for God's appointed judgment
76 God's victory and judgment from Zion
77 Distress answered by remembering God's earlier works
78 Israel's repeated rebellion and God's continuing care
79 Jerusalem's devastation and an appeal for mercy
80 A prayer for Israel's restoration using the vine image
81 Festival praise and the call to listen and obey
82 God's judgment of unjust rulers
83 An appeal against a coalition of enemies
84 Longing for the courts of the LORD
85 A prayer for renewed mercy, peace, and righteousness
86 A plea for mercy and an undivided heart
87 Zion and the nations counted among her people
88 A lament in deep darkness and isolation
89 The covenant with David and anguish over the king's humiliation
90 God's eternity, human frailty, and numbering our days
91 Trust in the refuge and protection of the Most High
92 Praise for God's works and the flourishing righteous
93 The LORD's enduring kingship and holiness
94 An appeal for justice and comfort amid oppression
95 Worship and a warning from the wilderness generation
96 A new song and the LORD's coming judgment
97 The LORD reigns; light and gladness for the righteous
98 Praise for salvation and righteous judgment
99 The holy king and remembered answers to prayer
100 Joyful worship and thanksgiving
101 A ruler's commitment to integrity
102 Affliction and hope for Zion under the eternal God
103 Praise for mercy, forgiveness, and compassion
104 Praise for creation and God's provision for living things
105 The patriarchal covenant, Egypt, and the Exodus recalled
106 Israel's sins and repeated merciful deliverances
107 Thanksgiving for rescue from varied troubles
108 Steadfast praise and an appeal for victory
109 An appeal concerning malicious accusers
110 The lord at God's right hand and priesthood after Melchizedek
111 Praise for God's works, covenant, and wisdom
112 The character and blessing of the righteous
113 The exalted LORD who lifts up the lowly
114 Creation responds to Israel's departure from Egypt
115 Trust in the living God rather than idols
116 Thanksgiving for deliverance from death
117 All nations called to praise the LORD
118 Thanksgiving for enduring mercy and deliverance
119 Love for God's word, instruction, and commandments
120 Distress among deceitful and hostile neighbours
121 The LORD as Israel's keeper
122 Prayer for Jerusalem's peace
123 Looking to the LORD for mercy
124 Escape and help from the maker of heaven and earth
125 Trust in the LORD and prayer for Israel's peace
126 Restored fortunes and hope amid tears
127 Dependence on the LORD in building, keeping, and family life
128 The blessing of fearing the LORD
129 Israel's afflictions and survival
130 A cry from the depths and hope in forgiveness
131 Humility and quiet hope
132 David's concern for the ark and the promise concerning Zion
133 The goodness of brethren dwelling in unity
134 A call to bless the LORD in his house
135 Praise for God's works and the emptiness of idols
136 Remembered acts of mercy from creation to deliverance
137 Exile by Babylon's rivers and the remembrance of Jerusalem
138 Thanksgiving for answered prayer and steadfast mercy
139 God's knowledge, presence, and searching of the heart
140 Deliverance from violent and deceitful people
141 Prayer for guarded speech and protection from evil
142 A cry for refuge in isolation
143 A plea for mercy, guidance, and deliverance
144 Prayer for victory and the people's well-being
145 Praise for God's greatness, goodness, and kingdom
146 Trust in the LORD who helps the oppressed
147 Praise for Jerusalem's restoration and God's providence
148 All creation summoned to praise
149 Israel's praise and the honour of God's saints
150 Everything that has breath called to praise the LORD
`);
book("Proverbs", "PRO", `
1 Wisdom's purpose, warnings against enticement, and wisdom's call
2 Seeking wisdom and protection from destructive paths
3 Trust in the LORD and wisdom in daily conduct
4 Holding to instruction and guarding the heart
5 Faithfulness in marriage and the danger of adultery
6 Surety, sloth, deceit, and adultery warned against
7 The young man drawn into adultery
8 Wisdom's public call and place beside creation
9 Wisdom and folly offer contrasting invitations
10 Sayings contrasting righteous and wicked conduct
11 Integrity, generosity, counsel, and honest dealings
12 Correction, diligence, speech, and righteous conduct
13 Instruction, diligence, wealth, and discipline
14 Wisdom and folly in the home and community
15 Speech, correction, counsel, and the fear of the LORD
16 Human plans, divine direction, and righteous leadership
17 Peace, friendship, speech, and justice
18 Speech, understanding, disputes, and friendship
19 Integrity, prudence, generosity, and correction
20 Honest measures, wise counsel, and integrity
21 Justice, diligence, and the LORD's direction
22 A good name, training, and the words of the wise
23 Restraint, instruction, and warnings about excess
24 Wisdom, justice, diligence, and further sayings of the wise
25 Solomon's proverbs copied by Hezekiah's men
26 Fools, sluggards, quarrels, and deceptive speech
27 Friendship, foresight, and care of one's responsibilities
28 Integrity, justice, generosity, and confession
29 Leadership, discipline, justice, and fear of man
30 The words of Agur and observations from creation
31 Lemuel's mother's instruction and the virtuous woman
`);
book("Ecclesiastes", "ECC", `
1 The Preacher's search amid life's repeated cycles
2 Pleasure, work, wisdom, and their limits
3 Appointed times, eternity, and mortal limits
4 Oppression, rivalry, companionship, and changing kingship
5 Reverence, vows, wealth, and contentment
6 Wealth without enjoyment and the limits of human desire
7 Wisdom, sorrow, patience, and human imperfection
8 Authority, delayed judgment, and the limits of understanding
9 The certainty of death and wise use of present life
10 Folly and wisdom in conduct, speech, and government
11 Generosity, uncertain outcomes, and counsel to the young
12 Remembering the Creator and the book's conclusion
`);
book("Song of Solomon", "SNG", `
1 Longing, praise, and the lovers' dialogue
2 Mutual delight and the invitation of spring
3 The search for the beloved and the royal procession
4 Praise of the beloved and the garden image
5 Separation, the search, and praise of the beloved
6 The garden, renewed praise, and the Shulamite
7 Praise and an invitation to the fields
8 Love's strength, family concerns, and the final invitation
`);
book("Isaiah", "ISA", `
1 Judah's rebellion and the call to genuine repentance
2 The mountain of the LORD and the humbling of human pride
3 Judgment on Jerusalem's leaders and proud society
4 Cleansing and the promised shelter over Zion
5 The vineyard song and warnings against wrongdoing
6 Isaiah's vision and commission in Uzziah's death year
7 Ahaz, the Syrian threat, and the sign of Immanuel
8 The Assyrian threat and the call to trust the LORD
9 Light, the promised child, and judgment on pride
10 Assyria as an instrument of judgment and the remnant's return
11 The branch from Jesse and the promised gathering
12 Songs of salvation and thanksgiving
13 The burden concerning Babylon
14 Babylon's king brought low and the burden concerning Palestina
15 Lament over Moab's devastation
16 Counsel and a three-year warning concerning Moab
17 The burden concerning Damascus and Israel
18 A message concerning the land beyond Ethiopia's rivers
19 Judgment and promised blessing concerning Egypt
20 Isaiah's sign during Sargon's Ashdod campaign
21 Visions concerning Babylon, Dumah, and Arabia
22 Jerusalem's misplaced confidence, Shebna, and Eliakim
23 The burden concerning Tyre and its seventy-year notice
24 Judgment on the earth and the LORD's reign
25 Praise for deliverance and the swallowing up of death
26 A song of trust, judgment, and resurrection hope
27 The vineyard, judgment, and Israel's gathering
28 Warnings to Ephraim and Jerusalem's rulers
29 Ariel's distress, spiritual blindness, and coming reversal
30 Trust in Egypt rebuked and restoration promised
31 A warning against reliance on Egypt's horses
32 Righteous rule, complacency rebuked, and promised peace
33 Distress, deliverance, and Zion's king
34 Judgment concerning the nations and Idumea
35 The rejoicing wilderness and the way of holiness
36 Assyria's challenge to Jerusalem under Hezekiah
37 Hezekiah's prayer, deliverance, and Sennacherib's later death
38 Hezekiah's illness, recovery, and thanksgiving
39 Babylonian envoys and the warning of future captivity
40 Comfort, the prepared way, and God's enduring greatness
41 The LORD's challenge to idols and assurance to Israel
42 The servant, justice, and Israel's blindness
43 Redemption, witness, and the promise of a new thing
44 The chosen people, powerless idols, and Cyrus named
45 Cyrus's commission and the LORD's unique sovereignty
46 Babylon's idols contrasted with the God who carries his people
47 Babylon's pride and coming humiliation
48 Israel's stubbornness and the call to leave Babylon
49 The servant's commission and Zion's promised restoration
50 The obedient servant and the call to trust in darkness
51 Comfort, remembered deliverance, and Zion's awakening
52 Good tidings, departure, and the servant's exaltation
53 The servant's suffering, death, and vindication
54 Restoration pictured as a renewed marriage
55 An invitation to seek the LORD and receive freely
56 Justice, sabbath, and welcome for the stranger and eunuch
57 Idolatry rebuked and comfort for the contrite
58 True fasting, justice, and sabbath observance
59 Sin, failed justice, and the coming redeemer
60 Zion's light and the gathering of nations
61 Good tidings, liberty, and restoration
62 Zion's promised new name and the watchmen's calling
63 Judgment and a prayer recalling former mercies
64 A plea for God's intervention and mercy
65 Judgment, a remnant, and the promise of new heavens and earth
66 True worship, judgment, and the gathering of nations
`);
book("Jeremiah", "JER", `
1 Jeremiah's call and the vision of coming northern judgment
2 Israel's forsaking of the LORD
3 Unfaithfulness and the call to return
4 Repentance urged as invasion approaches
5 Jerusalem's corruption and coming judgment
6 The approaching siege and rejected warnings
7 The temple sermon and the demand for changed conduct
8 False confidence, rejected wisdom, and lament
9 Grief over deceit and the true ground of boasting
10 Idols contrasted with the living God
11 The broken covenant and the plot against Jeremiah
12 Jeremiah's question about prosperity and the LORD's answer
13 The linen girdle, wine bottles, and warnings against pride
14 Drought, prayer, and false prophetic assurances
15 Judgment announced and Jeremiah's renewed commission
16 Signs of coming loss and promised return
17 Trust, the heart, and sabbath observance
18 The potter's house and the people's response
19 The broken vessel and judgment on Jerusalem
20 Pashur's attack and Jeremiah's anguish
21 Zedekiah's inquiry and the choice of surrender or death
22 Warnings concerning Judah's kings and royal conduct
23 False shepherds and prophets; the righteous Branch
24 The good and bad figs after Jeconiah's deportation
25 Jehoiakim's fourth year, seventy years, and the cup of judgment
26 Jeremiah's temple address and trial under Jehoiakim
27 Yokes, the named kings, and submission to Babylon
28 Hananiah's broken yoke and false promise
29 The letter to the exiles and the promise of return
30 Judgment, healing, and the restoration of Israel and Judah
31 Restoration and the promised new covenant
32 Jeremiah buys a field during the siege
33 Restoration, the Branch, and the enduring covenant
34 Zedekiah warned and the covenant concerning servants broken
35 The Rechabites' obedience contrasted with Judah's disobedience
36 Baruch's scroll read, burned, and written again
37 The siege interruption and Jeremiah's imprisonment
38 Jeremiah in the cistern and the final appeal to Zedekiah
39 Jerusalem taken and Jeremiah and Ebed-melech preserved
40 Jeremiah released and Gedaliah appointed
41 Gedaliah's assassination and the captives recovered
42 The remnant seeks counsel and is warned against Egypt
43 The flight into Egypt and the sign at Tahpanhes
44 Jeremiah addresses the Jews living in Egypt
45 The earlier fourth-year message to Baruch
46 Messages concerning Egypt, including Carchemish
47 The message concerning the Philistines before Gaza is struck
48 The message concerning Moab
49 Messages concerning Ammon, Edom, Damascus, Kedar, Hazor, and Elam
50 Babylon's coming judgment and Israel's restoration
51 Babylon's judgment and the scroll sent with Seraiah
52 Jerusalem's destruction, deportations, and Jehoiachin's later release
`);
book("Lamentations", "LAM", `
1 Jerusalem's desolation and appeal for compassion
2 The city's overthrow and an appeal to cry to the LORD
3 Affliction, hope in mercy, and self-examination
4 The siege's suffering and the humiliation of Zion
5 The community's prayer for remembrance and restoration
`);
book("Ezekiel", "EZK", `
1 The vision by Chebar in Jehoiachin's fifth captivity year
2 Ezekiel commissioned to speak to a rebellious people
3 The roll eaten and Ezekiel appointed a watchman
4 The portrayed siege and the sign of measured days and food
5 The divided hair as a sign of judgment
6 Judgment against idolatry in Israel's mountains
7 The announcement that the end has come
8 The sixth-year vision of abominations in Jerusalem
9 The marking and judgment seen in the vision
10 The cherubims and the departing glory
11 Judgment, promised renewal, and return from the vision
12 The sign of departing baggage and the approaching judgment
13 False prophets and deceptive assurances rebuked
14 Idolatrous elders, judgment, and the limits of intercession
15 Jerusalem compared to an unfruitful vine
16 Jerusalem's unfaithfulness pictured in a marriage history
17 The eagles, the vine, and the broken covenant
18 Personal responsibility and the call to turn and live
19 A lament for Israel's princes
20 Elders inquire in the seventh year; Israel's rebellion recalled
21 The sword, Babylon's divination, and Jerusalem's coming judgment
22 Jerusalem's bloodshed and corruption
23 Aholah and Aholibah as Samaria and Jerusalem
24 The siege-day sign of the pot and the death of Ezekiel's wife
25 Messages concerning Ammon, Moab, Edom, and Philistia
26 The eleventh-year message concerning Tyre
27 A lament over Tyre's trade and downfall
28 Tyre's prince and king; Sidon and Israel's promised security
29 Egypt's judgment and a later twenty-seventh-year message
30 Lament over Egypt and the eleventh-year broken-arm sign
31 Pharaoh compared to the fallen Assyrian cedar
32 Twelfth-year laments for Pharaoh and Egypt
33 The watchman and the fugitive's report of Jerusalem's fall
34 Israel's shepherds rebuked and a faithful shepherd promised
35 Judgment concerning mount Seir
36 The mountains of Israel and the promise of cleansing
37 The dry bones and the two sticks
38 The prophecy concerning Gog's attack
39 Gog's defeat and Israel's restoration
40 The twenty-fifth-year vision and the temple gates and courts
41 Measurements of the temple in the vision
42 The priests' chambers and the measured enclosure
43 The returning glory and the altar instructions
44 The shut gate and instructions for priests and Levites
45 The holy portion, just measures, and offerings
46 Worship arrangements for the prince and people
47 The river from the house and the land's boundaries
48 The tribal portions and the city's name
`);
book("Daniel", "DAN", `
1 Daniel and his companions taken to Babylon and trained
2 Nebuchadnezzar's second-year dream and its interpretation
3 The golden image and deliverance from the furnace
4 Nebuchadnezzar's tree dream, humbling, and restoration
5 Belshazzar's feast and Babylon's fall
6 Daniel delivered from the lions under Darius
7 The first-year vision under Belshazzar and its interpretation
8 The third-year vision under Belshazzar concerning the ram and goat
9 Daniel's prayer and the seventy-weeks revelation
10 The third-year revelation under Cyrus
11 The message concerning future conflicts and the earlier Darius reference
12 The conclusion of the revelation and its time notices
`);
book("Hosea", "HOS", `
1 Hosea's family signs and the named royal setting
2 Unfaithfulness, judgment, and promised restoration
3 Hosea's further family sign and Israel's future return
4 The LORD's controversy with Israel and the priests
5 Judgment on Israel and Judah's leaders
6 The call to return and the rebuke of passing goodness
7 Ephraim's corruption and unstable alliances
8 Broken covenant, idols, and foreign dependence
9 Loss of harvest, exile, and remembered wrongdoing
10 The vine, destroyed altars, and the call to seek the LORD
11 Love for Israel, the Exodus recalled, and promised return
12 Jacob's history and Israel's present deceit
13 Ephraim's rebellion, death, and the promise of ransom
14 The call to return and the promise of healing
`);
book("Joel", "JOL", `
1 Devastation, lament, and a call to fasting
2 The day of the LORD, repentance, and the promised outpouring
3 Judgment of the nations and Judah's restoration
`);
book("Amos", "AMO", `
1 Amos's royal setting and judgments on neighbouring nations
2 Judgment on Moab, Judah, and Israel
3 Israel's responsibility and the warning to Samaria
4 Oppression, empty worship, and ignored warnings
5 Lament, the call to seek the LORD, and true justice
6 Complacency and confidence in wealth rebuked
7 Visions of judgment and the confrontation with Amaziah
8 The summer fruit vision and the famine of hearing
9 Judgment, the remnant, and the restoration of David's tabernacle
`);
book("Obadiah", "OBA", `
1 Edom's pride and violence against Jacob; the LORD's kingdom
`);
book("Jonah", "JON", `
1 Jonah's flight, the storm, and the great fish
2 Jonah's prayer and deliverance from the fish
3 The renewed commission and Nineveh's repentance
4 Jonah's displeasure and the lesson of the gourd
`);
book("Micah", "MIC", `
1 The named royal setting and judgment on Samaria and Judah
2 Oppression rebuked and the remnant's gathering promised
3 Corrupt rulers and prophets rebuked
4 The mountain of the LORD and restoration after distress
5 The ruler from Bethlehem and the remnant's deliverance
6 The LORD's controversy and the call to just conduct
7 Lament over corruption and confidence in forgiveness
`);
book("Nahum", "NAM", `
1 The burden of Nineveh and the LORD's justice and refuge
2 Nineveh's approaching overthrow
3 Nineveh's guilt and the warning from No-amon's fall
`);
book("Habakkuk", "HAB", `
1 Habakkuk's complaint and the announcement concerning the Chaldeans
2 The appointed vision, faith, and woes against wrongdoing
3 Habakkuk's prayer and trust despite coming hardship
`);
book("Zephaniah", "ZEP", `
1 Josiah's reign and the warning of the day of the LORD
2 The call to seek the LORD and judgment on surrounding nations
3 Jerusalem rebuked and a purified, restored people promised
`);
book("Zechariah", "ZEC", `
1 The second-year call to return and the opening night visions
2 The measuring line and the promise concerning Jerusalem
3 Joshua the high priest cleansed and the Branch promised
4 The candlestick, olive trees, and the word to Zerubbabel
5 The flying roll and the woman in the ephah
6 The chariots, Joshua's crown, and the Branch
7 The fourth-year inquiry about fasting and the call to justice
8 Promised restoration and fasts turned to joyful feasts
9 Judgment, the coming king, and deliverance
10 The call to seek the LORD and the gathering of his people
11 The shepherd signs and the thirty pieces of silver
12 Jerusalem's deliverance and the spirit of mourning
13 Cleansing, false prophecy, and the smitten shepherd
14 The day of the LORD and worship at Jerusalem
`);
book("Malachi", "MAL", `
1 The LORD's love and the rebuke of dishonourable offerings
2 Priestly failure and unfaithfulness in marriage
3 The coming messenger, purification, and the call to return
4 The coming day and the promised Elijah
`);
export const BROAD_BOOK_TOPICS = books;
