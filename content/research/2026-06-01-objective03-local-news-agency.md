---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-06-01-objective03-local-news-agency
date: 06-01-2026
description: An autonomous news ingestion, claim extraction, contradiction tracking,
  and TTS broadcast system that runs entirely locally. No API keys. No monthly bills.
  No vendor lock-in.
image: /images/open-source-ai-accessibility.png
layout: post
og:description: An autonomous news ingestion, claim extraction, contradiction tracking,
  and TTS broadcast system that runs entirely locally.
og:image: /images/open-source-ai-accessibility.png
og:title: 'objective03: My Laptop Eats the News and Talks Back'
og:type: article
og:url: /blog/2026-06-01-objective03-local-news-agency
tags:
- local AI
- news aggregation
- LLM
- contradiction detection
- TTS
- llama.cpp
- KuzuDB
- Qdrant
- Qwen3-TTS
- sovereign AI
title: 'objective03: My Laptop Eats the News and Talks Back'
twitter:card: summary_large_image
twitter:description: An autonomous news ingestion, claim extraction, contradiction
  tracking, and TTS broadcast system that runs entirely locally.
twitter:image: /images/open-source-ai-accessibility.png
twitter:title: 'objective03: My Laptop Eats the News and Talks Back'
wiki_references: ["ai-sovereignty", "data-sovereignty", "embeddings", "llama3", "local-first-ai", "local-inference", "python", "quantization", "sentence-transformers"]
---


<iframe src="https://www.youtube.com/embed/-qL7OtkNQ80" title="objective03 demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

<br>

[Free Apple Silicon Download](https://6340588028610.gumroad.com/l/qkxkt)

# objective03: A Locally-Run Autonomous News Ingestion and Contradiction Tracking System

## Architecture Overview: From RSS Feeds to Audio Broadcasts on Consumer Hardware

---

objective03 is a Python daemon that performs autonomous news ingestion, atomic claim extraction, entity resolution, event clustering, contradiction detection, narrative analysis, and text-to-speech broadcast — all running on local hardware via llama.cpp (Metal GPU backend), KuzuDB (embedded temporal property graph), Qdrant (vector similarity search), and Qwen3-TTS (mlx_audio). The system ingests content from RSS feeds, Reddit subreddits, and YouTube channels, extracts structured factual claims with GBNF-enforced JSON schemas, detects typed contradictions across sources, clusters claims into events and narrative threads, and generates TTS-optimized audio broadcasts with voice cloning and procedural ambient audio. Zero cloud dependencies. Zero API calls.

---

## Pipeline Architecture

The system operates as a five-group task scheduler running on independent intervals. Each group contains a sequence of subprocesses with configurable timeouts, failure limits, and circuit-breakers.

### Task Group 1: Ingestion (default interval: 60s)

The ingestion module polls three source types:

- **RSS feeds** — HTTP GET with `If-None-Match` / `ETag` support for conditional requests. Parsed via `feedparser`. Documents normalized (HTML stripped, Unicode NFKC normalized, whitespace collapsed).
- **Reddit subreddits** — OAuth2 authenticated API calls. Posts and comments extracted, metadata preserved (author, subreddit, upvotes, timestamps).
- **YouTube channels** — `yt-dlp` for metadata extraction and audio transcription. Channel upload schedules polled on configurable intervals.

All documents undergo SHA-256 deduplication before graph insertion. The normalized document is stored as a `Document` node in KuzuDB with a `FROM_SOURCE` edge pointing to the originating `Source` node.

### Task Group 2: Analysis Pipeline (default interval: 120s)

This is the core processing pipeline, executing sequentially:

#### 2a. Claim Extraction

Each document is chunked and passed to a local LLM (llama.cpp, Metal backend). The model extracts atomic factual claims using a GBNF-defined grammar that enforces a strict JSON schema:

```json
{
  "claim": "string",
  "confidence": "float (0.0-1.0)",
  "stance": "positive | negative | neutral",
  "topic": "string (tag)",
  "evidence": "string (verbatim text span)"
}
```

GBNF grammar enforcement ensures the model's output is structurally valid — no schema drift, no optional fields appearing as required. Each claim node in KuzuDB carries a `confidence` property and an `EXTRACTED_FROM` edge to its source document.

#### 2b. Entity Resolution

A second local LLM call extracts named entities (PERSON, ORG, LOC, EVENT) from each document. Extracted entities are resolved against existing graph nodes via:

1. **Exact match** on entity name
2. **Fuzzy matching** using Levenshtein distance with configurable threshold
3. **Alias tracking** — multiple names resolved to the same entity node over time

Resolved entities receive a `MENTIONS` edge to the source document and an `APPEARS_IN` edge to any event nodes they participate in.

#### 2c. Event Clustering

Claims are assigned to events based on entity overlap. The algorithm:

1. Extracts all entities from the new claim
2. Queries the graph for existing event nodes connected to any of those entities
3. If matches found, the claim's `ABOUT_EVENT` edge points to the existing event
4. If no matches, a new `Event` node is created with `emerging` status

Events track:
- `importance_score` — computed from entity frequency, claim count, and temporal recency
- `status` — `emerging` -> `active` -> `resolved`
- `temporal_start` / `temporal_end` — bounded by earliest and latest claim timestamps

#### 2d. Contradiction Detection

New claims are embedded using BGE-Small-EN-v1.5 (384-dimensional) and indexed in Qdrant. For each new claim:

1. **Vector search** — cosine similarity query against the Qdrant collection. Candidates with similarity > 0.75 are returned.
2. **LLM classification** — each candidate pair is passed to the local LLM with a prompt template that classifies the relationship into one of five typed categories:

| Type | Definition | Example |
|------|-----------|---------|
| `DIRECT_CONTRADICTION` | Same proposition, opposite truth value | "GDP grew 3%" vs "GDP shrank 3%" |
| `NUMERICAL_DISCREPANCY` | Same proposition, different values | "100 casualties" vs "200 casualties" |
| `FRAMING_DIFFERENCE` | Same event, different narrative lens | "Tax relief" vs "Tax cut for corporations" |
| `TEMPORAL_DISCREPANCY` | Same event, different timing | "Signed Monday" vs "Signed Tuesday" |
| `COMPATIBLE` | No contradiction; semantic overlap warrants review | — |

Contradictions are persisted as `CONTRADICTS` edges between claim nodes with a `type` property. Contradictions are **never auto-resolved** — the system preserves the raw disagreement for downstream consumption.

#### 2e. Narrative Analysis

Claims not assigned to events (i.e., no entity overlap with existing event nodes) are grouped into narrative threads via embedding cosine similarity clustering (>0.75 threshold). Each cluster receives an LLM-generated label. Active narratives track:
- `drift_score` — semantic shift over time within the narrative
- `framing_classification` — dominant narrative frame (e.g., "economic," "political," "social")

#### 2f. Source Reliability Scoring

Each `Source` node accumulates a reliability score based on historical claim accuracy — measured by the frequency of that source's claims being contradicted by other sources. Sources that consistently produce contradictory claims see their reliability scores degrade over time.

#### 2g. Graph Update

All extracted nodes and edges are committed to KuzuDB in a single transaction per batch.

### Task Group 3: Broadcast Generation (default interval: 90s)

A local LLM queries the KuzuDB graph via Cypher-like queries for:
- Top N events by `importance_score`
- Unresolved contradictions (all `CONTRADICTS` edges with no resolution)
- Active narratives (narratives with `status == "active"`)
- System metrics (sources ingested, claims extracted, contradictions detected)

The LLM produces an 800–1200 word broadcast script optimized for TTS. The script uses `<think>` blocks for internal reasoning before the spoken output. The prompt template includes structural directives: opening summary, top events, contradiction deep-dives, narrative shifts, and closing metrics.

### Task Group 4: Audio Production (default interval: 90s)

The broadcast script undergoes preprocessing:
1. **Chunking** — split into ~100-word segments
2. **Abbreviation expansion** — "U.S." -> "United States", "Dr." -> "Doctor"
3. **Number normalization** — "3.5%" -> "three and a half percent", "$500M" -> "five hundred million dollars"
4. **Date formatting** — "Jan 15, 2026" -> "January fifteenth, twenty twenty-six"
5. **Punctuation normalization** — ellipses, em-dashes, and other TTS-sensitive characters

Preprocessed segments are synthesized via Qwen3-TTS using mlx_audio. Voice cloning is supported via reference audio input. Synthesized audio segments are crossfaded at boundaries and queued for playback via `afplay` on macOS.

### Task Group 5: Maintenance (default interval: 24h)

- **Memory consolidation** — low-importance events and old narratives pruned based on `importance_score` thresholds
- **Graph evaluation** — sample of claims re-verified against source documents for accuracy metrics
- **Embedding index rebuild** — Qdrant index refreshed with all current claim embeddings

---

## Storage Architecture

| Tier | Technology | Content |
|------|-----------|---------|
| **Graph** | KuzuDB (embedded) | 8 node types: Source, Document, Claim, Entity, Event, Narrative, Broadcast, ContradictionSummary. 10 edge types: FROM_SOURCE, EXTRACTED_FROM, MENTIONS, ABOUT_EVENT, CONTRADICTS, SUPPORTS, PART_OF_THREAD, APPEARS_IN, REFERENCES, PREVIOUS_VERSION |
| **Vector** | Qdrant | BGE-Small-EN-v1.5 claim embeddings (384-dim), cosine similarity search with 0.75 threshold |
| **Audio** | Local filesystem | Generated TTS WAV segments, crossfaded master tracks, procedural ambient drone |
| **Config** | YAML/JSON | Scheduler intervals, model paths, source lists, embedding thresholds |
| **State** | Local JSON | Scheduler state, circuit-breaker status, last-run timestamps |

KuzuDB serves as the single source of truth. The temporal graph preserves full provenance: every claim points to its source document, every contradiction points to both claims, every event points to its contributing claims. Queries traverse edges to reconstruct the full evidence chain.

---

## Node and Edge Schema

### Node Types

| Node | Key Properties |
|------|---------------|
| `Source` | name, url, type (rss|reddit|youtube), reliability_score |
| `Document` | sha256, title, url, ingest_timestamp, source_type |
| `Claim` | text, confidence, stance, topic, evidence_text, extraction_timestamp |
| `Entity` | name, type (person|org|loc|event), alias_list |
| `Event` | label, importance_score, status, temporal_start, temporal_end |
| `Narrative` | label, drift_score, framing_classification, status |
| `Broadcast` | script_path, duration, timestamp, event_count, contradiction_count |
| `ContradictionSummary` | type, claim_a_id, claim_b_id, resolution, resolution_timestamp |

### Edge Types

| Edge | From | To | Properties |
|------|------|-----|-----------|
| `FROM_SOURCE` | Source | Document | ingest_timestamp |
| `EXTRACTED_FROM` | Claim | Document | extraction_timestamp |
| `MENTIONS` | Entity | Document | context |
| `ABOUT_EVENT` | Claim | Event | temporal_timestamp |
| `CONTRADICTS` | Claim | Claim | type, detected_timestamp |
| `SUPPORTS` | Claim | Claim | type, detected_timestamp |
| `PART_OF_THREAD` | Claim | Narrative | confidence |
| `APPEARS_IN` | Entity | Event | role |
| `REFERENCES` | Event | Event | relation_type |
| `PREVIOUS_VERSION` | Claim | Claim | version_number |

---

## Inference Stack

| Component | Technology | Details |
|-----------|-----------|---------|
| **LLM Inference** | llama.cpp | Metal GPU backend (Apple Silicon). Quantized GGUF models. GBNF grammar enforcement for structured output. |
| **Embeddings** | BGE-Small-EN-v1.5 | 384-dimensional text embeddings. Indexed in Qdrant for cosine similarity search. Threshold: 0.75. |
| **TTS** | Qwen3-TTS via mlx_audio | Voice cloning from reference audio. Multi-lingual. Synthesized in ~100-word segments. |
| **Video Download** | yt-dlp | YouTube metadata and transcript extraction. |
| **RSS Parsing** | feedparser | RFC 4287 compliant RSS/Atom parsing with ETag support. |

---

## Scheduler Configuration

```yaml
scheduler:
  ingestion:
    interval_seconds: 60
    max_runtime_seconds: 300
    failure_limit: 5
    circuit_breaker_timeout: 600

  analysis_pipeline:
    interval_seconds: 120
    max_runtime_seconds: 600
    failure_limit: 3
    circuit_breaker_timeout: 1800
    steps:
      - claim_extraction
      - entity_resolution
      - event_clustering
      - contradiction_detection
      - narrative_analysis
      - framing_analysis
      - source_reliability
      - graph_update

  broadcast:
    interval_seconds: 90
    max_runtime_seconds: 120
    failure_limit: 5
    circuit_breaker_timeout: 600

  audio_production:
    interval_seconds: 90
    max_runtime_seconds: 300
    failure_limit: 5
    circuit_breaker_timeout: 600

  maintenance:
    interval_seconds: 86400
    max_runtime_seconds: 3600
    failure_limit: 2
    circuit_breaker_timeout: 7200
```

---

## Why This Stack

The current AI industry narrative centers on a "compute shortage" — a claimed physical limitation of GPU availability. objective03 demonstrates that this is primarily a **billing bottleneck**: paid AI providers extract wealth through API costs, inflating operational expenses while quantized models on consumer hardware deliver comparable performance for inference-heavy workloads.

BGE-Small-EN-v1.5 for embeddings runs on CPU in under 10ms per document. llama.cpp with Metal GPU quantizes 7B-parameter models to run at interactive speeds on Apple Silicon. Qwen3-TTS synthesizes speech at 2x real-time on an M-series chip. Qdrant runs embedded with minimal memory footprint. KuzuDB is embedded with zero external dependencies.

The total infrastructure cost: model download size (a few GB) plus disk space for the graph and audio. No monthly bills. No API rate limits. No vendor lock-in.

---

## The Repo

objective03 is MIT licensed, requires Python 3.11+, and is structured as:

- `backend/` — Python daemon, ingestion modules, analysis pipeline, scheduler
- `electron/` — Electron desktop wrapper with system tray integration
- `docs/` — Configuration examples, Cypher query patterns, schema diagrams
- Root — `requirements.txt`, `scheduler_config.yaml`, `.env.template`, startup scripts

Built by Daniel Kliewer (kliewerdaniel). Follows the local-first philosophy established in "mastering llama.cpp local LLM integration": a weak local model controlled by the user is superior to a powerful cloud model controlled by a vendor.

---

## Why "objective03"?

"objective" — the system ingests raw data, extracts claims, detects contradictions, and presents findings without preference. Objectivity as a system property, not a guarantee.

"03" — version three. Also: the third wave of local AI. Wave 1 was CPU inference (slow, universal). Wave 2 was GPU inference (fast, desktop-bound). Wave 3 is Metal/MLX inference on consumer SoCs (fast, portable, power-efficient).

---

## Roadmap

- [ ] Source reliability scoring (per-source accuracy tracking and degradation curves)
- [ ] Cross-platform audio output (ALSA/PulseAudio for Linux, WASAPI for Windows)
- [ ] Multi-model pipeline routing (different models for extraction vs. contradiction classification vs. broadcast generation)
- [ ] Web dashboard for graph inspection (networkX visualization, Cypher query console)
- [ ] Incremental graph updates via temporal snapshots
- [ ] Claim verification against external fact-checking APIs (optional, cloud-fallback)

---

**Get it at:** [github.com/kliewerdaniel/objective](https://github.com/kliewerdaniel/objective)

[Free Apple Silicon Download](https://6340588028610.gumroad.com/l/qkxkt)

*The compute shortage is a billing shortage. Your laptop already has the silicon.*
