# Free LLM APIs — verified directory

A machine-readable directory of **free LLM API access**: which providers offer free models, on what terms, with which rate limits — and when each claim was last verified. Every row is generated from OpenGPU Radar's verified dataset; nothing in the tables below is hand-maintained.

- **Browsing?** Start with [Providers](#providers) or [Model offerings](#model-offerings).
- **Integrating?** Grab a row's official key link, then use the provider's OpenAI-compatible endpoint.
- **Data?** Everything is in [`data/directory.json`](data/directory.json) (derived) and its two source snapshots in [`data/`](data/).

Data snapshot generated <!-- GEN:GENERATED-AT -->
2026-10-09
<!-- /GEN:GENERATED-AT -->.

## What counts as a free API

Not every "free" label means the same thing. This directory separates them:

| Category | What it means |
| --- | --- |
| **Permanent free** | Access that does not expire, within published recurring rate limits. No credits to burn down. |
| **Renewable quota** | Free access subject to recurring limits (rate limits and/or daily allowances) that reset — renewable, not one-time. |
| **Aggregator free** | Free model routes offered by an aggregator platform, not by the model developer directly. Availability and limits are the platform's. |
| **Trial / credits** | Time-bound or credit-bound trial access. Ends when the window or promotional credits are exhausted. |
| **Community free** | Community- or platform-sponsored free access governed by the hosting platform. |

**Free trial ≠ permanent free tier.** A trial burns down (a clock or a credit balance); a permanent tier renews (rate limits reset). A renewable quota sits in between: it renews, but a daily cap still binds. The `Category` column on every row tells you which one you're looking at — it is derived directly from each row's source value, not assigned by hand.

**What this directory does not list:** offers that require a credit card to start, unverified marketing claims, or local/self-hosted models (no API account involved — see OpenGPU Radar's [local LLM guides](https://opengpuradar.com/learn/local-llm-serving-engines?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) for that). Geographic availability restrictions are **not tracked** in this dataset; check each provider's terms.

## Directory at a glance

<!-- GEN:STATS -->
| Metric | Value |
| --- | --- |
| Providers in catalog | 14 |
| Providers with verified offerings | 11 |
| Model offerings | 24 |
| Permanent free | 8 |
| Renewable quota | 7 |
| Aggregator free | 5 |
| Trial / credits | 4 |
| Community free | 0 |
| Requires credit card | 0 |
| Requires phone verification | 2 |
| Requires an account | 24 (all official key links) |
| Geographic restrictions | not tracked in this dataset |
| Rows marked VERIFIED_LIVE | 9 |
| Rows marked DOCUMENTED_FREE | 15 |
| lastVerified range | 2026-09-26 → 2026-09-26 |
<!-- /GEN:STATS -->

## Providers

Provider-level rate limits are the provider's own published summary (they can differ from per-model rows below — per-model rows carry their own `lastVerified` date).

<!-- GEN:PROVIDERS -->
| Provider | Tier (site dataset) | Offerings here | Rate limits (provider-level) | Get an API key | Official docs |
| --- | --- | --- | --- | --- | --- |
| Google AI Studio | Permanent Free | 2 | 15 RPM, 1M tokens/day | [Get key](https://aistudio.google.com/apikey) | [Docs](https://ai.google.dev/gemini-api/docs) |
| Groq | Permanent Free | 4 | 30 RPM, 14,400 req/day | [Get key](https://console.groq.com/keys) | [Docs](https://console.groq.com/docs) |
| SambaNova Systems | Permanent Free | 1 | ~20 RPM, 200 RPD daily quota | [Get key](https://www.sambanova.ai/) | [Docs](https://docs.sambanova.ai/) |
| Cerebras | Permanent Free | 2 | 30 RPM, 1M tokens/day | [Get key](https://cloud.cerebras.ai/) | [Docs](https://docs.cerebras.ai/) |
| NVIDIA NIM | Trial Credits | 1 | 1,000 promotional API credits for developers | [Get key](https://build.nvidia.com/) | [Docs](https://docs.nvidia.com/nim/) |
| Mistral AI | Quota Limits | 2 | 1 RPS (60 RPM), phone verification required | [Get key](https://platform.mistral.ai/) | [Docs](https://docs.mistral.ai/platform/) |
| Cloudflare Workers AI | Permanent Free | 2 | 10,000 neurons/day free allocation | [Get key](https://dash.cloudflare.com/?to=/:account/workers-ai) | [Docs](https://developers.cloudflare.com/workers-ai/) |
| OpenRouter | Free Aggregator | 3 | 3 RPM, no credit card required for :free models | [Get key](https://openrouter.ai/keys) | [Docs](https://openrouter.ai/docs) |
| Hugging Face | Community Free | 2 | 1,000 requests/day via Inference API (serverless) | [Get key](https://huggingface.co/settings/tokens) | [Docs](https://huggingface.co/docs/huggingface.js/guides/inference) |
| GitHub Models | Trial Credits | 3 | GitHub account required; Copilot limits apply | [Get key](https://github.com/features) | [Docs](https://docs.github.com/en/models) |
| Kilo Code / Kilo Gateway | Free Aggregator | 2 | Developer trial quota; varies by model | [Get key](https://kilo.code/) | [Docs](https://kilo.code/) |
| Chutes.ai | Community Free | 0 | Free tier with rate limits | [Get key](https://chutes.ai/) | [Docs](https://docs.chutes.ai/) |
| ModelScope | Community Free | 0 | Free tier with rate limits | [Get key](https://modelscope.cn/) | [Docs](https://modelscope.cn/) |
| OVHcloud AI Endpoints | Community Free | 0 | Free tier with rate limits | [Get key](https://www.ovhcloud.com/public-cloud/ai-endpoints/) | [Docs](https://docs.ovhcloud.com/en/public-cloud/ai-endpoints/) |
<!-- /GEN:PROVIDERS -->

## Model offerings

Rate limits are shown exactly as recorded in the source dataset (`rateLimits.documented`). `API` is the compatibility surface (`openai` = OpenAI SDK/base-url compatible). Rows marked **†** failed the most recent live catalog check — see [Verification](#verification-and-freshness).

<!-- GEN:OFFERINGS -->
| Provider | Model | Category | Rate limits | Context | API | lastVerified |
| --- | --- | --- | --- | --- | --- | --- |
| Google AI Studio | Gemini 2.0 Flash | Permanent free | 15 RPM, 1M tokens/day via Google AI Studio | 1049K | google | 2026-09-26 |
| Google AI Studio | Gemini 1.5 Flash | Permanent free | 15 RPM, 1.5M tokens/day via Google AI Studio | 1049K | google | 2026-09-26 |
| Groq | Llama 3.3 70B | Permanent free | 30 RPM, 14,400 requests/day via Groq Console | 128K | openai | 2026-09-26 |
| Groq | Llama 3.1 8B | Permanent free | 30 RPM, 14,400 requests/day via Groq Console | 128K | openai | 2026-09-26 |
| Groq | Qwen 2.5 Coder 32B | Permanent free | 30 RPM, 14,400 requests/day via Groq Console | 128K | openai | 2026-09-26 |
| Groq | Qwen 2.5 72B | Permanent free | 30 RPM, 14,400 requests/day via Groq Console | 128K | openai | 2026-09-26 |
| Mistral AI | Mistral NeMo 12B | Renewable quota | 1 RPS (60 RPM), phone verification required via La Plateforme | 128K | openai | 2026-09-26 |
| Mistral AI | Codestral 22B | Renewable quota | 1 RPS (60 RPM), phone verification required via La Plateforme | 128K | openai | 2026-09-26 |
| OpenRouter | Meta Llama 3.3 70B † | Aggregator free | 3 RPM, no credit card required for :free models | 128K | openai | 2026-09-26 |
| OpenRouter | Qwen 2.5 72B † | Aggregator free | 3 RPM, no credit card required for :free models | 128K | openai | 2026-09-26 |
| OpenRouter | Meta Llama 3.1 8B † | Aggregator free | 3 RPM, no credit card required for :free models | 128K | openai | 2026-09-26 |
| Hugging Face | Llama 3.1 8B Instruct | Renewable quota | 1,000 requests/day via Inference API (serverless) | 128K | openai | 2026-09-26 |
| Hugging Face | Llama 3.3 70B Instruct | Renewable quota | 500 requests/day via Inference API (serverless, rate-limited) | 128K | openai | 2026-09-26 |
| Cloudflare Workers AI | Llama 3.3 70B | Renewable quota | 10,000 neurons/day free allocation | 128K | openai | 2026-09-26 |
| Cloudflare Workers AI | Llama 3.1 8B | Renewable quota | 10,000 neurons/day free allocation | 128K | openai | 2026-09-26 |
| SambaNova Systems | Llama 3.3 70B | Renewable quota | ~20 RPM / 200 RPD daily free quota via SN40L RDUs, sub-second latency | 128K | openai | 2026-09-26 |
| NVIDIA NIM | Llama 3.3 70B † | Trial / credits | 1,000 free promotional API credits for developers; standard rate limits apply after trial | 128K | openai | 2026-09-26 |
| Cerebras | Llama 3.3 70B | Permanent free | 30 RPM, 1M tokens/day via Cerebras Inference API | 128K | openai | 2026-09-26 |
| Cerebras | Llama 3.1 8B | Permanent free | 30 RPM, 1M tokens/day via Cerebras Inference API | 128K | openai | 2026-09-26 |
| GitHub Models | GPT-4o mini | Trial / credits | GitHub account required; Copilot limits apply (15 RPM, 150 RPD) | 128K | openai | 2026-09-26 |
| GitHub Models | Llama 3.3 70B | Trial / credits | GitHub account required; Copilot limits apply (15 RPM, 150 RPD) | 128K | openai | 2026-09-26 |
| GitHub Models | Phi-4 (14B) | Trial / credits | GitHub account required; Copilot limits apply (15 RPM, 150 RPD) | 128K | openai | 2026-09-26 |
| Kilo Code | Qwen 2.5 Coder 32B | Aggregator free | Developer trial quota; varies by model | 128K | openai | 2026-09-26 |
| Kilo Code | DeepSeek Coder V2 (Distill Qwen 32B) † | Aggregator free | Developer trial quota; varies by model | 128K | openai | 2026-09-26 |
<!-- /GEN:OFFERINGS -->

## Sign-up requirements

The counts live in the [stats table](#directory-at-a-glance) so they can never drift from the data: credit-card requirement, phone verification, and account requirement are tracked per row in `data/directory.json` (`requiresCreditCard`, `requiresPhone`, `officialSignupUrl`). Geographic restrictions are not tracked.

## Reading the rate limits

- **RPM** — requests per minute. The limit you hit first while iterating interactively.
- **RPD** — requests per day. Governs sustained pipelines: a generous RPM with a small RPD still caps your day.
- **TPM** — tokens (prompt + completion) per minute. Bounds large-context or batch requests even when RPM is plenty.
- **TPD** — tokens per day.

A provider may publish some of these and not others. When a number is absent from a row, the provider does not publish it for that endpoint — the directory records `null` rather than guessing, and the row keeps the exact `documented` string the provider publishes. When several limits exist, the **first one you exhaust binds**: long-context calls usually hit TPM before RPM; automated pipelines usually hit RPD before either.

## Verification and freshness

Every offering row carries:

- `verificationStatus` — `VERIFIED_LIVE` (endpoint/catalog confirmed during verification) or `DOCUMENTED_FREE` (free tier published in official documentation; not re-confirmed live at that pass).
- `lastVerified` — the date that row's claims were last checked (ISO 8601).
- `sources.docs` / `sources.signup` — the official URLs behind the row's claims.

<!-- GEN:VALIDATION -->
Live checks run **2026-10-09** (report: `validation/2026-10-09.json`).

- Official docs/signup URLs: 18 reachable, 1 bot-protected (host alive), 4 returned errors, 3 unreachable from the checker.
- Unauthenticated catalog checks: 1 offering(s) confirmed listed, **5 not found** (flagged † in the offerings table), 18 not checkable without a key.

Catalog results by provider:

| Provider | Result |
| --- | --- |
| Google AI Studio | not checked — API key required |
| Groq | not checked — API key required |
| Mistral AI | not checked — API key required |
| OpenRouter | checked — 469 live models (exact match) |
| Hugging Face | not checked — API key required |
| Cloudflare Workers AI | not checked — API key required |
| SambaNova Systems | not checked — API key required |
| NVIDIA NIM | checked — 80 live models (exact match) |
| Cerebras | not checked — API key required |
| GitHub Models | not checked — API key required |
| Kilo Code / Kilo Gateway | checked — 401 live models (contains match) |
<!-- /GEN:VALIDATION -->

**Known limitations of this dataset** (stated so you don't have to assume them):

1. **Auth-walled catalogs.** Most providers only list models behind an API key. The generator has no keys, so those rows show *not checked* — not *confirmed*. A `lastVerified` date is the real signal there.
2. **Point-in-time claims.** Rate limits change without notice. Treat every number as "as of `lastVerified`", and re-check official docs before building anything quota-sensitive on top.
3. **Provider summaries vs per-model rows.** Provider-level `rateLimits` strings are summaries; per-model rows are authoritative for that model.
4. **Geographic restrictions** are not tracked. **Latency** figures in the raw dataset are site-measured request latency under the site's own methodology, not provider SLAs.

## Using the data

Everything is plain JSON — no SDK, no wrapper:

```bash
# list every permanent-free model offering (tested, no dependencies)
node -e 'const d=require("./data/directory.json");d.offerings.filter(o=>o.category==="permanent-free").forEach(o=>console.log(o.providerDisplayName, o.modelDisplayName, `(${o.rateLimits.documented})`))'
```

**Discover current free routes live** (tested 2026-10-09, no API key required):

```bash
curl -s https://openrouter.ai/api/v1/models \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>JSON.parse(d).data.filter(m=>m.id.endsWith(":free")).forEach(m=>console.log(m.id)))'
```

Official-provider endpoints are OpenAI-compatible; base URLs verified reachable (HTTP 401/403 = alive, auth required) on 2026-10-09:

| Provider | Base URL | Source |
| --- | --- | --- |
| Groq | `https://api.groq.com/openai/v1` | [official docs](https://console.groq.com/docs) |
| Cerebras | `https://api.cerebras.ai/v1` | [official docs](https://docs.cerebras.ai/) |
| SambaNova | `https://api.sambanova.ai/v1` | [official docs](https://docs.sambanova.ai/) |
| OpenRouter | `https://openrouter.ai/api/v1` | [official docs](https://openrouter.ai/docs) |

Get a key from the row's **Get an API key** link, then point any OpenAI SDK client at the base URL above. Provider-specific quickstarts are one click away in each row's **Docs** link.

**More from OpenGPU Radar** (the project that maintains this dataset):

- [Live directory](https://opengpuradar.com/free-llm-apis?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — the same data, browsable
- [Free LLM hub](https://opengpuradar.com/free-llm?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — verification radar and live provider status for the whole cluster
- [No-credit-card setup guide](https://opengpuradar.com/learn/free-llm-apis-guide?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — step-by-step tutorial for getting started
- [Playground](https://opengpuradar.com/playground?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — try models with your own key, no signup here
- [VRAM / GPU calculator](https://opengpuradar.com/calculator?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — can your hardware run a model locally?
- [GPU comparison hub](https://opengpuradar.com/compare?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis) — renting instead of free-tiering?

## Report outdated information

Free-tier terms drift fast. If a row is wrong — a limit changed, a model disappeared, a link died — **please tell us**:

1. Open an issue with the [outdated-information template](../../issues/new?template=outdated-info.yml), or
2. Point us at the official source (docs URL or provider announcement) that shows the change.

Reports citing an official source are prioritized. Corrections flow back into OpenGPU Radar's authoritative dataset first; this repository's snapshots are refreshed from it.

See [CONTRIBUTING.md](CONTRIBUTING.md) for additions, PRs, and what we do and don't accept.

## Regenerating

This repository is fully generated from two verbatim snapshots of the upstream dataset:

```bash
node scripts/generate.mjs            # derive data/directory.json + README tables from data/*.json
node scripts/generate.mjs --online   # + dated live-check report in validation/
node scripts/generate.mjs --check    # validate schema, duplicates, URLs, README consistency, secrets
```

Maintainers refresh the snapshots with `node scripts/generate.mjs --from <opengpu-radar>/app/src/data`. `--check` must pass before publishing.

## License

MIT — see [LICENSE](LICENSE). Attribution is appreciated; the upstream dataset is maintained by [OpenGPU Radar](https://opengpuradar.com?utm_source=github&utm_medium=referral&utm_campaign=free-llm-apis).
