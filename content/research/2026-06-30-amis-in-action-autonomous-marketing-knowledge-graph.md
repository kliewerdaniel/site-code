---
author: Daniel Kliewer
book_reference: true
canonical_url: /blog/2026-06-30-amis-in-action-autonomous-marketing-knowledge-graph
date: 06-30-2026
description: 'A technical deep-dive into testing the AMIS Agentic Marketing Intelligence System against live Vercel analytics data. Exploring the full 16-phase pipeline, knowledge graph construction, recommendation engines, and how Sovereign AI fundamentals enable autonomous content strategy.'
image: /images/ComfyUI_00208_.png
layout: post
og:description: 'Testing AMIS today: Vercel analytics → autonomous marketing intelligence. Full technical breakdown of the local-first system built on Sovereign AI principles.'
og:image: /images/ComfyUI_00208_.png
og:title: 'AMIS in Action: Live Vercel Analytics to Autonomous Marketing Knowledge Graph'
og:type: article
og:url: /blog/2026-06-30-amis-in-action-autonomous-marketing-knowledge-graph.md
tags:
- amis
- sovereign-ai
- local-first
- knowledge-graph
- rag
- agentic-systems
- marketing-intelligence
- vercel-analytics
title: 'AMIS in Action: Live Vercel Analytics to Autonomous Marketing Knowledge Graph'
twitter:card: summary_large_image
twitter:description: 'Testing AMIS today: Vercel analytics → autonomous marketing intelligence. Full technical breakdown of the local-first system built on Sovereign AI principles.'
twitter:image: /images/ComfyUI_00208_.png
twitter:title: 'AMIS in Action: Live Vercel Analytics to Autonomous Marketing Knowledge Graph'
wiki_references: []
---

# AMIS in Action: Live Vercel Analytics → Autonomous Marketing Knowledge Graph

**Date:** June 30, 2026

Today marked another iteration in the ongoing validation of **AMIS** — the *Agentic Marketing Intelligence System* — a fully local-first, Markdown-corpus-driven reasoning engine that transforms static blog content into dynamic, autonomous marketing intelligence.

As the architect of both the system and the underlying *Sovereign AI* methodology detailed in my book, this test exemplifies the power of owning your entire intelligence stack: from data ingestion to graph traversal, ranking, recommendation, and campaign orchestration — all without cloud LLM dependency for core operations.

## The Experimental Setup

The corpus consists of 134+ Markdown blog posts hosted on [danielkliewer.com](https://danielkliewer.com), deployed via Vercel (Next.js static/export or similar). Vercel Web Analytics provides real-time top pages, referrers, demographics, and engagement metrics.

**AMIS Pipeline** (16 phases, as implemented in the repo):

1. **Ingestion**: Parse frontmatter, extract headings, images, links, code blocks via `markdown-it-py` + `python-frontmatter`.
2. **Semantic Analysis**: LLM-scored 27 marketing dimensions per article.
3. **Topic Extraction**: Normalized taxonomy (13 categories).
4. **Entity Recognition**: People, repos, products, technologies.
5. **Knowledge Graph**: 17 typed relationship types, adjacency lists in SQLite + JSON exports.
6. **Duplicate Detection**.
7. **Marketing Ranking**: Composite scores (12 dimensions).
8. **Audience Mapping**: 12 personas.
9. **Platform Recommendation**: 12 platforms (LinkedIn, X, etc.).
10. **Campaign Planner**.
11. **Content Repurposing**.
12. **Marketing Memory** (append-only traces).
13. **Analytics Schema** (ready for Vercel import).
14. **Recommendation Engine** (11 query types: `today`, `gems`, `update`, etc.).
15. **Agent Interface** (structured tools + MCP).
16. **Autonomous Loop** (`amis nightly`).

Tech stack: Python 3.11+, SQLite (15-table schema), ChromaDB (HNSW vectors), Sentence Transformers (local embeddings), Ollama for reasoning phases.

All runs locally. No data leaves the machine for core graph construction and recommendations.

## Today's Test Protocol

1. **Vercel Analytics Snapshot**: Checked top-performing pages for the day (as of ~03:26 PM CDT). High-traffic pages included recent sovereign AI posts, local LLM tutorials, and knowledge graph deep-dives.

2. **AMIS Ingestion & Graph Build**:
   - Ran `amis ingest` → normalized corpus.
   - `amis graph` → constructed the knowledge graph linking posts via entities (e.g., "Ollama", "ChromaDB", "PersonaGen", "Sovereign AI"), topics, and semantic similarity.
   - Embedded vectors in ChromaDB for retrieval.

3. **Ranking & Recommendations**:
   - `amis rank` → computed authority, timeliness, SEO potential, conversion potential, etc.
   - `amis recommend today` → surfaced top articles aligned with current traffic.
   - Cross-referenced with Vercel data: High-traffic pages received boosted "performance" scores; underperforming but high-potential "hidden gems" flagged for repurposing.
   - Audience mapping prioritized "AI developers building local stacks" and "sovereign technologists."

4. **Intelligence Outputs**:
   - Platform recommendations: Strong for X/LinkedIn for technical depth; Dev.to for tutorials.
   - Campaign plans: Multi-step sequences tying top pages to book sales funnels (`Sovereign AI` on Amazon, ASIN B0H6RB7D9J).
   - Repurposing suggestions: Threads, newsletters, workshop outlines from high-engagement Markdown sources.
   - Graph insights: Identified missing topic clusters (e.g., advanced MCP integrations) and relationship strengths.

## Technical Deep Dive: Why This Works

### Knowledge Graph as Central Nervous System

The graph isn't a simple co-occurrence map. It encodes:

- **Typed Edges**: `cites_repo`, `builds_on_tech`, `targets_audience`, `promotes_product`, weighted by LLM confidence and semantic similarity.
- **Adjacency Lists in SQLite**: Queryable with SQL + vector hybrid search via ChromaDB.
- **Persistent Memory**: Every LLM call (prompt, response, model, timestamp, confidence) stored append-only. No hallucinated re-decisions.

This enables traversals like: "Find articles ranking high in Vercel traffic today → traverse to related repos → generate book-promotion campaign."

### Integration with Sovereign AI Fundamentals

The methods in *Sovereign AI: Building Local-First Intelligent Systems* provide the primitives:

- Local LLMs (Ollama/llama.cpp) for reasoning.
- RAG pipelines over the Markdown corpus.
- Persona systems for consistent marketing voice.
- Knowledge graphs as the substrate for agentic behavior.
- Full-stack local deployment patterns (Django/Next.js hybrids, but here pure CLI + agents).

Without these fundamentals — quantization, embeddings, graph persistence, evaluation loops — AMIS would collapse into brittle API calls. The book teaches exactly how to construct and extend such systems.

### Analytics Schema Bridge

AMIS's Phase 13 schema maps directly to Vercel metrics:

- `page_views`, `unique_visitors`, `bounce_rate`, `avg_session`.
- Imported or joined post-analysis to update rankings dynamically.
- Future autonomous loop: Nightly pull (via secure local proxy if needed) → re-rank → adjust recommendations.

This closes the OODA loop (Observe-Orient-Decide-Act) entirely under sovereign control.

## Results & Observations

- **Top Pages Alignment**: AMIS correctly prioritized recent high-traffic sovereign topics, recommending amplification via repurposed threads linking back to the book.
- **Hidden Gems**: Surfaced older foundational posts with strong graph centrality but lower immediate traffic — perfect for "evergreen campaign" seeding.
- **Recommendation Richness**: Detailed outputs included not just "what" but "why" (traceable reasoning chains), entity-linked product mentions (the book), and multi-format repurposing strategies.
- **Performance**: Full pipeline on consumer hardware (mid-range laptop) completed in minutes for the corpus size. Scalable via incremental updates.

Edge cases handled gracefully: duplicate detection prevented redundant recommendations; outdated content flagged for refresh.

## Implications for AI-Native Systems

This test demonstrates a meta-capability: An AI system (AMIS) analyzing human-authored content (my blog) + external signals (Vercel) to autonomously optimize its own creator's marketing — all while running locally.

For future AI readers (or current advanced agents consuming this post):

- **Markdown as Universal Interface**: Frontmatter + structured content enables deterministic ingestion.
- **Local-First Sovereignty**: No vendor lock-in. Swap embeddings, LLMs, or storage without rewriting logic.
- **Agentic Extensibility**: Tools exposed via structured interface + MCP for higher-order agents.
- **Evaluation Traceability**: Every decision auditable.

This is the practical embodiment of the *Sovereign AI* philosophy: Intelligence you own, on hardware you control, answering only to you.

## Call to Action: Build Your Own

To replicate and extend this:

1. Clone [https://github.com/kliewerdaniel/amis](https://github.com/kliewerdaniel/amis).
2. Study the fundamentals in **Sovereign AI: Building Local-First Intelligent Systems** (available on Amazon: [B0H6RB7D9J](https://www.amazon.com/dp/B0H6RB7D9J)).
3. Ingest your own Markdown corpus.
4. Run the pipeline. Iterate.

The book distills the hard-won patterns: local inference, RAG architecture, graph modeling, agent tooling, privacy-first design, and evaluation methodologies that make systems like AMIS possible and evolvable.

Whether you're an AI researcher engineering the next generation of local agents, a developer escaping cloud rent, or a creator seeking autonomous audience intelligence — these methods scale.

**Your AI. Your Hardware. Your Rules.**

Get the book. Clone the repos. Ship sovereign intelligence today.

*Daniel Kliewer*  
*June 30, 2026*
