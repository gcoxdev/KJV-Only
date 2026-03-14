# Webster Import-Ready Candidates

This file refines the earlier preview into the actual shape used by [`websters.json`](/home/drpepper/Desktop/CodexProjects/kjv-only/public/references/websters.json), while separating entries by confidence level.

## Categories

- `direct`
  - exact Webster headword found on `webstersdictionary1828.com`
  - safe to normalize into the local structure
- `derived`
  - no exact matching headword confirmed in this pass, but a closely related Webster headword exists and is probably usable with manual normalization
- `pending`
  - still needs exact-source confirmation before import

## Summary

- direct candidates: `17`
- derived candidates: `5`
- pending candidates: `3`

## Direct candidates

- `Priest`
- `Congregation`
- `Righteous`
- `Righteousness`
- `Inheritance`
- `Thereof`
- `Wherein`
- `Behold`
- `Spirit`
- `Soul`
- `Midst`
- `Covenant`
- `Holy`
- `Wicked`
- `Rejoice`
- `Therefore`
- `Lest`

## Derived candidates

- `Priests`
  - derive from `Priest`
- `Offering`
  - derive from `Offer`
- `Offerings`
  - derive from `Offer` and/or `Burnt-offering`
- `Burnt`
  - derive from `Burnt-offering`
- `Altar`
  - exact `Altar` page was not surfaced in this pass, but altar-related Webster content was found (`Altarage`, `Burnt-offering`, `Sacrifice`)

## Pending candidates

- `Therein`
  - earlier preview sourced from the `there` family, but exact Webster 1828 headword still needs confirmation from the same source chain
- `Brethren`
  - earlier preview found an alternate Bible dictionary page, but exact Webster 1828 headword still needs confirmation
- `Offerings`
  - usable as a derived entry if needed, but if we want a true headword-level import, it still needs confirmation

## Recommendation

If we import next, the cleanest path is:

1. import the `direct` set first
2. add `derived` entries only where the app needs explicit plural/surface-form lookup support
3. leave `pending` entries for one more sourcing pass
