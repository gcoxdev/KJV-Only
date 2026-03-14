# Webster Source Analysis

## Question 1: Is our current `websters.json` derived from `webstersdictionary1828.com`?

Short answer: **very likely yes, or else from the same underlying transcription**.

### Evidence

Our local subset currently has `1019` entries in [`public/references/websters.json`](/home/drpepper/Desktop/CodexProjects/kjv-only/public/references/websters.json).

Spot checks against the public site show exact wording matches for existing entries:

- `Abaddon`
  - local: `ABAD'DON, [Heb. Ch. Syr. Sam. to be lost, or destroyed, to perish.]`
  - site: [`webstersdictionary1828.com/Dictionary/abaddon`](https://webstersdictionary1828.com/Dictionary/abaddon)
- `Abase`
  - local: `ABA'SE, [Fr abaisser, from bas, low, or the bottom; ...]`
  - site: [`webstersdictionary1828.com/Dictionary/Abase`](https://webstersdictionary1828.com/Dictionary/Abase)
- `Abib`
  - local: `A'BIB, [Heb. swelling, protuberant. ...]`
  - site: [`webstersdictionary1828.com/Dictionary/abib`](https://webstersdictionary1828.com/Dictionary/abib)

The wording is close enough to strongly suggest that:

1. our subset was scraped or converted from `webstersdictionary1828.com`, or
2. both our subset and that site are based on the same normalized Webster 1828 transcription.

### Important caveat

Our local JSON is **not** a direct copy of the site format.

Local format:

```json
{
  "Abib": {
    "pronunciation": "A'BIB, ...",
    "definitions": [
      {
        "type": "noun",
        "text": "The first month..."
      }
    ]
  }
}
```

That means our file has already been transformed:

- pronunciation split out from the definition body
- parts of speech normalized into `definitions[].type`
- numbered meanings merged into HTML text using `<br/>`

So even if the site is the upstream wording source, the file in this repo is a **processed subset**, not a raw export.

## Question 2: Can we use `lest` from the user-provided Webster page?

Yes. The user-provided page is a reasonable candidate source:

- [`webstersdictionary1828.com/Dictionary/lest`](https://webstersdictionary1828.com/Dictionary/lest)

Given the matching evidence above, `lest` from that site is compatible with the likely upstream used for our current subset, subject to the usual normalization into:

- `pronunciation`
- `definitions[]`

## Question 3: What is the SWORD Webster module?

CrossWire now distributes a dedicated Webster 1828 SWORD module:

- module id: `Webster1828`
- category: `Lexicon / Dictionary`
- version: `1.1`
- release announcement: [`sword-devel: Module release: Webster1828`](https://lists.crosswire.org/pipermail/sword-devel/2024-August/050162.html)

The release announcement says:

- updated August 2, 2024
- “Fixed definitions for a few words”
- “Cleaned up unknown characters, and double spaces”
- credits the work to `Christian_Liberty_Institute`

CrossWire modules index:

- [`crosswire.org/sword/modules/index.jsp`](https://www.crosswire.org/sword/modules/index.jsp)
- raw module conf index showing `webster1828.conf`: [`crosswire.org/ftpmirror/pub/sword/raw/mods.d/`](https://www.crosswire.org/ftpmirror/pub/sword/raw/mods.d/)

## Question 4: What do we know about the SWORD Webster data structure?

The strongest public evidence comes from Akai Tsurugi, which appears to be the upstream project behind the CrossWire `Webster1828` module release:

- [`akaitsurugi.org/library/study/webster1828`](https://akaitsurugi.org/library/study/webster1828)

From that page:

- the source is on GitHub
- the working source file is `webster1828.csv`
- only **two columns** are used in `webster1828.csv`:
  - word
  - definition
- there is also a `words-in-progress.csv`
- approximately **600 words** still need to be fixed and added

### Implication

This is structurally different from our current local subset.

Likely SWORD upstream shape:

- headword
- single body string containing pronunciation / part-of-speech / numbered senses inline

Our local shape:

- headword
- separate `pronunciation`
- structured `definitions[]`

So importing directly from the SWORD CSV or module would still require a transformation step.

## Question 5: How many entries are in the SWORD Webster module?

We do **not** have a verified entry count yet.

What we can say:

- it is clearly much larger than our local `1019`-entry subset
- it is intended as a broad Webster 1828 module, not a compact KJV-only subset
- Akai Tsurugi states that only about `600` words still need to be fixed and added, which suggests the source is already very large and near-complete

What we cannot yet say without downloading or directly inspecting the source repository/module:

- exact headword count
- exact module storage driver / on-disk record layout for `Webster1828`
- exact number of missing entries relative to a “complete” 1828 transcription

## Practical conclusion

For the immediate next step, the best path is:

1. keep treating `public/references/websters.json` as a **KJV-focused processed subset**
2. use `webstersdictionary1828.com` wording for small targeted additions like `Lest`
3. normalize each imported entry into the existing local structure
4. separately evaluate the SWORD `Webster1828` source as a possible **future master source** if we decide to expand coverage more systematically

## Recommendation

Use two tracks:

- **Track A: targeted additions now**
  - add approved high-value words one at a time from the Webster 1828 site / same-source wording
  - normalize to current JSON shape
- **Track B: broader source audit later**
  - inspect the SWORD `Webster1828` source repo/module directly
  - count entries
  - sample formatting
  - decide whether it should become the authoritative import source for future growth
