---
author: Daniel Kliewer
canonical_url: /blog/2026-08-08-building-rehab-analyzer-with-hermes
date: 08-08-2026
description: "A full retrospective and replication guide for rehab-analyzer: a local-first real-estate rehab cost estimator built entirely with Hermes Agent. Covers the architecture, the provider/adapters, the real-photo pipeline (Redfin via Playwright, Google Places, Street View, Esri, Geoapify), the local-LLM estimate step, every bug we hit, and the exact Hermes environment setup that makes the whole thing reproducible."
image: /images/rehab-analyzer-result-view.png
layout: post
title: 'Building a Local-First Rehab Cost Analyzer with an AI Agent (Full Build + Replication Guide)'
og:description: "How a single Hermes Agent session produced a working Next.js + local-LLM rehab estimator — and the exact steps to reproduce it."
og:image: /images/rehab-analyzer-result-view.png
og:title: 'Building a Local-First Rehab Cost Analyzer with an AI Agent (Full Build + Replication Guide)'
og:type: article
og:url: /blog/2026-08-08-building-rehab-analyzer-with-hermes
tags:
  - ai-agents
  - hermit-agent
  - local-first-ai
  - sovereign-ai
  - nextjs
  - real-estate
  - agent-infrastructure
---


## Why this post exists

This is both a **retrospective** and a **replication guide**. Over a single working
session, an AI agent (Hermes Agent, running locally on my Mac) took a vague idea —
"estimate rehab cost from public property data, locally" — and produced a working,
committed, pushed-to-GitHub application. No human wrote the code by hand; the agent
did, and I (the human) steered, reviewed the rendered output, and flagged defects at
a craft level.

If you want to reproduce the result, the **exact** commands, the environment
gotchas, the API schemas we reverse-engineered, and the bugs we hit are all here. The
repository is public:

- **Repo:** https://github.com/kliewerdaniel/rehab-analyzer

The thesis underneath it: *intelligence is not the model — it's the accumulated,
encapsulated decisions that shaped the build.* The agent is a vehicle for those
decisions; the decisions are what survive.

---

## What the application does

`rehab-analyzer` answers one question: **given an address, what will it cost to rehab
this property, and what's it worth after?**

1. **Geocode** the address (Nominatim) → lat/lon.
2. **Fetch metadata** from the free-tier **ATTOM** provider — covering year built,
   square footage, beds/baths, lot size, last sale price, property taxes, and
   features.
3. **Reconcile** the record: canonical provider, unit-vs-building scope detection,
   per-field provenance, and conflict flags (e.g. divergent `year_built`). With a
   single metadata source the reconciler notes that no cross-provider comparison is
   available; it re-engages automatically if a second provider is added. ARV is
   pinned to the last sale price when available.
4. **Estimate rehab cost** with a **local, OpenAI-compatible LLM** (I run `gemma4` on
   `:8080` — no cloud, no API bill).
5. **Pull real photos** of the property from a chain of legitimate sources, so the
   human sees the actual building, not a synthesized guess.

The governing principle throughout was **metadata > pixels**: drive every decision
from verified provider records; treat photos as supporting evidence, not as the input
to a model.

---

## Architecture

The project is a local-first Next.js 14 app (App Router, TypeScript, Tailwind,
salmon/teal theme, Framer Motion) backed by a `node:sqlite` cache. A legacy FastAPI
layer is retained for its tested provider adapters and as a porting reference, but the
Next.js app is what runs.

```
rehab-analyzer/
├── nextjs/            # ACTIVE app
│   ├── app/           # /, /history, /history/[id], /api/analyze, /api/history, /api/history/[id], /api/photo/[file]
│   ├── lib/
│   │   ├── adapters/  # attom.ts (metadata-only)
│   │   ├── photos.ts  # getPropertyPhoto() source chain
│   │   ├── db.ts      # node:sqlite (address-keyed cache)
│   │   ├── llm.ts     # local OpenAI-compatible client
│   │   ├── orchestrator.ts
│   │   ├── config.ts  # reads all env vars
│   │   └── types.ts
│   └── components/    # ResultView, ui/*
├── app/               # LEGACY FastAPI layer (tests still green)
└── assets/            # README screenshot
```

### The photo source chain

This is the part that took the most iteration, and it's the most reusable idea here.
The app tries sources in priority order and returns the first one that resolves:

| Priority | Source | Needs | Notes |
|----------|--------|-------|-------|
| 1 | Zillow (personal use) | `REHAB_ZILLOW_SCRAPE=1` | Off by default; ToS-restricted, captcha-prone. |
| 2 | **Redfin** | `REHAB_REDFIN=1` (default) | Headless Playwright fetch of real `cdn-redfin.com` listing photos — most authoritative for the exact building. |
| 3 | **Google Places** | `GOOGLE_MAPS_API_KEY` | Real uploaded building/unit photos (exterior + interior). |
| 4a | Street View | `GOOGLE_MAPS_API_KEY` | Outdoor facade (requires Street View API enabled). |
| 4b | Mapillary | `MAPLLARY_TOKEN` | Street-level crowdsourced photos. |
| 4c | Esri Aerial | — | Keyless `/export` static aerial. |
| 4d | Geoapify | `GEOAPIFY_KEY` | Static map + marker (free, 3000/day). |
| — | none | — | Returns a geocoded location card ("location, not a photo"). |

Two engineering details matter:

- **Runtime photo serving.** `next start` serves `public/` from a *build-time
  snapshot*, so anything written to `public/photos/` after `next build` 404s. The fix
  is a dynamic route, `app/api/photo/[file]/route.ts`, that always reads from disk.
- **WebP vs JPEG content-type.** Redfin's CDN serves URLs ending in `.jpg` but
  returns **WebP bytes**. We sniff the real magic bytes and store the correct
  extension so the `/api/photo` route sends the right `Content-Type` (otherwise
  Safari renders blank). This is now applied to every source.

---

## Replicating the build

### 0. Prerequisites

- macOS (the agent runs in the Hermes desktop app; the app itself is cross-platform
  but the commands below assume a Mac with Homebrew).
- **Node >= 22.5** — the app uses the built-in `node:sqlite` module. Node 24 via
  Homebrew is what we used.
- **Homebrew**, `git`, `gh` (GitHub CLI, authenticated).
- A local OpenAI-compatible LLM **or** the deterministic demo fallback.
- Optional: free-tier API keys (see below).

### 1. Hermes Agent setup (the part nobody tells you)

The single biggest reproducibility risk is the **agent's shell environment**, not the
code. Hermes runs a Python venv (we had 3.11 on the agent side). When the agent shells
out to your own service venvs (py3.14 in our case), the inherited environment bleeds
over and **crashes the child process mid-request**. The poison variables:

```
PYTHONPATH=/Users/.../hermes/.venv/lib/python3.11/site-packages
PYTHONHOME=/Users/.../hermes/.venv
```

If you launch a child service (uvicorn, a ComfyUI-style server, a local LLM) from
inside Hermes **without stripping these**, the child pulls the agent's numpy/py3.11
into a py3.14 interpreter and dies. The rule, burned in:

> **Always export a clean env for any child service the agent starts:**
> ```bash
> env -u PYTHONPATH -u PYTHONHOME ./.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
> ```
> and for Node:
> ```bash
> export PYTHONPATH=""; export PYTHONHOME=""
> env -u PYTHONPATH -u PYTHONHOME npm run build
> ```

This is not optional. It is the difference between "works on my machine" and a silent
crash you'll spend an hour chasing.

Also: the agent should **never start, stop, or restart the user's LLM**. In our setup
`gemma4` runs on `:8080` and is user-launched; the agent only *talks* to it. Keep the
human's inference server sovereign.

### 2. Scaffold the Next.js app

```bash
mkdir -p ~/Projects/rehab-analyzer && cd ~/Projects/rehab-analyzer
npx create-next-app@14 nextjs --ts --tailwind --app --eslint --src-dir=false --import-alias="@/*"
cd nextjs
export PATH=/opt/homebrew/opt/node@24/bin:$PATH   # node:sqlite needs >=22.5
npm install
```

Add the runtime deps:

```bash
npm install framer-motion lucide-react clsx tailwind-merge
npm install playwright        # used at RUNTIME for Redfin, not just dev
npx playwright install chromium
```

> Note: `playwright` must be a **runtime** dependency (`dependencies`), not
> `devDependencies`, because `getPropertyPhoto()` imports it dynamically to fetch
> Redfin. If it's only in dev deps, production builds can't load it.

### 3. Provider adapters (free-tier schemas we verified)

Free tiers are metadata-only by design — no photos, no AVM. We reverse-engineered the
real response shape for the one provider we use so you don't have to.

> **Note:** the app originally reconciled **RentCast + ATTOM** across providers. RentCast
> was later dropped (it 404s for many addresses and adds no free-tier value); **ATTOM**
> is now the sole metadata source. The reconciler still handles a single record
> gracefully — it emits a "Single metadata provider — no cross-provider comparison
> available" note instead of fabricating a comparison. The reconciliation logic
> (scope detection, provenance, conflict flags) is intact and re-engages automatically
> if a second provider is added back.

**ATTOM** — base `https://api.gateway.attomdata.com/propertyapi/v1.0.0`, header `apikey`:

- `GET /property/detail?address=<addr>` → 200. Structure: `summary.yearbuilt`,
  `building.size.universalsize`.
- `/property/snapshot` → 200, no photos.
- `/property/avm`, `/valuation`, `/image`, `/phototour` → **404** on free tier.

The adapter contract is an abstract `ProviderAdapter` with `get_property(address)`
and `health_check()`. Each adapter maps the provider's response onto a shared
`PropertyRecord` (metadata-only: `avm=null`, with `data_warnings` for missing
photos/avm). Reconciliation then detects scope mismatch
(unit record vs building record) and flags conflicting fields rather than averaging
them blindly; with a single provider it notes that no cross-provider comparison is
available rather than fabricating one.

### 4. Local LLM estimate

`lib/llm.ts` is an OpenAI-compatible client pointed at your local endpoint:

```ts
const client = new OpenAI({
  baseURL: process.env.REHAB_LLM_BASE_URL || "http://localhost:8080/v1",
  apiKey: process.env.REHAB_LLM_API_KEY || "not-needed",  // blank for local
});
```

The prompt enforces **metadata > pixels**: the model estimates *rehab cost only* from
the reconciled record, never from a photo. We parse the response strictly —
`per_category`, `total_rehab_low`, `total_rehab_high` are required keys, validated
through `RehabAnalysis.model_validate`. A too-lenient parser was an early bug; the
strict version is what shipped.

If you don't have a local LLM, set `REHAB_DEMO=1` for a deterministic
rule-based estimator (cost table by category: kitchen `[25,75]` per sqft-ish,
bath `[8000,20000]`, roof `[5,12]`/sqft, flooring `[4,12]`, hvac `[6000,15000]`).

### 5. The photo pipeline

`lib/photos.ts` exports `getPropertyPhoto(address)` which runs the chain in the table
above. The Redfin fetcher is the interesting one:

```ts
const { chromium } = await import("playwright");
const browser = await chromium.launch({
  headless: true,
  args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
});
const ctx = await browser.newContext({
  userAgent: BROWSER_UA,        // Mac/Chrome 124 constant
  viewport: { width: 1280, height: 900 },
  locale: "en-US",
});
await ctx.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  (window.navigator as any).chrome = { runtime: {} };
});
// goto redfin.com, fill search box, submit, wait for listing,
// extract <img src> matching cdn-redfin.com
```

Redfin showed **no verify-human wall** in testing — a full branded 404 for a bad
deep-link, and a real listing when driven through the search box. We extract the
listing photo URLs straight from the DOM (no lightbox clicking needed) and download
them like any other source. Classification is heuristic (hero = exterior, rest =
interior); labels are advisory.

### 6. The env file

`.env.local` (gitignored, never committed):

```bash
ATTOM_API_KEY=...
REHAB_LLM_BASE_URL=http://localhost:8080/v1
REHAB_LLM_MODEL=gemma-4-26B-A4B-it-ultra-uncensored-heretic-Q4_K_M.gguf
REHAB_LLM_API_KEY=            # blank for local
REHAB_DEMO=0
GEOAPIFY_KEY=...              # optional, real map+marker
GOOGLE_MAPS_API_KEY=...       # optional, Places + Street View
MAPLLARY_TOKEN=...            # optional
REHAB_REDFIN=1                # default on
REHAB_ZILLOW_SCRAPE=0         # off (ToS)
REHAB_DB_PATH=./rehab_cache.db
```

> **Secret hygiene:** the agent must never print these keys to logs, never commit
> `.env.local`, and treat it as unreadable except via terminal. We keep `.env.example`
> tracked and `.env.local` gitignored.

### 7. Run it

```bash
cd ~/Projects/rehab-analyzer/nextjs
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
export PYTHONPATH=""; export PYTHONHOME=""   # strip agent poison
./start.sh                                  # or: npm run start -- --port 3100
```

Then `curl -X POST http://127.0.0.1:3100/api/analyze -H "Content-Type: application/json" -d '{"address":"311 Cedar St, Seattle, WA 98121"}'`.

### 8. Post-build refinements: CRUD, downloads, hardening

After the first push we hardened the app into something you'd actually keep using:

- **Saved-analysis CRUD.** The `node:sqlite` cache gained `DELETE` and a partial
  `UPDATE` (rename label, free-text notes, and a manual rehab-cost override
  low/high that takes precedence over the model's estimate). A self-migrating schema
  adds these columns on first run.
- **`GET` / `PATCH` / `DELETE` on `/api/history/[id]`.** PATCH validates its body and
  only writes the keys you send; the UI's history list has inline rename + delete,
  and the detail page has a notes field and override inputs.
- **One-click downloads.** Every gallery image and the hero now carry a
  `/api/photo/<file>?download=1` link that sets `Content-Disposition: attachment`
  (verified: correct filename + `Content-Type`). The detail view also offers
  "Copy JSON" and "Download all".
- **Hardened `analyze`.** The route now validates `address` is a non-empty string
  capped at 200 characters and returns sanitized errors (no stack traces leak).
- **ATTOM-only metadata.** RentCast was removed entirely (it 404s for many
  addresses and added no free-tier value). The reconciler handles a single record
  gracefully and re-engages cross-provider comparison if a second source returns.

---

## Lessons learned (the real value)

1. **Strip the agent's env before launching any child service.** This was the most
   expensive lesson. The `PYTHONPATH`/`PYTHONHOME` poison from Hermes's own venv will
   crash a different-version interpreter. Build the `env -u` prefix into every launch
   command. (`python-multipart` missing and a missing cache dir were the other two
   launch blockers — both one-line fixes once you know to look.)

2. **`next start` freezes `public/`.** Anything your app writes to `public/` after
   build is invisible. Serve runtime artifacts through a dynamic route. Don't fight
   the framework; route around it.

3. **Trust bytes, not URLs.** CDNs lie about extensions. Sniff magic bytes and store
   the true type. One-line bug, hours of "why is Safari blank" debugging.

4. **Free tiers are metadata-only by design.** Don't guess the API surface — scrape a
   reference MCP-server repo or hit the endpoint and read the 200/404 reality. Our
   verified schemas above are the artifact of that.

5. **Reconcile, don't average.** Unit-level vs building-level records for the same
   address disagree in *structure*. Detecting scope mismatch and surfacing conflicts
   is more honest than blending them.

6. **The agent is a craft-iteration partner, not a one-shot generator.** The human
   reviewed rendered output and gave terse, correct corrections ("interior labels are
   wrong", "WebP blank in Safari"). The agent's checker is the blind spot; the human's
   read is almost always right. Root-cause, don't defensively re-verify.

7. **Keep the user's inference server sovereign.** The agent never starts/stops
   `gemma4`. It only calls the endpoint. This boundary prevents the agent from
   poisoning the user's running services (and, relatedly, from inheriting their env).

8. **Two-write publishing.** Blog/docs that build from a separate source dir need the
   file in *both* places. A draft in the canonical archive never reaches the site.
   (We applied this discipline to the project README too.)

---

## Current state & what's next

The app is committed and pushed to
[github.com/kliewerdaniel/rehab-analyzer](https://github.com/kliewerdaniel/rehab-analyzer)
(public). It runs locally, pulls a real **Redfin** gallery (most authoritative for the
exact building) with **Google Places** as a fallback, and estimates rehab cost from a
local LLM. Beyond the initial build it now supports **saved-analysis CRUD** (rename,
notes, manual rehab-cost overrides), **one-click photo downloads**, and a **hardened
`analyze` route** (input validation + sanitized errors). One visible refinement
remains: the Redfin "interior" label is a heuristic (floor-plan thumbnails get
mislabeled) — worth a follow-up pass.

The deeper point stands: a local-first tool, built by an agent, reviewed by a human,
running on your own hardware with your own model. No cloud dependency for the
intelligence. That's the shape of sovereign software.
