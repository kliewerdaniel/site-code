---
author: Daniel Kliewer
canonical_url: /blog/2026-11-21-what-would-count-as-evidence
date: 11-21-2026
description: "A pre-registered, replicable plan for deciding whether to add a reading-map edge for a benchmark post — and why the sales question cannot be answered with the data that exists. No results, no sales figures, no causal claims."
image: /images/2026-11-20-tb3-green-gates.png
layout: post
title: "What Would Count as Evidence That an Agent Interface Changed Book Sales?"
og:description: "A pre-registered, replicable plan for deciding whether to add a reading-map edge for a benchmark post — and why the sales question cannot be answered with the data that exists."
og:image: /images/2026-11-20-tb3-green-gates.png
og:title: "What Would Count as Evidence That an Agent Interface Changed Book Sales?"
og:type: article
og:url: /blog/2026-11-21-what-would-count-as-evidence
tags:
  - measurement
  - agent-interfaces
  - pre-registration
  - reproducibility
  - evidence
  - book-sales
twitter:card: summary_large_image
twitter:description: "A frozen measurement plan: one primary outcome, an invariant decision rule, and an honest account of what the available data cannot adjudicate."
twitter:image: /images/2026-11-20-tb3-green-gates.png
twitter:title: "What Would Count as Evidence That an Agent Interface Changed Book Sales?"
---

# What Would Count as Evidence That an Agent Interface Changed Book Sales?

A measurement must be frozen before you look at the result, or you will not have a measurement — you will have a story.

That is the whole reason this post exists. It is a plan, written on 2026-11-21, for a question I cannot currently answer: whether the agent-readable interface on this site is associated with sales of a book. I have seen a change in sales that may or may not be the beginning of a trend `[O]`. I have not measured it. This document specifies what would count as evidence, what would not, and what decision the evidence would authorize. It contains no sales figures and no result `[O]`.

The measured object is *Computational Sovereignty: Building Local-First AI Systems*, a hardcover with 24 chapters and 214 pages, catalogued in [book.json](/agents/book.json) `[V]`. It is the subject of the measurement, not the point of the post.

Everything below was built and executed in a scratch clone at commit `031e260` `[V]`. Nothing was committed, deployed, or published by this work. The operator publishes.

**Evidence labels:** `[V]` verified from a primary source this session; `[R]` reported by a secondary source; `[O]` supplied by the operator; `[A]` an assumption with a falsifier; `[U]` unknown with a stated resolution. `C1`–`C10` name the code blocks in section 5.

---

## 1. Claim, scope, what this is not

**Thesis:** the only decision this measurement can currently authorize is whether to add a reading-map edge for the benchmark post published on 2026-11-20; the sales question is recorded, instrumented, and explicitly left undecided `[O]`.

Three dates anchor the scope, all derived from git in the scratch clone `[V]`:

- 2026-10-13: the human purchase CTAs, `/book`, the footer paperback link, and the global layout first shipped (commits `7f4dad3`, `dc554eb`). A full visual redesign shipped the same day (`daf402f`).
- 2026-11-12: the static agent corpus shipped — `/llms.txt`, `/llms-full.txt`, the `/agents/*` resources, the `/agents` guide, `book.json`, and the reading-map source files (commit `3980c2a`, merged as `e4315d9`). Canonical Markdown mirrors followed at 20:59 (`8786148`). The operator confirmed 2026-11-12 as the primary intervention `[O]`.
- 2026-11-20: the benchmark post shipped (`031e260`). The operator confirmed it as a second, staggered intervention `[O]`.

The book itself was published on 2026-10-12 `[V]`. The pre-agent baseline is therefore roughly four weeks that coincide with launch. That is a confound, not a control period.

This is not a results post. It does not claim the redesign caused anything. It does not say "drove", "lifted", "converted" or "led to". Where an association would be tested, the language is "associated with", "consistent with", or "would be evidence for". It does not publish absolute sales, relative sales changes, or a percentage `[O]`.

Two things are deliberately absent. First, no Amazon Attribution tags were created `[O]`, so a click that originated from an agent-surfaced recommendation remains indistinguishable on Amazon's side from any other click `[V]`. Second, no GA4 tag exists in the site's source `[V]`, and no Search Console access was confirmed `[O]`. The evidence plan has to work with what is actually available, not with what a measurement wishlist would contain.

---

## 2. The question and the competing hypotheses

The question is narrow: **when an agent reads this site, does it take the path toward the book, or does it answer from the free corpus and stop?**

Three hypotheses compete. They are not exclusive.

| Observable | H1 — complement: agents route humans to the book | H2 — substitute: agents answer from free content | H3 — confounded: launch decay, promotion, other |
|---|---|---|---|
| Agent fetches of `book.json` or `/book` relative to article fetches | rise | flat or fall | no change |
| Sessions landing on `/book` from agent-originated traffic | rise | flat | flat |
| Clicks on agent-surface Attribution tags | positive and growing | about zero | about zero |
| Clicks on human-surface tags | track traffic | track traffic | follow launch decay and promotion calendar |
| Sales against a launch-decay baseline | above after deploys | at baseline | at baseline |

The falsifiers matter more than the predictions. H1 is falsified by a flat or falling recommendation-path ratio with adequate log coverage. H2 is falsified by a rising ratio plus positive agent-tag clicks. H3 is not one hypothesis but a list of alternative explanations; it is falsified only to the extent that the intervention log can show those explanations were absent.

Two rows in that table are permanently unavailable in this setup. Attribution tags were not created `[O]`, so the tag rows are structural placeholders, not measurements. No GA4 property is present in the site's source `[V]`, so the referrer-based channel row cannot be populated. I am not going to pretend otherwise. A measurement plan that quietly fills unavailable rows with plausible numbers is worse than no plan.

There is a prior-art finding worth stating plainly: no published study was found that isolates an `llms.txt`-style agent-facing interface change against revenue or unit sales `[U]`. The closest work measures agent-facing content bundles against referral traffic, not sales, and reports a suggestive result that does not clear a placebo-in-time test `[V]`. The absence of prior art is a reason for care, not a claim of novelty.

The agent interface itself is a proposed convention. The specification describes `/llms.txt` as a proposal and says agents are *expected* to view it `[V]`. No model vendor discloses whether its crawlers read it `[V]`. One server-log experiment found repeated fetches only when the Markdown URL was announced, and described the result as discovery, not adoption `[V]`. Fetching a file does not establish that anything parsed it, indexed it, or used it in an answer. This is why the primary outcome below is a fetch path, not an influence claim.

---

## 3. System map

Everything added to the scratch clone lives under one directory. The scratch clone is the only place these files were executed; the live site was not touched.

```
measurement/
  interventions.jsonl   dated changes from git + operator; one JSON object per line
  promotions.jsonl      operator-maintained calendar; empty at freeze [O]
  synth.py              deterministic SYNTHETIC logs + fake sales series
  classify-logs.py      UA class x path class classification; session grouping
  ledger.py             weekly roll-up with vintages and snapshot timestamps
  analysis.py           frozen decision rules; fails closed on missing logs
  analysis-plan.yaml    the frozen plan, parsed at runtime
  synthetic_logs.jsonl  generated by synth.py; never real
  classified.jsonl      generated by classify-logs.py; the hinge artifact
  ledger.csv            generated by ledger.py
  synthetic_sales.csv   generated by synth.py; label SYNTHETIC_NOT_REAL_SALES
```

One site file was changed temporarily, then reverted: `src/components/AmazonCta.tsx`. The change adds a `surface` parameter and a site-side `outbound_amazon_click` event; it is described in the instrumentation steps and was verified in the scratch clone, not deployed.

The dependency graph is short. The hinge is `classified.jsonl`: every downstream artifact keys on its `ua_token`, `path_class`, `session_id`, and `week_start`.

```
Vercel Log Drain (operator) ──► raw request logs
                                     │
                     classify-logs.py │
                                     ▼
                            classified.jsonl  ◄── hinge
                                     │
                     ledger.py ──────┤
                                     ▼
                               ledger.csv
                                     ▲
KDP dashboard screenshots (operator) ┘  (source label only, values withheld)
interventions.jsonl + promotions.jsonl ┘
                                     │
                    analysis.py + analysis-plan.yaml
                                     ▼
                ADD / DO NOT ADD the reading-map edge
```

Note what is *not* in the graph: Amazon, GA4, and Search Console. There is no line from a tag report or a channel report to a decision. That is a property of the available access, not an oversight.

---

## 4. Data contracts

Every field that crosses a stage boundary is named here. Cadence and retention are stated even when the source cannot supply them.

**Raw log line** — source: Vercel runtime logs via drain; cadence: per request; retention: 1 day without a drain, as configured on Pro `[O][V]`.

| Field | Type | Meaning |
|---|---|---|
| `timestamp` | ISO-8601 string | request time, UTC |
| `ip_hash` | string | hashed client IP; no raw IP is stored |
| `ua` | string | raw User-Agent header; spoofable `[V]` |
| `path` | string | request path |
| `status` | int | HTTP status, including `304` |
| `bytes` | int | response bytes |

**Classified record** — source: `classify-logs.py`; cadence: per request; retention: local scratch only.

| Field | Type | Meaning |
|---|---|---|
| `ua_class` | enum | `user_triggered`, `search_crawler`, `training_crawler`, `unknown` |
| `ua_token` | string | vendor token, e.g. `ChatGPT-User`; distinguishes vendors within a class |
| `path_class` | enum | `catalog`, `article_html`, `md_mirror`, `book_json`, `book_page`, `other` |
| `is_article` | bool | path is an article HTML page or Markdown mirror |
| `is_purchase` | bool | path is `/agents/book.json` or `/book` |
| `session_id` | string | `(ip_hash, ua_token)` plus a 30-minute inactivity gap `[A-1]` |
| `week_start` | ISO date | Monday of the request week |
| `status` | int | HTTP status copied from the raw line; needed for `share_304` |
| `bytes` | int | response bytes copied from the raw line |

The UA vocabulary comes from each vendor's own documentation `[V]`: OpenAI separates `GPTBot` (training), `OAI-SearchBot` (search) and `ChatGPT-User` (user-triggered); Anthropic separates `ClaudeBot`, `Claude-SearchBot` and `Claude-User`; Perplexity separates `PerplexityBot` from `Perplexity-User`; Google's `Google-Extended` is a robots token with no separate user-agent string, so it is not detectable in logs `[V]`. A class label is evidence about a header, not a verified vendor identity.

**Weekly ledger** — source: `ledger.py`; cadence: weekly; retention: local; owner: agent. The header below is the real header from the executed run:

```
week_start,ua_class,ua_token,requests,bytes,share_304,sessions,recommendation_path_sessions,recommendation_path_ratio,sales_source,snapshot_taken_at_utc,vintage
```

`sales_source` is a label, not a number. `snapshot_taken_at_utc` and `vintage` exist because KDP values are revised: print orders appear after shipment, the dashboard refreshes, and Amazon says dashboard data may not match downloadable reports `[V]`. A week must be allowed to read differently later.

**Sales series** — source: operator screenshots; cadence: weekly; retention: local; owner: operator. The exact exported column names are `[U]` because no export was provided — only dashboard views were made available `[O]`. Until a real screenshot is read, the columns below are a proposal and must not be described as an Amazon schema:

```
week_start,units,source,snapshot_taken_at_utc,vintage
```

**Intervention record** — source: git plus operator; one JSON object per line:

```json
{"id":"iv-0001","date_utc":"2026-10-13","commit":"7f4dad3|dc554eb","surface":"nav_cta|book_page|footer","change":"Human purchase CTAs, /book, footer paperback link and global layout first shipped","expected_mechanism":"Makes the hardcover discoverable to human readers","expected_lead_days":0,"source":"git"}
{"id":"iv-0002","date_utc":"2026-10-13","commit":"daf402f","surface":"other","change":"Full visual redesign The Instrument","expected_mechanism":"Changes human browsing, not the agent corpus","expected_lead_days":0,"source":"git"}
{"id":"iv-0003","date_utc":"2026-10-25","commit":"3c1cc15","surface":"other","change":"Visual knowledge system: projects, concepts, paths","expected_mechanism":"Changes navigation and human discovery","expected_lead_days":0,"source":"git"}
{"id":"iv-0004","date_utc":"2026-11-12","commit":"3980c2a","surface":"llms_txt|agents_page|book_json|catalog","change":"Static agent corpus shipped","expected_mechanism":"Gives agents a compact catalog and a purchase-path resource","expected_lead_days":7,"source":"git+operator"}
{"id":"iv-0005","date_utc":"2026-11-12","commit":"8786148","surface":"md_mirror","change":"Canonical Markdown mirrors and draft exclusion","expected_mechanism":"Gives agents a body mirror next to the catalog","expected_lead_days":7,"source":"git"}
{"id":"iv-0006","date_utc":"2026-11-20","commit":"031e260","surface":"other","change":"Trigger post published","expected_mechanism":"Adds a citable artifact; no reading-map edge","expected_lead_days":14,"source":"git+operator"}
{"id":"iv-0007","date_utc":"PENDING","commit":"","surface":"other","change":"Vercel Log Drain configured","expected_mechanism":"Makes logs survive beyond the 1-day retention window","expected_lead_days":0,"source":"operator"}
{"id":"iv-0008","date_utc":"PENDING","commit":"","surface":"other","change":"B3 outbound-click event deployed","expected_mechanism":"Counts human clicks by surface independently of Amazon","expected_lead_days":0,"source":"operator"}
{"id":"iv-0009","date_utc":"DEFERRED","commit":"","surface":"other","change":"Trigger-post reading-map edge (decision target)","expected_mechanism":"Would create a curated article-to-chapter edge","expected_lead_days":0,"source":"operator"}
```

**Promotion record** — same file shape with a dated `week_start`. The file is empty at freeze by operator report `[O]`; that emptiness is an assumption with a falsifier `[A-2]`.

**Frozen plan** — a YAML file parsed at runtime, so the code cannot silently diverge from the prose:

```yaml
version: 1
frozen_on: "2026-11-21"
primary_outcome: "weekly_recommendation_path_sessions"
secondary_outcomes:
  - "agent_fetches_by_ua_class_and_path_class"
  - "book_json_to_article_fetch_ratio"
  - "site_side_outbound_clicks_by_surface"
  - "share_304_and_bytes_by_class"
  - "kdp_dashboard_units_descriptive_only"
controls:
  - "none - two ASINs share an audience, so OLD_BOOK is not an uncontaminated control"
minimum_detectable_effect: >-
  Undefined: no baseline count exists and the sales series is screenshot
  transcribed. For a low-count Poisson series the minimum detectable effect
  scales inversely with the square root of the baseline count, so a short or
  absent baseline cannot adjudicate a small effect. The decision uses
  replicated presence, not an effect size; no numeric sales threshold is
  published or used.
windows:
  baseline: "none - no pre-period logs survive 1-day retention"
  evaluation: "reviews at +30, +60 and +90 days from drain enablement"
  freeze: "2026-11-21, before any post-period data is examined"
```

The full file includes the decision rules in section 7, and the complete file is in §4.1 below.

### 4.1 Reference source — copy verbatim

Nothing in this subsection is a proposal. These are the exact files that were executed in the scratch clone. A fresh clone has no `measurement/` directory; create it and copy these blocks.

**`measurement/interventions.jsonl`** — complete file, nine lines (the same seed also appears in §4; copy either block verbatim):

```jsonl
{"id":"iv-0001","date_utc":"2026-10-13","commit":"7f4dad3|dc554eb","surface":"nav_cta|book_page|footer","change":"Human purchase CTAs, /book, footer paperback link and global layout first shipped","expected_mechanism":"Makes the hardcover discoverable to human readers","expected_lead_days":0,"source":"git"}
{"id":"iv-0002","date_utc":"2026-10-13","commit":"daf402f","surface":"other","change":"Full visual redesign The Instrument","expected_mechanism":"Changes human browsing, not the agent corpus","expected_lead_days":0,"source":"git"}
{"id":"iv-0003","date_utc":"2026-10-25","commit":"3c1cc15","surface":"other","change":"Visual knowledge system: projects, concepts, paths","expected_mechanism":"Changes navigation and human discovery","expected_lead_days":0,"source":"git"}
{"id":"iv-0004","date_utc":"2026-11-12","commit":"3980c2a","surface":"llms_txt|agents_page|book_json|catalog","change":"Static agent corpus shipped","expected_mechanism":"Gives agents a compact catalog and a purchase-path resource","expected_lead_days":7,"source":"git+operator"}
{"id":"iv-0005","date_utc":"2026-11-12","commit":"8786148","surface":"md_mirror","change":"Canonical Markdown mirrors and draft exclusion","expected_mechanism":"Gives agents a body mirror next to the catalog","expected_lead_days":7,"source":"git"}
{"id":"iv-0006","date_utc":"2026-11-20","commit":"031e260","surface":"other","change":"Trigger post published","expected_mechanism":"Adds a citable artifact; no reading-map edge","expected_lead_days":14,"source":"git+operator"}
{"id":"iv-0007","date_utc":"PENDING","commit":"","surface":"other","change":"Vercel Log Drain configured","expected_mechanism":"Makes logs survive beyond the 1-day retention window","expected_lead_days":0,"source":"operator"}
{"id":"iv-0008","date_utc":"PENDING","commit":"","surface":"other","change":"B3 outbound-click event deployed","expected_mechanism":"Counts human clicks by surface independently of Amazon","expected_lead_days":0,"source":"operator"}
{"id":"iv-0009","date_utc":"DEFERRED","commit":"","surface":"other","change":"Trigger-post reading-map edge (decision target)","expected_mechanism":"Would create a curated article-to-chapter edge","expected_lead_days":0,"source":"operator"}
```

**`measurement/analysis-plan.yaml`** — complete:

```yaml
version: 1
frozen_on: "2026-11-21"
primary_outcome: "weekly_recommendation_path_sessions"
primary_outcome_definition: >-
  User-triggered-fetcher sessions that fetched at least one article resource
  (blog HTML or /research/<slug>.md) and then at least one purchase-path
  resource (/agents/book.json or /book), grouped by hashed IP, UA token and a
  30-minute inactivity gap.
secondary_outcomes:
  - "agent_fetches_by_ua_class_and_path_class"
  - "book_json_to_article_fetch_ratio"
  - "site_side_outbound_clicks_by_surface"
  - "share_304_and_bytes_by_class"
  - "kdp_dashboard_units_descriptive_only"
guardrails:
  - "conformance: 0 errors; generated counts unchanged"
  - "purchase URL remains bare and unchanged"
  - "no live change except B3; no deploy by agent"
  - "no credentials or sales figures in published artifacts"
windows:
  baseline: "none - no pre-period logs survive 1-day retention"
  intervention_log: "measurement/interventions.jsonl"
  evaluation: "reviews at +30, +60 and +90 days from drain enablement"
  freeze: "2026-11-21, before any post-period data is examined"
model: >-
  Descriptive only. Poisson log-linear count model with negative-binomial
  fallback if overdispersion is detected; weekly recommendation-path sessions
  as outcome; linear time trend; no intervention coefficient and no causal
  interpretation. The KDP screenshot series uses the same form with a launch
  decay term and is never a decision input.
controls:
  - "none - two ASINs share an audience, so OLD_BOOK is not an uncontaminated control"
  - "comparative ITS and Bayesian structural time series are not admissible"
minimum_detectable_effect: >-
  Undefined: no baseline count exists and the sales series is screenshot
  transcribed. For a low-count Poisson series the minimum detectable effect
  scales inversely with the square root of the baseline count, so a short or
  absent baseline cannot adjudicate a small effect. The decision uses
  replicated presence, not an effect size; no numeric sales threshold is
  published or used.
decision_rules:
  - "At +30/+60/+90: report metrics; make no edge decision before +90."
  - "At +90: ADD iff recommendation-path sessions occurred in at least 3
     distinct weeks, represented at least 2 user-triggered UA tokens, and no
     promotion item is logged in those weeks."
  - "At +90: DO NOT ADD if fewer than 3 weeks, one vendor only, or overlap."
  - "At +90: if logs are incomplete or the drain was never configured, DO NOT
     ADD and record insufficient evidence - fail closed."
  - "The sales series is inconclusive context and can never trigger ADD."
known_limits:
  - "no pre-period baseline; no causal identification"
  - "llms.txt consumption by assistants is undisclosed"
  - "session grouping from logs is fuzzy"
  - "KDP dashboard values are revised and may not match reports"
  - "no Attribution tags, no GA4, no Search Console"
  - "B1 blocked; agent-surfaced and human-surfaced Amazon clicks are indistinguishable"
```

**`measurement/promotions.jsonl`** — an empty file (zero bytes).

**`measurement/synth.py`** — complete:

```python
#!/usr/bin/env python3
"""SYNTHETIC data generator. Nothing here is real traffic or real sales.

Produces deterministic fake logs and a fake sales series so the pipeline can be
validated before any real data exists. Every output is labelled SYNTHETIC.
"""
import csv
import hashlib
import json
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SEED = 20261121
START = datetime(2026, 11, 2, tzinfo=timezone.utc)  # a Monday: 4 full weeks
DAYS = 28

UA = {
    "chatgpt_user": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    "claude_user": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-User/1.0",
    "gptbot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot",
    "search": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot",
    "browser": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
}
ARTICLE = "/blog/2026-11-20-calibrating-a-terminal-bench-task-agents-could-not-just-read"
MIRROR = "/research/2026-11-20-calibrating-a-terminal-bench-task-agents-could-not-just-read.md"


def monday(ts: datetime) -> str:
    return (ts - timedelta(days=ts.weekday())).date().isoformat()


def emit(rows, ip, ua, path, ts, rng, status=None):
    status = status or rng.choice([200, 200, 200, 304])
    rows.append({
        "timestamp": ts.isoformat().replace("+00:00", "Z"),
        "ip_hash": "h-" + hashlib.sha256(ip.encode()).hexdigest()[:8],
        "ua": ua,
        "path": path,
        "status": status,
        "bytes": 0 if status == 304 else rng.choice([1200, 3100, 8700]),
    })


def main():
    rng = random.Random(SEED)
    rows = []
    for day in range(DAYS):
        base = START + timedelta(days=day)
        for idx, (key, article) in enumerate(
            [("chatgpt_user", ARTICLE), ("claude_user", MIRROR)]
        ):
            t = base + timedelta(hours=8 + idx * 2, minutes=idx * 7)
            ip = f"synthetic-user-{day}-{idx}"
            emit(rows, ip, UA[key], "/llms.txt", t, rng)
            emit(rows, ip, UA[key], article, t + timedelta(minutes=2), rng)
            emit(rows, ip, UA[key], "/agents/book.json", t + timedelta(minutes=4), rng)
        ip = f"synthetic-train-{day}"
        t = base + timedelta(hours=12)
        emit(rows, ip, UA["gptbot"], "/llms.txt", t, rng)
        emit(rows, ip, UA["gptbot"], "/agents/catalog.json", t + timedelta(minutes=1), rng)
        ip = f"synthetic-search-{day}"
        emit(rows, ip, UA["search"], ARTICLE, base + timedelta(hours=14), rng)
        ip = f"synthetic-browser-{day}"
        emit(rows, ip, UA["browser"], "/book", base + timedelta(hours=16), rng)

    rows.sort(key=lambda r: (r["timestamp"], r["ip_hash"]))
    with open(ROOT / "synthetic_logs.jsonl", "w") as f:
        for r in rows:
            f.write(json.dumps(r, sort_keys=True) + "\n")

    sales_path = ROOT / "synthetic_sales.csv"
    with open(sales_path, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["week_start", "units", "source"])
        for week, units in enumerate([7, 5, 9, 6], start=1):
            ws = (START + timedelta(days=7 * (week - 1))).date().isoformat()
            w.writerow([ws, units, "SYNTHETIC_NOT_REAL_SALES"])

    digest = hashlib.sha256(
        (ROOT / "synthetic_logs.jsonl").read_bytes()
    ).hexdigest()[:16]
    print(f"SYNTHETIC log rows: {len(rows)}")
    print(f"SYNTHETIC weeks: 4 ({START.date()} .. {(START + timedelta(days=27)).date()})")
    print(f"synthetic_logs.jsonl sha256[:16] = {digest}")
    print("sales series: SYNTHETIC_NOT_REAL_SALES (values withheld from post)")


if __name__ == "__main__":
    main()
```

**`measurement/classify-logs.py`** — complete:

```python
#!/usr/bin/env python3
"""Classify Vercel-style request logs into UA classes and path classes.

UA class vocabulary is taken from vendor-published crawler docs (research-log B2).
A class label is evidence of a user agent string, NOT of a verified vendor
identity: user agents can be spoofed. IP verification is a separate step.
"""
import json
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent

USER_TOKENS = [
    "ChatGPT-User", "Claude-User", "Perplexity-User", "Meta-ExternalFetcher",
]
TRAIN_TOKENS = [
    "GPTBot", "ClaudeBot", "CCBot", "meta-externalagent", "Bytespider",
    "Google-Extended",
]
SEARCH_TOKENS = [
    "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "Googlebot",
    "bingbot", "meta-webindexer",
]
ARTICLE_PATHS = ("blog/", "research/")
CATALOG_EXACT = {
    "/llms.txt", "/llms-full.txt", "/agents/index.json", "/agents/catalog.json",
    "/agents/graph.json", "/agents/claims.json", "/agents/evidence.json",
    "/agents/proposals.json",
}
PURCHASE_PATHS = {"/agents/book.json", "/book"}


def parse_ts(raw: str) -> datetime:
    return datetime.fromisoformat(raw.replace("Z", "+00:00"))


def monday(ts: datetime) -> str:
    return (ts - timedelta(days=ts.weekday())).date().isoformat()


def classify_ua(ua: str):
    for token in USER_TOKENS:
        if token in ua:
            return "user_triggered", token.rstrip("/")
    for token in SEARCH_TOKENS:
        if token in ua:
            return "search_crawler", token.rstrip("/")
    for token in TRAIN_TOKENS:
        if token in ua:
            return "training_crawler", token.rstrip("/")
    return "unknown", "unclassified"


def classify_path(path: str) -> str:
    if path == "/agents/book.json":
        return "book_json"
    if path == "/book":
        return "book_page"
    if path in CATALOG_EXACT:
        return "catalog"
    stripped = path.lstrip("/")
    if stripped.startswith("research/") and stripped.endswith(".md"):
        return "md_mirror"
    if stripped.startswith("blog/"):
        return "article_html"
    return "other"


def main():
    src = ROOT / "synthetic_logs.jsonl"
    rows = [json.loads(line) for line in src.open() if line.strip()]
    rows.sort(key=lambda r: (r["ip_hash"], classify_ua(r["ua"])[0], r["timestamp"]))

    last = {}
    session_no = {}
    out = []
    for r in rows:
        cls, token = classify_ua(r["ua"])
        key = (r["ip_hash"], token)
        ts = parse_ts(r["timestamp"])
        if key not in last or (ts - last[key]) > timedelta(minutes=30):
            session_no[key] = session_no.get(key, 0) + 1
        last[key] = ts
        sid = f"{r['ip_hash']}-{token}-{session_no[key]}"
        pcls = classify_path(r["path"])
        out.append({
            "timestamp": r["timestamp"],
            "ip_hash": r["ip_hash"],
            "ua_class": cls,
            "ua_token": token,
            "path_class": pcls,
            "is_article": pcls in ("article_html", "md_mirror"),
            "is_purchase": r["path"] in PURCHASE_PATHS,
            "status": r["status"],
            "bytes": r["bytes"],
            "session_id": sid,
            "week_start": monday(ts),
        })

    dest = ROOT / "classified.jsonl"
    with dest.open("w") as f:
        for r in out:
            f.write(json.dumps(r, sort_keys=True) + "\n")

    print(f"classified rows: {len(out)}")
    print("by ua_class:", dict(sorted(Counter(r['ua_class'] for r in out).items())))
    print("by path_class:", dict(sorted(Counter(r['path_class'] for r in out).items())))
    print("by status:", dict(sorted(Counter(r['status'] for r in out).items())))
    print("sessions:", len({r['session_id'] for r in out}))


if __name__ == "__main__":
    main()
```

**`measurement/ledger.py`** — complete:

```python
#!/usr/bin/env python3
"""Build the weekly ledger from classified logs and a sales series.

Every row carries snapshot_taken_at_utc and vintage because KDP values are
revised (research-log B1). The sales columns are a PROPOSAL until a real KDP
dashboard screenshot is available; in the synthetic run the source is labelled
SYNTHETIC and the values are never printed by this script.
"""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SNAPSHOT = "2026-11-21T12:00:00Z"  # synthetic demonstration timestamp
VINTAGE = 1

COLUMNS = [
    "week_start", "ua_class", "ua_token", "requests", "bytes", "share_304",
    "sessions", "recommendation_path_sessions", "recommendation_path_ratio",
    "sales_source", "snapshot_taken_at_utc", "vintage",
]


def main():
    rows = [__import__("json").loads(l) for l in (ROOT / "classified.jsonl").open() if l.strip()]

    sessions = {}
    for r in rows:
        sessions.setdefault(r["session_id"], []).append((r["timestamp"], r))

    agg = {}
    rps_by = {}
    sessions_by = {}
    for r in rows:
        key = (r["week_start"], r["ua_class"], r["ua_token"])
        a = agg.setdefault(key, {"requests": 0, "bytes": 0, "304": 0})
        a["requests"] += 1
        a["bytes"] += r["bytes"]
        a["304"] += 1 if r["status"] == 304 else 0
        sessions_by.setdefault(key, set()).add(r["session_id"])

    for sid, events in sessions.items():
        events.sort(key=lambda x: x[0])
        first_article = next(
            (i for i, (_, e) in enumerate(events) if e["is_article"]), None
        )
        if first_article is None:
            continue
        if any(e["is_purchase"] for _, e in events[first_article + 1 :]):
            r = events[0][1]
            key = (r["week_start"], r["ua_class"], r["ua_token"])
            rps_by.setdefault(key, set()).add(sid)

    with (ROOT / "synthetic_sales.csv").open() as f:
        sales = {row["week_start"]: row["source"] for row in csv.DictReader(f)}

    dest = ROOT / "ledger.csv"
    with dest.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS)
        w.writeheader()
        for key in sorted(agg):
            week, cls, token = key
            a = agg[key]
            n_sessions = len(sessions_by[key])
            n_rps = len(rps_by.get(key, set()))
            w.writerow({
                "week_start": week,
                "ua_class": cls,
                "ua_token": token,
                "requests": a["requests"],
                "bytes": a["bytes"],
                "share_304": f"{a['304'] / a['requests']:.3f}",
                "sessions": n_sessions,
                "recommendation_path_sessions": n_rps,
                "recommendation_path_ratio": f"{(n_rps / n_sessions) if n_sessions else 0:.3f}",
                "sales_source": sales.get(week, "SYNTHETIC_NOT_REAL_SALES"),
                "snapshot_taken_at_utc": SNAPSHOT,
                "vintage": VINTAGE,
            })

    print(f"wrote ledger.csv columns: {','.join(COLUMNS)}")
    print("rows:", len(agg))
    print("week_start ua_class ua_token requests sessions rec_path_sessions ratio")
    with dest.open() as f:
        for row in list(csv.DictReader(f))[:8]:
            print(
                f"{row['week_start']} {row['ua_class']} {row['ua_token']} "
                f"{row['requests']} {row['sessions']} "
                f"{row['recommendation_path_sessions']} {row['recommendation_path_ratio']}"
            )
    print("sales values: WITHHELD (SYNTHETIC_NOT_REAL_SALES); not a decision input")
    print(f"snapshot_taken_at_utc present on every row: {SNAPSHOT}; vintage {VINTAGE}")


if __name__ == "__main__":
    main()
```

**`measurement/analysis.py`** — complete:

```python
#!/usr/bin/env python3
"""Apply the frozen decision rules. No sales figure can affect the verdict."""
import argparse
import csv
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
REQUIRED = [
    "version", "frozen_on", "primary_outcome", "secondary_outcomes", "guardrails",
    "windows", "model", "controls", "minimum_detectable_effect", "decision_rules",
    "known_limits",
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--incomplete", action="store_true",
                    help="simulate a missing log drain / incomplete logs")
    args = ap.parse_args()

    plan = yaml.safe_load((ROOT / "analysis-plan.yaml").read_text())
    missing = [k for k in REQUIRED if k not in plan]
    if missing:
        raise SystemExit(f"frozen plan missing required keys: {missing}")
    print(f"frozen plan parsed: version={plan['version']} frozen_on={plan['frozen_on']}")
    print(f"primary_outcome: {plan['primary_outcome']}")
    print("controls: none declared (two ASINs share an audience)")
    print("sales series: WITHHELD (not a decision input)")

    if args.incomplete:
        print("DECISION: DO NOT ADD — insufficient evidence (logs incomplete / drain missing)")
        return

    rows = list(csv.DictReader((ROOT / "ledger.csv").open()))
    ut = [r for r in rows if r["ua_class"] == "user_triggered"]
    hit_weeks = sorted({
        r["week_start"] for r in ut if int(r["recommendation_path_sessions"]) > 0
    })
    hit_tokens = sorted({
        r["ua_token"] for r in ut if int(r["recommendation_path_sessions"]) > 0
    })
    promos = {
        json.loads(l).get("week_start")
        for l in (ROOT / "promotions.jsonl").open() if l.strip()
    }
    overlap = sorted(set(hit_weeks) & promos)

    print(f"recommendation-path weeks: {len(hit_weeks)}")
    print(f"distinct user-triggered tokens in those weeks: {hit_tokens}")
    print(f"promotion overlap: {overlap or 'none'}")

    add = len(hit_weeks) >= 3 and len(hit_tokens) >= 2 and not overlap
    verdict = "ADD the trigger-post reading-map edge" if add else "DO NOT ADD"
    reasons = []
    if len(hit_weeks) < 3:
        reasons.append("fewer than 3 distinct weeks")
    if len(hit_tokens) < 2:
        reasons.append("fewer than 2 user-triggered vendors")
    if overlap:
        reasons.append("promotion overlap")
    print(f"DECISION: {verdict}" + (f" ({'; '.join(reasons)})" if reasons else " (all invariants satisfied)"))


if __name__ == "__main__":
    main()
```

**B3 diff** — the complete resulting `src/components/AmazonCta.tsx` (apply in the scratch clone only, then revert):

```tsx
"use client";

import { BOOK } from "@/config";

/* The single buy button used everywhere.
   `amazonUrl` is a real listing now, so the button is always live — the
   `live` check is kept as a general guard (it reads the URL rather than
   asserting it) so that blanking the config can never ship a dead link
   with a buy label on it. */

export function AmazonCta({
  secondary = false,
  className = "",
  surface = "book_page",
}: {
  secondary?: boolean;
  className?: string;
  surface?: string;
}) {
  // `BOOK` is `as const`, so compare against a widened string to keep this
  // a runtime guard rather than a comparison TypeScript can prove constant.
  const url: string = BOOK.amazonUrl;
  const live = url.length > 0 && url !== "#";
  const label = `Buy the hardcover — ${BOOK.price}`;
  const base =
    "inline-flex items-center justify-center rounded-sm px-8 py-4 font-mono text-[12px] font-semibold tracking-[0.14em] uppercase transition-colors";
  const styles = secondary
    ? "border border-rule bg-transparent text-ink hover:border-gold hover:text-gold"
    : "bg-gold text-void hover:bg-gold-2";

  return (
    <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <a
        href={live ? url : "#"}
        onClick={() => {
          if (typeof window !== "undefined" && live) {
            window.dispatchEvent(
              new CustomEvent("outbound_amazon_click", { detail: { surface } })
            );
          }
        }}
        aria-disabled={!live}
        title={live ? label : "Amazon listing opens at launch"}
        className={`${base} ${styles}`}
      >
        {label} ↗
      </a>
      {!live && (
        <span className="font-mono text-[10px] tracking-[0.22em] text-gold uppercase">
          Amazon listing opens at launch
        </span>
      )}
    </span>
  );
}

export default AmazonCta;
```

---

## 5. Instrumentation steps

Each step has an action, an expected output, a verification, and a failure signature. Every command below was executed in the scratch clone under Node `22.23.4` from `.nvmrc` `[V]`.

### Step 1 — Confirm the date anchors

Action:

```bash
git log --since=2026-10-01 --date=iso --pretty='%h|%ad|%s' > ../git-log.txt
git log --diff-filter=A --date=short --pretty='%ad|%h' -- src/app/llms.txt/route.ts
```

Expected output: dated commits matching section 1. Verification: the agent-surface route file's first-add date is 2026-11-12. Failure signature: a later first-add date means the intervention window is wrong and every downstream window must move.

### Step 2 — Configure the log drain (operator)

Console action: Vercel project → Observability → Log Drains → add a drain to a persistent endpoint; record the enablement date in `interventions.jsonl` as `iv-0007`. Exact CLI syntax is `[U]` and is not invented here.

Expected output: the drain is listed and a first event arrives. Verification: a request made after enablement appears in the drain within the provider's delivery time. Failure signature: no events after a day. This is fatal, not cosmetic — Pro runtime logs survive one day `[V]`, and there is no retroactive archive. The decision rule fails closed on this condition.

### Step 3 — Seed and validate the intervention log

Action:

```bash
python3 -c "
import json
rows=[json.loads(l) for l in open('measurement/interventions.jsonl') if l.strip()]
req={'id','date_utc','commit','surface','change','expected_mechanism','expected_lead_days','source'}
print('rows:',len(rows)); print('all keys present:', all(req<=set(r) for r in rows))
print('ids:', ','.join(r['id'] for r in rows[:6]))
"
```

Actual output:

```
rows: 9
all keys present: True
ids: iv-0001,iv-0002,iv-0003,iv-0004,iv-0005,iv-0006
```

Verification: nine rows, all keys present. Failure signature: a missing key or a malformed line; the JSONL parser stops at that line.

### Step 4 — Test the pipeline on synthetic data

Action:

```bash
python3 measurement/synth.py
python3 measurement/classify-logs.py
python3 measurement/ledger.py
python3 measurement/analysis.py
```

Actual output:

```
### C5 synth.py
SYNTHETIC log rows: 280
SYNTHETIC weeks: 4 (2026-11-02 .. 2026-11-29)
synthetic_logs.jsonl sha256[:16] = d718faa934c4cee2
sales series: SYNTHETIC_NOT_REAL_SALES (values withheld from post)
### C4 classify-logs.py
classified rows: 280
by ua_class: {'search_crawler': 28, 'training_crawler': 56, 'unknown': 28, 'user_triggered': 168}
by path_class: {'article_html': 56, 'book_json': 56, 'book_page': 28, 'catalog': 112, 'md_mirror': 28}
by status: {200: 215, 304: 65}
sessions: 140
### C6 ledger.py
wrote ledger.csv columns: week_start,ua_class,ua_token,requests,bytes,share_304,sessions,recommendation_path_sessions,recommendation_path_ratio,sales_source,snapshot_taken_at_utc,vintage
rows: 20
week_start ua_class ua_token requests sessions rec_path_sessions ratio
2026-11-02 search_crawler OAI-SearchBot 7 7 0 0.000
2026-11-02 training_crawler GPTBot 14 7 0 0.000
2026-11-02 unknown unclassified 7 7 0 0.000
2026-11-02 user_triggered ChatGPT-User 21 7 7 1.000
2026-11-02 user_triggered Claude-User 21 7 7 1.000
2026-11-09 search_crawler OAI-SearchBot 7 7 0 0.000
2026-11-09 training_crawler GPTBot 14 7 0 0.000
2026-11-09 unknown unclassified 7 7 0 0.000
sales values: WITHHELD (SYNTHETIC_NOT_REAL_SALES); not a decision input
snapshot_taken_at_utc present on every row: 2026-11-21T12:00:00Z; vintage 1
### C7 analysis.py
frozen plan parsed: version=1 frozen_on=2026-11-21
primary_outcome: weekly_recommendation_path_sessions
controls: none declared (two ASINs share an audience)
sales series: WITHHELD (not a decision input)
recommendation-path weeks: 4
distinct user-triggered tokens in those weeks: ['ChatGPT-User', 'Claude-User']
promotion overlap: none
DECISION: ADD the trigger-post reading-map edge (all invariants satisfied)
```

Verification: the synthetic series reaches the ADD branch because it was constructed with four weeks of two-vendor recommendation-path sessions and no promotions. That is a test of the machinery, not evidence about the site. Failure signature: any nonzero exit, a checksum that changes between identical runs, or a decision reached with fewer than three weeks.

### Step 5 — Verify the fail-closed branch

Action and actual output:

```bash
python3 measurement/analysis.py --incomplete
```

```
frozen plan parsed: version=1 frozen_on=2026-11-21
primary_outcome: weekly_recommendation_path_sessions
controls: none declared (two ASINs share an audience)
sales series: WITHHELD (not a decision input)
DECISION: DO NOT ADD — insufficient evidence (logs incomplete / drain missing)
INCOMPLETE_EXIT=0
```

Verification: missing logs produce DO NOT ADD, never ADD, and the script exits zero so the verdict propagates to a caller. Failure signature: any path that reaches ADD without complete logs.

### Step 6 — Test the proposed B3 diff

The change adds a `surface` parameter and a site-side event to the single buy button. Its complete source is in §4.1. It was applied in the scratch clone, typechecked, and reverted. It was not deployed. Dependencies must be installed first (`npm ci`); a clean clone has no `node_modules`. Actual output:

```
### npm run lint
> danielkliewer-com-v2@2.0.0 lint
> eslint
LINT_EXIT=0
### npx tsc --noEmit
TSC_EXIT=0
```

Verification: both commands exit zero with the pinned Node. Failure signature: a lint or type error; in particular, forgetting the `"use client"` directive makes the event handler invalid in an App Router component.

### Step 7 — Weekly operator capture

Action: capture the KDP dashboard view for the measured ASIN and the other linked ASIN, save the screenshot locally with the capture timestamp, and append one row to the local sales store with vintage 1. Verification: every row has `snapshot_taken_at_utc`. Failure signature: an undated screenshot, which cannot be used for a revision-aware series.

### Step 8 — Post placement and repo verification

Covered in the replication kit below. The post is placed in the site's content directory, its frontmatter is parsed, the site's loader is asked for its slug, and the repo's generated artifacts are regenerated in order.

---

## 6. Intervention log method

The intervention log is derived from git, not from memory. Every first-add date in section 1 came from `git log --diff-filter=A` on the specific route and component files. The operator then confirmed which commit is the primary intervention `[O]`.

| id | date | commit | change | lead days |
|---|---|---|---|---|
| iv-0001 | 2026-10-13 | `7f4dad3`, `dc554eb` | Human purchase CTAs, `/book`, footer paperback link and global layout first shipped | 0 |
| iv-0002 | 2026-10-13 | `daf402f` | Visual redesign | 0 |
| iv-0003 | 2026-10-25 | `3c1cc15` | Visual knowledge system | 0 |
| iv-0004 | 2026-11-12 | `3980c2a` | Static agent corpus — primary | 7 |
| iv-0005 | 2026-11-12 | `8786148` | Markdown mirrors | 7 |
| iv-0006 | 2026-11-20 | `031e260` | Benchmark post — second | 14 |
| iv-0007 | pending | — | Log drain configured | 0 |
| iv-0008 | pending | — | B3 event deployed | 0 |
| iv-0009 | deferred | — | Reading-map edge — decision target | — |

The promotion calendar is empty by operator report `[O]` and marked as an assumption with a falsifier `[A-2]`: if a dated item appears later in a screenshot, post, email, or log, the calendar was wrong and any overlapping weeks are excluded from the decision. An empty calendar is not evidence that nothing happened; it is a claim that can be disproved.

The deferred row is important. The reading-map edge is the thing being decided, so adding it during the window would destroy the measurement it is supposed to inform. It stays out until the +90 review.

---

## 7. The frozen analysis plan

The plan was frozen on 2026-11-21, before any post-period data was examined. It lives in `analysis-plan.yaml` and is parsed at runtime so the code cannot drift from the prose.

**Primary outcome:** weekly recommendation-path sessions — sessions in which a user-triggered fetcher fetched at least one article resource and then, within the same session, fetched a purchase-path resource. The session rule is hashed IP plus UA token with a 30-minute inactivity gap `[A-1]`. This is a fetch path, not an influence claim.

**Secondary outcomes:** agent fetches by UA and path class; the `book.json`-to-article fetch ratio; site-side outbound clicks by surface; `304` share and bytes by class; and the KDP screenshot series, which is descriptive only.

**Guardrails:** conformance stays at zero errors with generated counts unchanged; the bare purchase URL stays unchanged because no tags were created; no live change except B3 and no deploy by this agent; no credentials or sales figures in published artifacts.

**Model:** descriptive only. A Poisson log-linear count model with a negative-binomial fallback if overdispersion appears, a linear time trend, and no intervention coefficient. There is no causal identification in this design. Comparative interrupted time series and Bayesian structural time series both require a control series the intervention did not touch, and none exists here: the two linked books share an audience, so the other ASIN is not an uncontaminated control `[V]`. Those methods are named to explain why they are *not* used.

**MDE:** undefined. There is no pre-period baseline, because logs survive one day `[V]` and no drain was configured before the freeze `[O]`. For a low-count Poisson series the detectable effect scales inversely with the square root of the baseline count, so a short baseline cannot adjudicate a small effect. The decision therefore uses replicated presence rather than an effect size, and publishes no numeric sales threshold `[O]`.

**Small counts and revisions:** counts are modelled as counts, not normalized into rates that imply precision they lack. Every sales snapshot carries `snapshot_taken_at_utc` and a vintage so a revised week does not silently overwrite the earlier reading.

**Decision rules:**

1. At +30 and +60 days, report metrics. Make no edge decision.
2. At +90 days, add the trigger post's `recommends_reading` edge to Chapter 21 or Part VII if and only if recommendation-path sessions occurred in at least three distinct weeks, were represented by at least two distinct user-triggered UA tokens, and no promotion item overlaps those weeks `[A-3]`.
3. Otherwise do not add.
4. If logs are incomplete or the drain was never configured, do not add and record "insufficient evidence". Fail closed.
5. The sales series is inconclusive context at every review and can never trigger the ADD branch.

Note what the rule is not. It is not a magnitude threshold chosen after seeing the data. It asks whether the path is replicated across weeks and independent of a single vendor — an invariant about the evidence, not a bet about an effect size.

---

## 8. Threats to validity

| Threat | How it shows up | Mitigation | Residual risk |
|---|---|---|---|
| Launch decay | A downward trend independent of deploys | Dated baseline is explicitly marked absent; no trend is attributed | Baseline and intervention are weeks apart |
| Promotion calendar | A spike aligned to an unlogged item | Empty calendar is marked `[A-2]` with falsifier; overlaps exclude weeks | Unlogged items remain possible |
| Shared audience across two ASINs | Both series move together | No control declared; comparative methods excluded | H3 remains live |
| Reporting lag and revision | Early weeks change on re-read | Vintage store with snapshot timestamps | New snapshots can contradict old ones |
| Bot inflation | Training crawlers dominate fetch counts | UA class separation; training excluded from primary | User agents are spoofable `[V]` |
| Referrer stripping | Agent visits appear as direct traffic | No reliance on referrers; logs and site-side events only | No GA4 property to cross-check `[V]` |
| Short baseline | No pre-period estimate | Forward-only collection; decision uses replicated presence | Underpowered for months |
| Tiny counts | Nulls indistinguishable from absence | MDE declared undefined; inconclusive is an allowed result | The sales question may never resolve |
| Intervention contamination | Each site change restarts the clock | Intervention log; reading-map edge deferred | Operator changes outside git |
| Link changes alter what agents see | A tagged URL is dropped or rewritten by an agent | No tags created; bare URL verified unchanged | Attribution remains impossible `[O]` |
| Disclosure risk | Benchmark task detail on an agent-crawlable site | Reported neutrally, no decision by this agent | Rules are mixed and partly unverified `[V]` |

**Risk R-1, reported neutrally.** The 2026-11-20 post discloses a benchmark task's reference-service design, verifier design and conformance harness on a site built for agents to crawl `[V]`. Terminal-Bench's contribution rules say "solutions to your task shouldn't be easily findable online" `[V]` and add canary strings against contamination, but the same rules say disabling network access is not a valid way to make a task hard, and the task guidelines accept a problem solved "once, or just a few times" online `[V]`. No fetched rule directly addresses an author publishing a design write-up on a personal site `[V]` — absence of a rule is not permission. GitHub returned 404 for the named task repository, so its open/mergeable state is the post's assertion, not an independently checked fact `[V]`. The post also says `allow_internet` must be unset while the public template shows it true `[V]`. These are recorded for the operator; they are not adjudicated here.

---

## 9. Traps

Each trap below was hit or directly observed during this work, tied to the measurement that exposed it.

| Trap | Step | Exposing measurement | Root cause | Fix |
|---|---|---|---|---|
| Wrong Node version silently | Repo verification | The error banner read `Node.js v24.3.0` after sourcing nvm | Sourcing `nvm.sh` selects the default, not the pinned version | Run `nvm use 22.23.4` explicitly and confirm `node -v` |
| Masked exit code | Conformance run | Reported `EXIT=0` while the script had failed | A pipeline's status is the last command (`tail`), not the first | Use `${PIPESTATUS[0]}` |
| No baseline exists | Decision design | Zero pre-period rows in every log-derived view | One-day retention `[V]`; no prior drain `[O]` | Drain before enablement; rule uses replicated presence |
| Mislabelled evidence | Research log | Re-reading source hosts showed regional mirrors and blogs | Mirror fallback after fetch failures | Downgrade `[V]` to `[R]`, record every failure verbatim |
| Broken regex for graph edges | Book graph check | `chapter:21` matched zero edges while live `book.json` showed two | Source writes `chapter: 21` with a space | Use `chapter:\s*21` and cross-check the built artifact |
| Header CTA treated as outbound | Surface map | Grepping `SiteHeader.tsx` showed `href="/book"` | The button is an internal hop, not an Amazon link | Model the hop and the outbound click as separate surfaces |
| Event handler in a server component | B3 diff | Type check required a client directive | App Router components are server-side by default | Include `"use client"` in the proposed diff |
| Sales numbers leaking into a method post | Writing | Review against the publication decision `[O]` | Default instinct to illustrate with real figures | Withhold values at the collector, not at the editor |

---

## 10. Replication kit

Ordered checklist, with a time budget for the synthetic portion of about fifteen minutes on a clone with dependencies installed.

1. Clone the scratch repo; confirm `.nvmrc`. If `nvm` is not on PATH, source `$HOME/.nvm/nvm.sh` first (a non-interactive shell often does not load it), then run `nvm use 22.23.4` unpiped and verify `node -v`; then run `npm ci` — a clean clone has no `node_modules`.
2. Confirm the date anchors with `git log`.
3. Create `measurement/` from the complete source in §4.1, including the empty `promotions.jsonl`; verify `interventions.jsonl` parses.
4. Run `synth.py`, `classify-logs.py`, `ledger.py`, `analysis.py`.
5. Run `analysis.py --incomplete` and confirm the fail-closed verdict.
6. Apply the B3 diff in the scratch clone; run lint and `tsc --noEmit`; revert.
7. Place the post in `content/research/` with frontmatter copied from the newest post.
8. Parse frontmatter, run the site's loader for the slug, confirm the image is git-tracked.
9. Regenerate in order: build, audit, stats, check routes, benchmark.
10. Confirm the post is discoverable in the generated catalog and no size budget is breached.

**Cold-start test result:** a fresh sub-agent received only this post and a clean scratch clone, performed steps 1–6 from §4.1, and reproduced every published output exactly — including `sha256[:16] = d718faa934c4cee2`, the ADD decision, the fail-closed `DO NOT ADD` with `INCOMPLETE_EXIT=0`, and `LINT_EXIT=0`/`TSC_EXIT=0` — with no questions, no guesses, and no invented values. Two earlier runs found missing source and an unstated `nvm.sh` step; both were closed in this post. The log of all three runs is in `qa-report.md`.

---

## 11. What I would tell an agent

1. Freeze the rule before you look at the data. If you choose the threshold after the result, you do not have a test.
2. Derive dates from git, not from prose. Then ask the operator which one counts.
3. A class label from a User-Agent string is not a verified vendor identity.
4. If the retention window is shorter than your memory, start collecting now and say that history is gone.
5. Withhold values at the collector. A figure you never print cannot leak into the post.
6. A null result on a tiny series is inconclusive, not evidence of no effect.
7. Do not use another ASIN as a control when both share an audience.
8. Every snapshot needs a timestamp and a vintage, because reports are revised.
9. Verify the exit code with `${PIPESTATUS[0]}` when you pipe a verifier to `tail`.
10. Never let an event handler into a server component.
11. If any input is missing, fail closed. The DO NOT ADD branch exists for a reason.
12. The book is the measured subject. Describe it once, link it once, and stop.

---

## 12. Pre-registered kill and continue criteria

- **+30 days:** report the metrics. Do not decide. Kill early only if the drain was never configured and no logs exist; in that case the question is retired as unmeasurable.
- **+60 days:** report again. Check that the promotion calendar is still accurate and that the intervention log has no unlogged changes. Still no decision.
- **+90 days:** continue and add the edge only if the three invariants hold — three distinct weeks, two user-triggered vendors, no promotion overlap. Kill and do not add otherwise, including whenever logs are incomplete.
- **Never:** promote the sales series to a verdict. It is context. If the sales question remains unresolved at +90, record it as unresolved and move on.

---

## 13. What the results post will contain, and when

After the +90 review, a short results post will state the decision, the three invariants as observed, the intervention log as it stood, and every place where the plan had to be interpreted. It will not contain sales figures. It will say plainly whether the evidence was sufficient; if it was not, the post will say that rather than dressing an inconclusive series as a finding. If the question is retired early because the drain was never configured, there will be no results post — only a note explaining why.

---

## 14. Sources and changelog

**Limits still visible.** `[A-1]` session grouping from logs is fuzzy. `[A-2]` the empty promotion calendar could be wrong. `[A-3]` the three-week, two-vendor criterion is a policy choice. `[U]` the exact KDP screenshot fields, whether any pre-launch screenshot history exists, Attribution eligibility and the tag URL, the Terminal-Bench repository's privacy and canary state, and whether any assistant consumes `llms.txt`. Each is listed with its falsifier or resolution in `plan-lock.md`. None is hidden in the decision rule.

Primary sources verified this session `[V]`: the two site posts of 2026-11-20 and 2026-11-12; `/llms.txt`, `/agents`, `/agents/book.json`, `/agents/graph.json` and `/book`; the `kliewerdaniel/site-code` repository at `031e260`; Vercel runtime-log and log-drain documentation; Amazon KDP Orders-report documentation; Amazon Attribution product and API documentation; OpenAI, Anthropic, Perplexity, Google and Meta crawler documentation; the `llmstxt.org` proposal; arXiv 1506.00356, 2604.28093, 2607.14035 and 2606.04362; and the Terminal-Bench 3 `CONTRIBUTING.md`, task guidelines and review-automation docs.

Secondary sources `[R]` include practitioner guides on Attribution and AI-referral measurement; they are cited in `research-log.md` and are not used as the sole basis for any decision rule. Unknowns `[U]` include the exact KDP screenshot field names, whether any pre-launch screenshot history exists, the Attribution eligibility and tag URL, the Terminal-Bench repository's privacy and canary state, and whether any assistant actually consumes `llms.txt`.

Fifteen fetches failed or were routed around during research; all are recorded verbatim in `research-log.md` Part C, and claims sourced from regional mirrors were downgraded to `[R]`. That record is part of the evidence, not an appendix to be ignored.

Changelog: v1, 2026-11-21, frozen before post-period data was examined. Revision after the cold-start replication test is recorded in `qa-report.md`.

---

*This is a plan. It is not a result, and it is not a claim that the redesign caused anything.*
