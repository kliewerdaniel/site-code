---
author: Daniel Kliewer
title: "The Sovereign Agent Stack — A Local-First, Compile-Time AI Agent Framework"
book_reference: true
canonical_url: /blog/sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework
date: 09-04-2026
description: "The Sovereign Agent Stack (SAS) is a local-first, compile-time AI agent framework that operationalizes the sovereignty thesis from The Rented Sovereign. A complete 7-layer architecture with 156 tests, 23 E2E tests, plugin system, MCP server, and package manager distribution."
image: /images/ComfyUI_00210_.png
layout: post
og:description: "The Sovereign Agent Stack (SAS) is a local-first, compile-time AI agent framework that operationalizes the sovereignty thesis from The Rented Sovereign."
og:image: /images/ComfyUI_00210_.png
og:title: "The Sovereign Agent Stack — A Local-First, Compile-Time AI Agent Framework"
og:type: article
og:url: /blog/sovereign-agent-stack-a-local-first-compile-time-ai-agent-framework
tags:
  - sovereign-agent-stack
  - local-first
  - compile-time-ai
  - sovereign-ai
  - agent-architecture
  - open-source
  - python
  - mcp
  - ai-agents
twitter:card: summary_large_image
twitter:description: "The Sovereign Agent Stack (SAS) is a local-first, compile-time AI agent framework that operationalizes the sovereignty thesis from The Rented Sovereign."
twitter:image: /images/ComfyUI_00210_.png
twitter:title: "The Sovereign Agent Stack — A Local-First, Compile-Time AI Agent Framework"
wiki_references: ["sovereign-agent-stack", "local-first", "compile-time-ai", "sovereign-ai"]
---

# The Sovereign Agent Stack

## A Local-First, Compile-Time AI Agent Framework

**[Sovereign Agent Stack on GitHub](https://github.com/kliewerdaniel/sovereign-agent-stack)** | [MIT License](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/LICENSE) | v1.0.0

---

This is the repo I should have built before I wrote *[The Rented Sovereign](/blog/the-rented-sovereign-agent-agency-stack)*. In that post, I dissected the $5K/month agency stack — Hermes Agent, Orgo, AgentMail, AgentPhone, Honcho, Composio, Stripe MPP — and argued that the model being free doesn't make the system sovereign; it just relocates the rent from the intelligence to the plumbing around it. I ended with a challenge: be deliberate about which layers of an agent's cognition get compiled into something you own versus rented at runtime.

Sovereign Agent Stack is my answer. It's an open-source, MIT-licensed Python framework that implements a 7-layer sovereignty model — and scores every layer you own versus rent.

---

## What It Is

Every agentic AI system decomposes into 8 independently swappable layers:

```
┌─────────────────────────────────────────────────┐
│  Model (Ollama local + API fallback)            │
├─────────────────────────────────────────────────┤
│  Harness (ARGO-based, self-hosted)              │
├─────────────────────────────────────────────────┤
│  Compute Substrate (Local Docker container)     │
├─────────────────────────────────────────────────┤
│  Identity (AgentMail/Phone adapters)            │
├─────────────────────────────────────────────────┤
│  Memory (Local RAG + session context)           │
├─────────────────────────────────────────────────┤
│  Knowledge (Compile-time graph)                 │
├─────────────────────────────────────────────────┤
│  Auth (Local MCP gateway + encrypted vault)     │
├─────────────────────────────────────────────────┤
│  Payments (Virtual card / MPP adapter)          │
└─────────────────────────────────────────────────┘
```

The sovereignty thesis is simple: **push layers from runtime (re-derived, hosted) to compile-time (settled, inspectable, owned).** Every layer gets scored. The default config — local Docker, local RAG, compile-time knowledge graph, local MCP gateway — scores 6/6 scorable = **Fully Sovereign**.

Two layers are unavoidably rented (identity and payments) and excluded from the denominator, just as I argued in [The Rented Sovereign](/blog/2026-09-04-the-rented-sovereign-agent-agency-stack): you cannot self-host MX records or the financial system itself.

---

## What's in v1.0.0

| Phase | Deliverable | Tests |
|-------|-------------|-------|
| **0** | Documentation-first architecture (README, ADRs, SOVEREIGNTY, LAYERS, ROADMAP) | — |
| **1** | Sovereignty dashboard + `sas.yaml` parser + scoring engine | 21 |
| **2** | Compile-time knowledge graph (markdown parser, graph materializer, query/diff/audit) | 18 |
| **3** | Local auth broker / MCP gateway (encrypted vault, tool registration, token refresh, audit trail) | 15 |
| **4** | Payments abstraction (virtual card + MPP adapter, spending limits, receipt handling) | 17 |
| **5** | Compute substrate (Docker container lifecycle, capture/click/type/execute, auto-destroy) | 12 |
| **6** | Identity adapters (AgentMail + AgentPhone + mock dev adapters) | 13 |
| **7a** | Integration tests (all 8 layers wired together) | 23 |
| **7b** | Example configurations (agency worker, personal assistant, industry analyst) | — |
| **7c** | Deployment guide + operations runbook | — |
| **7d** | Security audit document (threat model, vault analysis, hardening roadmap) | — |
| **7e** | Performance benchmarks (compile, query, auth, payments, scoring, substrate) | 14 |
| **7f** | Release v0.1.0 (version bump, tag, final verification) | — |
| **8a** | Plugin system — registry, entry points, loader + 11 tests | 11 |
| **8b** | Community layer registry + plugin development guide | — |
| **8c** | ARGO skill pack — MCP server with 3 tools (12 tests) | 12 |
| **8d** | Package manager distribution (Homebrew, apt, Chocolatey, Docker) | — |
| **8e** | Release v1.0.0 — version bump, final verification | — |

**156 unit tests + 23 E2E tests + 3 CLI smoke tests — all passing.**

---

## Quick Start

```bash
pip install sovereign-agent-stack
```

```bash
# Generate your sovereignty config
python -m sas init --output sas.yaml

# View your sovereignty score
python -m sas dashboard --config sas.yaml --cache .sas --verbose
```

```json
{
  "score": 1.0,
  "verdict": "Fully Sovereign",
  "owned": 6,
  "total": 6
}
```

---

## Architecture: The Sovereignty Scoring

Each layer is scored as owned, rented, or unavoidably rented. The verdict thresholds:

| Score | Verdict |
|-------|---------|
| ≥ 0.875 | Fully Sovereign |
| ≥ 0.625 | Sovereign (target) |
| ≥ 0.375 | Partially sovereign |
| < 0.375 | Rented |

Identity and payments are flagged `unavoidable_rental` and excluded from the denominator — not because they're unimportant, but because they're structurally impossible to self-host without rebuilding the internet's communication rails. This is the same concession I made in [The Rented Sovereign](/blog/the-rented-sovereign-agent-agency-stack), but it's a concession the framework refuses to let you forget.

You can override any layer's score manually:

```yaml
overrides:
  layer_5: owned    # e.g., self-hosting Honcho on your own Postgres
```

The dashboard detects drift between runs and reports score changes — because sovereignty isn't a state you achieve, it's a measurement you maintain.

---

## The Compile-Time Knowledge Layer

This is the piece I care most about, and it's the layer most likely to be undervalued by anyone reading this who hasn't yet been burned by a hosted memory service silently rewriting your agent's knowledge.

The knowledge graph is built from Obsidian-compatible markdown:

```markdown
# Sovereign Agent Stack

This is the intro to the [[Sovereign Agent Stack]] framework.

We use [[ARGO]] as our harness.
```

Compiled into a SQLite-backed graph store with wikilink extraction, YAML frontmatter, node deduplication, and transitive query. The critical distinction — one I argued in [The Model Is Not the Product](/blog/the-model-is-not-the-product) and returned to in [The Rented Sovereign](/blog/the-rented-sovereign-agent-agency-stack) — is:

**A fact compiled once into a stable, inspectable, versionable node is an asset. A fact re-derived at query time from a context window is a liability.**

The former is settled. Checked in. Diffable. Auditable by a human without an LLM in the loop at all. The latter re-derives the same conclusion every time, at token cost, with the possibility of drift between calls.

SAS compiles knowledge once. The graph is queryable by label, content, or relationship. It supports diff detection (what changed since last compile) and audit (orphaned nodes, stale nodes). This is the Obsidian layer from Vasillescu's stack, done intentionally rather than arrived at organically under client pressure.

---

## The Auth Broker

Composio's convenience without Composio's centralization. The local auth broker stores credentials in an encrypted SQLite vault, injects auth headers on tool calls, and maintains an audit trail of every request. Credentials are encrypted at rest (libsodium in production, XOR placeholder in tests) and decrypted only on retrieval.

```python
broker = LocalAuthBroker(vault_path='~/.sas/vault.db')
broker.register_tool('github', Credentials(
    tool_name='github', auth_type='oauth', token='ghp_...', scopes=['repo']
))
creds = broker.get_credentials('github')  # Decrypted on retrieval
```

The audit trail records every tool call — timestamp, method, path, credential used. For a security-conscious deployment, this is the layer I'd want a serious audit trail on before scaling past a handful of enterprise clients. MCP-based auth brokering is convenient precisely because it's centralized, and centralization is a liability the moment the broker has an incident.

---

## The Payments Abstraction

Two adapters behind a single `pay_for_resource()` interface:

- **Virtual Card Adapter** — current stopgap (2026). Per-transaction + daily limits, receipt tracking, method restriction.
- **MPP Adapter** — future architecture (2027+). Stablecoin, card, BNPL via HTTP 402 → authorize → retry.

The abstraction means swapping from "Ramp card + computer-use" to "Stripe MPP native" is a config change, not a rewrite. This is the layer I flagged in [The Rented Sovereign](/blog/the-rented-sovereign-agent-agency-stack) as the one most likely to be structurally different in twelve months. Build the abstraction now.

---

## The Plugin System

Community-built layer implementations with priority-based override:

```
LOCAL (>~/.sas/plugins/) > PIP (sas_layer_* entry points) > BUILTIN
```

A local plugin overrides a pip plugin overrides a builtin. The registry supports register, unregister, get, list, and auto-discovery. This is the extension point for the community layer registry — share your layer implementations via git, install via pip, or drop a `.py` file in `~/.sas/plugins/`.

---

## The MCP Server

Exposes SAS tools via MCP protocol for ARGO harness integration:

- `check_sovereignty` — score your current config
- `query_knowledge` — query the compile-time graph
- `pay_for_resource` — pay via the active adapter

The server reads from stdin, writes JSON to stdout. Wire it into any MCP-compatible harness.

---

## Package Manager Distribution

```bash
brew install sovereign-agent-stack      # Homebrew
apt install sovereign-agent-stack        # apt (Debian/Ubuntu)
choco install sovereign-agent-stack      # Chocolatey (Windows)
docker run kliewerdaniel/sas             # Docker
pip install sovereign-agent-stack        # pip
```

---

## Why This Exists

I wrote [The Rented Sovereign](/blog/the-rented-sovereign-agent-agency-stack) to diagnose a problem: the model being free doesn't make the system sovereign. I wrote [The Model Is Not the Product](/blog/the-model-is-not-the-product) to argue that intelligence is shifting out of the model and into the loop around it. Sovereign Agent Stack is the implementation of both theses in one repo.

It's not a criticism of anyone building with rented infrastructure — Vasillescu's stack is the correct move if your objective function is time-to-revenue. But it's a tool for anyone who wants to measure, deliberately, which layers they own and which they rent. And it's a starting point for pushing that line further down the stack.

The $5K/month number will compress as agent literacy spreads. What won't compress is the judgment about which parts of an agentic system get compiled into something you own and which parts you rent, and why.

---

## Documentation

- [Architecture](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/ARCHITECTURE.md) — 7-layer sovereignty model
- [ADR](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/ADR.md) — Architectural decision records
- [Sovereignty](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/SOVEREIGNTY.md) — The sovereignty thesis operationalized
- [Layers](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/LAYERS.md) — Detailed layer specifications
- [Roadmap](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/ROADMAP.md) — What's built and what's next
- [Deployment](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/DEPLOYMENT.md) — Production deployment guide
- [Runbook](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/RUNBOOK.md) — Operations and incident response
- [Security](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/SECURITY.md) — Security audit and hardening roadmap
- [Plugins](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/PLUGINS.md) — Plugin development guide
- [Layer Registry](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/LAYER_REGISTRY.md) — Community layer registry
- [ARGO Skill Pack](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/ARGO_SKILL_PACK.md) — ARGO harness integration
- [Packages](https://github.com/kliewerdaniel/sovereign-agent-stack/blob/main/docs/PACKAGES.md) — Package manager distribution

---

## Related Reading

- [The Rented Sovereign — What the $5K/Month Agent Agency Stack Actually Reveals](/blog/the-rented-sovereign-agent-agency-stack) — the diagnosis
- [The Model Is Not the Product](/blog/the-model-is-not-the-product) — the architectural thesis
- [Sovereign Agent Stack on GitHub](https://github.com/kliewerdaniel/sovereign-agent-stack) — the implementation

---

*156 tests passing. 7 layers. 1 framework. Fully Sovereign.*
