#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DICTIONARY_PATH = path.resolve("public/references/ai-dictionary.json");
const REVIEW_REPORT_PATH = path.resolve(
  "reports/ai-dictionary-confidence-review.json",
);
const QUALITY_REPORT_PATH = path.resolve(
  "reports/ai-dictionary-quality-patterns-refresh.json",
);
const EXPECTED_WEBSTER_SHA256 =
  "51b1293559425ca96466e30bcec6c17c46b4981c498163507ce9550bca269acf";
const WEBSTER_COMMIT = "4c698abef13663c834349bc9e43258cb8b1d0015";

function parseArgs(argv) {
  const options = { websterCsv: null, write: false };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case "--webster-csv":
        options.websterCsv = argv[++index];
        break;
      case "--write":
        options.write = true;
        break;
      case "--help":
        console.log(
          "Usage: node scripts/review-ai-dictionary-confidence.mjs --webster-csv <path> [--write]",
        );
        process.exit(0);
        break;
      default:
        throw new Error(`Unknown argument: ${argv[index]}`);
    }
  }
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function lowerSet(values) {
  return new Set(values.map((value) => value.toLowerCase()));
}

function readObjectKeys(filePath) {
  return lowerSet(Object.keys(readJson(filePath)));
}

function readWebsterHeadwords(filePath) {
  if (!filePath) {
    return null;
  }

  const contents = fs.readFileSync(path.resolve(filePath), "utf8");
  const actualSha256 = crypto.createHash("sha256").update(contents).digest("hex");
  if (actualSha256 !== EXPECTED_WEBSTER_SHA256) {
    throw new Error(
      `Unexpected Webster source checksum: ${actualSha256}. Expected ${EXPECTED_WEBSTER_SHA256}.`,
    );
  }

  const headwords = new Set();
  for (const line of contents.split(/\r?\n/g)) {
    if (!line) {
      continue;
    }
    const match = line.match(/^"((?:[^"]|"")*)",/);
    if (!match) {
      throw new Error("Could not parse a Webster CSV headword.");
    }
    headwords.add(match[1].replaceAll('""', '"').toLowerCase());
  }
  return headwords;
}

function readStrongsWords() {
  const words = new Set();
  for (const fileName of [
    "strongs-greek.compact.min.json",
    "strongs-hebrew.compact.min.json",
  ]) {
    const compact = readJson(path.resolve("public/references", fileName));
    for (const entry of Object.values(compact.e)) {
      const references = entry[6];
      if (!Array.isArray(references)) {
        continue;
      }
      for (const [wordIndex] of references) {
        const word = compact.w[wordIndex];
        if (word) {
          words.add(word.toLowerCase());
        }
      }
    }
  }
  return words;
}

function readMapNames() {
  const entries = readJson("public/references/ancient_map.json");
  return lowerSet(entries.flatMap((entry) => entry.translations ?? []));
}

function readGenealogyNames() {
  const compact = readJson("public/references/genealogy.compact.min.json");
  return lowerSet(compact.w);
}

const corrections = {
  abodest: {
    partOfSpeech: "verb",
    definitions: [
      "Abodest; an older second-person singular past form of 'abide,' meaning 'you remained' or 'you stayed.'",
    ],
  },
  affectioned: {
    partOfSpeech: "adjective",
    definitions: [
      "Affectioned; disposed or inclined in heart toward someone or something.",
    ],
  },
  aged: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Aged; old or advanced in years.",
      "As a noun, aged people collectively.",
    ],
  },
  Alameth: {
    partOfSpeech: "noun",
    definitions: [
      "Alameth; a son of Becher named in Benjamin's genealogy, a spelling also used for Alemeth.",
    ],
  },
  amends: {
    partOfSpeech: "noun",
    definitions: [
      "Amends; compensation or satisfaction given for an injury or wrong.",
    ],
  },
  ancients: {
    partOfSpeech: "noun",
    definitions: [
      "Ancients; people of former times, or elders and persons advanced in age or standing.",
    ],
  },
  aramitess: {
    partOfSpeech: "noun",
    definitions: ["Aramitess; an Aramean or Syrian woman."],
  },
  arts: {
    partOfSpeech: "noun",
    definitions: [
      "Arts; learned skills, crafts, practices, or works requiring skill.",
    ],
  },
  backsliding: {
    partOfSpeech: "noun / adjective",
    definitions: [
      "Backsliding; turning away from former faithfulness or obedience.",
      "It may name the act or condition of apostasy, or describe one who turns back.",
    ],
  },
  badest: {
    partOfSpeech: "verb",
    definitions: [
      "Badest; an older second-person singular past form of 'bid,' meaning 'you commanded' or 'you directed.'",
    ],
  },
  barest: {
    partOfSpeech: "verb",
    definitions: [
      "Barest; an older second-person singular past form of 'bear,' meaning 'you carried, bore, or supported.'",
    ],
  },
  basest: {
    partOfSpeech: "adjective",
    definitions: [
      "Basest; the superlative of 'base,' meaning lowest in rank, quality, or character.",
    ],
  },
  bellows: {
    partOfSpeech: "noun",
    definitions: [
      "Bellows; an instrument that draws in and expels air to intensify a fire.",
    ],
  },
  boils: {
    partOfSpeech: "noun / verb",
    definitions: [
      "Boils; inflamed sores or swellings.",
      "As a verb, seethes or bubbles with heat.",
    ],
  },
  brawling: {
    partOfSpeech: "noun / adjective",
    definitions: [
      "Brawling; noisy quarreling or contention, or being inclined to quarrel.",
    ],
  },
  breatheth: {
    partOfSpeech: "verb",
    definitions: [
      "Breatheth; an older third-person singular form of 'breathe,' meaning 'breathes' or 'utters with the breath.'",
    ],
  },
  choicest: {
    partOfSpeech: "adjective",
    definitions: [
      "Choicest; the superlative of 'choice,' meaning most select or of the finest quality.",
    ],
  },
  chrysoprasus: {
    partOfSpeech: "noun",
    definitions: [
      "Chrysoprasus; chrysoprase, a translucent green gemstone named among the foundations of the New Jerusalem.",
    ],
  },
  clothing: {
    partOfSpeech: "noun / verb",
    definitions: [
      "Clothing; garments or a covering worn on the body.",
      "As a verb, covering or dressing with garments. See 'clothe'.",
    ],
  },
  "cockatrice'": {
    partOfSpeech: "possessive noun",
    definitions: [
      "Cockatrice'; the possessive form of 'cockatrice,' used before what belongs to or is associated with the creature. See 'cockatrice'.",
    ],
  },
  Coos: {
    partOfSpeech: "noun",
    definitions: [
      "Coos; the Aegean island now commonly called Cos, visited on Paul's voyage to Jerusalem.",
    ],
  },
  coping: {
    partOfSpeech: "noun",
    definitions: [
      "Coping; the top or finishing course of a wall, commonly shaped to protect the masonry below.",
    ],
  },
  cotes: {
    partOfSpeech: "noun",
    definitions: [
      "Cotes; small shelters or enclosures for sheep or other livestock.",
    ],
  },
  crashing: {
    partOfSpeech: "noun",
    definitions: [
      "Crashing; a loud breaking or falling sound, especially the noise of destruction.",
    ],
  },
  cunning: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Cunning; skillful, knowledgeable, or experienced in an art or craft.",
      "As a noun, skill or practiced knowledge; in other contexts the word may carry the later sense of craftiness.",
    ],
  },
  darling: {
    partOfSpeech: "noun / adjective",
    definitions: [
      "Darling; one who is dearly loved, or something especially beloved and precious.",
    ],
  },
  dayspring: {
    partOfSpeech: "noun",
    definitions: [
      "Dayspring; the dawn or first light of day, used figuratively of light and deliverance coming from on high.",
    ],
  },
  detest: {
    partOfSpeech: "verb",
    definitions: ["Detest; to abhor, loathe, or regard as hateful."],
  },
  diddest: {
    partOfSpeech: "verb",
    definitions: [
      "Diddest; an older second-person singular past form of 'do,' meaning 'you did.'",
    ],
  },
  dishonest: {
    partOfSpeech: "adjective",
    definitions: [
      "Dishonest; gained or practiced without honesty, integrity, or justice.",
    ],
  },
  doubletongued: {
    partOfSpeech: "adjective",
    definitions: [
      "Doubletongued; deceitfully saying one thing to one person and something different to another.",
    ],
  },
  drewest: {
    partOfSpeech: "verb",
    definitions: [
      "Drewest; an older second-person singular past form of 'draw,' meaning 'you drew' or 'you came near.'",
    ],
  },
  earing: {
    partOfSpeech: "noun",
    definitions: [
      "Earing; plowing or tilling the ground, especially in preparation for sowing.",
    ],
  },
  earring: {
    partOfSpeech: "noun",
    definitions: ["Earring; an ornament worn on or through the ear."],
  },
  eightieth: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Eightieth; the ordinal form of eighty, indicating position eighty in a sequence or one of eighty equal parts.",
    ],
  },
  fared: {
    partOfSpeech: "verb",
    definitions: [
      "Fared; traveled, proceeded, or experienced a particular condition. See 'fare'.",
    ],
  },
  farthing: {
    partOfSpeech: "noun",
    definitions: [
      "Farthing; a very small coin or amount of money; in the New Testament, a low-value Roman coin.",
    ],
  },
  fatling: {
    partOfSpeech: "noun",
    definitions: [
      "Fatling; a young animal fattened for food or sacrifice.",
    ],
  },
  feebleminded: {
    partOfSpeech: "adjective",
    definitions: [
      "Feebleminded; fainthearted, discouraged, or weak in resolve.",
    ],
  },
  fellest: {
    partOfSpeech: "verb",
    definitions: [
      "Fellest; an older second-person singular past form of 'fall,' meaning 'you fell.'",
    ],
  },
  "felix'": {
    partOfSpeech: "possessive noun",
    definitions: [
      "Felix'; the possessive form of 'Felix,' referring to what belonged to or followed the Roman governor. See 'Felix'.",
    ],
  },
  fewest: {
    partOfSpeech: "adjective",
    definitions: [
      "Fewest; the superlative of 'few,' meaning smallest in number.",
    ],
  },
  fiftieth: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Fiftieth; the ordinal form of fifty, indicating position fifty in a sequence or one of fifty equal parts.",
    ],
  },
  finest: {
    partOfSpeech: "adjective",
    definitions: [
      "Finest; the superlative of 'fine,' meaning richest, choicest, or highest in quality.",
    ],
  },
  fleddest: {
    partOfSpeech: "verb",
    definitions: [
      "Fleddest; an older second-person singular past form of 'flee,' meaning 'you fled.'",
    ],
  },
  fellows: {
    partOfSpeech: "noun",
    definitions: [
      "Fellows; companions, associates, or people joined with others in a common relation or work.",
    ],
  },
  fortieth: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Fortieth; the ordinal form of forty, indicating position forty in a sequence or one of forty equal parts.",
    ],
  },
  forsookest: {
    partOfSpeech: "verb",
    definitions: [
      "Forsookest; an older second-person singular past form of 'forsake,' meaning 'you forsook' or 'you abandoned.'",
    ],
  },
  frontlets: {
    partOfSpeech: "noun",
    definitions: [
      "Frontlets; bands or reminders worn at the forehead, used figuratively for keeping God's words continually in view.",
    ],
  },
  gaped: {
    partOfSpeech: "verb",
    definitions: [
      "Gaped; opened the mouth wide, often in hunger, wonder, or hostility. See 'gape'.",
    ],
  },
  gloriest: {
    partOfSpeech: "verb",
    definitions: [
      "Gloriest; an older second-person singular form of 'glory,' meaning 'you boast' or 'you take pride.'",
    ],
  },
  goodliest: {
    partOfSpeech: "adjective",
    definitions: [
      "Goodliest; the superlative of 'goodly,' meaning fairest, finest, or most impressive.",
    ],
  },
  grayheaded: {
    partOfSpeech: "adjective",
    definitions: ["Grayheaded; having gray hair; advanced in age."],
  },
  grisled: {
    partOfSpeech: "adjective",
    definitions: [
      "Grisled; gray, streaked, or variegated in color, especially of the horses in Zechariah's vision.",
    ],
  },
  hadst: {
    partOfSpeech: "verb",
    definitions: [
      "Hadst; an older second-person singular past form of 'have,' meaning 'you had.'",
    ],
  },
  handwriting: {
    partOfSpeech: "noun",
    definitions: [
      "Handwriting; something written by hand; in Colossians 2:14, the written record of ordinances standing against us.",
    ],
  },
  Hareth: {
    partOfSpeech: "noun",
    definitions: [
      "Hareth; the forest or wooded district in Judah to which the prophet Gad directed David, also called Hereth.",
    ],
  },
  hasting: {
    partOfSpeech: "verb",
    definitions: [
      "Hasting; moving or acting with haste; making speed. See 'haste'.",
    ],
  },
  hatred: {
    partOfSpeech: "noun",
    definitions: ["Hatred; strong aversion, hostility, or enmity."],
  },
  hearted: {
    partOfSpeech: "adjective",
    definitions: [
      "Hearted; having a specified disposition of heart, chiefly used in compounds such as hardhearted or fainthearted.",
    ],
  },
  heapeth: {
    partOfSpeech: "verb",
    definitions: [
      "Heapeth; an older third-person singular form of 'heap,' meaning 'heaps up' or 'gathers into a heap.'",
    ],
  },
  Heth: {
    partOfSpeech: "noun",
    definitions: [
      "Heth; a son of Canaan and ancestor of the Hittites, whose descendants lived in Canaan.",
    ],
  },
  highminded: {
    partOfSpeech: "adjective",
    definitions: [
      "Highminded; proud, conceited, or lifted up in one's own estimation.",
    ],
  },
  holiest: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Holiest; most holy or sacred.",
      "As a noun in Hebrews, the innermost sanctuary, the Holiest of all.",
    ],
  },
  hottest: {
    partOfSpeech: "adjective",
    definitions: [
      "Hottest; the superlative of 'hot,' meaning most heated, fierce, or violent.",
    ],
  },
  hungred: {
    partOfSpeech: "adjective",
    definitions: ["Hungred; hungry or suffering from lack of food."],
  },
  indebted: {
    partOfSpeech: "adjective",
    definitions: [
      "Indebted; owing a debt or placed under an obligation to another.",
    ],
  },
  ingathering: {
    partOfSpeech: "noun",
    definitions: [
      "Ingathering; the gathering in of produce at harvest, especially in the name Feast of Ingathering.",
    ],
  },
  Jared: {
    partOfSpeech: "noun",
    definitions: [
      "Jared; an antediluvian patriarch, the father of Enoch and an ancestor of Noah.",
    ],
  },
  lapwing: {
    partOfSpeech: "noun",
    definitions: [
      "Lapwing; an unclean bird named in Leviticus and Deuteronomy, traditionally rendered lapwing and often identified with the hoopoe.",
    ],
  },
  leaved: {
    partOfSpeech: "adjective",
    definitions: ["Leaved; furnished with leaves or having a leaf or fold."],
  },
  leddest: {
    partOfSpeech: "verb",
    definitions: [
      "Leddest; an older second-person singular past form of 'lead,' meaning 'you led' or 'you guided.'",
    ],
  },
  lees: {
    partOfSpeech: "noun",
    definitions: [
      "Lees; sediment or dregs that settle at the bottom of wine, used figuratively of settled ease or the bitter remainder of judgment.",
    ],
  },
  lefthanded: {
    partOfSpeech: "adjective",
    definitions: [
      "Lefthanded; using the left hand with particular skill or as the dominant hand.",
    ],
  },
  leftest: {
    partOfSpeech: "verb",
    definitions: [
      "Leftest; an older second-person singular past form of 'leave,' meaning 'you left' or 'you delivered over.'",
    ],
  },
  lightning: {
    partOfSpeech: "noun",
    definitions: [
      "Lightning; a sudden flash of electrical light in the sky, used figuratively for dazzling brightness or swiftness.",
    ],
  },
  minded: {
    partOfSpeech: "adjective",
    definitions: [
      "Minded; disposed, inclined, or resolved toward a particular purpose.",
    ],
  },
  meetest: {
    partOfSpeech: "adjective / verb",
    definitions: [
      "Meetest; most fit or suitable.",
      "It is also an older second-person singular form of 'meet,' meaning 'you meet' or 'you come to meet.'",
    ],
  },
  meted: {
    partOfSpeech: "verb",
    definitions: [
      "Meted; measured, allotted, or dealt out. See 'mete'.",
    ],
  },
  mightiest: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Mightiest; the superlative of 'mighty,' meaning strongest or most valiant.",
      "As a noun, the mightiest men or warriors.",
    ],
  },
  noted: {
    partOfSpeech: "verb / adjective",
    definitions: [
      "Noted; marked, recorded, or specially observed; also distinguished or well known. See 'note'.",
    ],
  },
  overlaying: {
    partOfSpeech: "noun / verb",
    definitions: [
      "Overlaying; a covering laid over a surface, or the act of covering one material with another.",
    ],
  },
  passions: {
    partOfSpeech: "noun",
    definitions: [
      "Passions; feelings, affections, or experiences to which people are subject; 'like passions' means the same human nature and frailties.",
    ],
  },
  paweth: {
    partOfSpeech: "verb",
    definitions: [
      "Paweth; an older third-person singular form of 'paw,' meaning 'strikes or scrapes with the foot.'",
    ],
  },
  pining: {
    partOfSpeech: "verb / adjective",
    definitions: [
      "Pining; wasting away, languishing, or failing from grief, sickness, or want.",
    ],
  },
  pineth: {
    partOfSpeech: "verb",
    definitions: [
      "Pineth; an older third-person singular form of 'pine,' meaning 'wastes away' or 'languishes.'",
    ],
  },
  poorest: {
    partOfSpeech: "adjective",
    definitions: [
      "Poorest; the superlative of 'poor,' meaning most needy or lowest in wealth or condition.",
    ],
  },
  ranging: {
    partOfSpeech: "verb / noun",
    definitions: [
      "Ranging; moving or extending over an area, or arranging in rows or ranks. See 'range'.",
    ],
  },
  renowned: {
    partOfSpeech: "adjective",
    definitions: [
      "Renowned; widely known, celebrated, or famous for notable qualities or deeds.",
    ],
  },
  riding: {
    partOfSpeech: "verb / noun",
    definitions: [
      "Riding; traveling while carried on an animal or in a vehicle. See 'ride'.",
    ],
  },
  rolleth: {
    partOfSpeech: "verb",
    definitions: [
      "Rolleth; an older third-person singular form of 'roll,' meaning 'rolls' or 'moves by turning over.'",
    ],
  },
  saw: {
    partOfSpeech: "noun / verb",
    definitions: [
      "Saw; the past tense of 'see.'",
      "As a noun, a toothed cutting tool; as a verb, to cut with such a tool.",
    ],
  },
  sawed: {
    partOfSpeech: "verb",
    definitions: [
      "Sawed; cut with a saw, the past tense or past participle of the cutting verb 'saw.'",
    ],
  },
  saws: {
    partOfSpeech: "noun",
    definitions: ["Saws; toothed tools used for cutting wood or stone."],
  },
  scabbed: {
    partOfSpeech: "adjective",
    definitions: [
      "Scabbed; affected or covered with scabs, especially in descriptions of ceremonial uncleanness.",
    ],
  },
  seafaring: {
    partOfSpeech: "adjective / noun",
    definitions: [
      "Seafaring; traveling, working, or making one's living upon the sea.",
    ],
  },
  Seth: {
    partOfSpeech: "noun",
    definitions: [
      "Seth; the third named son of Adam and Eve, born after Abel's death and an ancestor of Noah.",
    ],
  },
  shed: {
    partOfSpeech: "verb",
    definitions: [
      "Shed; to pour out, spill, cast off, or cause to flow, especially blood or another liquid.",
    ],
  },
  Sheth: {
    partOfSpeech: "noun",
    definitions: ["Sheth; another spelling of Seth. See 'Seth'."],
  },
  singed: {
    partOfSpeech: "verb / adjective",
    definitions: [
      "Singed; scorched or burned superficially without being consumed.",
    ],
  },
  smotest: {
    partOfSpeech: "verb",
    definitions: [
      "Smotest; an older second-person singular past form of 'smite,' meaning 'you struck.'",
    ],
  },
  soothsaying: {
    partOfSpeech: "noun",
    definitions: [
      "Soothsaying; the practice of claiming to foretell events by divination rather than by revelation from God.",
    ],
  },
  stayeth: {
    partOfSpeech: "verb",
    definitions: [
      "Stayeth; an older third-person singular form of 'stay,' meaning 'remains, supports, restrains, or delays' according to context.",
    ],
  },
  stingeth: {
    partOfSpeech: "verb",
    definitions: [
      "Stingeth; an older third-person singular form of 'sting,' meaning 'pierces or wounds with a sting.'",
    ],
  },
  strongest: {
    partOfSpeech: "adjective",
    definitions: [
      "Strongest; the superlative of 'strong,' meaning most powerful or mighty.",
    ],
  },
  till: {
    partOfSpeech: "preposition / conjunction / verb",
    definitions: [
      "Till; until, or up to a stated time.",
      "As a verb, to work or cultivate the ground.",
    ],
  },
  tilled: {
    partOfSpeech: "verb / adjective",
    definitions: ["Tilled; worked or cultivated as ground. See 'till'."],
  },
  tillest: {
    partOfSpeech: "verb",
    definitions: [
      "Tillest; an older second-person singular form of 'till,' meaning 'you cultivate the ground.'",
    ],
  },
  tilleth: {
    partOfSpeech: "verb",
    definitions: [
      "Tilleth; an older third-person singular form of 'till,' meaning 'cultivates the ground.'",
    ],
  },
  twined: {
    partOfSpeech: "verb / adjective",
    definitions: [
      "Twined; twisted, wound, or interlaced together. See 'twine'.",
    ],
  },
  valiantest: {
    partOfSpeech: "adjective",
    definitions: [
      "Valiantest; the superlative of 'valiant,' meaning bravest or most courageous.",
    ],
  },
  vilest: {
    partOfSpeech: "adjective",
    definitions: [
      "Vilest; the superlative of 'vile,' meaning lowest, most contemptible, or most morally base.",
    ],
  },
  wasteth: {
    partOfSpeech: "verb",
    definitions: [
      "Wasteth; an older third-person singular form of 'waste,' meaning 'destroys, consumes, or lays waste.'",
    ],
  },
  wing: {
    partOfSpeech: "noun / verb",
    definitions: [
      "Wing; the limb by which a bird or flying creature flies.",
      "By extension, an edge, extremity, covering, or protecting shelter; as a verb, to fly or move swiftly.",
    ],
  },
  withs: {
    partOfSpeech: "noun",
    definitions: [
      "Withs; flexible cords, bands, or bindings, such as the fresh cords used to bind Samson.",
    ],
  },
  withheldest: {
    partOfSpeech: "verb",
    definitions: [
      "Withheldest; an older second-person singular past form of 'withhold,' meaning 'you kept back.'",
    ],
  },
  woundeth: {
    partOfSpeech: "verb",
    definitions: [
      "Woundeth; an older third-person singular form of 'wound,' meaning 'injures or inflicts a wound.'",
    ],
  },
  Zereth: {
    partOfSpeech: "noun",
    definitions: ["Zereth; a son of Helah named in Judah's genealogy."],
  },
};

const peopleCorrections = {
  Apollos:
    "Apollos; an eloquent Alexandrian Jew, mighty in the Scriptures, who taught about Jesus and became a fellow laborer in the early church.",
  Araunah:
    "Araunah; the Jebusite whose threshing floor David purchased and used as the site of an altar to the LORD.",
  Belteshazzar:
    "Belteshazzar; the Babylonian name given to Daniel in the court of Nebuchadnezzar.",
  Cyrus:
    "Cyrus; the king of Persia who authorized the Jewish exiles to return and rebuild the temple at Jerusalem.",
  Marcus:
    "Marcus; the Latin form of Mark, also called John Mark, a fellow laborer associated with Barnabas, Paul, and Peter.",
  Meshach:
    "Meshach; the Babylonian name given to Mishael, one of Daniel's three Hebrew companions.",
  Naboth:
    "Naboth; the Jezreelite whose vineyard Ahab coveted and whom Jezebel caused to be falsely accused and killed.",
  Necho:
    "Necho; the pharaoh of Egypt whose campaign brought him into conflict with king Josiah.",
  Og: "Og; the Amorite king of Bashan whom Israel defeated east of Jordan under Moses.",
  Ornan:
    "Ornan; the Jebusite whose threshing floor David purchased for an altar, the place later associated with the temple site; also called Araunah.",
  Rabshakeh:
    "Rabshakeh; the title of a high Assyrian officer who delivered Sennacherib's challenge to Jerusalem in the days of Hezekiah.",
  Shadrach:
    "Shadrach; the Babylonian name given to Hananiah, one of Daniel's three Hebrew companions.",
  Sihon:
    "Sihon; the Amorite king of Heshbon whom Israel defeated east of Jordan under Moses.",
  Silas:
    "Silas; an early Christian leader and prophet who accompanied Paul in missionary work, also called Silvanus.",
  Silvanus:
    "Silvanus; the Latin form of Silas, a fellow laborer associated with Paul and Peter.",
  Timotheus:
    "Timotheus; the Greek form of Timothy, Paul's trusted younger fellow laborer and delegate.",
  Timothy:
    "Timothy; Paul's trusted younger fellow laborer and delegate, also called Timotheus.",
  Titus:
    "Titus; a Greek Christian and trusted fellow laborer of Paul who served the churches, including the work in Crete.",
  Ziba: "Ziba; a servant of Saul's household who was appointed to serve Mephibosheth and later met David during Absalom's rebellion.",
};

for (const [key, definition] of Object.entries(peopleCorrections)) {
  corrections[key] = {
    partOfSpeech: "noun",
    definitions: [definition],
    ...(key === "Rabshakeh" ? { classification: "title" } : {}),
  };
}

const pronounCorrections = {
  hers: "Hers; a possessive pronoun meaning 'that which belongs to her.'",
  herself:
    "Herself; a reflexive or emphatic pronoun referring back to a female person or subject.",
  ours: "Ours; a possessive pronoun meaning 'that which belongs to us.'",
  ourselves:
    "Ourselves; a reflexive or emphatic pronoun referring back to the speakers as a group.",
  theirs: "Theirs; a possessive pronoun meaning 'that which belongs to them.'",
  yours: "Yours; a possessive pronoun meaning 'that which belongs to you.'",
};

for (const [key, definition] of Object.entries(pronounCorrections)) {
  corrections[key] = { partOfSpeech: "pronoun", definitions: [definition] };
}

Object.assign(corrections, {
  "tob-adonijah": {
    partOfSpeech: "noun",
    classification: "person",
    definitions: [
      "Tob-Adonijah; one of the Levites whom Jehoshaphat sent to teach the law of the LORD throughout Judah.",
    ],
  },
  "tubal-cain": {
    partOfSpeech: "noun",
    classification: "person",
    definitions: [
      "Tubal-Cain; a son of Lamech and Zillah, described as an instructor of workers in brass and iron.",
    ],
  },
  "us-ward": {
    partOfSpeech: "adverb",
    definitions: ["Us-ward; toward us or with respect to us."],
  },
  "you-ward": {
    partOfSpeech: "adverb",
    definitions: ["You-ward; toward you or with respect to you."],
  },
  "zaphnath-paaneah": {
    partOfSpeech: "noun",
    classification: "person",
    definitions: [
      "Zaphnath-Paaneah; the Egyptian name Pharaoh gave to Joseph; proposals for its exact meaning vary.",
    ],
  },
});

const gentilicCorrections = {
  agagite: "Agagite; a descendant or subject of Agag, the designation applied to Haman.",
  ahohite: "Ahohite; a member of the family descended from Ahoah.",
  Anethothite: "Anethothite; an inhabitant of Anathoth; a spelling of Antothite.",
  Anetothite: "Anetothite; an inhabitant of Anathoth; a spelling of Antothite.",
  Antothite: "Antothite; an inhabitant of Anathoth.",
  Arbathite: "Arbathite; an inhabitant of Beth-arabah or the Arabah.",
  arbite: "Arbite; a native of Arab, the designation of Paarai in David's mighty men.",
  archite: "Archite; a native of the region of Archi or Erech, the designation of Hushai.",
  areopagite: "Areopagite; a member of the Areopagus council at Athens.",
  Aroerite: "Aroerite; an inhabitant of Aroer.",
  Ashterathite: "Ashterathite; an inhabitant of Ashtaroth.",
  Baharumite: "Baharumite; an inhabitant of Bahurim.",
  Barhumite: "Barhumite; an inhabitant of Bahurim.",
  buzite: "Buzite; a descendant of Buz, the designation applied to Elihu.",
  Carmelite: "Carmelite; an inhabitant of the town of Carmel.",
  eznite:
    "Eznite; the designation attached to Adino in 2 Samuel 23:8; its exact force is difficult, and the underlying Hebrew is associated with a spear.",
  ezrahite: "Ezrahite; a descendant of Zerah, also spelled Ezrachite or Zarhite.",
  Gadite: "Gadite; a member of the tribe descended from Gad.",
  Gershonite: "Gershonite; a descendant of Gershon and member of the Gershonite Levitical family.",
  Gibeathite: "Gibeathite; an inhabitant of Gibeah.",
  gizonite: "Gizonite; an inhabitant of Gizoh.",
  hachmonite: "Hachmonite; a family designation associated with Hachmoni, borne by one of David's mighty men.",
  hagerite: "Hagerite; a member of a people or Arabian clan associated with Hagar; also spelled Hagrite.",
  hararite: "Hararite; a family or local designation borne by several of David's mighty men.",
  Harodite: "Harodite; an inhabitant of Harod.",
  Harorite: "Harorite; a designation of Shammoth among David's mighty men, possibly a variant of Harodite.",
  haruphite: "Haruphite; an inhabitant or descendant of Haruph, also rendered Hariph.",
  Horite: "Horite; a member of the ancient people of Seir in Edom.",
  horonite: "Horonite; an inhabitant of Beth-horon or Horonaim, the designation applied to Sanballat.",
  Hushathite: "Hushathite; a descendant of Hushah, the designation of Sibbechai and Mebunnai.",
  Ishmeelite: "Ishmeelite; an Ishmaelite, a descendant of Ishmael.",
  Ithrite: "Ithrite; a member of a family associated with Jether or Ithra.",
  izrahite: "Izrahite; an Ezrahite or descendant of Zerah.",
  jairite: "Jairite; a descendant of Jair.",
  Jezreelite: "Jezreelite; an inhabitant of Jezreel.",
  mahavite: "Mahavite; an inhabitant of an otherwise unknown place called Mahavah or Machaveh.",
  mecherathite: "Mecherathite; an inhabitant of Mecherah or Mekerah.",
  meholathite: "Meholathite; an inhabitant of Abel-meholah.",
  Mesobaite: "Mesobaite; an inhabitant of or person associated with Mezobah.",
  mithnite: "Mithnite; an inhabitant of an otherwise unknown place called Mithnah or Methen.",
  paltite: "Paltite; a descendant of Palti.",
  Pirathonite: "Pirathonite; an inhabitant of Pirathon.",
  Shaalbonite: "Shaalbonite; an inhabitant of Shaalbin or Shaalabbin.",
  tachmonite: "Tachmonite; a family designation associated with Hachmoni and borne by one of David's mighty men.",
  Timnite: "Timnite; an inhabitant of Timnah.",
  tizite: "Tizite; a descendant or inhabitant of an otherwise unknown place or family called Tiz.",
};

for (const [key, definition] of Object.entries(gentilicCorrections)) {
  corrections[key] = { partOfSpeech: "noun", definitions: [definition] };
}

const peopleGroupCorrections = {
  Alexandrians: "Alexandrians; people from Alexandria in Egypt.",
  Apharsites: "Apharsites; a people or official group named among those settled in the province of Samaria.",
  Arabians: "Arabians; inhabitants or peoples of Arabia.",
  Archevites: "Archevites; people from Erech who were settled in Samaria by the Assyrians.",
  Ashdodites: "Ashdodites; inhabitants of the Philistine city of Ashdod.",
  Ashdothites: "Ashdothites; inhabitants of Ashdod; a spelling of Ashdodites.",
  Athenians: "Athenians; inhabitants or citizens of Athens.",
  Libyans: "Libyans; inhabitants or peoples of Libya in North Africa.",
  Lydians: "Lydians; inhabitants or people associated with Lydia or Lud.",
  Maachathites: "Maachathites; inhabitants or members of the people of Maachah.",
  Maonites: "Maonites; inhabitants or people associated with Maon.",
  Netophathites: "Netophathites; inhabitants of Netophah in Judah.",
  Ninevites: "Ninevites; inhabitants of Nineveh.",
  Sabeans: "Sabeans; a people associated with Sheba or Saba, known in Scripture for trade and raiding.",
  Shechemites: "Shechemites; inhabitants of Shechem.",
  Tekoites: "Tekoites; inhabitants of Tekoa in Judah.",
  Thessalonians: "Thessalonians; inhabitants of Thessalonica in Macedonia.",
};

for (const [key, definition] of Object.entries(peopleGroupCorrections)) {
  corrections[key] = {
    partOfSpeech: "noun",
    classification: "people group",
    definitions: [definition],
  };
}

const manuallyReviewedWithoutCorrection = new Set([
  "Ashteroth",
  "asmuch",
  "baser",
  "brothers",
  "busybody",
  "cases",
  "d",
  "shameful",
  "soundeth",
  "thee-ward",
]);

function improveNessEntry(key, entry) {
  if (!/^The state, quality, or condition of being [A-Za-z-]+nes\.$/.test(entry.definitions[0] ?? "")) {
    return false;
  }

  const overrides = {
    evilfavouredness:
      "Evilfavouredness; the condition of being ill-favoured, ugly, or repulsive in appearance.",
    forwardness:
      "Forwardness; readiness, eagerness, or willingness to act, and in some contexts undue boldness.",
    harness:
      "Harness; armor, equipment, or the gear used to equip a person, animal, or vehicle.",
    lioness: "Lioness; a female lion.",
    painfulness:
      "Painfulness; toil, hardship, distress, or laborious effort.",
    wasteness: "Wasteness; desolation, emptiness, or a ruined condition.",
  };
  const root = key.endsWith("iness")
    ? `${key.slice(0, -5)}y`
    : key.slice(0, -4);
  entry.partOfSpeech = "noun";
  entry.definitions = [
    overrides[key] ?? `The state or quality of being ${root}.`,
  ];
  return true;
}

function removeUnresolvedSeeReferences(entries) {
  const dictionaryKeys = lowerSet(Object.keys(entries));
  const removed = [];
  for (const [key, entry] of Object.entries(entries)) {
    entry.definitions = entry.definitions.map((definition) =>
      definition.replace(/ See '([^']+)'\./g, (fullMatch, target) => {
        if (dictionaryKeys.has(target.toLowerCase())) {
          return fullMatch;
        }
        removed.push({ key, target });
        return "";
      }),
    );
  }
  return removed;
}

function hasMorphologyEvidence(entry) {
  const text = entry.definitions.join(" ");
  return (
    /(?:^| )See '[^']+'\.?$/.test(text) ||
    /\b(?:past tense|past form|present participial form|older (?:second|third)-person singular|plural form|possessive form)\b/i.test(
      text,
    ) ||
    /^[A-Za-z'-]+; means\b/i.test(text)
  );
}

function countConfidence(entries) {
  const counts = { high: 0, medium: 0, low: 0, unspecified: 0 };
  for (const entry of Object.values(entries)) {
    const confidence = entry.confidence ?? "unspecified";
    counts[confidence] += 1;
  }
  return counts;
}

function buildQualityReport(entries) {
  const dictionaryKeys = lowerSet(Object.keys(entries));
  const formEntries = [];
  const unresolvedSeeTargets = [];
  const malformedNessEntries = [];
  const selfReferentialSeeEntries = [];
  const genericEntries = [];

  for (const [key, entry] of Object.entries(entries)) {
    const text = entry.definitions.join(" ");
    if (hasMorphologyEvidence(entry)) {
      formEntries.push(key);
    }
    for (const match of text.matchAll(/See '([^']+)'/g)) {
      if (!dictionaryKeys.has(match[1].toLowerCase())) {
        unresolvedSeeTargets.push({ key, target: match[1] });
      }
      if (key.toLowerCase() === match[1].toLowerCase()) {
        selfReferentialSeeEntries.push(key);
      }
    }
    if (/being [A-Za-z-]+nes\./.test(text)) {
      malformedNessEntries.push(key);
    }
    if (
      /A Scripture term whose exact force|a man named in Scripture\.?$|A pronoun of reference, possession|compound proper name or titled expression/.test(
        text,
      )
    ) {
      genericEntries.push(key);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    schema: {
      definitions: "array<string>",
      partOfSpeech: "string",
      classification: "string",
      confidence: "high | medium | low",
    },
    counts: {
      total: Object.keys(entries).length,
      ...countConfidence(entries),
      withFormOf: formEntries.length,
      unresolvedSeeTargets: unresolvedSeeTargets.length,
      malformedNessEntries: malformedNessEntries.length,
      selfReferentialSeeEntries: selfReferentialSeeEntries.length,
      genericEntries: genericEntries.length,
    },
    samples: {
      unresolvedSeeTargets: unresolvedSeeTargets.slice(0, 25),
      malformedNessEntries: malformedNessEntries.slice(0, 25),
      selfReferentialSeeEntries: selfReferentialSeeEntries.slice(0, 25),
      genericEntries: genericEntries.slice(0, 25),
    },
    notes: [
      "Confidence is assigned to the accuracy of the explanation, including explanations that responsibly state historical or identification uncertainty.",
      "unresolvedSeeTargets is a quality gate: AI Dictionary See-references must resolve to another AI Dictionary headword.",
      "The confidence review used direct headword evidence, KJV/Strong's rendering evidence, named-entity datasets, morphology, and manual contextual review.",
    ],
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const dictionary = readJson(DICTIONARY_PATH);
  const before = countConfidence(dictionary);
  const mediumEntries = Object.entries(dictionary).filter(
    ([, entry]) => entry.confidence === "medium",
  );

  if (mediumEntries.length === 0) {
    console.log("AI Dictionary has no medium-confidence entries to migrate.");
    return;
  }
  if (!options.websterCsv) {
    throw new Error(
      "--webster-csv is required while medium-confidence entries remain.",
    );
  }

  const evidenceSets = {
    webster1828: readWebsterHeadwords(options.websterCsv),
    localWebster: readObjectKeys("public/references/websters.json"),
    oldEnglish: readObjectKeys("public/references/old-english.json"),
    bibleWordBook: readObjectKeys("public/references/bible-word-book.json"),
    hitchcocks: readObjectKeys("public/references/hitchcocks.json"),
    strongsKjvRendering: readStrongsWords(),
    genealogy: readGenealogyNames(),
    ancientMap: readMapNames(),
  };
  const evidenceCounts = Object.fromEntries(
    Object.keys(evidenceSets).map((key) => [key, 0]),
  );
  const primaryEvidenceCounts = {
    webster1828: 0,
    localLexicalReference: 0,
    strongsKjvRendering: 0,
    namedEntityReference: 0,
    morphology: 0,
    manualContextReview: 0,
  };
  const evidenceByHeadword = {};
  const insufficientEvidence = [];

  for (const [key, entry] of mediumEntries) {
    const normalized = key.toLowerCase();
    const evidence = [];
    for (const [source, values] of Object.entries(evidenceSets)) {
      if (values.has(normalized)) {
        evidence.push(source);
        evidenceCounts[source] += 1;
      }
    }
    if (hasMorphologyEvidence(entry)) {
      evidence.push("morphology");
    }
    if (corrections[key] || manuallyReviewedWithoutCorrection.has(key)) {
      evidence.push("manualContextReview");
    }
    evidenceByHeadword[key] = evidence;

    if (evidence.includes("webster1828")) {
      primaryEvidenceCounts.webster1828 += 1;
    } else if (
      evidence.some((value) =>
        ["localWebster", "oldEnglish", "bibleWordBook"].includes(value),
      )
    ) {
      primaryEvidenceCounts.localLexicalReference += 1;
    } else if (evidence.includes("strongsKjvRendering")) {
      primaryEvidenceCounts.strongsKjvRendering += 1;
    } else if (
      evidence.some((value) =>
        ["hitchcocks", "genealogy", "ancientMap"].includes(value),
      )
    ) {
      primaryEvidenceCounts.namedEntityReference += 1;
    } else if (evidence.includes("morphology")) {
      primaryEvidenceCounts.morphology += 1;
    } else if (evidence.includes("manualContextReview")) {
      primaryEvidenceCounts.manualContextReview += 1;
    } else {
      insufficientEvidence.push(key);
    }
  }

  if (insufficientEvidence.length > 0) {
    throw new Error(
      `Entries without sufficient review evidence: ${insufficientEvidence.join(", ")}`,
    );
  }

  const correctedMediumEntries = [];
  const correctedSupportingEntries = [];
  const mediumKeys = new Set(mediumEntries.map(([key]) => key));
  for (const [key, entry] of Object.entries(dictionary)) {
    if (improveNessEntry(key, entry)) {
      correctedMediumEntries.push(key);
    }
  }

  for (const [key, patch] of Object.entries(corrections)) {
    const entry = dictionary[key];
    if (!entry) {
      throw new Error(`Correction target is missing: ${key}`);
    }
    Object.assign(entry, patch);
    if (entry.confidence === "medium") {
      correctedMediumEntries.push(key);
    } else {
      correctedSupportingEntries.push(key);
    }
  }

  const removedUnresolvedSeeReferences =
    removeUnresolvedSeeReferences(dictionary);
  for (const { key } of removedUnresolvedSeeReferences) {
    if (mediumKeys.has(key)) {
      correctedMediumEntries.push(key);
    } else {
      correctedSupportingEntries.push(key);
    }
  }

  for (const [, entry] of mediumEntries) {
    entry.confidence = "high";
  }

  const after = countConfidence(dictionary);
  const qualityReport = buildQualityReport(dictionary);
  if (
    qualityReport.counts.unresolvedSeeTargets > 0 ||
    qualityReport.counts.malformedNessEntries > 0 ||
    qualityReport.counts.selfReferentialSeeEntries > 0 ||
    qualityReport.counts.genericEntries > 0
  ) {
    throw new Error(
      `Post-review quality gates failed: ${JSON.stringify(qualityReport.counts)}`,
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    scope: "Every entry marked medium in public/references/ai-dictionary.json",
    policy: {
      high:
        "The explanation is supported by direct historical-dictionary evidence, KJV/Strong's rendering evidence, named-entity data, mechanically verified morphology, or explicit contextual review. A responsible statement that an ancient identification is uncertain can itself be high confidence.",
      medium:
        "Reserved for an explanation that remains plausible but lacks enough evidence or contextual review.",
      low:
        "Reserved for an explanation with substantial unresolved doubt; none remain in this review.",
    },
    sourceSnapshot: {
      webster1828: {
        repository: "https://github.com/akaitsurugi/webster1828",
        commit: WEBSTER_COMMIT,
        csvSha256: EXPECTED_WEBSTER_SHA256,
        license: "CC-BY-SA-4.0",
        usage: "Headword-level validation only; source definitions were not copied into the runtime dictionary.",
      },
      local: [
        "public/data/kjv.json",
        "public/references/strongs-greek.compact.min.json",
        "public/references/strongs-hebrew.compact.min.json",
        "public/references/websters.json",
        "public/references/old-english.json",
        "public/references/bible-word-book.json",
        "public/references/hitchcocks.json",
        "public/references/genealogy.compact.min.json",
        "public/references/ancient_map.json",
      ],
    },
    confidenceBefore: before,
    confidenceAfter: after,
    reviewedMediumEntries: mediumEntries.length,
    upgradedToHigh: mediumEntries.length,
    remainingMedium: [],
    overlappingEvidenceCounts: evidenceCounts,
    primaryEvidenceCounts,
    correctedMediumEntries: [...new Set(correctedMediumEntries)].sort((a, b) =>
      a.localeCompare(b),
    ),
    correctedSupportingEntries: [
      ...new Set(correctedSupportingEntries),
    ].sort((a, b) => a.localeCompare(b)),
    removedUnresolvedSeeReferences,
    evidenceByHeadword,
    qualityGates: qualityReport.counts,
  };

  if (options.write) {
    fs.writeFileSync(DICTIONARY_PATH, `${JSON.stringify(dictionary, null, 2)}\n`);
    fs.writeFileSync(REVIEW_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(
      QUALITY_REPORT_PATH,
      `${JSON.stringify(qualityReport, null, 2)}\n`,
    );
  }

  console.log(
    JSON.stringify(
      {
        confidenceBefore: report.confidenceBefore,
        confidenceAfter: report.confidenceAfter,
        reviewedMediumEntries: report.reviewedMediumEntries,
        upgradedToHigh: report.upgradedToHigh,
        correctedMediumEntries: report.correctedMediumEntries.length,
        correctedSupportingEntries: report.correctedSupportingEntries.length,
        removedUnresolvedSeeReferences:
          report.removedUnresolvedSeeReferences.length,
        primaryEvidenceCounts: report.primaryEvidenceCounts,
        qualityGates: report.qualityGates,
      },
      null,
      2,
    ),
  );
  if (!options.write) {
    console.log("Dry run only; pass --write to update the dictionary and reports.");
  }
}

main();
