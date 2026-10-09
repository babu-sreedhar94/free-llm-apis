#!/usr/bin/env node
/**
 * generate.mjs — derive the public directory from the vendored source snapshots.
 *
 * Usage:
 *   node scripts/generate.mjs                         # derive data/directory.json + README blocks from data/*.json
 *   node scripts/generate.mjs --online                # + live URL/catalog checks -> validation/<date>.json
 *   node scripts/generate.mjs --from <site-data-dir>  # refresh vendored snapshots from an OpenGPU Radar checkout, then derive
 *   node scripts/generate.mjs --check                 # validate everything (schema, dupes, URLs, README blocks, secrets)
 *
 * Zero dependencies. Node >= 18 (global fetch).
 *
 * Source of truth: the two vendored JSON snapshots in data/ are copied verbatim from
 * OpenGPU Radar's authoritative dataset (app/src/data/). Everything else in this
 * repository is derived from them and can be regenerated with this script.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const VALIDATION_DIR = path.join(ROOT, "validation");
const README_PATH = path.join(ROOT, "README.md");
const SOURCE_FILES = ["free-offerings.json", "free-providers.json"];

const OFFERING_REQUIRED = [
  "id", "canonicalModelId", "canonicalProviderId", "modelDisplayName", "providerDisplayName",
  "providerModelId", "freeStatus", "requiresCreditCard", "requiresPhone", "rateLimits",
  "contextLimit", "apiCompatibility", "officialDocsUrl", "officialSignupUrl",
  "verificationStatus", "lastVerified", "isOfficialProvider", "isAggregator",
];
const PROVIDER_REQUIRED = [
  "id", "name", "slug", "models", "modelCount", "requiresCreditCard", "tier",
  "officialDocsUrl", "officialSignupUrl",
];

/** Offering-level freeStatus -> directory category (site taxonomy, see src/lib/types/free-llm.ts). */
const CATEGORIES = [
  {
    id: "permanent-free", label: "Permanent free", sourceValues: ["PERMANENT_FREE"],
    definition: "Access that does not expire, within published recurring rate limits. No credits to burn down.",
  },
  {
    id: "renewable-quota", label: "Renewable quota", sourceValues: ["FREE_TIER"],
    definition: "Free access subject to recurring limits (rate limits and/or daily allowances) that reset. Renewable, not one-time.",
  },
  {
    id: "aggregator-free", label: "Aggregator free", sourceValues: ["FREE_AGGREGATOR", "AGGREGATOR_FREE"],
    definition: "Free model routes offered by an aggregator platform, not by the model developer directly.",
  },
  {
    id: "trial-credits", label: "Trial / credits", sourceValues: ["TRIAL", "FREE_CREDIT", "TEMPORARY_PREVIEW"],
    definition: "Time-bound or credit-bound trial access. Ends when the trial window or promotional credits are exhausted.",
  },
  {
    id: "community-free", label: "Community free", sourceValues: ["COMMUNITY_FREE"],
    definition: "Community- or platform-sponsored free access governed by the hosting platform.",
  },
  {
    id: "card-required", label: "Requires card", sourceValues: ["FREE_WITH_CARD"],
    definition: "Free only behind a payment method on file (e.g. trial auto-renewal).",
  },
  {
    id: "unclassified", label: "Unclassified", sourceValues: ["UNKNOWN"],
    definition: "Recorded but not yet classified.",
  },
];

const categoryOf = (freeStatus) => {
  const hit = CATEGORIES.find((c) => c.sourceValues.includes(freeStatus));
  if (!hit) throw new Error(`freeStatus outside published taxonomy: ${freeStatus}`);
  return hit.id;
};

/** Live catalog checks that work WITHOUT an API key. Providers not listed here cannot be
 *  checked unauthenticated; their catalog status is recorded as auth_required. */
const CATALOG_CHECKS = {
  openrouter: {
    url: "https://openrouter.ai/api/v1/models",
    parse: (j) => j.data.map((m) => m.id),
    match: "exact",
    note: "Public model catalog, no key required.",
  },
  "nvidia-nim": {
    url: "https://integrate.api.nvidia.com/v1/models",
    parse: (j) => j.data.map((m) => m.id),
    match: "exact",
    note: "Public model catalog, no key required.",
  },
  "kilo-code": {
    url: "https://api.kilo.ai/api/gateway/models",
    parse: (j) => (Array.isArray(j) ? j : j.data || j.models || []).map((m) => m.id || m.name || String(m)),
    match: "contains",
    note: "Public gateway model list; 'contains' matches because the gateway prefixes IDs with the upstream namespace.",
  },
};

const AUTH_REQUIRED_REASON = "Official API model listing requires an API key; no key is available to this generator (unauthenticated requests return 401/403 or the endpoint is account-gated).";

/* ------------------------------------------------------------------ helpers */

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const esc = (s) => String(s).replace(/\|/g, "\\|");

function loadSources() {
  const offerings = readJson(path.join(DATA_DIR, "free-offerings.json"));
  const providers = readJson(path.join(DATA_DIR, "free-providers.json"));
  return { offerings, providers };
}

/** Join offerings -> providers via provider id or slug (site ids differ: e.g.
 *  canonicalProviderId "mistral" <-> provider id "mistral-ai" / slug "mistral"). */
function crosswalk(offerings, providers) {
  const byKey = new Map();
  for (const p of providers) { byKey.set(p.id, p); byKey.set(p.slug, p); }
  const rows = offerings.map((o) => {
    const p = byKey.get(o.canonicalProviderId);
    if (!p) throw new Error(`offering ${o.id}: provider "${o.canonicalProviderId}" not found by id or slug`);
    return { offering: o, provider: p };
  });
  return rows;
}

function buildStats(rows, providers) {
  const byCategory = {};
  for (const c of CATEGORIES) byCategory[c.id] = 0;
  for (const { offering } of rows) byCategory[categoryOf(offering.freeStatus)]++;
  const dates = rows.map((r) => r.offering.lastVerified).sort();
  return {
    providerCatalogCount: providers.length,
    providersWithOfferings: new Set(rows.map((r) => r.provider.id)).size,
    offeringCount: rows.length,
    byCategory,
    verificationStatus: rows.reduce((a, r) => {
      a[r.offering.verificationStatus] = (a[r.offering.verificationStatus] || 0) + 1; return a;
    }, {}),
    lastVerifiedRange: { from: dates[0], to: dates[dates.length - 1] },
    requirements: {
      requiresCreditCard: rows.filter((r) => r.offering.requiresCreditCard).length,
      requiresPhone: rows.filter((r) => r.offering.requiresPhone).length,
      requiresAccount: rows.filter((r) => !!r.offering.officialSignupUrl).length,
      geographicRestrictionsTracked: false,
    },
  };
}

async function urlCheck(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "user-agent": "free-llm-apis-directory-validator/1.0" } });
    const status = res.status;
    const outcome = status >= 200 && status < 400 ? "ok" : status === 401 || status === 403 ? "blocked" : "broken";
    return { url, status, outcome };
  } catch (e) {
    return { url, status: 0, outcome: "unreachable", error: String(e.cause?.code || e.name || e.message).slice(0, 80) };
  }
}

async function liveChecks(rows, providers) {
  const urls = [...new Set([
    ...rows.flatMap((r) => [r.offering.officialDocsUrl, r.offering.officialSignupUrl]),
    ...providers.flatMap((p) => [p.officialDocsUrl, p.officialSignupUrl]),
  ])];
  const urlResults = await Promise.all(urls.map(urlCheck));
  const urlOutcome = Object.fromEntries(urlResults.map((r) => [r.url, r]));

  const catalogResults = {};
  const liveCheckByOffering = {};
  const providerSeen = new Set();
  for (const { offering: o, provider: p } of rows) {
    if (providerSeen.has(p.id)) continue;
    providerSeen.add(p.id);
    const check = CATALOG_CHECKS[p.id];
    if (!check) {
      catalogResults[p.id] = { provider: p.name, status: "auth_required", note: AUTH_REQUIRED_REASON };
      continue;
    }
    try {
      const res = await fetch(check.url, { signal: AbortSignal.timeout(20000), headers: { "user-agent": "free-llm-apis-directory-validator/1.0" } });
      if (!res.ok) {
        catalogResults[p.id] = { provider: p.name, status: "auth_required", httpStatus: res.status, note: AUTH_REQUIRED_REASON };
        continue;
      }
      const ids = check.parse(await res.json());
      catalogResults[p.id] = { provider: p.name, status: "checked", catalogUrl: check.url, match: check.match, liveModelCount: ids.length, note: check.note };
    } catch (e) {
      catalogResults[p.id] = { provider: p.name, status: "unreachable", note: String(e.cause?.code || e.name || e.message).slice(0, 80) };
    }
  }

  const idsCache = {};
  for (const { offering: o, provider: p } of rows) {
    const cat = catalogResults[p.id];
    if (cat?.status !== "checked") {
      liveCheckByOffering[o.id] = { status: "not_checked", reason: cat?.status || "unknown", checkedAt: null };
      continue;
    }
    const check = CATALOG_CHECKS[p.id];
    if (!idsCache[cat.catalogUrl]) {
      const res = await fetch(cat.catalogUrl, { signal: AbortSignal.timeout(20000), headers: { "user-agent": "free-llm-apis-directory-validator/1.0" } });
      idsCache[cat.catalogUrl] = check.parse(await res.json());
    }
    const found = checkMatch(idsCache[cat.catalogUrl], o.providerModelId, check.match);
    liveCheckByOffering[o.id] = {
      status: found ? "listed" : "not_found",
      checkedAt: new Date().toISOString(),
      source: cat.catalogUrl,
      match: check.match,
    };
  }

  const checkedIds = Object.keys(liveCheckByOffering);
  const summary = {
    urlChecks: { total: urlResults.length, ok: urlResults.filter((r) => r.outcome === "ok").length, blocked: urlResults.filter((r) => r.outcome === "blocked").length, broken: urlResults.filter((r) => r.outcome === "broken").length, unreachable: urlResults.filter((r) => r.outcome === "unreachable").length },
    catalogChecks: Object.values(catalogResults),
    offerings: {
      listed: checkedIds.filter((id) => liveCheckByOffering[id].status === "listed").length,
      notFound: checkedIds.filter((id) => liveCheckByOffering[id].status === "not_found").length,
      notChecked: checkedIds.filter((id) => liveCheckByOffering[id].status === "not_checked").length,
    },
  };
  return { urlResults, catalogResults, liveCheckByOffering, summary };
}

function checkMatch(ids, modelId, mode) {
  return mode === "exact" ? ids.includes(modelId) : ids.some((i) => String(i).includes(modelId));
}

/* ------------------------------------------------------------- directory.json */

function buildDirectory({ offerings, providers }, stats, live) {
  const priorLive = live ? null : (existingValidation()?.offerings || null);
  const rows = crosswalk(offerings, providers);
  const providerOut = providers.map((p) => {
    const mine = rows.filter((r) => r.provider.id === p.id);
    const out = {
      ...p,
      category: undefined,
      offerings: mine.map((r) => r.offering.id),
      offeringCount: mine.length,
      sources: { docs: p.officialDocsUrl, signup: p.officialSignupUrl },
    };
    delete out.category;
    return out;
  });
  const offeringOut = rows.map(({ offering: o, provider: p }) => {
    const out = {
      ...o,
      category: categoryOf(o.freeStatus),
      providerKey: p.id,
      sources: { docs: o.officialDocsUrl, signup: o.officialSignupUrl },
    };
    const checkMap = live?.liveCheckByOffering || priorLive;
    if (checkMap?.[o.id]) out.liveCheck = checkMap[o.id];
    return out;
  });
  const sourceHashes = {};
  for (const f of SOURCE_FILES) sourceHashes[f] = "sha256:" + sha256(fs.readFileSync(path.join(DATA_DIR, f)));
  return {
    meta: {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      generatedBy: "scripts/generate.mjs",
      siteDirectory: "https://opengpuradar.com/free-llm-apis",
      siteDataset: "https://opengpuradar.com/data/free-offerings.json",
      sourceFiles: sourceHashes,
      ...(live ? { validationReport: `validation/${live.date}.json` } : {}),
    },
    taxonomy: CATEGORIES.map(({ id, label, definition, sourceValues }) => ({ id, label, definition, sourceValues })),
    coverage: {
      geographicRestrictions: "not-tracked",
      localSelfHosted: "not-part-of-api-directory",
      creditCardRequired: "excluded-from-listing",
      note: "Fields are present only where verified. Geographic restrictions and local/self-hosted options are not part of this dataset.",
    },
    stats,
    providers: providerOut,
    offerings: offeringOut,
  };
}

/* ------------------------------------------------------------------- README */

function markerBlock(readme, name, content) {
  const open = `<!-- GEN:${name} -->`;
  const close = `<!-- /GEN:${name} -->`;
  const i = readme.indexOf(open);
  const j = readme.indexOf(close);
  if (i === -1 || j === -1) throw new Error(`README missing markers for ${name}`);
  return readme.slice(0, i + open.length) + "\n" + content.trimEnd() + "\n" + readme.slice(j);
}

function statsBlock(stats) {
  const catCount = (id) => stats.byCategory[id] ?? 0;
  const date = (iso) => iso.slice(0, 10);
  return [
    "| Metric | Value |",
    "| --- | --- |",
    `| Providers in catalog | ${stats.providerCatalogCount} |`,
    `| Providers with verified offerings | ${stats.providersWithOfferings} |`,
    `| Model offerings | ${stats.offeringCount} |`,
    `| Permanent free | ${catCount("permanent-free")} |`,
    `| Renewable quota | ${catCount("renewable-quota")} |`,
    `| Aggregator free | ${catCount("aggregator-free")} |`,
    `| Trial / credits | ${catCount("trial-credits")} |`,
    `| Community free | ${catCount("community-free")} |`,
    `| Requires credit card | ${stats.requirements.requiresCreditCard} |`,
    `| Requires phone verification | ${stats.requirements.requiresPhone} |`,
    `| Requires an account | ${stats.requirements.requiresAccount} (all official key links) |`,
    `| Geographic restrictions | not tracked in this dataset |`,
    `| Rows marked VERIFIED_LIVE | ${stats.verificationStatus.VERIFIED_LIVE || 0} |`,
    `| Rows marked DOCUMENTED_FREE | ${stats.verificationStatus.DOCUMENTED_FREE || 0} |`,
    `| lastVerified range | ${date(stats.lastVerifiedRange.from)} → ${date(stats.lastVerifiedRange.to)} |`,
  ].join("\n");
}

function providersTable(directory) {
  const head = "| Provider | Tier (site dataset) | Offerings here | Rate limits (provider-level) | Get an API key | Official docs |\n| --- | --- | --- | --- | --- | --- |";
  const body = directory.providers
    .map((p) => {
      const rl = esc(p.rateLimits || "—");
      return `| ${esc(p.name)} | ${esc(p.tier)} | ${p.offeringCount} | ${rl} | [Get key](${p.sources.signup}) | [Docs](${p.sources.docs}) |`;
    })
    .join("\n");
  return head + "\n" + body;
}

function offeringsTable(directory) {
  const head = "| Provider | Model | Category | Rate limits | Context | API | lastVerified |\n| --- | --- | --- | --- | --- | --- | --- |";
  const stale = new Set(
    directory.offerings.filter((o) => o.liveCheck?.status === "not_found").map((o) => o.id)
  );
  const catLabel = Object.fromEntries(directory.taxonomy.map((t) => [t.id, t.label]));
  const ctx = (n) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));
  const body = directory.offerings
    .map((o) => {
      const mark = stale.has(o.id) ? " †" : "";
      return `| ${esc(o.providerDisplayName)} | ${esc(o.modelDisplayName)}${mark} | ${catLabel[o.category]} | ${esc(o.rateLimits.documented)} | ${ctx(o.contextLimit)} | ${o.apiCompatibility} | ${o.lastVerified.slice(0, 10)} |`;
    })
    .join("\n");
  return head + "\n" + body;
}

function validationBlock(directory, validation) {
  if (!validation) {
    return "_Live validation has not been run for this revision. Run `node scripts/generate.mjs --online` to produce a dated validation report._";
  }
  const s = validation.summary;
  const lines = [
    `Live checks run **${validation.date}** (report: \`validation/${validation.date}.json\`).`,
    "",
    `- Official docs/signup URLs: ${s.urlChecks.ok} reachable, ${s.urlChecks.blocked} bot-protected (host alive), ${s.urlChecks.broken} returned errors, ${s.urlChecks.unreachable} unreachable from the checker.`,
    `- Unauthenticated catalog checks: ${s.offerings.listed} offering(s) confirmed listed, **${s.offerings.notFound} not found** (flagged † in the offerings table), ${s.offerings.notChecked} not checkable without a key.`,
    "",
    "Catalog results by provider:",
    "",
    "| Provider | Result |",
    "| --- | --- |",
    ...s.catalogChecks.map((c) => {
      const val = c.status === "checked"
        ? `checked — ${c.liveModelCount} live models (${c.match} match)`
        : c.status === "auth_required" ? "not checked — API key required" : `${c.status}${c.httpStatus ? ` (HTTP ${c.httpStatus})` : ""}`;
      return `| ${esc(c.provider)} | ${val} |`;
    }),
  ];
  return lines.join("\n");
}

function renderReadme(directory, validation) {
  let readme = fs.readFileSync(README_PATH, "utf8");
  readme = markerBlock(readme, "GENERATED-AT", directory.meta.generatedAt.slice(0, 10));
  readme = markerBlock(readme, "STATS", statsBlock(directory.stats));
  readme = markerBlock(readme, "PROVIDERS", providersTable(directory));
  readme = markerBlock(readme, "OFFERINGS", offeringsTable(directory));
  readme = markerBlock(readme, "VALIDATION", validationBlock(directory, validation));
  return readme;
}

/* -------------------------------------------------------------------- check */

const SECRET_PATTERNS = [
  [/gh[pousr]_[A-Za-z0-9]{30,}/, "GitHub token"],
  [/github_pat_[A-Za-z0-9_]{20,}/, "GitHub fine-grained PAT"],
  [/sk-[A-Za-z0-9_-]{20,}/, "OpenAI-style secret key"],
  [/AKIA[0-9A-Z]{16}/, "AWS access key id"],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, "Slack token"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key block"],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === ".git" || e.name === "node_modules" ? [] : walk(p);
    return [p];
  });
}

function validate() {
  const errors = [];
  const { offerings, providers } = loadSources();

  for (const f of SOURCE_FILES) {
    if (!fs.existsSync(path.join(DATA_DIR, f))) errors.push(`missing source snapshot data/${f}`);
  }
  const directoryPath = path.join(DATA_DIR, "directory.json");
  if (!fs.existsSync(directoryPath)) { errors.push("missing data/directory.json — run generate first"); return errors; }
  const directory = readJson(directoryPath);

  // schema: required fields
  offerings.forEach((o) => OFFERING_REQUIRED.forEach((k) => {
    if (o[k] === undefined || o[k] === null || o[k] === "") errors.push(`offering ${o.id}: missing required field ${k}`);
  }));
  providers.forEach((p) => PROVIDER_REQUIRED.forEach((k) => {
    if (p[k] === undefined || p[k] === null || p[k] === "") errors.push(`provider ${p.id}: missing required field ${k}`);
  }));

  // duplicates
  const dupOffer = offerings.map((o) => o.id).filter((id, i, a) => a.indexOf(id) !== i);
  const dupProv = providers.map((p) => p.id).filter((id, i, a) => a.indexOf(id) !== i);
  dupOffer.forEach((id) => errors.push(`duplicate offering id: ${id}`));
  dupProv.forEach((id) => errors.push(`duplicate provider id: ${id}`));

  // url format
  const badUrl = [...offerings, ...providers].flatMap((r) => [r.officialDocsUrl, r.officialSignupUrl])
    .filter((u) => !/^https:\/\/[^\s]+\.[a-z]{2,}(\/|$|\?)/i.test(u || ""));
  badUrl.forEach((u) => errors.push(`malformed URL: ${u}`));

  // crosswalk resolves
  try { crosswalk(offerings, providers); } catch (e) { errors.push(e.message); }

  // taxonomy completeness + stats consistency
  if (directory.stats.offeringCount !== offerings.length) errors.push("stats.offeringCount mismatch vs source");
  const sumCats = Object.values(directory.stats.byCategory).reduce((a, b) => a + b, 0);
  if (sumCats !== offerings.length) errors.push("byCategory sum != offering count");
  for (const o of directory.offerings) {
    if (!CATEGORIES.some((c) => c.id === o.category)) errors.push(`offering ${o.id}: category outside taxonomy`);
  }

  // README blocks byte-match a fresh render (dates come from directory.json, so stable)
  const expected = renderReadme(directory, null);
  const actual = fs.readFileSync(README_PATH, "utf8");
  if (expected !== actual) {
    // allow validation block to carry a report; regenerate comparison excluding VALIDATION marker
    const strip = (t) => markerBlock(t, "VALIDATION", "CHECK");
    if (strip(expected) !== strip(actual)) errors.push("README generated blocks are stale — re-run generate");
  }

  // secrets
  for (const file of walk(ROOT)) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith(`data${path.sep}`) && rel.endsWith(".json")) {
      // source snapshots are data, still scanned below via content
    }
    const txt = fs.readFileSync(file, "utf8");
    for (const [re, label] of SECRET_PATTERNS) {
      if (re.test(txt)) errors.push(`possible secret (${label}) in ${rel}`);
    }
  }
  if (fs.existsSync(path.join(ROOT, ".env")) || fs.existsSync(path.join(ROOT, ".env.local"))) {
    errors.push(".env file present — must never enter the repository");
  }

  return errors;
}

/* --------------------------------------------------------------------- main */

async function main() {
  const args = process.argv.slice(2);
  const has = (f) => args.includes(f);
  const fromIdx = args.indexOf("--from");

  if (has("--check")) {
    const errors = validate();
    if (errors.length) {
      console.error(`✗ ${errors.length} validation error(s):`);
      errors.forEach((e) => console.error("  - " + e));
      process.exit(1);
    }
    console.log("✓ all validations passed");
    return;
  }

  if (fromIdx !== -1) {
    const src = args[fromIdx + 1];
    if (!src) { console.error("--from requires a directory"); process.exit(1); }
    for (const f of SOURCE_FILES) {
      const from = path.join(src, f);
      if (!fs.existsSync(from)) { console.error(`source not found: ${from}`); process.exit(1); }
      fs.copyFileSync(from, path.join(DATA_DIR, f));
      console.log(`refreshed data/${f} from ${src}`);
    }
  }

  if (!fs.existsSync(path.join(DATA_DIR, "free-offerings.json"))) {
    console.error("No source snapshots yet — run with --from <site>/src/data first."); process.exit(1);
  }

  const sources = loadSources();
  const rows = crosswalk(sources.offerings, sources.providers);
  const stats = buildStats(rows, sources.providers);

  let live = null;
  if (has("--online")) {
    const date = new Date().toISOString().slice(0, 10);
    console.log("running live URL + catalog checks...");
    const result = await liveChecks(rows, sources.providers);
    live = { date, ...result };
    fs.mkdirSync(VALIDATION_DIR, { recursive: true });
    const report = {
      date,
      method: "unauthenticated GET, node fetch, 15-20s timeout",
      summary: result.summary,
      urlChecks: result.urlResults,
      offerings: result.liveCheckByOffering,
    };
    fs.writeFileSync(path.join(VALIDATION_DIR, `${date}.json`), JSON.stringify(report, null, 2) + "\n");
    console.log(`wrote validation/${date}.json — ${result.summary.urlChecks.ok}/${result.summary.urlChecks.total} urls ok, ${result.summary.offerings.notFound} offerings not found in live catalogs`);
  }

  const directory = buildDirectory(sources, stats, live);
  fs.writeFileSync(path.join(DATA_DIR, "directory.json"), JSON.stringify(directory, null, 2) + "\n");

  const prior = existingValidation();
  const validation = live ? { date: live.date, summary: live.summary } : (prior ? { date: prior.date, summary: prior.summary } : null);
  fs.writeFileSync(README_PATH, renderReadme(directory, validation));
  console.log("wrote data/directory.json and README.md blocks");

  const errors = validate();
  if (errors.length) {
    console.error(`✗ ${errors.length} post-generation validation error(s):`);
    errors.forEach((e) => console.error("  - " + e));
    process.exit(1);
  }
  console.log("✓ generation + validation passed");
}

function existingValidation() {
  if (!fs.existsSync(VALIDATION_DIR)) return null;
  const files = fs.readdirSync(VALIDATION_DIR).filter((f) => f.endsWith(".json")).sort();
  if (!files.length) return null;
  return readJson(path.join(VALIDATION_DIR, files[files.length - 1]));
}

main().catch((e) => { console.error(e); process.exit(1); });
