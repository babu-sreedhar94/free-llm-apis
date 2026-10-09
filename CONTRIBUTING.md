# Contributing

Thanks for helping keep this directory accurate. Free-tier terms change fast, and a wrong row wastes developers' time.

## Report outdated information (highest-value contribution)

Open an issue using the **[Outdated information](../../issues/new?template=outdated-info.yml)** template. Include:

- which provider/model/field is wrong,
- the current value in this dataset,
- the **official source URL** that shows the correct value,
- the date you observed the change.

Reports backed by an official source (provider docs, console, or announcement) are prioritized. We do not accept "I think it changed" reports without a source.

## Suggest a new provider or model

Open an issue first (don't send a data PR unannounced). To be listed, an offering must:

1. have a **free tier that does not require a credit card** to start,
2. expose an **API** (chat/completion endpoint) — chat-only web UIs don't belong here,
3. be verifiable from an **official URL** (docs or signup page),
4. have **published rate limits or documented terms** we can cite with a date.

Include the official docs URL, the signup/key URL, published rate limits (quoted), and the free-tier classification (permanent / renewable quota / trial / aggregator).

## Pull requests

**Welcome:**
- fixes to this repository's own text, validator, or generator (`scripts/generate.mjs`),
- improvements to the issue template, README prose outside the generated blocks, and docs.

**Not accepted directly here:**
- edits to `data/*.json` — the snapshots are refreshed from OpenGPU Radar's authoritative dataset; hand-edits would be overwritten. Data corrections start as an issue (above) and land upstream first.

## Ground rules

- No fabricated values. If a limit isn't published, the row says so — keep it that way.
- No affiliate/referral links, no sponsored rankings.
- Every time-sensitive claim needs a source URL and a date.
- Run `node scripts/generate.mjs --check` before committing; it must pass.
