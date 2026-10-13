---
book_reference: true
canonical_url: /blog/2026-07-09-telemetry-intelligence-engine
date: 07-10-2026
description: 'A spec-driven walkthrough of the Telemetry Intelligence Engine (TIE): a local-first GraphRAG system that turns GA4 telemetry and site content into a behavioral knowledge graph an operator can query in natural language.'
image: /images/1021018.png
layout: post
og:description: 'How to architect a local-first analytics reasoning system that fuses a behavioral knowledge graph, vector retrieval, and local LLM inference into a queryable analyst for your own website.'
og:image: /images/1021018.png
og:title: 'The Telemetry Intelligence Engine: A Local-First GraphRAG System for Website Analytics'
og:type: article
og:url: /blog/2026-07-10-telemetry-intelligence-engine
tags:
- 'graphrag'
- 'local-first-ai'
- 'knowledge-graphs'
- 'analytics'
- 'sovereign-ai'
title: 'The Telemetry Intelligence Engine: A Local-First GraphRAG System for Website Analytics'
twitter:card: summary_large_image
twitter:description: 'Turning GA4 exports into a behavioral knowledge graph queried by a local LLM analyst — architecture, schema, and an MVP build plan.'
twitter:image: /images/1021018.png
twitter:title: 'The Telemetry Intelligence Engine: A Local-First GraphRAG System for Website Analytics'
wiki_references: []
---

Every analytics dashboard I have ever used answers the same narrow question well: *what happened*. Pageviews, sessions, bounce rate, referral source. What none of them answer is *why it matters* — which pieces of content are actually building toward something, which pathways are quietly leaking high-value visitors, and what I should write next to close the gap between what people are looking for and what I've actually published.

That gap is a reasoning problem, not a reporting problem. And reasoning problems are exactly what local LLMs plus a knowledge graph are good at, provided you're willing to build the plumbing yourself instead of waiting for a SaaS dashboard to grow a brain.

This post is the specification and MVP plan for the **Telemetry Intelligence Engine (TIE)** — a local-first GraphRAG system that treats website analytics as a behavioral knowledge graph rather than a spreadsheet, enriches it with local inference, and lets an operator ask it questions in plain language. It's a direct extension of the Dynamic Persona MoE RAG architecture I've written about previously, retargeted at analytics intelligence instead of general knowledge retrieval.

If you've been following the sovereign AI thread on this site, the pattern will be familiar: the information architecture — the graph, the audit trail, the relationships between entities — is the actual product. The model is just the reasoning engine you point at it.

## The core idea

Standard analytics tools store *events*. TIE stores *relationships between events, content, and outcomes*, and lets an LLM walk that graph to answer questions no dashboard was designed to answer:

- "What topics are attracting the highest-value visitors?"
- "What content pathways lead people toward my projects?"
- "What concepts are underrepresented compared to visitor interest?"
- "What should I write next based on observed knowledge gaps?"
- "Why are visitors leaving after reading certain pages?"

These aren't aggregation queries. They require connecting a visitor's session, to the content they touched, to the topics that content covers, to the conversion events (or lack thereof) that followed — and then reasoning over that structure. That's a graph traversal problem wrapped in a retrieval-augmented generation problem, which is precisely the combination GraphRAG architectures are built for.

## Architecture overview

At a high level, the system has four moving parts: a telemetry processor that normalizes raw GA4 exports, a behavioral graph that encodes relationships, a vector store that encodes semantic similarity, and a local RAG analyst that reasons over both.

```
                GA4 Export
                    |
                    v
           Raw Telemetry JSON
                    |
                    v
           Telemetry Processor
               /            \
              v              v
    Behavioral Graph    Vector Database
    (NetworkX / Neo4j)     (ChromaDB)
              \              /
               v            v
            Local RAG Analyst
           (Ollama / llama.cpp)
                    |
                    v
         Insights + Recommendations
```

The split between graph and vector store matters. The graph captures *explicit structural relationships* — this article discusses this topic, this session viewed this page, this page leads to this conversion event. The vector store captures *semantic similarity* — which graph summaries and content chunks are conceptually close to a given question, even when no explicit edge connects them. Query time uses both: semantic retrieval narrows the search space, then graph traversal pulls in the connected neighborhood the LLM actually reasons over.

## Data sources

### Analytics data

The initial data source is a GA4 export, normalized into a consistent event schema:

```json
{
  "timestamp": "",
  "event_name": "",
  "page_path": "",
  "session_id": "",
  "user_country": "",
  "device_category": "",
  "traffic_source": "",
  "referrer": "",
  "engagement_time": "",
  "scroll_depth": "",
  "events": []
}
```

This is deliberately the minimum viable schema. Search Console data, GitHub traffic analytics, newsletter open/click metrics, social referral data, server logs, and error telemetry are all planned as future ingestion sources, but the MVP doesn't need them to prove the architecture out. Get one clean pipe of data flowing before adding more.

### Content knowledge layer

The site's existing content — blog posts, project pages, essays — becomes graph entities in their own right, not just URLs that telemetry events point at:

```
/content
    |
    +-- blog/
    +-- projects/
    +-- essays/
```

Each document is parsed into a structured entity:

```json
{
  "id": "dynamic_persona_rag",
  "type": "article",
  "title": "Dynamic Persona MoE RAG",
  "topics": ["RAG", "agents", "knowledge graphs"],
  "entities": ["Ollama", "ChromaDB", "LLMs"]
}
```

This is the piece most analytics tools skip entirely — they know a URL got 1,200 views, but they have no model of what that URL is actually *about*, or how it relates conceptually to everything else you've published. Without this layer, "what should I write next" isn't answerable at all.

## Knowledge graph schema

The schema is organized into three node families, which keeps the graph legible as it grows instead of collapsing into an undifferentiated blob of "things."

**Content nodes:** `Article`, `Project`, `Page`, `Repository`, `Topic`, `Keyword`, `Technology`

**User behavior nodes:** `Visitor Segment`, `Session`, `Traffic Source`, `Device Type`, `Conversion Event`

**Analytical nodes:** `Hypothesis`, `Recommendation`, `Opportunity`, `Knowledge Gap`, `Trend`

That third category is the important one and the one most graph-based analytics prototypes leave out. Most systems model content and behavior; few model *the analysis itself* as first-class graph entities. Making hypotheses and recommendations nodes — rather than throwaway text in a report — means the system can later reason about which hypotheses it already tested, which recommendations it already made, and whether outcomes changed after implementation. That's what makes the self-improving loop in Phase 5 possible at all.

### Relationships

The edges are what turn a pile of nodes into something queryable:

```
Visitor --viewed--> Article
Article --discusses--> Topic
Topic --related_to--> Project
Article --leads_to--> Conversion
```

And behavior paths chain these into traversable sequences:

```
Google Search
      |
      v
Ollama Article
      |
      v
Dynamic Persona RAG
      |
      v
GitHub Click
```

A path like this is exactly the kind of thing a traditional funnel report *approximates* with drop-off percentages, but a graph traversal states explicitly: this session entered through this search query, read this article, followed an internal link to this project page, and then clicked out to the repository. Once paths like this are graph-native, you can ask the LLM to generalize across hundreds of them and surface the pattern rather than eyeballing a funnel chart.

## LLM enrichment pipeline

Raw telemetry is not semantic. "1,200 views, 240 seconds average time on page" doesn't mean anything on its own — it needs an interpretive layer between the raw numbers and the graph. That's the job of the enrichment pipeline, run locally, in three stages.

**Stage 1 — Event summarization.** Convert raw aggregates into a plain-language characterization:

```json
// input
{"page": "/projects/rag", "views": 1200, "time": 240}

// output
{"meaning": "High-interest technical content attracting AI engineering audience"}
```

**Stage 2 — Entity extraction.** Pull structured topics, audience, and intent out of content and behavior:

```
Topics:
- AI Agents
- Retrieval Systems
- Local Inference
Audience:
- Developers
- Researchers
Intent:
- Technical exploration
```

**Stage 3 — Relationship discovery.** Propose new graph edges with a stated rationale, rather than silently inserting them:

```
Dynamic Persona RAG
  related_to
Knowledge Graphs
  because: Both discuss structured information retrieval
```

That "because" clause is worth keeping even in the MVP. Auto-discovered relationships are only trustworthy if you can audit why the model proposed them, and treating human approval as optional (rather than absent) keeps a review checkpoint available without making it mandatory for every low-stakes edge.

## Vector database layer

ChromaDB is the right starting point — embedded, zero-ops, good enough for a single-operator dataset — with a clear migration path to Qdrant if the corpus outgrows it. Four collections cover the retrieval surface:

- `analytics_events` — embedded event summaries from Stage 1
- `content_embeddings` — embedded article/project content
- `graph_summaries` — embedded natural-language descriptions of graph neighborhoods
- `recommendations` — embedded past recommendations, for de-duplication and outcome tracking

Note that `graph_summaries` is doing something specific: it's not embedding raw content, it's embedding *natural-language renderings of graph structure* ("the visitor journey from local AI article to RAG project"), so that semantic search can retrieve structurally relevant neighborhoods even when the query doesn't share vocabulary with the underlying nodes.

## The RAG query flow

When the operator asks a question, retrieval and reasoning happen in sequence, not in parallel:

```
Question
   |
   v
Semantic Retrieval  (vector search across the four collections)
   |
   v
Relevant Graph Neighborhood  (expand from retrieved nodes via graph edges)
   |
   v
LLM Reasoning  (local model reasons over the assembled context)
   |
   v
Answer
```

The semantic retrieval step is doing coarse filtering — find the handful of nodes and summaries plausibly relevant to the question — and the graph expansion step is doing precision — pull in everything structurally connected to those anchor nodes so the model isn't reasoning from disconnected fragments. This two-stage retrieval is the same pattern behind most production GraphRAG systems, and it's worth keeping distinct rather than collapsing into a single vector search, because pure similarity search will miss structurally important but semantically dissimilar neighbors (a conversion event rarely shares vocabulary with the article that led to it).

## Analytical personas

If you've already built a persona-routing layer for a general RAG system, this reuses it directly — just with narrower, analytics-specific mandates instead of general-purpose ones.

**SEO Analyst** — focuses on impressions, rankings, search intent, and missing content. Output example: *"Create article: Running Local AI on Apple Silicon."*

**Product Analyst** — focuses on conversions, funnels, and user intent. Output example: *"Add stronger CTA after technical articles."*

**Research Analyst** — focuses on conceptual relationships between topics. Output example: *"Knowledge gap: AI agents ↔ knowledge graphs."*

**UX Analyst** — focuses on user journeys and friction. Output example: *"Mobile visitors abandon project pages. Investigate animation performance."*

Splitting these into distinct personas rather than one general-purpose analyst matters for the same reason it matters in any MoE-style routing setup: each persona has a narrow, well-defined lens, which keeps its outputs consistent and makes the recommendation engine's downstream categorization trivial — the persona that generated a recommendation already tells you what kind of action it implies.

## The recommendation engine

Recommendations aren't generated directly from raw data. They pass through three explicit layers, each stored as its own graph entity:

**Observations** — facts pulled straight from the graph and telemetry:

```
Dynamic Persona RAG:
400 visitors
8 minute average reading time
```

**Hypotheses** — reasoned conclusions drawn from observations:

```
Technical architecture content attracts highly engaged visitors.
```

**Actions** — concrete recommendations derived from hypotheses:

```
Create navigation path:
RAG Article → Project Demo → GitHub
```

Keeping these three layers separate — rather than jumping straight from raw numbers to a recommendation — is what makes the system auditable. If a recommendation turns out to be wrong, you can trace it back to the hypothesis that produced it, and from there to the observation that produced the hypothesis, instead of treating the LLM's output as an opaque verdict.

## Automated reports

Weekly, the system generates a structured report:

```
Telemetry Intelligence Report
1. New Trends
2. Visitor Behavior Changes
3. Content Opportunities
4. Technical Problems
5. Recommended Experiments
```

stored under `/reports`, e.g. `2026-07-09-analysis.md`. The detail worth calling out: these reports are written back into the corpus and become RAG documents themselves. Over time, the system isn't just analyzing telemetry against static content — it's analyzing telemetry against its own accumulated history of analysis, which is what makes the self-improving loop in Phase 5 possible instead of aspirational.

## Technology stack

**Already in place:**
- Frontend: Next.js, TypeScript, Tailwind
- Backend: Python, FastAPI
- AI: Ollama, llama.cpp, Qwen models
- Storage: SQLite, ChromaDB, NetworkX

**Planned:**
- Graph database: Neo4j (once NetworkX's in-memory model stops scaling)
- Observability: OpenTelemetry
- Analytics: PostHog (as a richer telemetry source than GA4 alone)

Starting with NetworkX instead of Neo4j is the right call for an MVP — no server to run, no schema migrations, and a graph small enough (a single site's worth of content and sessions) to fit comfortably in memory. The migration path exists precisely because it's a migration path, not a requirement to solve on day one.

## MVP build plan

**Phase 1 — Telemetry ingestion.** Export GA4 data, normalize it to the JSON schema above, store it locally, and define the initial schema. This phase has one job: get data flowing end to end before anything gets clever.

**Phase 2 — Graph construction.** Create nodes and relationships from the normalized data, and produce a visualized output (`website_behavior_graph.html`) so you can eyeball whether the graph structure actually matches your mental model of the site before trusting an LLM to reason over it.

**Phase 3 — RAG layer.** Embed graph summaries, stand up the ChromaDB collections, and wire in the local model for retrieval.

**Phase 4 — Analyst agent.** Build the `TelemetryAgent` with three capabilities: query analytics, explain trends, and generate recommendations. This is the first point where the system is actually answerable-to in natural language.

**Phase 5 — Self-improving loop.** Close the loop:

```
Recommendation
      |
      v
Implement change
      |
      v
Measure outcome
      |
      v
Update confidence
```

This is the phase that turns TIE from a smart reporting tool into something closer to a research collaborator — it doesn't just recommend a change, it tracks whether the change worked and adjusts how much weight to give similar future hypotheses.

## What success looks like

The bar isn't "can it summarize my traffic." Standard dashboards already do that well enough. The bar is whether the system can produce something like this, unprompted, from the graph structure alone:

> "Visitors interested in local AI are not finding my business offerings. They are reading technical posts but never reaching the services page. Create a bridge article connecting these concepts."

That's a claim about a missing edge in the behavioral graph — a content gap identified not by keyword volume, but by the shape of the paths visitors actually take (or fail to take) through the site. A standard analytics dashboard can tell you the services page has low traffic. It cannot tell you *why*, or what to write to fix it. That's the difference between reporting on the past and reasoning about the system well enough to change its future.

---

I go deeper into the underlying architecture — the persona routing, the memory layers, and the broader case for treating your own information architecture as sovereign infrastructure rather than a rented dashboard — in *Sovereign AI: Building Local-First Intelligent Systems*, available [on Amazon](https://www.amazon.com/dp/B0H6RB7D9J). If you're building something similar, I'd like to hear about it.